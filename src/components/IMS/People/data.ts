export type PersonKind = "human" | "agent";
export type PersonStatus = "online" | "away" | "offline" | "disabled";
export type PermLevel = "yes" | "limited" | "no";

export interface HumanAccount {
  username: string;
  created: string;
  lastLogin: string;
  mfa: string;
  active: boolean;
}

export interface AgentAccount {
  agent: true;
  scopeRBAC: string;
  secrets: string;
  execScope: string;
  approval: string;
  audit: string;
}

export interface SessionInfo {
  device: string;
  browser: string;
  loc: string;
  current: boolean;
}

export interface HumanSecurity {
  agent?: false;
  lastPwChange: string;
  apiTokens: number;
  sshKeys: string;
  sessions: SessionInfo[];
}

export interface AgentSecurity {
  agent: true;
}

export interface PersonStats {
  assigned: number;
  majors: number;
  warRooms: number;
  avgResponse: string;
  availability: string;
}

export interface Person {
  id: string;
  initials: string;
  name: string;
  kind: PersonKind;
  self?: boolean;
  title: string;
  department: string;
  team: string;
  status: PersonStatus;
  lastActive: string;
  general: Record<string, string>;
  account: HumanAccount | AgentAccount;
  role: string;
  groups: string[];
  permissions: [string, PermLevel, string?][];
  security: HumanSecurity | AgentSecurity;
  stats: PersonStats;
  skills: [string, string][];
  _prevStatus?: PersonStatus;
}

// Ezra is a fixed synthetic entry — the platform's governed AI agent, not a
// row from the organization's team-member directory.
export const EZRA_AGENT: Person = {
  id: "ezra", initials: "E", name: "Ezra", kind: "agent",
  title: "Governed response agent", department: "Scrubbe Platform", team: "Major Incident Response",
  status: "online", lastActive: "Active now",
  general: { Model: "Scrubbe Ezra · v4.2", Provider: "Anthropic (Claude)", Deployed: "11 Dec 2025", Interface: "Command Studio", "Runs as": "Service identity", "Governed by": "Operational Rules · RBAC" },
  account: { agent: true, scopeRBAC: "Incident Commander (delegated)", secrets: "Deny by default · Secrets Policy", execScope: "Propose + execute on approval", approval: "Required for state-changing actions", audit: "Every action logged" },
  role: "Governed AI Agent",
  groups: ["Major Incident Response", "Payments Platform", "Infrastructure"],
  permissions: [["Read incidents & signals", "yes"], ["Draft incident fields", "yes"], ["Propose remediation", "yes"], ["Execute remediation", "limited", "On approval"], ["Access secrets", "no", "Blocked"], ["Approve changes", "no", "Never"], ["Operational rules", "limited", "Enforced against"]],
  security: { agent: true },
  stats: { assigned: 7, majors: 1, warRooms: 3, avgResponse: "11 sec", availability: "Online" },
  skills: [["Signal correlation", "Core"], ["Root-cause analysis", "Core"], ["Playbook execution", "Governed"], ["Change rollback", "Approval-gated"], ["Incident summarisation", "Core"]],
};

export const statusLabel = (s: PersonStatus) => ({ online: "Online", away: "Away", offline: "Offline", disabled: "Disabled" }[s] ?? s);
export const statusTone = (s: PersonStatus) => (s === "online" ? "ok" : s === "away" ? "warn" : s === "disabled" ? "major" : "neutral");

export function initialsOf(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

/**
 * Maps a raw team member from GET /business/get_members into a Person.
 * That endpoint only returns { id, firstname, lastname, email, role, level } —
 * everything else (department, team, presence, permissions, sessions, stats,
 * skills) isn't in that schema yet, so it's left as an empty placeholder
 * rather than invented, until the backend provides it.
 */
export function memberToPerson(member: { id: string; firstname?: string; lastname?: string; email?: string; role?: string; level?: string }, isSelf: boolean): Person {
  const name = `${member.firstname ?? ""} ${member.lastname ?? ""}`.trim() || member.email || "Member";
  return {
    id: member.id,
    initials: initialsOf(name),
    name,
    kind: "human",
    self: isSelf || undefined,
    title: member.role || "---",
    department: "---",
    team: "---",
    status: "offline",
    lastActive: "---",
    general: {
      "Full name": name,
      Email: member.email || "---",
      Phone: "---",
      Department: "---",
      Location: "---",
      "Time zone": "---",
      Language: "---",
      ...(member.level ? { "Access level": member.level } : {}),
    },
    account: { username: member.email ? member.email.split("@")[0] : "---", created: "---", lastLogin: "---", mfa: "---", active: true },
    role: member.role || "Member",
    groups: [],
    permissions: [],
    security: { lastPwChange: "---", apiTokens: 0, sshKeys: "---", sessions: [] },
    stats: { assigned: 0, majors: 0, warRooms: 0, avgResponse: "---", availability: "---" },
    skills: [],
  };
}
