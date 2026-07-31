/**
 * Derived data for the individual Service Detail page. Everything here is a
 * pure function of a ServiceRecord (plus the shared seeded PRNG), so the same
 * service always renders the same operational story.
 */
import {
  ENVIRONMENTS,
  Health,
  LEVEL,
  ServiceRecord,
  attachedPlaybooks,
  depGraph,
  ealOf,
  pr,
  serviceRules,
} from "./serviceCatalog.data";

/* ───────────────────── business capabilities & objectives ───────────────────── */

const CAPABILITY_LIBRARY: Record<string, string[]> = {
  Commerce: ["Online Checkout", "Marketplace Orders", "Gift Card Processing", "Cart & Pricing", "Promotions"],
  "Platform Engineering": ["Subscription Billing", "Customer Payments", "Refunds & Chargebacks", "Merchant Payouts", "Invoice Generation"],
  "Identity & Security": ["Customer Sign-in", "Single Sign-On", "Fraud Screening", "Consent & Privacy", "Access Governance"],
  Messaging: ["Order Notifications", "Transactional Email", "Push & SMS", "Delivery Receipts"],
  "Data Platform": ["Revenue Reporting", "Customer Analytics", "Forecasting", "Regulatory Reporting"],
  Infrastructure: ["Service Connectivity", "Traffic Routing", "Secrets Distribution", "Platform Runtime"],
  Mobile: ["Mobile Checkout", "In-app Account", "Push Engagement"],
  Growth: ["Onboarding Journeys", "Referrals", "Experimentation"],
  "Internal Tools": ["Support Console", "Back-office Operations", "Agent Tooling"],
  Unassigned: ["Unmapped capability"],
};
export function businessCapabilities(s: ServiceRecord): string[] {
  const pool = CAPABILITY_LIBRARY[s.owner] ?? CAPABILITY_LIBRARY.Unassigned;
  const n = s.tier === 0 ? 5 : s.tier === 1 ? 4 : s.tier === 2 ? 3 : 2;
  return pool.slice(0, Math.min(n, pool.length));
}

export interface ServiceObjectives {
  availability: string;
  sloTarget: string;
  rto: string;
  rpo: string;
  burn: number;
  budgetLabel: "Exhausted" | "At risk" | "Healthy";
}
export function serviceObjectives(s: ServiceRecord): ServiceObjectives {
  const burn = s.health === "Critical" ? 96 : s.health === "Warning" ? 61 : 18;
  const budgetLabel = burn >= 90 ? "Exhausted" : burn >= 55 ? "At risk" : "Healthy";
  return {
    availability: s.availability,
    sloTarget: "99.95",
    rto: s.tier === 0 ? "15 minutes" : s.tier === 1 ? "30 minutes" : s.tier === 2 ? "2 hours" : "1 business day",
    rpo: s.tier === 0 ? "1 minute" : s.tier === 1 ? "5 minutes" : s.tier === 2 ? "1 hour" : "24 hours",
    burn,
    budgetLabel,
  };
}

/* ───────────────────── communication ───────────────────── */

export function opComms(s: ServiceRecord) {
  const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const team = s.owner === "Unassigned" ? "Platform fallback" : s.owner;
  return [
    { label: "Slack channel", value: "#" + slug, note: "Primary engineering channel" },
    { label: "PagerDuty", value: team, note: "Paging and escalation policy" },
    { label: "Microsoft Teams", value: "Engineering Operations", note: "Leadership and cross-team bridge" },
    { label: "Status page", value: s.tier <= 1 ? "Customer Status Portal" : "Internal status only", note: s.tier <= 1 ? "Customer-visible during incidents" : "Not published externally" },
    { label: "War room bridge", value: "Auto-created at P0/P1", note: "Opens with owners pre-invited" },
  ];
}

/* ───────────────────── ownership ───────────────────── */

