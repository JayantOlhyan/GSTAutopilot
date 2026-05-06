import PDFDocument from "pdfkit";
import { InvoiceData } from "@gstautopilot/shared";

function formatRupees(paise: number): string {
  return (paise / 100).toFixed(2);
}

export function generateInvoicePDF(invoice: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const brandTeal = "#00B894";

      // 1. Header Band
      doc.rect(0, 0, doc.page.width, 120).fill(brandTeal);
      doc.fillColor("white").font("Helvetica-Bold").fontSize(28).text("TAX INVOICE", 40, 45, { align: "right" });
      
      doc.fontSize(16).text(invoice.seller.businessName, 40, 45);
      doc.font("Helvetica").fontSize(10).text(invoice.seller.address);
      doc.text(`GSTIN: ${invoice.seller.gstin}`);
      doc.text(`State: ${invoice.seller.state} (${invoice.seller.stateCode})`);

      // Reset to default fill color for the rest of the document
      doc.fillColor("black");

      // 2. Invoice Meta Details & Buyer Details
      let y = 150;
      doc.font("Helvetica-Bold").fontSize(12).text("Bill To:", 40, y);
      doc.font("Helvetica").fontSize(10).text(invoice.buyer.businessName, 40, y + 15);
      doc.text(invoice.buyer.address, 40, y + 30);
      if (invoice.buyer.gstin) {
        doc.text(`GSTIN: ${invoice.buyer.gstin}`, 40, y + 45);
      }
      doc.text(`State: ${invoice.buyer.state} (${invoice.buyer.stateCode})`, 40, y + 60);

      doc.font("Helvetica-Bold").text("Invoice Details:", 350, y);
      doc.font("Helvetica").text(`Invoice No: ${invoice.invoiceNumber}`, 350, y + 15);
      doc.text(`Date: ${invoice.invoiceDate}`, 350, y + 30);
      doc.text(`Place of Supply: ${invoice.placeOfSupply}`, 350, y + 45);
      doc.text(`Reverse Charge: N`, 350, y + 60); // Assuming 'N' as reverse charge isn't handled directly via UI

      y += 100;

      // 3. Line Items Table
      const colX = [40, 220, 300, 360, 420, 480]; // Columns: Desc, SAC, Qty, Rate, Taxable
      
      doc.font("Helvetica-Bold");
      doc.text("Description", colX[0], y);
      doc.text("SAC Code", colX[1], y);
      doc.text("Qty", colX[2], y, { width: 40, align: "right" });
      doc.text("Rate", colX[3], y, { width: 50, align: "right" });
      doc.text("Amount", colX[4], y, { width: 70, align: "right" });

      doc.moveTo(40, y + 15).lineTo(550, y + 15).stroke();
      y += 25;

      doc.font("Helvetica");
      invoice.lineItems.forEach((item) => {
        doc.text(item.description, colX[0], y, { width: 170 });
        doc.text(item.sacCode, colX[1], y);
        doc.text(item.quantity.toString(), colX[2], y, { width: 40, align: "right" });
        doc.text(formatRupees(item.rateInPaise), colX[3], y, { width: 50, align: "right" });
        doc.text(formatRupees(item.taxableValueInPaise), colX[4], y, { width: 70, align: "right" });
        y += 20;
      });

      doc.moveTo(40, y).lineTo(550, y).stroke();
      y += 20;

      // 4. Totals and Taxes
      const tb = invoice.taxBreakdown;
      const totalColX = 350;
      
      doc.font("Helvetica-Bold").text("Total Taxable Value:", totalColX, y);
      doc.text(formatRupees(tb.taxableValueInPaise), colX[4], y, { width: 70, align: "right" });
      y += 20;

      if (tb.taxType === "CGST_SGST") {
        doc.text(`CGST (${tb.cgstRatePercent}%):`, totalColX, y);
        doc.text(formatRupees(tb.cgstAmountInPaise || 0), colX[4], y, { width: 70, align: "right" });
        y += 20;
        doc.text(`SGST (${tb.sgstRatePercent}%):`, totalColX, y);
        doc.text(formatRupees(tb.sgstAmountInPaise || 0), colX[4], y, { width: 70, align: "right" });
        y += 20;
      } else {
        doc.text(`IGST (${tb.igstRatePercent}%):`, totalColX, y);
        doc.text(formatRupees(tb.igstAmountInPaise || 0), colX[4], y, { width: 70, align: "right" });
        y += 20;
      }

      doc.moveTo(350, y).lineTo(550, y).stroke();
      y += 10;

      doc.fontSize(14).text("Grand Total:", totalColX, y);
      doc.text(formatRupees(tb.totalInPaise), colX[4], y, { width: 70, align: "right" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
