/**
 * Operational Service Catalog — seed data + governance engine.
 * Ported from the design blueprint: a deterministic PRNG seeds every
 * service's stats so numbers stay stable across reloads, and the
 * automation-level / readiness math mirrors the blueprint's rules
 * (blast radius → policy/playbook/risk inputs → EAL, and the seven
 * weighted readiness checks).
 */

export function pr(i: number, salt: number): number {
  const x = Math.sin((i + 1) * (salt + 7) * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export const OWNERS = [
  "Platform Engineering", "Commerce", "Identity & Security", "Messaging", "Data Platform",
  "Infrastructure", "Mobile", "Growth", "Internal Tools",
];
export const ENVIRONMENTS = ["Production", "Staging", "QA", "Development", "Preview"];
export const RUNTIMES = ["Kubernetes", "ECS", "Serverless", "Virtual Machine"];
export const CLOUDS = ["AWS", "Azure", "GCP"];
export const REGIONS = ["eu-west-2", "us-east-1", "us-west-2", "ap-southeast-1"];
export const LANGUAGES = ["Go", "Java", "TypeScript", "Python", "Rust"];

const SEED: [string, string, number][] = [
  ["Payments API", "Platform Engineering", 0], ["Checkout", "Commerce", 0], ["Authentication", "Identity & Security", 0],
  ["API Gateway", "Platform Engineering", 0], ["Identity", "Identity & Security", 0], ["Fraud Detection", "Identity & Security", 0],
  ["Order Processing", "Commerce", 0], ["Wallet", "Commerce", 0], ["Billing", "Commerce", 0],
  ["Secrets Manager", "Infrastructure", 0], ["Session Store", "Identity & Security", 0], ["Notification Dispatcher", "Messaging", 0],
  ["Orders", "Commerce", 1], ["Notifications", "Messaging", 1], ["Search", "Data Platform", 1], ["Inventory", "Commerce", 1],
  ["Shipping", "Commerce", 1], ["Catalog", "Commerce", 1], ["Recommendation Engine", "Data Platform", 1], ["Subscriptions", "Commerce", 1],
  ["Invoices", "Commerce", 1], ["Partner API", "Growth", 1], ["User Service", "Platform Engineering", 1], ["Feature Flags", "Platform Engineering", 1],
  ["Refund Service", "Commerce", 1], ["Order Fulfillment", "Commerce", 1], ["Loyalty Service", "Growth", 1], ["Tax Service", "Commerce", 1],
  ["Shipping Carrier Gateway", "Commerce", 1], ["Email Service", "Messaging", 1], ["SMS Gateway", "Messaging", 1], ["Rate Limiter", "Infrastructure", 1],
  ["Webhook Dispatcher", "Platform Engineering", 1], ["Config Service", "Platform Engineering", 1],
  ["Reporting", "Data Platform", 2], ["Analytics Pipeline", "Data Platform", 2], ["ETL Pipeline", "Data Platform", 2], ["Data Warehouse", "Data Platform", 2],
  ["ML Inference", "Data Platform", 2], ["Mobile Backend", "Mobile", 2], ["Observability Pipeline", "Infrastructure", 2], ["Message Queue", "Infrastructure", 2],
  ["Cache Layer", "Infrastructure", 2], ["Search Index", "Data Platform", 2], ["Geolocation Service", "Data Platform", 2], ["Fraud Rules Engine", "Identity & Security", 2],
  ["Consent Manager", "Identity & Security", 2], ["Audit Service", "Identity & Security", 2], ["Compliance Reporting", "Identity & Security", 2],
  ["Vendor Integration Hub", "Infrastructure", 2], ["Partner Portal", "Growth", 2], ["Image Processing", "Infrastructure", 2], ["Video Transcoding", "Infrastructure", 2],
  ["Document Service", "Infrastructure", 2], ["Notification Preferences", "Messaging", 2], ["CDN Edge", "Infrastructure", 2], ["Batch Scheduler", "Infrastructure", 2],
  ["Cron Service", "Infrastructure", 2], ["Internal APIs", "Internal Tools", 2], ["Customer Support Tools", "Internal Tools", 2], ["Returns Service", "Commerce", 2],
  ["Pricing Engine", "Commerce", 2], ["Promotions Service", "Growth", 2], ["Gift Cards Service", "Commerce", 2], ["Address Validation", "Commerce", 2],
  ["Currency Conversion", "Commerce", 2], ["Localization Service", "Growth", 2], ["Content Management", "Growth", 2], ["Product Reviews", "Growth", 2],
  ["A/B Testing Platform", "Growth", 2],
  ["Admin Console", "Internal Tools", 3], ["Internal Tools API", "Internal Tools", 3], ["Developer Portal", "Internal Tools", 3], ["Design System Docs", "Internal Tools", 3],
  ["Sandbox Environment", "Internal Tools", 3], ["Load Testing Tool", "Internal Tools", 3], ["Style Guide Service", "Internal Tools", 3], ["Internal Wiki", "Internal Tools", 3],
  ["Employee Directory", "Internal Tools", 3], ["Onboarding Portal", "Internal Tools", 3], ["Expense Tool", "Internal Tools", 3], ["HR Integration", "Internal Tools", 3],
  ["Legacy Archive Service", "Internal Tools", 3], ["Internal Chatbot", "Internal Tools", 3], ["Metrics Dashboard", "Internal Tools", 3],
];

export type Health = "Healthy" | "Warning" | "Critical";

export interface ServiceRecord {
  id: string;
  name: string;
  owner: string;
  tier: number;
  health: Health;
  env: string;
  runtime: string;
  cloud: string;
  region: string;
  lang: string;
  incidents: number;
  deps: number;
  healthScore: number;
  slo: number;
  version: string;
  pods: number;
  repoCount: number;
  createdYearsAgo: number;
  availability: string;
  latency: number;
  errorRate: string;
  traffic: number;
  cpu: number;
  mem: number;
  riskScore: string;
  deploymentConfidence: number;
  lastIncidentWeeksAgo: number;
  _dep?: DepGraph;
  eal?: EalResult;
}

export const SERVICES: ServiceRecord[] = SEED.map(([name, owner, tier], i) => {
  const isOrphan = pr(i, 30) > 0.965;
  const healthRoll = pr(i, 1);
  const health: Health = healthRoll > 0.965 ? "Critical" : healthRoll > 0.89 ? "Warning" : "Healthy";
  const env = tier <= 1 ? "Production" : ENVIRONMENTS[Math.floor(pr(i, 2) * ENVIRONMENTS.length)];
  const runtime = RUNTIMES[Math.floor(pr(i, 3) * RUNTIMES.length)];
  const cloud = CLOUDS[Math.floor(pr(i, 4) * CLOUDS.length)];
  const region = REGIONS[Math.floor(pr(i, 5) * REGIONS.length)];
  const lang = LANGUAGES[Math.floor(pr(i, 6) * LANGUAGES.length)];
  const incidents = health === "Critical" ? 3 + Math.floor(pr(i, 7) * 5) : health === "Warning" ? 1 + Math.floor(pr(i, 7) * 3) : Math.floor(pr(i, 7) * 2);
  const deps = 2 + Math.floor(pr(i, 8) * (tier === 0 ? 16 : tier === 1 ? 12 : 7));
  const vMaj = 1 + Math.floor(pr(i, 11) * 5), vMin = Math.floor(pr(i, 12) * 9);
  const pods = tier <= 1 ? 6 + Math.floor(pr(i, 13) * 20) : 2 + Math.floor(pr(i, 13) * 8);
  return {
    id: "SRV-" + String(101 + i).padStart(5, "0"),
    name, owner: isOrphan ? "Unassigned" : owner, tier, health, env, runtime, cloud, region, lang,
    incidents, deps,
    healthScore: health === "Critical" ? 40 + Math.floor(pr(i, 9) * 20) : health === "Warning" ? 70 + Math.floor(pr(i, 9) * 15) : 92 + Math.floor(pr(i, 9) * 8),
    slo: +Math.min(99.99, 98.5 + pr(i, 10) * 1.49).toFixed(2),
    version: `${vMaj}.${vMin}.${Math.floor(pr(i, 16) * 10)}`,
    pods, repoCount: 1 + Math.floor(pr(i, 14) * 4), createdYearsAgo: 1 + Math.floor(pr(i, 15) * 3),
    availability: (99.9 + pr(i, 17) * 0.09).toFixed(2),
    latency: 12 + Math.floor(pr(i, 18) * 90),
    errorRate: (pr(i, 19) * 0.4).toFixed(2),
    traffic: 200 + Math.floor(pr(i, 20) * 40000),
    cpu: 20 + Math.floor(pr(i, 21) * 65),
    mem: 25 + Math.floor(pr(i, 22) * 60),
    riskScore: health === "Critical" ? "High" : health === "Warning" ? "Medium" : "Low",
    deploymentConfidence: 82 + Math.floor(pr(i, 23) * 17),
    lastIncidentWeeksAgo: 1 + Math.floor(pr(i, 24) * 10),
  };
});

export function byId(id: string) {
  return SERVICES.find((s) => s.id === id);
}
export function byName(name: string) {
  return SERVICES.find((s) => s.name === name);
}

export function mapApiService(api: any, idx: number): ServiceRecord {
  const healthRaw = (api.health ?? api.status ?? "").toUpperCase();
  const health: Health = healthRaw === "CRITICAL" || healthRaw === "DOWN" ? "Critical" : healthRaw === "WARNING" || healthRaw === "DEGRADED" ? "Warning" : "Healthy";
  const tier = api.tier ?? api.criticality ?? 2;
  return {
    id: api.id ?? "SRV-" + String(101 + idx).padStart(5, "0"),
    name: api.name ?? api.serviceName ?? `Service ${idx + 1}`,
    owner: api.team ?? api.owner ?? api.ownerTeam ?? "Unassigned",
    tier,
    health,
    env: api.environment ?? api.env ?? "Production",
    runtime: api.runtime ?? "Kubernetes",
    cloud: api.cloud ?? "AWS",
    region: api.region ?? "us-east-1",
    lang: api.language ?? api.lang ?? "TypeScript",
    incidents: api.openIncidents ?? api.incidentCount ?? 0,
    deps: api.dependencyCount ?? api.deps ?? 3,
    healthScore: api.healthScore ?? (health === "Critical" ? 45 : health === "Warning" ? 72 : 95),
    slo: api.sloTarget ?? api.slo ?? 99.9,
    version: api.version ?? "1.0.0",
    pods: api.podCount ?? api.pods ?? 4,
    repoCount: api.repoCount ?? 1,
    createdYearsAgo: api.createdYearsAgo ?? 1,
    availability: api.availability ?? "99.95",
    latency: api.p99LatencyMs ?? api.latencyMs ?? api.latency ?? 45,
    errorRate: api.errorRate ?? "0.05",
    traffic: api.requestsPerMin ?? api.traffic ?? 5000,
    cpu: api.cpuUsagePct ?? api.cpu ?? 35,
    mem: api.memUsagePct ?? api.mem ?? 42,
    riskScore: health === "Critical" ? "High" : health === "Warning" ? "Medium" : "Low",
    deploymentConfidence: api.deploymentConfidence ?? 90,
    lastIncidentWeeksAgo: api.lastIncidentWeeksAgo ?? 2,
  };
}

export function updateServicesFromApi(apiList: any[]) {
  const mapped = apiList.map(mapApiService);
  SERVICES.splice(0, SERVICES.length, ...mapped);
}

/* ───────────────────── automation levels ───────────────────── */

export interface AutomationLevel {
  n: number;
  short: string;
  name: string;
  desc: string;
}
export const AUTOMATION_LEVELS: AutomationLevel[] = [
  { n: 0, short: "L0", name: "Observe only", desc: "Scrubbe watches and reports. Nothing is proposed and nothing runs." },
  { n: 1, short: "L1", name: "Propose", desc: "Scrubbe drafts a remediation and hands it to the owning team." },
  { n: 2, short: "L2", name: "Approve then execute", desc: "Scrubbe executes only after a named human approves the proposal." },
  { n: 3, short: "L3", name: "Execute then verify", desc: "Scrubbe executes, then must prove the fix worked before it can close." },
  { n: 4, short: "L4", name: "Autonomous", desc: "Scrubbe executes and closes without a human in the loop." },
];
export function LEVEL(n: number) {
  return AUTOMATION_LEVELS[Math.max(0, Math.min(4, n))];
}

export interface PlaybookDef {
  name: string;
  stage: number;
  note: string;
}
export const PLAYBOOK_CATALOG: PlaybookDef[] = [
  { name: "Rollback Deployment", stage: 3, note: "Reverts to the last known-good release, then verifies." },
  { name: "Checkout latency mitigation", stage: 2, note: "Scales the hot path and sheds non-critical load." },
  { name: "Kubernetes node drain and replace", stage: 2, note: "Cordons, drains, and replaces an unhealthy node." },
  { name: "Database connection recovery", stage: 1, note: "Diagnoses pool exhaustion and drafts the recycle plan." },
  { name: "Memory leak containment", stage: 3, note: "Rolling restart with heap capture before each cycle." },
  { name: "Cache warm and failover", stage: 3, note: "Fails over the cache tier and re-warms from origin." },
  { name: "Certificate rotation", stage: 1, note: "Prepares the rotation; execution is always human-run." },
];
export function playbookByName(n: string) {
  return PLAYBOOK_CATALOG.find((p) => p.name === n);
}

export interface RuleDef {
  ref: string;
  name: string;
  state: "Allowed" | "Approval required" | "Forbidden" | "Mandatory";
  cap: number;
  tiers: number[];
}
export const RULE_LIBRARY: RuleDef[] = [
  { ref: "OR-009", name: "Autonomous restart", state: "Allowed", cap: 4, tiers: [0, 1, 2, 3] },
  { ref: "OR-010", name: "Rollback", state: "Allowed", cap: 4, tiers: [0, 1, 2, 3] },
  { ref: "OR-008", name: "Database changes", state: "Approval required", cap: 2, tiers: [0, 1, 2, 3] },
  { ref: "OR-015", name: "Infrastructure deletion", state: "Forbidden", cap: 1, tiers: [0, 1] },
  { ref: "OR-016", name: "Schema migration", state: "Forbidden", cap: 1, tiers: [0] },
  { ref: "OR-021", name: "Traffic shift between regions", state: "Approval required", cap: 2, tiers: [0, 1] },
  { ref: "OR-024", name: "Secret rotation", state: "Approval required", cap: 2, tiers: [0, 1, 2] },
  { ref: "M-VER-01", name: "Verification before closure", state: "Mandatory", cap: 4, tiers: [0, 1, 2, 3] },
];
export function serviceRules(s: ServiceRecord): RuleDef[] {
  return RULE_LIBRARY.filter((r) => r.tiers.includes(s.tier));
}
export function attachedPlaybooks(s: ServiceRecord): string[] {
  return s.tier === 0
    ? ["Rollback Deployment", "Database connection recovery", "Memory leak containment"]
    : s.tier === 1
      ? ["Rollback Deployment", "Checkout latency mitigation"]
      : s.tier === 2
        ? ["Kubernetes node drain and replace"]
        : [];
}

/* ───────────────────── dependency graph ───────────────────── */

export const DEP_TARGETS = [
  "Redis", "Kafka", "Aurora PostgreSQL", "Stripe", "Fraud Detection", "Notification Service",
  "Identity API", "Feature Flags", "Secrets Manager", "Elasticache", "MSK", "S3",
];
interface DepSource {
  key: string;
  label: string;
  lo: number;
  hi: number;
}
const DEP_SOURCES: DepSource[] = [
  { key: "observed", label: "Observed traffic", lo: 88, hi: 97 },
  { key: "traced", label: "Distributed trace", lo: 76, hi: 90 },
  { key: "declared", label: "Declared in config", lo: 56, hi: 74 },
  { key: "inferred", label: "Static analysis", lo: 32, hi: 54 },
];
function depKind(name: string): "cache" | "queue" | "datastore" | "external" | "service" {
  const n = name.toLowerCase();
  if (/redis|cache|elasticache/.test(n)) return "cache";
  if (/kafka|queue|msk|dispatcher/.test(n)) return "queue";
  if (/postgres|aurora|warehouse|s3|storage|index/.test(n)) return "datastore";
  if (/stripe|provider|gateway/.test(n)) return "external";
  return "service";
}
export interface DepEdge {
  name: string;
  dir: "downstream" | "upstream";
  kind: string;
  source: DepSource;
  confidence: number;
  svc: ServiceRecord | null;
  calls: number;
  critical: boolean;
}
export interface DepGraph {
  downstream: DepEdge[];
  upstream: DepEdge[];
  all: DepEdge[];
  confidence: number;
  unverified: DepEdge[];
  band: "High" | "Adequate" | "Under-verified";
}
function reverseDepCount(s: ServiceRecord) {
  return SERVICES.filter((x) => x.id !== s.id && x.deps > s.deps).length > 0
    ? 1 + Math.floor(pr(s.name.length, 41) * 7) : 1;
}
export function depGraph(s: ServiceRecord): DepGraph {
  if (s._dep) return s._dep;
  const mk = (name: string, dir: "downstream" | "upstream", i: number): DepEdge => {
    const roll = pr(name.length + i * 7 + s.name.length, 120);
    const srcIdx = roll > 0.62 ? 0 : roll > 0.40 ? 1 : roll > 0.18 ? 2 : 3;
    const source = DEP_SOURCES[srcIdx];
    const confidence = Math.round(source.lo + pr(name.length + i, 121) * (source.hi - source.lo));
    const kind = depKind(name);
    const svc = byName(name) || null;
    return {
      name, dir, kind, source, confidence, svc,
      calls: Math.round((s.traffic / 1000) * (0.25 + pr(name.length + i, 122) * 0.9) * 10) / 10,
      critical: kind === "datastore" || (!!svc && svc.tier <= 1),
    };
  };
  const downNames = DEP_TARGETS.slice(0, 3 + Math.floor(pr(s.name.length, 124) * 4));
  const upNames = SERVICES.filter((x) => x.id !== s.id && x.tier <= s.tier + 1)
    .sort((a, b) => b.deps - a.deps)
    .slice(0, 2 + Math.floor(pr(s.name.length, 125) * 4))
    .map((x) => x.name);
  const downstream = downNames.map((n, i) => mk(n, "downstream", i));
  const upstream = upNames.map((n, i) => mk(n, "upstream", i + 20));
  const all = [...downstream, ...upstream];
  const weight = all.reduce((a, e) => a + e.calls, 0) || 1;
  const confidence = Math.round(all.reduce((a, e) => a + e.confidence * e.calls, 0) / weight);
  const unverified = all.filter((e) => e.confidence < 70);
  s._dep = {
    downstream, upstream, all, confidence, unverified,
    band: confidence >= 85 ? "High" : confidence >= 70 ? "Adequate" : "Under-verified",
  };
  return s._dep;
}
export function depConfidence(s: ServiceRecord) {
  return depGraph(s).confidence;
}

/* ───────────────────── blast radius + EAL ───────────────────── */

export interface BlastRadius {
  scope: "WIDE" | "MODERATE" | "CONTAINED" | "UNKNOWN";
  reach: number | null;
  blocked: boolean;
  why: string;
}
export function blastRadius(s: ServiceRecord): BlastRadius {
  const reach = s.deps + reverseDepCount(s);
  const scope = reach > 18 ? "WIDE" : reach > 9 ? "MODERATE" : "CONTAINED";
  return {
    scope, reach, blocked: false,
    why: scope === "WIDE" ? `${reach} services sit inside the affected set — wide enough that autonomous action is held for approval.`
      : scope === "MODERATE" ? `${reach} services sit inside the affected set.`
        : `${reach} services sit inside the affected set — change stays local.`,
  };
}

interface WeightedInput {
  level: number;
  why: string;
}
function policyInput(s: ServiceRecord): WeightedInput {
  const caps: WeightedInput[] = [];
  caps.push({ level: s.tier === 0 ? 2 : s.tier === 1 ? 3 : 4, why: `Tier ${s.tier} policy ceiling` });
  if (s.owner === "Unassigned") caps.push({ level: 0, why: "No owning team, so no approver can be paged" });
  serviceRules(s).filter((r) => r.state === "Forbidden").forEach((r) => caps.push({ level: r.cap, why: `${r.ref} ${r.name.toLowerCase()} is forbidden` }));
  serviceRules(s).filter((r) => r.state === "Approval required").forEach((r) => caps.push({ level: r.cap, why: `${r.ref} requires named approval` }));
  return caps.reduce((a, c) => (c.level < a.level ? c : a), caps[0]);
}
function playbookInput(s: ServiceRecord): WeightedInput {
  const pbs = attachedPlaybooks(s).map(playbookByName).filter(Boolean) as PlaybookDef[];
  if (!pbs.length) return { level: 0, why: "No playbook attached, so there is nothing approved to execute" };
  const best = pbs.reduce((a, p) => (p.stage > a.stage ? p : a), pbs[0]);
  return { level: best.stage, why: `Highest attached stage comes from "${best.name}"` };
}
function riskInput(s: ServiceRecord): WeightedInput {
  const br = blastRadius(s);
  const factors: WeightedInput[] = [];
  factors.push(
    s.health === "Critical" ? { level: 1, why: "Health is critical — the classifier holds at propose-only" }
      : s.health === "Warning" ? { level: 2, why: "Health is degraded — approval required" }
        : { level: 4, why: "Health is nominal" },
  );
  if (+s.errorRate > 0.25) factors.push({ level: 2, why: `Error rate ${s.errorRate}% is above the 0.25% classifier threshold` });
  if (s.incidents >= 3) factors.push({ level: 2, why: `${s.incidents} incidents open on this service` });
  if (br.scope === "WIDE") factors.push({ level: 2, why: "Blast radius is wide" });
  const dc = depConfidence(s);
  if (dc && dc < 70) factors.push({ level: 2, why: `Dependency confidence is ${dc}% — the blast radius carries too much error margin to act unaided` });
  return factors.reduce((a, f) => (f.level < a.level ? f : a), factors[0]);
}

export interface EalResult {
  level: number;
  binding: string;
  bindingWhy: string;
  inputs: { src: string; level: number; why: string }[];
  gate: BlastRadius;
  blocked: boolean;
}
export function computeEAL(s: ServiceRecord): EalResult {
  const gate = blastRadius(s);
  const pb = playbookInput(s), po = policyInput(s), rk = riskInput(s);
  const inputs = [
    { src: "Playbook automation stage", ...pb },
    { src: "Policy maximum level", ...po },
    { src: "Risk classifier", ...rk },
  ];
  const min = inputs.reduce((a, i) => (i.level < a.level ? i : a), inputs[0]);
  const result: EalResult = {
    level: min.level, binding: min.src, bindingWhy: min.why, inputs, gate, blocked: gate.blocked,
  };
  s.eal = result;
  return result;
}
export function ealOf(s: ServiceRecord): EalResult {
  return s.eal || computeEAL(s);
}

/* ───────────────────── automation readiness score ───────────────────── */

export interface ReadinessCheck {
  key: string;
  label: string;
  weight: number;
  ok: boolean;
  why: string;
  fix: string;
}
export interface Readiness {
  score: number;
  band: "Ready" | "Conditional" | "Not ready";
  results: ReadinessCheck[];
  failing: ReadinessCheck[];
}
export function readiness(s: ServiceRecord): Readiness {
  const results: ReadinessCheck[] = [
    (() => {
      const ok = s.owner !== "Unassigned";
      return { key: "owner", label: "Owning team assigned", weight: 20, ok,
        why: ok ? "Approvals and pages route to a named team." : "Nothing can be routed, so every action is held at L0 regardless of playbook.",
        fix: "Assign owner" };
    })(),
    (() => {
      const n = attachedPlaybooks(s).length;
      const ok = n > 0;
      return { key: "playbook", label: "Playbook attached", weight: 20, ok,
        why: ok ? `${n} playbook${n === 1 ? "" : "s"} registered against this service.` : "There is no approved procedure to execute, so the playbook input pins the level to L0.",
        fix: "Attach playbook" };
    })(),
    (() => {
      const ok = serviceRules(s).length >= 5;
      return { key: "rules", label: "Operational rules bound", weight: 12, ok,
        why: ok ? "The rule set that governs whether automation may run is bound and versioned." : "Too few rules bound to evaluate a guardrail decision confidently.",
        fix: "Review rules" };
    })(),
    (() => {
      const ok = +s.availability >= 99.95;
      return { key: "slo", label: "Meeting its SLO target", weight: 14, ok,
        why: ok ? `Availability ${s.availability}% is at or above the 99.95% target.` : `Availability ${s.availability}% is below the 99.95% target — error budget is spent.`,
        fix: "Review SLO" };
    })(),
    (() => {
      const dc = depConfidence(s);
      const ok = s.deps > 0 && dc >= 70;
      return { key: "graph", label: "Dependency graph verified", weight: 14, ok,
        why: ok ? `${depGraph(s).all.length} edges mapped at ${dc}% confidence, so blast radius can be computed before any action.`
          : `Dependency confidence is ${dc}% — ${depGraph(s).unverified.length} edge${depGraph(s).unverified.length === 1 ? " is" : "s are"} declared or inferred but never observed carrying traffic.`,
        fix: "Verify dependencies" };
    })(),
    (() => {
      const ok = true;
      return { key: "verify", label: "Verification enforced", weight: 10, ok,
        why: "Blast radius and the SLA clock both run automatically on every match.", fix: "Open orchestration" };
    })(),
    (() => {
      const ok = s.health !== "Critical";
      return { key: "health", label: "No unresolved critical signals", weight: 10, ok,
        why: ok ? "No critical signal is outstanding." : "A critical signal is open, and the risk classifier holds automation at propose-only until it clears.",
        fix: "Run health scan" };
    })(),
  ];
  const score = results.filter((r) => r.ok).reduce((a, r) => a + r.weight, 0);
  const band = score >= 85 ? "Ready" : score >= 60 ? "Conditional" : "Not ready";
  return { score, band, results, failing: results.filter((r) => !r.ok) };
}
export function bandColor(band: string) {
  return band === "Ready" ? "#00C896" : band === "Conditional" ? "#B45309" : "#C2273B";
}
export function bandInk(band: string) {
  return band === "Ready" ? "text-emerald-700" : band === "Conditional" ? "text-amber-700" : "text-rose-700";
}

// Evaluate every service once at module load so the automation level is
// stored, not recomputed on the fly each time a component reads it.
SERVICES.forEach((s) => computeEAL(s));

/* ───────────────────── create service ───────────────────── */

export interface NewServiceInput {
  name: string;
  owner: string;
  tier: number;
  env: string;
  runtime: string;
  cloud: string;
  region: string;
  lang: string;
  version: string;
}
export function createService(input: NewServiceInput): ServiceRecord {
  const record: ServiceRecord = {
    id: "SRV-" + String(101 + SERVICES.length).padStart(5, "0"),
    name: input.name,
    owner: input.owner,
    tier: input.tier,
    health: "Healthy",
    env: input.env,
    runtime: input.runtime,
    cloud: input.cloud,
    region: input.region,
    lang: input.lang,
    incidents: 0,
    deps: 2,
    healthScore: 96,
    slo: 99.9,
    version: input.version || "1.0.0",
    pods: input.tier <= 1 ? 6 : 3,
    repoCount: 1,
    createdYearsAgo: 0,
    availability: "99.95",
    latency: 32,
    errorRate: "0.05",
    traffic: 500,
    cpu: 28,
    mem: 32,
    riskScore: "Low",
    deploymentConfidence: 96,
    lastIncidentWeeksAgo: 12,
  };
  SERVICES.push(record);
  computeEAL(record);
  return record;
}

export function updateService(id: string, patch: NewServiceInput): ServiceRecord | null {
  const record = SERVICES.find((s) => s.id === id);
  if (!record) return null;
  record.name = patch.name;
  record.owner = patch.owner;
  record.tier = patch.tier;
  record.env = patch.env;
  record.runtime = patch.runtime;
  record.cloud = patch.cloud;
  record.region = patch.region;
  record.lang = patch.lang;
  record.version = patch.version;
  record._dep = undefined;
  computeEAL(record);
  return record;
}

/* ───────────────────── governance evaluation ID ───────────────────── */

export function evaluationId(s: ServiceRecord): string {
  const e = ealOf(s);
  const seed = s.id + e.binding + e.level;
  let h = 0;
  for (let k = 0; k < seed.length; k++) h = (h * 31 + seed.charCodeAt(k)) >>> 0;
  return "EVAL-" + String(100000 + (h % 899999)).slice(0, 6);
}
