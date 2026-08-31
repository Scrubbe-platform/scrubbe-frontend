// lib/icp/data.ts

export const KPI_DATA = [
  { label: "MTTR Improvement", value: "32.8%", delta: "vs 30 days ago", cls: "text-emerald-600 dark:text-emerald-400", color: "#02DD82", spark: [40, 33, 30, 28, 24, 22, 18, 15] },
  { label: "Autonomous Success Rate", value: "89.3%", delta: "↑ 6.7%", cls: "text-emerald-600 dark:text-emerald-400", color: "#02DD82", spark: [78, 80, 82, 84, 86, 88, 89, 89.3] },
  { label: "Human Override Rate", value: "8.7%", delta: "↓ 3.1%", cls: "text-purple-600 dark:text-purple-400", color: "#A855F7", spark: [14, 13, 12, 11, 10.5, 10, 9, 8.7] },
  { label: "Incidents Resolved", value: "156", delta: "↑ 18.4%", cls: "text-emerald-600 dark:text-emerald-400", color: "#3B82F6", spark: [110, 118, 124, 130, 138, 145, 151, 156] },
  { label: "Knowledge Artifacts", value: "1,248", delta: "↑ 24.6%", cls: "text-emerald-600 dark:text-emerald-400", color: "#3B82F6", spark: [820, 900, 960, 1020, 1090, 1150, 1200, 1248] },
  { label: "Confidence Calibration", value: "0.92", delta: "↑ 0.05", cls: "text-amber-600 dark:text-amber-400", color: "#F59E0B", spark: [0.84, 0.85, 0.86, 0.88, 0.89, 0.90, 0.91, 0.92] },
];

export type KPIItem = (typeof KPI_DATA)[number];

export const CATEGORIES = [
  { name: "Performance Degradation", pct: 28, color: "#3B82F6" },
  { name: "Deployment / Release", pct: 22, color: "#F59E0B" },
  { name: "Infrastructure", pct: 18, color: "#02DD82" },
  { name: "Configuration", pct: 15, color: "#A855F7" },
  { name: "Dependency / Third Party", pct: 10, color: "#22D3EE" },
  { name: "Other", pct: 7, color: "#94A3B8" },
];

export const REMEDIATIONS = [
  { name: "Restart Service", rate: 92, attempts: 128, color: "#02DD82" },
  { name: "Rollback Deployment", rate: 91, attempts: 103, color: "#3B82F6" },
  { name: "Scale Up", rate: 87, attempts: 98, color: "#A855F7" },
  { name: "Cache Clear", rate: 82, attempts: 74, color: "#22D3EE" },
  { name: "DB Connection Reset", rate: 78, attempts: 62, color: "#F59E0B" },
];

export const RISKS = [
  { name: "DB Failover", rate: 24 },
  { name: "Schema Change", rate: 18 },
  { name: "Full Cache Flush", rate: 16 },
  { name: "Service Restart All", rate: 12 },
];

// ── Per-tab remediation views ────────────────────────────────────

export type RemediationView = {
  successRate: number;
  delta: string;
  remediations: { name: string; rate: number; attempts: number; color: string }[];
  risks: { name: string; rate: number }[];
  note: string;
};

