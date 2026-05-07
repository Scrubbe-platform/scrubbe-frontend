"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ─────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────

const PRIMARY_USERS = [
  {
    id: 1,
    label: "Platform & Infrastructure Teams",
    tag: "CORE ICP",
    title: "Platform & Infrastructure Teams",
    desc: "They own production reliability, deployment safety, and cross-service coordination. Scrubbe gives them a control layer that turns operational signals into governed action.",
    currentPain:
      "Alerts and dashboards still leave teams manually reconstructing cause across services.",
    howScrubbeAFits:
      "Correlates signals, identifies root cause, generates the safest action, and executes only under policy.",
    whatTheyGain:
      "Faster resolution with less escalation, lower execution risk, and a reusable incident control loop.",
    bestTrigger:
      "Frequent production incidents across many services, pipelines, and ownership boundaries.",
    workflow: [
      ["Signals", "Root cause"],
      ["Policy decision", "Safe execution"],
    ],
    cta: "Get Started",
    ctaStyle: "outline-green",
  },
  {
    id: 2,
    label: "SRE & Reliability Teams",
    tag: "PRIMARY OPERATOR",
    title: "SRE & Reliability Teams",
    desc: "SRE teams are measured on uptime, MTTR, incident frequency, and operational risk. Scrubbe helps them move from investigation to controlled remediation without relying on guess work",
    currentPain:
      "They have plenty of observability data, but still need certainty before acting in production.",
    howScrubbeAFits:
      "Turns alerts, metrics, traces, deploys, and runbook context into evidence-backed decisions",
    whatTheyGain:
      "Lower MTTR, fewer unnecessary escalations, and safer remediation paths during pressure.",
    bestTrigger:
      "Recurring incidents where root cause is slow to confirm or rollback decisions feel risky",
    workflow: [
      ["Detect", "Correlate"],
      ["Validate", "Govern"],
    ],
    cta: "Map Scrubbe to this workflow",
    ctaStyle: "link",
  },
  {
    id: 3,
    label: "High-Velocity Backend Teams",
    tag: "DISTRIBUTED SYSTEMS",
    title: "High-Velocity Backend Teams",
    desc: "SRE teams are measured on uptime, MTTR, incident frequency, and operational risk. Scrubbe helps them move from investigation to controlled remediation without relying on guess work",
    currentPain:
      "Ownership is fragmented, incidents are ambiguous, and fixes can create secondary failures.",
    howScrubbeAFits:
      "Map signals to code, deploys, services, and blast radius before recommending action",
    whatTheyGain:
      "Fewer blind rollbacks, clearer ownership, and safer production changes",
    bestTrigger:
      "High deploy frequency, microservices, distributed ownership, or repeated cross-service incidents",
    workflow: [
      ["Deploy signal", "Service Impact"],
      ["Fix plan", "Control Rollout"],
    ],
    cta: "Get Started",
    ctaStyle: "outline",
  },
];

