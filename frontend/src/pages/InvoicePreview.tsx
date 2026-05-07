import { useInvoiceStore } from "@/stores/invoiceStore";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function InvoicePreview() {
  const { currentInvoice } = useInvoiceStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentInvoice) {
      navigate("/invoice", { replace: true });
    }
  }, [currentInvoice, navigate]);

  if (!currentInvoice) return null;

  const formatRs = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center mb-8">
        <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8 text-brand-teal" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Invoice Generated!</h1>
        <p className="text-muted-foreground">
          Your GST-compliant invoice #{currentInvoice.invoiceNumber} has been successfully generated and downloaded to your device.
        </p>
      </div>

      <Card className="max-w-md w-full p-6 border-brand-teal/20 bg-brand-teal/5 shadow-sm mb-8 text-left">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-muted-foreground">Billed To</span>
          <span className="text-sm font-bold">{currentInvoice.buyer.businessName}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-muted-foreground">Date</span>
          <span className="text-sm font-bold">{currentInvoice.invoiceDate}</span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-brand-teal/20">
          <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
          <span className="text-xl font-bold text-brand-teal">{formatRs(currentInvoice.taxBreakdown.totalInPaise)}</span>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link to="/invoice" className="flex-1">
          <Button variant="outline" className="w-full h-12">
            <ArrowLeft className="mr-2 h-4 w-4" /> Create Another
          </Button>
        </Link>
        <Link to="/dashboard" className="flex-1">
          <Button className="w-full h-12">
            <Eye className="mr-2 h-4 w-4" /> View Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
