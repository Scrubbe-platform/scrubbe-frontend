export type TemplateStatus = "Active" | "Draft" | "Archived";

export interface CategoryDef {
  name: string;
  items: string[];
}

export interface TemplateRecord {
  name: string;
  cat: string;
  agents: number;
  playbooks: number;
  rules: number;
  usage: number;
  status: TemplateStatus;
  updated: string;
}

export const CATEGORIES: CategoryDef[] = [
  { name: "Application", items: ["API Response Degradation", "High Error Rate", "Heap Memory Growth", "Thread Exhaustion", "Service Crash", "Dependency Failure", "Application Deadlock", "Cache Miss Storm", "GC Pause Spike", "Session Store Failure", "Feature Toggle Misfire"] },
  { name: "Deployment", items: ["Failed Deployment", "Canary Failure", "Rollback Failure", "Blue-Green Failure", "Feature Flag Failure", "Release Verification Failure", "Config Drift Detected", "Terraform Apply Failure", "Helm Release Failure", "Immutable Infra Mismatch"] },
  { name: "Kubernetes", items: ["CrashLoopBackOff", "Pending Pods", "Node Not Ready", "Pod Eviction", "Image Pull Failure", "Resource Starvation", "HPA Misconfiguration", "Ingress Controller Failure", "PodDisruptionBudget Violation", "Node Pool Autoscale Failure"] },
  { name: "Infrastructure", items: ["CPU Saturation", "Memory Saturation", "Disk Full", "Storage Failure", "VM Failure", "Auto Scaling Failure", "Bare Metal Failure", "Power/Cooling Event", "RAID Failure", "Backup Job Failure"] },
  { name: "Networking", items: ["DNS Resolution Delay", "Load Balancer Failure", "TLS Certificate Expiry", "Firewall Misconfiguration", "Route Failure", "Network Partition", "BGP Route Leak", "VPN Tunnel Down", "Peering Failure", "Packet Loss Spike"] },
  { name: "Database", items: ["Replication Failure", "High Query Latency", "Deadlock Detected", "Connection Pool Exhaustion", "Slow Query Surge", "Primary Failover", "Backup Restore Failure", "Index Corruption", "Lock Contention", "Schema Migration Failure"] },
  { name: "CI/CD", items: ["Pipeline Failure", "Build Failure", "Test Suite Failure", "Artifact Publish Failure", "Deployment Timeout", "Flaky Test Detected", "Build Cache Poisoning", "Runner Pool Exhaustion", "Secrets Injection Failure", "Approval Gate Stuck"] },
  { name: "Cloud", items: ["AWS Service Disruption", "Azure Resource Failure", "GCP IAM Failure", "IAM Policy Misconfiguration", "Object Storage Failure", "Quota Limit Exceeded", "Spot Instance Reclaim", "Region-Level Outage", "Multi-Cloud Sync Failure", "Cloud Billing Anomaly"] },
  { name: "Security", items: ["Secret Exposure", "Certificate Expiry", "Suspicious Authentication", "Privilege Escalation", "WAF Trigger Storm", "Ransomware Indicator", "DDoS Attack Detected", "Insider Threat Signal", "Credential Stuffing Attempt", "Malware Detection"] },
  { name: "Business Services", items: ["Payment Processing Failure", "Checkout Failure", "Email Delivery Failure", "Notification Delivery Failure", "Search Service Failure", "Refund Processing Failure", "Subscription Billing Failure", "Loyalty Program Failure", "Order Fulfillment Failure", "Inventory Sync Failure"] },
  { name: "Observability", items: ["Metric Pipeline Failure", "Log Ingestion Delay", "Tracing Gap Detected", "Alert Storm", "Dashboard Data Staleness", "Synthetic Monitor Failure", "Blackbox Probe Failure", "Metric Cardinality Explosion", "APM Agent Crash", "SLO Burn Rate Alert"] },
  { name: "Messaging & Streaming", items: ["Kafka Consumer Lag", "Queue Backlog Growth", "Dead Letter Queue Overflow", "Broker Node Failure", "Event Duplication Detected", "Schema Registry Failure", "Message Ordering Violation", "Topic Partition Imbalance", "Pub/Sub Delivery Failure", "Stream Processing Lag"] },
  { name: "Data Platform", items: ["ETL Job Failure", "Data Quality Violation", "Schema Drift Detected", "Late Arriving Data", "Duplicate Record Surge", "Warehouse Load Failure", "ETL Timeout", "Data Lake Corruption", "Reverse ETL Failure", "Batch Job Stuck"] },
  { name: "Machine Learning Ops", items: ["Model Drift Detected", "Inference Latency Spike", "Training Job Failure", "Feature Store Outage", "Model Rollback Required", "GPU Node Failure", "Embedding Pipeline Failure", "Prediction Accuracy Drop", "Model Serving Crash", "Data Labeling Pipeline Failure"] },
  { name: "Identity & Access", items: ["SSO Provider Outage", "MFA Service Failure", "Token Expiry Storm", "Directory Sync Failure", "Session Hijack Alert", "OAuth Callback Failure", "Password Reset Storm", "Account Lockout Spike", "Federation Trust Failure", "User Provisioning Failure"] },
  { name: "CDN & Edge", items: ["Cache Purge Failure", "Edge Node Outage", "Origin Shield Failure", "Edge TLS Handshake Failure", "Bot Traffic Surge", "Edge Function Crash", "Static Asset Error Spike", "Geo Routing Failure", "Edge WAF False Positive Surge", "Edge Config Rollout Failure"] },
  { name: "Mobile & Client", items: ["App Crash Rate Spike", "Push Notification Failure", "App Store Release Rollback", "SDK Version Incompatibility", "Client-Side Error Surge", "Offline Sync Failure", "In-App Purchase Failure", "App Startup Regression", "Deep Link Failure", "Client Certificate Expiry"] },
  { name: "Compliance & Audit", items: ["Data Retention Violation", "PII Exposure Alert", "Access Review Overdue", "Key Rotation Failure", "Regulatory Reporting Failure", "Audit Log Gap Detected", "Consent Management Failure", "Data Residency Violation", "Vendor Compliance Alert", "Policy Drift Detected"] },
  { name: "Third-Party & Vendor", items: ["Payment Processor Outage", "SaaS Vendor Outage", "Email Provider Failure", "SMS Gateway Failure", "Geolocation API Failure", "Analytics Vendor Outage", "CRM Integration Failure", "Shipping Carrier API Failure", "Tax Service Failure", "Fraud Detection Vendor Failure"] },
  { name: "Cache & Storage", items: ["Redis Cluster Failover", "Cache Eviction Storm", "Object Storage Latency Spike", "Storage Capacity Exhaustion", "Snapshot Failure", "Cold Storage Retrieval Failure", "Cache Stampede", "File System Corruption", "Volume Mount Failure", "Storage Replication Lag"] },
];

