import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceDataSchema, InvoiceData } from "@gstautopilot/shared";
import { GSTINSection } from "./invoice/GSTINSection";
import { BuyerDetailsSection } from "./invoice/BuyerDetailsSection";
import { LineItemsSection } from "./invoice/LineItemsSection";
import { LivePreviewPanel } from "./invoice/LivePreviewPanel";
import { useSettingsStore } from "@/stores/settingsStore";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvoiceCreation() {
  const sellerProfile = useSettingsStore(state => state.sellerProfile);

  const methods = useForm<InvoiceData>({
    resolver: zodResolver(invoiceDataSchema),
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceDate: new Date().toISOString().split("T")[0],
      seller: sellerProfile || {
        businessName: "", gstin: "", address: "", state: "", stateCode: "", email: "", phone: ""
      },
      buyer: {
        businessName: "", gstin: "", address: "", state: "", stateCode: ""
      },
      lineItems: [
        { id: crypto.randomUUID(), description: "", sacCode: "", sacCodeSource: "manual", quantity: 1, rateInPaise: 0, taxableValueInPaise: 0 }
      ],
      taxBreakdown: {
        taxableValueInPaise: 0, taxType: "IGST", cgstRatePercent: null, sgstRatePercent: null, igstRatePercent: null, cgstAmountInPaise: null, sgstAmountInPaise: null, igstAmountInPaise: null, totalInPaise: 0
      },
      placeOfSupply: "",
    },
    mode: "onChange"
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar Minimal */}
      <header className="border-b bg-card h-14 flex items-center px-4 md:px-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mr-2 hidden md:flex">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="font-bold tracking-tight text-brand-teal">GSTAutopilot</span>
        <div className="ml-auto flex items-center gap-4">
          <Link to="/dashboard" className="text-sm font-medium hover:text-brand-teal transition-colors">Dashboard</Link>
          <Link to="/settings" className="text-sm font-medium hover:text-brand-teal transition-colors">Settings</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">Fill in the details below. The live preview will update automatically.</p>
        </div>

        <FormProvider {...methods}>
          <form className="grid lg:grid-cols-[55%_45%] gap-8 items-start">
            {/* Left Column - Form */}
            <div className="space-y-6">
              <GSTINSection />
              <BuyerDetailsSection />
              <LineItemsSection />
            </div>

            {/* Right Column - Preview */}
            <div className="hidden lg:block">
              <LivePreviewPanel />
            </div>

            {/* Mobile Preview stacked at bottom */}
            <div className="lg:hidden mt-8">
              <LivePreviewPanel />
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}
