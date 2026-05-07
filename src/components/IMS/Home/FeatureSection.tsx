"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─────────────────────────────────────────────────────────────────
// Feature data
// ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: 1,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2L3 6v5c0 4 3.5 7 7 8 3.5-1 7-4 7-8V6L10 2z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
    title: "Policy-Governed Execution",
    desc: "Engineering teams are stuck in reactive fire-fighting mode — incidents are discovered late, triaged manually, and resolved through heroic individual effort rather than systematic process. There's no intelligent automation to accelerate detection-to-resolution.",
    defaultDark: true, // first card is white by default
  },
  {
    id: 2,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10"
          cy="10"
          r="7"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M10 6v4l3 2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "9-State Incident Machine",
    desc: "Engineering teams are stuck in reactive fire-fighting mode — incidents are discovered late, triaged manually, and resolved through heroic individual effort rather than systematic process. There's no intelligent automation to accelerate detection-to-resolution.",
    defaultDark: true,
  },
  {
    id: 3,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M5 10h10M10 5l5 5-5 5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Policy ≠ Playbook",
    desc: "Engineering teams are stuck in reactive fire-fighting mode — incidents are discovered late, triaged manually, and resolved through heroic individual effort rather than systematic process. There's no intelligent automation to accelerate detection-to-resolution.",
    defaultDark: true,
  },
  {
    id: 4,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 3v14M3 10h14"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle
          cx="10"
          cy="10"
          r="3"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
        />
      </svg>
    ),
    title: "Ezra Intelligence Layer",
    desc: "Engineering teams are stuck in reactive fire-fighting mode — incidents are discovered late, triaged manually, and resolved through heroic individual effort rather than systematic process. There's no intelligent automation to accelerate detection-to-resolution.",
    defaultDark: true,
  },
  {
    id: 5,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 3L3 7v6l7 4 7-4V7L10 3z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
    title: "Runtime Guardrails",
    desc: "Engineering teams are stuck in reactive fire-fighting mode — incidents are discovered late, triaged manually, and resolved through heroic individual effort rather than systematic process. There's no intelligent automation to accelerate detection-to-resolution.",
    defaultDark: true,
  },
  {
    id: 6,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="3"
          y="5"
          width="14"
          height="3"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
        />
        <rect
          x="3"
          y="10"
          width="14"
          height="3"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
        />
        <rect
          x="3"
          y="15"
          width="9"
          height="2"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
        />
      </svg>
    ),
    title: "learnedPatterns Store",
    desc: "Engineering teams are stuck in reactive fire-fighting mode — incidents are discovered late, triaged manually, and resolved through heroic individual effort rather than systematic process. There's no intelligent automation to accelerate detection-to-resolution.",
    defaultDark: true,
  },
];

// ─────────────────────────────────────────────────────────────────
// Feature Card — inverts on hover
// ─────────────────────────────────────────────────────────────────

