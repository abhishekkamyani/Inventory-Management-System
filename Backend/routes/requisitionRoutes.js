import express from "express";
import {
  createRequisition,
  approveRequisition,
  getRequisitions,getFacultyStats,
  getFacultyRecentRequisitions,getRequisitionHistory,
  cancelRequisition,rejectRequisition,fulfillRequisition
} from "../controllers/requisitionController.js";
import { verifyAuth, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create requisition (any authenticated user)
router.post("/", verifyAuth, createRequisition);

// Approve requisition (admin only)
router.patch("/:id/approve", verifyAuth, verifyAdmin, approveRequisition);
// Reject requisition (admin only)
router.patch("/:id/reject", verifyAuth, verifyAdmin, rejectRequisition);
// Fulfill requisition (admin only)
router.patch("/:id/fulfill", verifyAuth, verifyAdmin, fulfillRequisition);




// Get all requisitions (admin only)
router.get("/", verifyAuth, verifyAdmin, getRequisitions);



// Faculty-specific routes
router.get("/stats", verifyAuth, getFacultyStats);
router.get("/recent", verifyAuth, getFacultyRecentRequisitions);

// Protected routes (require authentication)
router.get('/history', verifyAuth, getRequisitionHistory);
router.patch('/:id/cancel', verifyAuth, cancelRequisition);

export default router;