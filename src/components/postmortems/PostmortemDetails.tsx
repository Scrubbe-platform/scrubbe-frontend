"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  FileText,
  Mail,
  Pencil,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Clock,
  Search,
  RefreshCw,
  FileEdit,
  Users,
  ShieldCheck,
  Plus,
  Check,
  X,
} from "lucide-react";

// ── Dummy data ────────────────────────────────────────────────────
const PM = {
  incidentId: "SI-7939763",
  generatedAt: "May 14, 2026 — 14:32 UTC",
  approvedBy: "Jane Smith",
  approvedRole: "Incident Commander",
  version: "v1.2",
  tags: ["Resolved", "Severity 1", "Production", "Approved"],
  executiveSummary: {
    headline:
      "Deployment regression caused 14-minute authentication outage affecting 2,300 customers — contained without SLA breach.",
    body: "On May 14, 2026, a deployment to the authentication service introduced a configuration regression that caused authentication failures across customer-facing services. Scrubbe identified the deployment as the most probable root cause with **96% confidence**, proposed rollback, verified expected blast radius, and executed approved remediation through governed agentic workflow. Customer-facing services recovered within **14 minutes**. No SLA breach occurred and revenue impact was assessed as low.",
    bullets: [
      { color: "bg-red-500", label: "2,300 affected users" },
      { color: "bg-orange-400", label: "Medium customer impact" },
      { color: "bg-emerald-500", label: "No SLA breach" },
      { color: "bg-blue-500", label: "96% root cause confidence" },
    ],
  },
  aiSummary: {
    duration: "7",
    signals: "328",
    confidence: "96%",
    cause: "Deployment Regression",
  },
  // Incident Overview tab
  incidentOverview: {
    incidentId: "SI-7939763",
    severity: "P1 — Critical",
    status: "Resolved",
    environment: "Production",
    workspace: "Acme Corp",
    duration: "14 Minutes",
    affectedUsers: "2,300",
    customerImpact: "Medium",
  },
  businessImpact: {
    affectedServices: [
      "Checkout API",
      "Customer Portal",
      "Authentication Service",
    ],
    affectedUsers: "2,300",
    revenueImpact: "Low",
    revenueEst: "Est. ~$1,200",
    slaImpact: "No Breach",
    slaUptime: "99.98% uptime",
  },
  // Timeline tab
  timeline: [
    {
      time: "09:41",
      color: "bg-red-500",
      title: "Alert Triggered",
      desc: "Automated monitoring detected error rate anomaly on auth-service",
    },
    {
      time: "09:43",
      color: "bg-emerald-500",
      title: "Incident Created",
      desc: "SI-7939763 opened; on-call Platform Team notified via PagerDuty",
    },
    {
      time: "09:45",
      color: "bg-yellow-400",
      title: "Investigation Started",
      desc: "Ezra begins signal correlation across 24 services, 328 signals",
    },
    {
      time: "09:48",
      color: "bg-orange-500",
      title: "Deployment Identified",
      desc: "Root cause pinpointed — deployment a4f8e3b flagged at 96% confidence",
      highlight: true,
    },
    {
      time: "09:53",
      color: "bg-emerald-500",
      title: "Rollback Approved",
      desc: "EAL-3 governance gate passed; Jane Smith approved remediation",
      highlight: true,
    },
    {
      time: "09:55",
      color: "bg-orange-500",
      title: "Rollback Executed",
      desc: "Governed execution: v2.6.4 → v2.6.3, blast radius verified",
      highlight: true,
    },
    {
      time: "10:01",
      color: "bg-emerald-500",
      title: "Service Stabilized",
      desc: "Health checks passing, error rate returning to baseline",
    },
    {
      time: "10:15",
      color: "bg-red-500",
      title: "Incident Resolved",
      desc: "All services confirmed healthy; postmortem initiated",
    },
  ],
  // Root cause analysis tab
  rootCause: {
    cause:
      "Authentication configuration regression introduced during deployment. The AUTH_CONFIG environment variable mapping was removed in a config refactor without validation gates.",
    trigger:
      "Deployment pipeline execution — auth-service v2.6.4 pushed at 09:38 UTC.",
    factors: [
      "Missing validation checks on configuration values in the deployment pipeline",
      "Insufficient deployment safeguards for authentication-critical services",
      "Absence of canary verification step before full production rollout",
    ],
  },
  // Lessons learned tab
  lessonsLearned: {
    headline:
      "Three systemic gaps enabled this incident — each preventable with targeted process controls.",
    intro:
      "The May 14 authentication outage was not the result of a single failure, but of three compounding process gaps that collectively allowed an unvalidated configuration change to reach production and remain undetected for nearly ten minutes. Addressing each gap independently would reduce the probability of recurrence; addressing them together eliminates the failure pathway entirely.",
    lessons: [
      {
        number: "01",
        title: "Pre-deployment authentication smoke testing is absent",
        body: "The pipeline lacked any automated test that validates authentication service availability before a production deployment is considered successful. Had a basic smoke test been in place, the configuration regression would have surfaced at 09:39 — the moment of deployment — rather than at 09:41 when customer traffic triggered the first error. The two-minute difference is operationally significant: it represents the difference between a silent deployment rollback and a customer-visible outage.",
        action:
          "Implement authentication endpoint smoke tests as a required post-deployment gate in the auth-service pipeline. Tests must pass before the deployment is marked successful and traffic is shifted.",
      },
      {
        number: "02",
        title:
          "Configuration schema changes require mandatory validation gates",
        body: "The removal of the AUTH_CONFIG environment variable was introduced as part of a broader config refactor without any schema diff validation. Enterprise deployment pipelines for authentication-critical services should treat configuration changes with the same discipline applied to code changes: reviewed, validated against a canonical schema, and subject to automated regression testing before promotion. The current pipeline treats configuration as ambient context rather than a first-class deployment artifact.",
        action:
          "Introduce a configuration schema validation step that diffs incoming environment variables against a versioned baseline. Any removal of a required variable must require explicit sign-off. Integrate with Scrubbe playbook matching to auto-trigger investigation on config drift detection.",
      },
    ],
    comments: [
      {
        initials: "SR",
        name: "Siona Reeves",
        time: "2 days ago",
        text: "Agreed. We should also ensure these smoke tests run in the staging environment using the exact same container image to catch environment-specific issues earlier.",
      },
      {
        initials: "TK",
        name: "Tobias Kramer",
        time: "May 14, 2026 10:20 UTC",
        text: "The smoke test should specifically target the /health/ready endpoint which includes the DB connection check.",
      },
    ],
  },
  // Signal Correlation Graph tab
  signalGraph: {
    nodes: [
      {
        icon: "github",
        label: "GitHub Commit",
        tag: "a4f8e3b",
        highlight: true,
      },
      { icon: "ci", label: "CI Pipeline", tag: "run #4821", highlight: false },
      {
        icon: "deploy",
        label: "Deployment",
        tag: "ROOT CAUSE",
        highlight: true,
        rootCause: true,
      },
      { icon: "pod", label: "Pod Failure", tag: "6 pods", highlight: false },
      {
        icon: "metric",
        label: "Metric Spike",
        tag: "34.7% err",
        highlight: false,
      },
      {
        icon: "customer",
        label: "Customer Errors",
        tag: "2,300 users",
        highlight: false,
      },
      {
        icon: "incident",
        label: "Incident Declared",
        tag: "09:43",
        highlight: false,
        incident: true,
      },
    ],
    detail: {
      title: "GitHub Commit — a4f8e3b",
      tabs: ["Commit Details", "Diff Preview"],
      code: `commit a4f8e3b
Author: engineer@acme.com
Date: 2026-05-14 09:12:41 UTC
Message: refactor: consolidate config loading

PR: #2814 — Config module consolidation
Changed: src/config/loader.js (+42 -61)`,
      diff: [
        { type: "remove", text: "- AUTH_CONFIG: process.env.AUTH_CONFIG," },
        { type: "add", text: "+ // consolidated into UNIFIED_CONFIG block" },
      ],
    },
  },
  // Investigation Record tab
  investigationRecord: {
    stats: [
      { value: "328", label: "SIGNALS REVIEWED" },
      { value: "24", label: "SERVICES ANALYZED" },
      { value: "19", label: "HYPOTHESES" },
      { value: "17", label: "REJECTED CAUSES" },
      { value: "96%", label: "CONFIDENCE", color: "text-emerald-500" },
    ],
    tabs: {
      Logs: {
        lines: [
          {
            ts: "2026-05-14 09:39:22",
            level: "INFO",
            text: "deploy-agent: auth-service v2.6.4 deploy started",
          },
          {
            ts: "2026-05-14 09:39:54",
            level: "INFO",
            text: "deploy-agent: auth-service v2.6.4 deploy complete",
          },
          {
            ts: "2026-05-14 09:41:07",
            level: "ERROR",
            text: "auth-service: AUTH_CONFIG env var missing — null pointer exception",
          },
          {
            ts: "2026-05-14 09:41:07",
            level: "ERROR",
            text: "auth-service: connection refused on /authenticate endpoint",
          },
          {
            ts: "2026-05-14 09:41:08",
            level: "WARN",
            text: "checkout-api: upstream auth dependency unhealthy",
          },
          {
            ts: "2026-05-14 09:41:09",
            level: "ERROR",
            text: "customer-portal: 503 service unavailable — auth unreachable",
          },
          {
            ts: "2026-05-14 09:55:12",
            level: "INFO",
            text: "deploy-agent: auth-service v2.6.3 rollback complete",
          },
          {
            ts: "2026-05-14 09:57:03",
            level: "INFO",
            text: "auth-service: health check PASS — all endpoints responding",
          },
        ],
      },
      Metrics: {
        metrics: [
          {
            label: "ERROR RATE PEAK",
            value: "34.7%",
            baseline: "Baseline: 0.2%",
            color: "text-red-500",
          },
          {
            label: "P99 LATENCY",
            value: "12.4s",
            baseline: "Baseline: 180ms",
            color: "text-orange-500",
          },
          {
            label: "5XX REQUESTS",
            value: "18,420",
            baseline: "Over 14 min window",
            color: "text-zinc-900",
          },
        ],
        note: "CPU utilization remained within normal bounds (42–56%), ruling out resource exhaustion as a contributing factor. Memory and disk I/O were unaffected throughout the incident window.",
      },
      Deployments: {
        code: `Deployment: auth-service v2.6.4
Commit: a4f8e3b — "refactor: consolidate config loading"
Author: engineer@acme.com
Pushed: 2026-05-14 09:38:44 UTC
Pipeline: run #4821 — PASSED
Change: AUTH_CONFIG env var removed from config schema (line 47)
Previous: auth-service v2.6.3 — stable for 18 days`,
        highlights: ["PASSED"],
      },
      "Infrastructure Events": {
        text: "No infrastructure events recorded in the 30-minute window surrounding the incident. All nodes in the auth-service cluster reported healthy CPU, memory, and disk utilisation. No node failures, evictions, or rescheduling events detected. The failure was isolated to the application layer — specifically the configuration regression introduced at deployment time.",
      },
      "Cloud Events": {
        text: "No AWS service health events in eu-west-1 or us-east-1 during the incident window. EC2 status checks, RDS health, and ElastiCache availability all remained green throughout. No AZ degradation or network events flagged by the cloud provider. Scrubbe's cloud event agent reviewed 142 cloud signals and found no correlation with the incident root cause.",
      },
      "Pipeline Events": {
        text: "Pipeline run #4821 completed successfully with all tests passing. No pipeline failures detected during the incident window. The configuration change causing the incident was introduced in this pipeline run but was not detected by existing automated tests.",
      },
    },
  },
  // Remediation tab
  remediation: {
    actions: [
      {
        icon: "rollback",
        title: "Rollback Executed",
        detail: "v2.6.4 → v2.6.3",
        status: "Completed",
      },
      {
        icon: "pods",
        title: "Pods Restarted",
        detail: "All auth-service pods",
        status: "Completed",
      },
      {
        icon: "health",
        title: "Health Checks",
        detail: "All endpoints verified",
        status: "Passed",
      },
    ],
    decisionLog: [
      {
        time: "09:48",
        title: "Rollback Proposed by Ezra",
        sub: "96% confidence · Blast radius: auth-service only",
        action: "View evidence",
        actionStyle: "",
      },
      {
        time: "09:53",
        title: "Rollback Approved",
        sub: "Jane Smith · EAL-3 governance gate cleared",
        action: "View approval",
        actionStyle: "",
      },
      {
        time: "09:55",
        title: "Rollback Executed",
        sub: "Governed execution · 3 automated actions logged",
        action: "View audit log",
        actionStyle: "",
      },
    ],
  },
  // Corrective Actions tab
  correctiveActions: [
    {
      action: "Add authentication smoke tests to CI pipeline",
      owner: "Platform",
      due: "May 28, 2026",
      priority: "High",
      status: "Open",
    },
    {
      action: "Add canary validation gate for auth-critical deployments",
      owner: "SRE",
      due: "Jun 4, 2026",
      priority: "High",
      status: "Open",
    },
    {
      action: "Improve rollback policy documentation and runbooks",
      owner: "Ops",
      due: "May 21, 2026",
      priority: "Med",
      status: "Closed",
    },
  ],
  // Collaboration tab
  collaboration: {
    commander: {
      initials: "JS",
      name: "Jane Smith",
      dept: "Platform Engineering",
    },
    responders: ["Platform Team", "Backend Team", "SRE Team"],
    warRoom: { channels: ["Teams Channel", "Slack Channel"] },
  },
  // Playbook Updates tab
  playbookUpdates: {
    name: "Authentication Failure Investigation",
    version: "Version 12",
    updated: "Knowledge Base Updated · May 14, 2026",
    protection: "40%",
    kbStatus: "Synced",
    kbNote: "All agents updated",
  },
  // Governance & Audit tab
  governance: {
    policyEvaluations: 14,
    approvalsRequired: 1,
    approvalsGranted: 1,
    automatedActions: 3,
    manualActions: 1,
  },
  // Attachments tab
  attachments: [
    { icon: "file", name: "Logs", size: "2.4 MB" },
    { icon: "bar", name: "Metrics", size: "1.1 MB" },
    { icon: "graph", name: "Graphs", size: "840 KB" },
    { icon: "copy", name: "Deployment Records", size: "320 KB" },
    { icon: "trend", name: "Pipeline Runs", size: "560 KB" },
    { icon: "cal", name: "Meeting Notes", size: "48 KB" },
    { icon: "chat", name: "War Room Transcript", size: "112 KB" },
  ],
};

