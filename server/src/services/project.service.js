const Project = require("../models/projects.models");
const ProjectMember = require("../models/projectMembers.model");
const OrganizationMember = require("../models/organizationMembers.model");
const User = require("../models/users.model");

const createProject = async ({
  organizationId,
  userId,
  name,
  description,
  status,
  priority,
  startDate,
  dueDate,
}) => {
  const project = await Project.create({
    organizationId,
    name,
    description,
    ownerId: userId,
    status,
    priority,
    startDate,
    dueDate,
  });

  // Creator automatically becomes project manager
  await ProjectMember.create({
    organizationId,
    projectId: project._id,
    userId,
    role: "MANAGER",
    addedBy: userId,
  });

  try {
    const { createLog } = require("./activityLog.service");
    await createLog({
      organizationId,
      projectId: project._id,
      userId,
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
      entityId: project._id,
      metadata: { name },
    });
  } catch (err) {
    console.error("Error creating activity log for project creation:", err);
  }

  return project;
};

const getProjects = async ({
  organizationId,
  page = 1,
  limit = 20,
  status,
  priority,
  search,
}) => {
  const skip = (page - 1) * limit;

  const filter = {
    organizationId,
  };

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (search && search.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate("ownerId", "_id name email avatar")
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    Project.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    projects,

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

const getProject = async ({ organizationId, projectId }) => {
  const project = await Project.findOne({
    _id: projectId,
    organizationId,
    status: { $ne: "ARCHIVED" },
  })
    .populate("ownerId", "_id name email avatar")
    .lean();

  if (!project) {
    const error = new Error("Project not found");

    error.statusCode = 404;

    throw error;
  }

  return project;
};

const updateProject = async ({ organizationId, projectId, ...updates }) => {
  const project = await Project.findOne({
    _id: projectId,
    organizationId,
  });

  if (!project) {
    const error = new Error("Project not found");

    error.statusCode = 404;

    throw error;
  }

  if (project.status === "ARCHIVED") {
    const error = new Error("Archived project cannot be updated");

    error.statusCode = 400;

    throw error;
  }

  Object.assign(project, updates);

  await project.save();

  return project;
};

const archiveProject = async ({ organizationId, projectId }) => {
  const project = await Project.findOne({
    _id: projectId,
    organizationId,
  });

  if (!project) {
    const error = new Error("Project not found");

    error.statusCode = 404;

    throw error;
  }

  if (project.status === "ARCHIVED") {
    const error = new Error("Project is already archived");

    error.statusCode = 400;

    throw error;
  }

  project.status = "ARCHIVED";

  await project.save();

  try {
    const { createLog } = require("./activityLog.service");
    await createLog({
      organizationId,
      projectId,
      userId: project.ownerId,
      action: "PROJECT_ARCHIVED",
      entityType: "PROJECT",
      entityId: projectId,
      metadata: { name: project.name },
    });
  } catch (err) {
    console.error("Error creating activity log for project archive:", err);
  }

  return project;
};

const addProjectMember = async ({
  organizationId,
  projectId,
  email,
  userId,
  role,
  addedBy,
}) => {
  const project = await Project.findOne({
    _id: projectId,
    organizationId,
    status: {
      $ne: "ARCHIVED",
    },
  });

  if (!project) {
    const error = new Error("Project not found or archived");
    error.statusCode = 404;
    throw error;
  }

  let user;
  if (userId) {
    user = await User.findOne({ _id: userId, isActive: true }).select("_id name email");
  } else if (email) {
    user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select("_id name email");
  }

  if (!user) {
    const error = new Error("User does not exist or is inactive");
    error.statusCode = 404;
    throw error;
  }

  // User must belong to organization
  const organizationMembership = await OrganizationMember.findOne({
    organizationId,
    userId: user._id,
    status: "ACTIVE",
  });

  if (!organizationMembership) {
    const error = new Error("User is not a member of this organization");

    error.statusCode = 400;

    throw error;
  }

  const existingMember = await ProjectMember.findOne({
    projectId,
    userId: user._id,
  });

  if (existingMember) {
    const error = new Error("User is already a project member");

    error.statusCode = 409;

    throw error;
  }

  const member = await ProjectMember.create({
    organizationId,
    projectId,
    userId: user._id,
    role,
    addedBy,
  });

  try {
    const { createNotification } = require("./notification.service");
    const { createLog } = require("./activityLog.service");

    await createNotification({
      organizationId,
      recipientId: user._id,
      actorId: addedBy,
      type: "USER_ADDED_TO_PROJECT",
      title: "Added to project",
      message: `You were added to project "${project.name}" as ${role}`,
      projectId,
    });

    await createLog({
      organizationId,
      projectId,
      userId: addedBy,
      action: "MEMBER_ADDED",
      entityType: "PROJECT_MEMBER",
      entityId: member._id,
      metadata: { addedUserId: user._id, role },
    });
  } catch (err) {
    console.error("Error creating notification/log for project member addition:", err);
  }

  return member;
};

const getProjectMembers = async ({ organizationId, projectId }) => {
  const project = await Project.findOne({
    _id: projectId,
    organizationId,
  });

  if (!project) {
    const error = new Error("Project not found");

    error.statusCode = 404;

    throw error;
  }

  return ProjectMember.find({
    projectId,
  })
    .populate({
      path: "userId",
      select: "_id name email avatar isActive",
    })
    .populate({
      path: "addedBy",
      select: "_id name email",
    })
    .sort({
      createdAt: -1,
    })
    .lean();
};

const updateProjectMemberRole = async ({
  organizationId,
  projectId,
  userId,
  role,
}) => {
  const member = await ProjectMember.findOne({
    organizationId,
    projectId,
    userId,
  });

  if (!member) {
    const error = new Error("Project member not found");

    error.statusCode = 404;

    throw error;
  }

  member.role = role;

  await member.save();

  return member;
};

const removeProjectMember = async ({ organizationId, projectId, userId }) => {
  const member = await ProjectMember.findOne({
    organizationId,
    projectId,
    userId,
  });

  if (!member) {
    const error = new Error("Project member not found");

    error.statusCode = 404;

    throw error;
  }

  await ProjectMember.deleteOne({
    _id: member._id,
  });

  return {
    message: "Project member removed successfully",
  };
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  archiveProject,
  addProjectMember,
  getProjectMembers,
  updateProjectMemberRole,
  removeProjectMember,
};