const FIRST = ["S. Chen", "M. Alavi", "R. Osei", "K. Whitfield", "J. Nakamura", "A. Duarte", "L. Petrov", "N. Bello"];
export function ownershipModel(s: ServiceRecord) {
  const pick = (n: number) => FIRST[Math.floor(pr(s.name.length + n, 210 + n) * FIRST.length)];
  const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return [
    { role: "Technical owner", value: pick(1), note: "Accountable for the code and runtime", primary: true },
    { role: "Product owner", value: pick(2), note: "Owns roadmap and business trade-offs", primary: false },
    { role: "Engineering manager", value: pick(3), note: "Staffing, escalation and sign-off", primary: false },
    { role: "Assignment group", value: s.owner === "Unassigned" ? "Unassigned" : s.owner, note: "Receives incidents by default", primary: true },
    { role: "On-call team", value: s.owner === "Unassigned" ? "Platform fallback" : s.owner + " primary", note: "24/7 rotation", primary: true },
    { role: "Incident commander", value: s.tier <= 1 ? pick(4) : "Assigned at declaration", note: s.tier <= 1 ? `Pre-assigned for Tier ${s.tier}` : "On demand", primary: s.tier <= 1 },
    { role: "Communication channel", value: "#" + slug, note: "War room bridges here automatically", primary: false },
  ];
}

/* ───────────────────── incident history + recovery ───────────────────── */

function genSI(seedStr: string) {
  let h = 0;
  for (let k = 0; k < seedStr.length; k++) h = (h * 31 + seedStr.charCodeAt(k)) >>> 0;
  return "SI-" + String(100000 + (h % 899999)).slice(0, 6);
}

export interface ServiceIncident {
  id: string;
  pri: "P0" | "P1" | "P2" | "P3";
  open: boolean;
  when: string;
  mttr: number;
  how: string;
  cause: string;
}
const OPENED_POOL = ["just now", "2 hrs ago", "5 hrs ago", "yesterday", "2 days ago", "4 days ago", "1 week ago", "2 weeks ago"];
const RESOLVED_POOL = ["3 days ago", "1 week ago", "2 weeks ago", "3 weeks ago", "5 weeks ago", "2 months ago", "3 months ago", "4 months ago"];
const CAUSE_POOL = ["Dependency latency", "Deployment regression", "Resource exhaustion", "Upstream provider fault", "Configuration drift"];
export function serviceIncidents(s: ServiceRecord): ServiceIncident[] {
  const n = Math.max(3, s.incidents + 3);
  const out: ServiceIncident[] = [];
  for (let k = 0; k < n; k++) {
    const roll = pr(s.name.length + k * 5, 90);
    const pri = s.tier === 0 && k === 0 ? "P0" : roll > 0.72 ? "P1" : roll > 0.38 ? "P2" : "P3";
    const openNow = k < s.incidents;
    out.push({
      id: genSI(s.id + k),
      pri: pri as ServiceIncident["pri"],
      open: openNow,
      when: openNow ? (OPENED_POOL[k] ?? `${k} weeks ago`) : (RESOLVED_POOL[k] ?? `${k} months ago`),
      mttr: 6 + Math.floor(pr(s.name.length + k, 91) * 40),
      how: openNow ? "Open" : roll > 0.55 ? "Resolved · automated" : "Resolved · human approved",
      cause: CAUSE_POOL[k % CAUSE_POOL.length],
    });
  }
  return out;
}

export function recoveryProfile(s: ServiceRecord) {
  const incidents = serviceIncidents(s);
  const resolved = incidents.filter((x) => !x.open);
  const avg = Math.round(resolved.reduce((a, x) => a + x.mttr, 0) / Math.max(1, resolved.length));
  const automated = resolved.filter((x) => x.how.includes("automated"));
  const successRate = Math.round((automated.length / Math.max(1, resolved.length)) * 100);
  const e = ealOf(s);
  const executeTime = avg;
  const approvalWait = e.blocked ? null : e.level <= 1 ? null : e.level === 2 ? 7 : 0;
  const projected = e.blocked ? null : approvalWait === null ? null : executeTime + approvalWait;
  return {
    incidents, resolved, avg, automated: automated.length, successRate,
    executeTime, approvalWait, projected, bestCase: executeTime,
    lastRecovery: resolved[0] ?? null,
    detectionTime: 2 + Math.floor(pr(s.name.length, 126) * 5),
  };
}

const RECOVERY_STRATEGIES = ["Rolling restart", "Deployment rollback", "Traffic shift to healthy region", "Cache failover and re-warm", "Connection pool recycle", "Scale out and drain"];
export function recoveryStrategy(s: ServiceRecord) {
  const e = ealOf(s);
  const rec = recoveryProfile(s);
  const idx = Math.floor(pr(s.name.length, 240) * RECOVERY_STRATEGIES.length);
  return {
    preferred: RECOVERY_STRATEGIES[idx],
    fallback: RECOVERY_STRATEGIES[(idx + 1) % RECOVERY_STRATEGIES.length],
    automation: e.blocked ? "Unavailable" : e.level >= 3 ? "Available" : "Partial",
    automationOk: !e.blocked && e.level >= 3,
    approval: e.blocked ? "Always required" : e.level >= 3 ? "Not required" : "Required",
    approvalOk: !e.blocked && e.level >= 3,
    avg: rec.avg,
    rec,
  };
}

