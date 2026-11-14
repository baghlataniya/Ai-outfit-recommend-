import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  googleAuth,
  googleAuthUrl,
  googleAuthCallback,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Rate limiter for sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication requests from this IP. Please try again after 15 minutes.",
  },
});

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/google/url", googleAuthUrl);
router.get("/google/callback", googleAuthCallback);

// Transactional Auth & Email Routes (Protected by rate limiter)
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", authLimiter, resendVerification);

router.post("/logout", logout);
router.get("/me", authenticate, getMe);
router.patch("/profile", authenticate, updateProfile);

export default router;
