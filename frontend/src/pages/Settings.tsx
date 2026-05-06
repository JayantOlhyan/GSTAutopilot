import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sellerDetailsSchema } from "@gstautopilot/shared";
import type { z } from "zod";
import { useSettingsStore, useAiSettingsStore } from "@/stores/settingsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { indianStates } from "@gstautopilot/shared";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

type ProfileFormValues = z.infer<typeof sellerDetailsSchema>;

export default function Settings() {
  const { sellerProfile, setSellerProfile } = useSettingsStore();
  const { aiEnabled, setAiEnabled } = useAiSettingsStore();

  const { register, handleSubmit, formState: { errors, isDirty }, reset, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(sellerDetailsSchema),
    defaultValues: sellerProfile || {
      businessName: "",
      gstin: "",
      address: "",
      state: "",
      stateCode: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (sellerProfile) {
      reset(sellerProfile);
    }
  }, [sellerProfile, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    setSellerProfile(data);
    toast.success("Settings saved successfully.");
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateVal = e.target.value;
    setValue("state", stateVal, { shouldValidate: true, shouldDirty: true });
    const selectedState = indianStates.find(s => s.name === stateVal);
    if (selectedState) {
      setValue("stateCode", selectedState.code, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/invoice">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>
                Your business details will be used as the default seller information on new invoices.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input id="businessName" placeholder="Acme Corp" {...register("businessName")} />
                    {errors.businessName && <p className="text-sm text-destructive">{errors.businessName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input id="gstin" placeholder="27ABCDE1234F1Z5" {...register("gstin")} />
                    {errors.gstin && <p className="text-sm text-destructive">{errors.gstin.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 Business Street, Tech Park" {...register("address")} />
                  {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select id="state" {...register("state")} onChange={handleStateChange} options={indianStates.map(s => ({ label: s.name, value: s.name }))} />
                    {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stateCode">State Code (Auto-filled)</Label>
                    <Input id="stateCode" disabled {...register("stateCode")} />
                    {errors.stateCode && <p className="text-sm text-destructive">{errors.stateCode.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="contact@acme.com" {...register("email")} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="9876543210" {...register("phone")} />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 py-4 flex justify-end">
                <Button type="submit" disabled={!isDirty}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Settings</CardTitle>
              <CardDescription>
                Configure the AI assistant for your invoices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-detect SAC code using AI</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically suggest the correct 6-digit SAC code when you type a service description.
                  </p>
                </div>
                <Switch
                  checked={aiEnabled}
                  onCheckedChange={(checked) => {
                    setAiEnabled(checked);
                    toast.success(checked ? "AI Auto-detect enabled." : "AI Auto-detect disabled.");
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
