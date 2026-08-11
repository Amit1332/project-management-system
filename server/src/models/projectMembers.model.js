const mongoose = require("mongoose");

const projectMemberSchema = new mongoose.Schema(
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

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["MANAGER", "MEMBER"],
      default: "MEMBER",
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

projectMemberSchema.index(
  {
    projectId: 1,
    userId: 1,
  },
  {
    unique: true,
  },
);

projectMemberSchema.index({
  organizationId: 1,
  userId: 1,
});
projectMemberSchema.index({
  projectId: 1,
  role: 1,
});

const ProjectMembers = mongoose.model("ProjectMember", projectMemberSchema);

module.exports = ProjectMembers;
