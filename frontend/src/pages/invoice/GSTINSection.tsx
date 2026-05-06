import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { InvoiceData } from "@gstautopilot/shared";
import { apiClient } from "@/lib/axios";
import { useState } from "react";

export function GSTINSection() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<InvoiceData>();
  
  const [sellerValid, setSellerValid] = useState<boolean | null>(null);
  const [buyerValid, setBuyerValid] = useState<boolean | null>(null);
  const [sellerError, setSellerError] = useState<string>("");
  const [buyerError, setBuyerError] = useState<string>("");

  const sellerStateCode = watch("seller.stateCode");
  const buyerStateCode = watch("buyer.stateCode");

  const validateGstin = async (gstin: string, type: "seller" | "buyer") => {
    if (!gstin || gstin.length !== 15) return;
    try {
      const res = await apiClient.post("/api/gstin/validate", { gstin });
      if (res.data.valid) {
        if (type === "seller") {
          setSellerValid(true);
          setSellerError("");
          setValue("seller.stateCode", res.data.stateCode);
          // Can auto-select state in UI here if desired
        } else {
          setBuyerValid(true);
          setBuyerError("");
          setValue("buyer.stateCode", res.data.stateCode);
        }
      } else {
        if (type === "seller") {
          setSellerValid(false);
          setSellerError(res.data.error);
        } else {
          setBuyerValid(false);
          setBuyerError(res.data.error);
        }
      }
    } catch (err) {
      // Don't show toast for blur validation errors, just inline
      if (type === "seller") {
        setSellerValid(false);
        setSellerError("Validation failed.");
      } else {
        setBuyerValid(false);
        setBuyerError("Validation failed.");
      }
    }
  };

  const getTaxTypeBadge = () => {
    if (sellerValid && buyerValid && sellerStateCode && buyerStateCode) {
      if (sellerStateCode === buyerStateCode) {
        return <Badge variant="secondary" className="ml-2">CGST + SGST</Badge>;
      }
      return <Badge variant="secondary" className="ml-2">IGST</Badge>;
    }
    return null;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          GSTIN Details {getTaxTypeBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sellerGstin">Seller GSTIN</Label>
          <div className="relative">
            <Input 
              id="sellerGstin" 
              {...register("seller.gstin")} 
              onBlur={(e) => validateGstin(e.target.value, "seller")}
              placeholder="e.g. 27ABCDE1234F1Z5"
              className="pr-10"
            />
            <div className="absolute right-3 top-2.5">
              {sellerValid === true && <CheckCircle2 className="h-5 w-5 text-brand-teal" />}
              {sellerValid === false && <XCircle className="h-5 w-5 text-destructive" title={sellerError} />}
            </div>
          </div>
          {errors.seller?.gstin && <p className="text-sm text-destructive">{errors.seller.gstin.message}</p>}
          {sellerValid === false && <p className="text-sm text-destructive">{sellerError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyerGstin">Buyer GSTIN (Optional)</Label>
          <div className="relative">
            <Input 
              id="buyerGstin" 
              {...register("buyer.gstin")} 
              onBlur={(e) => validateGstin(e.target.value, "buyer")}
              placeholder="Leave blank for B2C"
              className="pr-10"
            />
            <div className="absolute right-3 top-2.5">
              {buyerValid === true && <CheckCircle2 className="h-5 w-5 text-brand-teal" />}
              {buyerValid === false && <XCircle className="h-5 w-5 text-destructive" title={buyerError} />}
            </div>
          </div>
          {errors.buyer?.gstin && <p className="text-sm text-destructive">{errors.buyer.gstin.message}</p>}
          {buyerValid === false && <p className="text-sm text-destructive">{buyerError}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
