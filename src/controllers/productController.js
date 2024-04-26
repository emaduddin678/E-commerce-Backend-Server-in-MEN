const createError = require("http-errors");

const { successResponse } = require("./responseController");
const { findWithId } = require("../services/findItem");
const Product = require("../models/productModel");
const { default: slugify } = require("slugify");
const {
  createProduct,
  getProducts,
  getProduct,
} = require("../services/productService");
const Category = require("../models/categoryModel");

const handleCreateProduct = async (req, res, next) => {
  try {
    const { name, description, price, quantity, shipping, category } = req.body;
    const image = req.file;

    if (!image) {
      throw createError(400, "Image file is required");
    }

    if (image.size > 1024 * 1024 * 2) {
      throw createError(
        400,
        "Image file is too large. It must be less than 2mb"
      );
    }

    const imageBufferString = image.buffer.toString("base64");

    const productData = {
      name,
      description,
      price,
      quantity,
      shipping,
      category,
      imageBufferString,
    };

    const product = await createProduct(productData);

    return successResponse(res, {
      statusCode: 200,
      message: `Product was created successfully.`,
      payload: { product },
    });
  } catch (error) {
    next(error);
  }
};

const handleGetProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const productsData = await getProducts(page, limit);

    return successResponse(res, {
      statusCode: 200,
      message: `Returned all the products.`,
      payload: {
        products: productsData.products,
        pagination: {
          totalPages: productsData.totalPages,
          currentPage: productsData.currentPage,
          previousPage: productsData.currentPage - 1,
          nextPage: productsData.currentPage + 1,
          totalNumberOfProducts: productsData.count,
        },
      },
    });
  } catch (error) {
    console.log("my error", error);
  }
};

const handleGetProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await getProductBySlug(slug);

    return successResponse(res, {
      statusCode: 200,
      message: `Returned single products.`,
      payload: { product },
    });
  } catch (error) {
    console.log("my error", error);
  }
};
const handleDeleteProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = deleteProductBySlug(slug);

    return successResponse(res, {
      statusCode: 200,
      message: `Product deleted successfully.`,
    });
  } catch (error) {
    console.log("my error", error);
  }
};

const handleUpdateProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const updateOptions = { new: true, runValidators: true, context: "query" };
    let updates = {};

    const allowedFields = [
      "name",
      "description",
      "price",
      "sold",
      "quantity",
      "shipping",
    ];
    for (const key in req.body) {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
      // } else if (key === "email") {
      //   throw createError(400, "Email can not be updated.");
      // }
    }

    const image = req.file;
    if (image) {
      if (image.size > 1024 * 1024 * 2) {
        throw createError(
          400,
          "Image file is too large. It must be less than 2mb"
        );
      }
      updates.image = image.buffer.toString("base64");
    }

    const updatedProduct = await Product.findOneAndUpdate(
      {slug},
      updates,
      updateOptions
    );

    if (!updatedProduct) {
      throw createError(404, "User with this id doesn't exists");
    }
    return successResponse(res, {
      statusCode: 202,
      message: "user was updated successfully",
      payload: {
        updatedProduct,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleCreateProduct,
  handleGetProducts,
  handleGetProduct,
  handleDeleteProduct,
  handleUpdateProduct,
};
