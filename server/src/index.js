const dotenv = require("dotenv");
const path = require("path");
dotenv.config(path.join(__dirname, "../.env"));
const app = require("./app");
const dbConnect = require("./config/database");

const PORT = process.env.PORT || 3000;

let server;
const startServer = () => {
  try {
    server = app.listen(PORT, () => {
      dbConnect();
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

startServer();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (err) => {
  console.error("Unexpected error:", err);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);
