import express from "express";
import {
  getInventory,
  getInventoryById,
  addInventory,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";


import { getInventoryStats } from '../controllers/inventoryController.js';
import { verifyAuth } from "../middleware/authMiddleware.js";
const router = express.Router();








// Inventory stats route
router.get('/stats', getInventoryStats);



// Fetch all inventory items
router.get("/", verifyAuth, getInventory);

// Fetch a specific inventory item by ID
router.get("/:id", verifyAuth, getInventoryById);

// Add a new inventory item
router.post("/",verifyAuth, addInventory);

// Update an inventory item
router.put("/:id", verifyAuth, updateInventory);

// Delete an inventory item
router.delete("/:id", verifyAuth, deleteInventory);

export default router;