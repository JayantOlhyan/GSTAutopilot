import { InvoiceData, SellerDetails } from "@gstautopilot/shared";

export async function saveInvoice(invoice: InvoiceData): Promise<void> {
  throw new Error("NotImplementedError");
}

export async function getInvoicesByMonth(monthYear: string): Promise<InvoiceData[]> {
  throw new Error("NotImplementedError");
}

export async function getUserSettings(userId: string): Promise<SellerDetails | null> {
  throw new Error("NotImplementedError");
}
