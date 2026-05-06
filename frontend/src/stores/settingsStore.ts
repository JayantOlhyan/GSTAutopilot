import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SellerDetails } from "@gstautopilot/shared";

// Custom storage to map the state directly to the root of localStorage value,
// rather than wrapping it in a zustand state wrapper if we want exact schema match,
// but zustand persist usually wraps it. Let's use standard persist for now 
// or implement custom logic to match WRD perfectly.
// WRD: "The schema stored must match the SellerDetails interface exactly."
// We can use custom storage for this store.

interface SettingsState {
  sellerProfile: SellerDetails | null;
  setSellerProfile: (profile: SellerDetails) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sellerProfile: null,
      setSellerProfile: (profile) => set({ sellerProfile: profile }),
    }),
    {
      name: "gstautopilot_settings",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return { state: { sellerProfile: JSON.parse(str) } } as any;
        },
        setItem: (name, value: any) => {
          localStorage.setItem(name, JSON.stringify(value.state.sellerProfile));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

interface AiSettingsState {
  aiEnabled: boolean;
  setAiEnabled: (enabled: boolean) => void;
}

export const useAiSettingsStore = create<AiSettingsState>()(
  persist(
    (set) => ({
      aiEnabled: true, // Default to true
      setAiEnabled: (enabled) => set({ aiEnabled: enabled }),
    }),
    {
      name: "gstautopilot_ai_enabled",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (str === null) return null;
          return { state: { aiEnabled: str === "true" } } as any;
        },
        setItem: (name, value: any) => {
          localStorage.setItem(name, String(value.state.aiEnabled));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