// ── Tab list ──────────────────────────────────────────────────────
const TABS = [
  "Incident Overview",
  "Timeline",
  "Root cause analysis",
  "Lessons learned",
  "Signal Correlation graph",
  "Investigation Record",
  "Remediation",
  "Corrective Actions",
  "Collaboration",
  "Playbook Updates",
  "Governance and Audit",
  "Attachments",
] as const;
type TabId = (typeof TABS)[number];

// ── Reusable section wrapper ──────────────────────────────────────
const Section = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-3 text-[15px] font-bold text-zinc-900 dark:text-zinc-100">
          {icon} {title}
        </div>
        {open ? (
          <ChevronUp size={16} className="text-zinc-400" />
        ) : (
          <ChevronDown size={16} className="text-zinc-400" />
        )}
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
};

const FieldGrid = ({ fields }: { fields: [string, React.ReactNode][] }) => (
  <div className="grid grid-cols-4 gap-0 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
    {fields.map(([label, value], i) => (
      <div
        key={i}
        className={`px-4 py-4 border-r border-b border-zinc-100 dark:border-zinc-800 last:border-r-0 ${i >= fields.length - (fields.length % 4 || 4) ? "border-b-0" : ""}`}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
          {label}
        </p>
        <div className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
          {value}
        </div>
      </div>
    ))}
  </div>
);

