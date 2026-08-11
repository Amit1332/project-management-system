const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
  const mins = process.env.JWT_ACCESS_EXPIRATION_MINUTES;
  const expiresIn = mins ? (isNaN(mins) ? mins : `${mins}m`) : "7d";

  return jwt.sign(
    {
      userId: userId.toString(),
    },
    process.env.JWT_SECRET || "defaultsecret",
    {
      expiresIn,
    },
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
};
