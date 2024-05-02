const express = require("express");

const { uploadProductImage } = require("../middlewares/uploadFile");

const { isLoggedIn, isLoggedOut, isAdmin } = require("../middlewares/auth");
const runValidation = require("../validators");
const {
  handleCreateProduct,
  handleGetProducts,
  handleGetProduct,
  handleDeleteProduct,
  handleUpdateProduct,
} = require("../controllers/productController");
const { validateProduct } = require("../validators/product");
const productRouter = express.Router();

// post: api/products
productRouter.post(
  "/",
  uploadProductImage.single("image"),
  validateProduct,
  runValidation,
  isLoggedIn,
  isAdmin,
  handleCreateProduct
);

// get product all product
productRouter.get("/", handleGetProducts);
// get product single product
productRouter.get("/:slug", handleGetProduct);
productRouter.delete("/:slug", isLoggedIn, isAdmin, handleDeleteProduct);
productRouter.put(
  "/:slug",
  uploadProductImage.single("image"),
  isLoggedIn,
  isAdmin,
  handleUpdateProduct
);

module.exports = productRouter;
