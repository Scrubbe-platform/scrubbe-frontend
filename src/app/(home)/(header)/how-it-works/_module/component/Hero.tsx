"use client";
import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";
import Image from "next/image";

const Hero = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ background: "#B4FFB8" }}
    >
      <div className="relative z-10 max-w-[1280px] mx-auto px-8 lg:px-16 py-20 lg:py-28">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="font-besley font-black text-gray-950 leading-[1.05] tracking-tight text-[clamp(32px,4.5vw,56px)]"
          >
            How Scrubbe resolves production incidents.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 font-ibm text-[15px] text-gray-700 leading-relaxed"
          >
            Production incidents are rarely linear. The first alert is not the
            answer. The latest deploy is not always the cause. And the fastest
            fix is not always the safest one.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-ibm text-[15px] text-gray-700 leading-relaxed"
          >
            Scrubbe runs a governed incident decision loop built for production
            environments — continuously collecting evidence, testing likely
            explanations, evaluating blast radius, and determining whether
            remediation is safe enough to execute. From the moment an incident
            is detected to the moment service health is restored, Scrubbe drives
            the full decision cycle under policy controls.
          </motion.p>
        </div>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-[45%] min-w-[380px] pointer-events-none hidden md:block">
        <Image
          src="/IMS/green-ball.png"
          alt=""
          fill
          className="object-cover object-left"
          priority
        />
      </div>
    </section>
  );
};

export default Hero;
