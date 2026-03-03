"use client";
import React from "react";
import EzraNavbar from "./EzraNavbar";
import Sidebar from "../dashboard/Sidebar";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <div className=" w-screen  h-screen dark:bg-[#111827] bg-white overflow-clip">
      <div className="flex w-full h-full">
        <Sidebar type="ezra" />
        <div className="w-full h-full">
          <EzraNavbar />
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
