import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { getAdminStats } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/stats", protect, admin, getAdminStats);

export default router;
