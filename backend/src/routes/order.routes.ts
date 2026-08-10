import { Router } from "express";
import { createOrder, getUserOrders, getOrderById } from "../controllers/order.controller";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/:id", getOrderById);

export default router;
