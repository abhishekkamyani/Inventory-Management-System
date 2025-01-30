import express from "express";
import {
  getRequisitions,
  getRequisitionById,
  createRequisition,
  updateRequisition,
  deleteRequisition,
  getRequisitionStats
} from "../controllers/requisitionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();


// Requisition stats route
router.get('/stats', getRequisitionStats);

// Fetch all requisitions
router.get("/", authMiddleware, getRequisitions);

// Fetch a specific requisition by ID
router.get("/:id", authMiddleware, getRequisitionById);

// Create a new requisition
router.post("/", authMiddleware, createRequisition);

// Update a requisition (e.g., approve/reject)
router.put("/:id", authMiddleware, updateRequisition);

// Delete a requisition
router.delete("/:id", authMiddleware, deleteRequisition);

export default router;