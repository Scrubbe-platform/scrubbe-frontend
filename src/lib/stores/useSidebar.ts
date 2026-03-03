/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

type State = {
  collapse: boolean;
};

type Action = {
  toggle: () => void;
};

export const useSidebar = create<State & Action>((set) => ({
  collapse: false,
  toggle: () => {
    set((prev) => ({ collapse: !prev.collapse }));
  },
}));
