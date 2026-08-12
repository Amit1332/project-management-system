const projectService = require("../services/project.service");
const catchAsync = require("../utils/catchAsync");

const createProject = catchAsync(async (req, res) => {
  const result = await projectService.createProject({
    ...req.body,

    organizationId: req.organizationId,

    userId: req.user._id,
  });

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
  const result = await projectService.getProject({
    organizationId: req.organizationId,

    projectId: req.params.projectId,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

const updateProject = catchAsync(async (req, res) => {
  const result = await projectService.updateProject({
    organizationId: req.organizationId,

    projectId: req.params.projectId,

    ...req.body,
  });

  return res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: result,
  });
});

const archiveProject = catchAsync(async (req, res) => {
  const result = await projectService.archiveProject({
    organizationId: req.organizationId,

    projectId: req.params.projectId,
  });

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

  return res.status(201).json({
    success: true,
    message: "Project member added successfully",
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

const updateProjectMemberRole = catchAsync(async (req, res) => {
  const result = await projectService.updateProjectMemberRole({
    organizationId: req.organizationId,

    projectId: req.params.projectId,

    userId: req.params.userId,

    role: req.body.role,
  });

  return res.status(200).json({
    success: true,
    message: "Project member role updated successfully",
    data: result,
  });
});

const removeProjectMember = catchAsync(async (req, res) => {
  const result = await projectService.removeProjectMember({
    organizationId: req.organizationId,

    projectId: req.params.projectId,

    userId: req.params.userId,
  });

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

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