const FAILURE_PATTERN_LIBRARY: [string, string][] = [
  ["Redis saturation", "Cache memory exhausts under peak load, latency climbs before errors appear."],
  ["Deployment regression", "A release introduces a hot path regression detected within minutes of rollout."],
  ["Certificate expiry", "TLS material lapses and handshakes fail across every caller at once."],
  ["Database failover", "Primary promotion drops in-flight transactions and stalls writes."],
  ["Kafka consumer lag", "Consumers fall behind, producing stale state and duplicate side effects."],
  ["Connection pool exhaustion", "Upstream slowness backs up the pool until new work cannot be served."],
];
export interface FailurePattern {
  name: string;
  why: string;
  occurrences: number;
  last: string;
  severity: "ok" | "warn" | "bad";
}
export function failurePatterns(s: ServiceRecord): FailurePattern[] {
  const out: FailurePattern[] = [];
  FAILURE_PATTERN_LIBRARY.forEach(([name, why], i) => {
    const roll = pr(s.name.length + i * 3, 250);
    if (roll > 0.42 || (s.tier <= 1 && i < 2)) {
      const occ = 1 + Math.floor(roll * (s.tier <= 1 ? 5 : 2));
      out.push({
        name, why, occurrences: occ,
        last: ["3 weeks ago", "2 months ago", "5 months ago", "last quarter"][i % 4],
        severity: occ >= 4 ? "bad" : occ >= 2 ? "warn" : "ok",
      });
    }
  });
  return out.length ? out.slice(0, 5) : [{ name: FAILURE_PATTERN_LIBRARY[0][0], why: FAILURE_PATTERN_LIBRARY[0][1], occurrences: 1, last: "last quarter", severity: "ok" }];
}

/* ───────────────────── current operational state + timeline ───────────────────── */

export function operationalState(s: ServiceRecord) {
  const e = ealOf(s);
  const open = serviceIncidents(s).filter((x) => x.open).length;
  const freeze = s.tier === 0 && s.health === "Critical";
  const obj = serviceObjectives(s);
  return [
    { n: "Service health", v: s.health, cls: s.health === "Healthy" ? "ok" : s.health === "Warning" ? "warn" : "bad" },
    { n: "Active incidents", v: open ? `${open} open` : "None", cls: open ? (open > 1 ? "bad" : "warn") : "ok" },
    { n: "Change freeze", v: freeze ? "In effect" : "None", cls: freeze ? "warn" : "ok" },
    { n: "Deployment", v: s.deploymentConfidence >= 90 ? "Stable" : "Watching", cls: s.deploymentConfidence >= 90 ? "ok" : "warn" },
    { n: "Automation", v: e.blocked ? "Blocked" : "Enabled", cls: e.blocked ? "bad" : "ok" },
    { n: "Error budget", v: obj.budgetLabel, cls: obj.budgetLabel === "Exhausted" ? "bad" : obj.budgetLabel === "At risk" ? "warn" : "ok" },
  ] as { n: string; v: string; cls: "ok" | "warn" | "bad" }[];
}

export function serviceTimeline(s: ServiceRecord) {
  const yrs = s.createdYearsAgo;
  const t: { t: string; d: string; w: string }[] = [
    { t: "Service created", d: `Registered in the catalog by ${s.owner === "Unassigned" ? "Platform Engineering" : s.owner}`, w: `${yrs} yr${yrs > 1 ? "s" : ""} ago` },
    { t: "Ownership assigned", d: `Assignment group set to ${s.owner}`, w: yrs > 1 ? `${yrs - 1} yrs ago` : "10 months ago" },
    { t: "Architecture updated", d: `Migrated to ${s.runtime} on ${s.cloud}`, w: "8 months ago" },
    { t: "Major deployment", d: `v${Math.max(1, parseInt(s.version) - 1)}.0.0 rolled out across ${s.env}`, w: "5 months ago" },
  ];
  if (s.tier <= 1) t.push({ t: "P1 incident", d: `Customer-facing degradation, resolved in ${recoveryProfile(s).avg} min`, w: `${s.lastIncidentWeeksAgo} weeks ago` });
  t.push({ t: "Infrastructure migration", d: `Moved into ${s.region} with regional failover`, w: "9 weeks ago" });
  t.push({ t: "Current version", d: `v${s.version} · ${s.pods} pods · ${s.health.toLowerCase()}`, w: "now" });
  return t;
}

