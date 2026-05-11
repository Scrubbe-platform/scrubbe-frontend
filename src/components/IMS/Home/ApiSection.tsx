"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ─────────────────────────────────────────────────────────────────
// Code samples per language
// ─────────────────────────────────────────────────────────────────

const CODE_SAMPLES: Record<
  string,
  { lines: { text: string; color?: string }[] }
> = {
  TypeScript: {
    lines: [
      { text: "POST https://api.scrubbe.com/v1/incidents", color: "#86efac" },
      { text: "Content-Type: application/json", color: "#93c5fd" },
      { text: "Authorization: Bearer sk_live_••••••••••", color: "#93c5fd" },
      { text: "" },
      { text: "{" },
      { text: '  "title": "Deployment failure detected",', color: "#fde68a" },
      { text: '  "severity": "high",', color: "#fde68a" },
      { text: '  "source": "ci-cd-pipeline",', color: "#fde68a" },
      { text: '  "service": "checkout-api",', color: "#fde68a" },
      { text: '  "environment": "production",', color: "#fde68a" },
      {
        text: '  "description": "Deployment failed for commit a1b2c3d. Error rate ↑',
        color: "#fde68a",
      },
      { text: '  "metadata": {', color: "#fde68a" },
      { text: '    "pipeline_id": "pipe_12345",', color: "#fde68a" },
      { text: '    "commit": "a1b2c3d",', color: "#fde68a" },
      { text: '    "region": "us-east-1"', color: "#fde68a" },
      { text: "  }" },
      { text: "}" },
    ],
  },
  Python: {
    lines: [
      { text: "import requests", color: "#86efac" },
      { text: "" },
      {
        text: 'url = "https://api.scrubbe.com/v1/incidents"',
        color: "#fde68a",
      },
      { text: "headers = {", color: "#93c5fd" },
      { text: '  "Content-Type": "application/json",', color: "#fde68a" },
      {
        text: '  "Authorization": "Bearer sk_live_••••••••••"',
        color: "#fde68a",
      },
      { text: "}" },
      { text: "" },
      { text: "payload = {", color: "#93c5fd" },
      { text: '  "title": "Deployment failure detected",', color: "#fde68a" },
      { text: '  "severity": "high",', color: "#fde68a" },
      { text: '  "source": "ci-cd-pipeline",', color: "#fde68a" },
      { text: '  "service": "checkout-api",', color: "#fde68a" },
      { text: '  "environment": "production"', color: "#fde68a" },
      { text: "}" },
      { text: "" },
      {
        text: "response = requests.post(url, headers=headers, json=payload)",
        color: "#86efac",
      },
    ],
  },
  JavaScript: {
    lines: [
      { text: "const response = await fetch(", color: "#86efac" },
      { text: '  "https://api.scrubbe.com/v1/incidents",', color: "#fde68a" },
      { text: "  {", color: "#93c5fd" },
      { text: '    method: "POST",', color: "#fde68a" },
      { text: "    headers: {", color: "#fde68a" },
      { text: '      "Content-Type": "application/json",', color: "#fde68a" },
      {
        text: '      "Authorization": "Bearer sk_live_••••••••••"',
        color: "#fde68a",
      },
      { text: "    }," },
      { text: "    body: JSON.stringify({", color: "#93c5fd" },
      { text: '      title: "Deployment failure detected",', color: "#fde68a" },
      { text: '      severity: "high",', color: "#fde68a" },
      { text: '      source: "ci-cd-pipeline",', color: "#fde68a" },
      { text: '      service: "checkout-api",', color: "#fde68a" },
      { text: '      environment: "production"', color: "#fde68a" },
      { text: "    })" },
      { text: "  }" },
      { text: ");" },
    ],
  },
  Go: {
    lines: [
      { text: "package main", color: "#86efac" },
      { text: "" },
      { text: "import (", color: "#93c5fd" },
      { text: '  "bytes"', color: "#fde68a" },
      { text: '  "encoding/json"', color: "#fde68a" },
      { text: '  "net/http"', color: "#fde68a" },
      { text: ")" },
      { text: "" },
      { text: "payload := map[string]interface{}{", color: "#93c5fd" },
      {
        text: '  "title":       "Deployment failure detected",',
        color: "#fde68a",
      },
      { text: '  "severity":    "high",', color: "#fde68a" },
      { text: '  "source":      "ci-cd-pipeline",', color: "#fde68a" },
      { text: '  "service":     "checkout-api",', color: "#fde68a" },
      { text: '  "environment": "production",', color: "#fde68a" },
      { text: "}" },
      { text: "body, _ := json.Marshal(payload)", color: "#86efac" },
      {
        text: 'req, _ := http.NewRequest("POST", url, bytes.NewBuffer(body))',
        color: "#86efac",
      },
    ],
  },
  Ruby: {
    lines: [
      { text: 'require "net/http"', color: "#86efac" },
      { text: 'require "json"', color: "#86efac" },
      { text: "" },
      {
        text: 'uri = URI("https://api.scrubbe.com/v1/incidents")',
        color: "#93c5fd",
      },
      { text: "http = Net::HTTP.new(uri.host, uri.port)", color: "#93c5fd" },
      { text: "http.use_ssl = true", color: "#93c5fd" },
      { text: "" },
      { text: "request = Net::HTTP::Post.new(uri)", color: "#fde68a" },
      {
        text: 'request["Content-Type"] = "application/json"',
        color: "#fde68a",
      },
      {
        text: 'request["Authorization"] = "Bearer sk_live_••••••••••"',
        color: "#fde68a",
      },
      { text: "" },
      { text: "request.body = {", color: "#93c5fd" },
      { text: '  title: "Deployment failure detected",', color: "#fde68a" },
      { text: '  severity: "high",', color: "#fde68a" },
      { text: '  service: "checkout-api"', color: "#fde68a" },
      { text: "}.to_json", color: "#93c5fd" },
    ],
  },
};

