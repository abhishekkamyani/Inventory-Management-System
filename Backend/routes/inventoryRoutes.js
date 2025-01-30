import express from "express";
import {
  getInventory,
  getInventoryById,
  addInventory,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { getInventoryStats } from '../controllers/inventoryController.js';

const router = express.Router();








// Inventory stats route
router.get('/stats', getInventoryStats);



// Fetch all inventory items
router.get("/", authMiddleware, getInventory);

// Fetch a specific inventory item by ID
router.get("/:id", authMiddleware, getInventoryById);

// Add a new inventory item
router.post("/", authMiddleware, addInventory);

// Update an inventory item
router.put("/:id", authMiddleware, updateInventory);

// Delete an inventory item
router.delete("/:id", authMiddleware, deleteInventory);

export default router;