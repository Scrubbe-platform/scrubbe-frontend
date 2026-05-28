"use client";

import ConnectorsSection from "@/components/IMS/Home/ConnectorSection";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ─── tokens ──────────────────────────────────────────────────────
const G = "#1a6b3c";
const DARK = "#0d0d0b";
const MINT = "#e8f4ec";

// ─────────────────────────────────────────────────────────────────
// 1. CTA HERO — dark with green radial glows + decorative circles
// ─────────────────────────────────────────────────────────────────
function HeroSection() {
  const router = useRouter();
  return (
    <section
      className="relative overflow-hidden px-8 md:px-16 py-20"
      style={{ background: DARK, minHeight: 340 }}
    >
      {/* green glow left */}
      <div
        className="absolute -left-16 top-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34,139,60,.55) 0%, transparent 70%)",
        }}
      />
      {/* green glow right */}
      <div
        className="absolute right-0 top-0 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34,139,60,.45) 0%, transparent 70%)",
        }}
      />
      {/* decorative circle bottom-left */}
      <div
        className="absolute -bottom-20 -left-12 w-56 h-56 rounded-full border-[3px] pointer-events-none opacity-60"
        style={{ borderColor: G }}
      />
      {/* decorative circle top-right */}
      <div
        className="absolute -top-10 -right-10 w-44 h-44 rounded-full border-[3px] pointer-events-none opacity-50"
        style={{ borderColor: G }}
      />

      <div className="relative z-10 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left headline */}
        <h1 className="font-serif text-white font-bold text-[36px] sm:text-[44px] md:text-[52px] leading-tight">
          Build Governed Engineering Operations on Top of <em>GitHub</em>
        </h1>

        {/* Right copy + CTAs */}
        <div>
          <p className="text-white/70 text-[14px] sm:text-[15px] leading-relaxed mb-8">
            Connect your repositories, deployments, infrastructure, and
            incidents into a unified operational intelligence system powered by
            governed AI agents. Available for GitHub Cloud, GitHub Enterprise,
            and self-hosted environments.
          </p>

          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => router.push("/auth/signin")}
              className="px-6 py-3 bg-white text-zinc-900 font-semibold text-sm rounded-lg hover:bg-zinc-100 transition-colors active:scale-95"
            >
              Connect GitHub
            </button>
            <button
              className="px-6 py-3 font-semibold text-sm border-b-2 transition-colors hover:border-white text-white/80"
              style={{ borderColor: "rgba(255,255,255,.45)" }}
            >
              Request Enterprise Access
            </button>
          </div>

          <div className="flex flex-wrap gap-6">
            <a
              href="#"
              className="text-[11px] font-mono tracking-wide text-white/50 hover:text-white transition-colors"
            >
              Talk to Solutions Engineering →
            </a>
            <a
              href="#"
              className="text-[11px] font-mono tracking-wide text-white/50 hover:text-white transition-colors"
            >
              See Live Demo →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 2. HERO — light grid, Scrubbe + GitHub logos
// ─────────────────────────────────────────────────────────────────
function LogoHeroSection() {
  const router = useRouter();
  return (
    <section
      className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      style={{ background: "#fff" }}
    >
      {/* grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.06) 1px,transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Logo row */}
        <div className="flex items-center justify-center gap-4 mb-10 flex-wrap">
          {/* Scrubbe */}
          <img
            src="/IMS/icons/scrubbe-icon.svg"
            className="h-[50px] md:h-[70px]"
          />
          <span className="font-serif text-5xl md:text-6xl font-bold text-zinc-900">
            Scrubbe
          </span>
          <span className="text-5xl md:text-6xl text-zinc-400 font-light">
            +
          </span>
          {/* GitHub mark */}
          <svg width="52" height="52" viewBox="0 0 98 96" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
              fill="#24292f"
            />
          </svg>
          <span className="font-serif text-5xl md:text-6xl font-bold text-zinc-900">
            GitHub
          </span>
        </div>

        <h2 className="font-serif text-zinc-900 text-2xl sm:text-3xl md:text-[38px] leading-snug mb-6 max-w-3xl mx-auto">
          From suspicious commits to AI-generated hotfix PRs — Scrubbe reasons
          continuously across your repositories, infrastructure, deployments,
          and incidents in real time.
        </h2>

        <p className="text-zinc-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-10">
          Scrubbe connects GitHub to production systems, incidents, deployments,
          policies, and AI agents — enabling governed root cause analysis,
          intelligent remediation, operational risk reviews, and safe autonomous
          execution under full auditability.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            className="px-7 py-3 font-semibold text-white rounded-lg text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#1a5c34,#2d9e5f)" }}
            onClick={() => router.push("/auth/signin")}
          >
            Connect Github
          </button>
          <button
            className="px-7 py-3 font-semibold rounded-lg text-sm border-2 transition-all hover:bg-zinc-50 active:scale-95 text-zinc-800"
            style={{ borderColor: "#2d9e5f" }}
          >
            Book Enterprise Logo
          </button>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 3. "GitHub is more than source control"
