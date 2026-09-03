"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const ScrubbeClosing = () => {
  return (
    <section className="w-full grid grid-cols-1 lg:grid-cols-2 border border-slate-200 overflow-hidden">
      {/* LEFT — dark textured background + copy */}
      <div className="relative flex flex-col justify-center px-8 md:px-14 py-16 lg:py-0 lg:min-h-[560px] overflow-hidden">
        <Image
          src="/IMS/black-cube.jpg"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />

        {/* Main Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 text-white text-3xl md:text-[42px] font-bold leading-[1.15] tracking-tight mb-6 max-w-lg"
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
          className="relative z-10 text-slate-300 text-[15px] leading-relaxed max-w-md"
        >
          Every step from detection to verified recovery is governed,
          evidence-backed, and attributable. Scrubbe does not act on
          assumptions — it acts on ranked hypotheses, with blast radius
          evaluated before simulation, policy applied before execution, and
          recovery verified before closure. The result is autonomous incident
          response that engineering organizations can trust with production.
        </motion.p>
      </div>

      {/* RIGHT — dashboard screenshot */}
      <div className="bg-white lg:min-h-[560px] p-6 lg:p-10">
        <div className="relative w-full h-full min-h-[320px]">
          <Image
            src="/IMS/learning-dashboard.png"
            alt="Learning Dashboard Overview — MTTR improvement, autonomous success rate, human override rate, incidents resolved, MTTR trend, and top recurring incident categories."
            fill
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default ScrubbeClosing;
