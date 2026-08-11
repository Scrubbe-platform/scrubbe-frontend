/* eslint-disable @typescript-eslint/no-explicit-any */

export type Priority = "P0" | "P1" | "P2";
export type Risk = "high" | "medium" | "low";

export interface Incident {
  id: string;
  title: string;
  priority: Priority;
  env: string;
  service: string;
  stage: string;
  open: boolean;
  rootCause: string;
  confidence: number;
  confReasons: string[];
  deployment: { id: string; change: string; released: string; correlated: string };
  sla: { target: string; elapsed: string; remaining: string; risk: Risk };
  commander: string;
  techLead: string;
  comms: string;
  warParticipants: number;
  warActive: boolean;
  warNotes: string[];
  qScore: number;
  qMissing: string[];
  similarCount: number;
  similar: { id: string; title: string; score: number; ago: string; resolution: string[] }[];
  playbook: { name: string; confidence: number };
  causal: string[];
  rollback: { downtime: string; rule: string };
  execImpact: string;
}

export interface Service {
  name: string;
  health: string;
  owner: string;
  em: string;
  slack: string;
  pager: string;
  deps: number;
}

export const INCIDENTS: Record<string, Incident> = {
  "SI-92837": {
    id: "SI-92837", title: "Checkout Failure", priority: "P0", env: "Production", service: "Checkout", stage: "Mitigating", open: true,
    rootCause: "Redis memory exhaustion", confidence: 96,
    confReasons: ["Deployment correlation", "Historical similarity", "Shared infrastructure", "Signal Graph confidence", "Operational Memory match"],
    deployment: { id: "#4293", change: "CHG-00218", released: "42 min ago", correlated: "Yes · 96%" },
    sla: { target: "≤ 60 min", elapsed: "42 min", remaining: "18 minutes", risk: "high" },
    commander: "Sarah Jones", techLead: "Daniel Lee", comms: "Emma White", warParticipants: 18, warActive: true,
    warNotes: ["Root cause identified · Redis memory exhaustion", "Rollback of #4293 proposed, awaiting approval", "Comms drafting customer update"],
    qScore: 91, qMissing: ["Customer Impact", "Business Impact", "Affected Assets"],
    similarCount: 14, similar: [{ id: "SI-72382", title: "Redis Saturation", score: 93, ago: "5 months ago", resolution: ["Restart Redis", "Update connection pool"] }],
    playbook: { name: "Redis Recovery", confidence: 93 },
    causal: ["Deployment #4293 released", "Redis memory saturation", "API latency climbs", "Checkout requests fail", "Payment errors", "Customer impact"],
    rollback: { downtime: "38 seconds", rule: "Requires Emergency Approval" },
    execImpact: "Checkout unavailable ~26 min, partial payment failures",
  },
  "SI-92840": {
    id: "SI-92840", title: "Payments Latency", priority: "P1", env: "Production", service: "Payments", stage: "Investigating", open: true,
    rootCause: "Token service saturation", confidence: 88,
    confReasons: ["Latency correlation", "Dependency saturation", "Shared timeline", "Signal Graph confidence"],
    deployment: { id: "#5117", change: "CHG-00231", released: "1h 10m ago", correlated: "Yes · 88%" },
    sla: { target: "≤ 120 min", elapsed: "1h 10m", remaining: "50 minutes", risk: "medium" },
    commander: "Marcus Reid", techLead: "Priya Nair", comms: "Emma White", warParticipants: 9, warActive: true,
    warNotes: ["Token service latency spiking on the auth path", "Scale-out proposed", "Watching payment retry rate"],
    qScore: 78, qMissing: ["Affected Assets", "Customer Impact"],
    similarCount: 8, similar: [{ id: "SI-70120", title: "Token Timeout Storm", score: 84, ago: "7 months ago", resolution: ["Scale token service", "Warm session cache"] }],
    playbook: { name: "Token Service Scale-out", confidence: 81 },
    causal: ["Deployment #5117 released", "Token service saturation", "Auth timeouts", "Payment retries", "Customer impact"],
    rollback: { downtime: "22 seconds", rule: "Requires Change Validation" },
    execImpact: "Payment latency elevated, ~3% checkout retries",
  },
  "SI-92815": {
    id: "SI-92815", title: "Login Errors", priority: "P2", env: "Production", service: "Authentication", stage: "Monitoring", open: true,
    rootCause: "Certificate rotation lag", confidence: 72,
    confReasons: ["Certificate timeline match", "Handshake failure pattern"],
    deployment: { id: "#2044", change: "CHG-00209", released: "3h ago", correlated: "Yes · 72%" },
    sla: { target: "≤ 240 min", elapsed: "3h", remaining: "1h 0m", risk: "low" },
    commander: "Nadia Osei", techLead: "Tom Vance", comms: "—", warParticipants: 4, warActive: false,
    warNotes: [],
    qScore: 69, qMissing: ["Business Impact"],
    similarCount: 5, similar: [{ id: "SI-64010", title: "Cert Expiry Outage", score: 79, ago: "1 year ago", resolution: ["Reissue certificate", "Automate renewal"] }],
    playbook: { name: "Certificate Recovery", confidence: 74 },
    causal: ["Certificate rotation lag", "TLS handshake failures", "Login errors", "User friction"],
    rollback: { downtime: "15 seconds", rule: "Requires Change Validation" },
    execImpact: "Intermittent login failures for a subset of users",
  },
};

