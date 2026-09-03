"use client";
import React from "react";
import { motion } from "framer-motion";

const ArchitectureCTA = () => {
  return (
    <section className="w-full bg-[#FAFAFA] py-16 px-6 md:px-12 border border-slate-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10"
      >
        {/* Left Side: Typography-focused Heading */}
        <div className="flex-1">
          <h2 className="font-besley font-black text-4xl md:text-[52px] leading-[1.05] tracking-tight">
            <span className="block text-slate-950">See the</span>
            <span className="block text-zinc-400">architecture.</span>
          </h2>
        </div>

        {/* Right Side: Description and Actions */}
        <div className="flex-1 max-w-xl">
          <p className="text-slate-600 text-[15px] font-ibm leading-relaxed mb-8">
            Understand how Scrubbe coordinates agents, policies, and execution
            systems across the production stack. Every layer of the platform —
            from signal ingestion and evidence collection to governed
            remediation and audit — explained in full technical detail for
            engineering and security leadership.
          </p>

          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-3 rounded-lg bg-black text-white font-semibold text-sm hover:bg-slate-800 transition-colors active:scale-95">
              See architecture
            </button>
            <button className="px-6 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold text-sm hover:bg-slate-50 transition-colors active:scale-95">
              Browse Walkthrough
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ArchitectureCTA;
