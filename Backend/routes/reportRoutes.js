import express from "express";
import {
  getInventoryReport,
  getRequisitionReport,
} from "../controllers/reportController.js";

import { verifyAuth } from "../middleware/authMiddleware.js";
const router = express.Router();

// Generate inventory report (e.g., low stock items)
router.get("/inventory", verifyAuth, getInventoryReport);

// Generate requisition report (e.g., pending requisitions)
router.get("/requisitions", verifyAuth, getRequisitionReport);

export default router;