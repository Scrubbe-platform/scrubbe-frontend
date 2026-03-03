/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

type State = {
  notification: any[];
};

type Action = {
  addNotification: (value: any) => void;
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
