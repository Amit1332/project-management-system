const projectService = require("../services/project.service");
const catchAsync = require("../utils/catchAsync");
const { redisCache } = require("../config/redis");

const createProject = catchAsync(async (req, res) => {
  const result = await projectService.createProject({
    ...req.body,
    organizationId: req.organizationId,
    userId: req.user._id,
  });

  redisCache.delPattern(`projects:${req.organizationId}:*`);

  return res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: result,
  });
});

const getProjects = catchAsync(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 20, 1),
    100,
  );

  const result = await projectService.getProjects({
    organizationId: req.organizationId,
    page,
    limit,
    status: req.query.status,
    priority: req.query.priority,
    search: req.query.search,
  });

  return res.status(200).json({
    success: true,
    data: result.projects,
    pagination: result.pagination,
  });
});

const getProject = catchAsync(async (req, res) => {
  const projectId = req.params.projectId;
  const cacheKey = `project:${req.organizationId}:${projectId}`;

  const cached = await redisCache.get(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const result = await projectService.getProject({
    organizationId: req.organizationId,
    projectId,
  });

  const responsePayload = {
    success: true,
    data: result,
  };

  redisCache.set(cacheKey, responsePayload, 300);

  return res.status(200).json(responsePayload);
});

const updateProject = catchAsync(async (req, res) => {
  const projectId = req.params.projectId;
  const result = await projectService.updateProject({
    organizationId: req.organizationId,
    projectId,
    ...req.body,
  });

  redisCache.del(`project:${req.organizationId}:${projectId}`);
  redisCache.delPattern(`projects:${req.organizationId}:*`);

  return res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: result,
  });
});

const archiveProject = catchAsync(async (req, res) => {
  const projectId = req.params.projectId;
  const result = await projectService.archiveProject({
    organizationId: req.organizationId,
    projectId,
  });

  redisCache.del(`project:${req.organizationId}:${projectId}`);
  redisCache.delPattern(`projects:${req.organizationId}:*`);

  return res.status(200).json({
    success: true,
    message: "Project archived successfully",
    data: result,
  });
});

const addProjectMember = catchAsync(async (req, res) => {
  const result = await projectService.addProjectMember({
    organizationId: req.organizationId,
    projectId: req.params.projectId,
    addedBy: req.user._id,
    ...req.body,
  });

  redisCache.del(`project:${req.organizationId}:${req.params.projectId}`);

  return res.status(200).json({
    success: true,
    message: "Project member added successfully",
    data: result,
  });
});

const removeProjectMember = catchAsync(async (req, res) => {
  const result = await projectService.removeProjectMember({
    organizationId: req.organizationId,
    projectId: req.params.projectId,
    memberUserId: req.params.memberUserId,
  });

  redisCache.del(`project:${req.organizationId}:${req.params.projectId}`);

  return res.status(200).json({
    success: true,
    message: "Project member removed successfully",
    data: result,
  });
});

const changeProjectMemberRole = catchAsync(async (req, res) => {
  const result = await projectService.changeProjectMemberRole({
    organizationId: req.organizationId,
    projectId: req.params.projectId,
    memberUserId: req.params.memberUserId,
    role: req.body.role,
  });

  redisCache.del(`project:${req.organizationId}:${req.params.projectId}`);

  return res.status(200).json({
    success: true,
    message: "Project member role updated successfully",
    data: result,
  });
});

const getProjectMembers = catchAsync(async (req, res) => {
  const result = await projectService.getProjectMembers({
    organizationId: req.organizationId,
    projectId: req.params.projectId,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  archiveProject,
  addProjectMember,
  removeProjectMember,
  changeProjectMemberRole,
  getProjectMembers,
};
