"use client";

import ConnectorsSection from "@/components/IMS/Home/ConnectorSection";
import CButton from "@/components/ui/Cbutton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaGitlab } from "react-icons/fa";

// ─── shared primitives ───────────────────────────────────────────

const G = "#1a6b3c"; // brand green
const DARK = "#0a0a08";
const MINT = "#e8f4ec";

// ─────────────────────────────────────────────────────────────────
// 1. HERO — dark grid, Scrubbe + GitLab logos
// ─────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      style={{ background: DARK }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="w-full h-full opacity-60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="cgrid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#e5e7eb30"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cgrid)" />
        </svg>
      </div>
      {/* grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Logo row */}
        <div className="flex items-center justify-center gap-4 mb-10 flex-wrap">
          {/* Scrubbe diamond */}
          <img
            src="/IMS/icons/scrubbe-white-icon.svg"
            className="h-[50px] md:h-[70px]"
          />
          <span className="text-white font-serif text-5xl md:text-6xl font-bold">
            Scrubbe
          </span>
          <span className="text-white text-5xl md:text-6xl font-light opacity-60">
            +
          </span>
          {/* GitLab fox */}
          <FaGitlab className="text-orange-600 size-10 md:size-20" />
          <span className="text-white font-serif text-5xl md:text-6xl font-bold">
            GitLab
          </span>
        </div>

        <h2 className="text-white font-serif text-2xl sm:text-3xl md:text-4xl leading-snug mb-6 max-w-3xl mx-auto">
          From merge request to production incident to governed remediation —{" "}
          <em>all connected, all reasoned, all audited.</em>
        </h2>

        <p className=" text-white  text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-10">
          Scrubbe connects GitLab repositories, pipelines, deployments,
          observability systems, and production infrastructure into a unified
          operational intelligence and autonomous remediation platform.
          Continuously analyse merge requests, pipelines, runtime failures, and
          historical incidents — then safely coordinate AI agents to
          investigate, propose, and execute under governance.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            className="px-7 py-3 font-semibold text-white rounded-lg text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#1a5c34,#2d9e5f)" }}
          >
            Connect Gitlab
          </button>
          <button
            className="px-7 py-3 font-semibold rounded-lg text-sm border transition-all hover:bg-white/10 active:scale-95"
            style={{ borderColor: "#2d9e5f", color: "#5ede9a" }}
            data-cal-namespace="hero-demo"
            data-cal-link="scrubbe/decision-system-demo"
            data-cal-config='{"layout":"month_view","theme":"light"}'
          >
            Book Enterprise Demo
          </button>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 2. "GitLab is more than a CI/CD platform"
// ─────────────────────────────────────────────────────────────────

