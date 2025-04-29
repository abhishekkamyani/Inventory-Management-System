import express from "express";
import {
  createRequisition,
  approveRequisition,
  getRequisitions,
  getFacultyStats,
  getFacultyRecentRequisitions,
  getRequisitionHistory,
  cancelRequisition,
  rejectRequisition,
  fulfillRequisition,
  getPendingRequisitionsCount,
  getApprovedRequisitions,getStaffFulfilledRequisitions,
  exportStaffRequisitionsReport
} from "../controllers/requisitionController.js";
import { verifyAuth, verifyAdmin, verifyStaff } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create requisition (any authenticated user)
router.post("/", verifyAuth, createRequisition);

// Approve requisition (admin only)
router.patch("/:id/approve", verifyAuth, verifyAdmin, approveRequisition);

// Reject requisition (admin only)
router.patch("/:id/reject", verifyAuth, verifyAdmin, rejectRequisition);

// Fulfill requisition (staff only) - Changed from admin to staff
router.patch("/:id/fulfill", verifyAuth, verifyStaff, fulfillRequisition);
// Add these new routes
router.get('/staff/fulfilled', verifyAuth, verifyStaff, getStaffFulfilledRequisitions);
router.get('/staff/export', verifyAuth, verifyStaff, exportStaffRequisitionsReport);


// Get all requisitions (admin only)
router.get("/", verifyAuth, verifyAdmin, getRequisitions);

// Get pending requisitions count (admin only)
router.get("/pending-count", verifyAuth, verifyAdmin, getPendingRequisitionsCount);

// Faculty-specific routes
router.get("/stats", verifyAuth, getFacultyStats);
router.get("/recent", verifyAuth, getFacultyRecentRequisitions);

// Protected routes (require authentication)
router.get('/history', verifyAuth, getRequisitionHistory);
router.patch('/:id/cancel', verifyAuth, cancelRequisition);

// Staff routes
router.get('/approved', verifyAuth, verifyStaff, getApprovedRequisitions);

export default router;