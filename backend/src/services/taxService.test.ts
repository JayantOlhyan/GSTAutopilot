import { describe, it, expect } from "vitest";
import { determineInvoiceType, calculateTax, validateGSTIN } from "./taxService";

describe("taxService", () => {
  it("CGST_SGST is returned when seller and buyer are in Maharashtra", () => {
    // 27 is Maharashtra
    expect(determineInvoiceType("27", "27")).toBe("CGST_SGST");
  });

  it("IGST is returned when seller is in Maharashtra and buyer is in Karnataka", () => {
    // 27 is Maharashtra, 29 is Karnataka
    expect(determineInvoiceType("27", "29")).toBe("IGST");
  });

  it("GSTIN validation returns valid for a correctly formatted GSTIN", () => {
    const testStr = "27AAAAA0000A1Z";
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let hash = 0;
    for (let i = 0; i < 14; i++) {
      const value = chars.indexOf(testStr[i]);
      let temp = value * ((i % 2 === 0) ? 1 : 2);
      hash += Math.floor(temp / 36) + (temp % 36);
    }
    const checkChar = chars[(36 - (hash % 36)) % 36];
    const validGSTIN = testStr + checkChar;

    const res = validateGSTIN(validGSTIN);
    expect(res.valid).toBe(true);
    expect(res.stateCode).toBe("27");
    expect(res.pan).toBe("AAAAA0000A");
  });

  it("GSTIN validation returns invalid for a 14 character GSTIN", () => {
    const res = validateGSTIN("27AAAAA0000A1Z");
    expect(res.valid).toBe(false);
    expect(res.error).toContain("exactly 15 characters");
  });

  it("GSTIN validation returns invalid for a GSTIN with incorrect checksum", () => {
    const testStr = "27AAAAA0000A1Z";
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let hash = 0;
    for (let i = 0; i < 14; i++) {
      const value = chars.indexOf(testStr[i]);
      let temp = value * ((i % 2 === 0) ? 1 : 2);
      hash += Math.floor(temp / 36) + (temp % 36);
    }
    const validCheckChar = chars[(36 - (hash % 36)) % 36];
    const invalidCheckChar = validCheckChar === "0" ? "1" : "0";

    const res = validateGSTIN(testStr + invalidCheckChar);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("GSTIN checksum is invalid.");
  });

  it("Tax calculation for 18 percent on 1000 rupees taxable value returns 90 rupees CGST and 90 rupees SGST in paise", () => {
    const taxableValueInPaise = 100000; // 1000 rupees
    const res = calculateTax(taxableValueInPaise, "CGST_SGST", 18);
    expect(res.cgstAmountInPaise).toBe(9000); // 90 rupees
    expect(res.sgstAmountInPaise).toBe(9000); // 90 rupees
    expect(res.igstAmountInPaise).toBeNull();
    expect(res.totalInPaise).toBe(118000); // 1180 rupees
  });

  it("Tax calculation for IGST on same returns 180 rupees IGST in paise", () => {
    const taxableValueInPaise = 100000; // 1000 rupees
    const res = calculateTax(taxableValueInPaise, "IGST", 18);
    expect(res.igstAmountInPaise).toBe(18000); // 180 rupees
    expect(res.cgstAmountInPaise).toBeNull();
    expect(res.sgstAmountInPaise).toBeNull();
    expect(res.totalInPaise).toBe(118000); // 1180 rupees
  });
});
