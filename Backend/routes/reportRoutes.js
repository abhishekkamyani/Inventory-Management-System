import express from "express";
import {
  getInventoryReport,
  getRequisitionReport,
} from "../controllers/reportController.js";
import { generateRequisitionReport } from '../controllers/reportController.js';
import { verifyAuth } from "../middleware/authMiddleware.js";
const router = express.Router();

// Generate inventory report (e.g., low stock items)
router.get("/inventory", verifyAuth, getInventoryReport);


// Requisition Reports
router.get('/requisitions', generateRequisitionReport);
export default router;