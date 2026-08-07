import { create } from "zustand";

export type IncidentBannerSource = "MANUAL" | "AUTO";

export interface IncidentBannerPayload {
  id?: string;
  ticketId: string;
  title: string;
  priority?: string | null;
  severity?: string | null;
  source?: IncidentBannerSource;
  link?: string;
}

interface IncidentBannerState {
  banner: (IncidentBannerPayload & { key: number }) | null;
  show: (payload: IncidentBannerPayload) => void;
  hide: () => void;
}

// `key` forces a fresh mount (and animation/auto-dismiss timer) on every
// show() call, even if two incidents arrive back-to-back with identical copy.
export const useIncidentBannerStore = create<IncidentBannerState>((set) => ({
  banner: null,
  show: (payload) => set({ banner: { ...payload, key: Date.now() } }),
  hide: () => set({ banner: null }),
}));
