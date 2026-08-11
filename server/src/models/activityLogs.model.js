const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "PROJECT_CREATED",
        "PROJECT_UPDATED",
        "PROJECT_ARCHIVED",

        "PROJECT_MEMBER_ADDED",
        "PROJECT_MEMBER_REMOVED",
        "PROJECT_MEMBER_ROLE_CHANGED",

        "TASK_CREATED",
        "TASK_UPDATED",
        "TASK_ARCHIVED",
        "TASK_ASSIGNED",
        "TASK_UNASSIGNED",
        "TASK_STATUS_CHANGED",
        "TASK_PRIORITY_CHANGED",

        "COMMENT_CREATED",
        "COMMENT_UPDATED",
        "COMMENT_DELETED",
      ],
      required: true,
    },

    entityType: {
      type: String,
      enum: ["PROJECT", "TASK", "COMMENT", "PROJECT_MEMBER"],
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

const ActivityLogs = mongoose.model("ActivityLog", activityLogSchema);
module.exports = ActivityLogs;
