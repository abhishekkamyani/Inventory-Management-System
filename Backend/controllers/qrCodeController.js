import { Inventory } from '../models/Inventory.js';

// Update inventory via QR code
export const scanQRCode = async (req, res) => {
  const { qrCode } = req.body;

  try {
    // Find the item by QR code
    const item = await Inventory.findOne({ qrCode });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update the item's quantity (example: increment by 1)
    item.quantity += 1;
    await item.save();

    res.status(200).json({ message: 'Inventory updated successfully', item });
  } catch (err) {
    res.status(500).json({ message: 'Error updating inventory', error: err.message });
  }
};