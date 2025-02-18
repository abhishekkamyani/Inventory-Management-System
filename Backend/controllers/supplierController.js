import { SupplierMessage } from '../models/SupplierMessage.js';

// Fetch all supplier messages
export const getSupplierMessages = async (req, res) => {
  try {
    const messages = await SupplierMessage.find({}).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching supplier messages', error: err.message });
  }
};

// Add a new supplier message
export const addSupplierMessage = async (req, res) => {
  const { supplier, message } = req.body;

  try {
    const newMessage = new SupplierMessage({ supplier, message });
    await newMessage.save();
    res.status(201).json({ message: 'Supplier message added successfully', newMessage });
  } catch (err) {
    res.status(500).json({ message: 'Error adding supplier message', error: err.message });
  }
};

// Update message status (e.g., mark as Read)
export const updateMessageStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedMessage = await SupplierMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.status(200).json({ message: 'Message status updated successfully', updatedMessage });
  } catch (err) {
    res.status(500).json({ message: 'Error updating message status', error: err.message });
  }
};