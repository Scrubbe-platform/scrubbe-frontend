"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

export default function WhyScrubbeExists() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      className="relative w-full py-16 px-6 overflow-hidden"
      style={{ background: "#f9fafb" }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="w-full h-full opacity-60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="wgrid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wgrid)" />
        </svg>
      </div>

      {/* Card */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-[1200px] mx-auto rounded-xl overflow-hidden flex flex-col lg:flex-row"
        style={{ background: "#0a0a0a", minHeight: 420 }}
      >
        {/* ── LEFT: Integration diagram image ── */}
        <div className="relative flex items-center justify-center lg:w-1/2 p-10">
          {/* Placeholder shown until real image is provided */}
          <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
            <Image
              src="/IMS/whyscrubbe.jpg"
              alt="Scrubbe integration diagram"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Vertical divider */}
        <div
          className="hidden lg:block shrink-0 w-px self-stretch"
          style={{ background: "#1f2937" }}
        />

        {/* ── RIGHT: Text content ── */}
        <div className="flex flex-col justify-center lg:w-1/2 px-10 py-12">
          {/* Label */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg font-bold tracking-[0.22em] uppercase mb-6"
            style={{ color: "#22c55e", fontFamily: "monospace" }}
          >
            Why Scrubbe exists
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.65,
              delay: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-bold leading-[1.12] tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(24px, 2vw, 40px)" }}
          >
            Systems can observe themselves — but they cannot act on what they
            learn.{" "}
            <span style={{ color: "#22c55e" }}>Scrubbe closes that gap</span> by
            turning fragmented data into clear decisions and executing them
            safely under policy.
          </motion.h2>
        </div>
      </motion.div>
    </section>
  );
}
