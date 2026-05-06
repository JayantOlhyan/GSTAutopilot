export interface LineItem {
  id: string;
  description: string;
  sacCode: string;
  sacCodeSource: "ai" | "manual";
  quantity: number;
  rateInPaise: number;
  taxableValueInPaise: number;
}

export interface TaxBreakdown {
  taxableValueInPaise: number;
  taxType: "CGST_SGST" | "IGST";
  cgstRatePercent: number | null;
  sgstRatePercent: number | null;
  igstRatePercent: number | null;
  cgstAmountInPaise: number | null;
  sgstAmountInPaise: number | null;
  igstAmountInPaise: number | null;
  totalInPaise: number;
}

export interface SellerDetails {
  businessName: string;
  gstin: string;
  address: string;
  state: string;
  stateCode: string;
  email: string;
  phone: string;
}

export interface BuyerDetails {
  businessName: string;
  gstin: string | null;
  address: string;
  state: string;
  stateCode: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  seller: SellerDetails;
  buyer: BuyerDetails;
  lineItems: LineItem[];
  taxBreakdown: TaxBreakdown;
  placeOfSupply: string;
  userId?: string | null;
}

export interface SACDetectionResult {
  sacCode: string;
  serviceName: string;
  confidence: "high" | "medium" | "low";
  assumption: string | null;
}

export interface GSTRRecord {
  gstin: string | null;
  inum: string;
  idt: string; // DD-MON-YYYY
  val: number; // total invoice value in rupees (two decimal places)
  pos: string; // place of supply state code
  rchrg: "Y" | "N";
  inv_typ: "R";
  itms: Array<{
    num: number;
    itm_det: {
      rt: number;
      txval: number; // in rupees
      iamt?: number; // in rupees
      camt?: number; // in rupees
      samt?: number; // in rupees
    };
  }>;
}

export interface GSTR1Export {
  gstin: string;
  fp: string; // MMYYYY format
  b2b: Array<{
    ctin: string; // buyer GSTIN
    inv: GSTRRecord[];
  }>;
  b2cs: any[]; // B2C records (simplified)
}