const SECONDARY_USERS = [
  {
    id: 4,
    label: "Engineers On-Call",
    tag: "REVIEWER/APPROVAL",
    title: "Engineers On-Call",
    desc: "On-call engineers need clear answers, not another stream of alerts. Scrubbe gives them an evidence-backed recommendation they can approve, reject or escalate with context",
    currentPain:
      "They are interrupted under pressure and forced to manually correlate unfamiliar signals.",
    howScrubbeAFits:
      "Presents cause, confidence, blast radius, and proposed fix in one decision view",
    whatTheyGain:
      "Less cognitive load, faster confidence, and safer approval decisions.",
    bestTrigger:
      "Teams with frequent rotations where responders do not always know the affected service deeply",
    workflow: [
      ["Incident", "Evidence"],
      ["Recommended action", "Approve"],
    ],
    cta: "Get Started",
    ctaStyle: "outline",
  },
  {
    id: 5,
    label: "Engineering Leaders",
    tag: "BUYER/OWNER",
    title: "Engineering Leaders",
    desc: "Engineering managers, VPs, and CTOs care about downtime, operational cost, escalation load, and change risk. Scrubbe gives them a governed system for reliability operations instead of relying on heroics.",
    currentPain:
      "Reliability depends on senior engineers being available and making the right call under pressure.",
    howScrubbeAFits:
      "Standardizes incident decisions through policy, audit trails, and repeatable execution loops",
    whatTheyGain:
      "Reduced operational drag, better reliability metrics, and more predictable incident governance.",
    bestTrigger:
      "Scaling engineering teams where incidents are becoming a leadership and customer trust problem",
    workflow: [
      ["Operational risk", "Policy Controls"],
      ["Audit Trail", "Reliability Improvement"],
    ],
    cta: "Get Started",
    ctaStyle: "outline",
  },
  {
    id: 6,
    label: "Security, Risk & Compliance",
    tag: "GOVERNANCE EVIDENCE",
    title: "Security, Risk & Compliance",
    desc: "Risk and compliance teams need proof that production actions were justified, approved, and traceable. Scrubbe turns every incident decision into evidence.",
    currentPain:
      "Production fixes often happen in stressful channels with fragmented approvals and weak audit context.",
    howScrubbeAFits:
      "Enforces policy checks, approval requirements, blast-radius review and decision logging before execution",
    whatTheyGain:
      "Clear audit evidence for who decided what, why it was allowed, and what changed.",
    bestTrigger:
      "Regulated environments or enterprise customers requiring stronger operational controls",
    workflow: [
      ["Risk Check", "Approval gate"],
      ["Execution sauce", "Audit evidence"],
    ],
    cta: "Get Started",
    ctaStyle: "outline",
  },
];

const ALL_USERS = [...PRIMARY_USERS, ...SECONDARY_USERS];

// ─────────────────────────────────────────────────────────────────
// Workflow mini-grid
// ─────────────────────────────────────────────────────────────────

