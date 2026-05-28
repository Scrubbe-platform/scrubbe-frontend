"use client";
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { FaArrowRightLong } from "react-icons/fa6";

const DecisionLoopHero = () => {
  const steps = [
    "Detect",
    "Scope",
    "Collect",
    "Correlate",
    "Propose",
    "Simulate",
    "Govern",
    "Execute",
    "Verify",
    "Iterate",
    "Learn",
  ];

  return (
    <section className="w-full bg-[#f8fafc] py-24 px-6 md:px-12 flex flex-col items-center border-b border-slate-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl text-center flex flex-col items-center"
      >
        {/* Main Heading */}
        <h1 className="text-[44px] md:text-[64px] font-semibold text-[#334155] leading-[1.1] tracking-tight mb-8">
          How Scrubbe resolves <br />
          production
          <span className="text-[#4ade80]"> incidents.</span>
        </h1>

        {/* Narrative Subtext */}
        <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mb-16">
          This is how Scrubbe handles production incidents — from first signal
          to verified recovery — under strict operational controls. The loop
          does not stop at a single remediation attempt. It continues until
          recovery is confirmed or a governed escalation transfers the incident
          to human operators with the complete decision history in hand.
        </p>

        {/* Step Navigation Bar */}
      </motion.div>
      <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-auto flex  items-center  px-4 py-6">
        {steps.map((step, index) => (
          <div
            className="border-r flex-row gap-2 items-center flex px-4"
            key={step}
          >
            <div className="flex flex-col items-center px-4">
              <span className="text-[13px] font-mono font-medium text-slate-700 tracking-tight">
                {step}
              </span>
            </div>

            {index !== steps.length - 1 && (
              <div className="flex items-center justify-center text-slate-300">
                <FaArrowRightLong size={12} strokeWidth={3} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default DecisionLoopHero;
