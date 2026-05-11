"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─────────────────────────────────────────────────────────────────
// Pipeline steps data
// ─────────────────────────────────────────────────────────────────

const STEPS = [
  {
    tags: ["Logs", "Metrics", "Alerts"],
    title: "Signals",
    desc: "Collect production evidence from observability, code, pipelines, and human context.",
  },
  {
    tags: ["Correlation", "Causality"],
    title: "Root Cause",
    desc: "Connect symptoms to the most likely source instead of forcing engineers to hunt manually.",
  },
  {
    tags: ["Fix Generation", "Validation"],
    title: "Decision",
    desc: "Generate the safest viable action plan with confidence, reversibility, and blast-radius context.",
  },
  {
    tags: ["Policy", "Approval", "Audit"],
    title: "Safe Execution",
    desc: "Execute only when governance clears the action, then preserve every decision as evidence.",
  },
];

// ─────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────

export default function TransformationSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative w-full py-24 px-6 overflow-hidden"
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
              id="tgrid"
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
          <rect width="100%" height="100%" fill="url(#tgrid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-bold text-gray-950 leading-[1.08] tracking-[-0.03em] mb-5"
          style={{ fontSize: "clamp(36px, 4.5vw, 72px)" }}
        >
          From signals to safe action.
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="text-gray-500 text-[15px] leading-relaxed mb-12 max-w-lg"
        >
          Scrubbe is the system that turns fragmented production signals into
          executable decisions — with policy deciding whether action is allowed.
        </motion.p>

        {/* Pipeline card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="relative grid grid-cols-1 md:grid-cols-4 bg-white"
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 4,
          }}
        >
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative flex">
              {/* Step content */}
              <div
                className="flex-1 px-6 py-7"
                style={{
                  borderRight:
                    i < STEPS.length - 1 ? "1px solid #d1d5db" : "none",
                }}
              >
                {/* Tags */}
                <p
                  className="text-[11px] text-gray-400 mb-3 tracking-wide"
                  style={{ fontFamily: "monospace", letterSpacing: "0.06em" }}
                >
                  {step.tags.join(" · ")}
                </p>

                {/* Title */}
                <h3 className="text-[22px] font-black text-gray-900 tracking-tight mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[13.5px] text-gray-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Arrow between steps */}
              {i < STEPS.length - 1 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 flex items-center justify-center w-6 h-6 bg-white">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7h10M8 3l4 4-4 4"
                      stroke="#22c55e"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
