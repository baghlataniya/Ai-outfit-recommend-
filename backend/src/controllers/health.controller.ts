import { Request, Response } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../types";

export const getHealth = (_req: Request, res: Response<ApiResponse>): void => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    success: true,
    message: "Maison Noir API is running",
    data: {
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      database: dbStatusMap[dbState] || "unknown",
    },
  });
};
