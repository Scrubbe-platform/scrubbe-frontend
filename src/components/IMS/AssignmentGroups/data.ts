export type Availability = "Online" | "Away" | "Offline";
export type GroupStatus = "Active" | "Archived";
export type Risk = "low" | "medium" | "high";

export interface Member {
  name: string;
  role: string;
  availability: Availability;
  oncall: boolean;
  incidents: number;
  email?: string;
  userId?: string;
}

export const M = (name: string, role: string, availability: Availability, oncall: boolean, incidents: number): Member => ({ name, role, availability, oncall, incidents });

export interface OnCall {
  name: string | null;
  ends: string | null;
}

export interface EzraAssignment {
  enabled: boolean;
  assigned: number;
}

export interface Group {
  id: string;
  name: string;
  status: GroupStatus;
  env: string;
  description: string;
  manager: string;
  department: string;
  businessUnit: string;
  primaryService: string;
  members: Member[];
  responsibilities: [string, boolean][];
  services: string[];
  assets: string[];
  playbooks: string[];
  rules: string[];
  escalation: string[];
  oncall: OnCall;
  ezra: EzraAssignment;
  activeIncidents: [string, string, string][];
  history: [string, string][];
  expertise: [string, number][];
  knowledge: string[];
  permissions: [string, boolean][];
}

export const EZRA = { name: "Ezra", role: "Governed response agent", model: "Scrubbe Ezra · v4.2", scope: "Incident Commander (delegated)" };

