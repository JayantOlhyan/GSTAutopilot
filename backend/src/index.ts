import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pino from "pino";
import { errorHandler } from "./middleware/errorHandler";
import { requireAuth } from "./middleware/auth";
import { detectSACCode } from "./services/aiService";
import { generateInvoicePDF } from "./services/pdfService";
import { generateGSTR1Export } from "./services/gstrService";
import { validateGSTIN } from "./services/taxService";
import { detectSacRequestSchema, generateGstr1RequestSchema, validateGstinRequestSchema, invoiceDataSchema } from "@gstautopilot/shared";

const logger = pino(
  process.env.NODE_ENV === "development"
    ? { transport: { target: "pino-pretty" } }
    : {}
);

process.on("unhandledRejection", (err) => {
  logger.error(err, "Unhandled Rejection");
});

const app = express();
app.use(helmet());

const frontendUrl = process.env.NODE_ENV === "production" && process.env.FRONTEND_URL ? process.env.FRONTEND_URL : "http://localhost:5173";
app.use(cors({ origin: frontendUrl }));

app.use(express.json());

// Logging middleware (no body logging to protect PII like GSTIN)
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, "Incoming request");
  next();
});

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// AI Rate Limiter
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply auth middleware to everything except health and validate
app.use((req, res, next) => {
  if (req.path === "/api/health" || req.path === "/api/gstin/validate") {
    return next();
  }
  requireAuth(req, res, next);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/gstin/validate", (req, res) => {
  const result = validateGstinRequestSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const validation = validateGSTIN(result.data.gstin);
  res.json(validation);
});

app.post("/api/ai/detect-sac", aiLimiter, async (req, res, next) => {
  try {
    const result = detectSacRequestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Description must be between 3 and 500 characters" });
    }
    const start = Date.now();
    const aiResult = await detectSACCode(result.data.description);
    const latency = Date.now() - start;
    logger.info({ latency }, "AI call completed");
    res.json(aiResult);
  } catch (err) {
    next(err);
  }
});

app.post("/api/invoice/generate-pdf", async (req, res, next) => {
  try {
    const result = invoiceDataSchema.safeParse(req.body);
    if (!result.success) {
      const fields: Record<string, string> = {};
      result.error.errors.forEach(e => {
        fields[e.path.join(".")] = e.message;
      });
      return res.status(400).json({ error: "Validation failed", fields });
    }
    
    const pdfBuffer = await generateInvoicePDF(result.data);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${result.data.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

app.post("/api/invoice/generate-gstr1", async (req, res, next) => {
  try {
    const result = generateGstr1RequestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Validation failed" });
    }
    const gstr1 = generateGSTR1Export(result.data.invoices, result.data.period);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=gstr1.json");
    res.json(gstr1);
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
