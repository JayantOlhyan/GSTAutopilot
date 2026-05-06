import { Request, Response, NextFunction } from "express";
import pino from "pino";

const logger = pino();

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(err, "Unhandled error in request");
  
  if (process.env.NODE_ENV === "development") {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }

  if (req.path === "/api/invoice/generate-pdf") {
    return res.status(500).json({ error: "Failed to generate PDF. Please try again." });
  }

  return res.status(500).json({ error: "Internal server error. Please try again." });
}