export const REMEDIATION_TABS: Record<string, RemediationView> = {
  Overview: {
    successRate: 87.6,
    delta: "↑ 7.3% vs 30d ago",
    remediations: [
      { name: "Restart Service", rate: 92, attempts: 128, color: "#02DD82" },
      { name: "Rollback Deployment", rate: 91, attempts: 103, color: "#3B82F6" },
      { name: "Scale Up", rate: 87, attempts: 98, color: "#A855F7" },
      { name: "Cache Clear", rate: 82, attempts: 74, color: "#22D3EE" },
      { name: "DB Connection Reset", rate: 78, attempts: 62, color: "#F59E0B" },
    ],
    risks: [
      { name: "DB Failover", rate: 24 },
      { name: "Schema Change", rate: 18 },
      { name: "Full Cache Flush", rate: 16 },
      { name: "Service Restart All", rate: 12 },
    ],
    note: "Showing aggregated metrics across all services and environments.",
  },
  "By Service": {
    successRate: 91.2,
    delta: "↑ 4.1% · checkout-service leads",
    remediations: [
      { name: "checkout-service", rate: 94, attempts: 42, color: "#02DD82" },
      { name: "auth-service", rate: 91, attempts: 38, color: "#3B82F6" },
      { name: "api-gateway", rate: 89, attempts: 55, color: "#A855F7" },
      { name: "payment-gateway", rate: 86, attempts: 31, color: "#22D3EE" },
      { name: "redis-cache", rate: 83, attempts: 27, color: "#F59E0B" },
    ],
    risks: [
      { name: "redis-cache restart", rate: 22 },
      { name: "payment-gateway rollback", rate: 17 },
      { name: "event-pipeline reset", rate: 14 },
    ],
    note: "Showing per-service remediation success rates. Sorted by success rate.",
  },
  "By Environment": {
    successRate: 89.1,
    delta: "↑ 5.8% · production highest",
    remediations: [
      { name: "Production", rate: 92, attempts: 210, color: "#02DD82" },
      { name: "Staging", rate: 88, attempts: 85, color: "#3B82F6" },
      { name: "Dev", rate: 79, attempts: 42, color: "#F59E0B" },
    ],
    risks: [
      { name: "Dev cold-start failures", rate: 28 },
      { name: "Staging data mismatch", rate: 15 },
      { name: "Production config drift", rate: 11 },
    ],
    note: "Showing per-environment remediation success rates.",
  },
  "By Category": {
    successRate: 85.4,
    delta: "↑ 6.2% · Performance category leads",
    remediations: [
      { name: "Performance", rate: 93, attempts: 88, color: "#02DD82" },
      { name: "Deployment", rate: 91, attempts: 64, color: "#3B82F6" },
      { name: "Infrastructure", rate: 86, attempts: 72, color: "#A855F7" },
      { name: "Configuration", rate: 81, attempts: 48, color: "#22D3EE" },
      { name: "Dependency", rate: 76, attempts: 35, color: "#F59E0B" },
    ],
    risks: [
      { name: "Dependency timeout", rate: 26 },
      { name: "Config rollback conflicts", rate: 19 },
      { name: "Infra scaling limits", rate: 13 },
    ],
    note: "Showing per-category remediation success rates across all services.",
  },
};

