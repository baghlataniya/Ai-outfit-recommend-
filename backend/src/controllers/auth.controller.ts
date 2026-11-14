import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { User, IUser } from "../models/User";
import { ApiResponse } from "../types";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/email.service";

// Helper: Build allowed origins for postMessage security
const getAllowedOrigins = (): string[] => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const origins = [clientUrl];
  // Add common local dev origins
  if (clientUrl.includes("localhost")) {
    origins.push("http://localhost:8080", "http://localhost:5173", "http://localhost:3000");
  }
  return [...new Set(origins)];
};

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || "maison_noir_super_secret_jwt_key_2026_luxury_brand";
};

const getGoogleClient = (): OAuth2Client => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `http://localhost:${process.env.PORT || 5001}/api/auth/google/callback`
  );
};

const generateToken = (user: IUser): string => {
  const options: SignOptions = {
    expiresIn: "7d",
  };
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    getJwtSecret(),
    options
  );
};

export const register = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phone, avatar } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({
        success: false,
        message: "First name, last name, email, and password are required.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
      return;
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
      return;
    }

    const rawVerificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto.createHash("sha256").update(rawVerificationToken).digest("hex");

    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : "",
      avatar: avatar || "",
      role: "user",
      authProvider: "local",
      emailVerified: false,
      emailVerificationTokenHash: hashedVerificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await user.save();
    const token = generateToken(user);

    const clientUrl = process.env.CLIENT_URL || "http://localhost:8080";
    const verifyUrl = `${clientUrl}/verify-email?token=${rawVerificationToken}`;

    // Send verification email in background (non-blocking)
    sendVerificationEmail(user.email, `${user.firstName} ${user.lastName}`, verifyUrl).catch((err) =>
      console.error("[Register Error] Failed to send verification email:", err)
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully. A verification email has been sent to your inbox.",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create account. Please try again later.",
      error: (error as Error).message,
    });
  }
};

export const login = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Account not found. Would you like to create one?",
        error: "ACCOUNT_NOT_FOUND",
      });
      return;
    }

    if (!user.password && (user.authProvider === "google" || user.googleId)) {
      res.status(400).json({
        success: false,
        message: "This account uses Google Sign-In. Please continue with Google.",
        error: "GOOGLE_ACCOUNT_ONLY",
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Incorrect email or password.",
      });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred during authentication.",
      error: (error as Error).message,
    });
  }
};

export const googleAuth = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { idToken, credential } = req.body;
    const tokenToVerify = idToken || credential;

    if (!tokenToVerify) {
      res.status(400).json({
        success: false,
        message: "Google credential / ID token is required.",
      });
      return;
    }

    let payload: any = null;

    try {
      if (process.env.GOOGLE_CLIENT_ID) {
        const ticket = await getGoogleClient().verifyIdToken({
          idToken: tokenToVerify,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } else {
        const base64Url = tokenToVerify.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          Buffer.from(base64, "base64")
            .toString("utf-8")
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        payload = JSON.parse(jsonPayload);
      }
    } catch (verifyErr) {
      res.status(401).json({
        success: false,
        message: "Google authentication failed: Invalid or expired token.",
        error: (verifyErr as Error).message,
      });
      return;
    }

    if (!payload || !payload.email) {
      res.status(400).json({
        success: false,
        message: "Could not extract user details from Google credentials.",
      });
      return;
    }

    if (payload.email_verified === false) {
      res.status(401).json({
        success: false,
        message: "Google email address is not verified.",
      });
      return;
    }

    const googleSub = payload.sub;
    const normalizedEmail = payload.email.trim().toLowerCase();
    const givenName = payload.given_name || payload.name?.split(" ")[0] || "Maison";
    const familyName = payload.family_name || payload.name?.split(" ").slice(1).join(" ") || "Member";
    const avatar = payload.picture || "";

    let user = await User.findOne({
      $or: [{ googleId: googleSub }, { email: normalizedEmail }],
    });

    if (user) {
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleSub;
        updated = true;
      }
      if (user.authProvider === "local") {
        user.authProvider = "both" as any;
        updated = true;
      }
      if (!user.emailVerified) {
        user.emailVerified = true;
        updated = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      user = new User({
        firstName: givenName,
        lastName: familyName,
        email: normalizedEmail,
        authProvider: "google",
        googleId: googleSub,
        emailVerified: true,
        avatar,
        role: "user",
      });
      await user.save();
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Google authentication successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred during Google authentication.",
      error: (error as Error).message,
    });
  }
};

