/* Types, cast list, and the simulated live-conversation script for the live
   war room cockpit. The incident itself is real (fetched by id); the running
   conversation/vitals/recommended-action are a scripted demo since there is
   no live agent-chat backend yet — mirrors the rest of the war-rooms module. */

export type Phase = "Investigating" | "Identified" | "Mitigating" | "Monitoring" | "Resolved";
export const PHASES: Phase[] = ["Investigating", "Identified", "Mitigating", "Monitoring", "Resolved"];

export interface HumanInfo {
  i: string;
  c: string;
  role: string;
}
export const HUMANS: Record<string, HumanInfo> = {
  "Sarah Okafor": { i: "SO", c: "#1B4DFF", role: "Incident commander" },
  "David Morakinyo": { i: "DM", c: "#6B4DE6", role: "Platform engineer" },
  "Amara Eze": { i: "AE", c: "#0B7A5B", role: "Backend engineer" },
};
export const AGENTS: Record<string, string> = {
  Ezra: "Incident orchestrator",
  "Logs Agent": "Log analysis",
  "Deployment Agent": "Release automation",
  "Infrastructure Agent": "Infra remediation",
};
export const isAgent = (n: string) => n in AGENTS;
export const initOf = (n: string): string => {
  if (isAgent(n)) return n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  if (HUMANS[n]) return HUMANS[n].i;
  return (n || "?").slice(0, 2).toUpperCase();
};
export const colorOf = (n: string) => HUMANS[n]?.c ?? "#5B6675";
export const roleOf = (n: string) => (isAgent(n) ? AGENTS[n] : HUMANS[n]?.role ?? "");

export type Presence = "on" | "idle";
export interface Participant {
  n: string;
  p: Presence;
  ic?: boolean;
}
export const PARTICIPANTS: Participant[] = [
  { n: "Sarah Okafor", p: "on", ic: true },
  { n: "David Morakinyo", p: "on" },
  { n: "Amara Eze", p: "idle" },
  { n: "Ezra", p: "on" },
  { n: "Logs Agent", p: "on" },
  { n: "Deployment Agent", p: "on" },
  { n: "Infrastructure Agent", p: "on" },
];

export type CapType = "metric" | "decision" | "action" | "modification" | "date";
export const CAP_LABEL: Record<CapType, string> = { metric: "Metric", decision: "Decision", action: "Action", modification: "Change", date: "Date" };
export interface CapturedItem {
  type: CapType;
  text: string;
  by: string;
  did: string;
}

export interface StreamMessage {
  who?: string;
  kind?: "sys";
  ok?: boolean;
  text: string;
  at?: string;
  finding?: boolean;
  crit?: boolean;
}

export interface ScriptStep {
  t: number;
  kind: "typing" | "message";
  who: string;
  text?: string;
  finding?: boolean;
  crit?: boolean;
  capture?: CapturedItem;
  setPhase?: number;
  showReco?: boolean;
}

export const SCRIPT: ScriptStep[] = [
  { t: 600, kind: "typing", who: "Deployment Agent" },
  {
    t: 1500, kind: "message", who: "Deployment Agent", finding: true,
    text: "Onset correlates with deploy dep-8842 to checkout-api at 09:05 — nine minutes before the errors began. No infrastructure change in the window.",
    capture: { type: "decision", text: "Deploy dep-8842 is the likely trigger of the 5xx surge", by: "Deployment Agent", did: "flagged for the postmortem" },
  },
  { t: 2600, kind: "typing", who: "Infrastructure Agent" },
  {
    t: 3500, kind: "message", who: "Infrastructure Agent", finding: true,
    text: "Resources are nominal — CPU, memory and connection pools all within range. This is not capacity; it points to the deploy.",
  },
  {
    t: 4600, kind: "message", who: "Sarah Okafor",
    text: "Agreed. If dep-8842 is the cause, let's roll it back rather than hotfix under load.",
    capture: { type: "metric", text: "5xx error rate peaked at 6.8% on POST /checkout/submit", by: "Logs Agent", did: "monitor created, alerts at 1%" },
  },
  { t: 5600, kind: "typing", who: "Ezra" },
  {
    t: 6600, kind: "message", who: "Ezra",
    text: "High-confidence match: dep-8842 introduced the regression. I've prepared a rollback and it's ready in the recommended-action panel for approval.",
    capture: { type: "action", text: "Add a checkout 5xx canary gate to catch this before full rollout", by: "Ezra", did: "routed to Deployment Agent" },
    setPhase: 1,
    showReco: true,
  },
];

export const RECO = {
  action: "Roll back deploy dep-8842",
  why: "Onset matches the 09:05 deploy within nine minutes, resources are nominal, and rollback is the fastest safe path to recovery.",
  confidence: 96,
};
export const RECOVERY_STEPS = [5.1, 3.4, 1.9, 0.9, 0.3];
export const INITIAL_ERR_PATH = [6.8, 6.6, 6.9, 7.1, 6.8];

export function fmtElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}
/* Parses an "HH:MM:SS" or "MM:SS" elapsed label into seconds, falling back
   to a representative default when the incident hasn't supplied one. */
export function parseElapsedLabel(label?: string | null): number {
  if (!label) return 512;
  const parts = label.split(":").map((p) => parseInt(p, 10));
  if (parts.some((p) => Number.isNaN(p))) return 512;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 512;
}

/* Deterministic cosmetic "WR-XXXX" code derived from the real war room id,
   for display only — the backend doesn't hand back a short code. */
export function shortWrCode(id?: string | null): string {
  if (!id) return "WR-0000";
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return `WR-${1000 + (hash % 9000)}`;
}

export function formatStarted(createdAt?: string | null): string {
  if (!createdAt) return "Just started";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "Just started";
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });
  const now = new Date();
  const sameDay = d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth() && d.getUTCDate() === now.getUTCDate();
  const when = sameDay ? "today" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `Started ${time} GMT · ${when}`;
}

export interface StatusTone {
  label: string;
  className: string;
}
export function statusTone(status?: string | null): StatusTone {
  const s = (status || "").toUpperCase();
  if (/RESOLV|CLOS/.test(s)) return { label: "Resolved", className: "bg-IMSLightGreen/10 text-IMSLightGreen border-IMSLightGreen/25" };
  if (/ACK/.test(s)) return { label: "Acknowledged", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25" };
  if (/PROGRESS|INVESTIGAT|MITIGAT/.test(s)) return { label: "In progress", className: "bg-[#EDF1FF] text-[#1B4DFF] border-[#D3DEFF] dark:bg-[#1B4DFF]/10 dark:border-[#1B4DFF]/30" };
  if (/OPEN|NEW|CRITICAL/.test(s)) return { label: "Open", className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/25" };
  if (!status) return { label: "Open", className: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:border-white/10" };
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return { label, className: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:border-white/10" };
}
