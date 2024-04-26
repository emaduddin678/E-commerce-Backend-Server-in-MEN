const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const userRouter = require("./routers/userRouter");
const seedRouter = require("./routers/seedRouter");
const { errorResponse } = require("./controllers/responseController");
const authRouter = require("./routers/authRouter");
const categoryRouter = require("./routers/categoryRouter");
const productRouter = require("./routers/ProductRouter");

const app = express();

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: "Too many requests from this IP, please try again later",
});

app.use(cookieParser());
app.use(xssClean());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/seed", seedRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);

app.get("/", (req, res) => {
  res.send("Welcome to server");
});

app.get("/test", rateLimiter, (req, res) => {
  res.status(200).send({
    message: "api testing is working",
  });
});

// client error handling
app.use((req, res, next) => {
  next(createError(404, "route not found->client error handled"));
});

// server error handling => all the errors
app.use((err, req, res, next) => {
  // return res.status(err.status || 500).json({
  //   success: false,
  //   message: err.message,
  // });

  return errorResponse(res, { statusCode: err.status, message: err.message });
});

module.exports = app;
