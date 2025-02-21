import QRCode from 'qrcode';
import { Item } from "../models/Item.js";

// Generate QR code for an item
export const generateQRCode = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Generate QR code using the item's _id
    const qrCodeData = await QRCode.toDataURL(item._id.toString());
    res.json({ qrCodeData });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Server error' });
  }
};