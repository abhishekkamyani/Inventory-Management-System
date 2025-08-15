import express from 'express';
import {
  getItemById,
  receiveStock,
  takeStock
} from '../controllers/itemController.js'; // Import your existing controllers

import {
  getItemsForQRGeneration,
  generateQRCode,logQRDownload
} from '../controllers/qrController.js';
import { verifyAuth, verifyStaff } from '../middleware/authMiddleware.js';


const router = express.Router();

// Route to get item details by ID (for QR scanner)
router.get('/:id', getItemById);

// Get items list for QR generation (staff only)
router.get('/items/list', verifyAuth, verifyStaff, getItemsForQRGeneration);

// Generate QR code data (staff only)
router.post('/generate', verifyAuth, verifyStaff, generateQRCode);

router.post('/log-download', verifyAuth, verifyStaff, logQRDownload);


// Route to receive stock (add to inventory)
router.post('/receive', receiveStock);

// Route to take stock (remove from inventory)
router.post('/take', takeStock);

export default router;