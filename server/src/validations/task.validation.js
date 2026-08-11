const Joi = require("joi");

const createTaskSchema = Joi.object({
  projectId: Joi.string().hex().length(24).optional(),
  organizationId: Joi.string().hex().length(24).optional(),

  title: Joi.string().trim().min(2).max(200).required().messages({
    "string.empty": "Task title is required",
    "string.min": "Task title must be at least 2 characters",
    "string.max": "Task title cannot exceed 200 characters",
    "any.required": "Task title is required",
  }),

  description: Joi.string().trim().max(5000).allow("").optional(),

  status: Joi.string()
    .valid("TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "COMPLETED")
    .default("TODO"),

  priority: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH", "CRITICAL")
    .default("MEDIUM"),

  assigneeId: Joi.string().hex().length(24).allow(null).optional(),

  dueDate: Joi.date().iso().allow(null).optional(),

  labels: Joi.array().items(Joi.string().trim().max(50)).max(20).default([]),
});

const updateTaskSchema = Joi.object({
  projectId: Joi.string().hex().length(24).optional(),
  organizationId: Joi.string().hex().length(24).optional(),

  title: Joi.string().trim().min(2).max(200).optional(),

  description: Joi.string().trim().max(5000).allow("").optional(),

  status: Joi.string()
    .valid("TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "COMPLETED")
    .optional(),

  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "CRITICAL").optional(),

  assigneeId: Joi.string().hex().length(24).allow(null).optional(),

  dueDate: Joi.date().iso().allow(null).optional(),

  labels: Joi.array().items(Joi.string().trim().max(50)).max(20).optional(),
}).min(1);

const updateTaskStatusSchema = Joi.object({
  status: Joi.string()
    .valid("TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "COMPLETED")
    .required(),
});

const updateTaskPrioritySchema = Joi.object({
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "CRITICAL").required(),
});

const updateTaskAssigneeSchema = Joi.object({
  assigneeId: Joi.string().hex().length(24).allow(null).required(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  updateTaskPrioritySchema,
  updateTaskAssigneeSchema,
};
