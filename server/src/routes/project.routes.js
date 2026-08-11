const express = require("express");
const router = express.Router();

const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  archiveProject,
  addProjectMember,
  getProjectMembers,
  updateProjectMemberRole,
  removeProjectMember,
} = require("../controllers/project.controller");

const { authenticate } = require("../middlewares/auth");

const { requireTenant } = require("../middlewares/tenant");

const {
  requireOrganizationRole,
  requireProjectRole,
} = require("../middlewares/role");

const validate = require("../middlewares/validate");

const {
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
  updateProjectMemberRoleSchema,
} = require("../validations/project.validation");

router.post(
  "/",
  authenticate,
  requireTenant,
  requireOrganizationRole("OWNER", "ADMIN"),
  validate(createProjectSchema),
  createProject,
);

router.get("/", authenticate, requireTenant, getProjects);

router.get("/:projectId", authenticate, requireTenant, getProject);

router.put(
  "/:projectId",
  authenticate,
  requireTenant,
  requireOrganizationRole("OWNER", "ADMIN"),
  validate(updateProjectSchema),
  updateProject,
);

router.delete(
  "/:projectId",
  authenticate,
  requireTenant,
  requireOrganizationRole("OWNER", "ADMIN"),
  archiveProject,
);

router.post(
  "/:projectId/members",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER"),
  validate(addProjectMemberSchema),
  addProjectMember,
);

router.get(
  "/:projectId/members",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER", "MEMBER"),
  getProjectMembers,
);

router.patch(
  "/:projectId/members/:userId",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER"),
  validate(updateProjectMemberRoleSchema),
  updateProjectMemberRole,
);

router.delete(
  "/:projectId/members/:userId",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER"),
  removeProjectMember,
);

module.exports = router;
