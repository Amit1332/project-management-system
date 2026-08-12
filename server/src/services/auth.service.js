const User = require("../models/users.model");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateAccessToken } = require("../utils/jwt");

const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check duplicate email
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error("User with this email already exists");

    error.statusCode = 409;

    throw error;
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  // Generate JWT
  const accessToken = generateAccessToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
    accessToken,
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Explicitly include password
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");

    error.statusCode = 401;

    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Your account is inactive");

    error.statusCode = 403;

    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");

    error.statusCode = 401;

    throw error;
  }

  // Update last login
  user.lastLoginAt = new Date();

  await user.save();

  const accessToken = generateAccessToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    },
    accessToken,
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findOne({
    _id: userId,
    isActive: true,
  }).select("_id name email avatar isActive lastLoginAt createdAt updatedAt");

  if (!user) {
    const error = new Error("User not found");

    error.statusCode = 404;

    throw error;
  }

  return user;
};

const searchUsers = async (searchQuery) => {
  const query = searchQuery ? searchQuery.trim() : "";
  const filter = { isActive: true };

  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("_id name email avatar")
    .limit(20)
    .lean();

  return users;
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  searchUsers,
};
