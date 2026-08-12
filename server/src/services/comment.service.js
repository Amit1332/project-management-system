const Comment = require("../models/comments.models");
const Task = require("../models/tasks.model");
const Project = require("../models/projects.models");
const ProjectMember = require("../models/projectMembers.model");
const User = require("../models/users.model");
const { createLog } = require("./activityLog.service");
const { createNotification } = require("./notification.service");
const { emitToTask, emitToProject } = require("../socket");

const verifyTask = async ({ organizationId, taskId }) => {
  const task = await Task.findOne({
    _id: taskId,
    organizationId,
    archived: { $ne: true },
  });

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  return task;
};

const createComment = async ({
  organizationId,
  projectId,
  taskId,
  userId,
  content,
}) => {
  const task = await verifyTask({
    organizationId,
    taskId,
  });

  const activeProjectId = projectId || task.projectId;

  const comment = await Comment.create({
    organizationId,
    projectId: activeProjectId,
    taskId,
    authorId: userId,
    userId,
    content,
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate("authorId", "_id name email avatar")
    .populate("userId", "_id name email avatar")
    .lean();

  if (populatedComment) {
    populatedComment.userId = populatedComment.userId || populatedComment.authorId;
  }

  // Socket emissions for real-time comments
  emitToTask(taskId, "comment:created", populatedComment);
  if (activeProjectId) {
    emitToProject(activeProjectId, "comment:created", populatedComment);
  }

  // Create Activity Log
  try {
    await createLog({
      organizationId,
      projectId: activeProjectId,
      taskId,
      userId,
      action: "COMMENT_ADDED",
      entityType: "COMMENT",
      entityId: comment._id,
      metadata: { contentSummary: content.substring(0, 100), title: task.title },
    });
  } catch (err) {
    console.error("Error creating activity log for comment:", err);
  }

  // Check for notifications and @mentions
  try {
    const notifiedUserIds = new Set();
    const currentUserIdStr = userId.toString();

    // Add commenter to notifiedUserIds so commenter NEVER receives self-notification
    notifiedUserIds.add(currentUserIdStr);

    // 2. Mentions
    const mentionTokens = content.match(/@[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|@[a-zA-Z0-9._-]+/g);
    if (mentionTokens && mentionTokens.length > 0) {
      const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      for (const mention of mentionTokens) {
        const rawTerm = mention.replace(/^@/, "").trim();
        if (!rawTerm) continue;

        const safeTerm = escapeRegex(rawTerm);
        const mentionedUser = await User.findOne({
          $or: [
            { email: rawTerm.toLowerCase() },
            { name: new RegExp(`^${safeTerm}$`, "i") },
            { email: new RegExp(`^${safeTerm}`, "i") },
          ],
        });

        if (mentionedUser) {
          const mId = mentionedUser._id.toString();
          if (!notifiedUserIds.has(mId)) {
            notifiedUserIds.add(mId);
            await createNotification({
              organizationId,
              recipientId: mentionedUser._id,
              actorId: userId,
              type: "USER_MENTIONED",
              title: "You were mentioned in a comment",
              message: `User mentioned you in a comment on task "${task.title}"`,
              projectId: activeProjectId,
              taskId,
              commentId: comment._id,
            });
          }
        }
      }
    }

    // 3. Task Assignee & Creator
    const assigneeIdStr = task.assigneeId?._id
      ? task.assigneeId._id.toString()
      : task.assigneeId
      ? task.assigneeId.toString()
      : null;

    const creatorIdStr = task.createdBy?._id
      ? task.createdBy._id.toString()
      : task.createdBy
      ? task.createdBy.toString()
      : null;

    if (assigneeIdStr && !notifiedUserIds.has(assigneeIdStr)) {
      notifiedUserIds.add(assigneeIdStr);
      await createNotification({
        organizationId,
        recipientId: assigneeIdStr,
        actorId: userId,
        type: "COMMENT_ADDED",
        title: "New comment on your task",
        message: `New comment added to task "${task.title}"`,
        projectId: activeProjectId,
        taskId,
        commentId: comment._id,
      });
    }

    if (creatorIdStr && !notifiedUserIds.has(creatorIdStr)) {
      notifiedUserIds.add(creatorIdStr);
      await createNotification({
        organizationId,
        recipientId: creatorIdStr,
        actorId: userId,
        type: "COMMENT_ADDED",
        title: "New comment on a task you created",
        message: `New comment added to task "${task.title}"`,
        projectId: activeProjectId,
        taskId,
        commentId: comment._id,
      });
    }

    // 4. All other Project Members
    if (activeProjectId) {
      const projectMembers = await ProjectMember.find({ projectId: activeProjectId }).select("userId");
      for (const pMember of projectMembers) {
        const pmIdStr = pMember.userId.toString();
        if (!notifiedUserIds.has(pmIdStr)) {
          notifiedUserIds.add(pmIdStr);
          await createNotification({
            organizationId,
            recipientId: pMember.userId,
            actorId: userId,
            type: "COMMENT_ADDED",
            title: "New comment on project task",
            message: `New comment added to task "${task.title}"`,
            projectId: activeProjectId,
            taskId,
            commentId: comment._id,
          });
        }
      }
    }
  } catch (err) {
    console.error("Error processing notifications for comment:", err);
  }

  return populatedComment;
};

const getComments = async ({ organizationId, projectId, taskId }) => {
  await verifyTask({
    organizationId,
    projectId,
    taskId,
  });

  const query = {
    organizationId,
    taskId,
  };
  if (projectId) query.projectId = projectId;

  // Sort by createdAt: -1 to show the latest comment at the top
  const comments = await Comment.find(query)
    .populate("authorId", "_id name email avatar")
    .populate("userId", "_id name email avatar")
    .sort({
      createdAt: -1,
      _id: -1,
    })
    .lean();

  return comments.map((c) => ({
    ...c,
    userId: c.userId || c.authorId,
  }));
};

const updateComment = async ({
  organizationId,
  projectId,
  taskId,
  commentId,
  userId,
  content,
}) => {
  await verifyTask({
    organizationId,
    projectId,
    taskId,
  });

  const comment = await Comment.findOne({
    _id: commentId,
    organizationId,
    projectId,
    taskId,
    userId,
  });

  if (!comment) {
    const error = new Error("Comment not found or you are not the owner");
    error.statusCode = 404;
    throw error;
  }

  comment.content = content;
  comment.isEdited = true;

  await comment.save();

  return Comment.findById(comment._id)
    .populate("userId", "_id name email avatar")
    .lean();
};

const deleteComment = async ({
  organizationId,
  projectId,
  taskId,
  commentId,
  userId,
}) => {
  await verifyTask({
    organizationId,
    projectId,
    taskId,
  });

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    organizationId,
    projectId,
    taskId,
    userId,
  });

  if (!comment) {
    const error = new Error("Comment not found or you are not the owner");
    error.statusCode = 404;
    throw error;
  }

  return {
    message: "Comment deleted successfully",
  };
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
