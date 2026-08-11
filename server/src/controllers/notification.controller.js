const notificationService = require("../services/notification.service");
const catchAsync = require("../utils/catchAsync");

const getNotifications = catchAsync(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 20, 1),
    100,
  );

  const unreadOnly = req.query.unreadOnly === "true";

  const result = await notificationService.getNotifications({
    userId: req.user._id,
    page,
    limit,
    unreadOnly,
  });

  return res.status(200).json({
    success: true,
    data: result.notifications,
    pagination: result.pagination,
  });
});

const getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount({
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    data: {
      count,
    },
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAsRead({
    notificationId: req.params.notificationId,

    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAllAsRead({
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: "All notifications marked as read",
    data: result,
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const result = await notificationService.deleteNotification({
    notificationId: req.params.notificationId,

    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
