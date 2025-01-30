import mongoose from "mongoose";

const RequisitionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester is required"],
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: [true, "Item is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Method to check if requisition is approved
RequisitionSchema.methods.isApproved = function () {
  return this.status === "Approved";
};

// Create the Requisition model
const RequisitionModel = mongoose.model("Requisition", RequisitionSchema);

export { RequisitionModel as Requisition };