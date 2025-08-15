import QRCode from 'qrcode';
import { Item } from "../models/Item.js";



// Get items list for QR generation (staff only)
// In qrController.js
export const getItemsForQRGeneration = async (req, res) => {
  try {
    // Get only active items with quantity > 0
    const items = await Item.find({ 
      quantity: { $gt: 0 },
      status: { $ne: 'inactive' } // if you have a status field
    }).select('_id name category quantity'); // Only select needed fields
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching items for QR generation:', error);
    res.status(500).json({ message: 'Server error while fetching items' });
  }
};

// Generate QR code data (staff only) - returns base64 image
export const generateQRCode = async (req, res) => {
  try {
    const { itemId } = req.body;
    
    if (!itemId) {
      return res.status(400).json({ 
        success: false,
        message: 'Item ID is required' 
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found' 
      });
    }

    // Generate QR code as base64 image
    const qrData = `${req.protocol}://${req.get('host')}/items/${item._id}`;
    const qrCode = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000', // QR code color
        light: '#ffffff' // Background color
      }
    });

    // Log the generation activity
    console.log(`QR Code generated for item ${item._id} by staff ${req.user.userId}`);

    res.json({
      success: true,
      qrCode, // Base64 encoded image
      qrData, // The actual data encoded in the QR
      itemDetails: {
        name: item.name,
        category: item.category,
        id: item._id,
        currentStock: item.quantity
      },
      generatedAt: new Date(),
      generatedBy: req.user.userId
    });
  } catch (error) {
    console.error('QR Generation Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating QR code',
      error: error.message 
    });
  }
};

// Add to controllers/qrController.js
export const logQRDownload = async (req, res) => {
  try {
    const { itemId, staffId } = req.body;
    
    // Here you would typically save to a database
    console.log(`QR Code downloaded for item ${itemId} by staff ${staffId}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Download Log Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};