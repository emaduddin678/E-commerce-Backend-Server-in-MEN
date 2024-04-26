const app = require("./app.js");
const connectDatabase = require("./config/db.js");
const logger = require("./controllers/loggerController.js");
const { serverPort } = require("./secret.js");

app.listen(serverPort, async () => {
  logger.log("info",`server is running at http://localhost:${serverPort}`);
  await connectDatabase();
});
