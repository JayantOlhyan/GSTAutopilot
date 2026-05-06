import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { InvoiceData, indianStates } from "@gstautopilot/shared";
import { useEffect } from "react";

export function BuyerDetailsSection() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<InvoiceData>();
  
  const buyerStateCode = watch("buyer.stateCode");

  // Auto-fill state name if stateCode is updated by GSTIN validation
  useEffect(() => {
    if (buyerStateCode) {
      const stateObj = indianStates.find(s => s.gstCode === buyerStateCode);
      if (stateObj) {
        setValue("buyer.state", stateObj.name, { shouldValidate: true });
        setValue("placeOfSupply", stateObj.gstCode); // Default POS to buyer's state
      }
    }
  }, [buyerStateCode, setValue]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateName = e.target.value;
    setValue("buyer.state", stateName, { shouldValidate: true });
    const selectedState = indianStates.find(s => s.name === stateName);
    if (selectedState) {
      setValue("buyer.stateCode", selectedState.gstCode, { shouldValidate: true });
      setValue("placeOfSupply", selectedState.gstCode);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Buyer Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="buyerName">Company Name</Label>
          <Input id="buyerName" {...register("buyer.businessName")} placeholder="Client Company Pvt Ltd" />
          {errors.buyer?.businessName && <p className="text-sm text-destructive">{errors.buyer.businessName.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="buyerAddress">Billing Address</Label>
          <Input id="buyerAddress" {...register("buyer.address")} placeholder="Full address" />
          {errors.buyer?.address && <p className="text-sm text-destructive">{errors.buyer.address.message}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="buyerState">State</Label>
            <Select 
              id="buyerState" 
              {...register("buyer.state")} 
              onChange={handleStateChange}
              options={indianStates.map(s => ({ label: s.name, value: s.name }))} 
            />
            {errors.buyer?.state && <p className="text-sm text-destructive">{errors.buyer.state.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pos">Place of Supply (State Code)</Label>
            <Select 
              id="pos" 
              {...register("placeOfSupply")} 
              options={indianStates.map(s => ({ label: `${s.name} (${s.gstCode})`, value: s.gstCode }))} 
            />
            {errors.placeOfSupply && <p className="text-sm text-destructive">{errors.placeOfSupply.message}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
