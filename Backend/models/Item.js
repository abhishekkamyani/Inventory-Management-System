import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      minlength: [3, "Item name must be at least 3 characters long"],
    },
    category: {
      type: String, // Changed from ObjectId to String
      required: [true, "Category is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    minStockLevel: {
      type: Number,
      required: [true, "Minimum stock level is required"],
      min: [0, "Minimum stock level cannot be negative"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    source: {
      type: String,
      enum: ["Main Campus", "Local Purchase"],
      default: "Main Campus",
    },
  },
  { timestamps: true }
);

// Create the Item model
const ItemModel = mongoose.model("Item", ItemSchema);

export { ItemModel as Item };
