import { Router } from "express";
import {
  getRecommendations,
  saveOutfit,
  getSavedOutfits,
  deleteSavedOutfit,
} from "../controllers/stylist.controller";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Public recommendation endpoint
router.post("/recommend", getRecommendations);

// Authenticated endpoints for saving & managing curated outfits
router.post("/saved", authenticate, saveOutfit);
router.get("/saved", authenticate, getSavedOutfits);
router.delete("/saved/:id", authenticate, deleteSavedOutfit);

export default router;

