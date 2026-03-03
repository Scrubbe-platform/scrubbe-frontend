"use client";
import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <div className="w-screen min-w-[1280px] h-screen dark:bg-[#111827] bg-white overflow-clip">
      <div className="flex w-full h-full">
        <Sidebar />
        <div className="w-full h-full">
          <Navbar />
          <motion.div
            key={pathname}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              type: "tween",
            }}
            className="w-full bg-[#F9FAFB] dark:bg-[#1F2937] h-[calc(100vh-80px)] overflow-y-auto"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWrapper;
