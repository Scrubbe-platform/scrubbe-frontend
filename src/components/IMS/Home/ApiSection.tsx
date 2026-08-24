"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ── Code samples ──────────────────────────────────────────────────

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
        text: '  "description": "Deployment failed for commit a1b2c3d. Error rate ↑",',
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

const RESPONSE_LINES: { text: string; color?: string }[] = [
  { text: "{" },
  { text: '  "incident_id": "inc_8f4a7c2b",', color: "#86efac" },
  { text: '  "status": "created",', color: "#86efac" },
  { text: '  "severity": "high",', color: "#86efac" },
  { text: '  "service": "checkout-api",', color: "#86efac" },
  { text: '  "created_at": "2023-05-20T10:24:31Z",', color: "#86efac" },
  { text: '  "investigation": {' },
  { text: '    "investigation_id": "inv_d3e9b1a2",', color: "#86efac" },
  { text: '    "status": "started"', color: "#86efac" },
  { text: "  }," },
  { text: '  "links": {' },
  {
    text: '    "self": "https://api.scrubbe.com/v1/incidents/inc_8f4a7c2b"',
    color: "#86efac",
  },
  { text: "  }" },
  { text: "}" },
];

const WHY_CARDS = [
  {
    title: "Trigger incidents from anywhere",
    content:
      "Raise incidents directly from your own systems — monitoring tools, CI/CD pipelines, custom webhooks, and security alerts. Instead of manually opening incidents, teams can automatically trigger workflows when critical thresholds are reached.",
  },
  {
    title: "Automate investigations",
    content:
      "Programmatically start investigations the moment an incident is raised. Create investigation sessions, fetch correlated signals, match playbooks, retrieve root cause hypotheses, and generate remediation options.",
  },
  {
    title: "Enforce approvals before execution",
    content:
      "Every execution request is evaluated against approval rules, risk thresholds, service criticality, blast radius analysis, and role permissions. High-risk actions can be blocked or routed for approval automatically.",
  },
  {
    title: "Execute remediation through code",
    content:
      "Trigger approved remediation actions directly — rollback deployment, restart service, scale replicas, invalidate cache, rotate credentials, or pause rollout. Execution only proceeds when policies allow it.",
  },
  {
    title: "Build internal tooling on top of Scrubbe",
    content:
      "Embed Scrubbe into internal platforms — incident portals, deployment gates, release health checks, runbook automation, engineering command centers. Scrubbe becomes infrastructure, not just another UI.",
  },
  {
    title: "Controlled, programmatic incident remediation",
    content:
      "Allow external systems to trigger governed multi-agent workflows that diagnose issues, evaluate safe fixes, and execute approved actions — with guardrails, approvals, and logging so nothing goes unchecked.",
  },
];
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

const CAPABILITIES = [
  {
    title: "Incident APIs",
    items: [
      "Create incident",
      "Update status",
      "Assign responders",
      "Fetch Timeline",
    ],
  },
  {
    title: "Investigation APIs",
    items: [
      "Start Investigation",
      "Get correlations",
      "Retrieve playbook matches",
      "Confidence Scores",
    ],
  },
  {
    title: "Approval APIs",
    items: [
      "Request approval",
      "Approve/deny execution",
      "Audit approvals",
      "Confidence Scores",
    ],
  },
  {
    title: "Execution APIs",
    items: [
      "Execute remediation",
      "Cancel execution",
      "Dry-run action",
      "Fetch execution logs",
    ],
  },
];

const CONNECTED_TAGS = [
  "Source control",
  "Deployment",
  "Cloud",
  "Infrastructure",
  "Observability",
  "Collaboration",
  "Ticketing",
  "Security",
  "Internal systems",
];

const LANGS = ["TypeScript", "Python", "JavaScript", "Go", "Ruby"] as const;
type Lang = (typeof LANGS)[number];

// Display label for each lang tab (short labels matching screenshot)
const LANG_LABELS: Record<Lang, string> = {
  TypeScript: "Typescript",
  Python: "Python",
  JavaScript: "Javascript",
  Go: "GO",
  Ruby: "RB",
};