const FLAGSHIP_TEMPLATES: TemplateRecord[] = [
  { name: "Deployment Failure", cat: "Deployment", agents: 8, playbooks: 6, rules: 14, usage: 184, status: "Active", updated: "2 hrs ago" },
  { name: "Kubernetes CrashLoop", cat: "Kubernetes", agents: 10, playbooks: 5, rules: 17, usage: 156, status: "Active", updated: "yesterday" },
  { name: "Database Latency", cat: "Database", agents: 7, playbooks: 5, rules: 10, usage: 142, status: "Active", updated: "today" },
  { name: "Payment Gateway Failure", cat: "Business Services", agents: 9, playbooks: 8, rules: 15, usage: 203, status: "Active", updated: "yesterday" },
  { name: "API Latency", cat: "Application", agents: 6, playbooks: 5, rules: 11, usage: 98, status: "Active", updated: "4 days ago" },
  { name: "Authentication Failure", cat: "Identity & Access", agents: 8, playbooks: 6, rules: 12, usage: 127, status: "Active", updated: "today" },
  { name: "DNS Failure", cat: "Networking", agents: 9, playbooks: 5, rules: 13, usage: 64, status: "Active", updated: "6 days ago" },
  { name: "Memory Leak", cat: "Application", agents: 7, playbooks: 5, rules: 8, usage: 31, status: "Draft", updated: "today" },
];

