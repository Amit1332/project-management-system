const router = require("express").Router();
const {
  getDashboardAnalytics,
} = require("../controllers/analytics.controller");
const { authenticate } = require("../middlewares/auth");

router.get("/dashboard", authenticate, getDashboardAnalytics);

module.exports = router;
