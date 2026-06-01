"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/lib/stores/useSidebar";
import { useCommands } from "@/lib/stores/command.store";
import { useThemeStore } from "@/store/themeStore";
import Modal from "../ui/Modal";
import GlobalSearch from "./Dashboard/GlobalSearch";
import { Terminal } from "lucide-react";
import clsx from "clsx";
import { BsArrowBarLeft } from "react-icons/bs";
import DesktopRestrictionScreen from "./DesktopRetrictionScreen";

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const { collapse, toggle } = useSidebar();
  const pathname = usePathname();
  const { setOpenCommandPalette, openCommandPalette } = useCommands();
  const { theme } = useThemeStore();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  const isMobile = width < 768;

  // Apply theme class to <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark = theme === "dark" || prefersDark;
    root.classList.toggle("dark", isDark);
  }, [theme]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (!collapse && window.innerWidth < 768) {
      toggle();
    }
  }, [pathname]);

  return (
    <div className="w-full bg-white dark:bg-dark h-screen overflow-hidden flex flex-col md:flex-row relative">
      {/* ── 1. Mobile navbar ── */}
      <div className="md:hidden w-full h-16 flex items-center px-5 gap-4 border-b border-zinc-200 dark:border-white/10 bg-white dark:bg-dark z-[55]">
        <div className="h-6">
          {/* light logo */}
          <img
            src="/IMS/darklogo.png"
            alt="logo"
            className="h-full object-contain block dark:hidden"
          />
          {/* dark logo */}
          <img
            src="/IMS/whitelogo.png"
            alt="logo"
            className="h-full object-contain hidden dark:block"
          />
        </div>
      </div>

      {/* ── 2. Sidebar re-open button (collapsed state) ── */}
      <div
        onClick={toggle}
        className={clsx(
          "cursor-pointer",
          collapse
            ? "absolute z-50 left-10 transition-all duration-150 ease-out rotate-180 bottom-12 bg-IMSLightGreen size-10 shadow-lg rounded-full hidden md:flex justify-center items-center"
            : "hidden"
        )}
      >
        <BsArrowBarLeft className="text-white" />
      </div>

      {/* ── 3. Mobile sidebar backdrop ── */}
      {!collapse && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
          onClick={toggle}
        />
      )}

      <div className="flex flex-1 w-full h-full overflow-hidden">
        {/* Sidebar */}
        {!isMobile && <Sidebar />}

        {/* ── 4. Main content area ── */}
        <div className="flex-1 h-full overflow-hidden flex flex-col bg-zinc-50 dark:bg-dark">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full overflow-y-auto relative p-4 md:p-0"
          >
            {isMobile ? <DesktopRestrictionScreen /> : children}

            {/* ── Command palette button ── */}
            <div className="fixed bottom-6 right-6 z-40">
              <button
                onClick={() => setOpenCommandPalette(true)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full md:rounded-lg text-xs font-medium shadow-2xl transition-all",
                  // light
                  "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-400",
                  // dark
                  "dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500"
                )}
              >
                <Terminal size={14} />
                <span className="hidden sm:inline">Command Palette</span>
                <kbd
                  className={clsx(
                    "hidden md:block ml-1 px-1.5 py-0.5 rounded font-mono text-[10px]",
                    "bg-zinc-100 text-zinc-400 border border-zinc-200",
                    "dark:bg-neutral-800 dark:text-neutral-500 dark:border-neutral-700"
                  )}
                >
                  ⌘K
                </kbd>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <Modal
        onClose={() => setOpenCommandPalette(false)}
        isOpen={openCommandPalette}
      >
        <GlobalSearch />
      </Modal>
    </div>
  );
};

export default DashboardWrapper;
