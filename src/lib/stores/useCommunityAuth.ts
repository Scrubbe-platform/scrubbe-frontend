import { create } from "zustand";

type State = {
  modalType: "signin" | "signup" | "forgot-password" | undefined;
  open: boolean;
  setOpen: (
    open: boolean,
    type: "signin" | "signup" | "forgot-password"
  ) => void;
  setClose: () => void;
};
export const useCommunityAuth = create<State>((set) => ({
  modalType: undefined,
  open: false,
  setOpen: (open, type) => {
    set({ modalType: type, open });
  },
  setClose: () => {
    set({ modalType: undefined, open: false });
  },
}));
