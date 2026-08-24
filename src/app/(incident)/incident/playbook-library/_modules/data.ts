import {
  AgentDef,
  ChangeDef,
  FilterKey,
  ModuleCategory,
  ModuleDef,
  Playbook,
  PermissionDef,
  RecoveryCheckDef,
  RelatedDef,
  RuleDef,
  SearchScope,
  StageDef,
  StepDef,
  VersionDef,
} from "./types";

/** Maps a raw `/playbooks` API record onto the frontend Playbook shape. */
export function mapApiPlaybook(api: any, idx: number): Playbook {
  return {
    id: api.id ?? `PB-${String(idx + 1).padStart(4, "0")}`,
    name: api.name ?? "Unnamed Playbook",
    service: api.service ?? api.category ?? "General",
    status: api.status === "ACTIVE" ? "Active" : api.status === "DRAFT" ? "Draft" : api.status === "ARCHIVED" ? "Archived" : "Draft",
    mode: api.mode ?? "Approval required",
    success: api.successRate ?? 0,
    executed: api.executionCount ?? 0,
    priority: api.priority ?? 2,
    trigger: api.trigger ?? "Manual",
    owner: api.owner ?? api.createdBy ?? "Platform team",
    version: api.version ? `v${api.version}` : "v1.0",
    updated: api.updatedAt ? new Date(api.updatedAt).toLocaleDateString() : "—",
    env: api.environments ?? ["Production"],
    rules: api.rules ?? [],
    maxAuto: api.maxAuto ?? 3,
    rollback: api.rollback ?? false,
    approvers: api.approvers ?? ["Incident commander"],
    mttr: api.avgMttr ?? "—",
    approvalTime: api.avgApprovalTime ?? "—",
    rollbackRate: api.rollbackRate ?? "0%",
    failures: api.failureCount ?? 0,
    modules: api.modules ?? { Investigation: [], Decision: [], Execution: [], Verification: [], Knowledge: [] },
    desc: api.description ?? `Playbook for ${api.name ?? "incidents"}.`,
    incidentTypes: api.incidentTypes ?? api.tags ?? [],
    created: api.createdAt ? new Date(api.createdAt).toLocaleDateString() : "—",
  };
}

export const MODULES: ModuleDef[] = [
  { id: "M-INV-01", cat: "Investigation", name: "Evidence intake", ver: "3.2", owner: "Platform team", desc: "Collects logs, metrics, deployment records, infrastructure state, and dependency health for the affected services." },
  { id: "M-INV-02", cat: "Investigation", name: "Topology snapshot", ver: "2.0", owner: "Platform team", desc: "Captures the live service topology and dependency graph at incident time for blast radius reasoning." },
  { id: "M-INV-03", cat: "Investigation", name: "Change history sweep", ver: "1.8", owner: "SRE", desc: "Gathers recent deployments, configuration changes, feature flags, and infrastructure changes across the blast radius." },
  { id: "M-INV-04", cat: "Investigation", name: "Historical incident recall", ver: "1.4", owner: "Knowledge agent", desc: "Retrieves prior incidents with matching signal patterns and their validated resolutions." },
  { id: "M-DEC-01", cat: "Decision", name: "Signal correlation", ver: "4.1", owner: "Platform team", desc: "Correlates alerts, anomalies, and events across the signal graph to separate cause candidates from symptoms." },
  { id: "M-DEC-02", cat: "Decision", name: "Causal reconstruction", ver: "2.6", owner: "Platform team", desc: "Rebuilds the contributing event chain and ranks root cause hypotheses with supporting and dismissed signals." },
  { id: "M-DEC-03", cat: "Decision", name: "Risk scoring", ver: "3.0", owner: "SRE", desc: "Scores business impact, technical risk, execution risk, and customer impact for each candidate remediation." },
  { id: "M-DEC-04", cat: "Decision", name: "Confidence ranking", ver: "1.9", owner: "Platform team", desc: "Assigns a confidence score to the leading hypothesis and blocks execution below the governed threshold." },
  { id: "M-EXE-01", cat: "Execution", name: "Service restart", ver: "2.3", owner: "SRE", desc: "Governed rolling restart with connection draining, surge limits, and automatic halt on health regression." },
  { id: "M-EXE-02", cat: "Execution", name: "Deployment rollback", ver: "3.5", owner: "Platform team", desc: "Reverts to the last verified deployment with traffic shifting and rollback verification built in." },
  { id: "M-EXE-03", cat: "Execution", name: "Infrastructure scaling", ver: "2.1", owner: "Infrastructure", desc: "Scales compute, connection pools, or replicas within policy ceilings and cost guardrails." },
  { id: "M-EXE-04", cat: "Execution", name: "Configuration change", ver: "1.7", owner: "Platform team", desc: "Applies pre-approved configuration values with automatic revert if verification fails." },
  { id: "M-VER-01", cat: "Verification", name: "Database health verification", ver: "2.4", owner: "Platform team", desc: "Validates connection pool saturation, replication lag, query latency, and error rates after any database-adjacent action." },
  { id: "M-VER-02", cat: "Verification", name: "SLO recovery check", ver: "1.6", owner: "SRE", desc: "Confirms error budgets and latency SLOs have returned inside target over a sustained observation window." },
  { id: "M-VER-03", cat: "Verification", name: "Customer transaction probe", ver: "1.3", owner: "Payments team", desc: "Runs synthetic end-to-end business transactions to prove customer-facing recovery, not just infrastructure health." },
  { id: "M-KNO-01", cat: "Knowledge", name: "Post-incident review generator", ver: "2.2", owner: "Knowledge agent", desc: "Produces the timeline, contributing factors, lessons learned, and a draft knowledge article from the audit trail." },
  { id: "M-KNO-02", cat: "Knowledge", name: "Pattern detection", ver: "1.5", owner: "Knowledge agent", desc: "Writes learned patterns back to the platform and links related incidents and operational improvements." },
];

