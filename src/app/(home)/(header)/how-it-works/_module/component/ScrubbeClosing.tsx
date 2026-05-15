"use client";
import React from "react";
import { motion } from "framer-motion";

const ScrubbeClosing = () => {
  return (
    <section className="relative w-full min-h-[600px] flex flex-col items-center justify-center px-6 py-20 overflow-hidden bg-black text-center">
      {/* 1. BACKGROUND PLACEHOLDER 
          Swap this div for your <img> or a background-image style */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        {/* Example: <img src="/path/to/your/background.jpg" className="w-full h-full object-cover" /> */}
        <div className="w-full h-full bg-gradient-to-b from-transparent via-slate-900/50 to-black" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Main Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white text-3xl md:text-[56px] font-bold leading-[1.1] tracking-tight mb-8"
        >
          Scrubbe does not just <br />
          automate tasks. It runs the <br />
          <span className="text-[#4ade80]">full decision loop.</span>
        </motion.h2>

        {/* Narrative Description */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-3xl mb-12 px-4"
        >
          Every step from detection to verified recovery is governed,
          evidence-backed, and attributable. Scrubbe does not act on assumptions
          — it acts on ranked hypotheses, with blast radius evaluated before
          simulation, policy applied before execution, and recovery verified
          before closure. The result is autonomous incident response that
          engineering organizations can trust with production.
        </motion.p>

        {/* Bottom Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 mt-4"
        >
          <Pill text="Evidence-backed" />
          <Pill text="Blast-radius aware" />
          <Pill text="Policy-governed" />
          <Pill text="Execution-ready" />
        </motion.div>
      </div>
    </section>
  );
};

// --- Sub-component for the pills ---
const Pill = ({ text }: { text: string }) => (
  <div className="px-5 py-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm">
    <span className="text-[11px] md:text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
      {text}
    </span>
  </div>
);

export default ScrubbeClosing;
