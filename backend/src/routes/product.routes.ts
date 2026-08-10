import { Router } from "express";
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { authenticate, requireRole } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);

// Admin Protected Routes
router.post("/", authenticate, requireRole("admin"), createProduct);
router.patch("/:id", authenticate, requireRole("admin"), updateProduct);
router.delete("/:id", authenticate, requireRole("admin"), deleteProduct);

export default router;
