import mongoose from "mongoose";

const RequisitionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    purpose: { type: String, required: true }
  }],
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Fulfilled"],
    default: "Pending"
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String
}, { timestamps: true });

export const Requisition = mongoose.model("Requisition", RequisitionSchema);