// ─── OAuth 2.0 Authorization Code Flow ──────────────────────────────────

/**
 * GET /api/auth/google/url
 * Returns the Google OAuth consent screen URL.
 * Frontend opens this in a popup window.
 */
export const googleAuthUrl = async (_req: Request, res: Response): Promise<void> => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({
      success: false,
      message: "Google OAuth is not configured. Set GOOGLE_CLIENT_ID in backend .env.",
    });
    return;
  }

  const googleClient = getGoogleClient();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `http://localhost:${process.env.PORT || 5001}/api/auth/google/callback`;

  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
    redirect_uri: redirectUri,
  });

  res.status(200).json({ success: true, data: { url } });
};

/**
 * GET /api/auth/google/callback
 * Google redirects here with ?code=...
 * Exchanges code for tokens, creates/links user, renders HTML page
 * that postMessages the JWT back to the opener window.
 */
export const googleAuthCallback = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    res.status(400).send(renderCallbackHtml(null, "Missing authorization code from Google."));
    return;
  }

  try {
    const googleClient = getGoogleClient();
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `http://localhost:${process.env.PORT || 5001}/api/auth/google/callback`;

    // Exchange authorization code for tokens
    const { tokens } = await googleClient.getToken({ code, redirect_uri: redirectUri });
    googleClient.setCredentials(tokens);

    if (!tokens.id_token) {
      res.status(400).send(renderCallbackHtml(null, "Failed to obtain ID token from Google."));
      return;
    }

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(400).send(renderCallbackHtml(null, "Could not extract user details from Google credentials."));
      return;
    }

    if (payload.email_verified === false) {
      res.status(401).send(renderCallbackHtml(null, "Google email address is not verified."));
      return;
    }

    const googleSub = payload.sub;
    const normalizedEmail = payload.email.trim().toLowerCase();
    const givenName = payload.given_name || payload.name?.split(" ")[0] || "Maison";
    const familyName = payload.family_name || payload.name?.split(" ").slice(1).join(" ") || "Member";
    const avatar = payload.picture || "";

    // Find or create user
    let user = await User.findOne({
      $or: [{ googleId: googleSub }, { email: normalizedEmail }],
    });

    if (user) {
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleSub;
        updated = true;
      }
      if (user.authProvider === "local") {
        user.authProvider = "google" as any;
        updated = true;
      }
      if (!user.emailVerified) {
        user.emailVerified = true;
        updated = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      user = new User({
        firstName: givenName,
        lastName: familyName,
        email: normalizedEmail,
        authProvider: "google",
        googleId: googleSub,
        emailVerified: true,
        avatar,
        role: "user",
      });
      await user.save();
    }

    const token = generateToken(user);
    const allowedOrigins = getAllowedOrigins();

    res.status(200).send(renderCallbackHtml(token, null, allowedOrigins, {
      id: user._id.toString(),
      firstName: user.firstName,
      email: user.email,
      avatar: user.avatar || "",
    }));
  } catch (error) {
    console.error("[Google OAuth Callback Error]", error);
    res.status(500).send(renderCallbackHtml(null, (error as Error).message || "Google authentication failed."));
  }
};

/**
 * Renders a small HTML page that sends auth data back to the opener
 * window via postMessage, then closes the popup.
 */
