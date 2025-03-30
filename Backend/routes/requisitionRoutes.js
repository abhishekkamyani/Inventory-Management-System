import express from "express";
import {
  createRequisition,
  approveRequisition,
  getRequisitions,getFacultyStats,
  getFacultyRecentRequisitions
} from "../controllers/requisitionController.js";
import { verifyAuth, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create requisition (any authenticated user)
router.post("/", verifyAuth, createRequisition);

// Approve requisition (admin only)
router.put("/:id/approve", verifyAuth, verifyAdmin, approveRequisition);

// Get all requisitions (admin only)
router.get("/", verifyAuth, verifyAdmin, getRequisitions);



// Faculty-specific routes
router.get("/stats", verifyAuth, getFacultyStats);
router.get("/recent", verifyAuth, getFacultyRecentRequisitions);

export default router;