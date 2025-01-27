import express from "express";
import {
  signup,
  signin,
  getCurrentUser,
  getRoles,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js"; // Importing the necessary controllers
import { verifyToken } from "../middleware/authMiddleware.js";
import { verifyResetToken } from '../controllers/authController.js';

const router = express.Router();

// Authentication routes
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/get_roles", getRoles);
router.get("/currentUser", verifyToken, getCurrentUser);

// Password reset routes
router.post("/forgot-password", forgotPassword); // Route for sending reset link
//router.post("/reset-password/:token", resetPassword); // Route for resetting the password
router.get('/reset-password/:token', verifyResetToken);

export default router;
