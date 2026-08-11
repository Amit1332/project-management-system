const express = require("express");

const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  archiveTask,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskAssignee,
  getKanbanTasks,
} = require("../controllers/task.controller");

const { authenticate } = require("../middlewares/auth");

const { requireTenant } = require("../middlewares/tenant");

const { requireProjectRole } = require("../middlewares/role");

const validate = require("../middlewares/validate");

const {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  updateTaskPrioritySchema,
  updateTaskAssigneeSchema,
} = require("../validations/task.validation");

const router = express.Router();

router.post(
  "/",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER"),
  validate(createTaskSchema),
  createTask,
);

router.get(
  "/",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER", "MEMBER"),
  getTasks,
);

router.get(
  "/kanban",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER", "MEMBER"),
  getKanbanTasks,
);

router.get(
  "/:id",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER", "MEMBER"),
  getTask,
);

router.put(
  "/:id",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER"),
  validate(updateTaskSchema),
  updateTask,
);

router.delete(
  "/:id",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER"),
  archiveTask,
);

router.patch(
  "/:id/status",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER", "MEMBER"),
  validate(updateTaskStatusSchema),
  updateTaskStatus,
);

router.patch(
  "/:id/priority",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER"),
  validate(updateTaskPrioritySchema),
  updateTaskPriority,
);

router.patch(
  "/:id/assignee",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER"),
  validate(updateTaskAssigneeSchema),
  updateTaskAssignee,
);

module.exports = router;
