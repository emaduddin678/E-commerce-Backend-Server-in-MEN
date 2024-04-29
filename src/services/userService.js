const createHttpError = require("http-errors");
const User = require("../models/userModel");

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
      throw createHttpError(
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
        throw createHttpError(400, "User was not banned.");
      } else if ((action = "unban")) {
        throw createHttpError(400, "User was not unbanned.");
      } else {
        throw createHttpError(
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

module.exports = { handleUserAction };
