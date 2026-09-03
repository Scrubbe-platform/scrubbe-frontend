"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const DecisionLoopHero = () => {
  return (
    <section className="w-full bg-white py-20 md:py-24 px-6 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl text-center flex flex-col items-center"
      >
        {/* Main Heading */}
        <h1 className="font-besley font-black text-slate-950 text-[36px] md:text-[52px] leading-[1.15] tracking-tight mb-6">
          How Scrubbe resolves
          <br />
          production incidents.
        </h1>

        {/* Narrative Subtext */}
        <p className="text-slate-500 text-[15px] font-ibm md:text-base leading-relaxed max-w-2xl">
          This is how Scrubbe handles production incidents — from first signal
          to verified recovery — under strict operational controls. The loop
          does not stop at a single remediation attempt. It continues until
          recovery is confirmed or a governed escalation transfers the incident
          to human operators with the complete decision history in hand.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl mt-16"
      >
        <Image
          src="/IMS/how-scrubbe-works.png"
          alt="How Scrubbe works — Detect, Scope, Collect, Correlate, Purpose, Simulate, Govern, Execute, Verify, Iterate."
          width={1581}
          height={995}
          className="w-full h-auto"
          priority
        />
      </motion.div>
    </section>
  );
};

export default DecisionLoopHero;
