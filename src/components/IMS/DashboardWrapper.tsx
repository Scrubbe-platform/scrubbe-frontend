"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { motion, useMotionValue } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/lib/stores/useSidebar";
import { useCommands } from "@/lib/stores/command.store";
import Modal from "../ui/Modal";
import GlobalSearch from "./Dashboard/GlobalSearch";
import { Terminal } from "lucide-react";
import clsx from "clsx";
import { BsArrowBarLeft } from "react-icons/bs";
import DesktopRestrictionScreen from "./DesktopRetrictionScreen";
import IncidentCreatedBanner from "./incident/IncidentCreatedBanner";

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const { collapse, toggle } = useSidebar();
  const pathname = usePathname();
  const { setOpenCommandPalette, openCommandPalette } = useCommands();
  const [width, setWidth] = useState(0);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  const isMobile = width < 768;

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
            src="/IMS/blacklogo.png"
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
            : "hidden",
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

            {/* ── Command palette button — draggable ── */}
            <motion.div
              drag
              dragMomentum={false}
              dragElastic={0}
              style={{
                x: dragX,
                y: dragY,
                bottom: 24,
                right: 24,
                position: "fixed",
              }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
              className="z-40 cursor-grab active:cursor-grabbing touch-none select-none"
              whileDrag={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              }}
            >
              <button
                onClick={() => {
                  router.push("/incident/command-studio");
                }}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full md:rounded-lg text-xs font-medium shadow-2xl transition-all",
                  "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-400",
                  "dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500",
                )}
              >
                <Terminal size={14} />
                <span className="hidden sm:inline">Command Studio</span>
                <kbd
                  className={clsx(
                    "hidden md:block ml-1 px-1.5 py-0.5 rounded font-mono text-[10px]",
                    "bg-zinc-100 text-zinc-400 border border-zinc-200",
                    "dark:bg-neutral-800 dark:text-neutral-500 dark:border-neutral-700",
                  )}
                >
                  ⌘K
                </kbd>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Modal
        onClose={() => setOpenCommandPalette(false)}
        isOpen={openCommandPalette}
      >
        <GlobalSearch />
      </Modal>

      <IncidentCreatedBanner />
    </div>
  );
};

export default DashboardWrapper;
