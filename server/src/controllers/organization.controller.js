const organizationService = require("../services/organization.service");
const catchAsync = require("../utils/catchAsync");

const createOrganization = catchAsync(async (req, res) => {
  const result = await organizationService.createOrganization({
    ...req.body,
    userId: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Organization created successfully",
    data: result,
  });
});

const getMyOrganizations = catchAsync(async (req, res) => {
  const result = await organizationService.getMyOrganizations({
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

const getOrganization = catchAsync(async (req, res) => {
  const result = await organizationService.getOrganization({
    organizationId: req.organizationId,
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

const updateOrganization = catchAsync(async (req, res) => {
  const result = await organizationService.updateOrganization({
    organizationId: req.organizationId,

    ...req.body,
  });

  return res.status(200).json({
    success: true,
    message: "Organization updated successfully",
    data: result,
  });
});

const addMember = catchAsync(async (req, res) => {
  const result = await organizationService.addMember({
    organizationId: req.organizationId,

    ...req.body,
  });

  return res.status(201).json({
    success: true,
    message: "Member added successfully",
    data: result,
  });
});

const getMembers = catchAsync(async (req, res) => {
  const result = await organizationService.getMembers({
    organizationId: req.organizationId,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

const updateMemberRole = catchAsync(async (req, res) => {
  const result = await organizationService.updateMemberRole({
    organizationId: req.organizationId,

    userId: req.params.userId,

    role: req.body.role,
  });

  return res.status(200).json({
    success: true,
    message: "Member role updated successfully",
    data: result,
  });
});

const removeMember = catchAsync(async (req, res) => {
  const result = await organizationService.removeMember({
    organizationId: req.organizationId,

    userId: req.params.userId,
  });

  return res.status(200).json({
    success: true,
    message: "Member removed successfully",
    data: result,
  });
});

module.exports = {
  createOrganization,
  getMyOrganizations,
  getOrganization,
  updateOrganization,
  addMember,
  getMembers,
  updateMemberRole,
  removeMember,
};