export const CAT_ORDER: ModuleCategory[] = [
  "Investigation",
  "Decision",
  "Execution",
  "Verification",
  "Knowledge",
];

export const CAT_DESC: Record<ModuleCategory, string> = {
  Investigation: "What evidence to collect",
  Decision: "Risk and confidence evaluation",
  Execution: "Allowed remediation actions",
  Verification: "Health checks after execution",
  Knowledge: "What to generate after resolution",
};

export const RULES: RuleDef[] = [
  { id: "OR-001", name: "P0 war room", status: "Enabled", purpose: "Create war room", detail: "Automatically provisions a governed war room when incident severity is 1 and links the playbook execution transcript to it." },
  { id: "OR-002", name: "Approval required in production", status: "Enabled", purpose: "Pause automation", detail: "Pauses playbook execution at the approval gate for any action targeting production, regardless of playbook execution mode." },
  { id: "OR-003", name: "Business hours execution window", status: "Enabled", purpose: "Delay execution", detail: "Delays non-urgent remediation to the next business hours window unless severity is 1 or 2." },
  { id: "OR-004", name: "Blast radius ceiling", status: "Enabled", purpose: "Block execution", detail: "Blocks any action whose computed blast radius exceeds three downstream services." },
  { id: "OR-005", name: "Change freeze awareness", status: "Enabled", purpose: "Block execution", detail: "Blocks all mutating actions during declared change freeze windows." },
  { id: "OR-006", name: "Data-touching actions blocked", status: "Enabled", purpose: "Block execution", detail: "Blocks any action that mutates customer data, including direct SQL, irrespective of playbook permissions." },
  { id: "OR-007", name: "Customer-impact notification", status: "Enabled", purpose: "Notify stakeholders", detail: "Notifies incident communications when customer-facing impact is detected before any remediation runs." },
  { id: "OR-008", name: "Dual approval for database actions", status: "Enabled", purpose: "Require approval", detail: "Requires both the incident commander and the platform lead to approve any database-adjacent action." },
  { id: "OR-009", name: "Maximum autonomous actions", status: "Enabled", purpose: "Limit automation", detail: "Caps the number of autonomous actions per execution." },
  { id: "OR-010", name: "Rollback verification mandatory", status: "Enabled", purpose: "Enforce verification", detail: "Requires verification modules to pass after any rollback before the incident may progress." },
  { id: "OR-011", name: "Environment allowlist", status: "Enabled", purpose: "Restrict scope", detail: "Restricts execution to the environments explicitly allowed by the playbook governance block." },
  { id: "OR-012", name: "Security review for auth services", status: "Enabled", purpose: "Require approval", detail: "Routes any action touching authentication services through security approval." },
  { id: "OR-013", name: "Cost guardrail", status: "Enabled", purpose: "Limit automation", detail: "Blocks scaling actions projected to exceed the hourly infrastructure cost ceiling." },
  { id: "OR-014", name: "Escalation on repeated failure", status: "Enabled", purpose: "Escalate", detail: "Escalates to the owning team and disables further autonomous attempts after two consecutive failed executions." },
  { id: "OR-015", name: "Infrastructure deletion blocked", status: "Enabled", purpose: "Block execution", detail: "Blocks any action that deletes infrastructure resources, regardless of playbook permissions." },
  { id: "OR-016", name: "Schema migration blocked", status: "Enabled", purpose: "Block execution", detail: "Blocks schema-altering database migrations from autonomous or semi-autonomous execution." },
  { id: "OR-017", name: "Cluster destruction forbidden", status: "Enabled", purpose: "Block execution", detail: "Permanently forbids any action that would delete or decommission a cluster. No override path." },
];