export function opActivity(s: ServiceRecord) {
  const inc = serviceIncidents(s).slice(0, 3);
  const out: { cat: string; type: string; title: string; sub: string; when: string }[] = [];
  out.push({ cat: "deploy", type: "Deployment", title: `v${s.version} released to ${s.env}`, sub: `Rolled out across ${s.pods} pods · risk 22%`, when: "Yesterday" });
  out.push({ cat: "config", type: "Config change", title: "Feature flag toggled", sub: "checkout.retry.enabled → true", when: "2 days ago" });
  out.push({ cat: "infra", type: "Infrastructure", title: "Terraform apply", sub: `${s.cloud} · ${s.region} node group resized`, when: "4 days ago" });
  inc.forEach((x) => out.push({ cat: "incident", type: "Incident", title: `${x.id} · ${x.cause}`, sub: (x.open ? "Open · " : "Resolved · ") + x.how, when: x.when }));
  out.push({ cat: "change", type: "Change request", title: `CHG-0${4100 + s.tier * 7} approved`, sub: "Database index added · standard change", when: "1 week ago" });
  return out;
}

/* ───────────────────── operational readiness checklist ───────────────────── */

export function opReadiness(s: ServiceRecord) {
  const e = ealOf(s);
  const books = attachedPlaybooks(s);
  const rules = serviceRules(s);
  const rec = recoveryProfile(s);
  return [
    { n: "Linked playbooks", ok: books.length > 0, v: books.length ? `${books.length} bound` : "None bound", d: books.length ? books.slice(0, 2).join(" · ") : "No governed recovery path is attached to this service." },
    { n: "Operational rules", ok: rules.length > 0, v: `${rules.length} in force`, d: "Constrain what may run without a human." },
    { n: "Incident templates", ok: true, v: `${s.tier <= 1 ? 3 : 1} available`, d: "Pre-fills severity, comms and roles at declaration." },
    { n: "Recovery procedure", ok: !!rec.lastRecovery, v: rec.lastRecovery ? "Proven" : "Untested", d: rec.lastRecovery ? `Last succeeded ${rec.lastRecovery.when}` : "No successful recovery on record." },
    { n: "Automation availability", ok: !e.blocked && e.level >= 3, v: e.blocked ? "Blocked" : LEVEL(e.level).name, d: e.blocked ? "Governance blocks autonomous action here." : "Effective autonomy for this service." },
    { n: "AI readiness", ok: depGraph(s).confidence >= 85, v: depGraph(s).band, d: "Dependency evidence quality Ezra reasons from." },
  ] as { n: string; ok: boolean; v: string; d: string }[];
}

/* ───────────────────── blast radius / business impact ───────────────────── */

export function customerImpact(s: ServiceRecord) {
  const g = depGraph(s);
  const upstreamSvcs = g.upstream.map((e) => e.svc).filter(Boolean) as ServiceRecord[];
  const affected = [s, ...upstreamSvcs];
  const customerFacing = affected.filter((x) => x.env === "Production" && x.tier <= 1);
  const rpm = customerFacing.reduce((a, x) => a + x.traffic, 0);
  const users = Math.round(rpm * 3.4);
  const tiers = [0, 1, 2, 3].map((t) => affected.filter((x) => x.tier === t).length);
  const priority = tiers[0] > 0 ? "P0" : tiers[1] > 0 ? "P1" : tiers[2] > 0 ? "P2" : "P3";
  return { direct: upstreamSvcs, affected, customerFacing, rpm, users, tiers, priority };
}

