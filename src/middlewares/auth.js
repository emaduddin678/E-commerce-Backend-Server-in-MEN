const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const { jwtAccessKey } = require("../secret");

const isLoggedIn = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      throw createError(401, "Access token not found! Please login again.");
    }
    
    const decoded = jwt.verify(accessToken, jwtAccessKey);
    if (!decoded) {
      throw createError(401, "Invalid access token. Please login again.");
    }
    // req.body.userId = decoded._id;
    req.user = decoded;
    
    next();
    
  } catch (error) {
    return next(error);
  }
};

const isLoggedOut = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (accessToken) {
      try{const decoded = jwt.verify(accessToken, jwtAccessKey);
      if (decoded) {
        throw createError(400, "User is already logged in.");
      }}catch(error) {
        throw error;
      }
    }

    next();
  } catch (error) {
    return next(error);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    // console.log("Admin refresh token  => " + req.user.isAdmin);
    // console.log("Admin login token  => " + req.user.user.isAdmin);

    if (!req.user.user.isAdmin) {
      throw createError(
        403,
        "Forbidden. You must be an admin to access this resources."
      );
    }

    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { isLoggedIn, isLoggedOut, isAdmin };
