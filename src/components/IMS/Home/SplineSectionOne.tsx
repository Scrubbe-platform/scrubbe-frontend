"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useInView } from "framer-motion";
import MigrationAssessmentModal from "./MigrationAssessmentModal";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});

export default function SplineSectionOne() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "300px" });
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section ref={ref} className="w-full bg-white py-16">
      <div
        className="w-full mx-auto overflow-hidden relative min-h-[700px]"
        style={{ background: "#000" }}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
          </div>
        )}
        {inView && (
          <div className="absolute inset-0">
            <Spline
              scene="https://prod.spline.design/pkdheKgHkjMhwyk5/scene.splinecode"
              onLoad={() => setLoaded(true)}
            />
          </div>
        )}

        <div className="relative z-10 w-full mx-auto max-w-[1480px] min-h-[700px] flex flex-col justify-between p-8 md:p-12 pointer-events-none">
          <h2 className="font-serif font-bold text-white text-[clamp(22px,2.6vw,34px)] max-w-2xl">
            Incident Management built for an agentic future
          </h2>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <h3 className="font-serif font-bold text-white leading-[1.3] text-[clamp(20px,2.4vw,30px)] max-w-md">
              Switch to governed incident intelligence.
              <br />
              We'll handle the migration.
            </h3>

            <div className="max-w-sm pointer-events-auto">
              <p className="text-[13.5px] text-gray-300 leading-relaxed">
                Teams switching from PagerDuty, OpsGenie, FireHydrant,
                Incident.io, Statuspage, and custom in-house tools have a
                dedicated migration path. Your existing playbooks, escalation
                policies, and alert routing move across — with full audit
                continuity from day one.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-block mt-4 px-6 py-3 rounded-lg font-bold text-[13.5px] text-white bg-transparent border border-white hover:bg-white hover:text-black transition-all cursor-pointer"
              >
                Request Migration
              </button>
            </div>
          </div>
        </div>
      </div>

      <MigrationAssessmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