function CodeBlock({ lang }: { lang: Lang }) {
  const sample = CODE_SAMPLES[lang];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={lang}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="font-mono text-[12.5px] leading-6"
      >
        {sample.lines.map((line, i) => (
          <div key={i} className="flex gap-4">
            <span className="select-none w-5 text-right shrink-0 text-gray-600">
              {line.text !== "" ? i + 1 : ""}
            </span>
            <span style={{ color: line.color ?? "#d1d5db" }}>{line.text}</span>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function APISection() {
  const [activeLang, setActiveLang] = useState<Lang>("TypeScript");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [showResponse, setShowResponse] = useState(false);
  return (
    <div ref={ref} className="w-full bg-white">
      <div className="max-w-[1480px] mx-auto px-6 py-16 space-y-20">
        {/* ── Hero block: headline + CTAs left, illustration right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif font-bold text-gray-950 leading-[1.15] mb-5"
              style={{ fontSize: "clamp(30px, 3.4vw, 46px)" }}
            >
              Incident response , built into your infrastructure
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-[15px] text-gray-500 leading-relaxed mb-8 max-w-[480px]"
            >
              Connect Scrubbe directly to your existing stack and program
              investigations , approvals and remediation into your operational
              workflows
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="flex items-center gap-3"
            >
              <Link
                href="/docs"
                className="px-6 py-3 rounded-lg shadow-md shadow-light font-bold text-[14px] text-white bg-black hover:brightness-110 transition-all"
              >
                Read the API docs
              </Link>
              <Link
                href="/connector"
                className="px-6 py-3 rounded-lg shadow-md shadow-IMSDarkGreen/15 font-bold text-[14px] text-black bg-white border border-gray-300 hover:border-gray-400 transition-all"
              >
                Explore Integrations
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative w-full aspect-[4/3] hidden lg:block"
          >
            <Image
              src="/IMS/api-docs.png"
              alt="Scrubbe API"
              fill
              className="object-contain"
            />
          </motion.div>
        </div>

        {/* ── Code playground card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border border-gray-200 rounded-2xl bg-white p-8"
        >
          <h3 className="text-[20px] font-bold text-black mb-1">
            Post /v1/incidents
          </h3>
          <p className="text-[13.5px] text-gray-500 mb-6">
            Create an incident programmatically
          </p>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request panel */}
            <div className="rounded-xl p-4" style={{ background: "#f4f5f7" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-semibold text-gray-700">
                  Request
                </span>
                <button
                  onClick={() => setShowResponse(true)}
                  className="px-4 py-1.5 rounded-lg bg-black text-white text-[12.5px] font-semibold border-0 cursor-pointer hover:brightness-110 transition-all"
                >
                  Try it
                </button>
              </div>
              <div
                className="rounded-lg overflow-hidden"
                style={{ background: "#0d1117" }}
              >
                <div className="flex items-center border-b border-[#1f2937] overflow-x-auto">
                  {LANGS.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium whitespace-nowrap cursor-pointer border-0 bg-transparent transition-colors"
                      style={{
                        color: activeLang === lang ? "#f9fafb" : "#6b7280",
                        borderBottom:
                          activeLang === lang
                            ? "2px solid #22c55e"
                            : "2px solid transparent",
                      }}
                    >
                      <span style={{ fontSize: 9, color: "#6b7280" }}>◯</span>
                      {LANG_LABELS[lang]}
                    </button>
                  ))}
                </div>
                <div className="p-4 min-h-[280px] overflow-auto">
                  <CodeBlock lang={activeLang} />
                </div>
              </div>
            </div>

            {/* Center arrow */}
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm">
              <ArrowRight size={16} className="text-gray-700" />
            </div>

            {/* Response panel */}
            <div className="rounded-xl p-4" style={{ background: "#f4f5f7" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-semibold text-gray-700">
                  Response
                </span>
                {showResponse && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 font-mono">
                    201 CREATED
                  </span>
                )}
              </div>
              <div
                className="rounded-lg overflow-hidden min-h-[280px]"
                style={{ background: "#0d1117" }}
              >
                {showResponse ? (
                  <pre className="p-4 text-[12px] font-mono text-gray-300 leading-6 overflow-auto">
                    {RESPONSE_CODE}
                  </pre>
                ) : (
                  <div className="p-4 text-[12.5px] text-gray-500 font-mono">
                    Click "Try it" to see a response
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Link
              href="/docs"
              className="text-[14px] font-bold text-black underline underline-offset-4 inline-flex items-center gap-1.5 hover:text-gray-700 transition-colors"
            >
              Start with Doc
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* ── Connected Systems — two-column editorial matching the screenshot ── */}

        {/* ── Why teams use API ── */}
        {/* <section>
          <h3 className="text-[22px] font-black text-gray-950 tracking-tight mb-6">
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
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                  <div className="w-4 h-4 rounded-sm bg-emerald-400/30 border border-emerald-500/40" />
                </div>
                <h4 className="text-[14px] font-black text-gray-900 mb-2 leading-snug">
                  {card.title}
                </h4>
                <p className="text-[12.5px] text-gray-500 leading-relaxed">
                  {card.content}
                </p>
              </motion.div>
            ))}
          </div>
        </section> */}

        {/* ── API Capabilities ── */}
        {/* <section>
          <h3 className="text-[22px] font-black text-gray-950 tracking-tight mb-6">
            API Capabilities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 14 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.07 * i }}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <h4 className="text-[14px] font-bold text-gray-900 mb-4">
                  {cap.title}
                </h4>
                <div className="space-y-2.5">
                  {cap.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path
                            d="M1.5 4l2 2 3-3"
                            stroke="#16a34a"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="text-[12.5px] text-gray-600">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section> */}
      </div>
    </div>
  );
}
