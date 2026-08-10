import { Router } from "express";
import { getWishlist, syncWishlist, toggleWishlist } from "../controllers/wishlist.controller";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);
router.get("/", getWishlist);
router.post("/sync", syncWishlist);
router.post("/toggle", toggleWishlist);

export default router;
