const commentService = require("../services/comment.service");
const catchAsync = require("../utils/catchAsync");

const createComment = catchAsync(async (req, res) => {
  const result = await commentService.createComment({
    organizationId: req.organizationId,

    projectId: req.params.projectId,

    taskId: req.params.taskId,

    userId: req.user._id,

    content: req.body.content,
  });

  return res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: result,
  });
});

const getComments = catchAsync(async (req, res) => {
  const result = await commentService.getComments({
    organizationId: req.organizationId,

    projectId: req.params.projectId,

    taskId: req.params.taskId,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

const updateComment = catchAsync(async (req, res) => {
  const commentId = req.params.id || req.params.commentId;
  const result = await commentService.updateComment({
    organizationId: req.organizationId,
    projectId: req.params.projectId,
    taskId: req.params.taskId,
    commentId,
    userId: req.user._id,
    content: req.body.content,
  });

  return res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req, res) => {
  const commentId = req.params.id || req.params.commentId;
  const result = await commentService.deleteComment({
    organizationId: req.organizationId,
    projectId: req.params.projectId,
    taskId: req.params.taskId,
    commentId,
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
