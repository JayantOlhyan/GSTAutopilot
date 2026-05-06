import { create } from "zustand";
import { InvoiceData } from "@gstautopilot/shared";

interface InvoiceState {
  currentInvoice: InvoiceData | null;
  setCurrentInvoice: (invoice: InvoiceData) => void;
  clearCurrentInvoice: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  currentInvoice: null,
  setCurrentInvoice: (invoice) => set({ currentInvoice: invoice }),
  clearCurrentInvoice: () => set({ currentInvoice: null }),
}));
