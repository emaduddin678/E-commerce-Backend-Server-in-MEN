const createHttpError = require("http-errors");
const { default: mongoose } = require("mongoose");

const findWithId = async (Model, id, options = {}) => {
  try {
    const item = await Model.findById(id, options); 

    if (!item) {
      throw createHttpError(404, `${Model.modelName} does not found for id = ${id}`);
    }
    return item;
  } catch (error) {
    if (error instanceof mongoose.Error) {
      throw createHttpError(400, "Invalid item id");
    }
    throw error;
  }
};

module.exports = { findWithId };