export const AGENTS: AgentDef[] = [
  { name: "Ezra", purpose: "Lead investigation agent. Narrates findings, coordinates evidence, and attributes every conclusion in the audit trail.", runtime: "42s", conf: "94%", status: "Ready" },
  { name: "Signal graph", purpose: "Correlates alerts and events across the live topology to isolate cause candidates from symptoms.", runtime: "18s", conf: "92%", status: "Ready" },
  { name: "Infrastructure agent", purpose: "Inspects compute, network, and platform-layer health across the blast radius.", runtime: "26s", conf: "90%", status: "Ready" },
  { name: "Pipeline agent", purpose: "Analyses recent deployments, CI/CD state, and change records for contributing changes.", runtime: "21s", conf: "91%", status: "Ready" },
  { name: "Knowledge agent", purpose: "Recalls matching historical incidents and generates post-resolution knowledge.", runtime: "12s", conf: "93%", status: "Ready" },
  { name: "Verification agent", purpose: "Runs recovery validation: health checks, SLOs, and synthetic customer transactions.", runtime: "3m 10s", conf: "96%", status: "Ready" },
];

export const SERVICES = [
  "Checkout",
  "Payments",
  "Authentication",
  "API gateway",
  "Infrastructure",
  "Kubernetes",
  "Database",
];
export const TRIGGERS = [
  "Manual",
  "Automatic",
  "Alert",
  "Deployment",
  "Infrastructure",
  "Schedule",
  "API",
];
export const MODES: Playbook["mode"][] = [
  "Fully autonomous",
  "Approval required",
  "Advisory only",
];
export const OWNERS = [
  "Platform team",
  "SRE",
  "Infrastructure",
  "Security",
  "Payments team",
];

