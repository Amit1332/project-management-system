const authService = require("../services/auth.service");
const catchAsync = require("../utils/catchAsync");

const register = catchAsync(async (req, res) => {
  const result = await authService.registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const result = await authService.loginUser(req.body);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  return res.status(200).json({
    success: true,
    data: user,
  });
});

const logout = catchAsync(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

module.exports = {
  register,
  login,
  getMe,
  logout,
};
