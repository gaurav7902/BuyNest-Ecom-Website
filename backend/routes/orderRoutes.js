import express from "express";
import {
    getOrderByUserId,
    getAllOrders,
    updateOrderStatus,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.route("/").get(protect, admin, getAllOrders);
router.route("/:id/status").put(protect, admin, updateOrderStatus);
router.get("/myorders", protect, getOrderByUserId);

export default router;