/** Seeded RNG so generated stats stay stable across reloads. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260704);

export const UPDATED_POOL = [
  "just now", "1 hr ago", "2 hrs ago", "5 hrs ago", "today", "yesterday",
  "2 days ago", "3 days ago", "4 days ago", "6 days ago", "1 week ago", "2 weeks ago",
];
export const RECENCY_RANK: Record<string, number> = {
  "just now": 0, "1 hr ago": 1, "2 hrs ago": 2, "5 hrs ago": 5, today: 3,
  yesterday: 24, "2 days ago": 48, "3 days ago": 72, "4 days ago": 96,
  "6 days ago": 144, "1 week ago": 168, "2 weeks ago": 336,
};

const flagshipNames = new Set(FLAGSHIP_TEMPLATES.map((t) => t.name));
const generatedTemplates: TemplateRecord[] = [];
CATEGORIES.forEach((cat) => {
  cat.items.forEach((item) => {
    if (flagshipNames.has(item)) return;
    const r = rand();
    let status: TemplateStatus = "Active";
    if (r > 0.93) status = "Archived";
    else if (r > 0.85) status = "Draft";
    generatedTemplates.push({
      name: item,
      cat: cat.name,
      agents: 4 + Math.floor(rand() * 7),
      playbooks: 3 + Math.floor(rand() * 6),
      rules: 5 + Math.floor(rand() * 13),
      usage: status === "Archived" ? Math.floor(rand() * 15) : 5 + Math.floor(rand() * 210),
      status,
      updated: UPDATED_POOL[Math.floor(rand() * UPDATED_POOL.length)],
    });
  });
});

export const TEMPLATES: TemplateRecord[] = [...FLAGSHIP_TEMPLATES, ...generatedTemplates];

export interface TemplateMetrics {
  total: number;
  active: number;
  draft: number;
  archived: number;
  usage30: number;
  mostUsed: TemplateRecord;
}

export function computeMetrics(templates: TemplateRecord[]): TemplateMetrics {
  const total = templates.length;
  const active = templates.filter((t) => t.status === "Active").length;
  const draft = templates.filter((t) => t.status === "Draft").length;
  const archived = templates.filter((t) => t.status === "Archived").length;
  const usage30 = templates.reduce((s, t) => s + t.usage, 0);
  const mostUsed = templates.reduce((a, b) => (b.usage > a.usage ? b : a), templates[0]);
  return { total, active, draft, archived, usage30, mostUsed };
}

export function recentlyUpdated(templates: TemplateRecord[], count = 5): TemplateRecord[] {
  return [...templates]
    .sort((a, b) => (RECENCY_RANK[a.updated] ?? 999) - (RECENCY_RANK[b.updated] ?? 999))
    .slice(0, count);
}

export const USAGE_SPARKLINE_PATH =
  "M0 20 L15 20 L22 8 L30 24 L40 4 L50 18 L60 12 L72 20 L85 6 L98 16 L110 10 L125 18 L140 14";

/* ───────────────────── Triggers & Agents ───────────────────── */

export const BASE_TRIGGERS: [string, boolean][] = [
  ["Deployment failed", true],
  ["Deployment timeout", true],
  ["Health checks failed", true],
  ["Error rate spike", true],
  ["Rollback initiated", true],
  ["Pipeline completed with failures", true],
  ["Manual trigger", false],
  ["Webhook trigger", true],
  ["API trigger", true],
  ["Signal Graph trigger", true],
];

export const AGENT_SEQUENCE = [
  "Deployment Agent", "Git Agent", "Pipeline Agent", "Logs Agent", "Signal Graph Agent",
  "Infrastructure Agent", "Kubernetes Agent", "Verification Agent", "Root Cause Agent", "Recommendation Agent",
];

export type RuleValue = "yes" | "no" | "forbidden" | string;
export const OPERATIONAL_RULES: [string, RuleValue][] = [
  ["Rollback allowed", "yes"],
  ["Restart pods", "yes"],
  ["Infrastructure deletion", "no"],
  ["Database schema changes", "no"],
  ["Destroy cluster", "forbidden"],
  ["Human approval required", "yes"],
  ["Maximum autonomous actions", "3"],
];

/* ───────────────────── Signals & Objectives ───────────────────── */

export const SIGNAL_PRIORITIES = [
  "Deployment Metadata", "Git Commits", "CI/CD Pipeline", "Application Logs", "Metrics",
  "Alerts", "Dependency Graph", "Pod Health", "Container Events", "Tracing", "Feature Flags",
];

export const INVESTIGATION_OBJECTIVES = [
  "Identify deployment", "Determine code change", "Correlate failing services",
  "Locate first unhealthy component", "Determine blast radius",
  "Evaluate rollback feasibility", "Recommend safest remediation",
];

/* ───────────────────── Playbooks & Rules ───────────────────── */

