import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, JwtPayload, ApiResponse } from "../types";
import { AppError } from "./errorHandler";

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication required. Please provide a valid token.", 401));
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "maison_noir_super_secret_jwt_key_2026_luxury_brand";

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return next(new AppError("Invalid or expired authentication token.", 401));
  }
};

export const authorize = (...roles: Array<"user" | "admin">) => {
  return (req: AuthenticatedRequest, _res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Permission denied. Insufficient role permissions.", 403));
    }
    next();
  };
};
