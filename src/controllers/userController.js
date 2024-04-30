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
const { handleUserAction } = require("../services/userService");
// const mongoose = require("mongoose");
// const fs = require("fs").promises;

const handleGetUsers = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const searchRegExp = new RegExp(".*" + search + ".*", "i");
    // console.log(typeof search);

    const filter = {
      isAdmin: { $ne: true },
      $or: [
        { name: { $regex: searchRegExp } },
        { email: { $regex: searchRegExp } },
        { phone: { $regex: searchRegExp } },
      ],
    };
    const options = { password: 0 };

    const users = await User.find(filter, options)
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await User.find(filter).countDocuments();

    if (!users || users.length === 0) throw createError(404, "no users found");

    return successResponse(res, {
      statusCode: 202,
      message: "users were returned successfully",
      payload: {
        users,
        pagination: {
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          previousPage: page - 1 > 0 ? page - 1 : null,
          nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
        },
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
    const user = await findWithId(User, id, options);
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
    const user = await findWithId(User, id, options);

    // const userImagePath = user.image;
    // deleteImage(userImagePath);
    // fs.access(userImagePath)
    //   .then(() => {
    //     fs.unlink(userImagePath);
    //   })
    //   .then(() => {
    //     console.log("User image was deleted");
    //   }).catch(err =>{
    //     console.error("User image does not exist");
    //   });

    // fs.access(userImagePath, (err) => {
    //   if (err) {
    //     console.error("User image does not exist");
    //   } else {
    //     fs.unlink(userImagePath, (err) => {
    //       if (err) {
    //         throw err;
    //       }
    //     });
    //   }
    // }); 

    await User.findByIdAndDelete({
      _id: id,
      isAdmin: false,
    });

    if(user && user.image) {
      await deleteImage(user.image)
    }

    return successResponse(res, {
      statusCode: 202,
      message: "user was deleted successfully",
      payload: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

const handleProcessRegister = async (req, res, next) => {
  // console.log("emad 1");
  try {
    const { name, email, password, phone, address } = req.body;
    // res.send(req.body);
    // console.log("emad 2");

    const image = req.file?.path;
    
    if (image && image.size > 1024 * 1024 * 4) {
      throw createError(
        400,
        "Image file is too large. It must be less than 4mb"
      );
    }
    // console.log("emad 3");

    // const imageBufferString = image.buffer.toString("base64");

    const userExists = await checkUserExists(email);

    if (userExists) {
      throw createError(
        409,
        "User with this email already exist. Please login"
      );
    }
    // console.log("emad 4");

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
    // console.log("emai emad");

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

      await User.create(decoded);

      return successResponse(res, {
        statusCode: 201,
        message: `User was registration successfully`,
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
    const user = await findWithId(User, userId, options);
    const updateOptions = { new: true, runValidators: true, context: "query" };
    let updates = {};

    // if (req.body.name) {
    //   updates.name = req.body.name;
    // }
    // if (req.body.password) {
    //   updates.password = req.body.password;
    // }
    // if (req.body.phone) {
    //   updates.phone = req.body.phone;
    // }
    // if (req.body.address) {
    //   updates.address = req.body.address;
    // }
    const allowedFields = ["name", "password", "phone", "address"];
    for (const key in req.body) {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      } else if (key === "email") {
        throw createError(400, "Email can not be updated.");
      }
    }

    const image = req.file?.path;
    if (image) {
      if (image.size > 1024 * 1024 * 4) {
        throw createError(
          400,
          "Image file is too large. It must be less than 4mb"
        );
      }
      // updates.image = image.buffer.toString("base64");
      updates.image = image;
      user.image !== "default.jpg" && deleteImage(user.image)
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      updateOptions
    ).select("-password");

    if (!updatedUser) {
      throw createError(404, "User with this id doesn't exists");
    }
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
    const { oldPassword, newPassword } = req.body;

    const userId = req.params.id;
    const user = await findWithId(User, userId);

    // compare the password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      throw createError(401, "Old password is incorrect");
    }

    // const filter = { userId };
    // const updates = { $set: { password: newPassword } };
    // const updateOptions = {new: true}

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: newPassword },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      throw createError(400, "User was not updated successfully");
    }

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
    const userData = await User.findOne({ email: email });
    if (!userData) {
      throw createError(
        404,
        "Email is incorrect or you have not verified your email address. Please register yourself first."
      );
    }

    // create jwt
    const token = createJSONWebToken({ email }, jwtResetPasswordKey, "10m");

    //prepare email
    const emailData = {
      email,
      subject: "Reset Password Email",
      html: `
        <h2> Hello ${userData.name} !</h2>
        <p> Please click here to link <a href="${clientURL}/api/users/reset-password/${token}" target="_blank"> Reset your Password </a></p>
      `,
    };

    //send email with nodemailer
    sendEmail(emailData);

    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} to reset the password 
      `,
      payload: { token },
    });
  } catch (err) {
    next(err);
  }
};

const handleResetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, jwtResetPasswordKey);

    if (!decoded) {
      throw createError(400, "Invalid or expired token.");
    }

    const filter = { email: decoded.email };
    const update = { password: password };
    const options = { new: true };
    const updatedUser = await User.findOneAndUpdate(
      filter,
      update,
      options
    ).select("-password");

    if (!updatedUser) {
      throw createError(400, "Password reset failed");
    }

    return successResponse(res, {
      statusCode: 202,
      message: "Password reset successfully",
      payload: {},
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