export const SERVICES: Record<string, Service> = {
  Checkout: { name: "Checkout", health: "Healthy", owner: "Payments Platform Team", em: "Sarah Jones", slack: "#payments-platform", pager: "Payments Primary", deps: 12 },
  Payments: { name: "Payments", health: "Degraded", owner: "Payments Platform Team", em: "Marcus Reid", slack: "#payments-platform", pager: "Payments Primary", deps: 9 },
  Authentication: { name: "Authentication", health: "Healthy", owner: "Identity Team", em: "Nadia Osei", slack: "#identity", pager: "Identity Primary", deps: 7 },
  "API Gateway": { name: "API Gateway", health: "Healthy", owner: "Platform Team", em: "Tom Vance", slack: "#platform-core", pager: "Platform Primary", deps: 20 },
};

export const openIncidentIds = () => Object.keys(INCIDENTS).filter((id) => INCIDENTS[id].open);

function mapPriority(severity: string): Priority {
  const s = (severity ?? "").toUpperCase();
  if (s === "P0" || s === "CRITICAL") return "P0";
  if (s === "P1" || s === "HIGH") return "P1";
  return "P2";
}

function mapStage(status: string): string {
  const s = (status ?? "").toUpperCase();
  if (s === "INVESTIGATING") return "Investigating";
  if (s === "MITIGATED" || s === "MONITORING") return "Monitoring";
  if (s === "RESOLVED" || s === "CLOSED") return "Resolved";
  return "Investigating";
}

export function loadIncidentsFromApi(list: any[]) {
  const openOnly = list.filter((inc) => {
    const s = (inc.status ?? "").toUpperCase();
    return s !== "RESOLVED" && s !== "CLOSED";
  });
  const newEntries: Record<string, Incident> = {};
  openOnly.forEach((inc: any) => {
    const id = inc.ticketId ?? inc.id;
    newEntries[id] = {
      id,
      title: inc.title ?? inc.summary ?? "Untitled incident",
      priority: mapPriority(inc.severity),
      env: inc.environment ?? "Production",
      service: inc.affectedSystem ?? inc.service ?? "Unknown",
      stage: mapStage(inc.status),
      open: true,
      rootCause: inc.rootCause ?? inc.summary ?? "Under investigation",
      confidence: inc.confidence ?? 80,
      confReasons: inc.confReasons ?? ["Signal correlation", "Incident history"],
      deployment: { id: inc.deploymentId ?? "—", change: inc.changeId ?? "—", released: inc.deployedAt ? new Date(inc.deployedAt).toLocaleTimeString() : "—", correlated: inc.deploymentCorrelated ? "Yes" : "No" },
      sla: { target: inc.slaTarget ?? "—", elapsed: "—", remaining: "—", risk: "medium" },
      commander: inc.commander ?? inc.assignedTo ?? "On-call",
      techLead: inc.techLead ?? "On-call",
      comms: inc.commsLead ?? "—",
      warParticipants: inc.warParticipants ?? 0,
      warActive: inc.warRoomActive ?? false,
      warNotes: inc.warNotes ?? [],
      qScore: inc.qualityScore ?? 75,
      qMissing: inc.qualityMissing ?? [],
      similarCount: inc.similarCount ?? 0,
      similar: inc.similar ?? [],
      playbook: { name: inc.playbookName ?? "Default Response", confidence: inc.playbookConfidence ?? 80 },
      causal: inc.causalChain ?? [],
      rollback: { downtime: inc.rollbackDowntime ?? "—", rule: inc.rollbackRule ?? "Requires approval" },
      execImpact: inc.executionImpact ?? inc.description ?? "Impact under assessment",
    };
  });
  if (Object.keys(newEntries).length > 0) {
    // Clear existing and load new
    Object.keys(INCIDENTS).forEach((k) => delete INCIDENTS[k]);
    Object.assign(INCIDENTS, newEntries);
  }
}

