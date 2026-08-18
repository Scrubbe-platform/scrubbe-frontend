"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const STORAGE_KEY = "scrubbe_nvidia_modal_last_shown";

export default function NvidiaInceptionModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastShown =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : today;
    if (lastShown === today) return;

    const timer = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(STORAGE_KEY, today);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[420px] rounded-2xl border border-white bg-white p-7 shadow-2xl backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={15} />
            </button>

            <img
              src="/nvidia.jfif"
              alt="NVIDIA"
              className="w-[150px] object-contain"
            />

            <h2 className="mt-4 text-[18px] font-semibold leading-snug text-gray-950">
              Backed by NVIDIA Inception
            </h2>

            <p className="mt-2.5 text-[14px] leading-relaxed text-gray-600">
              Scrubbe is a member of the NVIDIA Inception Program, exploring
              NVIDIA accelerated computing to power the next generation of
              autonomous incident response.
            </p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-xl bg-IMSLightGreen py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-IMSLightGreen/90"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
