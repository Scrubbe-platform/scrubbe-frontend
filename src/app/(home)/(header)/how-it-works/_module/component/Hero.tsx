"use client";
import { useInView } from "framer-motion";
import React, { useRef } from "react";

const Hero = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden min-h-screen md:bg-[url('/IMS/how-it-work.png')] bg-[url('/IMS/pricing-hero-mobile.png')] bg-no-repeat bg-cover"
      style={{
        minHeight: "600px",
      }}
    >
      <div className="relative z-10 max-w-[1280px] mx-auto px-8 lg:px-16 py-16 lg:py-20 flex flex-col items-center gap-4">
        <h1 className=" gap-2 px-3.5 py-1.5 rounded-full text-4xl md:text-6xl text-center max-w-5xl font-semibold text-white">
          How Scrubbe resolves production{" "}
          <span className="text-IMSCyan">incidents.</span>
        </h1>
        <p className="text-white max-w-4xl text-center">
          Production incidents are rarely linear. The first alert is not the
          answer. The latest deploy is not always the cause. And the fastest fix
          is not always the safest one.
        </p>
        <p className="text-white max-w-4xl text-center">
          Scrubbe runs a governed incident decision loop built for production
          environments — continuously collecting evidence, testing likely
          explanations, evaluating blast radius, and determining whether
          remediation is safe enough to execute. From the moment an incident is
          detected to the moment service health is restored, Scrubbe drives the
          full decision cycle under policy controls.
        </p>
      </div>
    </section>
  );
};

export default Hero;
