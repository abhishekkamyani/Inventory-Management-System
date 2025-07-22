import express from 'express';
import {
  getItemById,
  receiveStock,
  takeStock
} from '../controllers/itemController.js'; // Import your existing controllers

const router = express.Router();

// Route to get item details by ID (for QR scanner)
router.get('/:id', getItemById);




// Route to receive stock (add to inventory)
router.post('/receive', receiveStock);

// Route to take stock (remove from inventory)
router.post('/take', takeStock);

export default router;