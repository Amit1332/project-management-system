const ProjectMembers = require("../models/projectMembers.model");

const requireOrganizationRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.organizationMembership) {
      return res.status(500).json({
        success: false,
        message: "Organization context is missing",
      });
    }

    const userRole = req.organizationMembership.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};
const requireProjectRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const projectId =
        req.params.projectId ||
        req.body?.projectId ||
        req.query?.projectId ||
        req.headers?.["x-project-id"];

      if (req.organizationMembership && ["OWNER", "ADMIN"].includes(req.organizationMembership.role)) {
        return next();
      }

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: "Project ID is required",
        });
      }

      const membership = await ProjectMembers.findOne({
        projectId,
        organizationId: req.organizationId,
        userId: req.user._id,
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: "You are not a member of this project",
        });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have project permission",
        });
      }

      req.projectMembership = membership;

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireOrganizationRole,
  requireProjectRole,
};