export const INCIDENTS = [
  { sev: "P0", name: "Checkout Service - Payment Failures", meta: "May 27, 10:14 AM · Duration: 47m · Services: 4", similar: "Similar to 12 incidents", id: "SI-004821", uuid: "e90f967c-9feb-4b49-a94c-27ffc5f3df5d", svc: "checkout-service", env: "production", cat: "Performance" },
  { sev: "P1", name: "Kafka Consumer Lag", meta: "May 27, 09:08 AM · Duration: 32m · Services: 2", similar: "Similar to 8 incidents", id: "SI-004817", uuid: "a21b8c3e-4d67-4a8f-b1e2-9c5d7f3a6b8e", svc: "event-pipeline", env: "production", cat: "Infrastructure" },
  { sev: "P1", name: "User Authentication Degradation", meta: "May 26, 11:42 PM · Duration: 18m · Services: 3", similar: "Similar to 6 incidents", id: "SI-004809", uuid: "c4d5e6f7-8a9b-4c0d-e1f2-3a4b5c6d7e8f", svc: "auth-service", env: "production", cat: "Performance" },
  { sev: "P2", name: "Slow API Responses", meta: "May 26, 09:31 PM · Duration: 26m · Services: 5", similar: "Similar to 15 incidents", id: "SI-004802", uuid: "f1e2d3c4-b5a6-4978-8d6e-5f4a3b2c1d0e", svc: "api-gateway", env: "staging", cat: "Performance" },
  { sev: "P3", name: "Error Rate Increase - Reporting", meta: "May 26, 07:12 PM · Duration: 14m · Services: 1", similar: "Similar to 7 incidents", id: "SI-004798", uuid: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", svc: "reporting", env: "production", cat: "Configuration" },
  { sev: "P2", name: "Redis Eviction Storm", meta: "May 25, 03:50 PM · Duration: 21m · Services: 2", similar: "Similar to 9 incidents", id: "SI-004781", uuid: "6e7f8a9b-0c1d-4e2f-3a4b-5c6d7e8f9a0b", svc: "redis-cache", env: "production", cat: "Infrastructure" },
  { sev: "P1", name: "Deployment Rollback - Payments", meta: "May 25, 11:05 AM · Duration: 12m · Services: 1", similar: "Similar to 4 incidents", id: "SI-004769", uuid: "b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e", svc: "payment-gateway", env: "production", cat: "Deployment" },
];

export type IncidentItem = (typeof INCIDENTS)[number];

export const SERVICES = ["checkout-service", "auth-service", "api-gateway", "payment-gateway", "redis-cache", "event-pipeline", "reporting"];
export const ENVIRONMENTS = ["production", "staging", "dev"];
export const PRIORITIES = ["P0", "P1", "P2", "P3"];

export const GOV_KPIS = [
  { label: "Autonomous Actions", value: "312", delta: "↑ 23.1%", cls: "text-emerald-600 dark:text-emerald-400" },
  { label: "Actions Approved", value: "284", delta: "91.0%", cls: "text-emerald-600 dark:text-emerald-400" },
  { label: "Actions Denied", value: "28", delta: "9.0%", cls: "text-amber-600 dark:text-amber-400" },
  { label: "Policy Violations", value: "5", delta: "↓ 37.5%", cls: "text-emerald-600 dark:text-emerald-400" },
];

export const GOV_EVENTS = [
  { title: "High risk action denied", detail: "DB Schema Change on prod-db", policy: "Risk-Guardrail", time: "10m ago", type: "deny" as const },
  { title: "Autonomous rollback approved", detail: "checkout-service deployment", policy: "Auto-Rollback", time: "15m ago", type: "ok" as const },
  { title: "Policy updated", detail: "Increased confidence threshold for prod", policy: "Confidence", time: "1h ago", type: "info" as const },
  { title: "Manual approval logged", detail: "Scale-up on api-gateway approved by on-call", policy: "Capacity", time: "2h ago", type: "ok" as const },
  { title: "Guardrail evaluated", detail: "Blast radius check passed for redis-cache", policy: "Blast-Radius", time: "3h ago", type: "info" as const },
];

export const EAL_LEVELS = [
  { num: "EAL 0", name: "Full Manual", count: 2, pct: 1.3, color: "#94A3B8", desc: "Human executes every step", active: false },
  { num: "EAL 1", name: "Assisted", count: 18, pct: 11.5, color: "#F59E0B", desc: "AI proposes, human approves each action", active: false },
  { num: "EAL 2", name: "Supervised", count: 41, pct: 26.3, color: "#3B82F6", desc: "Batch approval with override window", active: false },
  { num: "EAL 3", name: "Conditional Auto", count: 67, pct: 42.9, color: "#02DD82", desc: "Auto-executes within policy guardrails", active: true },
  { num: "EAL 4", name: "Full Auto", count: 28, pct: 18.0, color: "#A855F7", desc: "Autonomous end-to-end with audit", active: false },
];

export const SLO_DATA = [
  { svc: "Checkout Service", target: "99.9%", actual: 99.94, budget: 2.6, burn: 0.42, status: "healthy" as const },
  { svc: "Payment API", target: "99.95%", actual: 99.91, budget: 1.1, burn: 3.10, status: "warn" as const },
  { svc: "User Auth", target: "99.9%", actual: 99.97, budget: 3.8, burn: 0.19, status: "healthy" as const },
  { svc: "Redis Cache", target: "99.5%", actual: 99.61, budget: 3.2, burn: 0.67, status: "healthy" as const },
  { svc: "Search Service", target: "99.0%", actual: 98.87, budget: -0.8, burn: 4.20, status: "breach" as const },
  { svc: "Notifications", target: "99.5%", actual: 99.72, budget: 5.1, burn: 0.23, status: "healthy" as const },
];

export const COST_KPIS = [
  { label: "Engineer Hours Saved", value: "1,840h", delta: "↑ 22.3% vs last period", cls: "text-emerald-600 dark:text-emerald-400" },
  { label: "Autonomous Cost Avoidance", value: "$218K", delta: "↑ 31.4% vs last period", cls: "text-emerald-600 dark:text-emerald-400" },
  { label: "Avg Resolution Cost", value: "$94", delta: "↓ $41 vs manual baseline", cls: "text-emerald-600 dark:text-emerald-400" },
  { label: "ROI on Automation", value: "6.2×", delta: "↑ 0.9× vs last period", cls: "text-emerald-600 dark:text-emerald-400" },
];

export const COST_BARS = [
  { label: "Performance Degradation", value: 520, color: "#02DD82" },
  { label: "Deployment / Release", value: 410, color: "#3B82F6" },
  { label: "Infrastructure", value: 320, color: "#A855F7" },
  { label: "Configuration", value: 280, color: "#F59E0B" },
  { label: "Dependency", value: 190, color: "#22D3EE" },
];

export const FEED_EVENTS = [
  { type: "remediation" as const, title: "Autonomous restart completed", detail: "checkout-service · EAL 3 · confidence 0.94", time: "2m ago" },
  { type: "governance" as const, title: "Guardrail blocked execution", detail: "DB schema change denied by Risk-Guardrail", time: "8m ago" },
  { type: "agent" as const, title: "Agent retrained", detail: "Log Analysis Agent accuracy +1.4% after 312 new patterns", time: "15m ago" },
  { type: "remediation" as const, title: "Scale-up approved", detail: "api-gateway · EAL 2 · approved by on-call", time: "22m ago" },
  { type: "governance" as const, title: "Policy updated", detail: "Confidence threshold raised to 0.90 for production", time: "1h ago" },
  { type: "agent" as const, title: "Knowledge artifact created", detail: "New pattern: Redis eviction storm → cache warm strategy", time: "1.5h ago" },
];

export const IMPROVEMENTS = [
  { name: "Changed agent order for infra issues", impact: "+18.2%", status: "Rolled out" as const, services: "infra, redis-cache" },
  { name: "Parallelized log + metric analysis", impact: "+14.7%", status: "Rolled out" as const, services: "all" },
  { name: "Added pre-check for known issues", impact: "+11.3%", status: "Testing" as const, services: "checkout, payments" },
  { name: "Optimized escalation timing", impact: "+9.8%", status: "Rolled out" as const, services: "all" },
  { name: "Reduced unnecessary tool calls", impact: "+7.6%", status: "Proposed" as const, services: "auth, api-gateway" },
];

export const AGENTS = [
  { name: "Incident Triage Agent", accuracy: 94, tasks: 312, color: "#02DD82", trend: [88, 90, 91, 92, 93, 94], latency: "0.8s", drift: "-0.4%" },
  { name: "Root Cause Agent", accuracy: 92, tasks: 278, color: "#3B82F6", trend: [85, 87, 88, 90, 91, 92], latency: "1.4s", drift: "+0.2%" },
  { name: "Log Analysis Agent", accuracy: 89, tasks: 245, color: "#A855F7", trend: [80, 82, 85, 86, 88, 89], latency: "1.1s", drift: "-1.1%" },
  { name: "Infra Agent", accuracy: 91, tasks: 301, color: "#F59E0B", trend: [84, 86, 88, 89, 90, 91], latency: "0.9s", drift: "+0.3%" },
  { name: "Code Analysis Agent", accuracy: 87, tasks: 189, color: "#22D3EE", trend: [78, 80, 82, 84, 86, 87], latency: "1.6s", drift: "-0.8%" },
  { name: "Remediation Agent", accuracy: 93, tasks: 256, color: "#EF4444", trend: [86, 88, 90, 91, 92, 93], latency: "1.2s", drift: "+0.1%" },
];