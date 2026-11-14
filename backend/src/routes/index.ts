import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import productRoutes from "./product.routes";
import cartRoutes from "./cart.routes";
import wishlistRoutes from "./wishlist.routes";
import orderRoutes from "./order.routes";
import adminRoutes from "./admin.routes";
import stylistRoutes from "./stylist.routes";

const router = Router();

// Mount API routes
router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/stylist", stylistRoutes);

export default router;
