import { create } from "zustand";

type State = {
  openCommandPalette: boolean;
};

type Action = {
  setOpenCommandPalette: (value: boolean) => void;
};

export const useCommands = create<State & Action>((set) => ({
  openCommandPalette: false,
  setOpenCommandPalette(value) {
    set({ openCommandPalette: value });
  },
}));
