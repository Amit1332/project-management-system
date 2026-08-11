const Organization = require("../models/organizations.model");
const OrganizationMember = require("../models/organizationMembers.model");
const User = require("../models/users.model");

const createOrganization = async ({ name, description, userId }) => {
  const organization = await Organization.create({
    name,
    description,
    ownerId: userId,
  });

  // Automatically make creator OWNER
  await OrganizationMember.create({
    organizationId: organization._id,
    userId,
    role: "OWNER",
    status: "ACTIVE",
    joinedAt: new Date(),
  });

  return organization;
};

const getMyOrganizations = async ({ userId }) => {
  const memberships = await OrganizationMember.find({
    userId,
    status: "ACTIVE",
  })
    .populate({
      path: "organizationId",
      select: "name description ownerId isActive createdAt updatedAt",
    })
    .sort({ createdAt: -1 })
    .lean();

  return memberships.map((membership) => ({
    organization: membership.organizationId,

    role: membership.role,

    joinedAt: membership.joinedAt,
  }));
};

const getOrganization = async ({ organizationId, userId }) => {
  const organization = await Organization.findOne({
    _id: organizationId,
    isActive: true,
  }).lean();

  if (!organization) {
    const error = new Error("Organization not found");
    error.statusCode = 404;
    throw error;
  }

  let role = "MEMBER";
  if (userId) {
    const membership = await OrganizationMember.findOne({
      organizationId,
      userId,
      status: "ACTIVE",
    }).lean();
    if (membership) {
      role = membership.role;
    }
  }

  return {
    organization,
    role,
  };
};

const updateOrganization = async ({ organizationId, name, description }) => {
  const organization = await Organization.findOneAndUpdate(
    {
      _id: organizationId,
      isActive: true,
    },
    {
      $set: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && {
          description,
        }),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!organization) {
    const error = new Error("Organization not found");

    error.statusCode = 404;

    throw error;
  }

  return organization;
};

const addMember = async ({ organizationId, email, role }) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
    isActive: true,
  }).select("_id name email");

  if (!user) {
    const error = new Error("User with this email does not exist");

    error.statusCode = 404;

    throw error;
  }

  const existingMember = await OrganizationMember.findOne({
    organizationId,
    userId: user._id,
  });

  if (existingMember) {
    const error = new Error("User is already a member of this organization");

    error.statusCode = 409;

    throw error;
  }

  const member = await OrganizationMember.create({
    organizationId,
    userId: user._id,
    role,
    status: "ACTIVE",
    joinedAt: new Date(),
  });

  return member;
};

const getMembers = async ({ organizationId }) => {
  return OrganizationMember.find({
    organizationId,
    status: "ACTIVE",
  })
    .populate({
      path: "userId",
      select: "_id name email avatar isActive lastLoginAt",
    })
    .sort({ createdAt: -1 })
    .lean();
};

const updateMemberRole = async ({ organizationId, userId, role }) => {
  const member = await OrganizationMember.findOne({
    organizationId,
    userId,
    status: "ACTIVE",
  });

  if (!member) {
    const error = new Error("Organization member not found");

    error.statusCode = 404;

    throw error;
  }

  // Owner cannot be changed using this API
  if (member.role === "OWNER") {
    const error = new Error("Organization owner role cannot be changed");

    error.statusCode = 400;

    throw error;
  }

  member.role = role;

  await member.save();

  return member;
};

const removeMember = async ({ organizationId, userId }) => {
  const member = await OrganizationMember.findOne({
    organizationId,
    userId,
    status: "ACTIVE",
  });

  if (!member) {
    const error = new Error("Organization member not found");

    error.statusCode = 404;

    throw error;
  }

  if (member.role === "OWNER") {
    const error = new Error("Organization owner cannot be removed");

    error.statusCode = 400;

    throw error;
  }

  member.status = "REMOVED";

  await member.save();

  return {
    message: "Member removed successfully",
  };
};

module.exports = {
  createOrganization,
  getMyOrganizations,
  getOrganization,
  updateOrganization,
  addMember,
  getMembers,
  updateMemberRole,
  removeMember,
};
