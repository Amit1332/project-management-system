const Task = require("../models/tasks.model");
const Project = require("../models/projects.models");
const ProjectMember = require("../models/projectMembers.model");
const User = require("../models/users.model");
const { createLog } = require("./activityLog.service");
const { createNotification } = require("./notification.service");
const { emitToProject, emitToTask } = require("../socket");

const verifyProject = async ({ organizationId, projectId }) => {
  if (!projectId) return null;
  const project = await Project.findOne({
    _id: projectId,
    organizationId,
    status: {
      $ne: "ARCHIVED",
    },
  });

  if (!project) {
    const error = new Error("Project not found or archived");
    error.statusCode = 404;
    throw error;
  }

  return project;
};

const verifyProjectMember = async ({ organizationId, projectId, userId }) => {
  if (!projectId) return null;
  const membership = await ProjectMember.findOne({
    organizationId,
    projectId,
    userId,
  });

  if (!membership) {
    const error = new Error("User is not a member of this project");
    error.statusCode = 400;
    throw error;
  }

  return membership;
};

const createTask = async ({
  organizationId,
  projectId,
  userId,
  title,
  description,
  status,
  priority,
  assigneeId,
  dueDate,
  labels,
}) => {
  await verifyProject({
    organizationId,
    projectId,
  });

  if (assigneeId && projectId) {
    await verifyProjectMember({
      organizationId,
      projectId,
      userId: assigneeId,
    });
  }

  const task = await Task.create({
    organizationId,
    projectId,
    title,
    description,
    status,
    priority,
    assigneeId: assigneeId || null,
    createdBy: userId,
    dueDate,
    labels,
  });

  const createdTask = await Task.findById(task._id)
    .populate("assigneeId", "_id name email avatar")
    .populate("createdBy", "_id name email")
    .lean();

  if (projectId) {
    emitToProject(projectId, "task:created", createdTask);
  }

  // Create Activity Log & Notifications
  try {
    await createLog({
      organizationId,
      projectId,
      taskId: task._id,
      userId,
      action: "USER_CREATED_TASK",
      entityType: "TASK",
      entityId: task._id,
      metadata: { title },
    });

    if (assigneeId && assigneeId.toString() !== userId.toString()) {
      await createNotification({
        organizationId,
        recipientId: assigneeId,
        actorId: userId,
        type: "TASK_ASSIGNED",
        title: "New task assigned to you",
        message: `You were assigned task "${title}"`,
        projectId,
        taskId: task._id,
      });
    }
  } catch (err) {
    console.error("Error creating activity log / notification for task creation:", err);
  }

  return createdTask;
};

const getTasks = async ({
  organizationId,
  projectId,
  page = 1,
  limit = 20,
  status,
  priority,
  assigneeId,
  search,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  if (projectId) {
    await verifyProject({
      organizationId,
      projectId,
    });
  }

  const filter = {
    organizationId,
    archived: { $ne: true },
  };

  if (projectId) {
    filter.projectId = projectId;
  }

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (assigneeId) {
    filter.assigneeId = assigneeId;
  }

  if (search) {
    filter.$text = {
      $search: search,
    };
  }

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "dueDate",
    "priority",
    "title",
  ];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const safeSortOrder = sortOrder === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate("assigneeId", "_id name email avatar")
      .populate("createdBy", "_id name email")
      .sort({
        [safeSortBy]: safeSortOrder,
        _id: safeSortOrder,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    Task.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const getTask = async ({ organizationId, projectId, taskId }) => {
  const query = {
    _id: taskId,
    organizationId,
    archived: { $ne: true },
  };
  if (projectId) query.projectId = projectId;

  const task = await Task.findOne(query)
    .populate("assigneeId", "_id name email avatar")
    .populate("createdBy", "_id name email")
    .lean();

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  return task;
};

const updateTask = async ({
  organizationId,
  projectId,
  taskId,
  ...updates
}) => {
  if (projectId) {
    await verifyProject({
      organizationId,
      projectId,
    });
  }

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

  if (updates.assigneeId !== undefined && updates.assigneeId !== null && (projectId || task.projectId)) {
    await verifyProjectMember({
      organizationId,
      projectId: projectId || task.projectId,
      userId: updates.assigneeId,
    });
  }

  Object.assign(task, updates);

  await task.save();

  return Task.findById(task._id)
    .populate("assigneeId", "_id name email avatar")
    .populate("createdBy", "_id name email")
    .lean();
};

const archiveTask = async ({ organizationId, projectId, taskId }) => {
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

  task.archived = true;

  await task.save();

  return task;
};

const updateTaskStatus = async ({
  organizationId,
  projectId,
  taskId,
  status,
  userId,
}) => {
  const query = {
    _id: taskId,
    organizationId,
    archived: { $ne: true },
  };
  if (projectId) query.projectId = projectId;

  const task = await Task.findOneAndUpdate(
    query,
    {
      $set: {
        status,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("assigneeId", "_id name email avatar")
    .populate("createdBy", "_id name email")
    .lean();

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  const activeProjectId = projectId || task.projectId;

  // Real-time Socket.io emissions
  emitToTask(taskId, "task:status_changed", task);
  if (activeProjectId) {
    emitToProject(activeProjectId, "task:status_changed", task);
  }

  // Create Activity Log & Notifications
  try {
    await createLog({
      organizationId,
      projectId: activeProjectId,
      taskId,
      userId: userId || task.createdBy,
      action: "USER_CHANGED_TASK_STATUS",
      entityType: "TASK",
      entityId: taskId,
      metadata: { newStatus: status, title: task.title },
    });

    if (task.assigneeId && userId && task.assigneeId._id.toString() !== userId.toString()) {
      await createNotification({
        organizationId,
        recipientId: task.assigneeId._id,
        actorId: userId,
        type: "TASK_STATUS_CHANGED",
        title: "Task status updated",
        message: `Task "${task.title}" status changed to ${status}`,
        projectId: activeProjectId,
        taskId,
      });
    }
  } catch (err) {
    console.error("Error creating activity log for task status update:", err);
  }

  return task;
};

const updateTaskPriority = async ({
  organizationId,
  projectId,
  taskId,
  priority,
}) => {
  const query = {
    _id: taskId,
    organizationId,
    archived: { $ne: true },
  };
  if (projectId) query.projectId = projectId;

  const task = await Task.findOneAndUpdate(
    query,
    {
      $set: {
        priority,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  return task;
};

const updateTaskAssignee = async ({
  organizationId,
  projectId,
  taskId,
  assigneeId,
}) => {
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

  const activeProjectId = projectId || task.projectId;
  if (assigneeId && activeProjectId) {
    await verifyProjectMember({
      organizationId,
      projectId: activeProjectId,
      userId: assigneeId,
    });
  }

  task.assigneeId = assigneeId || null;

  await task.save();

  return Task.findById(task._id)
    .populate("assigneeId", "_id name email avatar")
    .lean();
};

const getKanbanTasks = async ({ organizationId, projectId }) => {
  if (projectId) {
    await verifyProject({
      organizationId,
      projectId,
    });
  }

  const query = {
    organizationId,
    archived: { $ne: true },
  };
  if (projectId) query.projectId = projectId;

  const tasks = await Task.find(query)
    .populate("assigneeId", "_id name email avatar")
    .sort({
      createdAt: -1,
      _id: -1,
    })
    .lean();

  const result = {
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
  };

  tasks.forEach((task) => {
    if (result[task.status]) {
      result[task.status].push(task);
    }
  });

  return result;
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  archiveTask,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskAssignee,
  getKanbanTasks,
};
