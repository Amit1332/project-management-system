const Comment = require("../models/comments.models");
const Task = require("../models/tasks.model");
const Project = require("../models/projects.models");
const ProjectMember = require("../models/projectMembers.model");
const User = require("../models/users.model");
const { createLog } = require("./activityLog.service");
const { createNotification } = require("./notification.service");
const { emitToTask, emitToProject } = require("../socket");

const verifyTask = async ({ organizationId, projectId, taskId }) => {
  const query = {
    _id: taskId,
    organizationId,
    archived: { $ne: true },
  };
  if (projectId) query.projectId = projectId;

  const task = await Task.findOne(query);

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
    projectId,
    taskId,
  });

  const activeProjectId = projectId || task.projectId;

  const comment = await Comment.create({
    organizationId,
    projectId: activeProjectId,
    taskId,
    userId,
    content,
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate("userId", "_id name email avatar")
    .lean();

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
      action: "USER_ADDED_COMMENT",
      entityType: "COMMENT",
      entityId: comment._id,
      metadata: { contentSummary: content.substring(0, 100) },
    });
  } catch (err) {
    console.error("Error creating activity log for comment:", err);
  }

  // Check for @mentions in comment text
  try {
    const mentions = content.match(/@([a-zA-Z0-9._-]+)/g);
    if (mentions && mentions.length > 0) {
      for (const mention of mentions) {
        const username = mention.replace("@", "").toLowerCase();
        const mentionedUser = await User.findOne({
          $or: [
            { name: new RegExp(`^${username}$`, "i") },
            { email: new RegExp(`^${username}`, "i") },
          ],
        });
        if (mentionedUser && mentionedUser._id.toString() !== userId.toString()) {
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

    // Notify task assignee if not the author
    if (task.assigneeId && task.assigneeId.toString() !== userId.toString()) {
      await createNotification({
        organizationId,
        recipientId: task.assigneeId,
        actorId: userId,
        type: "COMMENT_ADDED",
        title: "New comment on your task",
        message: `New comment added to task "${task.title}"`,
        projectId: activeProjectId,
        taskId,
        commentId: comment._id,
      });
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

  return Comment.find(query)
    .populate("userId", "_id name email avatar")
    .sort({
      createdAt: 1,
      _id: 1,
    })
    .lean();
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
