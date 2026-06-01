// store/themeStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => {
        set({ theme });
        const root = document.documentElement;
        if (theme === "dark") root.classList.add("dark");
        else if (theme === "light") root.classList.remove("dark");
        else {
          // system — check OS preference
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          root.classList.toggle("dark", prefersDark);
        }
      },
    }),
    {
      name: "theme-storage", // key in localStorage
    }
  )
);
