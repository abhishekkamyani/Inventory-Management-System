import express from 'express';
import {
  getSupplierMessages,
  addSupplierMessage,
  updateMessageStatus,
} from '../controllers/supplierController.js';

const router = express.Router();

// Fetch all supplier messages
router.get('/supplier-messages', getSupplierMessages);

// Add a new supplier message
router.post('/supplier-messages', addSupplierMessage);

// Update message status
router.put('/supplier-messages/:id', updateMessageStatus);

export default router;