const capabilities = [
  {
    label: "Capability",
    title: "Repository & Service Intelligence",
    body: "Scrubbe continuously analyses GitLab repositories to understand application architecture, service boundaries, infrastructure definitions, deployment configurations, dependency relationships, and operational criticality. It ingests CODEOWNERS data, parses Infrastructure-as-Code, constructs live dependency graphs, and generates full service topology models — giving every investigation an accurate structural foundation before any agent begins reasoning.",
    examples: [],
  },
  {
    label: "Capability",
    title: "Merge Request Operational Reviews",
    body: "Scrubbe evaluates merge requests for operational risk — not static code quality. The platform identifies scaling vulnerabilities, infrastructure sensitivity, deployment hazards, cascading failure potential, rollback complexity, and resilience regressions before a change reaches production. Every review is backed by production context, not pattern matching alone.",
    examples: [
      '"This change introduces elevated retry amplification risk during downstream service degradation."',
      '"This deployment modifies autoscaling assumptions for payment processing workloads."',
    ],
  },
  {
    label: "Capability",
    title: "Pipeline & Deployment Intelligence",
    body: "Scrubbe continuously correlates GitLab pipelines, deployments, runtime telemetry, incidents, traces, logs, and infrastructure changes into a unified operational view. The platform automatically identifies suspicious deploys, unstable release patterns, regression indicators, deployment anomalies, and operational drift — without requiring engineers to manually query across disconnected systems.",
    examples: [],
  },
  {
    label: "Capability",
    title: "Incident-to-Code Correlation",
    body: "When incidents occur, Scrubbe traces failures back to merge requests, commits, deployments, pipeline stages, infrastructure changes, and service dependencies — automatically identifying likely root causes, impacted systems, blast radius, rollback candidates, and mitigation opportunities. Correlation happens in seconds, not across manual investigation hours.",
    examples: [],
  },
  {
    label: "Capability",
    title: "AI Root Cause Analysis",
    body: "Scrubbe agents investigate incidents across GitLab repositories, CI/CD pipelines, Kubernetes environments, observability systems, and deployment history simultaneously — producing probable root causes with confidence scores, operational timelines, remediation recommendations, rollback guidance, and risk assessments. Every conclusion is evidence-backed.",
    examples: [
      '"Elevated API latency likely introduced by deployment from pipeline #842 modifying Redis retry backoff behaviour."',
    ],
  },
  {
    label: "Capability",
    title: "Autonomous Remediation MRs",
    body: "Scrubbe generates governed AI remediation merge requests directly inside GitLab — creating rollback MRs, patching configuration errors, disabling problematic feature flags, mitigating retry storms, updating infrastructure policies, and proposing safe production fixes. Every generated MR includes full operational reasoning, linked evidence, policy evaluation, affected systems, verification results, and rollback plans. No unexplained changes. No blind automation.",
    examples: [],
  },
];

function PlatformSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="px-6 md:px-16 py-24" style={{ background: MINT }}>
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-16 items-start">
        {/* ── Left ── */}
        <div className="md:sticky md:top-24">
          <h2 className="font-serif text-[32px] sm:text-[40px] md:text-[44px] leading-tight text-zinc-900 mb-6">
            GitLab is more than
            <br />a CI/CD <em style={{ color: G }}>platform</em>
          </h2>
          <p className="text-zinc-700 text-[15px] italic leading-relaxed mb-6 font-serif">
            Scrubbe transforms GitLab into a live operational intelligence
            system — continuously building a semantic graph across repositories,
            services, pipelines, deployments, environments, infrastructure,
            ownership, dependencies, incidents, and runtime behaviour.
          </p>
          <p className="text-zinc-600 text-[14px] leading-relaxed mb-4">
            This is not a code assistant layered on top of your repositories. It
            is an{" "}
            <strong className="text-zinc-900">
              operational reasoning platform
            </strong>{" "}
            that understands your entire software delivery lifecycle — and
            connects it to the production reality your engineering teams are
            responsible for maintaining.
          </p>
          <p className="text-zinc-600 text-[14px] leading-relaxed">
            When incidents occur, Scrubbe does not surface signals for engineers
            to interpret manually. It investigates, correlates, concludes, and
            proposes governed remediation — producing evidence-backed findings
            that engineering leadership can act on with confidence.
          </p>
        </div>

        {/* ── Right — expanded cards ── */}
        <div className="flex flex-col gap-0">
          {capabilities.map((c, i) => {
            const isLast = i === capabilities.length - 1;
            return (
              <div
                key={i}
                className={`py-6 px-5 rounded-xl mb-3 transition-colors`}
                style={{
                  background: "#E8F3EC",
                  border: "1px solid rgba(26,107,60,0.12)",
                }}
              >
                {/* Label */}
                <div onClick={() => setOpenIdx(i)}>
                  <p
                    className="text-[10px] font-mono tracking-widest mb-1.5"
                    style={{ color: G }}
                  >
                    {c.label}
                  </p>

                  {/* Title */}
                  <h3 className="text-[16px] font-bold text-zinc-900">
                    {c.title}
                  </h3>
                </div>

                {/* Body */}
                {openIdx === i && (
                  <div className="mt-3">
                    <p className="text-[13px] text-zinc-600 leading-relaxed">
                      {c.body}
                    </p>

                    {/* Example quotes */}
                    {c.examples.length > 0 && (
                      <div className="mt-4 flex flex-col gap-3">
                        {c.examples.map((ex, j) => (
                          <div
                            key={j}
                            className="px-4 py-3 rounded-lg"
                            style={{
                              background: "rgba(26,107,60,0.05)",
                              border: "1px solid rgba(26,107,60,0.15)",
                            }}
                          >
                            <p className="text-[10px] font-mono tracking-widest mb-1.5 text-zinc-400">
                              Example &nbsp;·
                            </p>
                            <p className="text-[13px] font-serif italic text-zinc-600 leading-relaxed">
                              {ex}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 3. Enterprise governance — dark section
// ─────────────────────────────────────────────────────────────────

function GovernanceSection() {
  return (
    <section className="px-6 md:px-16 py-24">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-16 items-start">
        {/* Left */}
        <div className="md:sticky md:top-24">
          <h2 className="font-serif text-[36px] sm:text-[48px] leading-tight">
            Enterprise AI
            <br />
            requires{" "}
            <em style={{ color: G }}>
              enterprise
              <br />
              governance
            </em>
          </h2>
        </div>

        {/* Right */}
        <div>
          <p className="font-serif italic   text-[16px] leading-relaxed mb-8">
            Scrubbe was built for governed engineering operations from day one.
            Autonomy without governance is liability. Every AI-generated action
            is evaluated against organisational policy before it reaches an
            engineer's queue or executes automatically.
          </p>
          <hr className="border-white/10 mb-8" />
          <p className="  text-[14px] leading-relaxed mb-8">
            The platform enforces approval workflows, repository permissions,
            environment restrictions, execution scopes, and operational
            safeguards at every layer. Engineering leadership retains full
            visibility and control — with the ability to define precisely what
            AI systems can and cannot do, at the level of individual
            repositories, environments, and incident severities.
          </p>

          <blockquote
            className="border-l-2 pl-5 mb-8"
            style={{ borderColor: G }}
          >
            <p className=" font-serif italic text-[15px] leading-relaxed mb-3">
              "Every proposed action is evaluated against organisational
              policies, approval scopes, repository permissions, environment
              restrictions, and operational safeguards — before a single line of
              code is touched."
            </p>
            <p
              className="text-[10px] font-mono tracking-widest"
              style={{ color: G }}
            >
              Scrubbe — Governance Architecture
            </p>
          </blockquote>

          <p className="  text-[14px] leading-relaxed">
            Before proposing or executing any change, Scrubbe runs CI
            validations, replays traffic, simulates incidents, validates
            infrastructure, executes policy checks, runs security scans, and
            tests rollback safety. The result is a verified remediation proposal
            with a complete evidence chain — not a speculative suggestion with
            no operational grounding.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 4. Three governance cards
// ─────────────────────────────────────────────────────────────────

const govCards = [
  {
    layer: "Control Layer",
    title: "Policy Engine",
    body: "Define exactly what autonomous systems are allowed to do across repositories, environments, and incident severities. Policies are version-controlled and auditable.",
    items: [
      "Prevent AI modification of authentication systems",
      "Require approval for all production deployments",
      "Restrict rollback permissions by incident severity",
      "Limit autonomous remediation to approved repositories",
      "Block deployment execution during freeze windows",
    ],
  },
  {
    layer: "Approval Layer",
    title: "Human Approval Workflows",
    body: "Scrubbe supports human-in-the-loop approvals, staged execution, multi-party authorisation, and environment-specific governance. Autonomous execution remains fully controlled.",
    items: [
      "Human-in-the-loop approval gates",
      "Staged multi-environment execution",
      "Multi-party authorisation chains",
      "Environment-specific governance rules",
      "Full audit trail for every decision",
    ],
  },
  {
    layer: "Verification Layer",
    title: "Sandboxed Validation",
    body: "Every proposed change is validated before it reaches an engineer or executes. Scrubbe does not speculate — it validates, then proposes.",
    items: [
      "CI validation and traffic replay",
      "Incident simulation and failure testing",
      "Infrastructure validation",
      "Security scan execution",
      "Rollback safety verification",
    ],
  },
];

function GovernanceCards() {
  return (
    <section className="px-6 md:px-16 py-20" style={{ background: DARK }}>
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {govCards.map((c) => (
          <div
            key={c.layer}
            className="rounded-2xl p-8 flex flex-col gap-4"
            style={{ background: "#f8f6f0" }}
          >
            <p
              className="text-[10px] font-mono tracking-widest"
              style={{ color: G }}
            >
              {c.layer}
            </p>
            <h3 className="font-serif text-[22px] font-bold text-zinc-900">
              {c.title}
            </h3>
            <p className="text-[13px] text-zinc-600 leading-relaxed">
              {c.body}
            </p>
            <ul className="flex flex-col gap-3 mt-2">
              {c.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[13px] text-zinc-700"
                >
                  <span className="mt-0.5 text-zinc-400 shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 5. "Built for the moments that matter most"
// ─────────────────────────────────────────────────────────────────

const moments = [
  {
    num: "01",
    cat: "Incident Response",
    title: "AI-Powered Incident Response",
    body: "Automatically investigate production failures and generate governed remediation workflows. Reduce mean time to resolution without requiring manual signal correlation across disconnected observability, pipeline, and repository systems.",
    flow: [
      "Detection → Investigation",
      "Root cause → Remediation MR",
      "Execution → Verification",
    ],
  },
  {
    num: "02",
    cat: "Risk Analysis",
    title: "Deployment Risk Intelligence",
    body: "Understand the full operational risk profile of a deployment before it reaches production. Blast radius, rollback complexity, pipeline sensitivity, and infrastructure assumptions are surfaced at review time — not during a 3am incident.",
    flow: [
      "MR submitted → AI review",
      "Risk scoring → Team notification",
      "Deployment gate → Decision",
    ],
  },
  {
    num: "03",
    cat: "MR Reviews",
    title: "Merge Request Operational Reviews",
    body: "Catch resilience and infrastructure risks before merge approval — with operational context that exceeds what any static analyser or human reviewer can reasonably maintain across a large GitLab estate.",
    flow: [
      "Code change → Operational scan",
      "Risk signal → Review comment",
      "Evidence chain → Audit record",
    ],
  },
  {
    num: "04",
    cat: "Automation",
    title: "Autonomous Rollbacks",
    body: "Safely rollback unhealthy deployments using policy-governed execution. Every rollback is reasoned, sandboxed, verified, and fully audited — providing engineering leadership with a complete record of what was done, why, and under whose policy authority.",
    flow: [
      "Failure → Policy check",
      "Rollback MR → Verification",
      "Execution → Audit record",
    ],
  },
  {
    num: "05",
    cat: "Infrastructure",
    title: "Infrastructure Failure Analysis",
    body: "Correlate infrastructure incidents with deployments, pipeline changes, and configuration drift. Scrubbe identifies whether a production failure traces to application code, infrastructure policy, or operational configuration — with evidence to support the conclusion.",
    flow: [
      "Infra incident → Git correlation",
      "Pipeline mapping → Root cause",
      "Config diff → Remediation",
    ],
  },
  {
    num: "06",
    cat: "Knowledge",
    title: "Engineering Knowledge Retention",
    body: "Build long-term operational memory across teams, incidents, and deployments. Reduce repeated failures from the same root causes as institutional knowledge compounds — regardless of engineering team changes.",
    flow: [
      "Incident resolved → Memory graph",
      "Pattern library → Future signal",
      "Historical context → Faster RCA",
    ],
  },
];

function PreserveSection() {
  return (
    <section className="px-6 md:px-16 py-24 bg-IMSDarkGreen bg-[url('/IMS/preserve.png')] bg-cover">
      <div className="mx-auto max-w-5xl text-white">
        <div className="max-w-2xl">
          <h2 className="font-serif text-[36px] sm:text-[48px] leading-tight mb-10">
            Preserve institutional operational intelligence{" "}
          </h2>

          <p>
            Scrubbe continuously learns from incidents, deployments, rollback
            events, infrastructure failures, operational regressions,
            remediation workflows, and historical GitLab activity. Over time,
            the platform builds an engineering memory graph that enables
            recurring incident detection, operational pattern recognition,
            deployment risk forecasting, and organisational memory retention
            across engineering tenure cycles.
          </p>

          <p className="mt-4">
            As teams change and systems evolve, Scrubbe retains the
            institutional operational knowledge that would otherwise leave with
            individual engineers — making every future investigation faster and
            every remediation better informed.
          </p>

          <div className="flex items-center gap-4 mt-10">
            <button
              className="px-7 py-3 font-semibold text-white rounded-lg text-sm transition-all hover:opacity-90 active:scale-95"
              style={{
                background:
                  "linear-gradient(45deg,#082223,#204A46,#1BA55D,#A0DB82,#D9F392,#FDFF9C)",
              }}
            >
              Connect Gitlab
            </button>
            <button
              className="px-7 py-3 font-semibold rounded-lg text-sm border transition-all bg-white active:scale-95"
              style={{ borderColor: "#082223", color: "#082223" }}
            >
              Book Enterprise Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function MomentsSection() {
  return (
    <section className="px-6 md:px-16 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-serif text-[36px] sm:text-[48px] leading-tight mb-16">
          Built for the moments
          <br />
          <em style={{ color: G }}>that matter most</em>
        </h2>

        <div
          className="divide-y"
          style={{ borderColor: "rgba(255,255,255,.08)" }}
        >
          {moments.map((m) => (
            <div
              key={m.num}
              className="grid grid-cols-1 sm:grid-cols-[160px_1fr_180px] gap-6 py-10"
            >
              {/* number + category */}
              <div className="flex sm:flex-col gap-3 sm:gap-1">
                <span className="font-mono text-[11px] text-white/20">
                  {m.num} / {m.cat}
                </span>
              </div>
              {/* title + body */}
              <div>
                <h3 className="font-serif text-[17px]  mb-3">{m.title}</h3>
                <p className="text-[13px]   leading-relaxed">{m.body}</p>
              </div>
              {/* flow */}
              <div className="flex flex-col gap-1.5">
                {m.flow.map((f) => (
                  <p key={f} className="text-[11px] font-mono ">
                    {f}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 6. Why Scrubbe — comparison table
// ─────────────────────────────────────────────────────────────────

const others = [
  "Code suggestions and autocomplete",
  "Merge request summaries",
  "Repository chatbot interactions",
  "No production system awareness",
  "No governance or approval layer",
  "No audit trail for AI decisions",
];
const scrubbe = [
  "Operational intelligence across code, pipelines, and infrastructure",
  "Governed AI reasoning across production incidents",
  "Autonomous remediation under policy-defined bounds",
  "Production-aware blast radius and deployment risk",
  "Approval workflows with ownership enforcement",
  "Complete auditability of every AI-generated action",
];

function WhyScrubbeSection() {
  return (
    <section className="px-6 md:px-16 py-24" style={{ background: DARK }}>
      <div className="mx-auto max-w-5xl">
        <h2 className="font-serif text-[38px] sm:text-[52px] font-bold text-white leading-tight mb-16">
          Not a coding assistant.
          <br />
          <em style={{ color: G }}>An operations platform.</em>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-white/10 rounded-2xl overflow-hidden mb-16">
          {/* Left col */}
          <div className="p-8 border-r border-white/10">
            <p className="text-[11px] font-mono tracking-widest   mb-6">
              Other AI tools stop at
            </p>
            <div className="divide-y divide-white/10">
              {others.map((item) => (
                <div key={item} className="flex items-start gap-3 py-4">
                  <span className="text-red-500 font-bold shrink-0 mt-0.5">
                    ✕
                  </span>
                  <span className="text-[14px] text-white/50">{item}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Right col */}
          <div className="p-8">
            <p className="text-[11px] font-mono tracking-widest   mb-6">
              Scrubbe operates at
            </p>
            <div className="divide-y divide-white/10">
              {scrubbe.map((item) => (
                <div key={item} className="flex items-start gap-3 py-4">
                  <span
                    className="font-bold shrink-0 mt-0.5"
                    style={{ color: G }}
                  >
                    ✓
                  </span>
                  <span className="text-[14px] text-white/70">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quote + para row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <blockquote>
            <p className="font-serif italic text-white/50 text-[17px] leading-relaxed">
              "Scrubbe connects GitLab to the operational reality of modern
              engineering systems — not just the code that lives inside them."
            </p>
          </blockquote>
          <p className="text-[14px]   leading-relaxed">
            The platform was designed for CTOs, VP Engineering, and platform
            leadership who require governed AI autonomy at scale. Scrubbe makes
            AI decisions that can be approved, traced, explained, and rolled
            back. That is the difference between a tool and a platform your
            organisation can trust with production systems.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 7. Workflow — "From production failure to governed remediation"
// ─────────────────────────────────────────────────────────────────

const steps = [
  {
    num: "01",
    title: "Production Incident Detected",
    body: "Scrubbe monitors production signals in real time and triggers an investigation the moment anomalous behaviour crosses policy-defined thresholds — without waiting for an on-call engineer to manually correlate signals across disconnected systems.",
    tags: [
      "Latency spikes",
      "Elevated error rates",
      "Deployment instability",
      "Infrastructure anomalies",
      "Cascading failures",
    ],
  },
  {
    num: "02",
    title: "AI Agents Investigate",
    body: "Specialised agents automatically correlate recent deployments, inspect merge requests, analyse commits, evaluate pipelines, inspect runtime telemetry, and identify suspicious operational patterns — working in parallel across the full engineering graph, not sequentially.",
    tags: [
      "MR inspection",
      "Pipeline analysis",
      "Telemetry evaluation",
      "Pattern detection",
    ],
  },
  {
    num: "03",
    title: "Root Cause Analysis Generated",
    body: "Scrubbe produces a structured root cause report: suspected causes with confidence scoring, deployment correlation, blast radius analysis, and rollback recommendations — each backed by specific evidence from the investigation across code, pipelines, and runtime systems.",
    tags: [
      "Confidence scoring",
      "Blast radius",
      "Deployment correlation",
      "Rollback candidates",
    ],
  },
  {
    num: "04",
    title: "AI Remediation MR Created",
    body: "The platform opens a governed GitLab merge request containing proposed remediation, operational reasoning, affected services, linked evidence, validation outputs, and rollback guidance. Engineers receive a complete decision package — not a code suggestion without context.",
    tags: [
      "Governed MR",
      "Linked evidence",
      "Policy evaluation",
      "Validation results",
    ],
  },
  {
    num: "05",
    title: "Approval or Autonomous Execution",
    body: "Policy configuration determines execution mode. Sensitive environments route through engineer approval workflows. Low-risk, policy-permitted remediations execute autonomously within defined safety bounds, with full audit logging.",
    tags: ["Approval workflow", "Autonomous execution", "Policy gate"],
  },
  {
    num: "06",
    title: "Continuous Verification",
    body: "Scrubbe monitors recovery health, regression signals, deployment stability, and post-remediation system behaviour. Operational learnings are recorded into the engineering memory graph — reducing recurrence probability and accelerating future investigations.",
    tags: ["Recovery monitoring", "Regression signals", "Memory graph update"],
  },
];

function WorkflowSection() {
  return (
    <section className="px-6 md:px-16 py-24" style={{ background: MINT }}>
      <div className="mx-auto max-w-4xl">
        <h2 className="font-serif text-[32px] sm:text-[40px] font-bold text-zinc-900 leading-tight mb-4">
          From production failure
          <br />
          to <em style={{ color: G }}>governed remediation</em>
        </h2>
        <p className="text-[14px] text-zinc-600 leading-relaxed max-w-xl mb-16">
          Six governed phases — from initial detection through continuous
          post-remediation verification. Each phase is observable, auditable,
          and policy-bounded. Engineering teams can engage at any point, and
          policy determines which phases execute autonomously.
        </p>

        <div className="flex flex-col gap-0">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="grid grid-cols-[80px_1fr] gap-6 pb-14 relative"
            >
              {/* vertical line */}
              {i < steps.length - 1 && (
                <div
                  className="absolute left-[39px] top-12 bottom-0 w-px"
                  style={{ background: "rgba(26,107,60,.2)" }}
                />
              )}
              {/* number */}
              <div className="flex flex-col items-center gap-1 pt-1">
                <span
                  className="font-serif font-bold text-[32px] leading-none"
                  style={{ color: "rgba(26,107,60,.25)" }}
                >
                  {s.num}
                </span>
              </div>
              {/* content */}
              <div>
                <h3 className="font-serif text-[18px] font-bold text-zinc-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-[13px] text-zinc-600 leading-relaxed mb-4">
                  {s.body}
                </p>
                <div className="flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-mono border px-2.5 py-1 rounded text-zinc-600"
                      style={{
                        borderColor: "rgba(26,107,60,.3)",
                        background: "rgba(26,107,60,.05)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 8. CTA — green section
// ─────────────────────────────────────────────────────────────────

function CTASection() {
  const router = useRouter();
  return (
    <section
      className="relative px-6 md:px-16 py-20 overflow-hidden"
      style={{ background: G }}
    >
      {/* subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <h2 className="font-serif font-bold text-white text-[34px] sm:text-[44px] leading-tight">
            Bring Governed AI Operations
            <br />
            to <em>GitLab</em>
          </h2>
        </div>
        {/* Right */}
        <div>
          <p className="text-white/80 text-[14px] leading-relaxed mb-6">
            Connect repositories, pipelines, deployments, infrastructure, and
            observability systems into a unified operational intelligence
            platform powered by governed AI agents. Available for GitLab Cloud,
            GitLab Self-Managed, and multi-group enterprise environments.
          </p>
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => router.push("/auth/signin")}
              className="px-6 py-3 bg-white text-zinc-900 font-semibold text-sm rounded-lg hover:bg-zinc-100 transition-colors active:scale-95"
            >
              Connect GitLab
            </button>
          </div>
          <div className="flex flex-wrap gap-6">
            <a
              href="#"
              className="text-[12px] font-mono tracking-wide text-white/70 hover:text-white transition-colors"
            >
              Talk to Solutions Engineering →
            </a>
            <a
              href="#"
              className="text-[12px] font-mono tracking-wide text-white/70 hover:text-white transition-colors"
            >
              See Live Platform Demo →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────

export default function ScrubbePage() {
  return (
    <main>
      <Hero />
      <PlatformSection />
      <GovernanceSection />
      <GovernanceCards />
      <WorkflowSection />
      <PreserveSection />
      <MomentsSection />
      <WhyScrubbeSection />
      <ConnectorsSection filter="gitlab" />
      <CTASection />
    </main>
  );
}
