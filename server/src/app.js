const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
// const baseRoutes = require("./routes");
const { errorConverter, errorHandler } = require("./middlewares/error");
const morgan = require("./utils/morgan");
const { authLimiter } = require("./middlewares/rateLimiter");
const ApiError = require("./utils/ApiError");
const { HTTP_STATUS_CODES } = require("@simple-node/http-status-codes");

if (process.env.NODE_ENV !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

//middleware
app.use(cors());
app.options("{*path}", cors());
app.use(express.json({ limit: "10kb" }));

app.use(
  helmet({
    dnsPrefetchControl: false,
    frameguard: false,
    ieNoOpen: false,
  }),
);

if (process.env.NODE_ENV === "production") {
  app.use("/api/v1/auth", authLimiter);
}
// app.use("/api", baseRoutes);

app.use("/ping", (req, res) => {
  return res.json({});
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(HTTP_STATUS_CODES.NOT_FOUND, "Not found"));
});

app.use(errorConverter);

// handle error
app.use(errorHandler);
module.exports = app;

