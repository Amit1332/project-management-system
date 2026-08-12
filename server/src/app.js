const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
const baseRoutes = require("./routes");
const { errorConverter, errorHandler } = require("./middlewares/error");
const morgan = require("./utils/morgan");
const { authLimiter } = require("./middlewares/rateLimiter");
const ApiError = require("./utils/ApiError");
const { HTTP_STATUS_CODES } = require("@simple-node/http-status-codes");

if (process.env.NODE_ENV !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Universal CORS & Preflight Middleware for Vercel, Render & Local Dev
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, x-organization-id, x-project-id"
  );

  // Return HTTP 200 OK immediately for preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Backup CORS middleware
app.use(cors({ origin: true, credentials: true }));

app.use(express.json({ limit: "10kb" }));

app.use(
  helmet({
    dnsPrefetchControl: false,
    frameguard: false,
    ieNoOpen: false,
    crossOriginResourcePolicy: false,
  })
);

if (process.env.NODE_ENV === "production") {
  app.use("/api/auth", authLimiter);
}

app.use("/api", baseRoutes);

app.use("/ping", (req, res) => {
  return res.json({ status: "ok", message: "Server is active" });
});

// Send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(HTTP_STATUS_CODES.NOT_FOUND, "Not found"));
});

// Convert error to ApiError if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

module.exports = app;
