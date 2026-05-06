import { TaxBreakdown, indianStates } from "@gstautopilot/shared";

export function determineInvoiceType(sellerStateCode: string, buyerStateCode: string): "CGST_SGST" | "IGST" {
  if (!sellerStateCode || !buyerStateCode) return "IGST";
  return sellerStateCode === buyerStateCode ? "CGST_SGST" : "IGST";
}

export function calculateTax(
  taxableValueInPaise: number,
  invoiceType: "CGST_SGST" | "IGST",
  gstRatePercent: number
): TaxBreakdown {
  let cgstRatePercent: number | null = null;
  let sgstRatePercent: number | null = null;
  let igstRatePercent: number | null = null;
  
  let cgstAmountInPaise: number | null = null;
  let sgstAmountInPaise: number | null = null;
  let igstAmountInPaise: number | null = null;

  if (invoiceType === "CGST_SGST") {
    cgstRatePercent = gstRatePercent / 2;
    sgstRatePercent = gstRatePercent / 2;
    cgstAmountInPaise = Math.round((taxableValueInPaise * cgstRatePercent) / 100);
    sgstAmountInPaise = Math.round((taxableValueInPaise * sgstRatePercent) / 100);
  } else {
    igstRatePercent = gstRatePercent;
    igstAmountInPaise = Math.round((taxableValueInPaise * igstRatePercent) / 100);
  }

  const totalTax = (cgstAmountInPaise || 0) + (sgstAmountInPaise || 0) + (igstAmountInPaise || 0);

  return {
    taxableValueInPaise,
    taxType: invoiceType,
    cgstRatePercent,
    sgstRatePercent,
    igstRatePercent,
    cgstAmountInPaise,
    sgstAmountInPaise,
    igstAmountInPaise,
    totalInPaise: taxableValueInPaise + totalTax,
  };
}

export function validateGSTIN(gstin: string): { valid: boolean; stateCode?: string; pan?: string; error?: string } {
  if (!gstin || gstin.length !== 15) {
    return { valid: false, error: "GSTIN must be exactly 15 characters long." };
  }

  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!regex.test(gstin)) {
    return { valid: false, error: "GSTIN format is invalid." };
  }

  const stateCode = gstin.substring(0, 2);
  const isValidStateCode = indianStates.some(state => state.gstCode === stateCode);
  if (!isValidStateCode) {
    return { valid: false, error: "Invalid State Code in GSTIN." };
  }

  // Checksum calculation
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let hash = 0;
  for (let i = 0; i < 14; i++) {
    const value = chars.indexOf(gstin[i]);
    if (value === -1) return { valid: false, error: "Invalid character in GSTIN." };
    let temp = value * ((i % 2 === 0) ? 1 : 2);
    hash += Math.floor(temp / 36) + (temp % 36);
  }
  
  const checkChar = chars[(36 - (hash % 36)) % 36];
  if (checkChar !== gstin[14]) {
    return { valid: false, error: "GSTIN checksum is invalid." };
  }

  return {
    valid: true,
    stateCode: stateCode,
    pan: gstin.substring(2, 12)
  };
}

export function extractStateFromGSTIN(gstin: string): string | null {
  if (!gstin || gstin.length < 2) return null;
  return gstin.substring(0, 2);
}
