/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

export type IncidentNotification = {
  kind?: string;
  title?: string;
  message?: string;
  incidentId?: string;
  ticketId?: string;
  summary?: string | null;
  priority?: string | null;
  status?: string | null;
  businessId?: string | null;
  link?: string;
  timestamp?: string;
  updatedBy?: string;
};

type State = {
  notification: IncidentNotification[];
};

type Action = {
  addNotification: (value: IncidentNotification) => void;
  clearNotification: () => void;
};

export const useNotification = create<State & Action>((set) => ({
  notification: [],
  addNotification: (value) => {
    set((prev) => ({ notification: [...prev.notification, value] }));
  },
  clearNotification() {
    set({ notification: [] });
  },
}));
