import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void => {
  const statusCode = "statusCode" in err && typeof err.statusCode === "number" ? err.statusCode : 500;
  const message = err.message || "An unexpected error occurred on the server";

  console.error(`[Error ${statusCode}]`, err.stack || err.message);

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" && statusCode === 500 ? "Internal Server Error" : message,
  });
};
