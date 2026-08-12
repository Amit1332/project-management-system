const taskService = require("../services/task.service");
const catchAsync = require("../utils/catchAsync");

const createTask = catchAsync(async (req, res) => {
  const projectId = req.params.projectId || req.body?.projectId || req.query?.projectId;
  const result = await taskService.createTask({
    ...req.body,
    organizationId: req.organizationId,
    projectId,
    userId: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: result,
  });
});

const getTasks = catchAsync(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 20, 1),
    100,
  );
  const projectId = req.params.projectId || req.query?.projectId;

  const result = await taskService.getTasks({
    organizationId: req.organizationId,
    projectId,
    page,
    limit,
    status: req.query.status,
    priority: req.query.priority,
    assigneeId: req.query.assigneeId,
    search: req.query.search,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
  });

  return res.status(200).json({
    success: true,
    data: result.tasks,
    pagination: result.pagination,
  });
});

const getTask = catchAsync(async (req, res) => {
  const taskId = req.params.id || req.params.taskId;
  const projectId = req.params.projectId || req.query?.projectId || req.body?.projectId;

  const result = await taskService.getTask({
    organizationId: req.organizationId,
    projectId,
    taskId,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

const updateTask = catchAsync(async (req, res) => {
  const taskId = req.params.id || req.params.taskId;
  const projectId = req.params.projectId || req.body?.projectId || req.query?.projectId;

  const result = await taskService.updateTask({
    organizationId: req.organizationId,
    projectId,
    taskId,
    ...req.body,
  });

  return res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: result,
  });
});

const archiveTask = catchAsync(async (req, res) => {
  const taskId = req.params.id || req.params.taskId;
  const projectId = req.params.projectId || req.query?.projectId || req.body?.projectId;

  const result = await taskService.archiveTask({
    organizationId: req.organizationId,
    projectId,
    taskId,
  });

  return res.status(200).json({
    success: true,
    message: "Task archived successfully",
    data: result,
  });
});

const updateTaskStatus = catchAsync(async (req, res) => {
  const taskId = req.params.id || req.params.taskId;
  const projectId = req.params.projectId || req.body?.projectId || req.query?.projectId;

  const result = await taskService.updateTaskStatus({
    organizationId: req.organizationId,
    projectId,
    taskId,
    status: req.body.status,
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: "Task status updated successfully",
    data: result,
  });
});

const updateTaskPriority = catchAsync(async (req, res) => {
  const taskId = req.params.id || req.params.taskId;
  const projectId = req.params.projectId || req.body?.projectId || req.query?.projectId;

  const result = await taskService.updateTaskPriority({
    organizationId: req.organizationId,
    projectId,
    taskId,
    priority: req.body.priority,
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: "Task priority updated successfully",
    data: result,
  });
});

const updateTaskAssignee = catchAsync(async (req, res) => {
  const taskId = req.params.id || req.params.taskId;
  const projectId = req.params.projectId || req.body?.projectId || req.query?.projectId;

  const result = await taskService.updateTaskAssignee({
    organizationId: req.organizationId,
    projectId,
    taskId,
    assigneeId: req.body.assigneeId,
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: "Task assignee updated successfully",
    data: result,
  });
});

const getKanbanTasks = catchAsync(async (req, res) => {
  const projectId = req.params.projectId || req.query?.projectId;

  const result = await taskService.getKanbanTasks({
    organizationId: req.organizationId,
    projectId,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  archiveTask,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskAssignee,
  getKanbanTasks,
};
