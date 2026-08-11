const router = require("express").Router();
const authRoutes = require("./auth.routes");
const organizationRoutes = require("./organization.routes");
const projectRoutes = require("./project.routes");
const taskRoutes = require("./task.routes");
const commentRoutes = require("./comment.routes");
const activityLogRoutes = require("./activityLog.routes");
const notificationRoutes = require("./notification.routes");
const analyticsRoutes = require("./analytics.routes");

router.use("/auth", authRoutes);
router.use("/organizations", organizationRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/comments", commentRoutes);
router.use("/projects", commentRoutes);
router.use("/projects", activityLogRoutes);
router.use("/notifications", notificationRoutes);
router.use("/analytics", analyticsRoutes);

module.exports = router;
