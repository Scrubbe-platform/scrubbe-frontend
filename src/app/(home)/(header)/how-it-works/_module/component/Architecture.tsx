"use client";
import React from "react";
import { motion } from "framer-motion";

const ArchitectureCTA = () => {
  return (
    <section className="w-full bg-[#f8fafc] py-20 px-6 md:px-12 border-t border-slate-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
        {/* Left Side: Typography-focused Heading */}
        <div className="flex-1">
          <h2 className="text-4xl md:text-[64px] leading-tight tracking-tight text-slate-900">
            <span className="block font-serif italic text-slate-800">
              See the
            </span>
            <span className="block font-serif italic text-zinc-400 -mt-2 md:-mt-4">
              architecture.
            </span>
          </h2>
        </div>

        {/* Right Side: Description and Actions */}
        <div className="flex-1 max-w-xl">
          <p className="text-slate-600 text-base md:text-[17px] leading-relaxed mb-10 font-medium">
            Understand how Scrubbe coordinates agents, policies, and execution
            systems across the production stack. Every layer of the platform —
            from signal ingestion and evidence collection to governed
            remediation and audit — explained in full technical detail for
            engineering and security leadership.
          </p>

          <div className="flex flex-wrap gap-4">
            {/* Primary Gradient Button */}
            <button className="relative overflow-hidden group px-8 py-3.5 rounded-sm transition-all active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-r from-[#061e1a] via-[#10b981] to-[#c9f6d9] transition-transform group-hover:scale-105" />
              <span className="relative z-10 text-white font-bold text-sm">
                See Architecture
              </span>
            </button>

            {/* Secondary Outlined Button */}
            <button className="px-8 py-3.5 border border-[#10b981] bg-white text-[#065f46] font-bold text-sm rounded-sm hover:bg-emerald-50 transition-colors active:scale-95">
              Browse Walkthrough
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureCTA;
