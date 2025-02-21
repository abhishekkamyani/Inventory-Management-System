import express from 'express';
import {
  getItemById,
  updateStockLevels,
} from '../controllers/itemController.js'; // Import your existing controllers

const router = express.Router();

// Route to get item details by ID (for QR scanner)
router.get('/:id', getItemById);

// Route to update stock levels after scanning (for QR scanner)
router.post('/scan', updateStockLevels);

export default router;