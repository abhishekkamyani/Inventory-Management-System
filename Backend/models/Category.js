import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Category name must be at least 3 characters long"],
    },
  },
  { timestamps: true }
);

// Create the Category model
const CategoryModel = mongoose.model("Category", CategorySchema);

export { CategoryModel as Category };