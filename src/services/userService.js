const mongoose = require("mongoose");
const createError = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const deleteImage = require("../helper/deleteImage");
const sendEmail = require("../helper/sendEmail");
const { jwtResetPasswordKey, clientURL } = require("../secret");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const {
  publicIdWithoutExtensionFromUrl,
  deleteFileFromCloudinary,
} = require("../helper/cloudinaryHelper");

const findeUsers = async (search, limit, page) => {
  try {
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

    return {
      users,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        previousPage: page - 1 > 0 ? page - 1 : null,
        nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
      },
    };
  } catch (error) {
    throw error;
  }
};

const findUserById = async (id, options = {}) => {
  try {
    const user = await User.findById(id, options);
    if (!user) {
      throw createError(404, "User not found!");
    }
    return user;
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(400, "Invalid Id");
    }
    throw error;
  }
};

const deleteUserById = async (id, options = {}) => {
  try {
    const existingUser = await User.findOne({
      _id: id,
    });

    if (existingUser && existingUser.image) {
      const publicId = await publicIdWithoutExtensionFromUrl(
        existingUser.image
      );

      await deleteFileFromCloudinary(publicId, "users", "User");
    }

    const user = await User.findByIdAndDelete({
      _id: id,
      isAdmin: false,
    });

    if (!user) {
      throw createError(404, "User not found you want to delete!");
    }

    return user;
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(400, "Invalid Id");
    }
    throw error;
  }
};

const updateUserById = async (req, userId, options = {}) => {
  try {
    const user = await findUserById(userId, options);
    const updateOptions = { new: true, runValidators: true, context: "query" };
    let updates = {};

    const allowedFields = ["name", "password", "phone", "address"];
    for (const key in req.body) {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      } else if (key === "email") {
        throw createError(400, "Email can not be updated.");
      }
    }

    const image = user.image;
    const updatedImage = req.file?.path;
    if (image) {
      
      if (image.size > 1024 * 1024 * 4) {
        throw createError(
          400,
          "Image file is too large. It must be less than 4mb"
        );
      } 
      const publicId = await publicIdWithoutExtensionFromUrl(image);
      // console.log(image);
      await deleteFileFromCloudinary(publicId, "users", "User");

      const response = await cloudinary.uploader.upload(updatedImage, {
        folder: "EcommerceImageServer/users",
      });
      // console.log("Hello Emad")

      updates.image = response.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      updateOptions
    ).select("-password");

    if (!updatedUser) {
      throw createError(404, "User with this id doesn't exists");
    }

    return updatedUser;
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(400, "Invalid Id");
    }
    throw error;
  }
};

const updateUserPasswordById = async (
  userId,
  email,
  oldPassword,
  newPassword,
  confirmedPassword
) => {
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      throw createError(401, "User is not found with this email!");
    }

    if (newPassword !== confirmedPassword) {
      throw createError(
        401,
        "new password and confirmed password did not match"
      );
    }
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

    return updatedUser;
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(400, "Invalid Id");
    }
    throw error;
  }
};

const forgetPasswordByEmail = async (email) => {
  try {
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

    return token;
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (token, password) => {
  try {
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
  } catch (error) {
    throw error;
  }
};

const handleUserAction = async (action, userId) => {
  try {
    let update;
    let successMessage;
    if (action === "ban") {
      update = { isBanned: true };
      successMessage = "user was banned successfully";
    } else if ((action = "unban")) {
      update = { isBanned: false };
      successMessage = "user was unbanned successfully";
    } else {
      throw createError(
        400,
        "Invalid action. Please Use ban or unban as action."
      );
    }

    const updateOptions = { new: true, runValidators: true, context: "query" };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      update,
      updateOptions
    ).select("-password");

    if (!updatedUser) {
      if (action === "ban") {
        throw createError(400, "User was not banned.");
      } else if ((action = "unban")) {
        throw createError(400, "User was not unbanned.");
      } else {
        throw createError(
          400,
          "Invalid action. Please Use ban or unban as action."
        );
      }
    }

    return { successMessage, updatedUser };
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(400, "Invalid Id");
    }
    throw error;
  }
};

module.exports = {
  findeUsers,
  findUserById,
  deleteUserById,
  updateUserById,
  updateUserPasswordById,
  forgetPasswordByEmail,
  resetPassword,
  handleUserAction,
};
