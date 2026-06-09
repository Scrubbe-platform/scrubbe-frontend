"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────────
// Tab data
// ─────────────────────────────────────────────────────────────────

const TABS = [
  {
    id: 1,
    num: "01",
    label: "Detect",
    title: "Detect",
    desc: "Webhooks from GitHub, Kubernetes, Datadog, and PagerDuty arrive simultaneously. Scrubbe absorbs them all and collapses 40 duplicate alerts in 30 seconds into a single incident. Your engineers see one clear signal, not a flood.",
    image: "/IMS/how/detect.gif",
  },
  {
    id: 2,
    num: "02",
    label: "Pattern Match",
    title: "Pattern Match",
    desc: "Scrubbe checks the signal against your organisation's policy rules to decide whether an incident should be raised. A single pod restart isn't automatically a crisis. Context matters — and Scrubbe applies it deterministically every time.",
    image: "/IMS/how/pattern_match.gif",
  },
  {
    id: 3,
    num: "03",
    label: "Investigate",
    title: "Investigate",
    desc: "The right playbooks are matched against the incident with a confidence score. Ranked remediation options are surfaced — including past resolutions for the same pattern. Your team sees what worked last time, immediately.",
    image: "/IMS/how/investigate.gif",
  },
  {
    id: 4,
    num: "04",
    label: "Blast Radius",
    title: "Blast Radius",
    desc: "Before any fix is proposed, Scrubbe maps exactly which services would be affected. If the impact is unclear, the execution gate holds — it never assumes a fix is safe. Unknowns block action, not enable it.",
    image: "/IMS/how/blast_2.gif",
  },
  {
    id: 5,
    num: "05",
    label: "Guardrails",
    title: "Guardrails",
    desc: "Every proposed action passes through governance rules you define — operating hours, risk classification, reversibility, required approvers. Rules are stored as versioned data, not code. Results are logged with the exact rule version that evaluated them.",
    image: "/IMS/how/guadrail.jpg",
  },
  {
    id: 6,
    num: "06",
    label: "Execute & Learn",
    title: "Execute & Learn",
    desc: "The right playbooks are matched against the incident with a confidence score. Ranked remediation options are surfaced — including past resolutions for the same pattern. Your team sees what worked last time, immediately.",
    image: "/IMS/how/execute.jpg",
  },
];

// ─────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  const [active, setActive] = useState(1);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const tab = TABS.find((t) => t.id === active)!;

  return (
    <section
      ref={ref}
      className="relative w-full py-16 px-6 overflow-hidden"
      style={{ background: "#f9fafb" }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="w-full h-full opacity-60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hwgrid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hwgrid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-bold text-gray-950 leading-[1.08] tracking-[-0.03em] mb-4"
          style={{ fontSize: "clamp(28px, 3.5vw, 60px)" }}
        >
          A system that replaces manual incident response.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="text-[14.5px] text-gray-500 leading-relaxed mb-10 max-w-lg"
        >
          Scrubbe performs the full decision loop under policy: it understands
          the incident, selects the safest action, validates risk, and executes
          only when the gate clears.
        </motion.p>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="border border-gray-200 rounded-xl overflow-hidden bg-white"
        >
          {/* Tab bar */}
          <div className="flex flex-row md:grid grid-cols-6 overflow-x-scroll border-b border-gray-200">
            {TABS.map((t) => {
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className="relative flex flex-col gap-0.5 px-4 py-4 text-left cursor-pointer border-none bg-transparent transition-colors"
                  style={{
                    borderRight: t.id < 6 ? "1px solid #e5e7eb" : "none",
                  }}
                >
                  {/* Step number — green when active */}
                  <span
                    className="text-[11px] font-bold block mb-0.5"
                    style={{
                      color: isActive ? "#22c55e" : "#9ca3af",
                      fontFamily: "monospace",
                    }}
                  >
                    {t.num}
                  </span>

                  {/* Tab label */}
                  <span
                    className="text-[13px] font-semibold leading-snug"
                    style={{ color: isActive ? "#111827" : "#6b7280" }}
                  >
                    {t.label}
                  </span>

                  {/* Active green underline */}
                  {isActive && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t"
                      style={{ background: "#22c55e" }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 34,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[320px]">
            {/* Left: number + title + desc */}
            <div
              className="flex items-start gap-6 "
              style={{ borderRight: "1px solid #e5e7eb" }}
            >
              {/* Large background number */}
              <span
                className="font-bold leading-none shrink-0 select-none mt-1 text-center px-2 md:px-3"
                style={{ fontSize: "clamp(52px, 5vw, 80px)", color: "#e5e7eb" }}
              >
                {tab.num}
              </span>

              <AnimatePresence mode="wait">
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-gray-50 p-8 w-full h-full"
                >
                  <h3 className="text-[22px] font-black text-black tracking-tight mb-4">
                    {tab.title}
                  </h3>
                  <p className="text-[14.5px] text-gray-500 leading-relaxed max-w-sm">
                    {tab.desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: image slot */}
            <div className="relative flex items-center justify-center p-8 bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full h-full min-h-[350px]"
                >
                  <Image
                    src={tab.image}
                    alt={tab.title}
                    fill
                    className="object-contain"
                    priority={tab.id === 1}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
