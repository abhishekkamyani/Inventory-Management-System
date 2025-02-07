import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { getActiveUsersCount } from "../controllers/userController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";

const router = express.Router();


// Get the count of active users
router.get("/active-users", getActiveUsersCount);

// Fetch all users (Protected)
router.get("/", verifyAuth, getUsers);

// Fetch a specific user by ID (Protected)
router.get("/:id", verifyAuth, getUserById);

// Create a new user (Public - No Auth Required)
router.post("/", createUser);

// Update a user (Protected)
router.put("/:id", verifyAuth, updateUser);

// Delete a user (Protected)
router.delete("/:id", verifyAuth, deleteUser);

export default router;
