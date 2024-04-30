const { body } = require("express-validator");

// registration validation
const validateProduct = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product Name is required.")
    .isLength({ min: 4, max: 150 })
    .withMessage("Product Name should be at least 4-150 characters long"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required.")
    .isLength({ min: 4 })
    .withMessage("Description should be at least 4 characters long"),
  body("price")
    .trim()
    .notEmpty()
    .withMessage("price is required.")
    .isLength({ min: 0 })
    .withMessage("price must be a positive number"),
  body("category").trim().notEmpty().withMessage("Category is required."),
  body("quantity")
    .trim()
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("categoryName")
    .trim()
    .notEmpty()
    .withMessage("Category name is required. validate: categoryName"),
];

module.exports = {
  validateProduct,
};