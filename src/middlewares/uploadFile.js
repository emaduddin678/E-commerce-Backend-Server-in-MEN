const multer = require("multer");
// const path = require("path");
// require("dotenv").config();
// const createError = require("http-errors");
const {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  UPLOAD_USER_IMG_DIRECTORY,
  UPLOAD_PRODUCT_IMG_DIRECTORY,
} = require("../config");
// const {
//   ALLOWED_FILE_TYPES,
//   MAX_FILE_SIZE,
// } = require("../config");

// const storage = multer.memoryStorage();

// for image as string
const userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_USER_IMG_DIRECTORY);
  },
  filename: function (req, file, cb) {
    // console.log(file);
    // const extname = path.extname(file.originalname);
    // console.log(extname);
    cb(
      null,
      "savedAt=" +
        new Date().toLocaleDateString().replace(/\//g, "-") +
        "_at_" +
        new Date().toLocaleTimeString().replace(/[: ]/g, "_") +
        "-originalName=" +
        file.originalname
    );
  },
});
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_PRODUCT_IMG_DIRECTORY);
  },
  filename: function (req, file, cb) {
    // console.log(file);
    // const extname = path.extname(file.originalname);
    // console.log(extname);
    cb(
      null,
      "savedAt=" +
        new Date().toLocaleDateString().replace(/\//g, "-") +
        "_at_" +
        new Date().toLocaleTimeString().replace(/[: ]/g, "_") +
        "-originalName=" +
        file.originalname
    );
  },
});

// const fileFilter = (req, file, cb) => {
//   const extname = path.extname(file.originalname);
//   if (!ALLOWED_FILE_TYPES.includes(extname.substring(1))) {
//     return cb(new Error("File type not allowed"), false);
//   }
//   cb(null, true);
// };

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: MAX_FILE_SIZE },
//   fileFilter,
// });

const fileFilter = (req, file, cb) => {
  // if (!file.mimetype.startsWith("image/")) {
  //   return cb(new Error("Only image files are allowed"), false);
  // }
  // if (file.size > MAX_FILE_SIZE) {
  //   return cb(new Error("File size exceeds the maximum limit"), false);
  // }
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(new Error("File extension is not allowed"), false);
  }
  cb(null, true);
};

const uploadUserImage = multer({ 
  storage: userStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter,
});

const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter,
});

module.exports = {
  uploadUserImage,
  uploadProductImage,
};