export const PLAYBOOK_LIST = [
  "Rollback Deployment", "Pause Rollout", "Restart Pods", "Recreate Deployment", "Scale ReplicaSet",
  "Drain Node", "Restart Service", "Redeploy Previous Version", "Run Verification", "Notify Stakeholders",
];

/* ───────────────────── Policy & Verification ───────────────────── */

export const POLICY_ENGINE: [string, string, "yes" | "no" | undefined][] = [
  ["Approval level", "Eng. Manager", undefined],
  ["Required evidence", "Deployment logs", undefined],
  ["Verification", "Mandatory", "yes"],
  ["Business hours restriction", "Disabled", "no"],
  ["Maintenance window", "Required", "yes"],
  ["Compliance policies", "Enabled", "yes"],
];

export const VERIFICATION_REQUIREMENTS = [
  "Deployment healthy", "Error rate normalized", "Latency recovered", "Pods healthy",
  "Traffic stable", "Synthetic tests passed", "Customer impact ended", "Root cause documented",
];

/* ───────────────────── Governance ───────────────────── */

export interface RolePermission {
  role: string;
  edit: boolean;
  approve: boolean;
  publish: boolean;
}
export const ROLE_PERMISSIONS: RolePermission[] = [
  { role: "Owner", edit: true, approve: true, publish: true },
  { role: "Maintainer", edit: true, approve: true, publish: false },
  { role: "Contributor", edit: true, approve: false, publish: false },
  { role: "Viewer", edit: false, approve: false, publish: false },
];

export const SLA_ESCALATION: [string, string, "yes" | undefined][] = [
  ["Time to acknowledge", "5 min", undefined],
  ["Time to first automated action", "2 min", undefined],
  ["Resolution target", "15 min", undefined],
  ["SLA breach rate (30d)", "3.2%", "yes"],
  ["Auto-escalate on violation", "Yes", "yes"],
];

export const ESCALATION_PATH = [
  "On-call engineer · 0 min",
  "Team Lead · 10 min unresolved",
  "Engineering Manager · 20 min unresolved",
  "Director of SRE · 30 min unresolved",
];

export type FreezeStatus = "active" | "upcoming" | "passed";
export const CHANGE_FREEZES: [string, string, FreezeStatus][] = [
  ["Quarter-End Freeze", "Mar 28 – Mar 31", "upcoming"],
  ["Black Friday Freeze", "Nov 24 – Nov 30", "active"],
  ["Holiday Code Freeze", "Dec 20 – Jan 2", "passed"],
];

/* ───────────────────── Timeline & Integrations ───────────────────── */

export const TIMELINE_EVENTS = [
  "Deployment started", "Pipeline started", "Tests completed", "Deployment completed",
  "Health checks run", "Rollback executed", "Recovery confirmed", "Verification passed", "Incident closed",
];

export const CONNECTED_INTEGRATIONS = [
  "GitHub", "GitLab", "Jenkins", "Azure DevOps", "ArgoCD", "FluxCD", "Datadog",
  "Grafana", "Prometheus", "PagerDuty", "AWS", "Azure", "GCP", "Slack", "MS Teams",
];

/* ───────────────────── Simulation & Analytics ───────────────────── */

export const HISTORICAL_INCIDENTS = [
  { value: "SI-042871", label: "SI-042871 — checkout-service rollout, Jun 2" },
  { value: "SI-042755", label: "SI-042755 — payments-api canary, May 27" },
  { value: "SI-042690", label: "SI-042690 — auth-gateway rollback, May 19" },
];

export const SIM_EXECUTION_TIMELINE = [
  "Signals ingested · 0.4s",
  "Agents dispatched (10, parallel) · 1.1s",
  "Root cause candidates ranked · 2.8s",
  "Rollback recommended · policy check passed",
];

export const SIM_REPLAY_TIMELINE = [
  "Historical signals replayed · 0.3s",
  "Agents re-dispatched against original conditions · 1.0s",
  "Outcome matched production decision · rollback",
  "No drift detected between then and now",
];

export const ANALYTICS_30D: [string, string, "yes" | undefined][] = [
  ["Times used", "184", undefined],
  ["Avg. investigation time", "2m 51s", undefined],
  ["Avg. resolution time", "6m 12s", undefined],
  ["Automation success", "91%", "yes"],
  ["Rollback success", "97%", "yes"],
  ["False positives", "2.1%", undefined],
  ["Approval rate", "88%", "yes"],
  ["Avg. MTTR reduction", "41%", "yes"],
];

