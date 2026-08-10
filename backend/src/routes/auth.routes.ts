import { Router } from "express";
import { register, login, logout, getMe, updateProfile, googleAuth, googleAuthUrl, googleAuthCallback } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/google/url", googleAuthUrl);
router.get("/google/callback", googleAuthCallback);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);
router.patch("/profile", authenticate, updateProfile);

export default router;
