import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Fetch all users
router.get("/", authMiddleware, getUsers);

// Fetch a specific user by ID
router.get("/:id", authMiddleware, getUserById);

// Create a new user
router.post("/", authMiddleware, createUser);

// Update a user
router.put("/:id", authMiddleware, updateUser);

// Delete a user
router.delete("/:id", authMiddleware, deleteUser);

export default router;