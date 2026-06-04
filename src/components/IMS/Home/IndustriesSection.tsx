"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─────────────────────────────────────────────────────────────────
// Industry data
// ─────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  {
    id: 1,
    tag: "Financial Services",
    tagColor: "#22d3ee",
    title: "Milliseconds and compliance.",
    desc: "A payment rail failure measured in seconds produces regulatory reporting requirements measured in months. Scrubbe enforces PCI DSS, SOX, and MiFID II approval chains — architecturally, not through configuration.",
    bullets: [
      "Payment gateway failures detected in <5s",
      "Trading system latency — confidence-scored fix before SLA breach",
      "Core banking batch failures gated by Change Manager approval",
    ],
    statLabel: "Avg incident cost reduction",
    stat: "£2.4M",
    statSuffix: "/year, tier-1 bank",
    statColor: "#22d3ee",
  },
  {
    id: 2,
    tag: "Healthcare & Life Sciences",
    tagColor: "#22d3ee",
    title: "When availability is clinical.",
    desc: "Downtime on a clinical decision support system is not a revenue event — it is a patient safety event. Scrubbe's immutable audit trail, RBAC approval chains, and policy versioning satisfy HIPAA and FDA 21 CFR Part 11 by architecture.",
    bullets: [
      "EHR platform degradation — blast radius includes medication admin",
      "DICOM gateway failures gated by CISO approval",
      "Full audit chain required for FDA submission support",
    ],
    statLabel: "Compliance coverage",
    stat: "HIPAA · FDA 21 CFR",
    statSuffix: "by architecture",
    statColor: "#f59e0b",
  },
  {
    id: 3,
    tag: "E-Commerce & Retail",
    tagColor: "#f97316",
    title: "Revenue per second.",
    desc: "A 60-second checkout failure during Black Friday generates losses no post-mortem can fully account for. Scrubbe's pattern library turns recurring incident classes into solved problems — the same fix that worked last time surfaces in seconds, not 20 minutes.",
    bullets: [
      "Traffic-triggered DB exhaustion — pattern matched from first occurrence",
      "Payment cascade failures — blast radius to checkout mapped instantly",
      "Flash sale failures resolved before revenue impact is measurable",
    ],
    statLabel: "Avg MTTR — DB pool exhaustion class",
    stat: "4.2m",
    statSuffix: "vs 52m without pattern learning",
    statColor: "#f97316",
  },
  {
    id: 4,
    tag: "SaaS & Cloud Platforms",
    tagColor: "#22d3ee",
    title: "Multi-tenant reliability at continuous scale.",
    desc: "40 deployments per day at 5% incident rate is two incidents a day requiring investigation, remediation, approval, and post-mortem. Scrubbe compresses this cycle. Detection to proposal in under 5 seconds. Approvals in Slack or Teams — no context switching.",
    bullets: [
      "SLA breach exposure reduced 35–60% for 99.9% uptime commitments",
      "Multi-tenant blast radius — enterprise vs free-tier impact distinguished",
      "Auth service JWT failures — CASCADE blast radius across all tenants",
    ],
    statLabel: "SLA breach exposure reduction",
    stat: "35–60%",
    statSuffix: "for 99.9% commitments",
    statColor: "#22d3ee",
  },
  {
    id: 5,
    tag: "Government & Public Sector",
    tagColor: "#9ca3af",
    title: "Audit first. Always.",
    desc: "Every change to a citizen-facing system must be documented, attributable, and subject to external audit — not as an afterthought, but as a first-class property. Scrubbe resolves the public sector paradox: the change management process itself is automated, not the changes.",
    bullets: [
      "GDS standards and NCSC Cyber Essentials documented via audit trail",
      "NHS DSP Toolkit compliance baked into guardrail evaluation",
      "Retroactive audit queries — no log correlation required",
    ],
    statLabel: "Audit trail completeness",
    stat: "100%",
    statSuffix: "every action attributable",
    statColor: "#f9fafb",
  },
  {
    id: 6,
    tag: "Manufacturing & Industrial IoT",
    tagColor: "#9ca3af",
    title: "OT/IT convergence demands governance.",
    desc: "A software failure in a manufacturing execution system is not an availability event — it is a production stoppage with supply chain and safety implications. Scrubbe permanently enforces Stage 2 approval for any action adjacent to physical systems. No exceptions, regardless of automation settings.",
    bullets: [
      "MES failures — blast radius maps to assembly line, not just software",
      "SCADA integration failures trigger enhanced approval chains",
      "Physical-adjacent systems permanently gated — never automated",
    ],
    statLabel: "Physical system governance",
    stat: "Stage 2 min.",
    statSuffix: "human approval always",
    statColor: "#f9fafb",
  },
];

