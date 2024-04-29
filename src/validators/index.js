const { validationResult } = require("express-validator");
const { errorResponse } = require("../controllers/responseController");

const runValidation = async (req, res, next) => {
  // console.log("categoryName");
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array()[0].msg);
      return errorResponse(res, {
        statusCode: 422,
        message: errors.array()[0].msg,
      });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = runValidation;
