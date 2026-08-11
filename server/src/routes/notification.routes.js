const express = require("express");

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.get("/", authenticate, getNotifications);

router.get("/unread-count", authenticate, getUnreadCount);

router.patch("/read-all", authenticate, markAllAsRead);

router.patch("/:notificationId/read", authenticate, markAsRead);

router.delete("/:notificationId", authenticate, deleteNotification);

module.exports = router;
