export type PlaybookStatus = "Active" | "Draft" | "Disabled" | "Archived";
export type ExecutionMode =
  | "Fully autonomous"
  | "Approval required"
  | "Advisory only";
export type ModuleCategory =
  | "Investigation"
  | "Decision"
  | "Execution"
  | "Verification"
  | "Knowledge";

export interface ModuleDef {
  id: string;
  cat: ModuleCategory;
  name: string;
  ver: string;
  owner: string;
  desc: string;
}

export interface RuleDef {
  id: string;
  name: string;
  status: string;
  purpose: string;
  detail: string;
}

export interface AgentDef {
  name: string;
  purpose: string;
  runtime: string;
  conf: string;
  status: string;
}

export interface SlaDef {
  ack: string;
  firstAction: string;
  resolution: string;
  breach: string;
}

export interface Playbook {
  id: string;
  name: string;
  service: string;
  status: PlaybookStatus;
  mode: ExecutionMode;
  success: number;
  executed: number;
  priority: number; // stored 1–4, displayed P0–P3
  trigger: string;
  owner: string;
  version: string;
  updated: string;
  env: string[];
  rules: string[]; // rule ids
  maxAuto: number;
  rollback: boolean;
  approvers: string[];
  mttr: string;
  approvalTime: string;
  rollbackRate: string;
  failures: number;
  modules: Record<ModuleCategory, string[]>;
  desc: string;
  incidentTypes: string[];
  created: string;
  // ── detail-view governance & scope extras (lazily initialized) ──
  maintainers?: string[];
  sla?: SlaDef;
  scopeRules?: string[];
  applyMode?: "Automatic" | "Manual";
  matchedResources?: string[];
}

export type StepKind = "step" | "gate" | "terminal";

export interface StepDef {
  n: number;
  name: string;
  agent: string;
  kind: StepKind;
  desc: string;
  mod: string | null;
}

export interface StageDef {
  n: number;
  name: string;
  mod: string;
  body: string;
  chips: string[];
}

export type PermissionState = "Allowed" | "Approval required" | "Blocked";

export interface PermissionDef {
  name: string;
  state: PermissionState;
  note: string;
}

export interface RecoveryCheckDef {
  name: string;
  state: string;
}

export interface VersionDef {
  v: string;
  note: string;
  by: string;
  when: string;
}

export interface ChangeDef {
  author: string;
  approver: string;
  date: string;
  reason: string;
  risk: "Low" | "Medium" | "High";
}

export interface RelatedDef {
  name: string;
  cnt: string;
}

export type FilterKey =
  | "status"
  | "service"
  | "trigger"
  | "priority"
  | "mode"
  | "owner";

export type LibraryTab = "playbooks" | "modules";

export type SearchScope =
  | "Name"
  | "Service"
  | "Incident type"
  | "Tag"
  | "Operational rule"
  | "AI agent"
  | "Owner";
