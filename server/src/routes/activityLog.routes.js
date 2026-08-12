const express = require("express");

const {
  getProjectActivity,
  getTaskActivity,
} = require("../controllers/activityLog.controller");

const { authenticate } = require("../middlewares/auth");

const { requireTenant } = require("../middlewares/tenant");

const { requireProjectRole } = require("../middlewares/role");

const router = express.Router();

router.get(
  "/:projectId/activity",
  authenticate,
  requireTenant,
  requireProjectRole("MANAGER", "MEMBER"),
  getProjectActivity,
);

module.exports = router;