const CAPABILITY_MAP: Record<number, [string, string][]> = {
  0: [["Revenue capture", "Orders, payment authorisation and settlement stop within seconds of failure."], ["Customer sign-in", "Sessions cannot be established or refreshed."], ["Order fulfilment", "Downstream warehouse and delivery events stall."]],
  1: [["Checkout experience", "Conversion degrades; carts persist but cannot complete."], ["Account management", "Profile and preference updates fail silently."]],
  2: [["Internal reporting", "Dashboards and scheduled exports fall behind."], ["Back-office tooling", "Support agents lose enrichment context."]],
  3: [["Developer tooling", "Non-customer-facing workflows are delayed."]],
};
export function businessBlastRadius(s: ServiceRecord) {
  const impact = customerImpact(s);
  const caps = CAPABILITY_MAP[s.tier] ?? CAPABILITY_MAP[3];
  const revenuePerMin =
    s.tier === 0 ? 4200 + Math.floor(pr(s.name.length, 200) * 5200)
      : s.tier === 1 ? 900 + Math.floor(pr(s.name.length, 200) * 1800)
        : s.tier === 2 ? 120 + Math.floor(pr(s.name.length, 200) * 260) : 0;
  const risk =
    s.tier === 0 ? { label: "Severe", cls: "bad" as const }
      : s.tier === 1 ? { label: "High", cls: "warn" as const }
        : s.tier === 2 ? { label: "Moderate", cls: "warn" as const } : { label: "Low", cls: "ok" as const };
  return {
    impact, caps, revenuePerMin, risk,
    dependentCount: impact.direct.length,
    affectedTotal: impact.affected.length,
    customerFacing: s.tier <= 1 && s.env === "Production",
  };
}

/* ───────────────────── runtime, repositories, integrations, related ───────────────────── */

const REPO_SUFFIXES = ["", "-worker", "-sdk", "-infra"];
export function serviceRepos(s: ServiceRecord): string[] {
  return REPO_SUFFIXES.slice(0, s.repoCount).map((suf) => s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + suf);
}

export const CONNECTED_INTEGRATIONS = [
  "GitHub", "GitLab", "Jenkins", "Azure DevOps", "ArgoCD", "FluxCD", "AWS", "Azure", "GCP",
  "Datadog", "Grafana", "Prometheus", "OpenTelemetry", "PagerDuty", "Slack", "Microsoft Teams", "ServiceNow",
];

export function relatedModules(s: ServiceRecord) {
  return [
    { name: "Incidents", count: `${serviceIncidents(s).length} linked` },
    { name: "Playbooks", count: `${attachedPlaybooks(s).length} bound` },
    { name: "Operational rules", count: `${serviceRules(s).length} in force` },
    { name: "Change requests", count: "2 recent" },
    { name: "Assignment groups", count: s.owner === "Unassigned" ? "None" : "1 owner" },
  ];
}

/* ───────────────────── incident response orchestration ───────────────────── */

export interface OrchestrationStage {
  key: string;
  title: string;
  desc: string;
  locked: boolean;
  automatic: boolean;
}
export function orchestrationStages(s: ServiceRecord): OrchestrationStage[] {
  return [
    { key: "detect", title: "1 · Detect & route", desc: "Health & Signal Graph detect a deviation and automatically page the owning team.", locked: false, automatic: true },
    { key: "blast", title: "2 · Compute blast radius", desc: "Dependencies are walked live to scope which upstream and downstream services are at risk.", locked: false, automatic: true },
    { key: "gate", title: "3 · Rule gate", desc: "Operational rules evaluate whether any automated action is permitted before anything runs.", locked: true, automatic: true },
    { key: "playbook", title: "4 · Select playbook", desc: "The matching playbook is proposed for execution.", locked: false, automatic: s.tier <= 1 },
    { key: "sla", title: "5 · Start SLA clock", desc: "The SLA contract for the assigned priority begins tracking ack and resolution time.", locked: false, automatic: true },
  ];
}

export interface PriorityConfig {
  autopage: boolean;
  approval: boolean;
  playbook: string;
  maxAuto: number;
  escalation: string;
}
export function incidentConfig(s: ServiceRecord): Record<string, PriorityConfig> {
  const books = attachedPlaybooks(s);
  return {
    P0: { autopage: true, approval: true, playbook: books[0] ?? "None", maxAuto: 2, escalation: "10 min" },
    P1: { autopage: true, approval: true, playbook: books[1] ?? books[0] ?? "None", maxAuto: 3, escalation: "20 min" },
    P2: { autopage: false, approval: false, playbook: books[0] ?? "None", maxAuto: 4, escalation: "1 hr" },
    P3: { autopage: false, approval: false, playbook: "None", maxAuto: 5, escalation: "Next business day" },
  };
}

/* ───────────────────── environments ───────────────────── */

export interface EnvRow {
  env: string;
  isCurrent: boolean;
  version: string;
  slo: string;
  incidents: number;
  traffic: string;
  health: Health;
}
export function environmentsFor(s: ServiceRecord): EnvRow[] {
  return ENVIRONMENTS.map((env, i) => ({
    env,
    isCurrent: env === s.env,
    version: s.version,
    slo: Math.max(95, s.slo - i * 0.05).toFixed(2),
    incidents: env === s.env ? s.incidents : 0,
    traffic: env === "Production" ? `${(s.traffic / 1000).toFixed(1)}k/min` : "—",
    health: env === s.env ? s.health : "Healthy",
  }));
}

