const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
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

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 10000,
    },

    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED", "DONE"],
      default: "TODO",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },

    labels: {
      type: [String],
      default: [],
    },

    dueDate: {
      type: Date,
      default: null,
    },

    archived: {
      type: Boolean,
      default: false,
    },

    dueSoonNotified: {
      type: Boolean,
      default: false,
    },

    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({
  projectId: 1,
  status: 1,
  createdAt: -1,
});
taskSchema.index({
  projectId: 1,
  assigneeId: 1,
  status: 1,
  createdAt: -1,
});

taskSchema.index({
  projectId: 1,
  priority: 1,
  createdAt: -1,
});
taskSchema.index({
  organizationId: 1,
  dueDate: 1,
  status: 1,
});
taskSchema.index({
  organizationId: 1,
  assigneeId: 1,
  status: 1,
  dueDate: 1,
});

taskSchema.index({
  organizationId: 1,
  projectId: 1,
  archived: 1,
  createdAt: -1,
});
taskSchema.index({
  _id: 1,
  organizationId: 1,
});
taskSchema.index({
  title: "text",
  description: "text",
});

const Tasks = mongoose.model("Task", taskSchema);

module.exports = Tasks;
