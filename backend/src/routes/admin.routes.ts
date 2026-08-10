import { Router } from "express";
import { adminGetOrders, adminUpdateOrderStatus, getOrderById } from "../controllers/order.controller";
import { authenticate, requireRole } from "../middleware/authMiddleware";

const router = Router();

// Protect all admin routes with authentication & admin role check
router.use(authenticate, requireRole("admin"));

router.get("/orders", adminGetOrders);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id/status", adminUpdateOrderStatus);

export default router;
