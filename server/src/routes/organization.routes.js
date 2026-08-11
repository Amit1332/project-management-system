const express = require("express");
const router = express.Router();

const {
  createOrganization,
  getMyOrganizations,
  getOrganization,
  updateOrganization,
  addMember,
  getMembers,
  updateMemberRole,
  removeMember,
} = require("../controllers/organization.controller");

const { authenticate } = require("../middlewares/auth");

const { requireTenant } = require("../middlewares/tenant");

const { requireOrganizationRole } = require("../middlewares/role");

const validate = require("../middlewares/validate");

const {
  createOrganizationSchema,
  updateOrganizationSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} = require("../validations/organization.validation");

router.post(
  "/",
  authenticate,
  validate(createOrganizationSchema),
  createOrganization,
);

router.get("/", authenticate, getMyOrganizations);

router.get("/:organizationId", authenticate, requireTenant, getOrganization);

router.put(
  "/:organizationId",
  authenticate,
  requireTenant,
  requireOrganizationRole("OWNER", "ADMIN"),
  validate(updateOrganizationSchema),
  updateOrganization,
);

router.post(
  "/:organizationId/members",
  authenticate,
  requireTenant,
  requireOrganizationRole("OWNER", "ADMIN"),
  validate(addMemberSchema),
  addMember,
);

router.get("/:organizationId/members", authenticate, requireTenant, getMembers);

router.patch(
  "/:organizationId/members/:userId",
  authenticate,
  requireTenant,
  requireOrganizationRole("OWNER"),
  validate(updateMemberRoleSchema),
  updateMemberRole,
);

router.delete(
  "/:organizationId/members/:userId",
  authenticate,
  requireTenant,
  requireOrganizationRole("OWNER", "ADMIN"),
  removeMember,
);

module.exports = router;
