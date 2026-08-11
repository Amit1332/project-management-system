const activityLogService = require("../services/activityLog.service");
const catchAsync = require("../utils/catchAsync");

const getProjectActivity = catchAsync(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 20, 1),
    100,
  );

  const result = await activityLogService.getProjectActivity({
    organizationId: req.organizationId,
    projectId: req.params.projectId,
    taskId: req.query.taskId,
    page,
    limit,
  });

  return res.status(200).json({
    success: true,
    data: result.logs,
    pagination: result.pagination,
  });
});

const getTaskActivity = catchAsync(async (req, res) => {
  const result = await activityLogService.getTaskActivity({
    organizationId: req.organizationId,

    projectId: req.params.projectId,

    taskId: req.params.taskId,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

module.exports = {
  getProjectActivity,
  getTaskActivity,
};
