const mongoose = require("mongoose");

const organizationMemberSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "MEMBER"],
      default: "MEMBER",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INVITED", "REMOVED"],
      default: "ACTIVE",
    },

    joinedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

organizationMemberSchema.index(
  {
    organizationId: 1,
    userId: 1,
  },
  {
    unique: true,
  },
);

const OrganizationMembers = mongoose.model(
  "OrganizationMember",
  organizationMemberSchema,
);

module.exports = OrganizationMembers;
