const Notification = require("../models/notifications.models");
const { emitToUser } = require("../socket");

const createNotification = async ({
  organizationId,
  recipientId,
  actorId = null,
  type,
  title,
  message,
  projectId = null,
  taskId = null,
  commentId = null,
  metadata = {},
}) => {
  // Don't notify yourself
  if (actorId && actorId.toString() === recipientId.toString()) {
    return null;
  }

  const notification = await Notification.create({
    organizationId,
    recipientId,
    actorId,
    type,
    title,
    message,
    projectId,
    taskId,
    commentId,
    metadata,
  });

  const populated = await Notification.findById(notification._id)
    .populate("organizationId", "_id name description")
    .populate("actorId", "_id name email avatar")
    .populate("projectId", "_id name")
    .populate("taskId", "_id title status")
    .lean();

  if (recipientId) {
    emitToUser(recipientId, "notification:received", populated);
  }

  return populated;
};

const checkDueSoonNotifications = async (userId) => {
  try {
    const Task = require("../models/tasks.model");
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const dueSoonTasks = await Task.find({
      assigneeId: userId,
      status: { $nin: ["DONE", "COMPLETED"] },
      archived: { $ne: true },
      dueSoonNotified: { $ne: true },
      dueDate: { $gte: now, $lte: next24Hours },
    });

    for (const task of dueSoonTasks) {
      task.dueSoonNotified = true;
      await task.save();

      await createNotification({
        organizationId: task.organizationId,
        recipientId: userId,
        type: "TASK_DUE_SOON",
        title: "Task Due Soon",
        message: `Task "${task.title}" is due within 24 hours`,
        projectId: task.projectId,
        taskId: task._id,
      });
    }
  } catch (err) {
    console.error("Error checking due soon notifications:", err);
  }
};

const getNotifications = async ({
  userId,
  page = 1,
  limit = 20,
  unreadOnly = false,
}) => {
  await checkDueSoonNotifications(userId);

  const filter = {
    recipientId: userId,
  };

  if (unreadOnly) {
    filter.isRead = false;
  }

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .populate("organizationId", "_id name description")
      .populate("actorId", "_id name email avatar")
      .populate("projectId", "_id name")
      .populate("taskId", "_id title status")
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    Notification.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    notifications,

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

const getUnreadCount = async ({ userId }) => {
  return Notification.countDocuments({
    recipientId: userId,
    isRead: false,
  });
};

const markAsRead = async ({ notificationId, userId }) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipientId: userId,
  });

  if (!notification) {
    const error = new Error("Notification not found");

    error.statusCode = 404;

    throw error;
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();

    await notification.save();
  }

  return notification;
};

const markAllAsRead = async ({ userId }) => {
  const result = await Notification.updateMany(
    {
      recipientId: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

const deleteNotification = async ({ notificationId, userId }) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipientId: userId,
  });

  if (!notification) {
    const error = new Error("Notification not found");

    error.statusCode = 404;

    throw error;
  }

  return {
    message: "Notification deleted successfully",
  };
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