/* ───────────────────── signal graph + AI insights ───────────────────── */

export const SIGNAL_SOURCES = ["Logs", "Metrics", "Tracing", "Deployments", "Pipelines", "Alerts", "Events", "Dependencies", "Infrastructure"];

const AI_PATTERN_POOL = [
  "Cache saturation preceding latency spikes",
  "Connection-pool exhaustion after deploys",
  "Downstream timeout cascades at peak traffic",
  "Memory growth over long-running pods",
  "Certificate and credential expiry",
];
export function aiOpsInsights(s: ServiceRecord) {
  const g = depGraph(s);
  const rec = recoveryProfile(s);
  const patterns = AI_PATTERN_POOL.filter((_, i) => pr(s.name.length + i, 230) > 0.38).slice(0, 3);
  const freq = g.downstream
    .slice()
    .sort((a, b) => Number(b.critical) - Number(a.critical) || b.calls - a.calls)
    .slice(0, 3);
  const responders = ownershipModel(s)
    .filter((o) => o.primary)
    .map((o) => o.value)
    .slice(0, 3);
  return {
    patterns: patterns.length ? patterns : [AI_PATTERN_POOL[0]],
    freq, responders,
    mttr: rec.avg, confidence: g.confidence, band: g.band,
  };
}

/* ───────────────────── analytics ───────────────────── */

export function analyticsFor(s: ServiceRecord) {
  return [
    { k: "Deployment frequency", v: `${2 + Math.floor(pr(s.name.length, 50) * 6)}/week` },
    { k: "Incident frequency", v: `${s.incidents}/month` },
    { k: "SLO achievement", v: `${s.slo}%` },
    { k: "Dependency growth", v: `+${Math.floor(pr(s.name.length, 51) * 5)} this quarter` },
    { k: "Repository activity", v: `${10 + Math.floor(pr(s.name.length, 52) * 40)} commits/mo` },
    { k: "Operational cost", v: `$${(800 + Math.floor(pr(s.name.length, 53) * 4000)).toLocaleString()}/mo` },
    { k: "Mean recovery", v: "19 min" },
    { k: "Automation %", v: `${60 + Math.floor(pr(s.name.length, 54) * 35)}%` },
  ];
}

/* ───────────────────── audit log ───────────────────── */

export interface AuditEntry {
  when: string;
  actor: string;
  action: string;
  detail: string;
}
export function auditLog(s: ServiceRecord): AuditEntry[] {
  const when = ["2h ago", "1d ago", "3d ago", "5d ago", "9d ago"];
  const owner = ownershipModel(s)[0].value;
  const books = attachedPlaybooks(s);
  return [
    { when: when[0], actor: "Scrubbe policy engine", action: "Automation level evaluated", detail: `Bound by ${ealOf(s).binding} · ${ealOf(s).blocked ? "gate blocked" : "L" + ealOf(s).level}` },
    { when: when[1], actor: owner, action: "Playbook attached", detail: books[0] ?? "—" },
    { when: when[2], actor: "Scrubbe automation", action: "Health scan run", detail: `Result: ${s.health} · ${s.availability}% availability` },
    { when: when[3], actor: s.owner === "Unassigned" ? "Scrubbe discovery" : s.owner, action: "Owner assigned", detail: `Owning team set to ${s.owner}` },
    { when: when[4], actor: "Scrubbe discovery", action: "Service registered", detail: "Discovered from Kubernetes and added to the catalog" },
  ];
}

/* ───────────────────── SLA by priority ───────────────────── */

export const PRIORITIES = ["P0", "P1", "P2", "P3"] as const;
export const SLA_BY_PRIORITY: Record<string, { ack: string; resolve: string; uptime: string; credit: string }> = {
  P0: { ack: "5 min", resolve: "1 hr", uptime: "99.99%", credit: "30% monthly fee" },
  P1: { ack: "15 min", resolve: "4 hr", uptime: "99.95%", credit: "15% monthly fee" },
  P2: { ack: "1 hr", resolve: "1 business day", uptime: "99.9%", credit: "5% monthly fee" },
  P3: { ack: "4 hr", resolve: "3 business days", uptime: "99.5%", credit: "None" },
};
