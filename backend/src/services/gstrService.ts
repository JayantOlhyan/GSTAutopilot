import { InvoiceData, GSTR1Export, GSTRRecord } from "@gstautopilot/shared";

function formatRupees(paise: number): number {
  return Number((paise / 100).toFixed(2));
}

// Convert YYYY-MM-DD to DD-MON-YYYY (e.g. 2024-05-15 -> 15-MAY-2024)
function formatDateGSTR(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const day = parts[2];
  
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const mon = months[month - 1];
  return `${day}-${mon}-${year}`;
}

export function generateGSTR1Export(invoices: InvoiceData[], period: string): GSTR1Export {
  if (invoices.length === 0) {
    throw new Error("No invoices provided for GSTR-1 export.");
  }

  // Assuming all invoices in the batch belong to the same seller.
  const sellerGstin = invoices[0].seller.gstin;

  const b2bMap = new Map<string, GSTRRecord[]>();

  invoices.forEach((invoice) => {
    // We only process B2B invoices (where buyer has a GSTIN) for the 'b2b' section in this MVP
    if (!invoice.buyer.gstin) {
      // In a full implementation, B2C records go to 'b2cs' or 'b2cl'.
      return; 
    }

    const gstin = invoice.buyer.gstin;
    const invDate = formatDateGSTR(invoice.invoiceDate);
    const invoiceValue = formatRupees(invoice.taxBreakdown.totalInPaise);

    // Group items by tax rate for the 'itms' array as required by GSTN schema
    // In our simplified MVP, we assume a single tax rate per invoice based on the taxBreakdown
    const rt = invoice.taxBreakdown.taxType === "CGST_SGST" 
      ? (invoice.taxBreakdown.cgstRatePercent || 0) * 2 
      : (invoice.taxBreakdown.igstRatePercent || 0);
    
    const txval = formatRupees(invoice.taxBreakdown.taxableValueInPaise);
    
    const itm_det: any = {
      rt: rt,
      txval: txval,
    };

    if (invoice.taxBreakdown.taxType === "CGST_SGST") {
      itm_det.camt = formatRupees(invoice.taxBreakdown.cgstAmountInPaise || 0);
      itm_det.samt = formatRupees(invoice.taxBreakdown.sgstAmountInPaise || 0);
    } else {
      itm_det.iamt = formatRupees(invoice.taxBreakdown.igstAmountInPaise || 0);
    }

    const record: GSTRRecord = {
      gstin: gstin, // Not part of the inner inv object in the official schema, but kept here for building
      inum: invoice.invoiceNumber,
      idt: invDate,
      val: invoiceValue,
      pos: invoice.placeOfSupply.length === 2 ? invoice.placeOfSupply : invoice.buyer.stateCode,
      rchrg: "N",
      inv_typ: "R",
      itms: [
        {
          num: 1, // Single aggregated item for the rate
          itm_det: itm_det
        }
      ]
    };

    if (!b2bMap.has(gstin)) {
      b2bMap.set(gstin, []);
    }
    b2bMap.get(gstin)!.push(record);
  });

  const b2bArray = Array.from(b2bMap.entries()).map(([ctin, inv]) => {
    // Official schema requires removing 'gstin' from the inner inv objects
    const cleanedInv = inv.map(({ gstin, ...rest }) => rest);
    return {
      ctin: ctin,
      inv: cleanedInv as any // Casting because GSTRRecord had gstin for convenience
    };
  });

  return {
    gstin: sellerGstin,
    fp: period, // MMYYYY
    b2b: b2bArray,
    b2cs: [] // Empty for MVP since we focus on B2B
  };
}