function FeatureCard({
  feature,
  index,
  inView,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
  inView: boolean;
}) {
  const isDark = feature.defaultDark;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.08 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative rounded-lg p-6 cursor-default transition-all duration-300 overflow-hidden"
      style={{
        background: isDark ? "#111827" : "#ffffff",
        border: isDark ? "1px solid #1f2937" : "1px solid #e5e7eb",
        minHeight: 280,
      }}
    >
      {/* Hover invert overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: isDark ? "#ffffff" : "#111827",
        }}
      />

      {/* Content (sits above overlay) */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon box */}
        <div
          className="w-9 h-9 rounded flex items-center justify-center mb-5 flex-shrink-0 transition-colors duration-300"
          style={{
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
            border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
            color: isDark ? "#d1d5db" : "#374151",
          }}
        >
          {/* Icon colour inverts on hover */}
          <span
            className="transition-colors duration-300"
            style={{ color: "inherit" }}
          >
            {feature.icon}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-[16px] font-black tracking-tight mb-3 transition-colors duration-300"
          style={{ color: isDark ? "#f9fafb" : "#111827" }}
        >
          {feature.title}
        </h3>

        {/* Desc */}
        <p
          className="text-[13px] leading-relaxed transition-colors duration-300"
          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
        >
          {feature.desc}
        </p>
      </div>

      {/* CSS-driven color inversions on hover via group */}
      <style>{`
        .group:hover .feat-title-${feature.id} { color: ${
        isDark ? "#111827" : "#f9fafb"
      } !important; }
        .group:hover .feat-desc-${feature.id}  { color: ${
        isDark ? "#6b7280" : "#9ca3af"
      } !important; }
        .group:hover .feat-icon-${feature.id}  { 
          background: ${
            isDark ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.1)"
          } !important;
          border-color: ${isDark ? "#e5e7eb" : "#374151"} !important;
          color: ${isDark ? "#374151" : "#d1d5db"} !important;
        }
      `}</style>

      {/* Re-apply with class-based targeting for cleanliness */}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Cleaner approach — use Tailwind group-hover with inline style fallback
// ─────────────────────────────────────────────────────────────────

function Card({
  feature,
  index,
  inView,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
  inView: boolean;
}) {
  const isDark = feature.defaultDark;

  // defaultDark=true → dark bg, white text → hover = white bg, dark text
  // defaultDark=false → white bg, dark text → hover = dark bg, white text
  const bg = isDark ? "#111827" : "#ffffff";
  const hoverBg = isDark ? "#ffffff" : "#111827";
  const border = isDark ? "#1f2937" : "#e5e7eb";
  const titleColor = isDark ? "#f9fafb" : "#111827";
  const hoverTitle = isDark ? "#111827" : "#f9fafb";
  const descColor = isDark ? "#9ca3af" : "#6b7280";
  const hoverDesc = isDark ? "#6b7280" : "#9ca3af";
  const iconBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const hoverIconBg = isDark ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.1)";
  const iconBorder = isDark ? "#374151" : "#e5e7eb";
  const hIconBorder = isDark ? "#e5e7eb" : "#374151";
  const iconColor = isDark ? "#d1d5db" : "#374151";
  const hIconColor = isDark ? "#374151" : "#d1d5db";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.08 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative rounded-lg p-6 cursor-default overflow-hidden"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        minHeight: 280,
        transition: "background 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = bg;
      }}
    >
      {/* Icon box */}
      <div
        className="icon-box w-9 h-9 rounded flex items-center justify-center mb-5 flex-shrink-0"
        style={{
          background: iconBg,
          border: `1px solid ${iconBorder}`,
          color: iconColor,
          transition: "all 0.3s ease",
        }}
        onMouseEnter={() => {}}
      >
        {feature.icon}
      </div>

      {/* Title */}
      <h3
        className="feat-title text-[16px] font-black tracking-tight mb-3"
        style={{ color: titleColor, transition: "color 0.3s ease" }}
      >
        {feature.title}
      </h3>

      {/* Desc */}
      <p
        className="feat-desc text-[13px] leading-relaxed"
        style={{ color: descColor, transition: "color 0.3s ease" }}
      >
        {feature.desc}
      </p>

      {/* Inject targeted hover styles */}
      <style>{`
        [data-card="${feature.id}"]:hover .icon-box {
          background: ${hoverIconBg} !important;
          border-color: ${hIconBorder} !important;
          color: ${hIconColor} !important;
        }
        [data-card="${feature.id}"]:hover .feat-title { color: ${hoverTitle} !important; }
        [data-card="${feature.id}"]:hover .feat-desc  { color: ${hoverDesc}  !important; }
      `}</style>
    </motion.div>
  );
}

// Final clean implementation using onMouse handlers on child elements
function FeatureCardFinal({
  feature,
  index,
  inView,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
  inView: boolean;
}) {
  const isDark = feature.defaultDark;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.08 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`
        group rounded-lg p-6 cursor-default overflow-hidden
        ${
          isDark
            ? "bg-[#111827] border border-[#1f2937] hover:bg-white"
            : "bg-white border border-gray-200 hover:bg-[#111827]"
        }
      `}
      style={{
        minHeight: 280,
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Icon box */}
      <div
        className={`
          w-9 h-9 rounded flex items-center justify-center mb-5 flex-shrink-0
          ${
            isDark
              ? "bg-white/5 border border-[#374151] text-gray-300 group-hover:bg-black/5 group-hover:border-gray-200 group-hover:text-gray-600"
              : "bg-black/[0.03] border border-gray-200 text-gray-600 group-hover:bg-white/10 group-hover:border-[#374151] group-hover:text-gray-300"
          }
        `}
        style={{ transition: "all 0.3s ease" }}
      >
        {feature.icon}
      </div>

      {/* Title */}
      <h3
        className={`
          text-[16px] font-black tracking-tight mb-3
          ${
            isDark
              ? "text-gray-50 group-hover:text-gray-900"
              : "text-gray-900 group-hover:text-gray-50"
          }
        `}
        style={{ transition: "color 0.3s ease" }}
      >
        {feature.title}
      </h3>

      {/* Desc */}
      <p
        className={`
          text-[13px] leading-relaxed
          ${
            isDark
              ? "text-gray-400 group-hover:text-gray-600"
              : "text-gray-500 group-hover:text-gray-400"
          }
        `}
        style={{ transition: "color 0.3s ease" }}
      >
        {feature.desc}
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────

export default function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref}>
      <section
        className="relative w-full pb-16 pt-16 px-6 overflow-hidden"
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
                id="fgrid"
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
            <rect width="100%" height="100%" fill="url(#fgrid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-[1100px] mx-auto">
          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="font-bold text-gray-950 leading-[1.08] tracking-[-0.03em] mb-12"
            style={{ fontSize: "clamp(30px, 4vw, 56px)" }}
          >
            Built for teams who
            <br />
            can't afford to guess.
          </motion.h2>

          {/* 3-column card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <FeatureCardFinal
                key={f.id}
                feature={f}
                index={i}
                inView={inView}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Dark grid footer band */}
      <div
        className="w-full"
        style={{
          background: "#0a0a0a",
          minHeight: 200,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="darkgrid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#darkgrid)" />
        </svg>
      </div>
    </div>
  );
}
