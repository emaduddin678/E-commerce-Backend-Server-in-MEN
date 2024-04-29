const createError = require("http-errors");
const slugify = require("slugify");
const Product = require("../models/productModel");

const createProduct = async (productData) => {
  const {
    name,
    description,
    price,
    quantity,
    shipping,
    category,
    imageBufferString,
    categoryName,
  } = productData;

  const productExists = await Product.exists({ name: name });
  if (productExists) {
    throw createError(409, "Product with this name alrady exist. ");
  }

  const product = await Product.create({
    name: name,
    slug: slugify(name),
    description: description,
    price: price,
    quantity: quantity,
    shipping: shipping,
    image: imageBufferString,
    category: category,
    categoryName: categoryName,
  });

  return product;
};

const getProducts = async (page = 1, limit = 4) => {
  const products = await Product.find({})
    .populate("category")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (!products) {
    throw createError(404, "No product found");
  }
  const count = await Product.find({}).countDocuments();
  return {
    products,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  };
}; 

const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug }).populate("category");
  if (!product) {
    throw createError(404, "No product found");
  }

  return {
    product,
  };
};

const deleteProductBySlug = async (slug) => {
  const product = await Product.findOneAndDelete({ slug });
  // console.log(product)
  if (!product) {
    throw createError(404, "No product found when delete a single.");
  }
  return product;
};

module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  deleteProductBySlug,
};
