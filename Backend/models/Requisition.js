import mongoose from "mongoose";

const RequisitionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedBy: {
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
  approvedAt: {  // Tracks last status change (for any status)
    type: Date,
    default: null
  },
  fulfilledAt: {  // Tracks last status change (for any status)
    type: Date,
    default: null
  },
  rejectedAt: {  // Tracks last status change (for any status)
    type: Date,
    default: null
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  rejectionReason: String
}, { timestamps: true });

// Auto-update `statusUpdatedAt` when status changes
RequisitionSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusUpdatedAt = new Date();
  }
  next();
});

export const Requisition = mongoose.model("Requisition", RequisitionSchema);