const createError = require("http-errors");
const slugify = require("slugify");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const deleteImage = require("../helper/deleteImage");
const {
  publicIdWithoutExtensionFromUrl,
  deleteFileFromCloudinary,
} = require("../helper/cloudinaryHelper");
const cloudinary = require("../config/cloudinary");

const createProduct = async (productData) => {
  const { name, description, price, quantity, shipping, category, image } =
    productData;

  const productExists = await Product.exists({ name: name });
  if (productExists) {
    throw createError(409, "Product with this name alrady exist. ");
  }

  const categoryObject = await Category.findById(category);

  const product = await Product.create({
    name: name,
    slug: slugify(name),
    description: description,
    price: price,
    quantity: quantity,
    shipping: shipping,
    image: image,
    category: category,
    categoryName: categoryObject.name,
  });

  return product;
};

const getProducts = async (page = 1, limit = 4, filter = {}) => {
  const products = await Product.find(filter)
    .populate("category")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (!products) {
    throw createError(404, "No product found");
  }
  const count = await Product.find(filter).countDocuments();
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
  try {
    const existingProduct = await Product.findOne({
      slug,
    });

    if (existingProduct && existingProduct.image) {
      const publicId = await publicIdWithoutExtensionFromUrl(
        existingProduct.image
      );

      await deleteFileFromCloudinary(publicId, "products", "Product");
    }
    const product = await Product.findOneAndDelete({ slug });

    if (!product) {
      throw createError(404, "No product found with this slug.");
    }

    return product;
  } catch (error) {
    throw error;
  }
};

const updatedProductBySlug = async (slug, updates, image, updateOptions) => {
  try {
    const product = await Product.findOne({ slug: slug });

    if (!product) {
      throw createError(404, "This Product doesn't exists");
    }

    if (product && product.image) {
      const publicId = await publicIdWithoutExtensionFromUrl(product.image);

      if (!publicId) {
        throw createError(404, "Public Id for this product not found!");
      }

      await deleteFileFromCloudinary(publicId, "products", "Product");
    }
    if (image) {
      if (image.size > 1024 * 1024 * 4) {
        throw createError(
          400,
          "Image file is too large. It must be less than 4mb"
        );
      }
      const response = await cloudinary.uploader.upload(image, {
        folder: "EcommerceImageServer/products",
      });

      updates.image = response.secure_url;
    }

    

    const updatedProduct = await Product.findOneAndUpdate(
      { slug },
      updates,
      updateOptions
    );

    if (!updatedProduct) {
      throw createError(
        404,
        "For some Issue Product with this id is not possible to update!!"
      );
    }

    return updatedProduct;
  } catch (error) {
    throw createError(404, "product could not update in services!");
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  deleteProductBySlug,
  updatedProductBySlug,
};
