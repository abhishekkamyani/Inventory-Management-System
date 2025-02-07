import express from "express";
import {
  signup,
  signin,
  getCurrentUser,
  getRoles,
  forgotPassword,
  resetPassword,logout
} from "../controllers/authController.js"; // Importing the necessary controllers

import { activateUser } from "../controllers/userController.js";
import { verifyAuth ,verifyAdmin} from "../middleware/authMiddleware.js";




const router = express.Router();

// Authentication routes
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/get_roles", getRoles);
//router.get("/currentUser", verifyToken, getCurrentUser);
router.post("/logout",logout)


//router.put("/:userId/status", verifyAuth, activateUser);

// Activate/Deactivate user route
router.patch("/activate/:userId", verifyAuth, verifyAdmin, activateUser);
// Password reset routes
router.post("/forgot-password", forgotPassword); // Route for sending reset link
router.post("/reset-password/:token", resetPassword); // Route for resetting the password
//router.post('/reset-password/:token', verifyResetToken);

export default router;
