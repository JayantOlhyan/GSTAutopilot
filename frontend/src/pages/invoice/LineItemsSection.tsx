import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Sparkles } from "lucide-react";
import { InvoiceData } from "@gstautopilot/shared";
import { useAiSettingsStore } from "@/stores/settingsStore";
import { apiClient } from "@/lib/axios";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";

function LineItemRow({ index, remove, canRemove }: { index: number, remove: (i: number) => void, canRemove: boolean }) {
  const { register, watch, setValue } = useFormContext<InvoiceData>();
  const aiEnabled = useAiSettingsStore(state => state.aiEnabled);

  const description = watch(`lineItems.${index}.description`);
  const debouncedDescription = useDebounce(description, 800);
  // const qty = watch(`lineItems.${index}.quantity`);
  const rateInRupees = watch(`lineItems.${index}.rateInPaise`); // Assuming we bind the input directly and handle conversion later or via custom register

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ sac: string, desc: string, conf: string, assumption: string | null } | null>(null);

  useEffect(() => {
    if (debouncedDescription && debouncedDescription.length >= 3 && aiEnabled) {
      detectSac(debouncedDescription);
    }
  }, [debouncedDescription]);

  const detectSac = async (desc: string) => {
    setAiLoading(true);
    try {
      const res = await apiClient.post("/api/ai/detect-sac", { description: desc });
      const data = res.data;
      setAiSuggestion({ sac: data.sacCode, desc: data.serviceName, conf: data.confidence, assumption: data.assumption });
      
      if (data.confidence === "high" || data.confidence === "medium") {
        setValue(`lineItems.${index}.sacCode`, data.sacCode);
        setValue(`lineItems.${index}.sacCodeSource`, "ai");
      }
    } catch (err) {
      // Silent fail for AI
    } finally {
      setAiLoading(false);
    }
  };

  const handleSacChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(`lineItems.${index}.sacCode`, e.target.value);
    setValue(`lineItems.${index}.sacCodeSource`, "manual");
  };

  // The input for rate expects rupees from user, but we store paise in the form object.
  // Wait, RHF maps directly to the object. Let's create local state for the input and sync it.
  const [rateDisplay, setRateDisplay] = useState(rateInRupees ? (rateInRupees / 100).toString() : "0");

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRateDisplay(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setValue(`lineItems.${index}.rateInPaise`, Math.round(parsed * 100));
      // update taxable value
      const q = watch(`lineItems.${index}.quantity`) || 0;
      setValue(`lineItems.${index}.taxableValueInPaise`, Math.round(parsed * 100) * q);
    }
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = parseInt(e.target.value) || 0;
    setValue(`lineItems.${index}.quantity`, q);
    const r = watch(`lineItems.${index}.rateInPaise`) || 0;
    setValue(`lineItems.${index}.taxableValueInPaise`, r * q);
  };

  const currentAmount = ((watch(`lineItems.${index}.taxableValueInPaise`) || 0) / 100).toFixed(2);

  return (
    <div className="grid grid-cols-[2fr_1fr_80px_100px_100px_40px] gap-4 items-start border-b pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <div className="space-y-2">
        <Label className="md:hidden">Description</Label>
        <Input placeholder="Service description" {...register(`lineItems.${index}.description`)} />
        {aiLoading && <p className="text-xs text-muted-foreground flex items-center"><Sparkles className="h-3 w-3 mr-1 animate-pulse" /> Detecting SAC...</p>}
        {aiSuggestion && !aiLoading && (
          <div className="mt-1">
            {aiSuggestion.conf === "low" ? (
              <Badge variant="warning" className="text-[10px] py-0">
                <Sparkles className="h-3 w-3 mr-1" /> AI: {aiSuggestion.sac} - {aiSuggestion.assumption}
              </Badge>
            ) : (
              <Badge variant="success" className="text-[10px] py-0 bg-brand-teal/20 text-brand-teal border-brand-teal/20 hover:bg-brand-teal/30">
                <Sparkles className="h-3 w-3 mr-1" /> AI Detected: {aiSuggestion.sac} - {aiSuggestion.desc}
              </Badge>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label className="md:hidden">SAC Code</Label>
        <Input 
          placeholder="000000" 
          value={watch(`lineItems.${index}.sacCode`)} 
          onChange={handleSacChange} 
        />
      </div>

      <div className="space-y-2">
        <Label className="md:hidden">Qty</Label>
        <Input type="number" min="1" value={watch(`lineItems.${index}.quantity`)} onChange={handleQtyChange} />
      </div>

      <div className="space-y-2">
        <Label className="md:hidden">Rate (₹)</Label>
        <Input type="number" step="0.01" min="0" value={rateDisplay} onChange={handleRateChange} />
      </div>

      <div className="space-y-2 pt-2 text-right font-medium">
        <Label className="md:hidden block text-left">Amount</Label>
        ₹{currentAmount}
      </div>

      <div className="pt-1">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => remove(index)} 
          disabled={!canRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function LineItemsSection() {
  const { control, formState: { errors } } = useFormContext<InvoiceData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems"
  });

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Line Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden md:grid grid-cols-[2fr_1fr_80px_100px_100px_40px] gap-4 mb-4 text-sm font-medium text-muted-foreground">
          <div>Service Description</div>
          <div>SAC Code</div>
          <div>Quantity</div>
          <div>Rate</div>
          <div className="text-right">Amount</div>
          <div></div>
        </div>
        
        {fields.map((field, index) => (
          <LineItemRow key={field.id} index={index} remove={remove} canRemove={fields.length > 1} />
        ))}
        {errors.lineItems && <p className="text-sm text-destructive mt-2">{errors.lineItems.message}</p>}
      </CardContent>
      <CardFooter>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          onClick={() => append({ id: crypto.randomUUID(), description: "", sacCode: "", sacCodeSource: "manual", quantity: 1, rateInPaise: 0, taxableValueInPaise: 0 })}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Row
        </Button>
      </CardFooter>
    </Card>
  );
}
