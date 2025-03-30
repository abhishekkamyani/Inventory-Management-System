// import express from "express";
// import {
//   getRequisitions,
//   getRequisitionById,
//   createRequisition,
//   updateRequisition,
//   deleteRequisition,
//   getRequisitionStats
// } from "../controllers/requisitionController.js";
// import { verifyAuth } from "../middleware/authMiddleware.js";

// const router = express.Router();


// // Requisition stats route
// router.get('/stats', getRequisitionStats);

// // Fetch all requisitions
// router.get("/", verifyAuth, getRequisitions);

// // Fetch a specific requisition by ID
// router.get("/:id", verifyAuth, getRequisitionById);

// // Create a new requisition
// router.post("/", verifyAuth, createRequisition);

// // Update a requisition (e.g., approve/reject)
// router.put("/:id", verifyAuth, updateRequisition);

// // Delete a requisition
// router.delete("/:id", verifyAuth, deleteRequisition);

// export default router;