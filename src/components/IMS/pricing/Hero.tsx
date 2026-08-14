"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function PricingHero() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden md:bg-[url('/IMS/pricing-hero.png')] bg-[url('/IMS/pricing-hero-mobile.png')] bg-no-repeat bg-cover"
      style={{
        minHeight: "420px",
      }}
    >
      {/* ── Content ── */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-8 lg:px-16 py-16 lg:py-20">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="font-black text-white leading-[1.08] tracking-[-0.02em] mb-6 max-w-[560px]"
          style={{ fontSize: "clamp(28px, 4vw, 60px)" }}
        >
          Scrubbe scales with your incidents, your automation, and your system
          complexity.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="text-[15px] leading-relaxed max-w-[480px] text-slate-100"
        >
          Every plan includes a platform fee, team access, monthly incident
          capacity, and execution credits — so pricing tracks how you actually
          respond, not how many people happen to be online.
        </motion.p>
      </div>
    </section>
  );
}
