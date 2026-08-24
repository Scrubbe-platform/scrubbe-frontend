"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
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
      className="relative w-full py-24 px-6 overflow-hidden bg-white"
    >
      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-bold font-serif text-gray-950 leading-[1.08] tracking-[-0.03em] mb-5"
          style={{ fontSize: "clamp(36px, 4.5vw, 56px)" }}
        >
          From raw signal to operational <br /> understanding
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="text-gray-500 text-[15px] leading-relaxed mb-12 max-w-lg"
        >
          Every signal is correlated, weighed for confidence and evidence, and
          surfaced where it changes a decision — across the workspace..
        </motion.p>

        {/* Pipeline card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="w-full"
          transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/IMS/gif/first_illustration.gif"
            height={600}
            width={600}
            alt="Pipeline"
            className="w-full m-auto"
          />
        </motion.div>
      </div>
    </section>
  );
}
