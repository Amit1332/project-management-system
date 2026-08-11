// src/utils/formatError.js

export const formatError = (error) => {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  // RTK Query / Fetch error with response data
  if (error?.data) {
    // Backend returns:
    // { message: "Invalid credentials" }
    if (typeof error.data === "object" && error.data.message) {
      return error.data.message;
    }

    // Backend returns:
    // { error: "Invalid credentials" }
    if (typeof error.data === "object" && error.data.error) {
      return error.data.error;
    }

    // Backend returns:
    // { message: ["Email is required", "Password is required"] }
    if (typeof error.data === "object" && Array.isArray(error.data.message)) {
      return error.data.message.join(", ");
    }

    // Backend directly returns a string
    if (typeof error.data === "string") {
      return error.data;
    }
  }

  // Standard Error object
  if (error?.message) {
    return error.message;
  }

  // HTTP status based fallback
  switch (error?.status) {
    case 400:
      return "Invalid request. Please check your input.";

    case 401:
      return "You are not authorized. Please login again.";

    case 403:
      return "You do not have permission to perform this action.";

    case 404:
      return "The requested resource was not found.";

    case 409:
      return "This operation conflicts with existing data.";

    case 422:
      return "The submitted data is invalid.";

    case 429:
      return "Too many requests. Please try again later.";

    case 500:
      return "Something went wrong on the server.";

    case 502:
    case 503:
    case 504:
      return "Server is temporarily unavailable. Please try again later.";

    default:
      return "Something went wrong. Please try again.";
  }
};
