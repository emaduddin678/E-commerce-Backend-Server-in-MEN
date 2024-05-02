const { Schema, model } = require("mongoose");
const { defaultImagePath } = require("../secret");

// name, slug, description, price, quantity, sold, shipping, image
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "product name is required"],
      trim: true,
      unique: true,
      minlength: [4, "product name must be at least 4 characters"],
      maxlength: [150, "product name can be at maximum 150 characters"],
    },
    slug: {
      type: String,
      required: [true, "product slug is required"],
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "product description is required"],
      trim: true,
      minlength: [4, "product description must be at least 4 characters"],
    },
    price: {
      type: Number,
      required: [true, "product price is required"],
      trim: true,
      validate: {
        validator: (v) => v > 0,
        message: (props) => {
          `${props.value} is not a valid price! Price must be greater than 0.`;
        },
      },
    },
    quantity: {
      type: Number,
      required: [true, "product quantity is required"],
      trim: true,
      validate: {
        validator: (v) => v > 0,
        message: (props) => {
          `${props.value} is not a valid quantity! quantity must be greater than 0.`;
        },
      },
    },
    sold: {
      type: Number,
      required: [true, "product sold is required"],
      trim: true,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0, // shipping free 0 or paid
    },
    image: {
      // type: Buffer,
      // contentType: String,
      // required: [true, "Product Image is required"],
      type: String,
      default: defaultImagePath,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

const Product = model("Product", productSchema);
module.exports = Product;
