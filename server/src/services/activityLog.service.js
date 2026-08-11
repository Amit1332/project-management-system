const ActivityLog = require("../models/activityLogs.model");
const { emitToProject, emitToOrganization } = require("../socket");

const createLog = async ({
  organizationId,
  projectId,
  taskId = null,
  userId,
  action,
  entityType,
  entityId,
  metadata = {},
}) => {
  const log = await ActivityLog.create({
    organizationId,
    projectId,
    taskId,
    userId,
    action,
    entityType,
    entityId,
    metadata,
  });

  const populated = await ActivityLog.findById(log._id)
    .populate("userId", "_id name email avatar")
    .populate("taskId", "_id title status")
    .lean();

  if (projectId) {
    emitToProject(projectId, "activity:logged", populated);
  }
  if (organizationId) {
    emitToOrganization(organizationId, "activity:logged", populated);
  }

  return populated;
};

const getProjectActivity = async ({
  organizationId,
  projectId,
  taskId = null,
  page = 1,
  limit = 20,
}) => {
  const skip = (page - 1) * limit;

  const filter = {
    organizationId,
    projectId,
  };

  if (taskId) {
    filter.taskId = taskId;
  }

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate("userId", "_id name email avatar")
      .populate("taskId", "_id title status")
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    ActivityLog.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    logs,

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

const getTaskActivity = async ({ organizationId, projectId, taskId }) => {
  return ActivityLog.find({
    organizationId,
    projectId,
    taskId,
  })
    .populate("userId", "_id name email avatar")
    .sort({
      createdAt: -1,
      _id: -1,
    })
    .lean();
};

module.exports = {
  createLog,
  getProjectActivity,
  getTaskActivity,
};
