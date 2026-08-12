const express = require("express");

const {
  register,
  login,
  logout,
  getMe,
  searchUsers,
} = require("../controllers/auth.controller");

const { authenticate } = require("../middlewares/auth");

const validate = require("../middlewares/validate");

const {
  registerSchema,
  loginSchema,
} = require("../validations/auth.validation");

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post("/register", validate(registerSchema), register);

/**
 * POST /api/auth/login
 */
router.post("/login", validate(loginSchema), login);

/**
 * POST /api/auth/logout
 */
router.post("/logout", authenticate, logout);

/**
 * GET /api/auth/me
 */
router.get("/me", authenticate, getMe);

/**
 * GET /api/auth/users/search
 */
router.get("/users/search", authenticate, searchUsers);

module.exports = router;
