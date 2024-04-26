const User = require("../models/userModel");

const checkUserExists = async () => {
  return await User.exists({ email: email });
};

module.exports = checkUserExists;
