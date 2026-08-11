const ApiError = require("../utils/ApiError");
const { HTTP_STATUS_CODES } = require("@simple-node/http-status-codes");

const NODE_ENV = process.env.NODE_ENV;

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      err.statusCode || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
    const message = err.message || HTTP_STATUS_CODES[statusCode];
    error = new ApiError(statusCode, message, false, (stack = err.stack));
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (NODE_ENV === "production" && !err.isOperational) {
    statusCode = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
    message = HTTP_STATUS_CODES[statusCode];
  }

  res.locals.errorMessage = err.message;

  const response = {
    statusCode,
    message,
    ...(NODE_ENV === "development" && { stack: err.stack }),
  };

  if (NODE_ENV === "development") {
    console.log(err);
  }

  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