const RESPONSE_CODE = `{
  "incident_id": "inc_8f4a7c2b",
  "status": "created",
  "severity": "high",
  "service": "checkout-api",
  "created_at": "2023-05-20T10:24:31Z",
  "investigation": {
    "investigation_id": "inv_d3e9b1a2",
    "status": "started"
  },
  "links": {
    "self": "https://api.scrubbe.com/v1/incidents/inc_8f4a7c2b"
  }
}`;

// ─────────────────────────────────────────────────────────────────
// Why teams use API cards
// ─────────────────────────────────────────────────────────────────

const WHY_CARDS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2l2 6h6l-5 3.5 2 6L10 14l-5 3.5 2-6L2 8h6z"
          stroke="#22c55e"
          strokeWidth="1.4"
          fill="none"
        />
      </svg>
    ),
    title: "Trigger incidents from anywhere",
    content: `Raise incidents directly from your own systems. Send incidents directly from your own systems\n• Monitoring tools\n• Internal services\n• CI/CD pipelines\n• Custom webhooks\n• Security alerts\n\nInstead of manually opening incidents, teams can automatically trigger workflows when critical thresholds are reacted`,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle
          cx="9"
          cy="9"
          r="6"
          stroke="#22c55e"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M14 14l4 4"
          stroke="#22c55e"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Automate investigations",
    content: `Programmatically start investigations the moment an incident is raised.\n\nThe API can:\n• create investigation sessions\n• fetch correlated signals\n• match playbooks\n• retrieve root cause hypotheses\n• generate remediation options\n\nThis means your systems can automatically move from detection to analysis without waiting for human coordination.`,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2L3 6v5c0 4 3.5 7 7 8 3.5-1 7-4 7-8V6L10 2z"
          stroke="#22c55e"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M7 10l2 2 4-4"
          stroke="#22c55e"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Enforce approvals before execution",
    content: `Scrubbe API is policy-aware.\n\nEvery execution request is evaluated against:\n• approval rules\n• risk thresholds\n• service criticality\n• blast radius analysis\n• role permissions\n\nHigh-risk actions can be blocked or routed for approval automatically. This lets teams automate safely without giving uncontrolled execution access.`,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M4 4h5v5H4zM11 4h5v5h-5zM4 11h5v5H4z"
          stroke="#22c55e"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M13.5 13.5m-2 0a2 2 0 104 0 2 2 0 10-4 0"
          stroke="#22c55e"
          strokeWidth="1.3"
          fill="none"
        />
      </svg>
    ),
    title: "Execute remediation through code",
    content: `Trigger approved remediation actions directly through API.\n\nExamples:\n• rollback deployment\n• restart service\n• scale replicas\n• invalidate cache\n• rotate credentials\n• pause rollout\n\nExecution only proceeds when policies allow it. This gives teams automation speed without sacrificing operational governance.`,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="3"
          y="3"
          width="14"
          height="14"
          rx="2"
          stroke="#22c55e"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M7 10h6M7 7h6M7 13h4"
          stroke="#22c55e"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Build internal tooling on top of Scrubbe",
    content: `Engineering teams can embed Scrubbe directly into internal platforms.\n\nCommon use cases:\n• internal incident portals\n• deployment gates\n• release health checks\n• runbook automation\n• engineering command centers\n• custom dashboards\n\nScrubbe becomes infrastructure, not just another UI.`,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10"
          cy="6"
          r="2.5"
          stroke="#22c55e"
          strokeWidth="1.3"
          fill="none"
        />
        <circle
          cx="5"
          cy="15"
          r="2"
          stroke="#22c55e"
          strokeWidth="1.3"
          fill="none"
        />
        <circle
          cx="15"
          cy="15"
          r="2"
          stroke="#22c55e"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M10 8.5v3M10 11.5l-3 1.5M10 11.5l3 1.5"
          stroke="#22c55e"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Scrubbe API enables controlled, programmatic incident remediation",
    content: `Allow external systems to trigger governed multi-agent workflows that diagnose issues, evaluate safe fixes, and execute approved actions.\n\n• Controlled, programmatic incident remediation\n• External systems trigger governed multi-agent workflows\n• Diagnose issues, evaluate safe fixes, execute approved actions\n• Strict policies and audit controls\n\nAutomatically detect and fix problems using AI agents — but with guardrails, approvals, and logging so nothing goes rogue or unchecked.`,
  },
];

