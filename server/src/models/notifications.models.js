const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "TASK_ASSIGNED",
        "TASK_STATUS_CHANGED",
        "MENTIONED",
        "PROJECT_MEMBER_ADDED",
        "TASK_DUE_SOON",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    entityType: {
      type: String,
      default: null,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Notifications = mongoose.model("Notification", notificationSchema);

module.exports = Notifications;
