import { useFormContext } from "react-hook-form";
import { InvoiceData, LineItem } from "@gstautopilot/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/axios";
import { useState, useEffect } from "react";
import { useInvoiceStore } from "@/stores/invoiceStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Download } from "lucide-react";

export function LivePreviewPanel() {
  const { watch, handleSubmit } = useFormContext<InvoiceData>();
  const invoice = watch();
  const { setCurrentInvoice } = useInvoiceStore();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  // We need to calculate tax dynamically for the preview based on form values
  const [taxBreakdown, setTaxBreakdown] = useState(invoice.taxBreakdown);

  useEffect(() => {
    // Dynamic preview tax calculation
    const taxableValue = invoice.lineItems.reduce((acc: number, item: LineItem) => acc + (item.taxableValueInPaise || 0), 0);
    const taxType = (invoice.seller?.stateCode && invoice.buyer?.stateCode && invoice.seller.stateCode === invoice.buyer.stateCode) 
      ? "CGST_SGST" 
      : "IGST";
    
    // Defaulting to 18% for preview purposes, or could allow user to select.
    // Assuming 18% if not specified for simplicity in MVP.
    const gstRatePercent = 18; 
    let cgstAmount = null;
    let sgstAmount = null;
    let igstAmount = null;

    if (taxType === "CGST_SGST") {
      cgstAmount = Math.round((taxableValue * (gstRatePercent / 2)) / 100);
      sgstAmount = Math.round((taxableValue * (gstRatePercent / 2)) / 100);
    } else {
      igstAmount = Math.round((taxableValue * gstRatePercent) / 100);
    }

    setTaxBreakdown({
      taxableValueInPaise: taxableValue,
      taxType,
      cgstRatePercent: taxType === "CGST_SGST" ? gstRatePercent / 2 : null,
      sgstRatePercent: taxType === "CGST_SGST" ? gstRatePercent / 2 : null,
      igstRatePercent: taxType === "IGST" ? gstRatePercent : null,
      cgstAmountInPaise: cgstAmount,
      sgstAmountInPaise: sgstAmount,
      igstAmountInPaise: igstAmount,
      totalInPaise: taxableValue + (cgstAmount || 0) + (sgstAmount || 0) + (igstAmount || 0),
    });
  }, [invoice.lineItems, invoice.seller?.stateCode, invoice.buyer?.stateCode]);

  const onGenerate = async (data: InvoiceData) => {
    // Merge calculated tax breakdown into data before sending
    const fullData = { ...data, taxBreakdown };
    
    setIsGenerating(true);
    try {
      const res = await apiClient.post("/api/invoice/generate-pdf", fullData, { responseType: 'blob' });
      
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${fullData.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      toast.success("PDF generated successfully!");

      // Update Session Storage for Dashboard
      const sessionInvoicesStr = sessionStorage.getItem("gstautopilot_session_invoices");
      const sessionInvoices = sessionInvoicesStr ? JSON.parse(sessionInvoicesStr) : [];
      sessionInvoices.push(fullData);
      sessionStorage.setItem("gstautopilot_session_invoices", JSON.stringify(sessionInvoices));

      // Update Zustand store and redirect
      setCurrentInvoice(fullData);
      navigate("/preview");

    } catch (err: any) {
      if (err.response?.data?.error === "Validation failed") {
        toast.error("Please fill all required fields correctly.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const formatRs = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

  return (
    <div className="sticky top-6">
      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <div className="bg-muted p-3 border-b text-sm font-medium text-muted-foreground flex justify-between items-center">
          <span>Live Preview</span>
        </div>
        
        {/* The Invoice Preview Box */}
        <div className="p-6 bg-white text-black min-h-[500px] text-sm">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-brand-teal pb-4">
            <div>
              <h2 className="text-xl font-bold text-brand-teal">{invoice.seller?.businessName || "Seller Name"}</h2>
              <p className="text-xs text-gray-500 max-w-[200px] mt-1">{invoice.seller?.address || "Seller Address"}</p>
              <p className="text-xs text-gray-500 mt-1">GSTIN: {invoice.seller?.gstin || "—"}</p>
              <p className="text-xs text-gray-500">State: {invoice.seller?.state || "—"} ({invoice.seller?.stateCode || "—"})</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-brand-teal uppercase tracking-widest">TAX INVOICE</h1>
              <p className="text-sm font-medium mt-2">Inv No: {invoice.invoiceNumber || "—"}</p>
              <p className="text-sm">Date: {invoice.invoiceDate || "—"}</p>
              <p className="text-sm">POS: {invoice.placeOfSupply || "—"}</p>
            </div>
          </div>

          {/* Buyer */}
          <div className="mb-8">
            <h3 className="text-sm font-bold border-b border-gray-200 pb-1 mb-2 inline-block">Bill To:</h3>
            <p className="font-semibold">{invoice.buyer?.businessName || "Buyer Name"}</p>
            <p className="text-xs text-gray-600 mt-1 max-w-[250px]">{invoice.buyer?.address || "Buyer Address"}</p>
            {invoice.buyer?.gstin && <p className="text-xs text-gray-600 mt-1">GSTIN: {invoice.buyer.gstin}</p>}
            <p className="text-xs text-gray-600">State: {invoice.buyer?.state || "—"} ({invoice.buyer?.stateCode || "—"})</p>
          </div>

          {/* Items */}
          <table className="w-full text-xs mb-8">
            <thead>
              <tr className="border-y border-gray-300 bg-gray-50 text-left">
                <th className="py-2 px-1">Description</th>
                <th className="py-2 px-1">SAC</th>
                <th className="py-2 px-1 text-right">Qty</th>
                <th className="py-2 px-1 text-right">Rate</th>
                <th className="py-2 px-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems?.map((item: LineItem, i: number) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 px-1">{item.description || "—"}</td>
                  <td className="py-2 px-1">{item.sacCode || "—"}</td>
                  <td className="py-2 px-1 text-right">{item.quantity || 0}</td>
                  <td className="py-2 px-1 text-right">{formatRs(item.rateInPaise || 0)}</td>
                  <td className="py-2 px-1 text-right font-medium">{formatRs(item.taxableValueInPaise || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-1 text-sm">
                <span className="font-semibold text-gray-600">Taxable Value:</span>
                <span>{formatRs(taxBreakdown.taxableValueInPaise)}</span>
              </div>
              
              {taxBreakdown.taxType === "CGST_SGST" ? (
                <>
                  <div className="flex justify-between py-1 text-xs text-gray-500">
                    <span>CGST ({taxBreakdown.cgstRatePercent}%):</span>
                    <span>{formatRs(taxBreakdown.cgstAmountInPaise || 0)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-xs text-gray-500 border-b border-gray-200">
                    <span>SGST ({taxBreakdown.sgstRatePercent}%):</span>
                    <span>{formatRs(taxBreakdown.sgstAmountInPaise || 0)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between py-1 text-xs text-gray-500 border-b border-gray-200">
                  <span>IGST ({taxBreakdown.igstRatePercent}%):</span>
                  <span>{formatRs(taxBreakdown.igstAmountInPaise || 0)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 text-base font-bold text-brand-teal border-b-2 border-brand-teal">
                <span>Grand Total:</span>
                <span>{formatRs(taxBreakdown.totalInPaise)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-muted/30 border-t">
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleSubmit(onGenerate)} 
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
            Generate PDF
          </Button>
        </div>
      </Card>
    </div>
  );
}
