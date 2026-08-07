export type Health = "Healthy" | "Degraded" | "Critical";
export type Risk = "Low" | "Medium" | "High" | "Critical";
export type Compliance = "Compliant" | "Violating" | "Unknown";

export interface TableScope {
  label?: string;
  category?: string;
  health?: Health;
  compliance?: Compliance;
  lifecycle?: string;
  driftType?: string;
  name?: string;
  pred?: (a: Asset) => boolean;
}

export interface Watcher {
  name: string;
  kind: "person" | "agent";
  role: string;
}
export interface Expiry {
  date: string;
  auto: boolean;
  retentionDays: number | null;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  category: string;
  service: string;
  owner: string;
  env: string;
  region: string;
  cloud: string;
  health: Health;
  risk: Risk;
  compliance: Compliance;
  lifecycle: string;
  drift: boolean;
  driftType: string | null;
  modMins: number;
  tagged: boolean;
  createdDays: number;
  cpu: number;
  mem: number;
  restarts: number;
  errorRate: string;
  riskScore: number;
  expiresInDays?: number;
  certStatus?: "Critical" | "Warning" | "Valid";
  watchers: Watcher[];
  linkedIncidents: string[];
  expiry: Expiry | null;
  benchmarks: string[];
  violations: string[];
}

/* ───────────────────── deterministic pseudo-random ───────────────────── */

