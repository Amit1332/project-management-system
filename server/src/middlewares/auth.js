const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const users = require("../models/user.models");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS_CODES } = require("@simple-node/http-status-codes");

const SECRET_KEY = process.env.SECRET_KEY;

exports.isAuthenticated = catchAsync(async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new ApiError(HTTP_STATUS_CODES.BAD_REQUEST, "please login first"),
    );
  }

  const token = authHeader.split(" ")[1];
  const decodedData = await jwt.verify(token, SECRET_KEY);

  req.user = await users.findById(decodedData._id);

  if (!req.user) {
    return next(new ApiError(HTTP_STATUS_CODES.BAD_REQUEST, "Not found"));
  }

  next();
});