// ─────────────────────────────────────────────────────────────────
// API Capabilities
// ─────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  {
    icon: "📋",
    title: "Incident APIs",
    items: [
      "Create incident",
      "Update status",
      "Assign responders",
      "Fetch Timeline",
    ],
  },
  {
    icon: "🔍",
    title: "Investigation APIs",
    items: [
      "Start Investigation",
      "Get correlations",
      "Retrieve playbook matches",
      "Confidence Scores",
    ],
  },
  {
    icon: "✅",
    title: "Approval APIs",
    items: [
      "Request approval",
      "Approve/deny execution",
      "Audit approvals",
      "Confidence Scores",
    ],
  },
  {
    icon: "⚡",
    title: "Execution APIs",
    items: [
      "Execute remediation",
      "Cancel execution",
      "Dry-run action",
      "Fetch execution logs",
    ],
  },
];

const LANGS = ["TypeScript", "Python", "JavaScript", "Go", "Ruby"] as const;
type Lang = (typeof LANGS)[number];

// ─────────────────────────────────────────────────────────────────
// Code block with line numbers
// ─────────────────────────────────────────────────────────────────

function CodeBlock({ lang }: { lang: Lang }) {
  const sample = CODE_SAMPLES[lang];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={lang}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="font-mono text-[12.5px] leading-6"
      >
        {sample.lines.map((line, i) => (
          <div key={i} className="flex gap-4">
            <span
              className="select-none w-5 text-right shrink-0"
              style={{ color: "#4b5563" }}
            >
              {line.text !== "" ? i + 1 : ""}
            </span>
            <span style={{ color: line.color ?? "#d1d5db" }}>{line.text}</span>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────

export default function APISection() {
  const [activeLang, setActiveLang] = useState<Lang>("TypeScript");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [showResponse, setShowResponse] = useState(false);
  return (
    <div ref={ref} className="w-full bg-white">
      {/* ── HERO BLOCK ── */}
      <section className="max-w-[960px] mx-auto px-6 py-16">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-500 mb-4"
          style={{ fontFamily: "monospace" }}
        >
          Scrubbe API Section
        </motion.p>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-black text-gray-950 leading-[1.08] tracking-[-0.03em] mb-4"
          style={{ fontSize: "clamp(30px, 4vw, 54px)" }}
        >
          Programmable
          <br />
          Incident <span className="text-emerald-500">Control.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-[14.5px] text-gray-500 leading-relaxed mb-8 max-w-lg"
        >
          Build incident automation directly into your stack with Scrubbe's
          governed API.
        </motion.p>

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-start gap-4 border border-gray-200 rounded-xl p-5 mb-8"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle
                cx="9"
                cy="9"
                r="7"
                stroke="#374151"
                strokeWidth="1.4"
                fill="none"
              />
              <path
                d="M6 9l2 2 4-4"
                stroke="#374151"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-[13.5px] text-gray-600 leading-relaxed mb-2">
              Integrate incident intelligence, approvals, investigations, and
              remediation into your internal tools, CI/CD pipelines, chatops
              workflows, and monitoring systems.
            </p>
            <p className="text-[13.5px] text-gray-500 leading-relaxed">
              Scrubbe API gives engineering teams a programmable control plane
              for incident response — so incidents can be triggered, analyzed,
              approved, and resolved through code.
            </p>
          </div>
        </motion.div>

        {/* ── CODE PLAYGROUND ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border border-gray-200 rounded-xl overflow-hidden"
        >
          {/* Top pill bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
            <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-500 text-white">
              API REQUEST
            </span>
            <span className="px-2.5 py-1 rounded text-[11px] font-semibold border border-gray-300 text-gray-600">
              EXAMPLE: CREATE INCIDENT
            </span>
            <button
              className="px-2.5 py-1 rounded text-[11px] font-bold border border-none cursor-pointer"
              style={{
                background: "linear-gradient(90deg, #1a2a1a, #22c55e)",
                color: "#fff",
              }}
              onClick={() => setShowResponse(true)}
            >
              Try it
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* ── LEFT: Code editor ── */}
            <div
              style={{
                background: "#0d1117",
                borderRight: "1px solid #1f2937",
              }}
            >
              {/* Language tabs */}
              <div className="flex items-center border-b border-[#1f2937] overflow-x-auto">
                {LANGS.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium whitespace-nowrap cursor-pointer border-none bg-transparent transition-colors"
                    style={{
                      color: activeLang === lang ? "#f9fafb" : "#6b7280",
                      borderBottom:
                        activeLang === lang
                          ? "2px solid #22c55e"
                          : "2px solid transparent",
                    }}
                  >
                    <span style={{ fontSize: 10 }}>◯</span>
                    {lang}
                  </button>
                ))}
              </div>

              {/* Code area */}
              <div className="p-5 min-h-[280px]">
                <CodeBlock lang={activeLang} />
              </div>
            </div>

            {/* ── RIGHT: Response panel ── */}
            <div className="bg-white">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
                <span
                  className="text-[11px] font-bold uppercase tracking-widest text-gray-400"
                  style={{ fontFamily: "monospace" }}
                >
                  Response
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                  201 CREATED
                </span>
              </div>
              {showResponse && (
                <pre className="p-5 text-[12px] font-mono text-gray-600 leading-6 overflow-auto">
                  {RESPONSE_CODE}
                </pre>
              )}
            </div>
          </div>
        </motion.div>

        {/* Start with Doc button */}
        <div className="flex justify-end mt-5">
          <button
            className="px-6 py-3 rounded-lg font-bold text-[14px] text-white border-none cursor-pointer transition-all hover:brightness-110"
            style={{
              background:
                "linear-gradient(90deg, #1a2a1a 0%, #14532d 60%, #22c55e 100%)",
            }}
          >
            Start with Doc
          </button>
        </div>
      </section>

      {/* ── WHY TEAMS USE SCRUBBE API ── */}
      <section className="max-w-[960px] mx-auto px-6 pb-16">
        <h3 className="text-[22px] font-black text-gray-900 tracking-tight mb-8">
          Why teams use Scrubbe API
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {WHY_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.45,
                delay: 0.05 * i,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="border border-gray-200 rounded-xl p-5"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <h4 className="text-[14px] font-black text-gray-900 mb-3 leading-snug">
                {card.title}
              </h4>
              <p className="text-[12.5px] text-gray-500 leading-relaxed whitespace-pre-line">
                {card.content}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── API CAPABILITIES ── */}
      <section className="max-w-[960px] mx-auto px-6 pb-20">
        <h3 className="text-[22px] font-black text-gray-900 tracking-tight mb-8">
          API Capabilities
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.07 * i }}
              className="border border-gray-200 rounded-xl p-5"
            >
              {/* <div className="text-2xl mb-3">{cap.icon}</div> */}
              <h4 className="text-[14px] font-bold text-gray-900 mb-4">
                {cap.title}
              </h4>
              <div className="space-y-2.5">
                {cap.items.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" fill="#dcfce7" />
                      <path
                        d="M4.5 7l2 2 3-3"
                        stroke="#16a34a"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[12.5px] text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
