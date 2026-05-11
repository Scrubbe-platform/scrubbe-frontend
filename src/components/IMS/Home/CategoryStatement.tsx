"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function CategoryStatement() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="w-full flex flex-col items-center justify-center text-center py-10 px-6"
      style={{ background: "#0a0a0a" }}
    >
      {/* Main statement */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="font-bold text-white leading-snug tracking-tight max-w-4xl"
        style={{ fontSize: "clamp(20px, 2.6vw, 36px)" }}
      >
        Scrubbe is the control layer missing from modern production systems.
      </motion.h2>

      {/* Subtitle row */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 tracking-widest uppercase"
        style={{
          fontSize: "clamp(11px, 1.1vw, 13px)",
          color: "#6b7280",
          fontFamily: "monospace",
          letterSpacing: "0.18em",
        }}
      >
        Not alerting &nbsp;·&nbsp; Not monitoring &nbsp;·&nbsp; Not coordination
      </motion.p>
    </section>
  );
}
