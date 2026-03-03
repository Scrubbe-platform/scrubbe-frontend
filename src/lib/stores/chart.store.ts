import { create } from "zustand";

type State = {
  tabs: {
    value: string;
    label: string;
  }[];
};

type Action = {
  setTab: ({ value, label }: { value: string; label: string }) => void;
  removeTab: ({ value, label }: { value: string; label: string }) => void;
};

export const useChart = create<State & Action>((set) => ({
  tabs: [],
  setTab(name) {
    set((prev) => {
      const isExist = prev.tabs.find((value) => value.value == name.value);
      if (isExist) {
        return { tabs: prev.tabs };
      }
      return { tabs: [...prev.tabs, name] };
    });
  },
  removeTab(item) {
    set((prev) => {
      const value = prev.tabs.filter((value) => value.value != item.value);
      return { tabs: value };
    });
  },
}));
