const Joi = require("joi");

const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required().messages({
    "string.empty": "Project name is required",
    "string.min": "Project name must be at least 2 characters",
    "string.max": "Project name cannot exceed 150 characters",
    "any.required": "Project name is required",
  }),

  description: Joi.string().trim().max(3000).allow("").optional(),

  status: Joi.string()
    .valid("PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED")
    .default("PLANNING"),

  priority: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH", "CRITICAL")
    .default("MEDIUM"),

  startDate: Joi.date().iso().allow(null).optional(),

  dueDate: Joi.date().iso().allow(null).optional(),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).optional(),

  description: Joi.string().trim().max(3000).allow("").optional(),

  status: Joi.string()
    .valid("PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED")
    .optional(),

  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "CRITICAL").optional(),

  startDate: Joi.date().iso().allow(null).optional(),

  dueDate: Joi.date().iso().allow(null).optional(),
}).min(1);

const addProjectMemberSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().optional(),
  userId: Joi.string().hex().length(24).optional(),
  role: Joi.string().valid("MANAGER", "MEMBER").default("MEMBER"),
  organizationId: Joi.string().optional(),
}).or("email", "userId");

const updateProjectMemberRoleSchema = Joi.object({
  role: Joi.string().valid("MANAGER", "MEMBER").required(),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
  updateProjectMemberRoleSchema,
};
