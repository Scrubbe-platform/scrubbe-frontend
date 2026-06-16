"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Download,
  Link2,
  ArrowLeftRight,
  AlertTriangle,
  Plus,
  MessageSquare,
  UserPlus,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  Circle,
  Clock,
  Search,
  Package,
  FileEdit,
  Check,
} from "lucide-react";

// ── Dummy data ────────────────────────────────────────────────────
const HANDOVER = {
  id: "HO-001283",
  from: "LONDON",
  to: "US PLATFORM",
  title: "Checkout API Production Failure",
  status: "Active",
  severity: "Critical",
  phase: "Remediation Approval",
  created: "12:14 UTC",
  date: "12 april, 2026",
  incidentsCount: 3,
};

const VIEWERS = [
  { initials: "P.", color: "#a855f7" },
  { initials: "M.", color: "#3b82f6" },
  { initials: "S.", color: "#22c55e" },
  { initials: "H.D", color: "#b91c1c" },
];

const TOP_BAR = {
  time: "14:24:03 UTC",
  activeIncidents: 3,
};

const OWNERSHIP = {
  currentOwner: "London Platform Team",
  currentCommander: "James O.",
  transferTime: "18:00 UTC",
  countdown: "13:45:44",
  nextOwner: "US Platform Team",
  nextCommander: "Sarah Wilson",
};

const INCIDENTS = [
  {
    id: "SI-001983",
    title: "Checkout API Production Failure",
    status: "Active",
    statusColor: "red",
    severity: "Critical",
    time: "11:42 UTC",
    primary: true,
    expanded: true,
    description:
      "Primary incident. Checkout API experiencing elevated failures linked to deployment v2.4.1-rc3. Rollback staged and awaiting approval. RCA confidence 91%.",
  },
  {
    id: "SI-001974",
    title: "Payments Service Degradation",
    status: "Active",
    statusColor: "red",
    severity: "Critical",
    time: "11:42 UTC",
    primary: false,
    expanded: false,
  },
  {
    id: "SI-001978",
    title: "Search Service Latency — Elevated",
    status: "Watching",
    statusColor: "yellow",
    severity: "Low",
    time: "11:42 UTC",
    primary: false,
    expanded: false,
  },
];

const TEAM_VIEWERS = [
  { initials: "PI", color: "#000000" },
  { initials: "AR", color: "#3b82f6" },
  { initials: "DK", color: "#f59e0b" },
  { initials: "MF", color: "#8b5cf6" },
  { initials: "SN", color: "#ec4899" },
];

const EZRA = {
  status: "READY",
  stats: {
    events: "147 TIMELINE EVENTS",
    evidence: "24 EVIDENCE ITEMS",
    agents: "6 AGENTS",
  },
};

const PLAYBOOK_PROGRESS = {
  name: "Deployment Failure v3.1",
  steps: [
    {
      title: "Collect Evidence",
      detail: "24 items · 11:44–11:48",
      status: "done",
    },
    { title: "Run Agents", detail: "6 agents · completed", status: "done" },
    {
      title: "Correlation Analysis",
      detail: "3 signals correlated",
      status: "done",
    },
    {
      title: "Root Cause Analysis",
      detail: "Image tag mismatch · 91%",
      status: "done",
    },
    { title: "Recommendation", detail: "Rollback staged", status: "done" },
    {
      title: "Awaiting Approval",
      detail: "Commander sign-off",
      status: "current",
      action: "Approve",
    },
    { title: "Execute Rollback", detail: "", status: "pending" },
  ],
};

const CURRENT_INCIDENT_STATE = [
  { label: "Incident ID", value: "SI-001983" },
  { label: "Status", value: "Active", badge: "red" },
  { label: "Severity", value: "Critical", color: "red" },
  { label: "Phase", value: "Remediation Approval" },
  { label: "Playbook", value: "Deployment Failure v3.1", color: "blue" },
  { label: "RCA Confidence", value: "91%", progress: 91 },
  { label: "EAL Level", value: "EAL-3 · Supervised" },
  { label: "Blast Radius", value: "High · Checkout + Payments", color: "red" },
];