export const SEED_GROUPS: Group[] = [
  {
    id: "ag-pay", name: "Payments Platform", status: "Active", env: "Production",
    description: "Responsible for payment processing services and supporting infrastructure.",
    manager: "Sarah Jones", department: "Platform Engineering", businessUnit: "Engineering", primaryService: "Checkout",
    members: [
      M("Sarah Jones", "Incident Commander", "Online", true, 2), M("Daniel Lee", "Platform Engineer", "Online", false, 1), M("Emma White", "Engineering Manager", "Offline", false, 0),
      M("Marcus Reid", "Site Reliability Engineer", "Online", false, 1), M("Priya Nair", "Platform Engineer", "Online", false, 0), M("Tom Vance", "Backend Engineer", "Away", false, 0),
      M("Nadia Osei", "Site Reliability Engineer", "Online", false, 1), M("Leo Park", "Platform Engineer", "Offline", false, 0), M("Ava Chen", "Backend Engineer", "Online", false, 0),
      M("Sam Ortiz", "DevOps Engineer", "Online", false, 0), M("Ruth Kelly", "Site Reliability Engineer", "Offline", false, 0), M("Ben Cole", "Platform Engineer", "Online", false, 0),
      M("Ida Frost", "Backend Engineer", "Away", false, 0), M("Omar Zaid", "Incident Commander", "Online", false, 0),
    ],
    responsibilities: [["Checkout Platform", true], ["Payment Gateway", true], ["Billing APIs", true], ["Redis Cluster", true], ["Kubernetes Namespace", true], ["Production Deployments", true]],
    services: ["Checkout", "Payments", "Billing", "Fraud Detection"],
    assets: ["Redis Cluster", "Kubernetes Cluster", "Load Balancer", "API Gateway"],
    playbooks: ["Redis Recovery", "Checkout Recovery", "Database Failover", "API Gateway Recovery"],
    rules: ["Production Approval", "Emergency Rollback", "Executive Notification", "Deployment Freeze"],
    escalation: ["Platform Engineer", "Incident Commander", "Engineering Manager", "CTO"],
    oncall: { name: "Daniel Lee", ends: "Tomorrow · 09:00 UTC" },
    ezra: { enabled: true, assigned: 1 },
    activeIncidents: [["SI-92381", "Checkout Failure", "P1"], ["SI-92822", "Redis Latency", "P2"]],
    history: [["SI-83291", "Checkout"], ["SI-73821", "Payment Timeout"], ["SI-62112", "Redis Saturation"]],
    expertise: [["Payments", 5], ["Kubernetes", 4], ["Redis", 5], ["PostgreSQL", 3], ["AWS", 4]],
    knowledge: ["Playbooks", "Operational Rules", "Services", "Assets", "War Rooms", "Change Requests", "Decision Center"],
    permissions: [["Emergency Changes", true], ["Deployment Changes", true], ["Rollback", true], ["Production Restart", true]],
  },
  {
    id: "ag-infra", name: "Infrastructure", status: "Active", env: "Production",
    description: "Owns core networking, gateways and shared runtime infrastructure.",
    manager: "Raj Patel", department: "Platform Engineering", businessUnit: "Engineering", primaryService: "API Gateway",
    members: [
      M("Raj Patel", "Engineering Manager", "Online", false, 0), M("Hana Kim", "Incident Commander", "Online", true, 1), M("Owen Blake", "Network Engineer", "Online", false, 0),
      M("Lucia Mora", "SRE", "Online", false, 0), M("Ivan Petrov", "SRE", "Away", false, 0), M("Beth Ryan", "Platform Engineer", "Online", false, 0),
      M("Cole Adams", "Network Engineer", "Offline", false, 0), M("Dara Singh", "SRE", "Online", false, 1), M("Ella Ford", "Platform Engineer", "Online", false, 0),
    ],
    responsibilities: [["API Gateway", true], ["Load Balancing", true], ["Networking", true], ["DNS", true], ["Service Mesh", true], ["Production Deployments", true]],
    services: ["API Gateway", "Service Mesh", "DNS", "Edge"],
    assets: ["Load Balancer", "API Gateway", "Firewall", "VPC"],
    playbooks: ["API Gateway Recovery", "Network Failover", "DNS Recovery"],
    rules: ["Production Approval", "Emergency Rollback", "Change Validation"],
    escalation: ["Network Engineer", "Incident Commander", "Engineering Manager", "CTO"],
    oncall: { name: "Hana Kim", ends: "Today · 18:00 UTC" },
    ezra: { enabled: true, assigned: 1 },
    activeIncidents: [["SI-92104", "Gateway 5xx spike", "P2"]],
    history: [["SI-81002", "Gateway Failure"], ["SI-70455", "DNS Outage"]],
    expertise: [["Networking", 5], ["Kubernetes", 5], ["Terraform", 4], ["AWS", 5], ["Observability", 4]],
    knowledge: ["Playbooks", "Operational Rules", "Services", "Assets", "Change Requests"],
    permissions: [["Emergency Changes", true], ["Deployment Changes", true], ["Rollback", true], ["Production Restart", false]],
  },
  {
    id: "ag-cloud", name: "Cloud Engineering", status: "Active", env: "Production",
    description: "Manages cloud accounts, compute, and platform provisioning.",
    manager: "Lena Fischer", department: "Cloud", businessUnit: "Engineering", primaryService: "Compute",
    members: [
      M("Lena Fischer", "Engineering Manager", "Online", false, 0), M("Yuki Tanaka", "Incident Commander", "Online", true, 0), M("Paul Mensah", "Cloud Engineer", "Online", false, 0),
      M("Sofia Ruiz", "Cloud Engineer", "Online", false, 0), M("Max Weber", "SRE", "Away", false, 0), M("Nora Hale", "Cloud Engineer", "Online", false, 0),
      M("Eli Stone", "Platform Engineer", "Online", false, 0), M("Rina Das", "SRE", "Offline", false, 0), M("Jon Frost", "Cloud Engineer", "Online", false, 0),
      M("Kate Lin", "DevOps Engineer", "Online", false, 0), M("Ravi Kumar", "Cloud Engineer", "Online", false, 0),
    ],
    responsibilities: [["Compute", true], ["Kubernetes Clusters", true], ["Cloud Accounts", true], ["Cost Governance", true], ["Production Deployments", true]],
    services: ["Compute", "Kubernetes", "Storage", "Identity"],
    assets: ["Kubernetes Cluster", "Compute Fleet", "Object Storage", "IAM"],
    playbooks: ["Cluster Recovery", "Node Drain", "Autoscaler Reset"],
    rules: ["Production Approval", "Deployment Freeze", "Change Validation"],
    escalation: ["Cloud Engineer", "Incident Commander", "Engineering Manager", "CTO"],
    oncall: { name: "Yuki Tanaka", ends: "Tomorrow · 12:00 UTC" },
    ezra: { enabled: true, assigned: 0 },
    activeIncidents: [],
    history: [["SI-79920", "Node Pressure"], ["SI-64431", "Autoscaler Flap"]],
    expertise: [["AWS", 5], ["Kubernetes", 5], ["Terraform", 5], ["Cost", 4], ["Networking", 3]],
    knowledge: ["Playbooks", "Operational Rules", "Services", "Assets", "Change Requests"],
    permissions: [["Emergency Changes", true], ["Deployment Changes", true], ["Rollback", true], ["Production Restart", true]],
  },
  {
    id: "ag-sec", name: "Security Operations", status: "Active", env: "Production",
    description: "Detection, response and governance for security incidents.",
    manager: "Grace Kim", department: "Security", businessUnit: "Security", primaryService: "Edge Security",
    members: [
      M("Grace Kim", "Security Manager", "Offline", false, 0), M("Noah Berg", "Security Engineer", "Online", false, 1), M("Mia Lund", "Security Analyst", "Away", false, 0),
      M("Kofi Mensah", "Security Engineer", "Offline", false, 0), M("Zoe Adler", "SOC Analyst", "Online", false, 0), M("Ravi Shah", "Security Engineer", "Offline", false, 0),
    ],
    responsibilities: [["Edge Security", true], ["IAM", true], ["Threat Detection", true], ["Incident Forensics", true], ["Production Deployments", false]],
    services: ["Edge Security", "IAM", "Secrets", "WAF"],
    assets: ["WAF", "Secrets Manager", "SIEM", "Certificate Manager"],
    playbooks: ["Credential Rotation", "Threat Containment", "Certificate Recovery"],
    rules: ["Executive Notification", "Secrets Policy", "Change Validation"],
    escalation: ["Security Engineer", "SOC Lead", "Security Manager", "CISO"],
    oncall: { name: null, ends: null },
    ezra: { enabled: true, assigned: 1 },
    activeIncidents: [["SI-92815", "Login Errors", "P2"]],
    history: [["SI-64010", "Cert Expiry Outage"], ["SI-59003", "IAM Misconfig"]],
    expertise: [["AppSec", 5], ["IAM", 4], ["Threat Detection", 5], ["Forensics", 3], ["Cloud Security", 4]],
    knowledge: ["Playbooks", "Operational Rules", "Services", "Assets", "Decision Center"],
    permissions: [["Emergency Changes", false], ["Deployment Changes", false], ["Rollback", false], ["Production Restart", false]],
  },
];

