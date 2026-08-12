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

// Production-ready CORS configuration supporting Vercel & local environments
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://project-management-system-three-chi.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, cURL, server-to-server)
    if (!origin) return callback(null, true);

    // Allow explicitly defined origins or any Vercel deployment
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      process.env.NODE_ENV !== "production"
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "x-organization-id",
    "x-project-id",
  ],
};

app.use(cors(corsOptions));

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
