const express = require("express");
const {
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
} = require("../controllers/userController");
// const { uploadUserImage } = require("../middlewares/uploadFile");
const {
  validateUserRagistration,
  validateUserPasswordUpdate,
  validateUserForgetPassword,
  validateUserResetPassword,
} = require("../validators/auth");
const runValidation = require("../validators");
const { isLoggedIn, isLoggedOut, isAdmin } = require("../middlewares/auth");
const { uploadUserImage } = require("../middlewares/uploadFile");
const userRouter = express.Router();

userRouter.post(
  "/process-register",
  isLoggedOut,
  uploadUserImage.single("image"),
  validateUserRagistration,
  runValidation,
  handleProcessRegister
);
userRouter.post("/activate", isLoggedOut, handleActivateUserAccount);
userRouter.get("/", isLoggedIn, isAdmin, handleGetUsers);
userRouter.get("/:id([0-9a-fA-F]{24})", isLoggedIn, handleGetUserById);
userRouter.delete("/:id([0-9a-fA-F]{24})", isLoggedIn, handleDeleteUserById);
userRouter.put(
  "/reset-password",
  validateUserResetPassword,
  runValidation,
  handleResetPassword
);

userRouter.put(
  "/:id([0-9a-fA-F]{24})",
  isLoggedIn,
  uploadUserImage.single("image"),
  handleUpdateUserById
);

// userRouter.put(
//   "/ban-user/:id([0-9a-fA-F]{24})",
//   isLoggedIn,
//   isAdmin,
//   handleBanUserById
// );
// userRouter.put(
//   "/unban-user/:id([0-9a-fA-F]{24})",
//   isLoggedIn,
//   isAdmin,
//   handleUnbanUserById
// );

userRouter.put(
  "/manage-user/:id([0-9a-fA-F]{24})",
  isLoggedIn,
  isAdmin,
  handleManageUserStatusById
);

userRouter.post(
  "/forget-password",
  validateUserForgetPassword,
  runValidation,
  handleForgetPassword
);

userRouter.put(
  "/update-password/:id([0-9a-fA-F]{24})",
  validateUserPasswordUpdate,
  runValidation,
  isLoggedIn,
  handleUpdatePassword
);

module.exports = userRouter;
