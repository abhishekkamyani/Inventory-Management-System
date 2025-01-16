import express from "express";
import { signup, signin, getCurrentUser } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication routes
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/currentUser", verifyToken, getCurrentUser);

export default router;