export const COST_ROI: [string, string, "yes" | undefined][] = [
  ["Avg. cost — manual response", "$420 / incident", undefined],
  ["Avg. cost — automated response", "$38 / incident", "yes"],
  ["Engineer-hours saved (30d)", "58 hrs", undefined],
  ["Monthly savings", "$14,200", "yes"],
  ["Cumulative savings (YTD)", "$102,400", "yes"],
];

export const OUTCOME_COMPARISON = {
  automated: [
    ["MTTR", "3m 40s"],
    ["Human actions required", "1 (approval)"],
    ["Policy violations", "0"],
    ["Customer impact window", "4m 02s"],
  ] as [string, string][],
  manual: [
    ["MTTR", "26m 15s"],
    ["Human actions required", "7"],
    ["Policy violations", "1"],
    ["Customer impact window", "24m 50s"],
  ] as [string, string][],
};

/* ───────────────────── Versions & Audit ───────────────────── */

export interface VersionEntry {
  version: string;
  current?: boolean;
  changes: string[];
}
export const VERSION_HISTORY: VersionEntry[] = [
  {
    version: "v5.1",
    current: true,
    changes: ["Updated playbooks", "Added Verification Agent", "Added feature-flag analysis", "Updated policies"],
  },
  { version: "v5.0", changes: ["Added Kubernetes Agent", "Changed approval workflow"] },
  { version: "v4.7", changes: ["Initial production release"] },
];

export const AUDIT_ENTRIES: [string, string, string][] = [
  ["2h ago", "S. Chen", "Published version 5.1"],
  ["1d ago", "M. Alavi", "Added Verification Agent"],
  ["3d ago", "Automation", "Simulation executed against SI-042871 — score 94"],
  ["5d ago", "S. Chen", "Modified approval policy"],
  ["9d ago", "R. Osei", "Updated playbook: Rollback Deployment"],
];

/* ───────────────────── Dependencies ───────────────────── */

export function relatedTemplates(t: TemplateRecord, all: TemplateRecord[]) {
  return all.filter((x) => x.cat === t.cat && x.name !== t.name);
}

export function sharedAgentTemplates(t: TemplateRecord, all: TemplateRecord[]) {
  const others = all.filter((x) => x.name !== t.name);
  const start = (t.agents || 6) % Math.max(1, others.length);
  return others.slice(start, start + 4);
}

/* ───────────────────── Overview ───────────────────── */

export const SUCCESS_CRITERIA = [
  "Error rate falls below threshold",
  "Latency recovers to baseline",
  "Availability restored",
  "Deployment reports healthy",
  "Customer impact resolved",
  "Verification passes",
];

export const AT_A_GLANCE: [string, string, "danger" | undefined][] = [
  ["Execution mode", "Parallel", undefined],
  ["Priority", "Critical", "danger"],
  ["Approval level", "Eng. Manager", undefined],
  ["Max autonomous actions", "3", undefined],
  ["Maintenance window", "Required", undefined],
  ["Connected systems", "15", undefined],
];

export const RESOURCE_POOL = [
  "checkout-service", "payments-api", "order-service", "inventory-service", "notification-service",
  "auth-gateway", "search-service", "shipping-service", "billing-service", "catalog-service",
  "user-service", "recommendation-engine", "fraud-service", "session-service", "reporting-service",
];

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

export function scopeDefaultsFor(t: TemplateRecord) {
  const slug = t.cat.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const start = hashSeed(t.name) % RESOURCE_POOL.length;
  return {
    scopeRules: [`team:${slug}`, "env:production", "service:*"],
    matchedResources: [0, 1, 2, 3, 4].map((i) => RESOURCE_POOL[(start + i) % RESOURCE_POOL.length]),
  };
}

export interface LinkedIncident {
  id: string;
  title: string;
  when: string;
  status: string;
}

export function linkedIncidentsFor(t: TemplateRecord): LinkedIncident[] {
  const seed = hashSeed(t.name);
  const statuses = ["Resolved · automated", "Resolved · automated", "Resolved · approved rollback"];
  const whens = ["yesterday", "2 days ago", "3 days ago"];
  return [0, 1, 2].map((i) => ({
    id: `SI-${100000 + ((seed + i * 7919) % 899999)}`,
    title: t.name,
    when: whens[i],
    status: statuses[i],
  }));
}