const PB_SEED: [string, string][] = [
  ["Database connection recovery", "Database"],
  ["Checkout latency mitigation", "Checkout"],
  ["Payment gateway failover", "Payments"],
  ["Auth token service restart", "Authentication"],
  ["API gateway rate limit relief", "API gateway"],
  ["Kubernetes node drain and replace", "Kubernetes"],
  ["Cache invalidation storm response", "Infrastructure"],
  ["Message queue backlog drain", "Infrastructure"],
  ["Certificate expiry remediation", "Infrastructure"],
  ["DNS resolution failure response", "Infrastructure"],
  ["Deployment rollback — checkout", "Checkout"],
  ["Deployment rollback — payments", "Payments"],
  ["Read replica promotion", "Database"],
  ["Connection pool exhaustion response", "Database"],
  ["Disk saturation remediation", "Infrastructure"],
  ["Memory leak containment", "Kubernetes"],
  ["CDN origin failover", "Infrastructure"],
  ["Search index rebuild", "Infrastructure"],
  ["Webhook delivery recovery", "API gateway"],
  ["Fraud rule misfire containment", "Payments"],
  ["Session store failover", "Authentication"],
  ["Load balancer health restoration", "Infrastructure"],
  ["Pod crash loop investigation", "Kubernetes"],
  ["Ingress misconfiguration rollback", "Kubernetes"],
  ["Secrets rotation failure response", "Security"],
  ["Database failover — primary", "Database"],
  ["Slow query mitigation", "Database"],
  ["Kafka partition rebalance", "Infrastructure"],
  ["Redis eviction pressure response", "Infrastructure"],
  ["3DS provider degradation failover", "Payments"],
  ["Autoscaling misfire correction", "Kubernetes"],
  ["Feature flag rollback", "Checkout"],
  ["Schema migration halt and rollback", "Database"],
  ["Rate limiter misconfiguration fix", "API gateway"],
  ["Alert storm suppression", "Infrastructure"],
  ["Stale cache purge", "Checkout"],
  ["Container registry outage response", "Kubernetes"],
  ["Checkout dependency isolation", "Checkout"],
  ["Blue-green cutover rollback", "Kubernetes"],
];

