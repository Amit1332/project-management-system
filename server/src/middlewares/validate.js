const ApiError = require("../utils/ApiError");
const { HTTP_STATUS_CODES } = require("@simple-node/http-status-codes");

const validate = (schema) => (req, res, next) => {
  const validSchema = schema.pick ? schema : schema;
  let objectToValidate = {};
  if (schema.shape?.body) objectToValidate.body = req.body;
  if (schema.shape?.query) objectToValidate.query = req.query;
  if (schema.shape?.params) objectToValidate.params = req.params;

  const result = schema.safeParse(objectToValidate);

  if (!result.success) {
    const errorMessage = result.error.issues
      .map((issue) => `${issue.message.toLowerCase()}`)
      .join(", ");

    return next(new ApiError(HTTP_STATUS_CODES.BAD_REQUEST, errorMessage));
  }

  Object.assign(req, result.data);
  return next();
};

module.exports = validate;
