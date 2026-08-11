const express = require("express");

const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} = require("../controllers/comment.controller");

const { authenticate } = require("../middlewares/auth");

const { requireTenant } = require("../middlewares/tenant");

const { requireProjectRole } = require("../middlewares/role");

const validate = require("../middlewares/validate");

const {
  createCommentSchema,
  updateCommentSchema,
} = require("../validations/comment.validation");

const router = express.Router();

router.post(
  "/:taskId/comments",
  authenticate,
  requireTenant,
  validate(createCommentSchema),
  createComment,
);

router.post(
  "/:projectId/tasks/:taskId/comments",
  authenticate,
  requireTenant,
  validate(createCommentSchema),
  createComment,
);

router.get(
  "/:taskId/comments",
  authenticate,
  requireTenant,
  getComments,
);

router.get(
  "/:projectId/tasks/:taskId/comments",
  authenticate,
  requireTenant,
  getComments,
);

router.put(
  "/:id",
  authenticate,
  requireTenant,
  validate(updateCommentSchema),
  updateComment,
);

router.put(
  "/:projectId/tasks/:taskId/comments/:commentId",
  authenticate,
  requireTenant,
  validate(updateCommentSchema),
  updateComment,
);

router.delete(
  "/:id",
  authenticate,
  requireTenant,
  deleteComment,
);

router.delete(
  "/:projectId/tasks/:taskId/comments/:commentId",
  authenticate,
  requireTenant,
  deleteComment,
);

module.exports = router;
