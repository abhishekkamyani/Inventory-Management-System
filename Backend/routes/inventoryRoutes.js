import express from "express";
import {
  getInventory,
  getInventoryById,
  addInventory,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";

import { editCategory, deleteCategory } from "../controllers/categoryController.js";
import {
  addCategory,
  getCategories,
} from "../controllers/categoryController.js";
import { addItem, getItems ,editItem, deleteItem,getTotalItemsCount} from "../controllers/itemController.js";
import { getInventoryStats } from '../controllers/inventoryController.js';
import { verifyAuth } from "../middleware/authMiddleware.js";

import { updateStockLevels } from '../controllers/itemController.js';

const router = express.Router();






// Category Routes
router.post("/categories", addCategory);
router.get("/categories", getCategories);

// Edit Category
router.put("/categories/:id", editCategory);

// Delete Category
router.delete("/categories/:id", deleteCategory);

// Item Routes
router.post("/items", addItem);
router.get("/items", getItems);
router.get("/total-items", getTotalItemsCount);


// Item Routes
router.put("/items/:id", editItem);
router.delete("/items/:id", deleteItem);


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