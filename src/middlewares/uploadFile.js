const multer = require("multer");
const {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  // UPLOAD_USER_IMG_DIRECTORY,
  // UPLOAD_PRODUCT_IMG_DIRECTORY,
} = require("../config");

const userStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, UPLOAD_USER_IMG_DIRECTORY);
//   },
  filename: function (req, file, cb) {
    cb(
      null,
        new Date().toLocaleTimeString().replace(/[: ]/g, "_") +
        "-" +
        file.originalname
    );
  },
});
const productStorage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, UPLOAD_PRODUCT_IMG_DIRECTORY);
  // },
  filename: function (req, file, cb) {
    cb(
      null,
        new Date().toLocaleTimeString().replace(/[: ]/g, "_") +
        "-" +
        file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {

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
