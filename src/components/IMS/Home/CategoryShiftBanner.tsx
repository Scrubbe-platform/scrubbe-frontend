"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function CategoryShiftBanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden py-20 flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #0a1f1a 0%, #062a22 30%, #0d2d24 55%, #071a14 80%, #040d0a 100%)",
      }}
    >
      {/* Subtle noise/grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />

      {/* Radial glow — left centre */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "-5%",
          top: "50%",
          transform: "translateY(-50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Radial glow — right centre */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "-5%",
          top: "50%",
          transform: "translateY(-50%)",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(6,78,59,0.35) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Text content */}
      <div className="relative z-10 text-center px-6">
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-semibold leading-[1.12] tracking-[-0.02em]"
          style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
        >
          <span className="text-white">From noisy production signals to</span>
          <br />
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.7,
              delay: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
            style={{ color: "#10d9a0" }}
          >
            safe executable decisions.
          </motion.span>
        </motion.h2>
      </div>
    </section>
  );
}
