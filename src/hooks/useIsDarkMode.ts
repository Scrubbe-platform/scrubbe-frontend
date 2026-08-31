"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/themeStore";

/**
 * Resolves the app's theme preference (including "system") down to a plain
 * boolean, mirroring the exact logic ThemeProvider uses to toggle the `dark`
 * class on <html>. For things Tailwind's `dark:` variant can't reach — like
 * Chart.js configs, which set colors via JS objects rather than CSS — this
 * is the reactive source of truth to key off instead.
 */
export function useIsDarkMode(): boolean {
  const theme = useThemeStore((state) => state.theme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      setIsDark(theme === "dark" || (theme === "system" && media.matches));
    };
    update();
    if (theme === "system") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
  }, [theme]);

  return isDark;
}
