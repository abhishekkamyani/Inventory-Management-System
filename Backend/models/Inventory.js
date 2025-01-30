import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      minlength: [3, "Item name must be at least 3 characters long"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: ["Office Supplies", "Equipment", "Stationery", "Other"],
      default: "Office Supplies",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    minStockLevel: {
      type: Number,
      required: [true, "Minimum stock level is required"],
      min: [0, "Minimum stock level cannot be negative"],
    },
    qrCode: {
      type: String,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Method to check if stock is low
InventorySchema.methods.isLowStock = function () {
  return this.quantity <= this.minStockLevel;
};

// Create the Inventory model
const InventoryModel = mongoose.model("Inventory", InventorySchema);

export { InventoryModel as Inventory };