// ─────────────────────────────────────────────────────────────────
const capabilities = [
  {
    title: "Repository Intelligence",
    body: "Scrubbe semantically understands your repositories, service topologies, infrastructure definitions, deployment pipelines, ownership structures, and operational dependencies. It ingests CODEOWNERS data, parses CI/CD configurations, constructs dependency graphs, and maintains a runtime-to-code correlation model — giving agents a complete operational picture before any investigation begins.",
    open: true,
  },
  {
    title: "Incident-to-Code Correlation",
    body: "Traces every production incident back to the responsible code change, deployment, or infrastructure drift — automatically identifying likely root causes, impacted systems, blast radius, and rollback candidates in seconds.",
    open: false,
  },
  {
    title: "AI Root Cause Analysis",
    body: "Produces structured root cause reports with confidence scores, operational timelines, remediation recommendations, rollback guidance, and risk assessments. Every conclusion is evidence-backed.",
    open: false,
  },
  {
    title: "Autonomous Remediation PRs",
    body: "Generates governed AI pull requests directly inside GitHub — creating rollback PRs, patching configuration errors, and proposing safe production fixes with full operational reasoning and linked evidence.",
    open: false,
  },
  {
    title: "AI Operational Reviews",
    body: "Evaluates pull requests for operational risk — not static code quality. Surfaces scaling vulnerabilities, infrastructure sensitivity, deployment hazards, and resilience regressions before merge.",
    open: false,
  },
  {
    title: "Blast Radius Intelligence",
    body: "Before any action, Scrubbe maps the projected blast radius: impacted services, dependency chains, rollback complexity, and recovery probability — ensuring every remediation candidate is fully risk-assessed.",
    open: false,
  },
];

