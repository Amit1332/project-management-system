const Joi = require("joi");

const createCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(3000).required().messages({
    "string.empty": "Comment is required",
    "string.min": "Comment cannot be empty",
    "string.max": "Comment cannot exceed 3000 characters",
    "any.required": "Comment is required",
  }),
  organizationId: Joi.string().optional(),
  projectId: Joi.string().optional(),
  taskId: Joi.string().optional(),
});

const updateCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(3000).required().messages({
    "string.empty": "Comment is required",
    "string.min": "Comment cannot be empty",
    "string.max": "Comment cannot exceed 3000 characters",
    "any.required": "Comment is required",
  }),
});

module.exports = {
  createCommentSchema,
  updateCommentSchema,
};
