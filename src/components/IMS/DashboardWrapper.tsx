"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/lib/stores/useSidebar";
import { useCommands } from "@/lib/stores/command.store";
import Modal from "../ui/Modal";
import GlobalSearch from "./Dashboard/GlobalSearch";
import { Terminal, Menu, X } from "lucide-react";
import clsx from "clsx";
import { BsArrowBarLeft } from "react-icons/bs";
import DesktopRestrictionScreen from "./DesktopRetrictionScreen";

const includedPage = ["code-engine", "ticket"];
const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const { collapse, toggle } = useSidebar();
  const pathname = usePathname();
  const { setOpenCommandPalette, openCommandPalette } = useCommands();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // This will NOT run during 'npm run build'
    setWidth(window.innerWidth);
  }, []);
  let isMobile = width < 768;

  // Close sidebar automatically when route changes on mobile
  useEffect(() => {
    if (!collapse && window.innerWidth < 768) {
      toggle();
    }
  }, [pathname]);

  return (
    <div className="w-full bg-dark h-screen overflow-hidden flex flex-col md:flex-row relative">
      {/* 1. MOBILE NAVBAR (Logo Left, Menu Right) */}
      <div className="md:hidden w-full h-16 flex items-center px-5 gap-4 border-b border-white/10 bg-dark z-[55]">
        <button
          onClick={toggle}
          className="p-2 text-white bg-white/5 rounded-lg active:scale-95 transition-transform"
        >
          {collapse ? <Menu size={20} /> : <X size={20} />}
        </button>
        <div className="h-6">
          <img
            src="/IMS/whitelogo.png"
            alt="logo"
            className="h-full object-contain"
          />
        </div>
      </div>
      <div
        onClick={toggle}
        className={clsx(
          "cursor-pointer",
          collapse
            ? " absolute z-50 left-10 transition-all duration-150 ease-out rotate-180 bottom-12 bg-IMSLightGreen size-10 shadow-lg rounded-full hidden md:flex justify-center items-center "
            : " hidden"
        )}
      >
        <BsArrowBarLeft className=" text-white" />
      </div>
      {/* 2. SIDEBAR OVERLAY (Mobile) */}
      {/* This ensures that when the sidebar opens on mobile, it darkens the background */}
      {!collapse && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
          onClick={toggle}
        />
      )}

      <div className="flex flex-1 w-full h-full overflow-hidden">
        {/* Sidebar Component */}
        <Sidebar />

        {/* 3. MAIN CONTENT AREA */}
        <div className="flex-1 h-full overflow-hidden flex flex-col">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full overflow-y-auto relative p-4 md:p-0"
          >
            {includedPage.some((page) => pathname.includes(page)) ? (
              children
            ) : (
              <>{isMobile ? <DesktopRestrictionScreen /> : children}</>
            )}

            {/* Command Palette Floating Button */}
            <div className="fixed bottom-6 right-6 z-40">
              <button
                onClick={() => setOpenCommandPalette(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full md:rounded-lg text-xs font-medium bg-neutral-900 border border-neutral-700 text-neutral-400 hover:border-neutral-500 shadow-2xl transition-all"
              >
                <Terminal size={14} />
                <span className="hidden sm:inline">Command Palette</span>
                <kbd className="hidden md:block ml-1 px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 font-mono text-[10px] border border-neutral-700">
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
