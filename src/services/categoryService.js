const Category = require("../models/categoryModel");
const slugify = require("slugify");

const createCategory = async (name) => {
  const newCategory = await Category.create({
    name: name,
    slug: slugify(name),
  });
  return newCategory;
};

const getCategories = async () => {
  return await Category.find({}).select("name slug").lean();
};
const getCategory = async (slug) => {
  return await Category.find({ slug }).select("name slug").lean();
};

const updateCategory = async (slug, name) => {
  const updatedCategory = await Category.findOneAndUpdate(
    { slug: slug }, // Find category by slug
    { $set: { name: name, slug: slugify(name) } }, // Update name and slug
    { new: true } // Return the updated category
  ).lean();

  return updatedCategory;
};

const deleteCategory = async (slug) => {
  const result = await Category.findOneAndDelete({ slug });
  return result;
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
