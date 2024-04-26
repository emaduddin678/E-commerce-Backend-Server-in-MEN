const mongoose = require("mongoose");
const { mongodbURL } = require("../secret");
const logger = require("../controllers/loggerController");

const connectDatabase = async (options = {}) => {
  try {
    await mongoose.connect(mongodbURL, options);
    logger.log("info", "Server is Connected with database");

    mongoose.connection.on("error", (error) => {
      logger.log("error", "DB Connection error");
    });
  } catch (error) {
    logger.log('error',"Could not connect to DB", error.toString());
  }
}; 

module.exports = connectDatabase;