// ─────────────────────────────────────────────────────────────────
// Industry Card
// ─────────────────────────────────────────────────────────────────

function IndustryCard({
  industry,
  index,
  inView,
}: {
  industry: (typeof INDUSTRIES)[0];
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.08 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex flex-col p-6"
      style={{
        borderRight: (index + 1) % 3 !== 0 ? "1px solid #1f2937" : "none",
        borderBottom: index < 3 ? "1px solid #1f2937" : "none",
      }}
    >
      {/* Tag */}
      <p
        className="text-[11px] font-bold tracking-[0.14em] uppercase mb-3"
        style={{ color: industry.tagColor, fontFamily: "monospace" }}
      >
        {industry.tag}
      </p>

      {/* Title */}
      <h3
        className="font-black text-white leading-[1.1] tracking-tight mb-4"
        style={{ fontSize: "clamp(16px, 1.6vw, 22px)" }}
      >
        {industry.title}
      </h3>

      {/* Description */}
      <p
        className="text-[13px] leading-relaxed mb-5"
        style={{ color: "#9ca3af" }}
      >
        {industry.desc}
      </p>

      {/* Bullets */}
      <div className="space-y-2 mb-6">
        {industry.bullets.map((b, i) => (
          <p
            key={i}
            className="text-[11.5px] leading-relaxed"
            style={{ color: "#6b7280", fontFamily: "monospace" }}
          >
            → {b}
          </p>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-[#1f2937] my-4" />

      {/* Stat */}
      <div className="mt-auto">
        <p
          className="text-[10px] uppercase tracking-widest mb-2"
          style={{ color: "#4b5563", fontFamily: "monospace" }}
        >
          {industry.statLabel}
        </p>
        <p className="leading-none">
          <span
            className="font-bold tracking-tight"
            style={{
              fontSize: "clamp(20px, 2.2vw, 32px)",
              color: industry.statColor,
            }}
          >
            {industry.stat}
          </span>
          <span
            className="text-[11px] ml-1.5"
            style={{ color: "#6b7280", fontFamily: "monospace" }}
          >
            {industry.statSuffix}
          </span>
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────

export default function IndustriesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="w-full py-16 px-6"
      style={{ background: "#0a0a0a" }}
    >
      <div className="max-w-[1100px] mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-bold text-white leading-[1.08] tracking-[-0.03em] mb-5"
          style={{ fontSize: "clamp(30px, 4.5vw, 62px)" }}
        >
          Built for industries
          <br />
          where downtime costs more
          <br />
          than the fix.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="text-[14.5px] leading-relaxed mb-12 max-w-md"
          style={{ color: "#9ca3af" }}
        >
          Every sector has a different definition of catastrophic. Scrubbe is
          architected to handle them all — with the governance depth each one
          demands.
        </motion.p>

        {/* Industry cards grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-[#1f2937] rounded-xl overflow-hidden"
          // style={{ background: "#111827" }}
        >
          {INDUSTRIES.map((industry, i) => (
            <IndustryCard
              key={industry.id}
              industry={industry}
              index={i}
              inView={inView}
            />
          ))}
        </motion.div>

        {/* CTA bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-5"
          style={{ borderTop: "1px solid #1f2937" }}
        >
          <div>
            <p
              className="text-[11px] uppercase tracking-widest mb-1"
              style={{ color: "#6b7280", fontFamily: "monospace" }}
            >
              Ready to see it in your stack?
            </p>
            <p className="text-[15px] font-bold text-white">
              Download the full enterprise ebook — all six domain chapters.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              className="px-5 py-2.5 rounded-lg text-[13.5px] font-bold text-black cursor-pointer border-none transition-all hover:brightness-110"
              style={{ background: "#22c55e" }}
            >
              Download ebook →
            </button>
            <button
              data-cal-namespace="hero-demo"
              data-cal-link="scrubbe/decision-system-demo"
              data-cal-config='{"layout":"month_view","theme":"light"}'
              className="px-5 py-2.5 rounded-lg text-[13.5px] font-semibold text-white cursor-pointer transition-all hover:border-gray-400"
              style={{ border: "1px solid #374151", background: "transparent" }}
            >
              Book a Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
