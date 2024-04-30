const { body } = require("express-validator");

// registration validation
const validateUserRagistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required. Enter your full name: ")
    .isLength({ min: 4, max: 31 })
    .withMessage("Name should be at least 4-31 characters long"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Enter your email: ")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required. Enter your password: ")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password should contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required. Enter your address: ")
    .isLength({ min: 4 })
    .withMessage("Address should be at minimum 4 characters long"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required. Enter your phone Number: "),
  body("image").optional().isString().withMessage("User image is optional"),
  // body("image")
  //   .custom((value, { req }) => {
  //     // console.log(req)
  //     if (!req.file || !req.file.buffer) {
  //       throw new Error("User image is required in validate condition");
  //     }
  //     return true;
  //   })
  //   .withMessage("User image is required in validation"),
];

// signin validation
const validateUserLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Enter your email: ")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required. Enter your password: ")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password should contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
];
// password validation
const validateUserPasswordUpdate = [
  body("oldPassword")
    .trim()
    .notEmpty()
    .withMessage("Old Password is required. Enter your old password: ")
    .isLength({ min: 6 })
    .withMessage("Old Password should be at least 6 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password should contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("newPassword is required. Enter your newPassword: ")
    .isLength({ min: 6 })
    .withMessage("newPassword should be at least 6 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "New Password should contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password did not match.");
    }
    return true;
  }),
];

// password validation
const validateUserForgetPassword = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Enter your email: ")
    .isEmail()
    .withMessage("Invalid email address"),
];

// reset password validation
const validateUserResetPassword = [
  body("token").trim().notEmpty().withMessage("Token is required."),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Old Password is required. Enter your old password: ")
    .isLength({ min: 6 })
    .withMessage("Old Password should be at least 6 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password should contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
];

module.exports = {
  validateUserRagistration,
  validateUserLogin,
  validateUserPasswordUpdate,
  validateUserForgetPassword,
  validateUserResetPassword,
};
