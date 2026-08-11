const OrganizationMember = require("../models/organizationMembers.model");

const requireTenant = async (req, res, next) => {
  try {
    const organizationId =
      req.params?.organizationId ||
      req.body?.organizationId ||
      req.query?.organizationId ||
      req.headers?.["x-organization-id"] ||
      req.headers?.["organizationid"];

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    const membership = await OrganizationMember.findOne({
      organizationId,
      userId: req.user?._id,
      status: "ACTIVE",
    }).populate("organizationId", "name description ownerId isActive");

    if (!membership || !membership.organizationId) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this organization",
      });
    }

    if (!membership.organizationId.isActive) {
      return res.status(403).json({
        success: false,
        message: "Organization is inactive",
      });
    }

    /**
     * Store tenant information on request
     */
    req.organization = membership.organizationId;

    req.organizationMembership = membership;

    req.organizationId = membership.organizationId._id;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireTenant,
};