export function incidentFromText(text: string): string | null {
  const t = text.toLowerCase();
  const m = t.match(/si[-\s]?(\d{4,6})/);
  if (m) {
    const id = "SI-" + m[1];
    if (INCIDENTS[id]) return id;
  }
  // Try to match against real loaded incidents
  for (const id of Object.keys(INCIDENTS)) {
    const inc = INCIDENTS[id];
    if (inc.service && t.includes(inc.service.toLowerCase())) return id;
    if (inc.title && t.includes(inc.title.toLowerCase().split(" ")[0])) return id;
  }
  if (t.includes("checkout")) return Object.keys(INCIDENTS)[0] ?? "SI-92837";
  if (t.includes("payment")) return Object.keys(INCIDENTS)[1] ?? "SI-92840";
  if (t.includes("login") || t.includes("auth")) return Object.keys(INCIDENTS)[2] ?? "SI-92815";
  return null;
}

export function serviceFromText(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes("checkout")) return "Checkout";
  if (t.includes("payment")) return "Payments";
  if (t.includes("auth") || t.includes("login") || t.includes("identity")) return "Authentication";
  if (t.includes("gateway")) return "API Gateway";
  return null;
}

export interface AuditEntry {
  actor: string;
  action: string;
  result: string;
  when: string;
}

export const USER = "Daniel Okafor";

export const INITIAL_AUDIT: AuditEntry[] = [
  { actor: "System", action: "War room created for SI-92837", result: "Allowed", when: "today · 11:58" },
  { actor: USER, action: "Requested production credentials", result: "Denied · Secrets Policy", when: "yesterday · 16:20" },
  { actor: "David Okafor", action: "Viewed incident SI-92840", result: "Allowed", when: "yesterday · 09:41" },
  { actor: "Sarah Jones", action: "Approved emergency rollback EA-1180", result: "Allowed", when: "2 days ago" },
];

export interface NBItem {
  label: string;
  send: string;
  meta?: string;
  urgent?: boolean;
}

export const NB: Record<string, NBItem> = {
  quality: { label: "Review incident quality", meta: "quality", send: "Review incident quality" },
  similar: { label: "Have we seen this before?", send: "Have we seen this before?" },
  sla: { label: "Check SLA breach risk", meta: "SLA", urgent: true, send: "Will the SLA breach?" },
  warroom: { label: "Summarize the war room", send: "Summarize the war room" },
  exec: { label: "Generate executive update", send: "Generate executive summary" },
  playbook: { label: "Open recommended playbook", send: "Show the recommended playbook" },
  rollbackAsk: { label: "Should I roll back?", send: "Should I roll back?" },
  rollbackDo: { label: "Roll back the deployment", send: "Roll back the deployment" },
  rootcause: { label: "Explain the root cause", send: "Explain the root cause" },
  deploy: { label: "Show the deployment", send: "Show the deployment" },
  owner: { label: "Who owns this service?", send: "Who owns this service?" },
  handler: { label: "Who's handling this incident?", send: "Who is handling this incident?" },
  confidence: { label: "What's the confidence score?", send: "What's the confidence score?" },
  health: { label: "Platform health review", send: "Give me a platform health review" },
  rules: { label: "Review active operational rules", send: "Which operational rules are active?" },
  export: { label: "Export this conversation", send: "Export this to the incident record" },
  auditNB: { label: "Show the audit trail", send: "Show the audit trail" },
};

