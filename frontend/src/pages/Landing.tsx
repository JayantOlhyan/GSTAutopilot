import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, ShieldCheck, FileText, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-brand-teal" />
            <span className="font-bold text-xl tracking-tight">GSTAutopilot</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#" className="text-sm font-medium hover:text-brand-teal transition-colors">Product</a>
            <a href="#" className="text-sm font-medium hover:text-brand-teal transition-colors">Resources</a>
            <a href="#" className="text-sm font-medium hover:text-brand-teal transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/invoice">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-card to-background relative overflow-hidden">
          <div className="container mx-auto px-4 text-center z-10 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal"></span>
              </span>
              AI-Powered GST Invoicing
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight mb-6">
              Automate Your GST Invoices with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-amber">Confidence</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Generate GST-compliant invoices in seconds. Auto-detect SAC codes using AI, split taxes correctly, and export GSTR-1 JSON files flawlessly.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/invoice">
                <Button size="lg" className="h-12 px-8 text-base">Start Generating Now</Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">View Dashboard</Button>
              </Link>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-teal/5 rounded-full blur-3xl -z-10"></div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need to stay compliant</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We've built the most intuitive invoicing tool for Indian freelancers and small businesses. No accounting jargon, just pure simplicity.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-brand-teal/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-brand-teal" />
                  </div>
                  <CardTitle>AI SAC Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Just type what you do. Our Gemini 2.5 AI automatically finds the correct 6-digit SAC code for your service instantly.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-brand-teal/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-brand-amber/10 rounded-lg flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-brand-amber" />
                  </div>
                  <CardTitle>Error-Free Taxes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Intra-state or Inter-state? We automatically calculate CGST, SGST, or IGST based on verified GSTINs to ensure 100% compliance.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-brand-teal/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle>GSTR-1 Ready</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Stop manually entering data on the GST portal. Export your invoices directly into the official GSTN B2B JSON format.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Zap className="h-5 w-5 text-brand-teal opacity-50" />
            <span className="font-semibold">GSTAutopilot</span>
          </div>
          <p className="text-sm">Built for Indian Small Businesses.</p>
        </div>
      </footer>
    </div>
  );
}
