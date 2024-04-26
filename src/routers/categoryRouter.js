const express = require("express");

const runValidation = require("../validators");
const { isLoggedIn, isLoggedOut, isAdmin } = require("../middlewares/auth");
const { validateCategory } = require("../validators/category");
const {
  handleCreateCategory,
  handleGetCategories,
  handleGetCategory,
  handleUpdatetCategory,
  handleDeleteCategory,
} = require("../controllers/categoryController");
const categoryRouter = express.Router();

// post /api/categories
categoryRouter.post(
  "/",
  validateCategory,
  runValidation,
  isLoggedIn,
  isAdmin,
  handleCreateCategory
);

// get /api/categories
categoryRouter.get("/", handleGetCategories);
categoryRouter.get("/:slug", handleGetCategory);
categoryRouter.put(
  "/:slug",
  validateCategory,
  runValidation,
  isLoggedIn,
  isAdmin,
  handleUpdatetCategory
);
categoryRouter.delete(
  "/:slug",
  isLoggedIn,
  isAdmin,
  handleDeleteCategory
);

module.exports = categoryRouter;
