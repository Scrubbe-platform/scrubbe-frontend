import { create } from "zustand";

type State = {
  pathname: string;
};

type Action = {
  setPathname: (name: string) => void;
};

export const useEzraMockStore = create<State & Action>((set) => ({
  pathname: "dashboard",
  setPathname(name) {
    set({ pathname: name });
  },
}));