export const BASE_SUGGESTIONS = [
  "What's the confidence score?",
  "Who is handling the incident?",
  "Should I roll back?",
  "Review incident quality",
  "Have we seen this before?",
  "Which operational rules are active?",
];

export interface PromptGroup {
  cat: string;
  items: string[];
}

export const PROMPT_LIBRARY: PromptGroup[] = [
  { cat: "Investigate", items: ["Why is Checkout failing?", "What's the confidence score?", "Show the deployment", "Explain the root cause"] },
  { cat: "Incident response", items: ["Who is handling the incident?", "Review incident quality", "Summarize the war room", "Will the SLA breach?"] },
  { cat: "Governance & access", items: ["Which operational rules are active?", "Show me AWS production credentials", "Who approved the last rollback?", "Show the audit trail"] },
  { cat: "Operational memory", items: ["Have we seen this before?", "Show the recommended playbook"] },
  { cat: "Reporting", items: ["Generate executive summary", "Export this to the incident record"] },
];

export const GOV_PROMPTS = new Set(["Show me AWS production credentials"]);

export interface SeedStep {
  u: string;
  i: string;
  ent?: string;
}

export type ConvGroup = "Today" | "Yesterday" | "Last 7 days" | "Pinned" | "Archived";

export interface ConversationSeed {
  title: string;
  group: ConvGroup;
  meta: string;
  pin?: boolean;
  live?: boolean;
  seed?: SeedStep[];
}

export const CONVERSATION_SEEDS: ConversationSeed[] = [
  { title: "Incident Quality Review", group: "Today", meta: "2 mins ago", seed: [{ u: "Review incident quality for SI-92837", i: "quality", ent: "SI-92837" }] },
  { title: "Checkout Investigation", group: "Today", meta: "live", live: true, seed: [{ u: "Why is Checkout failing?", i: "whyFailing", ent: "SI-92837" }, { u: "Should I roll back?", i: "rollbackAsk", ent: "SI-92837" }] },
  { title: "Payments Latency Triage", group: "Today", meta: "12 mins ago", seed: [{ u: "Who is handling SI-92840?", i: "handler", ent: "SI-92840" }, { u: "What's the confidence score?", i: "confidence", ent: "SI-92840" }] },
  { title: "Platform Health Review", group: "Yesterday", meta: "Yesterday", seed: [{ u: "Give me a platform health review", i: "health" }] },
  { title: "Generate Executive Report", group: "Yesterday", meta: "Yesterday", seed: [{ u: "Generate an executive summary for SI-92837", i: "exec", ent: "SI-92837" }] },
  { title: "War Room Summary", group: "Last 7 days", meta: "3 days ago", seed: [{ u: "Summarize the war room for SI-92837", i: "warroom", ent: "SI-92837" }] },
  { title: "Operational Rules Review", group: "Last 7 days", meta: "5 days ago", seed: [{ u: "Which operational rules are active right now?", i: "rules" }] },
  { title: "Change Freeze · Q3", group: "Pinned", meta: "pinned", pin: true, seed: [{ u: "Is a change freeze in effect?", i: "rules" }] },
  { title: "Login Errors · history", group: "Archived", meta: "archived", seed: [{ u: "Have we seen SI-92815 before?", i: "similar", ent: "SI-92815" }] },
];

export const GROUP_ORDER: ConvGroup[] = ["Today", "Yesterday", "Last 7 days", "Pinned", "Archived"];

export const priorityTone = (p: Priority) => (p === "P0" ? "major" : p === "P1" ? "warn" : "accent");
export const riskTone = (r: Risk) => (r === "high" ? "major" : r === "medium" ? "warn" : "ok");
export const confidenceWord = (s: number) => (s >= 90 ? "High confidence" : s >= 80 ? "Solid confidence" : "Moderate confidence");
