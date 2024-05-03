const createError = require("http-errors");

const { successResponse } = require("./responseController");
const { findWithId } = require("../services/findItem");
const Product = require("../models/productModel");
const { default: slugify } = require("slugify");
const {
  createProduct,
  getProducts,
  getProductBySlug,
  deleteProductBySlug,
  updatedProductBySlug,
} = require("../services/productService");
const Category = require("../models/categoryModel");
const cloudinary = require("../config/cloudinary");

const handleCreateProduct = async (req, res, next) => {
  try {
    const { name, description, price, quantity, shipping, category } = req.body;

    const image = req.file?.path;

    if (image && image.size > 1024 * 1024 * 4) {
      throw createError(
        400,
        "Image file is too large. It must be less than 4mb"
      );
    }

    // This is my checking for productExists
    const productExists = await Product.exists({ slug: slugify(name) });

    if (productExists) {
      throw createError(
        409,
        "Product with the same name already exist. Please change the model number or anything!"
      );
    }
    // End of my checking for productExists

    // const imageBufferString = image.buffer.toString("base64");

    const productData = {
      name,
      description,
      price,
      quantity,
      shipping,
      category,
    };

    if (image) {
      const response = await cloudinary.uploader.upload(image, {
        folder: "EcommerceImageServer/products",
      });

      productData.image = response.secure_url;
    }

    const product = await createProduct(productData);

    return successResponse(res, {
      statusCode: 200,
      message: `Product was created successfully.`,
      payload: product,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetProducts = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const searchRegExp = new RegExp(".*" + search + ".*", "i");
    const filter = {
      $or: [{ name: { $regex: searchRegExp } }],
    };
    console.log(searchRegExp);

    const productsData = await getProducts(page, limit, filter);

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
    await deleteProductBySlug(slug);
    // console.log(product)

    return successResponse(res, {
      statusCode: 200,
      message: `Product deleted successfully.`,
    });
  } catch (error) {
    next(error);
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
        if (key === "name") {
          updates.slug = slugify(req.body[key]);
        }
        updates[key] = req.body[key];
      }
    }

    const image = req.file?.path;

    const updatedProduct = await updatedProductBySlug(
      slug,
      updates,
      image,
      updateOptions
    );

    return successResponse(res, {
      statusCode: 202,
      message: "Product was updated successfully",
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
