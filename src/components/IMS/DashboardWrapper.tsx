"use client";
import React, { useEffect } from "react";
import Navbar from "../dashboard/Navbar";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BsArrowBarLeft } from "react-icons/bs";
import clsx from "clsx";
import { useSidebar } from "@/lib/stores/useSidebar";
import { RiMenuFold2Fill } from "react-icons/ri";
import { useCommands } from "@/lib/stores/command.store";
import Modal from "../ui/Modal";
import GlobalSearch from "./Dashboard/GlobalSearch";

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const { collapse, toggle } = useSidebar();
  const pathname = usePathname();
  const { setOpenCommandPalette, openCommandPalette } = useCommands();
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Open command Palette
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        setOpenCommandPalette(true);
      }
    };

    // Attach the listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <div className="w-full bg-dark h-screen  overflow-auto relative">
      <div
        onClick={toggle}
        className={clsx(
          "cursor-pointer",
          collapse
            ? " absolute z-50 left-10 transition-all duration-150 ease-out rotate-180 bottom-12 bg-IMSLightGreen size-10 shadow-lg rounded-full flex justify-center items-center "
            : " hidden"
        )}
      >
        <BsArrowBarLeft className=" text-white" />
      </div>
      <div className="flex w-full h-full min-w-[1400px] ">
        <Sidebar />
        <div className="w-full h-full">
          {/* <Navbar /> */}
          <motion.div
            key={pathname}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              type: "tween",
            }}
            className="w-full  h-[calc(100vh)] overflow-y-auto relative"
          >
            {children}
            <div className=" w-fit sticky bottom-12 left-[80%]">
              <div
                onClick={() => setOpenCommandPalette(true)}
                className="bg-black cursor-pointer text-white shadow-md shadow-white/50 rounded-lg p-2 text-xs  w-fit flex items-center gap-2"
              >
                <RiMenuFold2Fill />
                <p className=" ">Command Palette</p>
                <div className="bg-zinc-700 p-1 rounded-sm">⌘ k</div>
                <div className="bg-zinc-700 p-1 rounded-sm">Ctrl + k</div>
              </div>
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
