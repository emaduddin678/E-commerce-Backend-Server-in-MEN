const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const { findWithId } = require("../services/findItem");
const deleteImage = require("../helper/deleteImage");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const {
  jwtActivationKey,
  clientURL,
  jwtResetPasswordKey,
} = require("../secret");
const emailWithNodeMailer = require("../helper/email");
const bcrypt = require("bcryptjs");
const checkUserExists = require("../helper/checkUserExists");
const sendEmail = require("../helper/sendEmail");
const cloudinary = require("../config/cloudinary");
const {
  handleUserAction,
  findeUsers,
  findUserById,
  deleteUserById,
  updateUserById,
  updateUserPasswordById,
  forgetPasswordByEmail,
  resetPassword,
} = require("../services/userService");
// const mongoose = require("mongoose");
// const fs = require("fs").promises;

const handleGetUsers = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const { users, pagination } = await findeUsers(search, limit, page);

    return successResponse(res, {
      statusCode: 202,
      message: "users were returned successfully",
      payload: {
        users: users,
        pagination: pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleGetUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    // console.log(req.body.userId);
    // const filter = {
    //   _id: id,
    // };
    // const user = await User.find(filter);

    // finding in services for user
    const options = { password: 0 };
    // const user = await findWithId(User, id, options);
    const user = await findUserById(id, options);
    return successResponse(res, {
      statusCode: 202,
      message: "user was returned successfully",
      payload: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = { password: 0 };

    await deleteUserById(id, options);

    return successResponse(res, {
      statusCode: 202,
      message: "user was deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

const handleProcessRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const image = req.file?.path;

    if (image && image.size > 1024 * 1024 * 4) {
      throw createError(
        400,
        "Image file is too large. It must be less than 4mb"
      );
    }

    const userExists = await checkUserExists(email);

    if (userExists) {
      throw createError(
        409,
        "User with this email already exist. Please login"
      );
    }

    // create jwt
    const tokenPayload = {
      name,
      email,
      password,
      phone,
      address,
    };

    if (image) {
      tokenPayload.image = image;
    }

    const token = createJSONWebToken(tokenPayload, jwtActivationKey, "10m");

    //prepare email
    const emailData = {
      email,
      subject: "Account Activation Email",
      html: `
        <h2> Hello ${name} !</h2>
        <p> Please click here to link <a href="${clientURL}/api/users/activate/${token}" target="_blank"> activate your account </a></p>
      `,
    };

    //send email with nodemailer
    sendEmail(emailData);

    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} for completing your registration process`,
      payload: token,
    });
  } catch (error) {
    next(error);
  }
};

const handleActivateUserAccount = async (req, res, next) => {
  try {
    const token = req.body.token;

    if (!token) throw createError(404, "token not found!");

    try {
      const decoded = jwt.verify(token, jwtActivationKey);
      if (!decoded) throw createError(404, "user was not able to verified");

      const userExists = await User.exists({ email: decoded.email });
      if (userExists) {
        throw createError(
          409,
          "User with this email already exist. Please login"
        );
      }

      const image = decoded.image;
      if (image) {
        const response = await cloudinary.uploader.upload(
          image,
          {
            folder: "EcommerceImageServer/users",
          }
        );
        decoded.image = response.secure_url;
      }

      const user = await User.create(decoded);

      return successResponse(res, {
        statusCode: 201,
        message: `User was registration successfully`,
        payload: user,
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw createError(401, "Token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw createError(401, "Invalid Token");
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

const handleUpdateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const options = { password: 0 };
    const updatedUser = await updateUserById(req, userId, options);

    return successResponse(res, {
      statusCode: 202,
      message: "user was updated successfully",
      payload: {
        updatedUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

// const handleBanUserById = async (req, res, next) => {
//   try {
//     const userId = req.params.id;
//     await findWithId(User, userId);
//     const updates = { isBanned: true };
//     const updateOptions = { new: true, runValidators: true, context: "query" };

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       updates,
//       updateOptions
//     ).select("-password");

//     if (!updatedUser) {
//       throw createError(404, "User was not banned.");
//     }
//     return successResponse(res, {
//       statusCode: 202,
//       message: "user was banned successfully",
//       // payload: {
//       //   updatedUser,
//       // },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// const handleUnbanUserById = async (req, res, next) => {
//   try {
//     const userId = req.params.id;
//     await findWithId(User, userId);
//     const updates = { isBanned: false };
//     const updateOptions = { new: true, runValidators: true, context: "query" };

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       updates,
//       updateOptions
//     ).select("-password");

//     if (!updatedUser) {
//       throw createError(404, "User was not unbanned.");
//     }
//     return successResponse(res, {
//       statusCode: 202,
//       message: "user was unbanned successfully",
//       payload: {
//         updatedUser,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const handleManageUserStatusById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const action = req.body.action;
    // console.log(action);
    const actionInfo = await handleUserAction(action, userId);
    return successResponse(res, {
      statusCode: 202,
      message: actionInfo.successMessage,
      payload: actionInfo.updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

const handleUpdatePassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword, confirmedPassword } = req.body;

    const userId = req.params.id;

    const updatedUser = await updateUserPasswordById(
      userId,
      email,
      oldPassword,
      newPassword,
      confirmedPassword
    );

    return successResponse(res, {
      statusCode: 202,
      message: "user was updated successfully",
      payload: { updatedUser },
    });
  } catch (err) {
    next(err);
  }
};

const handleForgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const token = await forgetPasswordByEmail(email);

    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} to reset the password 
      `,
      payload: token,
    });
  } catch (err) {
    next(err);
  }
};

const handleResetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await resetPassword(token, password);

    return successResponse(res, {
      statusCode: 202,
      message: "Password reset successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleGetUsers,
  handleGetUserById,
  handleDeleteUserById,
  handleProcessRegister,
  handleActivateUserAccount,
  handleUpdateUserById,
  handleManageUserStatusById,
  handleUpdatePassword,
  handleForgetPassword,
  handleResetPassword,
};
