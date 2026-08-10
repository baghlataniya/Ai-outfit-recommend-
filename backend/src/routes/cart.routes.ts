import { Router } from "express";
import { getCart, syncCart, updateCart, clearCart } from "../controllers/cart.controller";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);
router.get("/", getCart);
router.post("/sync", syncCart);
router.put("/", updateCart);
router.delete("/", clearCart);

export default router;
