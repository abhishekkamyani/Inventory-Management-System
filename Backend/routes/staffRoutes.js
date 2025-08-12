import express from 'express';
import {
  getStockLevels,
  getLowStockItems,
} from '../controllers/stockController.js';
// import {
//   submitRequisition,
//   getRequisitions,
// } from '../controllers/requisitionController.js'; 
import { getSupplierMessages } from '../controllers/supplierController.js';
import { scanQRCode } from '../controllers/qrCodeController.js';
import { getApprovedRequisitionsCount } from '../controllers/requisitionController.js';



const router = express.Router();

// Stock routes
router.get('/stock-levels', getStockLevels);
router.get('/low-stock', getLowStockItems);

// // Requisition routes
// router.post('/requisitions', submitRequisition);
// router.get('/requisitions', getRequisitions);

// Supplier routes
router.get('/supplier-messages', getSupplierMessages);

// Add this route to your existing staffRoutes.js
router.get('/approved-requisitions-count', getApprovedRequisitionsCount);

// QR code routes
router.post('/scan-qr', scanQRCode);

export default router;