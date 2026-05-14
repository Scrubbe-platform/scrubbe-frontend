"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const FEATURES = [
  "Platform fee",
  "Team access",
  "Monthly incident capacity",
  "Execution credits",
];

export default function PricingHero() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden md:bg-[url('/IMS/pricing-hero.png')] bg-[url('/IMS/pricing-hero-mobile.png')] bg-no-repeat bg-cover"
      style={{
        minHeight: "420px",
      }}
    >
      {/* ── Content ── */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-8 lg:px-16 py-16 lg:py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 mb-7"
        >
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold"
            style={{
              border: "1px solid rgba(34,197,94,0.45)",
              background: "rgba(34,197,94,0.08)",
              color: "#86efac",
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: "#22c55e" }}
            />
            Pricing built around incidents, not seats
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="font-black text-white leading-[1.08] tracking-[-0.02em] mb-6 max-w-[560px]"
          style={{ fontSize: "clamp(28px, 4vw, 60px)" }}
        >
          Scrubbe scales with your incidents, your automation, and your system
          complexity.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="text-[15px] leading-relaxed mb-10 max-w-[480px] text-slate-100"
        >
          Every plan includes a platform fee, team access, monthly incident
          capacity, and execution credits — so pricing tracks how you actually
          respond, not how many people happen to be online.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap gap-3"
        >
          {FEATURES.map((f) => (
            <div
              key={f}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium"
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                color: "#d1d5db",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2.5 7l3 3 6-6"
                  stroke="#22c55e"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {f}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
