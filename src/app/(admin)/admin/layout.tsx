"use client";
import React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BsArrowBarLeft } from "react-icons/bs";
import clsx from "clsx";
import { useSidebar } from "@/lib/stores/useSidebar";
import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/admin/Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { collapse, toggle } = useSidebar();
  const pathname = usePathname();
  return (
    <div className="w-full  h-screen dark:bg-[#111827] bg-white overflow-auto relative">
      <div
        onClick={toggle}
        className={clsx(
          "cursor-pointer",
          collapse
            ? " absolute left-3 transition-all duration-150 ease-out rotate-180 bottom-[10px] bg-IMSLightGreen size-10 shadow-lg rounded-full flex justify-center items-center "
            : " hidden"
        )}
      >
        <BsArrowBarLeft className=" text-white" />
      </div>
      <div className="flex w-full h-full min-w-[1400px] ">
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

export default Layout;
