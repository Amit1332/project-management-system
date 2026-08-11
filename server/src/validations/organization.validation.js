const Joi = require("joi");

const createOrganizationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required().messages({
    "string.empty": "Organization name is required",
    "string.min": "Organization name must be at least 2 characters",
    "string.max": "Organization name cannot exceed 150 characters",
    "any.required": "Organization name is required",
  }),

  description: Joi.string().trim().max(1000).allow("").optional().messages({
    "string.max": "Description cannot exceed 1000 characters",
  }),
});

const updateOrganizationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).optional(),

  description: Joi.string().trim().max(1000).allow("").optional(),
}).min(1);

const addMemberSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
    "any.required": "Email is required",
  }),

  role: Joi.string().valid("ADMIN", "MEMBER").default("MEMBER"),
});

const updateMemberRoleSchema = Joi.object({
  role: Joi.string().valid("ADMIN", "MEMBER").required().messages({
    "any.only": "Role must be ADMIN or MEMBER",
    "any.required": "Role is required",
  }),
});

module.exports = {
  createOrganizationSchema,
  updateOrganizationSchema,
  addMemberSchema,
  updateMemberRoleSchema,
};
