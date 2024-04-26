const createHttpError = require("http-errors");
const Category = require("../models/categoryModel");
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../services/categoryService");
const { successResponse } = require("./responseController");
const { findWithId } = require("../services/findItem");
// const slugify = require("slugify");

const handleCreateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const newCategory = await createCategory(name);

    return successResponse(res, {
      statusCode: 200,
      message: `categoy is created successfully`,
      payload: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetCategories = async (req, res, next) => {
  try {
    // const { name } = req.params;
    // const allData = await Category.find();
    const categories = await getCategories();

    return successResponse(res, {
      statusCode: 200,
      message: `Categoies fetched successfully`,
      payload: categories,
    });
  } catch (error) {
    next(error);
  }
};
const handleGetCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await getCategory(slug);

    if (!category) {
      return createHttpError(401, "Category not found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Category fetched successfully`,
      payload: category,
    });
  } catch (error) {
    next(error);
  }
};

const handleUpdatetCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { name } = req.body;
    const updatedCategory = await updateCategory(slug, name);

    if (!updatedCategory) {
      return createHttpError(401, "Category not found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Category was update successfully`,
      payload: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await deleteCategory(slug);

     if (!result) {
       return createHttpError(401, "Category not found");
     }

    return successResponse(res, {
      statusCode: 200,
      message: `Category deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateCategory,
  handleGetCategories,
  handleGetCategory,
  handleUpdatetCategory,
  handleDeleteCategory,
};
