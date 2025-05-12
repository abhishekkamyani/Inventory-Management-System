import express from "express";
import {
  getDirectorStats,
  getDirectorRecentRequisitions,getDirectorRequisitions
} from "../controllers/directorController.js";
import { verifyAuth} from "../middleware/authMiddleware.js";

const router = express.Router();

// Director dashboard stats
router.get("/stats", verifyAuth, getDirectorStats);

// Recent requisitions for director dashboard
router.get("/recent", verifyAuth,getDirectorRecentRequisitions);
router.get("/requisitions", verifyAuth,getDirectorRequisitions);


export default router;