// deterministic pseudo-random from index, so the generated dataset is stable across renders
function pr(i: number, salt: number): number {
  const x = Math.sin((i + 1) * (salt + 7) * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildModulesFor(i: number, service: string): Record<ModuleCategory, string[]> {
  const exeOptions = ["M-EXE-01", "M-EXE-02", "M-EXE-03", "M-EXE-04"];
  const exe = [
    exeOptions[Math.floor(pr(i, 17) * 4)],
    pr(i, 18) > 0.5 ? "M-EXE-01" : "M-EXE-02",
  ].filter((v, ix, a) => a.indexOf(v) === ix);
  return {
    Investigation: ["M-INV-01", "M-INV-02", pr(i, 16) > 0.5 ? "M-INV-03" : "M-INV-04"],
    Decision: ["M-DEC-01", "M-DEC-02", "M-DEC-03", "M-DEC-04"],
    Execution: exe,
    Verification: ["M-VER-02", service === "Database" ? "M-VER-01" : "M-VER-03"],
    Knowledge: ["M-KNO-01", "M-KNO-02"],
  };
}

function generatePlaybooks(): Playbook[] {
  const list = PB_SEED.map((row, i) => {
    const [name, serviceHint] = row;
    const service = SERVICES.includes(serviceHint) ? serviceHint : "Infrastructure";
    let status: Playbook["status"] = "Active";
    if ([10, 20, 25, 30].includes(i)) status = "Draft";
    if ([17, 27].includes(i)) status = "Archived";
    const modeIdx = Math.floor(pr(i, 1) * 10) < 2 ? 0 : Math.floor(pr(i, 1) * 10) < 8 ? 1 : 2;
    const mode = MODES[modeIdx];
    const success = 88 + Math.floor(pr(i, 2) * 12); // 88–99
    const executed = status === "Draft" ? 0 : 40 + Math.floor(pr(i, 3) * 760);
    const priority = 1 + Math.floor(pr(i, 4) * 4); // stored 1–4
    const trigger = TRIGGERS[Math.floor(pr(i, 5) * TRIGGERS.length)];
    const owner = OWNERS[Math.floor(pr(i, 6) * OWNERS.length)];
    const vMaj = 1 + Math.floor(pr(i, 7) * 5);
    const vMin = Math.floor(pr(i, 8) * 6);
    const daysAgo = 1 + Math.floor(pr(i, 9) * 40);
    return {
      id: "PB-" + String(101 + i).padStart(4, "0"),
      name,
      service,
      status,
      mode,
      success,
      executed,
      priority,
      trigger,
      owner,
      version: `v${vMaj}.${vMin}`,
      updated: daysAgo === 1 ? "Yesterday" : daysAgo + " days ago",
      env: ["Production", "Staging"],
      rules: RULES.slice(0, 8 + Math.floor(pr(i, 10) * 7)).map((r) => r.id),
      maxAuto: 3 + Math.floor(pr(i, 11) * 5),
      rollback: pr(i, 12) > 0.15,
      approvers: ["Incident commander", owner === "Security" ? "Security lead" : "Platform lead"],
      mttr: 12 + Math.floor(pr(i, 13) * 30) + " min",
      approvalTime: 1 + Math.floor(pr(i, 14) * 5) + " min",
      rollbackRate: 1 + Math.floor(pr(i, 15) * 5) + "%",
      failures: Math.floor((executed * (100 - success)) / 100 / 3),
      modules: buildModulesFor(i, service),
      desc: `Investigates ${name.toLowerCase().replace(" — ", " for ")}, reconstructs contributing events, validates infrastructure health, determines safe remediation, executes approved recovery actions, and verifies production stability before closure.`,
      incidentTypes: ["Automatic", "Major incident", "Service", "Infrastructure"],
      created: "2026",
    } satisfies Playbook;
  });

  // curated flagship playbook — richer profile for the top of the list
  Object.assign(list[0], {
    status: "Active",
    mode: "Approval required",
    success: 97,
    executed: 418,
    version: "v5.1",
    updated: "5 days ago",
    owner: "Platform team",
    priority: 1,
    maxAuto: 5,
    rollback: true,
    trigger: "Automatic",
    mttr: "18 min",
    approvalTime: "2 min",
    rollbackRate: "3%",
    failures: 11,
    rules: RULES.map((r) => r.id),
    approvers: ["Incident commander", "Platform lead"],
    created: "14 Feb 2026",
    incidentTypes: [
      "Manual",
      "Automatic",
      "Major incident",
      "Mother",
      "Child",
      "Infrastructure",
      "Deployment",
      "Service",
      "Configuration",
    ],
    desc: "Investigates database connection saturation, reconstructs contributing events, validates infrastructure health, determines safe remediation, executes approved recovery actions, and verifies production stability before closure.",
  } satisfies Partial<Playbook>);

  return list;
}

export const PLAYBOOKS: Playbook[] = generatePlaybooks();

export const modById = (id: string): ModuleDef | undefined =>
  MODULES.find((m) => m.id === id);
export const ruleById = (id: string): RuleDef | undefined =>
  RULES.find((r) => r.id === id);
export const usedBy = (modId: string): Playbook[] =>
  PLAYBOOKS.filter((p) => Object.values(p.modules).some((list) => list.includes(modId)));

export const pLabel = (p: number): string => "P" + (p - 1); // stored 1–4, displayed P0–P3

export interface FilterDef {
  key: FilterKey;
  label: string;
  opts: string[];
}

export const FILTER_DEFS: FilterDef[] = [
  { key: "status", label: "Status", opts: ["Active", "Draft", "Disabled", "Archived"] },
  { key: "service", label: "Service", opts: SERVICES },
  { key: "trigger", label: "Trigger", opts: TRIGGERS },
  { key: "priority", label: "Priority", opts: ["P0", "P1", "P2", "P3"] },
  { key: "mode", label: "Execution mode", opts: MODES },
  { key: "owner", label: "Owner", opts: OWNERS },
];

export function fval(p: Playbook, key: FilterKey): string {
  if (key === "priority") return pLabel(p.priority);
  return p[key];
}

export const SCOPES: SearchScope[] = [
  "Name",
  "Service",
  "Incident type",
  "Tag",
  "Operational rule",
  "AI agent",
  "Owner",
];

// ============================================================
// DETAIL VIEW — execution flow, stages, permissions, recovery,
// knowledge, versions, changes, related knowledge
// ============================================================

export const STEPS: StepDef[] = [
  { n: 1, name: "Incident created", agent: "Incident delivery", kind: "step", desc: "Incident record opened with severity, affected services, and initial signals.", mod: null },
  { n: 2, name: "Deploy AI agents", agent: "Orchestrator", kind: "step", desc: "Specialist agents are deployed against the affected services under the governed pipeline.", mod: null },
  { n: 3, name: "Collect evidence", agent: "Ezra", kind: "step", desc: "Logs, metrics, deployments, infrastructure state, and dependency health gathered.", mod: "M-INV-01" },
  { n: 4, name: "Signal correlation", agent: "Signal graph", kind: "step", desc: "Signals correlated across topology, recent changes, and historical incidents.", mod: "M-DEC-01" },
  { n: 5, name: "Causal reconstruction", agent: "Ezra", kind: "step", desc: "Contributing event chain rebuilt; root cause hypotheses ranked with confidence.", mod: "M-DEC-02" },
  { n: 6, name: "Risk assessment", agent: "Ezra", kind: "step", desc: "Business, technical, execution, and customer risk scored for each candidate action.", mod: "M-DEC-03" },
  { n: 7, name: "Operational rule validation", agent: "Governance engine", kind: "gate", desc: "Every linked operational rule is evaluated. Any failing rule pauses or blocks execution here.", mod: null },
  { n: 8, name: "Recommend action", agent: "Ezra", kind: "step", desc: "Safest remediation recommended with full supporting evidence and dismissed alternatives.", mod: "M-DEC-04" },
  { n: 9, name: "Approval", agent: "Incident commander", kind: "gate", desc: "Named approvers review the recommendation. Nothing executes in production without this gate.", mod: null },
  { n: 10, name: "Execute", agent: "Execution modules", kind: "step", desc: "Approved actions run inside execution permissions, with automatic halt on regression.", mod: "M-EXE-01" },
  { n: 11, name: "Verify recovery", agent: "Verification agent", kind: "step", desc: "Health checks, latency, error rates, business transactions, and SLO recovery validated.", mod: "M-VER-01" },
  { n: 12, name: "Update incident", agent: "Incident delivery", kind: "step", desc: "Incident record, stakeholders, and status page updated with verified outcome.", mod: null },
  { n: 13, name: "Generate knowledge", agent: "Knowledge agent", kind: "step", desc: "Post-incident review, timeline, lessons learned, and patterns written back automatically.", mod: "M-KNO-01" },
  { n: 14, name: "Close", agent: "Incident delivery", kind: "terminal", desc: "Incident closed with a complete, append-only audit trail of every decision and action.", mod: null },
];

export const STAGE_DATA: StageDef[] = [
  { n: 1, name: "Collect evidence", mod: "M-INV-01", body: "Expected inputs gathered before any reasoning begins.", chips: ["Logs", "Metrics", "Deployments", "Infrastructure", "Dependencies"] },
  { n: 2, name: "Correlate signals", mod: "M-DEC-01", body: "Signals are correlated across the live graph and recent history.", chips: ["Signal graph", "Topology", "Recent changes", "Historical incidents"] },
  { n: 3, name: "Determine root cause", mod: "M-DEC-02", body: "Hypotheses are ranked; nothing proceeds below the confidence threshold.", chips: ["Evidence ranking", "Confidence score", "Supporting signals", "Dismissed signals"] },
  { n: 4, name: "Risk analysis", mod: "M-DEC-03", body: "Every candidate action is scored across four risk dimensions.", chips: ["Business impact", "Technical risk", "Execution risk", "Customer impact"] },
  { n: 5, name: "Recommend remediation", mod: "M-DEC-04", body: "The safest action is recommended from the allowed execution modules.", chips: ["Rollback", "Restart", "Scale", "Configuration change", "Patch"] },
  { n: 6, name: "Verification", mod: "M-VER-01", body: "Recovery is proven against production signals, not assumed.", chips: ["Health checks", "Latency", "Error rate", "Business transactions", "SLO recovery"] },
];

export const PERMISSIONS: PermissionDef[] = [
  { name: "Restart service", state: "Allowed", note: "Rolling restart with connection draining" },
  { name: "Rollback deployment", state: "Allowed", note: "Last verified deployment only" },
  { name: "Scale infrastructure", state: "Allowed", note: "Within policy and cost ceilings" },
  { name: "Restart database", state: "Approval required", note: "Dual approval — OR-008" },
  { name: "Delete resources", state: "Blocked", note: "Never permitted by this playbook" },
  { name: "Run SQL", state: "Blocked", note: "Data-touching actions blocked — OR-006" },
];

export const RECOVERY: RecoveryCheckDef[] = [
  { name: "Error rate", state: "Healthy" },
  { name: "Latency", state: "Healthy" },
  { name: "Dependencies", state: "Healthy" },
  { name: "Customer transactions", state: "Recovered" },
  { name: "Health checks", state: "Passing" },
  { name: "SLO", state: "Recovered" },
];

export const KNOWLEDGE_OUT = [
  "Post-incident review",
  "Timeline",
  "Lessons learned",
  "Knowledge article",
  "Related incidents",
  "Pattern detection",
  "Operational improvements",
];

export const VERSIONS: VersionDef[] = [
  { v: "v5.1", note: "Added rollback verification", by: "Approved by Platform lead", when: "5 days ago" },
  { v: "v5.0", note: "Integrated causal reconstruction engine", by: "Approved by Platform lead", when: "3 weeks ago" },
  { v: "v4.2", note: "Raised confidence threshold for autonomous recommendation", by: "Approved by Incident commander", when: "6 weeks ago" },
  { v: "v4.0", note: "Added operational rule support", by: "Approved by Platform lead", when: "2 months ago" },
  { v: "v3.0", note: "Moved to modular composition — shared verification modules", by: "Approved by Platform lead", when: "4 months ago" },
];

export const CHANGES: ChangeDef[] = [
  { author: "Uchenna Chinka", approver: "Paschal Ifediora", date: "26 Jun 2026", reason: "Added rollback verification after post-incident review", risk: "Low" },
  { author: "David Morakinyo", approver: "Uchenna Chinka", date: "9 Jun 2026", reason: "Integrated causal reconstruction engine v2.6", risk: "Medium" },
  { author: "Sandra Ejiofor", approver: "Paschal Ifediora", date: "21 May 2026", reason: "Updated approval policy wording and notification targets", risk: "Low" },
  { author: "Uchenna Chinka", approver: "Paschal Ifediora", date: "2 Apr 2026", reason: "Linked operational rules OR-010 through OR-014", risk: "Medium" },
];

export const RELATED: RelatedDef[] = [
  { name: "Incident library", cnt: "62 linked" },
  { name: "Signal graph templates", cnt: "4" },
  { name: "Operational rules", cnt: "14" },
  { name: "Knowledge articles", cnt: "19" },
  { name: "Services", cnt: "3" },
  { name: "Runbooks", cnt: "2" },
  { name: "Architecture", cnt: "1 map" },
  { name: "Previous executions", cnt: "418" },
];

export const RESOURCE_POOL = [
  "checkout-service", "payments-api", "order-service", "inventory-service",
  "notification-service", "auth-gateway", "search-service", "shipping-service",
  "billing-service", "catalog-service", "user-service", "session-service",
  "reporting-service",
];

/** Deterministic synthetic-incident id from a seed string (stable across renders). */
export function genSI(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return "SI-" + String(100000 + (h % 899999)).slice(0, 6);
}

/** Lazily fills in governance extras (maintainers, SLA) the first time a playbook is opened. */
export function ensureGovExtras(p: Playbook): Playbook {
  if (!p.maintainers) {
    p.maintainers = [p.owner === "Platform team" ? "S. Chen" : p.owner, "M. Alavi", "R. Osei"];
  }
  if (!p.sla) {
    p.sla = { ack: "5 min", firstAction: "2 min", resolution: p.mttr || "15 min", breach: "3.2%" };
  }
  return p;
}

/** Lazily fills in scope-binding extras (match rules, matched resources) the first time a playbook is opened. */
export function ensureScope(p: Playbook): Playbook {
  if (!p.scopeRules) {
    p.scopeRules = [
      `service:${p.service.toLowerCase().replace(/\s+/g, "-")}`,
      "env:production",
      `trigger:${p.trigger.toLowerCase()}`,
    ];
  }
  if (!p.applyMode) {
    p.applyMode = p.trigger === "Manual" ? "Manual" : "Automatic";
  }
  if (!p.matchedResources) {
    const start = (p.name.length * 7) % RESOURCE_POOL.length;
    p.matchedResources = [0, 1, 2].map((i) => RESOURCE_POOL[(start + i) % RESOURCE_POOL.length]);
  }
  return p;
}