function pr(i: number, salt: number): number {
  const x = Math.sin((i + 1) * (salt + 7) * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
function slug(s: string): string {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
function hex4(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return (h % 65535).toString(16).padStart(4, "0");
}
function strseed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function prs(s: string, salt: number): number {
  const x = Math.sin(strseed(s) + salt * 97.13) * 10000;
  return x - Math.floor(x);
}
export function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
export function daysUntil(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

/* ───────────────────── constants ───────────────────── */

export const OWNERS = [
  "Platform Team", "Data Team", "Security Team", "Backend Team",
  "Infrastructure Team", "Identity Team", "Growth Team", "Internal Tools Team",
];
export const ENVIRONMENTS = ["Prod", "Staging", "Dev", "QA"];
export const CLOUDS = ["AWS", "Azure", "GCP"];
export const REGIONS = ["eu-west-1", "eu-west-2", "us-east-1", "us-west-2", "ap-southeast-1"];
export const HEALTHS: Health[] = ["Healthy", "Degraded", "Critical"];
export const RISKS: Risk[] = ["Low", "Medium", "High", "Critical"];
export const COMPLIANCE_STATES: Compliance[] = ["Compliant", "Violating", "Unknown"];
export const LIFECYCLE_STAGES = ["Provisioned", "Active", "Degraded", "Quarantined", "Deprecated", "Retiring", "Retired"];
export const COMPONENTS = [
  "payments", "checkout", "orders", "identity", "notifications", "search", "inventory", "shipping",
  "billing", "catalog", "recommendation", "fraud", "session", "reporting", "gateway", "wallet",
  "subscriptions", "invoices", "partner", "user", "feature-flags", "refund", "fulfillment", "loyalty",
  "tax", "email", "sms", "rate-limiter", "webhook", "config", "analytics", "etl", "ml-inference",
  "mobile-backend", "observability", "cache", "geolocation", "consent", "audit", "vendor-hub", "cdn",
  "batch", "cron", "admin-console", "dev-portal",
];
export const DRIFT_TYPES = [
  "Configuration mismatch", "Unauthorized resource creation", "Tagging violation", "Version skew", "Orphaned resource",
];

export interface CategoryDef {
  cat: string;
  types: string[];
  count: number;
}
export const CATEGORY_DEFS: CategoryDef[] = [
  { cat: "Compute", types: ["EC2 Instance", "VM Instance"], count: 16 },
  { cat: "Kubernetes", types: ["Pod", "Deployment", "StatefulSet", "DaemonSet", "Service", "Ingress", "ConfigMap"], count: 34 },
  { cat: "Database", types: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB Table", "Aurora Cluster"], count: 16 },
  { cat: "Storage", types: ["S3 Bucket", "Blob Container", "EBS Volume", "Persistent Volume"], count: 16 },
  { cat: "Networking", types: ["Load Balancer", "VPC", "Firewall Rule", "DNS Record", "API Gateway"], count: 16 },
  { cat: "Security", types: ["IAM Role", "IAM Policy", "IAM User", "Service Account", "Security Group"], count: 18 },
  { cat: "Certificates", types: ["TLS Certificate"], count: 12 },
  { cat: "Secrets", types: ["Vault Secret", "KMS Key", "Secrets Manager Entry"], count: 14 },
  { cat: "Serverless", types: ["Lambda Function", "Cloud Function"], count: 8 },
];

export const AGENT_ROLES: Record<string, string> = {
  "Infrastructure Agent": "Saturation, capacity, and node health",
  "Logs Agent": "Error-rate and log pattern shifts",
  "Deployment Agent": "Release verification and rollback readiness",
  "Query Agent": "Slow queries, locks, and replication lag",
  "Credential Agent": "Rotation windows and exposure signals",
};
export const COMMON_FAILURES: Record<string, string> = {
  Kubernetes: "Redis timeout", Database: "Replication lag", Compute: "CPU saturation", Storage: "Throttled writes",
  Networking: "Upstream 5xx", Security: "Permission denied", Certificates: "Expired chain", Secrets: "Stale credential",
  Serverless: "Cold-start timeout",
};

export interface Benchmark {
  id: string;
  standard: string;
  rule: string;
  appliesTo: string;
  severity: "Critical" | "High" | "Medium";
  enabled: boolean;
}
export const BENCHMARKS: Benchmark[] = [
  { id: "BM-01", standard: "PCI-DSS", rule: "Storage must be encrypted at rest", appliesTo: "Storage", severity: "Critical", enabled: true },
  { id: "BM-02", standard: "SOC2", rule: "IAM roles must not grant wildcard admin permissions", appliesTo: "Security", severity: "Critical", enabled: true },
  { id: "BM-03", standard: "PCI-DSS", rule: "Certificates must renew at least 14 days before expiry", appliesTo: "Certificates", severity: "High", enabled: true },
  { id: "BM-04", standard: "SOC2", rule: "Secrets must rotate at least every 90 days", appliesTo: "Secrets", severity: "High", enabled: true },
  { id: "BM-05", standard: "GDPR", rule: "Databases holding customer data must have encrypted backups", appliesTo: "Database", severity: "Critical", enabled: true },
  { id: "BM-06", standard: "ISO27001", rule: "Networking resources must not expose management ports publicly", appliesTo: "Networking", severity: "Critical", enabled: true },
  { id: "BM-07", standard: "ISO27001", rule: "All Prod assets must carry an owner and cost-center tag", appliesTo: "All", severity: "Medium", enabled: true },
  { id: "BM-08", standard: "SOC2", rule: "Kubernetes workloads must define resource limits", appliesTo: "Kubernetes", severity: "Medium", enabled: true },
  { id: "BM-09", standard: "PCI-DSS", rule: "Compute instances must run an approved, patched image", appliesTo: "Compute", severity: "High", enabled: true },
  { id: "BM-10", standard: "GDPR", rule: "Serverless functions must not log unmasked PII", appliesTo: "Serverless", severity: "High", enabled: false },
];
export function benchmarksFor(category: string): Benchmark[] {
  return BENCHMARKS.filter((b) => b.enabled && (b.appliesTo === category || b.appliesTo === "All"));
}

export interface PolicyDef {
  name: string;
  scope: string;
  rule: string;
  enabled: boolean;
}
export const POLICIES: PolicyDef[] = [
  { name: "Production deletion protection", scope: "All Prod assets", rule: "Forbidden without director approval", enabled: true },
  { name: "Region-based access control", scope: "IAM roles & policies", rule: "Cross-region access requires justification", enabled: true },
  { name: "Compliance enforcement — PCI-DSS", scope: "Payments-tagged assets", rule: "Unencrypted storage blocked at provision time", enabled: true },
  { name: "Agent API access control", scope: "Autonomous agents", rule: "Read-only unless playbook-scoped", enabled: true },
  { name: "Audit logging", scope: "All assets", rule: "Every change recorded with actor and reason", enabled: true },
  { name: "Untagged resource quarantine", scope: "All Prod compute", rule: "Auto-flag after 24h without required tags", enabled: false },
];

export interface CloudIncident {
  id: string;
  title: string;
  severity: "SEV-1" | "SEV-2" | "SEV-3";
  status: string;
  service: string;
}
export const INCIDENTS: CloudIncident[] = [
  { id: "INC-4021", title: "Checkout latency spike", severity: "SEV-2", status: "Investigating", service: "Checkout" },
  { id: "INC-4017", title: "IAM policy over-permission", severity: "SEV-1", status: "Mitigating", service: "Identity" },
  { id: "INC-3998", title: "Payments DB failover", severity: "SEV-2", status: "Monitoring", service: "Payments" },
  { id: "INC-3985", title: "TLS certificate near expiry", severity: "SEV-3", status: "Open", service: "Edge" },
  { id: "INC-3970", title: "S3 bucket public exposure", severity: "SEV-1", status: "Resolved", service: "User Service" },
  { id: "INC-3962", title: "Config drift across prod nodes", severity: "SEV-3", status: "Open", service: "Platform" },
];

export interface ActivityItem {
  icon: "k8s" | "db" | "cert" | "iam" | "s3";
  text: string;
  mins: number;
  jump: { name?: string; category?: string };
}
export const RECENT_ACTIVITY: ActivityItem[] = [
  { icon: "k8s", text: "New Kubernetes node added in eu-west-1", mins: 12, jump: { category: "Kubernetes" } },
  { icon: "db", text: "DB replica lag detected (payments-db)", mins: 38, jump: { name: "rds-payments-primary" } },
  { icon: "cert", text: "Certificate expiring in 3 days (api.prod.company.com)", mins: 70, jump: { name: "api.prod.company.com" } },
  { icon: "iam", text: "IAM policy modified (admin access expanded)", mins: 120, jump: { name: "iam-admin-role" } },
  { icon: "s3", text: "New S3 bucket created without encryption", mins: 260, jump: { category: "Storage" } },
];
export interface PredictiveAlert {
  text: string;
  sev: "Critical" | "High" | "Medium";
  jump: { name?: string };
}
export const PREDICTIVE_ALERTS: PredictiveAlert[] = [
  { text: "Payments cluster likely to fail within 2h", sev: "Critical", jump: { name: "payments-api-pod-7x92" } },
  { text: "Certificate expiry will cause outage risk", sev: "High", jump: { name: "api.prod.company.com" } },
  { text: "Database scaling required within 24h", sev: "Medium", jump: { name: "rds-payments-primary" } },
];
export const INITIAL_RECOMMENDATIONS = [
  "Right-size 14 over-provisioned compute instances to reduce monthly spend by an estimated 9%.",
  "Rotate 3 secrets accessed outside their normal pattern in the last 24 hours.",
  "Attach an ownership policy to 4 orphaned storage buckets before the next compliance scan.",
  "Enable autoscaling on the payments Kubernetes deployment to absorb the current CPU spike.",
];
export type AuditEntry = [string, string, string, string];
export const INITIAL_AUDIT_ENTRIES: AuditEntry[] = [
  ["2 min ago", "Owner changed", "S. Chen", "iam-admin-role"],
  ["18 min ago", "Tag added", "Automation", "s3-user-events"],
  ["1 hr ago", "Config drift remediated", "M. Alavi", "payments-api-pod-7x92"],
  ["3 hrs ago", "Lifecycle stage updated", "R. Osei", "legacy-archive-vm-02"],
  ["1 day ago", "Policy attached", "Automation", "rds-payments-primary"],
  ["2 days ago", "Secret rotated", "Security bot", "vendor-hub/kms-key-91a2"],
];

/* ───────────────────── generation ───────────────────── */

function criticalityTier(a: Pick<Asset, "env" | "service">): string {
  if (a.env !== "Prod") return a.env === "Staging" ? "Tier 2" : "Tier 3";
  return ["Payments", "Identity", "Checkout"].includes(a.service) ? "Tier 0" : "Tier 1";
}

function watchersFor(a: Asset): Watcher[] {
  const extra =
    a.category === "Database" ? "Query Agent"
    : a.category === "Secrets" || a.category === "Certificates" || a.category === "Security" ? "Credential Agent"
    : "Deployment Agent";
  return [
    { name: "Sarah Chen", kind: "person", role: "On-call · " + a.owner },
    { name: "Paschal Ifediora", kind: "person", role: "Service owner" },
    { name: "Infrastructure Agent", kind: "agent", role: AGENT_ROLES["Infrastructure Agent"] },
    { name: "Logs Agent", kind: "agent", role: AGENT_ROLES["Logs Agent"] },
    { name: extra, kind: "agent", role: AGENT_ROLES[extra] },
  ];
}

function expiryFor(a: Asset): Expiry | null {
  if (a.category === "Certificates") return { date: todayISO(20 + Math.floor(prs(a.id, 1) * 70)), auto: true, retentionDays: null };
  if (a.category === "Secrets") return { date: todayISO(30 + Math.floor(prs(a.id, 2) * 120)), auto: true, retentionDays: 30 };
  if (a.lifecycle === "Deprecated" || a.lifecycle === "Retiring") return { date: todayISO(7 + Math.floor(prs(a.id, 3) * 30)), auto: false, retentionDays: 30 };
  if (prs(a.id, 4) > 0.82) return { date: todayISO(45 + Math.floor(prs(a.id, 5) * 150)), auto: false, retentionDays: null };
  return null;
}

let assetSeq = 0;
function makeAsset(cat: string, type: string, i: number): Asset {
  const comp = COMPONENTS[Math.floor(pr(assetSeq, 1) * COMPONENTS.length)];
  const typeSlug = slug(type);
  let name: string;
  if (cat === "Kubernetes") name = `${comp}-api-${typeSlug}-${hex4(comp + i + typeSlug)}`;
  else if (cat === "Database") name = `${type.toLowerCase() === "aurora cluster" ? "aurora" : type.toLowerCase()}-${comp}-${i % 3 === 0 ? "primary" : "replica-" + i}`;
  else if (cat === "Storage") name = `${type === "S3 Bucket" ? "s3" : "blob"}-${comp}-${["events", "assets", "backups", "logs"][i % 4]}`;
  else if (cat === "Certificates") name = i === 0 ? "api.prod.company.com" : i === 1 ? "auth.service" : i === 2 ? "internal.cluster.local" : `${comp}.prod.company.com`;
  else if (cat === "Security") name = `${comp}-${typeSlug}`;
  else if (cat === "Secrets") name = `${comp}/${typeSlug}-${hex4(comp + i)}`;
  else if (cat === "Networking") name = `${comp}-${typeSlug}`;
  else if (cat === "Serverless") name = `${comp}-fn-${hex4(comp + i)}`;
  else name = `${comp}-${typeSlug}-${i}`;

  const env = ENVIRONMENTS[Math.floor(pr(assetSeq, 2) * ENVIRONMENTS.length)];
  const healthRoll = pr(assetSeq, 3);
  const health: Health = healthRoll > 0.93 ? "Critical" : healthRoll > 0.8 ? "Degraded" : "Healthy";
  const riskRoll = pr(assetSeq, 4);
  const risk: Risk =
    health === "Critical" ? (riskRoll > 0.5 ? "Critical" : "High")
    : health === "Degraded" ? (riskRoll > 0.5 ? "High" : "Medium")
    : riskRoll > 0.85 ? "Medium" : "Low";
  const complianceRoll = pr(assetSeq, 5);
  const compliance: Compliance = complianceRoll > 0.87 ? "Violating" : complianceRoll > 0.82 ? "Unknown" : "Compliant";
  const lifecycle = pr(assetSeq, 6) > 0.9 ? LIFECYCLE_STAGES[Math.floor(pr(assetSeq, 7) * LIFECYCLE_STAGES.length)] : "Active";
  const drift = pr(assetSeq, 8) > 0.72;
  const driftType = drift ? DRIFT_TYPES[Math.floor(pr(assetSeq, 9) * DRIFT_TYPES.length)] : null;
  const modMins = Math.floor(pr(assetSeq, 10) * 4000) + 1;
  const tagged = pr(assetSeq, 11) > 0.08;
  const createdDays = Math.floor(pr(assetSeq, 12) * 900) + 5;
  assetSeq++;

  const a: Asset = {
    id: "AST-" + String(100000 + assetSeq).slice(1),
    name, type, category: cat,
    service: comp.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    owner: OWNERS[Math.floor(pr(assetSeq, 13) * OWNERS.length)],
    env, region: REGIONS[Math.floor(pr(assetSeq, 14) * REGIONS.length)], cloud: CLOUDS[Math.floor(pr(assetSeq, 15) * CLOUDS.length)],
    health, risk, compliance, lifecycle, drift, driftType, modMins, tagged, createdDays,
    cpu: 20 + Math.floor(pr(assetSeq, 16) * 75), mem: 20 + Math.floor(pr(assetSeq, 17) * 75),
    restarts: health === "Critical" ? 4 + Math.floor(pr(assetSeq, 18) * 6) : Math.floor(pr(assetSeq, 18) * 2),
    errorRate: health === "Critical" ? (6 + pr(assetSeq, 19) * 10).toFixed(1) : (pr(assetSeq, 19) * 2).toFixed(1),
    riskScore:
      risk === "Critical" ? 85 + Math.floor(pr(assetSeq, 20) * 15)
      : risk === "High" ? 60 + Math.floor(pr(assetSeq, 20) * 24)
      : risk === "Medium" ? 30 + Math.floor(pr(assetSeq, 20) * 25)
      : 5 + Math.floor(pr(assetSeq, 20) * 20),
    watchers: [], linkedIncidents: [], expiry: null, benchmarks: [], violations: [],
  };
  a.watchers = watchersFor(a);
  a.expiry = expiryFor(a);
  a.benchmarks = benchmarksFor(a.category).map((b) => b.id);
  a.violations = a.compliance === "Violating" ? a.benchmarks.slice(0, Math.max(1, Math.round(a.benchmarks.length * 0.3))) : [];
  return a;
}

const CERTS_SEED = [
  { name: "api.prod.company.com", expiresInDays: 3, status: "Critical" as const },
  { name: "auth.service", expiresInDays: 21, status: "Warning" as const },
  { name: "internal.cluster.local", expiresInDays: 365, status: "Valid" as const },
];

export function generateAssets(): Asset[] {
  assetSeq = 0;
  const assets: Asset[] = [];
  CATEGORY_DEFS.forEach((def) => {
    for (let i = 0; i < def.count; i++) {
      const type = def.types[i % def.types.length];
      assets.push(makeAsset(def.cat, type, i));
    }
  });

  function findIndex(cat: string, type: string, skip?: number): number {
    let count = 0;
    for (let i = 0; i < assets.length; i++) {
      if (assets[i].category === cat && assets[i].type === type) {
        if (skip && count < skip) { count++; continue; }
        return i;
      }
    }
    for (let i = 0; i < assets.length; i++) if (assets[i].category === cat) return i;
    return 0;
  }

  Object.assign(assets[findIndex("Kubernetes", "Pod")], {
    id: "AST-100001", name: "payments-api-pod-7x92", type: "Pod", category: "Kubernetes", service: "Payments",
    owner: "Platform Team", env: "Prod", region: "eu-west-1", cloud: "AWS",
    health: "Degraded", risk: "High", compliance: "Violating", lifecycle: "Active", drift: true, driftType: "Configuration mismatch",
    modMins: 2, tagged: true, createdDays: 44, cpu: 92, mem: 78, restarts: 6, errorRate: "12.0", riskScore: 87,
  });
  const dbIdx = findIndex("Database", "PostgreSQL", 1);
  Object.assign(assets[dbIdx >= 0 ? dbIdx : findIndex("Database", "Aurora Cluster")], {
    id: "AST-100002", name: "rds-payments-primary", type: "Aurora Cluster", category: "Database", service: "Payments",
    owner: "Data Team", env: "Prod", region: "eu-west-1", cloud: "AWS",
    health: "Healthy", risk: "Medium", compliance: "Compliant", lifecycle: "Active", drift: false, driftType: null,
    modMins: 300, tagged: true, createdDays: 410,
  });
  Object.assign(assets[findIndex("Storage", "S3 Bucket")], {
    id: "AST-100003", name: "s3-user-events", type: "S3 Bucket", category: "Storage", service: "User Service",
    owner: "Backend Team", env: "Prod", region: "eu-west-2", cloud: "AWS",
    health: "Healthy", risk: "Low", compliance: "Compliant", lifecycle: "Active", drift: false, driftType: null,
    modMins: 1440, tagged: true, createdDays: 520,
  });
  Object.assign(assets[findIndex("Security", "IAM Role")], {
    id: "AST-100004", name: "iam-admin-role", type: "IAM Role", category: "Security", service: "Identity",
    owner: "Security Team", env: "Prod", region: "global", cloud: "AWS",
    health: "Critical", risk: "Critical", compliance: "Violating", lifecycle: "Active", drift: true, driftType: "Unauthorized resource creation",
    modMins: 30, tagged: true, createdDays: 900, riskScore: 96,
  });

  // re-derive watchers/benchmarks/violations for the curated overrides (fields depend on category/health/compliance)
  [findIndex("Kubernetes", "Pod"), dbIdx, findIndex("Storage", "S3 Bucket"), findIndex("Security", "IAM Role")].forEach((idx) => {
    const a = assets[idx];
    if (!a) return;
    a.watchers = watchersFor(a);
    a.benchmarks = benchmarksFor(a.category).map((b) => b.id);
    a.violations = a.compliance === "Violating" ? a.benchmarks.slice(0, Math.max(1, Math.round(a.benchmarks.length * 0.3))) : [];
    a.expiry = expiryFor(a);
  });

  const certs = assets.filter((a) => a.category === "Certificates");
  certs.forEach((a, i) => {
    const base = CERTS_SEED[i] || { name: a.name, expiresInDays: 15 + Math.floor(pr(i, 40) * 300), status: undefined };
    a.expiresInDays = base.expiresInDays;
    a.certStatus = base.status || (base.expiresInDays <= 7 ? "Critical" : base.expiresInDays <= 30 ? "Warning" : "Valid");
    if (CERTS_SEED[i]) a.name = CERTS_SEED[i].name;
  });

  return assets;
}

let externalSeq = 0;
export function createAsset(fields: {
  name: string; type: string; category: string; owner: string; env: string;
  cloud?: string; region?: string; lifecycle?: string;
}): Asset {
  externalSeq++;
  const a: Asset = {
    id: "AST-" + (900000 + externalSeq),
    name: fields.name, type: fields.type, category: fields.category,
    service: fields.name.split(/[-/]/)[0] || fields.name,
    owner: fields.owner, env: fields.env, region: fields.region || REGIONS[0], cloud: fields.cloud || CLOUDS[0],
    health: "Healthy", risk: "Low", compliance: "Unknown", lifecycle: fields.lifecycle || "Provisioned",
    drift: false, driftType: null, modMins: 0, tagged: true, createdDays: 0,
    cpu: 15, mem: 20, restarts: 0, errorRate: "0.0", riskScore: 6,
    watchers: [], linkedIncidents: [], expiry: null, benchmarks: [], violations: [],
  };
  a.watchers = watchersFor(a);
  a.benchmarks = benchmarksFor(a.category).map((b) => b.id);
  a.compliance = a.benchmarks.length ? "Compliant" : "Unknown";
  return a;
}

/* ───────────────────── helpers ───────────────────── */

export function ago(mins: number): string {
  if (mins < 60) return mins + " min ago";
  if (mins < 1440) return Math.round(mins / 60) + " hr ago";
  const days = Math.round(mins / 1440);
  return days + " day" + (days === 1 ? "" : "s") + " ago";
}
export function freshSeconds(id: string, salt: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i) + salt) >>> 0;
  return 2 + (h % 50);
}
export function fmtWindow(days: number): string {
  return days < 0 ? "Expired " + Math.abs(days) + "d ago" : "Expires in " + days + "d";
}

export interface OpsProfile {
  lastIncident: string;
  lastIncidentAge: string;
  confidence: number;
  tier: string;
  watching: string;
  incidents: number;
  commonFailure: string;
  autoResolved: number;
  knownFixes: number;
  fingerprint: string;
  fpConfidence: number;
  observed: number;
  source: string;
  upstream: number;
  downstream: number;
}
const FLAGSHIP = "AST-100001";
export function opsProfile(a: Asset): OpsProfile {
  const flag = a.id === FLAGSHIP;
  const conf =
    a.health === "Healthy" ? 96 + Math.floor(prs(a.id, 11) * 4)
    : a.health === "Degraded" ? 70 + Math.floor(prs(a.id, 11) * 15)
    : 44 + Math.floor(prs(a.id, 11) * 16);
  const total = flag ? 27 : 3 + Math.floor(prs(a.id, 12) * 40);
  const auto = flag ? 9 : Math.floor(total * (0.2 + prs(a.id, 13) * 0.4));
  const agentWatcher = a.watchers.find((w) => w.kind === "agent");
  return {
    lastIncident: flag ? "SI-2042" : "SI-" + (1200 + Math.floor(prs(a.id, 14) * 900)),
    lastIncidentAge: flag ? "9 days ago" : (2 + Math.floor(prs(a.id, 15) * 60)) + " days ago",
    confidence: flag ? 98 : conf,
    tier: criticalityTier(a),
    watching: agentWatcher ? agentWatcher.name : "Infrastructure Agent",
    incidents: total,
    commonFailure: flag ? "Redis timeout" : COMMON_FAILURES[a.category] || "Config mismatch",
    autoResolved: flag ? 9 : auto,
    knownFixes: flag ? 5 : 1 + Math.floor(prs(a.id, 16) * 6),
    fingerprint: flag ? "FP-92833" : "FP-" + (10000 + Math.floor(prs(a.id, 17) * 89999)),
    fpConfidence: flag ? 99 : 88 + Math.floor(prs(a.id, 18) * 12),
    observed: flag ? 548 : 40 + Math.floor(prs(a.id, 19) * 900),
    source: a.category === "Kubernetes" ? "Runtime discovery" : a.category === "Certificates" || a.category === "Secrets" ? "Vault sync" : "Cloud API sync",
    upstream: 2 + Math.floor(prs(a.id, 21) * 6),
    downstream: 1 + Math.floor(prs(a.id, 22) * 5),
  };
}

export function aiSummary(a: Asset): string {
  const label = a.service + " " + a.type.toLowerCase();
  const out: string[] = [];
  out.push(
    a.health === "Healthy" ? `${label} is healthy.`
    : a.health === "Degraded" ? `${label} is degraded but still serving traffic.`
    : `${label} is failing its health checks.`,
  );
  out.push(a.linkedIncidents.length ? `${a.linkedIncidents.length} incident${a.linkedIncidents.length === 1 ? "" : "s"} currently linked.` : "No active incidents.");
  out.push(a.drift ? `Drift detected: ${(a.driftType || "").toLowerCase()}.` : "Recent deployment successful.");
  if (a.expiry) {
    const d = daysUntil(a.expiry.date);
    if (d >= 0 && d <= 14) out.push(`Certificate expires in ${d} days. Recommend renewal next week.`);
    else if (d < 0) out.push("Scheduled expiry has already passed — clean-up is overdue.");
    else if (a.compliance === "Violating") out.push("Open compliance violation needs a decision before the next scan.");
    else out.push("Nothing scheduled that needs attention this week.");
  } else if (a.compliance === "Violating") {
    out.push("Open compliance violation needs a decision before the next scan.");
  } else {
    out.push("Nothing scheduled that needs attention this week.");
  }
  return out.join(" ");
}

export interface RecommendedAction {
  key: string;
  nm: string;
  note: string;
}
export function recommendedActions(a: Asset): RecommendedAction[] {
  const list: RecommendedAction[] = [];
  const expDays = a.expiry ? daysUntil(a.expiry.date) : null;
  if (a.category === "Certificates" || (expDays !== null && expDays <= 14))
    list.push({ key: "rotate-cert", nm: "Rotate certificate", note: "Issues a new certificate and pushes it to the edge" });
  if (a.category === "Kubernetes" && (a.health !== "Healthy" || a.restarts > 3))
    list.push({ key: "restart-pod", nm: "Restart pod", note: "Clears the restart loop and re-runs readiness probes" });
  if (a.drift)
    list.push({ key: "patch-version", nm: "Patch version", note: `Reconciles ${(a.driftType || "").toLowerCase()} against the declared state` });
  if (a.category === "Secrets" && a.drift)
    list.push({ key: "rotate-secret", nm: "Rotate secret", note: "Generates a new value and updates every consumer" });
  if (a.compliance === "Violating")
    list.push({ key: "review-violation", nm: "Review open violation", note: "Opens the benchmark this asset is failing" });
  if (!a.tagged)
    list.push({ key: "apply-tags", nm: "Apply governance tags", note: "Attributes this asset to an owner and cost center" });
  return list;
}