function WorkflowGrid({ rows }: { rows: string[][] }) {
  return (
    <div className="rounded-lg p-4 mt-5" style={{ background: "#111827" }}>
      {rows.map((row, ri) => (
        <div key={ri} className="flex items-center gap-2 mb-2 last:mb-0">
          {row.map((step, si) => (
            <span key={si} className="flex items-center gap-2">
              <span
                className="text-[11px] px-2.5 py-1 rounded"
                style={{
                  background: "#1f2937",
                  color: "#9ca3af",
                  fontFamily: "monospace",
                  letterSpacing: "0.04em",
                }}
              >
                {step}
              </span>
              {si < row.length - 1 && (
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path
                    d="M1 5h12M8 1l4 4-4 4"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Right panel detail
// ─────────────────────────────────────────────────────────────────

function DetailPanel({ user }: { user: (typeof ALL_USERS)[0] }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={user.id}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="h-full flex flex-col"
      >
        {/* Teal glow top-right */}
        <div
          className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(16,185,129,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Title */}
        <h3
          className="font-black text-gray-900 leading-[1.1] tracking-tight mb-4"
          style={{ fontSize: "clamp(22px, 2.4vw, 34px)" }}
        >
          {user.title}
        </h3>

        {/* Desc */}
        <p className="text-[14px] text-gray-500 leading-relaxed mb-6 max-w-sm">
          {user.desc}
        </p>

        {/* 2x2 info grid */}
        <div className="grid grid-cols-2 gap-px border border-gray-200 rounded-lg overflow-hidden">
          {[
            { label: "Current pain", value: user.currentPain },
            { label: "How Scrubbe fits", value: user.howScrubbeAFits },
            { label: "What they gain", value: user.whatTheyGain },
            { label: "Best trigger", value: user.bestTrigger },
          ].map((item, i) => (
            <div
              key={i}
              className="p-4 bg-white"
              style={{
                borderRight: i % 2 === 0 ? "1px solid #e5e7eb" : "none",
                borderBottom: i < 2 ? "1px solid #e5e7eb" : "none",
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                {item.label}
              </p>
              <p className="text-[13px] font-bold text-gray-800 leading-snug">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Workflow */}
        <WorkflowGrid rows={user.workflow} />

        {/* CTA */}
        <div className="mt-5">
          {user.ctaStyle === "link" ? (
            <button className="text-[13px] font-semibold text-gray-700 underline underline-offset-4 bg-transparent border-none cursor-pointer hover:text-emerald-600 transition-colors">
              {user.cta}
            </button>
          ) : user.ctaStyle === "outline-green" ? (
            <button
              className="w-full py-3 rounded-lg font-semibold text-[14px] text-emerald-600 transition-colors border cursor-pointer"
              style={{ borderColor: "#22c55e", background: "transparent" }}
            >
              {user.cta}
            </button>
          ) : (
            <button className="w-full p-0.5 cursor-pointer bg-gradient-to-r from-zinc-700 to-teal-500">
              <div className="py-3 bg-white text-[14px] text-gray-800 font-semibold ">
                {user.cta}
              </div>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────

export default function WhoUsesScrubbe() {
  const [active, setActive] = useState(1);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const activeUser = ALL_USERS.find((u) => u.id === active)!;

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
              id="wugrid"
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
          <rect width="100%" height="100%" fill="url(#wugrid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white border border-gray-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[420px_1fr_1fr] min-h-[680px]"
        >
          {/* ── LEFT: Headline + footnote ── */}
          <div
            className="p-8 flex flex-col justify-between"
            style={{ borderRight: "1px solid #e5e7eb" }}
          >
            <div>
              <h2
                className="font-black text-gray-950 leading-[1.08] tracking-[-0.03em] mb-6"
                style={{ fontSize: "clamp(28px, 3vw, 42px)" }}
              >
                For teams that can detect incidents — but cannot safely resolve
                them.
              </h2>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Scrubbe is strongest where production failure creates pressure,
                ambiguity, and execution risk. Choose a user profile to see how
                Scrubbe fits their workflow.
              </p>
            </div>
            <p
              className="text-[12px] text-gray-400 leading-relaxed mt-8"
              style={{ fontFamily: "monospace" }}
            >
              Primary users operate the incident loop. Secondary users consume
              decisions, approve action, or measure risk reduction.
            </p>
          </div>

          {/* ── MIDDLE: Tab list ── */}
          <div
            className="flex flex-col"
            style={{ borderRight: "1px solid #e5e7eb" }}
          >
            {/* Primary users header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b border-gray-200"
              style={{ background: "#f9fafb" }}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Primary Users
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 5l4 4 4-4"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Primary user tabs */}
            {PRIMARY_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => setActive(u.id)}
                className="flex items-start gap-3 px-5 py-4 text-left border-b border-gray-100 cursor-pointer transition-colors"
                style={{
                  background: active === u.id ? "#111827" : "white",
                  border: active === u.id ? "none" : undefined,
                }}
              >
                <span
                  className="text-[11px] font-bold shrink-0 w-6 h-6 rounded flex items-center justify-center mt-0.5"
                  style={{
                    background: active === u.id ? "#374151" : "#f3f4f6",
                    color: active === u.id ? "#f9fafb" : "#6b7280",
                  }}
                >
                  {String(u.id).padStart(2, "0")}
                </span>
                <span>
                  <span
                    className="text-[13.5px] font-semibold block"
                    style={{ color: active === u.id ? "#f9fafb" : "#111827" }}
                  >
                    {u.label}
                  </span>
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: active === u.id ? "#9ca3af" : "#9ca3af" }}
                  >
                    {u.tag}
                  </span>
                </span>
              </button>
            ))}

            {/* Secondary users header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b border-t border-gray-200"
              style={{ background: "#f9fafb" }}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Secondary Users
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 5l4 4 4-4"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Secondary user tabs */}
            {SECONDARY_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => setActive(u.id)}
                className="flex items-start gap-3 px-5 py-4 text-left border-b border-gray-100 last:border-0 cursor-pointer transition-colors"
                style={{
                  background: active === u.id ? "#111827" : "white",
                }}
              >
                <span
                  className="text-[11px] font-bold shrink-0 w-6 h-6 rounded flex items-center justify-center mt-0.5"
                  style={{
                    background: active === u.id ? "#374151" : "#f3f4f6",
                    color: active === u.id ? "#f9fafb" : "#6b7280",
                  }}
                >
                  {String(u.id).padStart(2, "0")}
                </span>
                <span>
                  <span
                    className="text-[13.5px] font-semibold block"
                    style={{ color: active === u.id ? "#f9fafb" : "#111827" }}
                  >
                    {u.label}
                  </span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                    {u.tag}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* ── RIGHT: Detail panel ── */}
          <div className="relative p-8 overflow-hidden">
            <DetailPanel user={activeUser} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
