import express from "express";
import {
  getInventoryReport,
  getRequisitionReport,
} from "../controllers/reportController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate inventory report (e.g., low stock items)
router.get("/inventory", authMiddleware, getInventoryReport);

// Generate requisition report (e.g., pending requisitions)
router.get("/requisitions", authMiddleware, getRequisitionReport);

export default router;