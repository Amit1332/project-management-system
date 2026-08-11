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
      default: null,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    actorId: {
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

        "TASK_CREATED",
        "TASK_UPDATED",
        "TASK_ASSIGNED",
        "TASK_STATUS_CHANGED",
        "TASK_PRIORITY_CHANGED",
        "TASK_ARCHIVED",

        "COMMENT_CREATED",
        "COMMENT_UPDATED",
        "COMMENT_DELETED",
      ],
      required: true,
    },

    entityType: {
      type: String,
      enum: ["PROJECT", "TASK", "COMMENT", "MEMBER"],
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

activityLogSchema.index({
  projectId: 1,
  createdAt: -1,
});

activityLogSchema.index({
  organizationId: 1,
  createdAt: -1,
});

activityLogSchema.index({
  organizationId: 1,
  createdAt: -1,
});

const ActivityLogs = mongoose.model("ActivityLog", activityLogSchema);
module.exports = ActivityLogs;