const APPROVALS = {
  title: "Rollback Production — Checkout API",
  sub: "Playbook step 6 · EAL-3 gate",
  status: "Pending",
  required: "Required: Incident Commander · Risk Agent cleared",
};

const INVESTIGATION_SUMMARY = [
  { label: "First Failure", value: "11:42 UTC" },
  { label: "Affected Service", value: "Checkout API" },
  { label: "Users Impacted", value: "~17%", color: "red" },
  { label: "Deploy Before?", value: "Yes · 27 min prior", color: "red" },
  { label: "Recent Commits", value: "4" },
  { label: "Root Cause", value: "Image Tag Mismatch" },
  { label: "Blast Radius", value: "Checkout + Payments", color: "red" },
];

const OWNERSHIP_TRANSFER = [
  { label: "From", value: "London Platform" },
  { label: "To", value: "US Platform" },
  { label: "Commander", value: "Sarah Wilson" },
  { label: "Transfer At", value: "18:00 UTC", color: "orange" },
];

const PENDING_TASKS = [
  {
    title: "Approve rollback playbook execution",
    owner: "Incident Commander",
    due: "Due 18:05 UTC",
    tag: "Critical",
    tagColor: "red",
    action: "Approve",
    done: false,
  },
  {
    title: "Verify deployment health post-rollback",
    owner: "US Platform Team",
    due: "Due 18:20 UTC",
    tag: null,
    done: false,
  },
  {
    title: "Monitor error rate for 15 min post-deploy",
    owner: "US Platform Team",
    due: "Due 18:40 UTC",
    tag: null,
    done: false,
  },
  {
    title: "Collect and tag all evidence items",
    owner: "London Team",
    due: "Completed",
    tag: null,
    done: true,
  },
];

const TIMELINE = [
  {
    time: "11:38 UTC",
    color: "gray",
    title: "Deployment initiated — image tag",
    tag: "v2.4.1-rc3",
    desc: "Triggered by CI/CD pipeline · commit 4a9f2c1",
  },
  {
    time: "11:42 UTC",
    color: "red",
    title: "Error rate increased — 0.1% → 14.7%",
    desc: "Checkout API · p95 latency spike 240ms → 4.8s",
  },
  {
    time: "11:44 UTC",
    color: "blue",
    title: "Incident SI-001983 created — Critical",
    desc: "Auto-detected by Signal Graph",
  },
  {
    time: "11:46 UTC",
    color: "green",
    title: "Investigation started — Playbook v3.1 matched",
    desc: "matchConfidence: 0.94 · 6 agents activated",
  },
  {
    time: "11:49 UTC",
    color: "green",
    title: "RCA generated — Image tag mismatch confirmed",
    desc: "Ezra · Confidence 91% · 24 evidence items",
  },
  {
    time: "11:52 UTC",
    color: "blue",
    title: "Rollback recommended and staged",
    desc: "Awaiting Incident Commander approval",
  },
  {
    time: "12:14 UTC",
    color: "gray",
    title: "Handover HO-001283 created",
    desc: "London → US Platform · Transfer 18:00 UTC",
  },
];

const EVIDENCE = {
  total: 24,
  critical: 4,
  items: [
    { label: "Failed Deployment Job", conf: "0.97" },
    { label: "Image Tag Mismatch — registry delta", conf: "0.95" },
    { label: "Deployment-Error Spike Correlation", conf: "0.91" },
    { label: "Error Rate Anomaly Detected", conf: "0.99" },
  ],
};

const NOTES = [
  {
    initials: "JO",
    color: "#18181b",
    name: "James O.",
    role: null,
    time: "12:19 UTC",
    text: "US team should verify deployment metrics for at least 15 minutes post-rollback. Rollback script has been staged and tested in staging environment. Sarah, confirm you have the playbook access before 17:45 UTC.",
  },
  {
    initials: "PI",
    color: "#2563eb",
    name: "Paschal I.",
    role: "Incident Commander",
    time: "12:31 UTC",
    text: "Pending my approval on the rollback. Will sign off before 17:55 UTC. Escalation path is Ravi S. if I'm unreachable.",
  },
];