function PlatformSection() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section className="px-6 md:px-16 py-24" style={{ background: MINT }}>
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-16 items-start">
        {/* Left */}
        <div className="md:sticky md:top-24">
          <h2 className="font-serif text-[34px] sm:text-[42px] md:text-[48px] leading-tight text-zinc-900 mb-8">
            GitHub is more than <em style={{ color: G }}>source control</em>
          </h2>
          <p className="font-serif italic text-zinc-700 text-[15px] leading-relaxed mb-6">
            Scrubbe transforms GitHub into a live operational reasoning layer
            for your engineering organisation — continuously mapping
            repositories, services, deployments, ownership, dependencies, and
            runtime behaviour against your production environment.
          </p>
          <p className="text-zinc-600 text-[14px] leading-relaxed mb-4">
            The platform understands not just what changed, but what broke, why
            it broke, who is affected, and how to safely remediate — under the
            governance controls your organisation requires. This is not a code
            assistant. It is an operational intelligence system.
          </p>
          <p className="text-zinc-600 text-[14px] leading-relaxed">
            Unlike observability tools that surface signals, or AI assistants
            that suggest edits, Scrubbe correlates across the full engineering
            stack: code, infrastructure definitions, deployment pipelines,
            runtime metrics, logs, traces, and historical incident patterns —
            producing reasoned, evidence-backed conclusions that engineering
            leadership can act on.
          </p>
        </div>

        {/* Right — accordion */}
        <div>
          {capabilities.map((c, i) => (
            <div key={i} className="border-b border-zinc-200 last:border-0">
              <button
                onClick={() => setOpenIdx(i === openIdx ? -1 : i)}
                className="w-full text-left py-5 flex items-start justify-between gap-4"
              >
                <div>
                  <p
                    className="text-[10px] font-mono tracking-widest mb-1.5"
                    style={{ color: G }}
                  >
                    Capability
                  </p>
                  <p
                    className={`text-[15px] font-bold transition-colors ${
                      openIdx === i ? "text-zinc-900" : "text-zinc-700"
                    }`}
                  >
                    {c.title}
                  </p>
                </div>
                <span className="text-zinc-400 mt-1 shrink-0 text-lg">
                  {openIdx === i ? "−" : "+"}
                </span>
              </button>
              {openIdx === i && (
                <div
                  className="pb-6 text-[13px] sm:text-[14px] text-zinc-600 leading-relaxed pr-4 border-l-2 pl-4 mb-1"
                  style={{ borderColor: G }}
                >
                  {c.body}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 4. Governance — dark section
// ─────────────────────────────────────────────────────────────────
function GovernanceSection() {
  return (
    <section className="px-6 md:px-16 py-24">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-16 items-start">
        {/* Left sticky */}
        <div className="md:sticky md:top-24">
          <h2 className="font-serif text-[36px] sm:text-[48px] leading-tight font-bold">
            Autonomous systems require{" "}
            <em style={{ color: G }}>operational governance</em>
          </h2>
        </div>

        {/* Right */}
        <div>
          <p className="font-serif italic  text-[16px] leading-relaxed mb-8">
            Scrubbe was designed for governed engineering operations from the
            outset. Autonomy without governance is liability. Every AI-generated
            action is evaluated against policies before execution.
          </p>
          <hr className="border-white/10 mb-8" />
          <p className="  text-[14px] leading-relaxed mb-10">
            The platform enforces approval workflows, environment restrictions,
            ownership rules, execution permissions, and safety controls at every
            layer. Engineering leadership retains full visibility and control —
            with the ability to define exactly what AI systems can and cannot
            do, at the level of individual services, environments, and incident
            severities.
          </p>

          <blockquote
            className="border-l-2 pl-6 mb-10"
            style={{ borderColor: G }}
          >
            <p className="font-serif italic   text-[15px] leading-relaxed mb-4">
              "Scrubbe answers the questions that matter to engineering
              leadership: should this change happen, is it safe, who approved
              it, and what if it goes wrong?"
            </p>
            <p
              className="text-[10px] font-mono tracking-widest"
              style={{ color: G }}
            >
              Scrubbe — Governance Architecture
            </p>
          </blockquote>

          <p className="  text-[14px] leading-relaxed">
            No blind autonomous execution. Before proposing or executing any
            change, Scrubbe runs tests, replays traffic, simulates failures,
            validates configurations, performs static analysis, and executes
            security checks. The result is a remediation proposal with a
            verifiable evidence chain — not a recommendation based on pattern
            matching alone.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 5. Three governance cards
// ─────────────────────────────────────────────────────────────────
const govCards = [
  {
    layer: "Control Layer",
    title: "Policy-Based Controls",
    body: "Define precisely what AI systems can and cannot do across environments, services, and incident severities. Policies are version-controlled and auditable.",
    items: [
      "Require approval for all production changes",
      "Prevent autonomous authentication modifications",
      "Restrict remediation to approved service owners",
      "Allow auto-rollback only for Sev-1 incidents",
      "Block deployments violating operational policy",
    ],
  },
  {
    layer: "Audit Layer",
    title: "Full Auditability",
    body: "Every action is tracked with a complete operational chain. Compliance teams, security teams, and engineering leadership can inspect any decision at any time.",
    items: [
      "Reasoning and evidence trail per action",
      "Generated diffs with confidence levels",
      "Policy evaluation results",
      "Execution approvals and ownership records",
      "Post-remediation deployment outcomes",
    ],
  },
  {
    layer: "Verification Layer",
    title: "Sandboxed Verification",
    body: "Every proposed change is validated before it is surfaced to engineers or executed. Scrubbe does not speculate — it verifies, then proposes.",
    items: [
      "Test execution and traffic replay",
      "Failure simulation",
      "Configuration validation",
      "Static analysis and security checks",
      "Pre-execution blast radius confirmation",
    ],
  },
];

function GovernanceCards() {
  return (
    <section className="px-6 md:px-16 py-20">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {govCards.map((c, i) => (
          <div
            key={i}
            className="p-8 flex flex-col gap-5"
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
            <ul className="flex flex-col gap-3 mt-1">
              {c.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[13px] text-zinc-700"
                >
                  <span className="text-zinc-400 shrink-0 mt-0.5">→</span>
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
// 6. "Built for the moments that matter"
// ─────────────────────────────────────────────────────────────────
const moments = [
  {
    num: "01",
    cat: "Incident Response",
    title: "Production Incident Response",
    body: "Automatically investigate outages and generate governed remediation workflows. Reduce mean time to resolution without requiring manual correlation of signals across disconnected systems.",
    flow: [
      "Detection → Investigation",
      "Root cause → Remediation PR",
      "Execution → Verification",
    ],
  },
  {
    num: "02",
    cat: "Risk Analysis",
    title: "Pre-Deployment Risk Analysis",
    body: "Understand the operational risk profile of a change before it reaches production. Blast radius, rollback complexity, infrastructure sensitivity, and retry amplification risk are surfaced at review time — not at 3am.",
    flow: [
      "PR submitted → AI review",
      "Risk scoring → Owner notification",
      "Deployment gate → Decision",
    ],
  },
  {
    num: "03",
    cat: "Reliability Reviews",
    title: "AI Reliability Reviews",
    body: "Catch scaling, retry, infrastructure, and resilience risks during pull request review — with operational context that goes beyond what any static analyser or human reviewer can reasonably maintain across a large engineering organisation.",
    flow: [
      "Code change → Operational scan",
      "Risk signals → Review comment",
      "Evidence chain → Audit record",
    ],
  },
  {
    num: "04",
    cat: "Autonomous Rollbacks",
    title: "Policy-Governed Rollbacks",
    body: "Safely rollback faulty deployments using policy-governed automation. Every rollback is reasoned, sandboxed, and fully audited — providing engineering leadership with a complete record of what was done, why, and under whose authority.",
    flow: [
      "Failure detection → Policy check",
      "Rollback generation → Verification",
      "Execution → Audit record",
    ],
  },
  {
    num: "05",
    cat: "Knowledge Retention",
    title: "Engineering Knowledge Retention",
    body: "Preserve operational history and historical incident intelligence across teams and engineering tenure cycles. Reduce repeated failures from the same root causes as institutional knowledge compounds over time.",
    flow: [
      "Incident resolved → Memory graph",
      "Pattern library → Future signal",
      "Historical context → Faster RCA",
    ],
  },
];

function MomentsSection() {
  return (
    <section className="px-6 md:px-16 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Section label */}
        <div className="flex items-start gap-6 mb-14">
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-px bg-white/20 mb-1" />
            <span className="text-[11px] font-mono ">04</span>
            <span className="text-[10px] font-mono  mt-1 leading-tight text-center">
              Enterprise
              <br />
              Use Cases
            </span>
          </div>
          <h2 className="font-serif text-[36px] sm:text-[48px] leading-tight">
            Built for the moments
            <br />
            <em style={{ color: G }}>that matter</em>
          </h2>
        </div>

        <div
          className="divide-y"
          style={{ borderColor: "rgba(255,255,255,.07)" }}
        >
          {moments.map((m) => (
            <div
              key={m.num}
              className="grid grid-cols-1 sm:grid-cols-[180px_1fr_190px] gap-4 sm:gap-6 py-10"
            >
              <div>
                <p className="text-[11px] font-mono  ">
                  {m.num} / {m.cat}
                </p>
              </div>
              <div>
                <h3 className="font-serif text-[17px]  mb-3">{m.title}</h3>
                <p className="text-[13px]  leading-relaxed">{m.body}</p>
              </div>
              <div className="flex flex-col gap-1.5 sm:text-right">
                {m.flow.map((f) => (
                  <p key={f} className="text-[11px] font-mono  ">
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
// 7. Why Scrubbe — comparison
// ─────────────────────────────────────────────────────────────────
const others = [
  "Code suggestions and autocomplete",
  "Merge request summaries",
  "Repository chatbot interactions",
  "No production system awareness",
  "No governance or approval layer",
  "No audit trail for AI decisions",
];
const scrubbeItems = [
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
        <h2 className="font-serif font-bold text-white text-[38px] sm:text-[52px] leading-tight mb-14">
          Not a coding assistant.
          <br />
          <em style={{ color: G }}>An operations platform.</em>
        </h2>

        <hr className="border-white/10 mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-16">
          {/* Left */}
          <div className="md:border-r border-white/10 md:pr-12">
            <p className="text-[11px] font-mono tracking-widest  mb-8">
              Other AI tools stop at
            </p>
            <div className="divide-y divide-white/08">
              {others.map((item) => (
                <div key={item} className="flex items-center gap-3 py-4">
                  <span className="text-red-500 font-bold shrink-0 text-sm">
                    ✕
                  </span>
                  <span className="text-[14px] text-white/45">{item}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Right */}
          <div className="md:pl-12 mt-10 md:mt-0">
            <p className="text-[11px] font-mono tracking-widest  mb-8">
              Scrubbe operates at
            </p>
            <div className="divide-y divide-white/08">
              {scrubbeItems.map((item) => (
                <div key={item} className="flex items-center gap-3 py-4">
                  <span
                    className="font-bold shrink-0 text-sm"
                    style={{ color: G }}
                  >
                    ✓
                  </span>
                  <span className="text-[14px] text-white/65">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-white/10 mb-12" />

        {/* Quote + para */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <blockquote>
            <p className="font-serif italic text-white/45 text-[17px] leading-relaxed">
              "Scrubbe operates at the engineering operations layer — reasoning
              across code, production systems, incidents, deployments,
              observability, infrastructure, governance, and remediation
              execution."
            </p>
          </blockquote>
          <p className="text-[14px]  leading-relaxed">
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
// 8. Workflow — "From incident to governed remediation"
// ─────────────────────────────────────────────────────────────────
const steps = [
  {
    num: "01",
    title: "Production Incident Detected",
    body: "Scrubbe monitors production signals in real time. An investigation is triggered the moment anomalous behaviour crosses a defined threshold — elevated latency, error spikes, failed deployments, or service degradation — without waiting for an on-call engineer to notice.",
    tags: [
      "Elevated latency",
      "Error spikes",
      "Failed deployments",
      "Service degradation",
      "Anomalous behaviour",
    ],
  },
  {
    num: "02",
    title: "AI Investigation Begins",
    body: "Agents automatically correlate deployments, inspect recent commits, analyse pull requests, trace dependency changes, evaluate logs and metrics, and identify suspicious operational patterns — working across the full engineering graph simultaneously, not sequentially.",
    tags: [
      "Commit inspection",
      "PR analysis",
      "Dependency tracing",
      "Log & metric evaluation",
    ],
  },
  {
    num: "03",
    title: "Root Cause Identified",
    body: "Scrubbe produces a structured root cause report: probable causes with confidence scoring, blast radius analysis, rollback recommendations, and ranked mitigation options — each backed by specific evidence from the investigation. Conclusions are not guesses.",
    tags: [
      "Confidence scores",
      "Blast radius",
      "Rollback paths",
      "Mitigation options",
    ],
  },
  {
    num: "04",
    title: "Remediation PR Generated",
    body: "The platform opens a governed pull request with generated fixes, rollback logic, operational reasoning, linked evidence, validation results, and policy compliance checks. Engineers receive a complete decision package — not a code suggestion with no context.",
    tags: [
      "AI-authored PR",
      "Linked evidence",
      "Policy evaluation",
      "Verification results",
    ],
  },
  {
    num: "05",
    title: "Approval or Autonomous Execution",
    body: "Policy configuration determines execution mode. High-risk or sensitive environments route through engineer approval workflows. Low-risk, policy-permitted remediations — such as rolling back a non-critical service on a Sev-1 incident — may execute autonomously within defined safety bounds.",
    tags: [
      "Approval workflow",
      "Autonomous execution",
      "Policy gate enforcement",
    ],
  },
  {
    num: "06",
    title: "Continuous Verification",
    body: "Scrubbe monitors recovery, deployment health, regression signals, and post-remediation stability. Incident learnings are recorded into the engineering memory graph — reducing the probability of recurrence and improving future investigations.",
    tags: [
      "Recovery monitoring",
      "Regression detection",
      "Memory graph update",
    ],
  },
];

function WorkflowSection() {
  return (
    <section className="px-6 md:px-16 py-24" style={{ background: MINT }}>
      <div className="mx-auto max-w-4xl">
        <h2 className="font-serif font-bold text-zinc-900 text-[32px] sm:text-[42px] leading-tight mb-4">
          From <em style={{ color: G }}>incident</em> to
          <br />
          governed remediation
        </h2>
        <p className="text-[14px] text-zinc-600 leading-relaxed max-w-xl mb-16">
          Scrubbe operates across six governed phases — from initial detection
          through continuous post-remediation verification. Each phase is
          observable, auditable, and policy-bounded. Engineering teams can
          engage at any point, and policy determines which phases execute
          autonomously.
        </p>

        <div className="flex flex-col">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="grid grid-cols-[72px_1fr] gap-6 pb-14 relative"
            >
              {i < steps.length - 1 && (
                <div
                  className="absolute left-[35px] top-12 bottom-0 w-px"
                  style={{ background: "rgba(26,107,60,.18)" }}
                />
              )}
              <div className="flex flex-col items-center pt-0.5">
                <span
                  className="font-serif font-bold text-[32px] leading-none"
                  style={{ color: "rgba(26,107,60,.22)" }}
                >
                  {s.num}
                </span>
              </div>
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
                        borderColor: "rgba(26,107,60,.25)",
                        background: "rgba(26,107,60,.04)",
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
// Page
// ─────────────────────────────────────────────────────────────────
export default function ScrubbeGitHubPage() {
  return (
    <main>
      <LogoHeroSection />
      <PlatformSection />
      <GovernanceSection />
      <GovernanceCards />
      <WorkflowSection />
      <MomentsSection />
      <WhyScrubbeSection />
      <ConnectorsSection />
      <HeroSection />
    </main>
  );
}
