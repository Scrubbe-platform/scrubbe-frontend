"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const IdleLoader = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-10">
        {/* ── Brand ── */}
        <div className="flex items-center flex-col justify-center gap-3 mx-auto w-full">
          <motion.div
            key="logo-full"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-20 w-[160px] shrink-0 relative"
          >
            <Image
              src="/IMS/blacklogo.png"
              alt="scrubbe"
              fill
              className="object-contain"
            />
          </motion.div>

          <div className="loader"></div>
        </div>
      </div>
    </div>
  );
};

export default IdleLoader;
