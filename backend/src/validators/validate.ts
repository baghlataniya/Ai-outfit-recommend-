import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { AppError } from "../middleware/errorHandler";

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
        return next(new AppError(`Validation Error: ${issues}`, 400));
      }
      next(error);
    }
  };
};

export const commonSchemas = {
  mongoId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId format"),
  email: z.string().email("Invalid email address format").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  positiveNumber: z.number().positive("Value must be greater than zero"),
  nonNegativeNumber: z.number().min(0, "Value cannot be negative"),
};
