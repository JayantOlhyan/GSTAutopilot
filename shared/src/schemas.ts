import { z } from "zod";

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  sacCode: z.string().regex(/^\d{6}$/, "SAC Code must be 6 digits"),
  sacCodeSource: z.enum(["ai", "manual"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  rateInPaise: z.number().min(0, "Rate cannot be negative"),
  taxableValueInPaise: z.number().min(0, "Taxable value cannot be negative"),
});

export const taxBreakdownSchema = z.object({
  taxableValueInPaise: z.number().min(0),
  taxType: z.enum(["CGST_SGST", "IGST"]),
  cgstRatePercent: z.number().nullable(),
  sgstRatePercent: z.number().nullable(),
  igstRatePercent: z.number().nullable(),
  cgstAmountInPaise: z.number().nullable(),
  sgstAmountInPaise: z.number().nullable(),
  igstAmountInPaise: z.number().nullable(),
  totalInPaise: z.number().min(0),
});

export const sellerDetailsSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format"),
  address: z.string().min(1, "Address is required"),
  state: z.string().min(1, "State is required"),
  stateCode: z.string().length(2, "State Code must be 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
});

export const buyerDetailsSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format").nullable(),
  address: z.string().min(1, "Address is required"),
  state: z.string().min(1, "State is required"),
  stateCode: z.string().length(2, "State Code must be 2 characters"),
});

export const invoiceDataSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  seller: sellerDetailsSchema,
  buyer: buyerDetailsSchema,
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  taxBreakdown: taxBreakdownSchema,
  placeOfSupply: z.string().min(1, "Place of supply is required"),
  userId: z.string().nullable().optional(),
});

export const detectSacRequestSchema = z.object({
  description: z.string().min(3, "Description must be between 3 and 500 characters").max(500, "Description must be between 3 and 500 characters"),
});

export const generateGstr1RequestSchema = z.object({
  invoices: z.array(invoiceDataSchema),
  period: z.string().regex(/^\d{6}$/, "Period must be MMYYYY format"), // MMYYYY
});

export const validateGstinRequestSchema = z.object({
  gstin: z.string(),
});