function renderCallbackHtml(
  token: string | null,
  error: string | null,
  allowedOrigins?: string[],
  userInfo?: { id: string; firstName: string; email: string; avatar: string }
): string {
  const origins = allowedOrigins || getAllowedOrigins();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maison Noir — Google Authentication</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .container { max-width: 320px; padding: 2rem; }
    .spinner {
      width: 24px; height: 24px;
      border: 2px solid rgba(255,255,255,0.2);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 0.5rem; }
    p { font-size: 0.75rem; color: #888; }
    .error { color: #ef4444; }
  </style>
</head>
<body>
  <div class="container">
    ${token ? `
      <div class="spinner"></div>
      <h2>Authentication Successful</h2>
      <p>Redirecting you back to Maison Noir...</p>
    ` : `
      <h2 class="error">Authentication Failed</h2>
      <p class="error">${error || 'An unknown error occurred.'}</p>
      <p style="margin-top:1rem;">This window will close automatically.</p>
    `}
  </div>
  <script>
    (function() {
      var data = ${JSON.stringify(token ? { type: 'MAISON_NOIR_GOOGLE_AUTH', success: true, token, user: userInfo } : { type: 'MAISON_NOIR_GOOGLE_AUTH', success: false, error: error })};
      var origins = ${JSON.stringify(origins)};
      if (window.opener) {
        origins.forEach(function(origin) {
          try { window.opener.postMessage(data, origin); } catch(e) {}
        });
      }
      setTimeout(function() { window.close(); }, ${token ? 1500 : 3000});
    })();
  </script>
</body>
</html>`;
}

export const logout = async (_req: Request, res: Response<ApiResponse>): Promise<void> => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Not authenticated.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
      return;
    }

    const { firstName, lastName, phone, avatar } = req.body;

    if (firstName !== undefined) req.user.firstName = firstName.trim();
    if (lastName !== undefined) req.user.lastName = lastName.trim();
    if (phone !== undefined) req.user.phone = phone.trim();
    if (avatar !== undefined) req.user.avatar = avatar;

    await req.user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: (error as Error).message,
    });
  }
};

/**
 * POST /api/auth/forgot-password
 * Security: Anti-enumeration generic response. Never reveals email existence.
 */
export const forgotPassword = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: "Email address is required." });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      const rawResetToken = crypto.randomBytes(32).toString("hex");
      const hashedResetToken = crypto.createHash("sha256").update(rawResetToken).digest("hex");

      user.passwordResetTokenHash = hashedResetToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const clientUrl = process.env.CLIENT_URL || "http://localhost:8080";
      const resetUrl = `${clientUrl}/reset-password?token=${rawResetToken}`;

      await sendPasswordResetEmail(user.email, `${user.firstName} ${user.lastName}`, resetUrl);
    }

    // Security Anti-Enumeration: Always return the exact same generic message
    res.status(200).json({
      success: true,
      message: "If an account with that email exists, we have sent instructions to your inbox.",
    });
  } catch (error) {
    console.error("[Forgot Password Error]", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
      error: (error as Error).message,
    });
  }
};

/**
 * POST /api/auth/reset-password
 * Validates token and updates user password securely.
 */
export const resetPassword = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ success: false, message: "Token and new password are required." });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
      return;
    }

    const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const user = await User.findOne({
      passwordResetTokenHash: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpires");

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link. Please request a new link.",
        error: "INVALID_OR_EXPIRED_TOKEN",
      });
      return;
    }

    // Update password (triggers bcrypt pre-save hook)
    user.password = newPassword;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("[Reset Password Error]", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
      error: (error as Error).message,
    });
  }
};

/**
 * POST /api/auth/verify-email
 * Validates email verification token and sets emailVerified = true.
 */
export const verifyEmail = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: "Verification token is required." });
      return;
    }

    const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const user = await User.findOne({
      emailVerificationTokenHash: hashedToken,
    }).select("+emailVerificationTokenHash +emailVerificationExpires");

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid verification token or account already verified.",
        error: "INVALID_TOKEN",
      });
      return;
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      res.status(400).json({
        success: false,
        message: "Verification link has expired. Please request a new verification email.",
        error: "TOKEN_EXPIRED",
      });
      return;
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      data: { user },
    });
  } catch (error) {
    console.error("[Verify Email Error]", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify email.",
      error: (error as Error).message,
    });
  }
};

/**
 * POST /api/auth/resend-verification
 * Resends email verification token. Generic anti-enumeration response.
 */
export const resendVerification = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: "Email address is required." });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (user && !user.emailVerified) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

      user.emailVerificationTokenHash = hashedToken;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await user.save();

      const clientUrl = process.env.CLIENT_URL || "http://localhost:8080";
      const verifyUrl = `${clientUrl}/verify-email?token=${rawToken}`;

      await sendVerificationEmail(user.email, `${user.firstName} ${user.lastName}`, verifyUrl);
    }

    // Security Anti-Enumeration: Always return generic message
    res.status(200).json({
      success: true,
      message: "If an unverified account with that email exists, a new verification link has been sent.",
    });
  } catch (error) {
    console.error("[Resend Verification Error]", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request.",
      error: (error as Error).message,
    });
  }
};
