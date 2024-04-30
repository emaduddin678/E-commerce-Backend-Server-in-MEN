const createError = require("http-errors");
const User = require("../models/userModel");
const deleteImage = require("../helper/deleteImage");

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
    throw error;
  }
};

const deleteUserById = async (id, options = {}) => {
  try {
    const user = await User.findByIdAndDelete({
      _id: id,
      isAdmin: false,
    });

    if (!user) {
      throw createError(404, "User not found you want to delete!");
    }

    if (user && user.image) {
      await deleteImage(user.image);
    }

    return user;
  } catch (error) {
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
      user.image !== "default.jpg" && deleteImage(user.image);
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
    throw error;
  }
};

module.exports = {
  findeUsers,
  findUserById,
  deleteUserById,
  updateUserById,
  handleUserAction,
};
