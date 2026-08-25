"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useInView } from "framer-motion";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});

export default function SplineSectionTwo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "300px" });
  const [loaded, setLoaded] = useState(false);

  return (
    <section ref={ref} className="w-full bg-white py-16 px-6">
      <div
        className="max-w-[1480px] mx-auto rounded-3xl overflow-hidden relative min-h-[640px]"
        style={{ background: "#c3f7c9" }}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
        {inView && (
          <div className="absolute inset-0">
            <Spline
              scene="https://prod.spline.design/Ec9zUjeBeooSh27i/scene.splinecode"
              onLoad={() => setLoaded(true)}
            />
          </div>
        )}

        <div className="relative z-10 h-full min-h-[640px] flex items-center px-10 md:px-16">
          <div className="max-w-lg py-16">
            <h2 className="font-serif font-bold text-gray-950 leading-[1.15] text-[clamp(28px,3.2vw,42px)]">
              Switch to governed incident intelligence.
              <br />
              We'll handle the migration.
            </h2>
            <p className="mt-5 text-[15px] text-gray-700 leading-relaxed max-w-md">
              Teams switching from PagerDuty, OpsGenie, FireHydrant,
              Incident.io, Statuspage, and custom in-house tools have a
              dedicated migration path. Your existing playbooks, escalation
              policies, and alert routing move across — with full audit
              continuity from day one.
            </p>
            <Link
              href="/contact-us"
              className="inline-block mt-8 px-6 py-3.5 rounded-lg font-bold text-[14px] text-black bg-white hover:brightness-95 transition-all shadow-sm"
            >
              Request Migration
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
