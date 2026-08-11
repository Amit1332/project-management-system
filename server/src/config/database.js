const mongoose = require("mongoose");
const DATABASE_URL = process.env.DATABASE_URL;

const dbConnection = async () => {
  await mongoose
    .connect(DATABASE_URL)
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((error) => {
      console.error("Error connecting to database:", error);
    });
};

module.exports = dbConnection;