// which groups the "member"-role viewer belongs to, for the role-switch demo
export const MEMBER_OF = new Set(["ag-pay"]);

export interface Readiness {
  total: number;
  available: number;
  oncall: boolean;
  ic: boolean;
  skills: boolean;
  availOk: boolean;
  majorReady: boolean;
  deploy: boolean;
  risk: Risk;
}

export function readiness(g: Group): Readiness {
  const total = g.members.length;
  const available = g.members.filter((m) => m.availability === "Online").length;
  const oncall = !!(g.oncall && g.oncall.name);
  const ic = g.members.some((m) => /Incident Commander/i.test(m.role) && m.availability === "Online");
  const skills = g.expertise.filter((e) => e[1] >= 4).length >= 2;
  const availOk = available >= Math.ceil(total * 0.4);
  const majorReady = availOk && ic && oncall;
  const deploy = g.responsibilities.some((r) => /Deployment/i.test(r[0]) && r[1]);
  let score = 0;
  if (!availOk) score += 2;
  if (!oncall) score += 2;
  if (!ic) score += 2;
  if (!skills) score += 1;
  const risk: Risk = score >= 4 ? "high" : score >= 2 ? "medium" : "low";
  return { total, available, oncall, ic, skills, availOk, majorReady, deploy, risk };
}

export type Tone = "ok" | "warn" | "major" | "accent" | "neutral";

export const riskTag = (r: Risk): [Tone, string] => (r === "low" ? ["ok", "Low"] : r === "medium" ? ["warn", "Medium"] : ["major", "High"]);
export const availTone = (a: Availability): Tone => (a === "Online" ? "ok" : a === "Away" ? "warn" : "neutral");

export function initialsOf(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function deriveUser(m: Member, groups: Group[]) {
  const parts = m.name.toLowerCase().replace(/[^a-z ]/g, "").split(/\s+/).filter(Boolean);
  const email = parts.join(".") + "@company.com";
  const slack = "@" + (parts[0] || "user");
  const tzs = ["UTC", "UTC-5", "UTC+1", "UTC+5:30", "UTC-8"];
  const locs = ["London, UK", "New York, US", "Berlin, DE", "Bengaluru, IN", "San Francisco, US"];
  const h = Array.from(m.name).reduce((a, c) => a + c.charCodeAt(0), 0);
  const teams = groups.filter((gr) => gr.members.some((x) => x.name === m.name)).map((gr) => gr.name);
  return { email, slack, tz: tzs[h % tzs.length], loc: locs[h % locs.length], teams };
}

export const ITEM_MODULE: Record<string, string> = {
  "Service Catalog": "Service Catalog",
  "Asset Inventory": "Asset Inventory",
  "Playbook Library": "Playbook Library",
  "Operational Rules": "Operational Rules",
  Knowledge: "Operational Memory",
};

export const RULE_DESC: Record<string, string> = {
  "Production Approval": "All production changes require an approver.",
  "Emergency Rollback": "Fast-tracked rollback under a major incident.",
  "Executive Notification": "Auto-notify leadership on P0 / P1.",
  "Deployment Freeze": "Blocks deploys during the freeze window.",
  "Change Validation": "Validates changes before they ship.",
  "Secrets Policy": "Secrets are deny-by-default.",
};
