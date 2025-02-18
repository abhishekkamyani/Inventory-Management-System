import mongoose from 'mongoose';

const SupplierMessageSchema = new mongoose.Schema(
  {
    supplier: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Unread', 'Read'],
      default: 'Unread',
    },
  },
  { timestamps: true }
);

// Create the SupplierMessage model
const SupplierMessageModel = mongoose.model('SupplierMessage', SupplierMessageSchema);

export { SupplierMessageModel as SupplierMessage };