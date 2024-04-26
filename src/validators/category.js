const { body } = require("express-validator");

// Category validation
const validateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category Name is required.")
    .isLength({ min: 3 })
    .withMessage("Category Name should be at least 3 characters long"),
];

module.exports = {
  validateCategory,
};
