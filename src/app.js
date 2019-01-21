/**
 * Modified from https://github.com/sahat/hackathon-starter/blob/master/app.js
 * Module dependencies.
 */
const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const logger = require("morgan");
const chalk = require("chalk");
const errorHandler = require("errorhandler");
const dotenv = require("dotenv");
const path = require("path");
const expressValidator = require("express-validator");
const { query, body } = require("express-validator/check");
const expressStatusMonitor = require("express-status-monitor");

const mazeGenController = require("./controller/MazeGenController");

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load();

/**
 * Create Express server.
 */
const app = express();

/**
 * Express configuration.
 */
app.set('host', process.env.HOST || "127.0.0.1");
app.set('port', process.env.PORT || 8080);
app.use(expressStatusMonitor());
app.use(expressValidator());
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


/**
 * MazeGenerator API
 */
app.get("/api/maze", mazeGenController.getIndex);
const rowValidation = query("row")
  .optional()
  .isInt();
const colValidation = query("col")
  .optional()
  .isInt();
app.get("/api/maze/active", [rowValidation, colValidation], mazeGenController.getActive);
const pathValidation = body("path")
  .exists()
  .withMessage("missing path field in body")
  .isArray()
  .withMessage("path field is not an array")
  .not().isEmpty()
  .withMessage("path field cannot be empty");
app.put("/api/maze/complete", [pathValidation], mazeGenController.getComplete);

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Server Error");
  });
}

/**
 * Start Express server.
 */
app.listen(app.get("port"), (error) => {
  if (error) {
    console.error(`${chalk.red("✗")} App failed to start: ${error}`);
  } else {
    console.log(`${chalk.green("✓")} App is running at http://${app.get("host")}:${app.get("port")} in mode ${app.get("env")}`);
  }
});