// ── Tab content components ────────────────────────────────────────

const TabIncidentOverview = () => (
  <>
    <Section icon={<FileText size={16} />} title="Incident Overview">
      <FieldGrid
        fields={[
          [
            "Incident ID",
            <span className="font-bold">{PM.incidentOverview.incidentId}</span>,
          ],
          [
            "Severity",
            <span className="text-orange-500 font-bold">
              {PM.incidentOverview.severity}
            </span>,
          ],
          [
            "Status",
            <span className="text-emerald-500 font-bold">
              {PM.incidentOverview.status}
            </span>,
          ],
          ["Environment", PM.incidentOverview.environment],
          ["Workspace", PM.incidentOverview.workspace],
          ["Duration", PM.incidentOverview.duration],
          ["Affected Users", PM.incidentOverview.affectedUsers],
          [
            "Customer Impact",
            <span className="text-amber-500 font-bold">
              {PM.incidentOverview.customerImpact}
            </span>,
          ],
        ]}
      />
    </Section>

    <Section icon={<FileText size={16} />} title="Business Impact">
      <div className="grid grid-cols-4 gap-4">
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
            Affected Services
          </p>
          <ul className="space-y-1">
            {PM.businessImpact.affectedServices.map((s) => (
              <li
                key={s}
                className="flex items-center gap-1.5 text-[13px] text-zinc-700 dark:text-zinc-300"
              >
                <span className="w-1 h-1 rounded-full bg-zinc-400 shrink-0" />{" "}
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
            Affected Users
          </p>
          <p className="text-[32px] font-black text-zinc-900 dark:text-zinc-100">
            {PM.businessImpact.affectedUsers}
          </p>
        </div>
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
            Revenue Impact
          </p>
          <p className="text-[18px] font-bold text-zinc-900 dark:text-zinc-100">
            {PM.businessImpact.revenueImpact}
          </p>
          <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
            {PM.businessImpact.revenueEst}
          </p>
        </div>
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
            SLA Impact
          </p>
          <p className="text-[18px] font-bold text-emerald-500">
            {PM.businessImpact.slaImpact}
          </p>
          <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
            › {PM.businessImpact.slaUptime}
          </p>
        </div>
      </div>
    </Section>
  </>
);

const TabTimeline = () => (
  <Section icon={<Clock size={16} />} title="Timeline">
    <div className="space-y-0">
      {PM.timeline.map((item, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full ${item.color} mt-1 shrink-0`}
            />
            {i < PM.timeline.length - 1 && (
              <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-700 mt-1" />
            )}
          </div>
          <div className="pb-5 flex-1 min-w-0">
            <p className="text-[12px] font-mono text-zinc-400 dark:text-zinc-500 mb-0.5">
              {item.time}
            </p>
            <p
              className={`text-[14px] font-bold mb-0.5 ${item.highlight ? "text-orange-500 dark:text-orange-400" : "text-zinc-900 dark:text-zinc-100"}`}
            >
              {item.title}
            </p>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const TabRootCause = () => (
  <Section icon={<Search size={16} />} title="Root Cause Analysis">
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
          Root Cause
        </p>
        <p className="text-[14px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {PM.rootCause.cause.split("AUTH_CONFIG").map((part, i) =>
            i === 0 ? (
              part
            ) : (
              <React.Fragment key={i}>
                <code className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded px-1 py-0.5 text-[13px] font-mono">
                  AUTH_CONFIG
                </code>
                {part}
              </React.Fragment>
            ),
          )}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
          Trigger
        </p>
        <p className="text-[14px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {PM.rootCause.trigger}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
          Contributing Factors
        </p>
        <div className="space-y-2">
          {PM.rootCause.factors.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-600 mt-0.5 shrink-0" />
              <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
                {f}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Section>
);

const TabLessonsLearned = () => {
  const [comment, setComment] = useState("");
  return (
    <Section icon={<FileEdit size={16} />} title="Lessons Learned">
      <h3 className="text-[17px] font-bold text-zinc-900 dark:text-zinc-100 mb-3">
        {PM.lessonsLearned.headline}
      </h3>
      <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
        {PM.lessonsLearned.intro}
      </p>
      <div className="space-y-8 mb-8">
        {PM.lessonsLearned.lessons.map((l) => (
          <div key={l.number}>
            <div className="flex items-start gap-4 mb-3">
              <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mt-1 shrink-0 w-5">
                {l.number}
              </span>
              <h4 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">
                {l.title}
              </h4>
            </div>
            <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed ml-9 mb-4">
              {l.body}
            </p>
            <div className="ml-9 border-l-4 border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 rounded-r-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
                Recommended Action
              </p>
              <p className="text-[13px] text-blue-700 dark:text-blue-300 leading-relaxed">
                {l.action}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Comments */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
          Comments
        </p>
        <div className="space-y-4 mb-4">
          {PM.lessonsLearned.comments.map((c, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[11px] font-bold text-zinc-600 dark:text-zinc-300 shrink-0">
                {c.initials}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                    {c.name}
                  </span>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {c.time}
                  </span>
                </div>
                <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {c.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
            <span className="text-zinc-400 text-xs">You</span>
          </div>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-[13px] text-zinc-700 dark:text-zinc-300 bg-transparent outline-none placeholder:text-zinc-400"
          />
          <button className="px-4 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Post
          </button>
        </div>
      </div>
    </Section>
  );
};

const TabSignalGraph = () => {
  const [activeNode, setActiveNode] = useState<string | null>("GitHub Commit");
  const [detailTab, setDetailTab] = useState("Commit Details");

  return (
    <Section
      icon={<span className="text-[16px]">⚡</span>}
      title={
        (
          <span>
            Signal Correlation Graph{" "}
            <span className="text-[12px] font-normal text-zinc-400 dark:text-zinc-500">
              — click a node to inspect signals
            </span>
          </span>
        ) as any
      }
    >
      <div className="space-y-0 mb-6">
        {PM.signalGraph.nodes.map((node, i) => (
          <React.Fragment key={node.label}>
            <button
              onClick={() =>
                setActiveNode((prev) =>
                  prev === node.label ? null : node.label,
                )
              }
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-colors ${
                node.rootCause
                  ? "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5"
                  : node.incident
                    ? "border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5"
                    : activeNode === node.label
                      ? "border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/60"
                      : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              }`}
            >
              <span
                className={`text-[14px] font-semibold ${node.incident ? "text-red-500 font-bold" : "text-zinc-800 dark:text-zinc-200"}`}
              >
                {node.label}
              </span>
              {node.rootCause ? (
                <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 rounded px-2 py-0.5 uppercase tracking-wider">
                  Root Cause
                </span>
              ) : (
                <span className="text-[12px] font-mono text-zinc-500 dark:text-zinc-400">
                  {node.tag}
                </span>
              )}
            </button>
            {i < PM.signalGraph.nodes.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-600" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {activeNode && (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Search size={13} className="text-zinc-400" />
              <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                {PM.signalGraph.detail.title}
              </span>
            </div>
            <button
              onClick={() => setActiveNode(null)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex border-b border-zinc-100 dark:border-zinc-800">
            {PM.signalGraph.detail.tabs.map((t) => (
              <button
                key={t}
                onClick={() => setDetailTab(t)}
                className={`px-4 py-2.5 text-[13px] font-medium transition-colors ${detailTab === t ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div
            style={{ background: "#0d1117" }}
            className="p-5 font-mono text-[12.5px] leading-6"
          >
            {detailTab === "Commit Details" ? (
              <pre className="text-gray-300 whitespace-pre-wrap">
                {PM.signalGraph.detail.code}
              </pre>
            ) : (
              <div>
                {PM.signalGraph.detail.diff.map((line, i) => (
                  <div
                    key={i}
                    className={`px-2 py-0.5 rounded ${line.type === "remove" ? "bg-red-900/40 text-red-400" : "bg-emerald-900/30 text-emerald-400"}`}
                  >
                    {line.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Section>
  );
};

const TabInvestigationRecord = () => {
  const [activeSubTab, setActiveSubTab] = useState<string>("Logs");
  const subTabs = [
    "Logs",
    "Metrics",
    "Deployments",
    "Infrastructure Events",
    "Cloud Events",
    "Pipeline Events",
  ];
  const rec = PM.investigationRecord;
  const tabData = rec.tabs[activeSubTab as keyof typeof rec.tabs];

  return (
    <Section icon={<span>✦</span>} title="Investigation Record">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {rec.stats.map((s) => (
          <div
            key={s.label}
            className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-center"
          >
            <p
              className={`text-[28px] font-black leading-none mb-1 ${s.color ?? "text-zinc-900 dark:text-zinc-100"}`}
            >
              {s.value}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {s.label}
            </p>
          </div>
        ))}
      </div>
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {subTabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveSubTab(t)}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors ${activeSubTab === t ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
        {activeSubTab === "Logs" && "lines" in tabData && (
          <div
            style={{ background: "#0d1117" }}
            className="p-5 font-mono text-[12.5px] leading-6 space-y-0.5"
          >
            {tabData.lines.map((line: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-gray-500 shrink-0">{line.ts}</span>
                <span
                  className={`font-bold shrink-0 w-12 ${line.level === "ERROR" ? "text-red-400" : line.level === "WARN" ? "text-yellow-400" : "text-blue-400"}`}
                >
                  {line.level}
                </span>
                <span
                  className={
                    line.level === "ERROR"
                      ? "text-red-300"
                      : line.level === "WARN"
                        ? "text-yellow-300"
                        : "text-gray-300"
                  }
                >
                  {line.text}
                </span>
              </div>
            ))}
          </div>
        )}
        {activeSubTab === "Metrics" && "metrics" in tabData && (
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {tabData.metrics.map((m: any) => (
                <div
                  key={m.label}
                  className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                    {m.label}
                  </p>
                  <p
                    className={`text-[28px] font-black leading-none mb-1 ${m.color}`}
                  >
                    {m.value}
                  </p>
                  <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                    {m.baseline}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-800/40 rounded-lg p-4">
              {tabData.note}
            </p>
          </div>
        )}
        {activeSubTab === "Deployments" && "code" in tabData && (
          <div
            style={{ background: "#0d1117" }}
            className="p-5 font-mono text-[12.5px] leading-6"
          >
            {tabData.code.split("\n").map((line: string, i: number) => {
              const isHighlighted = tabData.highlights?.some((h: string) =>
                line.includes(h),
              );
              const key = line.split(":")[0];
              const colorMap: Record<string, string> = {
                Deployment: "text-gray-200",
                Commit: "text-yellow-400",
                Author: "text-blue-400",
                Pushed: "text-blue-400",
                Pipeline: "text-blue-400",
                Change: "text-orange-400",
                Previous: "text-gray-400",
              };
              return (
                <div key={i} className="flex gap-2">
                  <span
                    className={`font-bold ${colorMap[key] ?? "text-gray-200"}`}
                  >
                    {key}:
                  </span>
                  <span
                    className={`${isHighlighted ? "text-emerald-400" : "text-gray-300"}`}
                  >
                    {line.split(":").slice(1).join(":")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {(activeSubTab === "Infrastructure Events" ||
          activeSubTab === "Cloud Events" ||
          activeSubTab === "Pipeline Events") &&
          "text" in tabData && (
            <div className="p-5">
              <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {tabData.text}
              </p>
            </div>
          )}
      </div>
    </Section>
  );
};

const TabRemediation = () => (
  <Section icon={<RefreshCw size={16} />} title="Remediation">
    <div className="grid grid-cols-3 gap-4 mb-6">
      {PM.remediation.actions.map((a) => (
        <div
          key={a.title}
          className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4"
        >
          <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {a.title}
          </p>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-2">
            {a.detail}
          </p>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Check size={12} /> {a.status}
          </div>
        </div>
      ))}
    </div>
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
        Decision Log
      </p>
      <div className="space-y-3">
        {PM.remediation.decisionLog.map((entry, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="text-[13px] font-mono font-bold text-zinc-500 dark:text-zinc-400 w-12 shrink-0">
              {entry.time}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                {entry.title}
              </p>
              <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                {entry.sub}
              </p>
            </div>
            <button className="shrink-0 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              {entry.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  </Section>
);

const TabCorrectiveActions = () => {
  const [actions, setActions] = useState(PM.correctiveActions);
  const [newAction, setNewAction] = useState("");

  return (
    <Section icon={<FileEdit size={16} />} title="Corrective Actions">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            {["Action", "Owner", "Due", "Priority", "Status", "Action"].map(
              (h) => (
                <th
                  key={h}
                  className="text-left px-0 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pr-4"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {actions.map((a, i) => (
            <tr key={i} className="py-2">
              <td className="py-3 pr-4 text-zinc-800 dark:text-zinc-200 font-medium">
                {a.action}
              </td>
              <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                {a.owner}
              </td>
              <td className="py-3 pr-4 text-zinc-400 dark:text-zinc-500">
                {a.due}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`font-bold ${a.priority === "High" ? "text-red-500" : "text-amber-500"}`}
                >
                  {a.priority}
                </span>
              </td>
              <td className="py-3 pr-4">
                {a.status === "Open" ? (
                  <span className="flex items-center gap-1 text-orange-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />{" "}
                    Open
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Check size={12} /> Closed
                  </span>
                )}
              </td>
              <td className="py-3">
                <button
                  onClick={() =>
                    setActions((prev) =>
                      prev.map((item, idx) =>
                        idx === i
                          ? {
                              ...item,
                              status:
                                item.status === "Open" ? "Closed" : "Open",
                            }
                          : item,
                      ),
                    )
                  }
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {a.status === "Open" ? "Mark done" : "Reopen"}
                </button>
              </td>
            </tr>
          ))}
          {/* New action row */}
          <tr>
            <td className="py-3 pr-4">
              <input
                type="text"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                placeholder="Describe the action..."
                className="w-full text-[13px] text-zinc-700 dark:text-zinc-300 bg-transparent outline-none border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
              />
            </td>
            <td className="py-3 pr-4">
              <input
                type="text"
                placeholder="Owner"
                className="text-[13px] text-zinc-700 dark:text-zinc-300 bg-transparent outline-none border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 w-24 focus:border-zinc-400 transition-colors"
              />
            </td>
            <td colSpan={2} />
            <td className="py-3 pr-4">
              <span className="flex items-center gap-1 text-orange-500">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Open
              </span>
            </td>
            <td className="py-3">
              <button className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Mark done
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button className="mt-3 flex items-center gap-1.5 text-[13px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
        <Plus size={14} /> Add corrective action
      </button>
    </Section>
  );
};

const TabCollaboration = () => (
  <Section icon={<Users size={16} />} title="Collaboration">
    <div className="grid grid-cols-3 gap-4">
      {/* Commander */}
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
          Incident Commander
        </p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-[13px] font-bold text-blue-600 dark:text-blue-400">
            {PM.collaboration.commander.initials}
          </div>
          <div>
            <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
              {PM.collaboration.commander.name}
            </p>
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
              {PM.collaboration.commander.dept}
            </p>
          </div>
        </div>
      </div>
      {/* Responders */}
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
          Responders
        </p>
        <div className="space-y-2">
          {PM.collaboration.responders.map((r) => (
            <div key={r} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
              <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
                {r}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* War Room */}
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
          War Room
        </p>
        <div className="space-y-2 mb-3">
          {PM.collaboration.warRoom.channels.map((c) => (
            <div key={c} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <span className="text-[9px]">💬</span>
              </div>
              <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
                {c}
              </span>
            </div>
          ))}
        </div>
        <button className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
          View transcript →
        </button>
      </div>
    </div>
  </Section>
);

const TabPlaybookUpdates = () => {
  const pb = PM.playbookUpdates;
  return (
    <Section icon={<FileText size={16} />} title="Playbook Updates">
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
          Playbook Updated
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[16px] font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {pb.name}
            </p>
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
              {pb.version} · {pb.updated}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-3 py-1.5">
              <Check size={12} /> Updated
            </span>
            <button className="px-4 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              View playbook
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
            Future Incidents Protected
          </p>
          <p className="text-[36px] font-black text-blue-600 dark:text-blue-400 leading-none mb-1">
            {pb.protection}
          </p>
          <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
            Estimated MTTR reduction
          </p>
        </div>
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
            Knowledge Base
          </p>
          <p className="text-[24px] font-black text-emerald-500 leading-none mb-1">
            {pb.kbStatus}
          </p>
          <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
            {pb.kbNote}
          </p>
        </div>
      </div>
    </Section>
  );
};

const TabGovernance = () => {
  const g = PM.governance;
  const items = [
    { value: g.policyEvaluations, label: "Policy Evaluations", color: "" },
    { value: g.approvalsRequired, label: "Approvals Required", color: "" },
    {
      value: g.approvalsGranted,
      label: "Approvals Granted",
      color: "text-emerald-500",
    },
    { value: g.automatedActions, label: "Automated Actions", color: "" },
    { value: g.manualActions, label: "Manual Actions", color: "" },
  ];
  return (
    <Section icon={<ShieldCheck size={16} />} title="Governance & Audit">
      <div className="grid grid-cols-5 gap-3 mb-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-center"
          >
            <p
              className={`text-[36px] font-black leading-none mb-2 ${item.color || "text-zinc-900 dark:text-zinc-100"}`}
            >
              {item.value}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {item.label}
            </p>
          </div>
        ))}
      </div>
      <button className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
        View full audit trail
      </button>
    </Section>
  );
};

const ATTACH_ICONS: Record<string, string> = {
  file: "📄",
  bar: "📊",
  graph: "📈",
  copy: "📋",
  trend: "📉",
  cal: "📅",
  chat: "💬",
};
const TabAttachments = () => (
  <Section icon={<Paperclip size={16} />} title="Attachments">
    <div className="grid grid-cols-4 gap-3">
      {PM.attachments.map((a) => (
        <div
          key={a.name}
          className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-3 text-lg">
            {ATTACH_ICONS[a.icon] ?? "📄"}
          </div>
          <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
            {a.name}
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {a.size}
          </p>
        </div>
      ))}
      <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 flex items-center justify-center cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors">
        <div className="text-center">
          <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Plus size={16} className="text-zinc-400" />
          </div>
          <p className="text-[13px] text-zinc-400 dark:text-zinc-500">
            Add Attachment
          </p>
        </div>
      </div>
    </div>
  </Section>
);

// ── Tag badge styles ──────────────────────────────────────────────
const TAG_STYLES: Record<string, string> = {
  Resolved:
    "text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
  "Severity 1":
    "text-red-600    bg-red-50    dark:bg-red-500/10    border-red-200    dark:border-red-500/20",
  Production:
    "text-zinc-700   bg-zinc-100  dark:bg-zinc-800      border-zinc-200   dark:border-zinc-700",
  Approved:
    "text-blue-700   bg-blue-50   dark:bg-blue-500/10   border-blue-200   dark:border-blue-500/20",
};

// ── Main page ─────────────────────────────────────────────────────
export default function PostmortemDetailPage() {
  const [activeTab, setActiveTab] = useState<TabId>("Incident Overview");

  const TAB_CONTENT: Record<TabId, React.ReactNode> = {
    "Incident Overview": <TabIncidentOverview />,
    Timeline: <TabTimeline />,
    "Root cause analysis": <TabRootCause />,
    "Lessons learned": <TabLessonsLearned />,
    "Signal Correlation graph": <TabSignalGraph />,
    "Investigation Record": <TabInvestigationRecord />,
    Remediation: <TabRemediation />,
    "Corrective Actions": <TabCorrectiveActions />,
    Collaboration: <TabCollaboration />,
    "Playbook Updates": <TabPlaybookUpdates />,
    "Governance and Audit": <TabGovernance />,
    Attachments: <TabAttachments />,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 px-8 py-3 flex items-center justify-between">
        <Link
          href="/postmortem"
          className="flex items-center gap-2 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5"
        >
          <ArrowLeft size={14} /> Back to Postmortems
        </Link>
        <div className="flex items-center gap-2">
          {[
            { icon: <Share2 size={14} />, label: "Share" },
            { icon: <FileText size={14} />, label: "Export PDF" },
            { icon: <Mail size={14} />, label: "Email" },
            { icon: <Pencil size={14} />, label: "Edit" },
          ].map((btn) => (
            <button
              key={btn.label}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full mx-auto px-8 py-6">
        {/* ── Header card ── */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-4 bg-white dark:bg-zinc-900/40">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                Incident Postmortem
              </p>
              <h1 className="text-[28px] font-black text-zinc-900 dark:text-zinc-100">
                {PM.incidentId}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                Generated: {PM.generatedAt}
              </p>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                Approved by:{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {PM.approvedBy}
                </span>{" "}
                ({PM.approvedRole})
              </p>
              <div className="flex items-center gap-2 justify-end mt-1">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                  AI-Generated
                </span>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5">
                  {PM.version}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {PM.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[12px] font-semibold px-2.5 py-1 rounded border ${TAG_STYLES[tag] ?? "text-zinc-600 border-zinc-200"}`}
              >
                {tag === "Resolved" ? "✓ " : ""}
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Executive summary ── */}
        <div className="border-l-4 border-blue-400 dark:border-blue-500 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-r-2xl p-6 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
            Executive Summary
          </p>
          <p className="text-[15px] font-black text-zinc-900 dark:text-zinc-100 mb-3 leading-snug">
            {PM.executiveSummary.headline}
          </p>
          <p className="text-[14px] text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
            {PM.executiveSummary.body.split("**").map((part, i) =>
              i % 2 === 1 ? (
                <strong
                  key={i}
                  className="text-zinc-900 dark:text-zinc-100 font-bold"
                >
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
          </p>
          <div className="flex items-center gap-5">
            {PM.executiveSummary.bullets.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-1.5 text-[12px] text-zinc-500 dark:text-zinc-400"
              >
                <div className={`w-2 h-2 rounded-full ${b.color}`} /> {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Investigation Summary ── */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: "#0f172a" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
            Scrubbe AI — Investigation Summary
          </p>
          <div className="grid grid-cols-4 gap-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                Investigation Duration
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-[32px] font-black text-white">
                  {PM.aiSummary.duration}
                </span>
                <span className="text-[14px] text-slate-400">min</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                Signals Correlated
              </p>
              <p className="text-[32px] font-black text-white">
                {PM.aiSummary.signals}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                Root Cause Confidence
              </p>
              <p className="text-[32px] font-black text-emerald-400">
                {PM.aiSummary.confidence}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                Probable Cause
              </p>
              <p className="text-[22px] font-black text-white">
                {PM.aiSummary.cause}
              </p>
            </div>
          </div>
        </div>

        {/* ── Tab nav ── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full border text-[13px] font-medium transition-colors ${
                activeTab === tab
                  ? "border-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Active tab content ── */}
        <div>{TAB_CONTENT[activeTab]}</div>
      </div>
    </div>
  );
}
