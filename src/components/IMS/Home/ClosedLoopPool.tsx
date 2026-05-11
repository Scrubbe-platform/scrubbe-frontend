"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const STEPS = [
  {
    num: "01",
    title: "Root cause identified",
    desc: "Signals are correlated into a causal explanation with supporting evidence.",
  },
  {
    num: "02",
    title: "Fix generated",
    desc: "A safe remediation path is proposed with confidence and reversibility context.",
  },
  {
    num: "03",
    title: "Policy checked",
    desc: "Risk, blast radius, approvals, and execution limits are evaluated before action.",
  },
  {
    num: "04",
    title: "Execution completed",
    desc: "Approved remediation runs with full traceability and audit evidence.",
  },
];

export default function ClosedLoopProof() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative w-full py-16 px-6"
      style={{ background: "#f9fafb" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[1200px] mx-auto rounded-2xl overflow-hidden"
        style={{ background: "#0a0a0a" }}
      >
        {/* Top content area */}
        <div className="px-10 pt-14 pb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-bold text-white leading-[1.08] tracking-[-0.03em] mb-5"
            style={{ fontSize: "clamp(32px, 4vw, 64px)" }}
          >
            A complete, auditable execution loop.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[15px] leading-relaxed max-w-lg"
            style={{ color: "#9ca3af" }}
          >
            Scrubbe does not stop at notification or investigation. It carries
            the incident through understanding, decision, governance, and
            controlled action.
          </motion.p>
        </div>

        {/* Step cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.15 + i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative bg-white p-6"
              style={{
                borderLeft: i > 0 ? "1px solid #e5e7eb" : "none",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              {/* Step number */}
              <p
                className="text-[11px] font-bold mb-4"
                style={{ color: "#22c55e", fontFamily: "monospace" }}
              >
                {step.num}
              </p>

              {/* Title */}
              <h3 className="text-[17px] font-black text-gray-900 tracking-tight mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[13.5px] text-gray-500 leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
