import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { ApiResponse } from "../types";

export interface JwtPayload {
  userId: string;
  role: "user" | "admin";
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  jwtPayload?: JwtPayload;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid Bearer token.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "maison_noir_super_secret_jwt_key_2026_luxury_brand";

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch {
      res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User associated with this token no longer exists.",
      });
      return;
    }

    req.user = user;
    req.jwtPayload = decoded;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal authentication error.",
      error: (error as Error).message,
    });
  }
};

export const requireRole = (...allowedRoles: Array<"user" | "admin">) => {
  return (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Access forbidden. Insufficient permissions.",
      });
      return;
    }

    next();
  };
};
