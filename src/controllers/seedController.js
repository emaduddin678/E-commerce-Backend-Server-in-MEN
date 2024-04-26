// const createHttpError = require("http-errors");
const data = require("../data");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const seedUser = async (req, res, next) => {
  try {
    // deleting all existing user
    // console.log(User)
    await User.deleteMany({});
    // console.log(User)

    // inserting all new user
    const users = await User.insertMany(data.users);
    // console.log(users)

    // successful response
    return res.status(202).json(users);
  } catch (error) {
    next(error);
    // next(createHttpError(403, "route not found->client error handled"));
  }
};

const seedProducts = async (req, res, next) => {
  try {
    await Product.deleteMany({});

    const products = await Product.insertMany(data.products);

    return res.status(202).json(products);
  } catch (error) {
    next(error);
  }
};

module.exports = { seedUser, seedProducts };
