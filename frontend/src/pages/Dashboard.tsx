import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, FileText, IndianRupee, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InvoiceData } from "@gstautopilot/shared";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";

export default function Dashboard() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const sessionStr = sessionStorage.getItem("gstautopilot_session_invoices");
    if (sessionStr) {
      try {
        const parsed = JSON.parse(sessionStr);
        setInvoices(parsed);
      } catch (e) {
        console.error("Failed to parse session invoices");
      }
    }
  }, []);

  const totalInvoices = invoices.length;
  const totalTaxable = invoices.reduce((acc, inv) => acc + inv.taxBreakdown.taxableValueInPaise, 0);
  const totalGst = invoices.reduce((acc, inv) => {
    const tb = inv.taxBreakdown;
    return acc + (tb.cgstAmountInPaise || 0) + (tb.sgstAmountInPaise || 0) + (tb.igstAmountInPaise || 0);
  }, 0);

  const formatRs = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

  // Chart data: Group by date
  const chartDataMap = invoices.reduce((acc: Record<string, number>, inv) => {
    const date = inv.invoiceDate;
    acc[date] = (acc[date] || 0) + (inv.taxBreakdown.taxableValueInPaise / 100);
    return acc;
  }, {});
  
  const chartData = Object.keys(chartDataMap).map(date => ({
    name: date,
    value: chartDataMap[date]
  })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  const handleExportGSTR1 = async () => {
    if (invoices.length === 0) {
      toast.error("No invoices available to export.");
      return;
    }
    setIsExporting(true);
    try {
      // Just use the current month as period for MVP
      const now = new Date();
      const period = `${String(now.getMonth() + 1).padStart(2, "0")}${now.getFullYear()}`;
      
      const res = await apiClient.post("/api/invoice/generate-gstr1", {
        invoices,
        period
      }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `gstr1-${period}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      toast.success("GSTR-1 JSON downloaded successfully!");
    } catch (err) {
      toast.error("Failed to generate GSTR-1 export.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card h-14 flex items-center px-4 md:px-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="font-bold tracking-tight text-brand-teal">GSTAutopilot</span>
        <div className="ml-auto flex items-center gap-4">
          <Link to="/invoice" className="text-sm font-medium hover:text-brand-teal transition-colors">New Invoice</Link>
          <Link to="/settings" className="text-sm font-medium hover:text-brand-teal transition-colors">Settings</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Session Dashboard</h1>
            <p className="text-muted-foreground mt-1">Invoices generated in the current browser session.</p>
          </div>
          <Button onClick={handleExportGSTR1} disabled={isExporting || invoices.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export GSTR-1 JSON"}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalInvoices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Taxable Value</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatRs(totalTaxable)}</div>
            </CardContent>
          </Card>
          <Card className="bg-brand-teal text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-brand-teal-foreground">Total GST Collected</CardTitle>
              <PieChart className="h-4 w-4 text-brand-teal-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatRs(totalGst)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Taxable Value Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} formatter={(val: number) => [`₹${val.toFixed(2)}`, 'Value']} />
                    <Bar dataKey="value" fill="#00B894" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No data to display</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/invoice" className="block">
                <Button className="w-full" variant="outline">Create New Invoice</Button>
              </Link>
              <Link to="/settings" className="block">
                <Button className="w-full" variant="outline">Update Profile</Button>
              </Link>
              <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground mt-8">
                Note: This MVP dashboard displays session data only. Refreshing the browser without creating invoices will show an empty state.
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.slice().reverse().map((inv, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell>{inv.invoiceDate}</TableCell>
                      <TableCell>{inv.buyer.businessName}</TableCell>
                      <TableCell>
                        <Badge variant={inv.buyer.gstin ? "default" : "secondary"}>
                          {inv.buyer.gstin ? "B2B" : "B2C"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatRs(inv.taxBreakdown.totalInPaise)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No invoices generated in this session yet.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