// ── Shared bits ───────────────────────────────────────────────────

const StatusDot = ({ color }: { color: string }) => {
  const map: Record<string, string> = {
    red: "bg-red-500",
    green: "bg-emerald-500",
    yellow: "bg-amber-400",
    blue: "bg-blue-500",
    gray: "bg-zinc-300 dark:bg-zinc-600",
  };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${map[color] ?? "bg-zinc-400"}`}
    />
  );
};

const Pill = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${className}`}
  >
    {children}
  </span>
);

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/40 ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({
  icon,
  title,
  right,
}: {
  icon?: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
    <div className="flex items-center gap-2 text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
      {icon} {title}
    </div>
    {right}
  </div>
);

// ── Main component ────────────────────────────────────────────────

export default function HandoverDetailPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "SI-001983": true,
  });

  const toggleIncident = (id: string) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-1.5 text-[13px] text-zinc-400 dark:text-zinc-500">
          <span>Operations</span>
          <ChevronRight size={13} />
          <span className="font-semibold text-zinc-800 dark:text-zinc-100">
            Handovers
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {VIEWERS.map((v, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-zinc-950 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: v.color }}
                >
                  {v.initials}
                </div>
              ))}
            </div>
            <span className="text-[12px] text-zinc-400 dark:text-zinc-500">
              +4 Viewing
            </span>
          </div>
          <span className="text-[13px] font-mono text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5">
            {TOP_BAR.time}
          </span>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-1.5">
            <StatusDot color="red" /> {TOP_BAR.activeIncidents} Active Incidents
          </span>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-8 py-6">
        {/* ── Back + action buttons ── */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/handovers"
            className="flex items-center gap-1.5 text-[13px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <ChevronLeft size={14} /> Back to Handovers
          </Link>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <Download size={14} /> Export <ChevronDown size={12} />
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <Link2 size={14} /> Attach to Handover
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <ArrowLeftRight size={14} /> Transfer Ownership
            </button>
          </div>
        </div>

        {/* ── Header card ── */}
        <Card className="p-6 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
            Handover &nbsp;•&nbsp; {HANDOVER.id} &nbsp;•&nbsp; {HANDOVER.from}{" "}
            <span className="text-zinc-300 dark:text-zinc-600">→</span>{" "}
            {HANDOVER.to}
          </p>
          <h1 className="text-[26px] font-black text-zinc-900 dark:text-zinc-100 mb-3">
            {HANDOVER.title}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Pill className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 flex items-center gap-1.5">
              <StatusDot color="red" /> {HANDOVER.status}
            </Pill>
            <Pill className="text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
              Severity{" "}
              <span className="text-red-500 font-bold ml-1">
                {HANDOVER.severity}
              </span>
            </Pill>
            <Pill className="text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
              Phase{" "}
              <span className="text-zinc-900 dark:text-zinc-100 font-bold ml-1">
                {HANDOVER.phase}
              </span>
            </Pill>
            <Pill className="text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
              Created{" "}
              <span className="text-zinc-900 dark:text-zinc-100 font-bold ml-1">
                {HANDOVER.created}
              </span>
            </Pill>
            <Pill className="text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
              Date{" "}
              <span className="text-zinc-900 dark:text-zinc-100 font-bold ml-1">
                {HANDOVER.date}
              </span>
            </Pill>
            <Pill className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5">
              {HANDOVER.incidentsCount} incidents this handover
            </Pill>
          </div>
        </Card>

        {/* ── Ownership transfer strip ── */}
        <div
          className="rounded-2xl px-8 py-6 mb-4 flex items-center justify-between"
          style={{ background: "#0a0f0c" }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
              Current Owner
            </p>
            <p className="text-[18px] font-bold text-white mb-0.5">
              {OWNERSHIP.currentOwner}
            </p>
            <p className="text-[12px] text-zinc-500">
              Commander: {OWNERSHIP.currentCommander}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[20px] font-black text-emerald-400 mb-1">
              {OWNERSHIP.transferTime}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
              Transfer in
            </p>
            <span className="text-[14px] font-mono font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1">
              {OWNERSHIP.countdown}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
              Next Owner
            </p>
            <p className="text-[18px] font-bold text-white mb-0.5">
              {OWNERSHIP.nextOwner}
            </p>
            <p className="text-[12px] text-zinc-500">
              Commander: {OWNERSHIP.nextCommander}
            </p>
          </div>
        </div>

        {/* ── Incidents in this handover ── */}
        <Card className="mb-4 overflow-hidden">
          <CardHeader
            icon={<AlertTriangle size={15} className="text-amber-500" />}
            title="Incidents in this Handover"
            right={
              <div className="flex items-center gap-3">
                <Pill className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5">
                  {HANDOVER.incidentsCount} incidents
                </Pill>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <Plus size={13} /> Add Incident
                </button>
              </div>
            }
          />
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {INCIDENTS.map((inc) => (
              <div key={inc.id} className="px-5 py-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleIncident(inc.id)}
                >
                  <div className="flex items-center gap-2.5">
                    {expanded[inc.id] ? (
                      <ChevronDown size={14} className="text-zinc-400" />
                    ) : (
                      <ChevronRight size={14} className="text-zinc-400" />
                    )}
                    <Link
                      href={`/incident/${inc.id}`}
                      className="text-[13px] font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {inc.id}
                    </Link>
                    <span className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                      {inc.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Pill
                      className={`flex items-center gap-1.5 ${inc.statusColor === "red" ? "text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5" : "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5"}`}
                    >
                      <StatusDot color={inc.statusColor} /> {inc.status}
                    </Pill>
                    <span
                      className={`text-[12px] font-bold ${inc.severity === "Critical" ? "text-red-500" : inc.severity === "Low" ? "text-emerald-500" : "text-amber-500"}`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-[12px] text-zinc-400 dark:text-zinc-500">
                      {inc.time}
                    </span>
                  </div>
                </div>
                {expanded[inc.id] && inc.description && (
                  <div className="ml-6 mt-2">
                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
                      {inc.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        View Investigation
                      </button>
                      <button className="px-4 py-1.5 text-[12px] font-semibold text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* ── Team viewing strip ── */}
        <Card className="flex items-center justify-between px-5 py-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {TEAM_VIEWERS.map((v, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: v.color }}
                >
                  {v.initials}
                </div>
              ))}
            </div>
            <div>
              <p className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <StatusDot color="green" /> 5 team members viewing live
              </p>
              <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                Aisha R. is editing handover notes...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <MessageSquare size={14} /> Open Chat
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <UserPlus size={14} /> Invite
            </button>
          </div>
        </Card>

        {/* ── Two column layout ── */}
        <div className="grid grid-cols-[1fr_340px] gap-4 items-start">
          {/* ── Left column ── */}
          <div className="space-y-4">
            {/* Ezra card */}
            <div
              className="rounded-2xl p-8 text-center relative overflow-hidden"
              style={{ background: "#0d1410", border: "1px solid #1f2922" }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <Sparkles size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-[14px] font-bold text-white">Ezra</p>
                    <p className="text-[11px] text-zinc-500">
                      Reasoning Engine · Incident Brief
                    </p>
                  </div>
                </div>
                <Pill className="text-zinc-400 border-zinc-700 bg-zinc-800/60">
                  {EZRA.status}
                </Pill>
              </div>

              <div className="w-16 h-16 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center mx-auto mb-6">
                <Sparkles size={24} className="text-emerald-400" />
              </div>

              <h2 className="text-[26px] font-black text-white mb-3">
                Get up to speed in under two minutes.
              </h2>
              <p className="text-[13px] text-zinc-400 leading-relaxed max-w-md mx-auto mb-6">
                Ezra analyses the full incident timeline, evidence, RCA,
                playbook state, and pending decisions — then distills everything
                into a clear operational brief your incoming team can act on
                immediately.
              </p>

              <button
                className="w-full max-w-md mx-auto block py-3 rounded-xl font-bold text-[14px] text-zinc-900"
                style={{
                  background: "linear-gradient(90deg, #34d399, #bef264)",
                }}
              >
                Catch Me Up
              </button>

              <div className="flex items-center justify-center gap-6 mt-6 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> {EZRA.stats.events}
                </span>
                <span className="flex items-center gap-1.5">
                  <Package size={12} /> {EZRA.stats.evidence}
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles size={12} /> {EZRA.stats.agents}
                </span>
              </div>
            </div>

            {/* Current Incident State */}
            <Card>
              <CardHeader
                icon={<AlertTriangle size={15} className="text-amber-500" />}
                title="Current Incident State"
                right={
                  <Pill className="flex items-center gap-1.5 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5">
                    <StatusDot color="red" /> LIVE
                  </Pill>
                }
              />
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {CURRENT_INCIDENT_STATE.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      {row.label}
                    </span>
                    {row.progress !== undefined ? (
                      <div className="flex items-center gap-2 w-40">
                        <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
                          {row.value}
                        </span>
                      </div>
                    ) : (
                      <span
                        className={`text-[13px] font-bold ${
                          row.color === "red"
                            ? "text-red-500"
                            : row.color === "blue"
                              ? "text-blue-500"
                              : "text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        {row.badge === "red" ? (
                          <span className="inline-flex items-center gap-1.5 text-red-500">
                            <StatusDot color="red" />
                            {row.value}
                          </span>
                        ) : (
                          row.value
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Pending tasks */}
            <Card>
              <CardHeader
                icon={<ClipboardList size={15} className="text-zinc-500" />}
                title="Pending task"
                right={
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <Plus size={13} /> Add task
                  </button>
                }
              />
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {PENDING_TASKS.map((task, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-4">
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${task.done ? "bg-emerald-500 border-emerald-500" : "border-zinc-300 dark:border-zinc-600"}`}
                    >
                      {task.done && <Check size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[14px] font-semibold ${task.done ? "text-zinc-400 dark:text-zinc-500 line-through" : "text-zinc-900 dark:text-zinc-100"}`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          {task.owner}
                        </span>
                        {task.tag ? (
                          <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded px-1.5 py-0.5">
                            {task.due} · {task.tag}
                          </span>
                        ) : (
                          <span
                            className={`text-[11px] font-semibold rounded px-1.5 py-0.5 ${task.done ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20" : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"}`}
                          >
                            {task.due}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.action && (
                      <button className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-bold transition-colors shrink-0">
                        {task.action}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                  <Clock size={15} className="text-zinc-500" /> Timeline - Key
                  Events
                </div>
                <button className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  View all 147 events →
                </button>
              </div>
              <div className="space-y-0">
                {TIMELINE.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <StatusDot color={item.color} />
                      {i < TIMELINE.length - 1 && (
                        <div className="w-px flex-1 bg-zinc-100 dark:bg-zinc-800 mt-1" />
                      )}
                    </div>
                    <div className="pb-5 flex-1 min-w-0">
                      <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mb-0.5">
                        {item.time}
                      </p>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </p>
                        {item.tag && (
                          <Pill className="text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 text-[10px] py-0.5">
                            {item.tag}
                          </Pill>
                        )}
                      </div>
                      <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Evidence Summary */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                  <Package size={15} className="text-zinc-500" /> Evidence
                  Summary
                </div>
                <button className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  View all 24 →
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-4">
                  <p className="text-[32px] font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                    {EVIDENCE.total}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Total Items
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-4">
                  <p className="text-[32px] font-black text-red-500 leading-none mb-1">
                    {EVIDENCE.critical}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Critical Signals
                  </p>
                </div>
              </div>
              <div className="space-y-2.5">
                {EVIDENCE.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2 text-[13px] text-zinc-700 dark:text-zinc-300">
                      <Check size={14} className="text-emerald-500" />{" "}
                      {item.label}
                    </span>
                    <span className="text-[12px] font-mono text-zinc-400 dark:text-zinc-500">
                      conf: {item.conf}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Handover Notes */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                  <FileEdit size={15} className="text-zinc-500" /> Handover
                  Notes
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <Plus size={13} /> Add Note
                </button>
              </div>
              <div className="space-y-4">
                {NOTES.map((note, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${i < NOTES.length - 1 ? "pb-4 border-b border-zinc-100 dark:border-zinc-800" : ""}`}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                      style={{ backgroundColor: note.color }}
                    >
                      {note.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
                          {note.name}
                        </span>
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          • {note.time}
                          {note.role ? ` • ${note.role}` : ""}
                        </span>
                      </div>
                      <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {note.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-4">
            {/* Playbook Progress */}
            <Card className="p-5">
              <div className="flex items-center gap-2 text-[14px] font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                <ClipboardList size={15} className="text-zinc-500" /> Playbook
                Progress
              </div>
              <p className="text-[13px] font-bold text-blue-600 dark:text-blue-400 mb-4">
                {PLAYBOOK_PROGRESS.name}
              </p>
              <div className="space-y-4">
                {PLAYBOOK_PROGRESS.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {step.status === "done" ? (
                      <CheckCircle2
                        size={16}
                        className="text-emerald-500 mt-0.5 shrink-0"
                      />
                    ) : step.status === "current" ? (
                      <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center mt-0.5 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      </div>
                    ) : (
                      <Circle
                        size={16}
                        className="text-zinc-300 dark:text-zinc-600 mt-0.5 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[13px] font-bold ${step.status === "pending" ? "text-zinc-400 dark:text-zinc-500" : step.status === "current" ? "text-amber-600 dark:text-amber-400" : "text-zinc-900 dark:text-zinc-100"}`}
                      >
                        {step.title}
                      </p>
                      {step.detail && (
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {step.detail}
                        </p>
                      )}
                    </div>
                    {step.action && (
                      <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-bold transition-colors shrink-0">
                        {step.action}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Approvals */}
            <Card>
              <CardHeader
                icon={<CheckCircle2 size={15} className="text-zinc-500" />}
                title="Approvals"
              />
              <div className="p-5">
                <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  {APPROVALS.title}
                </p>
                <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mb-4">
                  {APPROVALS.sub}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/5">
                    <StatusDot color="blue" /> {APPROVALS.status}
                  </Pill>
                  <button className="px-4 py-1.5 rounded-xl border border-red-200 dark:border-red-500/30 text-[12px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors">
                    Reject
                  </button>
                  <button className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-bold transition-colors">
                    Approve
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {APPROVALS.required}
                </p>
              </div>
            </Card>

            {/* Investigation Summary */}
            <Card>
              <CardHeader
                icon={<Search size={15} className="text-zinc-500" />}
                title="Investigation Summary"
              />
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {INVESTIGATION_SUMMARY.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <span className="text-[12px] text-zinc-400 dark:text-zinc-500">
                      {row.label}
                    </span>
                    <span
                      className={`text-[13px] font-bold ${row.color === "red" ? "text-red-500" : "text-zinc-900 dark:text-zinc-100"}`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Ownership Transfer */}
            <Card>
              <CardHeader
                icon={<ArrowLeftRight size={15} className="text-zinc-500" />}
                title="Ownership Transfer"
              />
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {OWNERSHIP_TRANSFER.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <span className="text-[12px] text-zinc-400 dark:text-zinc-500">
                      {row.label}
                    </span>
                    <span
                      className={`text-[13px] font-bold ${row.color === "orange" ? "text-orange-500" : "text-zinc-900 dark:text-zinc-100"}`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 p-4">
                <button className="flex-1 py-2.5 rounded-xl border border-emerald-500 dark:border-emerald-500/40 text-[13px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors">
                  Edit Transfer
                </button>
                <button
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:brightness-110"
                  style={{
                    background: "linear-gradient(135deg, #14532d, #22c55e)",
                  }}
                >
                  Confirm Now
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
