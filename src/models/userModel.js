const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const { defaultImagePath } = require("../secret.js");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minlength: [4, "User name must be at least 4 characters"],
      maxlength: [31, "User name must be at most 31 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10)),
    },
    image: {
      // type: Buffer,
      // contentType: String,
      // required: [true, "User Image is required"],
      type: String,
      default: defaultImagePath,
    },
    address: {
      type: String,
      required: [true, "User address is required"],
      minlength: [4, "Address can be at minimum 4 characters"],
    },
    phone: {
      type: String,
      required: [true, "User phone is required"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = model("Users", userSchema);
module.exports = User;
