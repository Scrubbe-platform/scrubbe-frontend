"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─────────────────────────────────────────────────────────────────
// Pixel dot pattern background (SVG)
// ─────────────────────────────────────────────────────────────────

function PixelDotBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect
            x="3"
            y="3"
            width="5"
            height="5"
            rx="0.5"
            fill="#d1d5db"
            opacity="0.55"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────

export default function GovernanceSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative w-full py-20 px-6 overflow-hidden"
      style={{ background: "#f9fafb" }}
    >
      {/* Light grid background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="w-full h-full opacity-50"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="ggrid"
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
          <rect width="100%" height="100%" fill="url(#ggrid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* ── LEFT: text ── */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="font-black text-gray-950 leading-[1.08] tracking-[-0.03em] mb-7"
            style={{ fontSize: "clamp(34px, 4.5vw, 66px)" }}
          >
            Every action.
            <br />
            <em className="not-italic" style={{ fontStyle: "italic" }}>
              Immutably
            </em>{" "}
            recorded.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-[15px] text-gray-500 leading-relaxed mb-10 max-w-md"
          >
            Scrubbe's audit trail is append-only by design — not by
            configuration. There is no delete endpoint, no update endpoint. The
            data store rejects modification at the database level. Every state
            transition, policy evaluation, approval, guardrail check, and
            execution is immutably recorded with actor, role, timestamp, and the
            exact policy version that governed it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.55,
              delay: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <button
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md font-semibold text-white text-[14px] border-none cursor-pointer transition-all hover:brightness-110"
              style={{
                background:
                  "linear-gradient(90deg, #1a2a1a 0%, #14532d 60%, #22c55e 100%)",
                boxShadow: "0 2px 16px rgba(34,197,94,0.18)",
              }}
            >
              Download Security brief
            </button>
          </motion.div>
        </div>

        {/* ── RIGHT: quote card on pixel background ── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
          style={{ minHeight: 420 }}
        >
          {/* Pixel dot background area */}
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <PixelDotBackground />
          </div>

          {/* White quote card sitting on top of the dot pattern */}
          <div
            className="relative z-10 bg-white rounded-lg p-8 shadow-sm"
            style={{
              margin: "40px 40px 40px 40px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h3
              className="font-black text-gray-900 tracking-tight mb-5"
              style={{ fontSize: "clamp(18px, 2vw, 26px)" }}
            >
              The core promise
            </h3>

            <p className="text-[15px] text-gray-600 leading-[1.75] mb-6">
              When something breaks in your engineering systems, Scrubbe finds
              it, understands it, decides what to do about it, gets the right
              approvals, fixes it and learns from it. All under a controlled,
              auditable framework your compliance and leadership teams can
              trust.
            </p>

            <p className="text-[14px] font-semibold text-gray-700 italic">
              - Scrubbe Founders
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
