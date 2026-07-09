"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  CSSProperties,
  ReactNode,
} from "react";
import {
  AlertTriangle,
  Users,
  Activity,
  Clock,
  Calendar,
  RefreshCw,
  Zap,
  Shield,
  FileText,
  Trash2,
  GripVertical,
  Info,
  Plus,
  ChevronDown,
  Copy,
  Play,
  Check,
  X,
  Ban,
  Power,
  ArrowDown,
  VolumeX,
} from "lucide-react";
import CButton from "@/components/ui/Button1"; // adjust path as needed

// ─── TYPES ───────────────────────────────────────────────────────────────────

type ValueType =
  | "select"
  | "text"
  | "num"
  | "priority"
  | "days"
  | "timerange"
  | "duration"
  | "bool";

type FieldVal =
  | { type: "select"; options: string[]; unit?: string; placeholder?: string }
  | { type: "num"; unit?: string; placeholder?: string }
  | { type: "priority" }
  | { type: "days" }
  | { type: "timerange" }
  | { type: "duration" }
  | { type: "bool"; fixed?: boolean }
  | { type: "text"; placeholder?: string };

interface FieldDef {
  label: string;
  ops: string[];
  val: FieldVal;
  hint?: string;
}

type FieldKey = keyof typeof FIELDS;
type ActionKey = keyof typeof ACTIONS;
type MatchType = "all" | "any" | "none";
type Connector = "AND" | "OR" | "NOT";
type RuleStatus = "enabled" | "draft" | "disabled";
type GuardMatch = "any" | "all";
type ControlPath =
  | "win.min"
  | "win.scope"
  | "max.count"
  | "max.per"
  | "retry"
  | "conc"
  | "approval"
  | "timeout";
type ScheduleMode = "always" | "at";
type RepeatOption = "Once" | "Daily" | "Weekly" | "Monthly";
type ScopeOption = "incident" | "service" | "service+priority";
type MaxPerOption = "hour" | "day" | "incident";
type RetryOption = "none" | "once" | "3x" | "5x";

interface Condition {
  id: string;
  kind: "cond";
  connector: Connector;
  field: FieldKey;
  op: string;
  value: string;
  days: string[];
  t1: string;
  t2: string;
}

interface ConditionGroup {
  id: string;
  kind: "group";
  connector: Connector;
  matchType: MatchType;
  children: Condition[];
}

type AnyCondition = Condition | ConditionGroup;

interface RuleAction {
  id: string;
  key: ActionKey;
  detail: string;
}

interface GuardValDef {
  def: number;
  min: number;
  max: number;
  unit: string;
  pre: string;
  suf: string;
}

interface GuardItem {
  key: string;
  label: string;
  use: string;
  val?: GuardValDef;
  intel?: boolean;
}

interface GuardCatalogGroup {
  sec: string;
  items: GuardItem[];
}

interface Guard {
  id: string;
  key: string;
  value?: number;
}

interface ControlsState {
  window: { minutes: number; scope: ScopeOption };
  maxExecutions: { count: number; per: MaxPerOption };
  retry: RetryOption;
  concurrency: number;
  approval: string;
  timeout: number;
}

interface ScheduleState {
  mode: ScheduleMode;
  date: string;
  time: string;
  repeat: RepeatOption;
}

interface ToastItem {
  id: number;
  msg: string;
  kind: "good" | "info" | "error";
}

interface DropdownItem {
  type?: "sep" | "label";
  label?: string;
  onClick?: () => void;
}

type BtnVariant = "default" | "primary" | "ghost" | "danger" | "good";
type BtnSize = "sm" | "md";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const VT = {
  SELECT: "select" as const,
  TEXT: "text" as const,
  NUM: "num" as const,
  PRIORITY: "priority" as const,
  DAYS: "days" as const,
  TIMERANGE: "timerange" as const,
  DURATION: "duration" as const,
  BOOL: "bool" as const,
};

const FIELDS = {
  service: {
    label: "Service",
    ops: ["equals", "not equals", "is any of"],
    val: {
      type: VT.SELECT,
      options: [
        "Checkout Service",
        "Payments Service",
        "Search Service",
        "Auth Service",
        "Cart Service",
        "Inventory Service",
      ],
    },
  },
  priority: {
    label: "Priority",
    ops: ["equals", "greater or equal", "less or equal", "not equals"],
    val: { type: VT.PRIORITY },
  },
  status: {
    label: "Status",
    ops: ["equals", "not equals"],
    val: {
      type: VT.SELECT,
      options: [
        "Detected",
        "Triaged",
        "Investigating",
        "Mitigating",
        "Resolved",
        "Monitoring",
      ],
    },
  },
  category: {
    label: "Category",
    ops: ["equals", "not equals"],
    val: {
      type: VT.SELECT,
      options: [
        "Availability",
        "Performance",
        "Security",
        "Data",
        "Configuration",
      ],
    },
  },
  environment: {
    label: "Environment",
    ops: ["equals", "not equals"],
    val: { type: VT.SELECT, options: ["Production", "Staging", "Development"] },
  },
  team: {
    label: "Team",
    ops: ["equals", "is any of"],
    val: {
      type: VT.SELECT,
      options: ["Platform Engineering", "Payments", "SRE", "Security", "Data"],
    },
  },
  health: {
    label: "Service Health",
    ops: ["equals", "not equals"],
    val: {
      type: VT.SELECT,
      options: ["Healthy", "Degraded", "Down", "Degraded or Down"],
    },
  },
  riskScore: {
    label: "Risk Score",
    ops: ["greater or equal", "greater than", "less than"],
    val: { type: VT.NUM, placeholder: "e.g. 70" },
  },
  sloBreach: { label: "SLO Breach", ops: ["is"], val: { type: VT.BOOL } },
  timeOfDay: {
    label: "Time of Day",
    ops: ["outside", "between", "equals"],
    val: { type: VT.TIMERANGE },
    hint: "Matches incidents in the specified time window.",
  },
  businessHours: {
    label: "Business Hours",
    ops: ["is"],
    val: { type: VT.BOOL },
    hint: "Evaluates against the configured business-hours calendar.",
  },
  dayOfWeek: {
    label: "Day of Week",
    ops: ["is any of", "is not"],
    val: { type: VT.DAYS },
    hint: "Matches incidents on the selected days.",
  },
  acknowledged: {
    label: "Incident Acknowledged",
    ops: ["is"],
    val: { type: VT.BOOL },
  },
  notAckFor: {
    label: "Incident Not Acknowledged",
    ops: ["for more than", "for at least"],
    val: { type: VT.DURATION },
    hint: "Unacknowledged for the specified duration.",
  },
  incidentAge: {
    label: "Incident Age",
    ops: ["more than", "less than"],
    val: { type: VT.DURATION },
    hint: "How long the incident has been open.",
  },
  motherExists: {
    label: "Mother Incident",
    ops: ["exists", "does not exist"],
    val: { type: VT.BOOL, fixed: true },
  },
  childExists: {
    label: "Child Incident",
    ops: ["exists", "does not exist"],
    val: { type: VT.BOOL, fixed: true },
  },
  childCount: {
    label: "Child Incident Count",
    ops: ["greater than", "greater or equal", "equals"],
    val: { type: VT.NUM, placeholder: "e.g. 5" },
  },
  affectedServices: {
    label: "Affected Services",
    ops: ["greater than", "greater or equal"],
    val: { type: VT.NUM, placeholder: "e.g. 3" },
  },
  similarFound: {
    label: "Similar Incident Found",
    ops: ["is"],
    val: { type: VT.BOOL },
  },
  knownResolution: {
    label: "Known Resolution Exists",
    ops: ["is"],
    val: { type: VT.BOOL },
  },
  knownRisk: {
    label: "Known Risk",
    ops: ["exists", "does not exist"],
    val: { type: VT.BOOL, fixed: true },
  },
  problemRecord: {
    label: "Open Problem Record",
    ops: ["exists", "does not exist"],
    val: { type: VT.BOOL, fixed: true },
  },
  ezraConfidence: {
    label: "Ezra Confidence",
    ops: ["less than", "less or equal", "greater or equal", "greater than"],
    val: { type: VT.NUM, placeholder: "e.g. 80", unit: "%" },
    hint: "Ezra's diagnostic confidence, 0–100%.",
  },
  rootCauseType: {
    label: "Root Cause Type",
    ops: ["equals", "not equals", "is any of"],
    val: {
      type: VT.SELECT,
      options: [
        "Deployment",
        "Configuration",
        "Infrastructure",
        "Capacity",
        "Dependency",
        "Data",
        "Unknown",
      ],
    },
  },
  rootCauseCount: {
    label: "Number of Root Causes",
    ops: ["equals", "greater than", "greater or equal"],
    val: { type: VT.NUM, placeholder: "e.g. 1" },
  },
  investigationDuration: {
    label: "Investigation Duration",
    ops: ["for more than", "for at least", "less than"],
    val: { type: VT.DURATION },
    hint: "How long agents have been investigating.",
  },
  evidenceQuality: {
    label: "Evidence Quality",
    ops: ["equals", "not equals", "is any of"],
    val: {
      type: VT.SELECT,
      options: ["High", "Medium", "Low", "Insufficient"],
    },
  },
  contradictoryFindings: {
    label: "Contradictory Findings",
    ops: ["is"],
    val: { type: VT.BOOL },
    hint: "Agents surfaced conflicting evidence.",
  },
  remediationRisk: {
    label: "Remediation Risk",
    ops: ["equals", "is any of", "not equals"],
    val: { type: VT.SELECT, options: ["Low", "Medium", "High", "Critical"] },
  },
  remediationConfidence: {
    label: "Remediation Confidence",
    ops: ["less than", "less or equal", "greater or equal", "greater than"],
    val: { type: VT.NUM, placeholder: "e.g. 90", unit: "%" },
    hint: "Confidence in the proposed remediation.",
  },
  rollbackAvailable: {
    label: "Rollback Available",
    ops: ["is"],
    val: { type: VT.BOOL },
    hint: "A safe rollback path exists.",
  },
  blastRadius: {
    label: "Blast Radius",
    ops: ["greater than", "greater or equal", "less than", "less or equal"],
    val: { type: VT.NUM, placeholder: "e.g. 10", unit: "services" },
    hint: "Services within the computed blast radius.",
  },
  executionType: {
    label: "Execution Type",
    ops: ["equals", "not equals", "is any of"],
    val: {
      type: VT.SELECT,
      options: ["Autonomous", "Semi-autonomous", "Manual", "Approval-gated"],
    },
  },
  revenueImpact: {
    label: "Revenue at Risk",
    ops: ["greater or equal", "greater than", "less than"],
    val: { type: VT.NUM, placeholder: "e.g. 50000", unit: "£/hr" },
    hint: "Estimated revenue exposure per hour.",
  },
  customerImpact: {
    label: "Affected Users",
    ops: ["greater than", "greater or equal", "less than"],
    val: { type: VT.NUM, placeholder: "e.g. 100000" },
    hint: "Estimated impacted end users.",
  },
  slaBreachRisk: {
    label: "SLA Breach Risk",
    ops: ["equals", "is any of", "not equals"],
    val: {
      type: VT.SELECT,
      options: ["None", "At risk", "Imminent", "Breached"],
    },
  },
  complianceRisk: {
    label: "Compliance Risk",
    ops: ["equals", "is any of", "not equals"],
    val: {
      type: VT.SELECT,
      options: ["None", "Low", "Elevated", "High", "Regulatory"],
    },
  },
  serviceTier: {
    label: "Service Tier",
    ops: ["equals", "not equals", "is any of"],
    val: { type: VT.SELECT, options: ["Tier-1", "Tier-2", "Tier-3"] },
  },
  requiredApprovals: {
    label: "Required Approvals",
    ops: ["equals", "is any of", "not equals"],
    val: {
      type: VT.SELECT,
      options: [
        "Auto-approved",
        "Manager approval",
        "Multi-stage approval",
        "CAB approval",
        "Emergency CAB (eCAB)",
        "Executive approval",
      ],
    },
    hint: "The approval level a remediation must clear.",
  },
  changeType: {
    label: "Change Type",
    ops: ["equals", "is any of", "not equals"],
    val: {
      type: VT.SELECT,
      options: [
        "Standard change",
        "Normal change",
        "Pre-approved change",
        "Emergency change",
      ],
    },
    hint: "ITIL-style change classification.",
  },
  changeWindow: {
    label: "Change Window",
    ops: ["equals", "is any of", "not equals"],
    val: {
      type: VT.SELECT,
      options: [
        "Inside business hours",
        "Outside business hours",
        "Maintenance window",
        "Pre-approved window",
        "Change freeze",
      ],
    },
    hint: "The window in which the change would execute.",
  },
  emergencyOverride: {
    label: "Emergency Override",
    ops: ["is"],
    val: { type: VT.BOOL },
    hint: "An eCAB emergency override has been granted.",
  },
} satisfies Record<string, FieldDef>;

const ACTIONS = {
  createIncident: {
    name: "Create Incident",
    detail: "Priority: Same as triggering event",
    group: "Incident",
  },
  updateIncident: {
    name: "Update Incident",
    detail: "Set status to Investigating",
    group: "Incident",
  },
  escalateIncident: {
    name: "Escalate Incident",
    detail: "Escalate to Platform Engineering",
    group: "Incident",
  },
  closeIncident: {
    name: "Close Incident",
    detail: "Resolution: Auto-resolved",
    group: "Incident",
  },
  startWarRoom: {
    name: "Start War Room",
    detail: "War Room Type: Incident Response",
    group: "War Room",
  },
  addResponders: {
    name: "Add Responders",
    detail: "On-call + service owners",
    group: "War Room",
  },
  assignCommander: {
    name: "Assign Commander",
    detail: "Senior on-call engineer",
    group: "War Room",
  },
  assignTeam: {
    name: "Assign Team",
    detail: "Team: Platform Engineering (On-call)",
    group: "War Room",
  },
  attachPlaybook: {
    name: "Attach Playbook",
    detail: "Playbook: Checkout Service Failure",
    group: "Playbook",
  },
  recommendPlaybook: {
    name: "Recommend Playbook",
    detail: "Suggest top-ranked playbook",
    group: "Playbook",
  },
  executePlaybook: {
    name: "Execute Playbook",
    detail: "Run within approved automation level",
    group: "Playbook",
  },
  searchSimilar: {
    name: "Search Similar Incidents",
    detail: "Attach findings to incident",
    group: "Knowledge",
  },
  attachResolutions: {
    name: "Attach Previous Resolutions",
    detail: "Top 3 prior resolutions",
    group: "Knowledge",
  },
  attachRca: {
    name: "Attach Previous RCA",
    detail: "Linked root-cause analyses",
    group: "Knowledge",
  },
  attachRisks: {
    name: "Attach Open Risks",
    detail: "Known risks for the service",
    group: "Knowledge",
  },
  createChild: {
    name: "Create Child Incident",
    detail: "Per affected downstream service",
    group: "Mother/Child",
  },
  linkChild: {
    name: "Link Child Incident",
    detail: "Attach to existing mother incident",
    group: "Mother/Child",
  },
  propagateResolution: {
    name: "Propagate Resolution",
    detail: "Sync resolution to children",
    group: "Mother/Child",
  },
  syncFindings: {
    name: "Sync Findings",
    detail: "Share findings across the cluster",
    group: "Mother/Child",
  },
  sendNotification: {
    name: "Send Notification",
    detail: "Channel: Slack (#incidents), Email (On-call)",
    group: "Notification",
  },
  requireApproval: {
    name: "Require Approval",
    detail: "Hold actions for human approval",
    group: "Governance",
  },
  createWorkbench: {
    name: "Create Workbench",
    detail: "Open major-incident workbench",
    group: "Governance",
  },
  executiveReview: {
    name: "Executive Review",
    detail: "Notify incident commander chain",
    group: "Governance",
  },
  blockAutomation: {
    name: "Block Automation",
    detail: "Prevent automated remediation",
    group: "Governance",
  },
  autoRollback: {
    name: "Auto Rollback",
    detail: "Roll back the triggering deployment",
    group: "Remediation",
  },
  escalateNow: {
    name: "Escalate Immediately",
    detail: "Page on-call and incident commander now",
    group: "Governance",
  },
  executiveApproval: {
    name: "Require Executive Approval",
    detail: "Gate execution behind executive sign-off",
    group: "Governance",
  },
  disableAutonomy: {
    name: "Disable Autonomous Execution",
    detail: "Force human-in-the-loop for this incident",
    group: "Agent Governance",
  },
  secondAgent: {
    name: "Require Verification Agent",
    detail: "Add an independent second agent to verify",
    group: "Agent Governance",
  },
  investigationAgent: {
    name: "Launch Investigation Agent",
    detail: "Spin up an additional diagnostic agent",
    group: "Agent Governance",
  },
  escalateHuman: {
    name: "Escalate to Human",
    detail: "Hand off from agent to on-call engineer",
    group: "Agent Governance",
  },
  autoApprove: {
    name: "Auto-approve Execution",
    detail: "Execute autonomously — no human approval required",
    group: "Execution Governance",
  },
  managerApproval: {
    name: "Require Manager Approval",
    detail: "Hold for service-owner or manager sign-off",
    group: "Execution Governance",
  },
  multiStageApproval: {
    name: "Require Multi-stage Approval",
    detail: "Sequential sign-off: owner → manager → change lead",
    group: "Execution Governance",
  },
  cabApproval: {
    name: "Require CAB Approval",
    detail: "Route to the Change Advisory Board for review",
    group: "Execution Governance",
  },
  ecabApproval: {
    name: "Require Emergency CAB (eCAB)",
    detail: "Convene the Emergency CAB for expedited sign-off",
    group: "Execution Governance",
  },
} satisfies Record<string, { name: string; detail: string; group: string }>;

interface ActionGroup {
  sec: string;
  keys: ActionKey[];
}
interface CondGroup {
  sec: string;
  fields: FieldKey[];
}

const ACT_GROUPS: ActionGroup[] = [
  {
    sec: "Execution Governance",
    keys: [
      "autoApprove",
      "managerApproval",
      "multiStageApproval",
      "cabApproval",
      "ecabApproval",
      "executiveApproval",
    ],
  },
  {
    sec: "Agent Governance",
    keys: [
      "disableAutonomy",
      "secondAgent",
      "investigationAgent",
      "escalateHuman",
    ],
  },
  {
    sec: "Governance",
    keys: [
      "requireApproval",
      "executiveReview",
      "createWorkbench",
      "blockAutomation",
      "escalateNow",
    ],
  },
  { sec: "Remediation", keys: ["autoRollback"] },
  {
    sec: "Incident",
    keys: [
      "createIncident",
      "escalateIncident",
      "updateIncident",
      "closeIncident",
    ],
  },
  {
    sec: "War Room",
    keys: ["startWarRoom", "addResponders", "assignCommander", "assignTeam"],
  },
  {
    sec: "Playbook",
    keys: ["attachPlaybook", "recommendPlaybook", "executePlaybook"],
  },
  {
    sec: "Knowledge",
    keys: ["searchSimilar", "attachResolutions", "attachRca", "attachRisks"],
  },
  {
    sec: "Mother / Child",
    keys: ["createChild", "linkChild", "propagateResolution", "syncFindings"],
  },
  { sec: "Notification", keys: ["sendNotification"] },
];

const COND_GROUPS: CondGroup[] = [
  {
    sec: "EXECUTION GOVERNANCE",
    fields: [
      "requiredApprovals",
      "changeType",
      "changeWindow",
      "emergencyOverride",
    ],
  },
  {
    sec: "AI ANALYSIS",
    fields: [
      "ezraConfidence",
      "rootCauseType",
      "investigationDuration",
      "evidenceQuality",
      "contradictoryFindings",
    ],
  },
  {
    sec: "REMEDIATION",
    fields: [
      "remediationRisk",
      "remediationConfidence",
      "rollbackAvailable",
      "blastRadius",
      "executionType",
    ],
  },
  {
    sec: "BUSINESS IMPACT",
    fields: [
      "revenueImpact",
      "customerImpact",
      "slaBreachRisk",
      "complianceRisk",
    ],
  },
  { sec: "AGENT GOVERNANCE", fields: ["environment", "serviceTier"] },
  {
    sec: "SERVICE & SIGNAL",
    fields: ["service", "health", "priority", "status", "category"],
  },
  {
    sec: "TIME & STATE",
    fields: [
      "timeOfDay",
      "dayOfWeek",
      "businessHours",
      "notAckFor",
      "incidentAge",
    ],
  },
  {
    sec: "CORRELATION",
    fields: [
      "childCount",
      "motherExists",
      "similarFound",
      "problemRecord",
      "knownRisk",
    ],
  },
];

const GUARD_CATALOG: GuardCatalogGroup[] = [
  {
    sec: "HUMAN RESPONSE",
    items: [
      {
        key: "ack",
        label: "Incident acknowledged",
        use: "A human already picked it up.",
      },
      {
        key: "responderActive",
        label: "Responder active",
        use: "An engineer is already investigating.",
        val: {
          def: 5,
          min: 1,
          max: 1440,
          unit: "min",
          pre: "within last",
          suf: "min",
        },
      },
      {
        key: "ownerAssigned",
        label: "Owner assigned",
        use: "Don't route the incident again.",
      },
      {
        key: "teamAssigned",
        label: "Owning team assigned",
        use: "Team ownership is established.",
      },
      {
        key: "icAssigned",
        label: "Incident commander assigned",
        use: "Leadership is handling the incident.",
      },
    ],
  },
  {
    sec: "INCIDENT STATE",
    items: [
      {
        key: "warRoomExists",
        label: "War room already exists",
        use: "Prevent duplicate war rooms.",
      },
      {
        key: "playbookAttached",
        label: "Playbook already attached",
        use: "Prevent duplicate playbook runs.",
      },
      {
        key: "linkedToParent",
        label: "Linked to a parent incident",
        use: "Avoid duplicate investigations.",
      },
      {
        key: "statusChanged",
        label: "Status is no longer Open",
        use: "Investigation already started.",
      },
      {
        key: "approvalGranted",
        label: "Approval already granted",
        use: "Avoid duplicate approval requests.",
      },
    ],
  },
  {
    sec: "SYSTEM & SIGNAL",
    items: [
      {
        key: "automationRunning",
        label: "Another automation running",
        use: "Prevent automation collisions.",
      },
      {
        key: "similarActive",
        label: "Similar incident active",
        use: "Avoid duplicate incident creation.",
        val: {
          def: 90,
          min: 1,
          max: 100,
          unit: "%",
          pre: "similarity >",
          suf: "%",
        },
      },
      {
        key: "serviceHealthy",
        label: "Service is healthy",
        use: "Incident self-resolved.",
      },
      {
        key: "signalCleared",
        label: "Triggering signal cleared",
        use: "The metric spike disappeared.",
      },
      {
        key: "inChangeWindow",
        label: "Within approved change window",
        use: "Disruption is expected.",
      },
    ],
  },
  {
    sec: "OVERRIDE",
    items: [
      {
        key: "execOverride",
        label: "Executive override enabled",
        use: "Leadership intentionally paused automation.",
      },
    ],
  },
  {
    sec: "INTELLIGENT · EZRA",
    items: [
      {
        key: "opConfidence",
        label: "Humans are already in control",
        use: "Ezra weighs war-room activity, responders, fresh findings, timeline updates and a drafted resolution.",
        val: {
          def: 80,
          min: 1,
          max: 100,
          unit: "%",
          pre: "confidence >",
          suf: "%",
        },
        intel: true,
      },
    ],
  },
];

const GUARD_FLAT: Record<string, GuardItem> = {};
GUARD_CATALOG.forEach((g) =>
  g.items.forEach((it) => {
    GUARD_FLAT[it.key] = it;
  }),
);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Day = (typeof DAYS)[number];

// ─── TOKENS ──────────────────────────────────────────────────────────────────

const T = {
  indigo: "#5b5ef0",
  indigoSoft: "#eef0fe",
  indigoLine: "#dfe1fb",
  indigoInk: "#4a4dd6",
  green: "#00c896",
  greenSoft: "#e4faf2",
  greenInk: "#089a76",
  red: "#ef4444",
  teal: "#0d9488",
  amber: "#f59e0b",
  amberSoft: "#fef3e2",
  ink: "#15171c",
  ink2: "#5a6072",
  ink3: "#8b91a3",
  border: "#e7e9ee",
  borderStrong: "#d8dbe2",
  surface: "#ffffff",
  surface2: "#fbfcfd",
  bg: "#f7f8fa",
  lav: "#eef0f8",
} as const;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

let _uid = 1;
const nid = (): string => "n" + _uid++;

function defaultVal(f: FieldDef): string {
  switch (f.val.type) {
    case VT.PRIORITY:
      return "P1";
    case VT.SELECT:
      return (f.val as { type: "select"; options: string[] }).options[0] ?? "";
    case VT.NUM:
      return "";
    case VT.DURATION:
      return "15 minutes";
    case VT.BOOL:
      return (f.val as { type: "bool"; fixed?: boolean }).fixed ? "" : "Yes";
    default:
      return "";
  }
}

function mkCondition(
  field: FieldKey,
  over: Partial<Condition> = {},
): Condition {
  const f = FIELDS[field];
  return {
    id: nid(),
    kind: "cond",
    connector: "AND",
    field,
    op: f.ops[0],
    value: defaultVal(f),
    days: [],
    t1: "09:00",
    t2: "18:00",
    ...over,
  };
}

// ─── SEED STATE ──────────────────────────────────────────────────────────────

const SEED_CONDITIONS: Condition[] = [
  mkCondition("environment", { op: "equals", value: "Production" }),
  mkCondition("serviceTier", {
    connector: "AND",
    op: "is any of",
    value: "Tier-1",
  }),
  mkCondition("ezraConfidence", {
    connector: "AND",
    op: "less than",
    value: "90",
  }),
  mkCondition("remediationRisk", {
    connector: "AND",
    op: "equals",
    value: "High",
  }),
  mkCondition("blastRadius", {
    connector: "OR",
    op: "greater than",
    value: "10",
  }),
];

const SEED_ACTIONS: RuleAction[] = [
  { id: nid(), key: "disableAutonomy", detail: ACTIONS.disableAutonomy.detail },
  { id: nid(), key: "secondAgent", detail: ACTIONS.secondAgent.detail },
  { id: nid(), key: "requireApproval", detail: ACTIONS.requireApproval.detail },
  {
    id: nid(),
    key: "sendNotification",
    detail: ACTIONS.sendNotification.detail,
  },
];

const SEED_GUARDS: Guard[] = [
  { id: nid(), key: "ack" },
  { id: nid(), key: "responderActive", value: 5 },
  { id: nid(), key: "opConfidence", value: 80 },
];

// ─── BTN WRAPPER ─────────────────────────────────────────────────────────────

const VARIANT_CLASSES: Record<BtnVariant, string> = {
  default:
    "!bg-white !text-[#15171c] !border !border-[#d8dbe2] shadow-sm hover:!bg-[#fbfcfd]",
  primary: "!bg-[#5b5ef0] hover:!bg-[#4f52ea] !text-white !border-[#5b5ef0]",
  ghost:
    "!bg-transparent !border-transparent !text-[#5b5ef0] !shadow-none hover:!bg-[#eef0fe]",
  danger: "!bg-white !text-red-500 !border !border-[#d8dbe2] hover:!bg-red-50",
  good: "!bg-white !text-[#089a76] !border !border-[#d8dbe2] hover:!bg-[#e4faf2]",
};

const SIZE_CLASSES: Record<BtnSize, string> = {
  sm: "!h-auto !w-auto !py-1.5 !px-3 !text-[13px]",
  md: "!h-auto !w-auto !py-2 !px-4 !text-[13.5px]",
};

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  size?: BtnSize;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

function Btn({
  children,
  onClick,
  variant = "default",
  size = "md",
  type = "button",
  disabled,
  className = "",
}: BtnProps): React.JSX.Element {
  return (
    <CButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-2 font-semibold rounded-lg whitespace-nowrap transition-colors",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ].join(" ")}
    >
      {children}
    </CButton>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────

interface ToastProps {
  toasts: ToastItem[];
}

function Toast({ toasts }: ToastProps): React.JSX.Element {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 22,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#1d2027",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 500,
            minWidth: 260,
            boxShadow: "0 12px 30px rgba(16,24,40,.3)",
          }}
        >
          {t.kind === "good" ? (
            <Check size={17} color={T.green} />
          ) : (
            <Info size={17} color="#8ab4ff" />
          )}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: RuleStatus;
}

function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  const map: Record<RuleStatus, { bg: string; color: string; label: string }> =
    {
      enabled: { bg: T.indigoSoft, color: T.indigoInk, label: "Enabled" },
      draft: { bg: T.amberSoft, color: "#b9760a", label: "Draft" },
      disabled: { bg: "#eef0f3", color: T.ink2, label: "Disabled" },
    };
  const s = map[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 999,
        background: s.bg,
        color: s.color,
      }}
    >
      <Shield size={13} /> {s.label}
    </span>
  );
}

// ─── CONNECTOR CHIP ──────────────────────────────────────────────────────────

interface ConnectorChipProps {
  value: Connector;
  onChange: (v: Connector) => void;
}

function ConnectorChip({
  value,
  onChange,
}: ConnectorChipProps): React.JSX.Element {
  const colors: Record<
    Connector,
    { bg: string; color: string; border: string }
  > = {
    AND: { bg: T.lav, color: "#6b7280", border: "#e1e4ee" },
    OR: { bg: "#fff4ec", color: "#c2691f", border: "#f4ddc9" },
    NOT: { bg: "#fdeef0", color: "#c43b4d", border: "#f6d6dc" },
  };
  const c = colors[value];
  const seq: Connector[] = ["AND", "OR", "NOT"];
  const cycle = (): void => onChange(seq[(seq.indexOf(value) + 1) % 3]);
  return (
    <button
      onClick={cycle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".04em",
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
        padding: "4px 8px",
        borderRadius: 7,
        minWidth: 48,
        cursor: "pointer",
      }}
    >
      {value} <ChevronDown size={11} />
    </button>
  );
}

// ─── VALUE CELL ──────────────────────────────────────────────────────────────

interface ValueCellProps {
  cond: Condition;
  onChange: (patch: Partial<Condition>) => void;
}

function ValueCell({ cond, onChange }: ValueCellProps): React.JSX.Element {
  const f = FIELDS[cond.field];
  const t = f.val.type;
  const inp: CSSProperties = {
    width: "100%",
    height: "100%",
    minHeight: 42,
    border: `1px solid ${T.borderStrong}`,
    borderRadius: 10,
    padding: "9px 12px",
    fontSize: 13.5,
    fontWeight: 500,
    background: T.surface,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  if (t === VT.PRIORITY)
    return (
      <select
        value={cond.value}
        onChange={(e) => onChange({ value: e.target.value })}
        style={{ ...inp, cursor: "pointer", appearance: "auto" }}
      >
        {["P0", "P1", "P2", "P3"].map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
    );
  if (t === VT.SELECT)
    return (
      <select
        value={cond.value}
        onChange={(e) => onChange({ value: e.target.value })}
        style={{ ...inp, cursor: "pointer", appearance: "auto" }}
      >
        {(f.val as { type: "select"; options: string[] }).options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  if (t === VT.DURATION)
    return (
      <select
        value={cond.value}
        onChange={(e) => onChange({ value: e.target.value })}
        style={{ ...inp, cursor: "pointer", appearance: "auto" }}
      >
        {[
          "5 minutes",
          "10 minutes",
          "15 minutes",
          "30 minutes",
          "60 minutes",
        ].map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  if (t === VT.BOOL) {
    const boolVal = f.val as { type: "bool"; fixed?: boolean };
    if (boolVal.fixed)
      return (
        <input
          readOnly
          value={cond.op === "exists" ? "Yes" : "No"}
          style={{ ...inp, opacity: 0.7, cursor: "default" }}
        />
      );
    return (
      <select
        value={cond.value}
        onChange={(e) => onChange({ value: e.target.value })}
        style={{ ...inp, cursor: "pointer", appearance: "auto" }}
      >
        <option>Yes</option>
        <option>No</option>
      </select>
    );
  }
  if (t === VT.DAYS)
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 5,
          alignItems: "center",
          border: `1px solid ${T.borderStrong}`,
          borderRadius: 10,
          padding: "6px 8px",
          minHeight: 42,
          background: T.surface,
        }}
      >
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() =>
              onChange({
                days: cond.days.includes(d)
                  ? cond.days.filter((x) => x !== d)
                  : [...cond.days, d],
              })
            }
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              padding: "4px 9px",
              borderRadius: 6,
              cursor: "pointer",
              border: `1px solid ${cond.days.includes(d) ? T.indigoLine : "transparent"}`,
              background: cond.days.includes(d) ? T.indigoSoft : T.bg,
              color: cond.days.includes(d) ? T.indigoInk : T.ink2,
            }}
          >
            {d}
          </button>
        ))}
      </div>
    );
  if (t === VT.TIMERANGE)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: `1px solid ${T.borderStrong}`,
          borderRadius: 10,
          padding: "6px 12px",
          minHeight: 42,
          background: T.surface,
        }}
      >
        <input
          type="time"
          value={cond.t1}
          onChange={(e) => onChange({ t1: e.target.value })}
          style={{
            border: "none",
            background: "none",
            fontFamily: "inherit",
            fontWeight: 600,
            fontSize: 13,
            outline: "none",
          }}
        />
        <span style={{ color: T.ink3 }}>–</span>
        <input
          type="time"
          value={cond.t2}
          onChange={(e) => onChange({ t2: e.target.value })}
          style={{
            border: "none",
            background: "none",
            fontFamily: "inherit",
            fontWeight: 600,
            fontSize: 13,
            outline: "none",
          }}
        />
      </div>
    );
  // NUM / TEXT
  const numVal = f.val as { type: "num"; unit?: string; placeholder?: string };
  return (
    <input
      type={t === VT.NUM ? "number" : "text"}
      value={cond.value}
      placeholder={numVal.placeholder ?? "Enter value"}
      onChange={(e) => onChange({ value: e.target.value })}
      style={inp}
    />
  );
}

// ─── CONDITION ROW ───────────────────────────────────────────────────────────

interface ConditionRowProps {
  cond: Condition;
  index: number;
  onUpdate: (patch: Partial<Condition>) => void;
  onRemove: () => void;
}

function ConditionRow({
  cond,
  index,
  onUpdate,
  onRemove,
}: ConditionRowProps): React.JSX.Element {
  const f = FIELDS[cond.field];
  const sel: CSSProperties = {
    height: 42,
    border: `1px solid ${T.borderStrong}`,
    borderRadius: 10,
    padding: "9px 12px",
    fontSize: 13.5,
    fontWeight: 500,
    background: T.surface,
    fontFamily: "inherit",
    outline: "none",
    cursor: "pointer",
    appearance: "auto",
    boxSizing: "border-box",
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 9,
      }}
    >
      <div
        style={{
          flex: "0 0 60px",
          display: "flex",
          justifyContent: "center",
          paddingTop: 9,
        }}
      >
        {index === 0 ? (
          <span
            style={{
              fontSize: 11,
              color: T.ink3,
              fontWeight: 600,
              padding: "4px 8px",
            }}
          >
            IF
          </span>
        ) : (
          <ConnectorChip
            value={cond.connector}
            onChange={(v) => onUpdate({ connector: v })}
          />
        )}
      </div>
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns:
            "minmax(150px,1.05fr) minmax(120px,.78fr) minmax(150px,1.25fr) auto",
          gap: 9,
          alignItems: "stretch",
        }}
      >
        <select
          value={cond.field}
          onChange={(e) => {
            const key = e.target.value as FieldKey;
            const nf = FIELDS[key];
            onUpdate({
              field: key,
              op: nf.ops[0],
              value: defaultVal(nf),
              days: [],
              t1: "09:00",
              t2: "18:00",
            });
          }}
          style={sel}
        >
          {COND_GROUPS.map((g) => (
            <optgroup key={g.sec} label={g.sec}>
              {g.fields.map((k) => (
                <option key={k} value={k}>
                  {FIELDS[k].label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <select
          value={cond.op}
          onChange={(e) => onUpdate({ op: e.target.value })}
          style={sel}
        >
          {f.ops.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ValueCell cond={cond} onChange={onUpdate} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            paddingTop: 3,
          }}
        >
          {/* {f?.hint && (
            <button
              type="button"
              title={f.hint}
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                border: "none",
                background: "none",
                color: T.ink3,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Info size={15} />
            </button>
          )} */}
          <button
            type="button"
            onClick={onRemove}
            title="Remove condition"
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              border: "none",
              background: "none",
              color: T.ink3,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ACTION ROW ──────────────────────────────────────────────────────────────

interface ActionRowProps {
  action: RuleAction;
  onUpdateDetail: (d: string) => void;
  onRemove: () => void;
}

function ActionRow({
  action,
  onUpdateDetail,
  onRemove,
}: ActionRowProps): React.JSX.Element {
  const meta = ACTIONS[action.key];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 12px",
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        background: T.surface,
        marginBottom: 8,
      }}
    >
      <div style={{ cursor: "grab", color: T.ink3, display: "flex" }}>
        <GripVertical size={16} />
      </div>
      <div
        style={{
          flex: "0 0 26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.indigo,
        }}
      >
        <Zap size={18} />
      </div>
      <div
        style={{
          flex: "0 0 200px",
          fontWeight: 600,
          fontSize: 13.5,
          color: T.ink,
        }}
      >
        {meta.name}
      </div>
      <div style={{ flex: 1 }}>
        <input
          value={action.detail}
          onChange={(e) => onUpdateDetail(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid transparent",
            borderRadius: 7,
            padding: "6px 9px",
            fontSize: 13,
            color: T.ink2,
            background: "transparent",
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = `1px solid ${T.indigo}`;
            e.currentTarget.style.background = "#fff";
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = "1px solid transparent";
            e.currentTarget.style.background = "transparent";
          }}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        style={{
          width: 30,
          height: 30,
          borderRadius: 7,
          border: "none",
          background: "none",
          color: T.ink3,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

// ─── GUARD ROW ───────────────────────────────────────────────────────────────

interface GuardRowProps {
  guard: Guard;
  onUpdateVal: (v: string) => void;
  onRemove: () => void;
}

function GuardRow({
  guard,
  onUpdateVal,
  onRemove,
}: GuardRowProps): React.JSX.Element | null {
  const m = GUARD_FLAT[guard.key];
  if (!m) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        border: `1px solid ${m.intel ? "#c7ebe6" : T.border}`,
        background: m.intel
          ? "linear-gradient(180deg,#f3fbfa 0%,#fbfdfd 100%)"
          : T.surface,
        borderRadius: 10,
        padding: "9px 11px",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          flex: "0 0 28px",
          height: 28,
          borderRadius: 8,
          background: "#ecf8f6",
          border: "1px solid #d3ede8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Shield size={15} color="#0c8478" />
      </div>
      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: T.ink }}>
        {m.label}
      </span>
      {m.val && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            color: T.ink2,
            whiteSpace: "nowrap",
          }}
        >
          {m.val.pre}
          <input
            type="number"
            min={m.val.min}
            max={m.val.max}
            value={guard.value ?? m.val.def}
            onChange={(e) => onUpdateVal(e.target.value)}
            style={{
              width: 56,
              border: `1px solid ${T.borderStrong}`,
              borderRadius: 7,
              padding: "5px 8px",
              textAlign: "center",
              fontFamily: "monospace",
              fontWeight: 600,
              fontSize: 13,
              outline: "none",
              background: T.surface,
            }}
          />
          {m.val.suf}
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          border: "none",
          background: "none",
          color: T.ink3,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}

// ─── EXECUTION CONTROLS ──────────────────────────────────────────────────────

interface ExecControlsProps {
  controls: ControlsState;
  onChange: (path: ControlPath, value: string) => void;
}

function ExecControls({
  controls,
  onChange,
}: ExecControlsProps): React.JSX.Element {
  const SCOPES: [ScopeOption, string][] = [
    ["incident", "same incident"],
    ["service", "same service"],
    ["service+priority", "same service + priority"],
  ];
  const MAX_PER: [MaxPerOption, string][] = [
    ["hour", "/ hour"],
    ["day", "/ day"],
    ["incident", "/ incident"],
  ];
  const RETRIES: [RetryOption, string][] = [
    ["none", "No retry"],
    ["once", "Retry once"],
    ["3x", "Retry 3× (backoff)"],
    ["5x", "Retry 5× (backoff)"],
  ];
  const APPROVALS = [
    "None",
    "Auto-approved",
    "Manager approval",
    "Multi-stage approval",
    "CAB approval",
    "Emergency CAB (eCAB)",
    "Executive approval",
  ];
  const cell: CSSProperties = { background: T.surface, padding: "14px 15px" };
  const lbl: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 12,
    fontWeight: 700,
    color: T.ink,
    marginBottom: 10,
  };
  const inp: CSSProperties = {
    height: 36,
    border: `1px solid ${T.borderStrong}`,
    borderRadius: 7,
    padding: "7px 9px",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    background: T.surface,
    boxSizing: "border-box",
  };
  const help: CSSProperties = {
    fontSize: 11,
    color: T.ink3,
    marginTop: 8,
    lineHeight: 1.4,
  };
  return (
    <div
      style={{
        marginTop: 22,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 16px",
          background: T.surface2,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div
          style={{
            width: 29,
            height: 29,
            borderRadius: 8,
            background: "#eef0f4",
            border: `1px solid ${T.borderStrong}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Zap size={15} color="#64748b" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: T.ink }}>
            Execution controls
          </div>
          <div style={{ fontSize: 11.5, color: T.ink3, marginTop: 1 }}>
            The run envelope applied once the rule clears its guards.
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 1,
          background: T.border,
        }}
      >
        <div style={cell}>
          <div style={lbl}>
            <VolumeX size={14} color={T.ink3} /> Suppression window
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexWrap: "wrap",
            }}
          >
            <input
              type="number"
              min="1"
              max="1440"
              value={controls.window.minutes}
              onChange={(e) => onChange("win.min", e.target.value)}
              style={{ ...inp, width: 56, textAlign: "center" }}
            />
            <span style={{ fontSize: 12, color: T.ink2 }}>min ·</span>
            <select
              value={controls.window.scope}
              onChange={(e) => onChange("win.scope", e.target.value)}
              style={{ ...inp, flex: 1 }}
            >
              {SCOPES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div style={help}>
            Don't re-run for the same scope inside this window.
          </div>
        </div>
        <div style={cell}>
          <div style={lbl}>
            <Zap size={14} color={T.ink3} /> Maximum executions
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <input
              type="number"
              min="1"
              max="999"
              value={controls.maxExecutions.count}
              onChange={(e) => onChange("max.count", e.target.value)}
              style={{ ...inp, width: 56, textAlign: "center" }}
            />
            <select
              value={controls.maxExecutions.per}
              onChange={(e) => onChange("max.per", e.target.value)}
              style={{ ...inp, flex: 1 }}
            >
              {MAX_PER.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div style={help}>Cap how often this rule can fire.</div>
        </div>
        <div style={cell}>
          <div style={lbl}>
            <RefreshCw size={14} color={T.ink3} /> Retry policy
          </div>
          <select
            value={controls.retry}
            onChange={(e) => onChange("retry", e.target.value)}
            style={{ ...inp, width: "100%" }}
          >
            {RETRIES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <div style={help}>What happens when an action fails.</div>
        </div>
        <div style={cell}>
          <div style={lbl}>
            <Users size={14} color={T.ink3} /> Concurrency limit
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <input
              type="number"
              min="1"
              max="99"
              value={controls.concurrency}
              onChange={(e) => onChange("conc", e.target.value)}
              style={{ ...inp, width: 56, textAlign: "center" }}
            />
            <span style={{ fontSize: 12, color: T.ink2 }}>at a time</span>
          </div>
          <div style={help}>Parallel runs allowed.</div>
        </div>
        <div style={cell}>
          <div style={lbl}>
            <Check size={14} color={T.ink3} /> Approval requirement
          </div>
          <select
            value={controls.approval}
            onChange={(e) => onChange("approval", e.target.value)}
            style={{ ...inp, width: "100%" }}
          >
            {APPROVALS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <div style={help}>
            Gate the actions behind sign-off before they run.
          </div>
        </div>
        <div style={cell}>
          <div style={lbl}>
            <Clock size={14} color={T.ink3} /> Execution timeout
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <input
              type="number"
              min="1"
              max="1440"
              value={controls.timeout}
              onChange={(e) => onChange("timeout", e.target.value)}
              style={{ ...inp, width: 56, textAlign: "center" }}
            />
            <span style={{ fontSize: 12, color: T.ink2 }}>min</span>
          </div>
          <div style={help}>Abort the run if it exceeds this.</div>
        </div>
      </div>
    </div>
  );
}

// ─── RULE SUMMARY ────────────────────────────────────────────────────────────

function condPhrase(c: Condition): string {
  const f = FIELDS[c.field];
  if (f.val.type === VT.DAYS)
    return `${f.label} ${c.op} ${c.days.length ? c.days.join(", ") : "—"}`;
  if (f.val.type === VT.TIMERANGE) return `${f.label} ${c.op} ${c.t1}–${c.t2}`;
  if (
    f.val.type === VT.BOOL &&
    (f.val as { type: "bool"; fixed?: boolean }).fixed
  )
    return `${f.label} ${c.op}`;
  let v = c.value === "" || c.value == null ? "—" : String(c.value);
  const hasUnit = "unit" in f.val && f.val.unit;
  //   if (hasUnit && v !== "—")
  //     v = f.val.unit === "%" ? `${v}%` : `${v} ${f.val.unit}`;
  return `${f.label} ${c.op} ${v}`;
}

interface RuleSummaryProps {
  conditions: AnyCondition[];
  actions: RuleAction[];
  matchType: MatchType;
  guards: Guard[];
  guardMatch: GuardMatch;
  controls: ControlsState;
  schedule: ScheduleState;
}

function RuleSummary({
  conditions,
  actions,
  matchType,
  guards,
  guardMatch,
  controls,
  schedule,
}: RuleSummaryProps): React.JSX.Element {
  const parts = conditions.map((c, i) => {
    const phrase =
      c.kind === "group"
        ? `(${c.children.map((cc) => condPhrase(cc)).join(c.matchType === "any" ? " OR " : " AND ")})`
        : condPhrase(c);
    return i > 0 ? `${c.connector} ${phrase}` : phrase;
  });
  const whenText =
    schedule.mode === "at" && schedule.date
      ? `Activates ${schedule.date}${schedule.time ? ` at ${schedule.time}` : ""}.`
      : "Evaluated continuously, in real time.";
  const guardLabels = guards
    .map((g) => GUARD_FLAT[g.key]?.label?.toLowerCase())
    .filter(Boolean);
  const unlessText = guardLabels.length
    ? `Skip when ${guardMatch} of these are active: ${guardLabels.slice(0, 3).join(", ")}${guardLabels.length > 3 ? ` +${guardLabels.length - 3} more` : ""}.`
    : "No suppression guards — actions always run when conditions match.";
  const scopeLabel =
    (["incident", "service", "service+priority"] as ScopeOption[]).find(
      (s) => s === controls.window.scope,
    ) ?? "incident";
  const ctrlText = `Re-runs held ${controls.window.minutes} min (${scopeLabel}); max ${controls.maxExecutions.count}/${controls.maxExecutions.per}; timeout ${controls.timeout} min${controls.approval !== "None" ? `; ${controls.approval.toLowerCase()} required` : ""}.`;
  const actText =
    actions.map((a) => ACTIONS[a.key].name).join(", ") || "No actions defined.";
  const ifText = parts.join(" ") || "No conditions defined.";

  const SummaryRow = ({
    label,
    bg,
    text,
  }: {
    label: string;
    bg: string;
    text: string;
  }): React.JSX.Element => (
    <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
      <span
        style={{
          display: "inline-block",
          fontWeight: 800,
          fontSize: 10.5,
          letterSpacing: ".05em",
          color: "#fff",
          padding: "3px 8px",
          borderRadius: 6,
          background: bg,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {label}
      </span>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: T.ink }}>{text}</div>
    </div>
  );

  return (
    <div>
      <SummaryRow label="WHEN" bg="#8b5cf6" text={whenText} />
      <SummaryRow label="IF" bg={T.indigo} text={ifText} />
      <SummaryRow label="THEN" bg={T.green} text={actText} />
      <SummaryRow label="UNLESS" bg={T.teal} text={unlessText} />
      <SummaryRow label="RUN" bg="#64748b" text={ctrlText} />
    </div>
  );
}

// ─── TEST PANEL ──────────────────────────────────────────────────────────────

type TestCtx = Record<string, string | number | boolean>;

interface TestResult {
  triggered: boolean;
  ctx: TestCtx;
  actNames: string[];
}

interface TestPanelProps {
  conditions: AnyCondition[];
  actions: RuleAction[];
  matchType: MatchType;
}

function TestPanel({
  conditions,
  actions,
  matchType,
}: TestPanelProps): React.JSX.Element {
  const [result, setResult] = useState<TestResult | { error: string } | null>(
    null,
  );

  const run = (): void => {
    const leaves: Condition[] = [];
    conditions.forEach((c) => {
      if (c.kind === "group") c.children.forEach((cc) => leaves.push(cc));
      else leaves.push(c);
    });
    if (!leaves.length) {
      setResult({ error: "Add at least one condition first." });
      return;
    }

    const ctx: TestCtx = {
      service: "Checkout Service",
      priority: "P1",
      environment: "Production",
      serviceTier: "Tier-1",
      ezraConfidence: 75,
      remediationRisk: "High",
      blastRadius: 15,
    };
    leaves.forEach((c) => {
      const f = FIELDS[c.field];
      if (f.val.type === VT.NUM) ctx[c.field] = parseFloat(c.value) || 0;
      else if (f.val.type === VT.SELECT || f.val.type === VT.PRIORITY)
        ctx[c.field] = c.value;
      else if (f.val.type === VT.BOOL) ctx[c.field] = c.value === "Yes";
    });

    const evalC = (c: Condition): boolean => {
      const f = FIELDS[c.field];
      const v = ctx[c.field];
      if (v === undefined) return true;
      if (f.val.type === VT.NUM) {
        const a = Number(v),
          b = Number(c.value);
        if (c.op === "greater than") return a > b;
        if (c.op === "greater or equal") return a >= b;
        if (c.op === "less than") return a < b;
        if (c.op === "less or equal") return a <= b;
        return a === b;
      }
      if (f.val.type === VT.SELECT || f.val.type === VT.PRIORITY) {
        if (c.op === "not equals") return v !== c.value;
        if (c.op === "is any of")
          return c.value.split(/\s*,\s*/).includes(String(v));
        return v === c.value;
      }
      if (f.val.type === VT.BOOL) return (v === true) === (c.value === "Yes");
      return true;
    };

    const results = conditions.map((c) =>
      c.kind === "group"
        ? c.matchType === "any"
          ? c.children.some(evalC)
          : c.children.every(evalC)
        : evalC(c),
    );
    const triggered = !results.length
      ? true
      : matchType === "any"
        ? results.some(Boolean)
        : matchType === "none"
          ? !results.some(Boolean)
          : results.every(Boolean);

    setResult({
      triggered,
      ctx,
      actNames: actions.map((a) => ACTIONS[a.key].name),
    });
  };

  return (
    <div>
      <Btn onClick={run} variant="primary" className="w-full justify-center">
        <Play size={14} fill="currentColor" /> Run test
      </Btn>
      {result && (
        <div
          style={{
            marginTop: 16,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 14,
          }}
        >
          {"error" in result ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: T.red,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <Info size={15} /> {result.error}
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  fontWeight: 700,
                  fontSize: 14,
                  marginBottom: 10,
                  color: result.triggered ? T.greenInk : T.red,
                }}
              >
                {result.triggered ? <Check size={18} /> : <X size={18} />}
                {result.triggered
                  ? "Rule will trigger"
                  : "Rule will not trigger"}
              </div>
              <p style={{ fontSize: 12, color: T.ink3, margin: "10px 0 5px" }}>
                Simulated event values:
              </p>
              <div
                style={{
                  border: `1px solid ${T.border}`,
                  borderRadius: 7,
                  overflow: "hidden",
                  background: T.surface2,
                  marginBottom: 10,
                }}
              >
                {Object.entries(result.ctx)
                  .slice(0, 6)
                  .map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "7px 12px",
                        fontSize: 12.5,
                        borderBottom: `1px solid ${T.border}`,
                      }}
                    >
                      <span style={{ color: T.ink2 }}>
                        {FIELDS[k as FieldKey]?.label ?? k}
                      </span>
                      <b style={{ color: T.ink }}>{String(v)}</b>
                    </div>
                  ))}
              </div>
              {result.triggered && (
                <>
                  <p style={{ fontSize: 12, color: T.ink3, margin: "0 0 5px" }}>
                    Actions that would run:
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      fontSize: 13,
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {result.actNames.length ? (
                      result.actNames.map((a) => (
                        <li
                          key={a}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "3px 0",
                            color: T.ink2,
                          }}
                        >
                          <Check size={15} color={T.green} /> {a}
                        </li>
                      ))
                    ) : (
                      <li style={{ color: T.ink3 }}>No actions configured</li>
                    )}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DROPDOWN ────────────────────────────────────────────────────────────────

interface DropdownProps {
  items: DropdownItem[];
  onClose: () => void;
}

function Dropdown({ items, onClose }: DropdownProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("click", fn, true), 0);
    return () => document.removeEventListener("click", fn, true);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        zIndex: 60,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        boxShadow: "0 12px 40px rgba(20,23,33,.16)",
        padding: 6,
        minWidth: 240,
        maxHeight: 340,
        overflowY: "auto",
        top: "calc(100% + 6px)",
        left: 0,
      }}
    >
      {items.map((item, i) => {
        if (item.type === "sep")
          return (
            <div
              key={i}
              style={{ height: 1, background: T.border, margin: "4px 0" }}
            />
          );
        if (item.type === "label")
          return (
            <div
              key={i}
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".07em",
                color: T.ink3,
                margin: "8px 8px 4px",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </div>
          );
        return (
          <button
            key={i}
            type="button"
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              textAlign: "left",
              padding: "9px 10px",
              borderRadius: 8,
              border: "none",
              background: "none",
              fontSize: 13.5,
              color: T.ink,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              gap: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.bg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

type DropKey = "match" | "cond" | "action" | "guard" | null;

export default function OperationalRuleBuilder(): React.JSX.Element {
  const [ruleName, setRuleName] = useState<string>(
    "Production agent autonomy guardrail",
  );
  const [ruleDesc, setRuleDesc] = useState<string>(
    "Force human-in-the-loop for autonomous agents on production, tier-1 services. When Ezra's diagnostic confidence is low, remediation risk is high, or the blast radius is wide, disable autonomous execution, add an independent verification agent, and hold remediation for human approval.",
  );
  const [status, setStatus] = useState<RuleStatus>("enabled");
  const [matchType, setMatchType] = useState<MatchType>("all");
  const [conditions, setConditions] = useState<AnyCondition[]>(SEED_CONDITIONS);
  const [actions, setActions] = useState<RuleAction[]>(SEED_ACTIONS);
  const [guards, setGuards] = useState<Guard[]>(SEED_GUARDS);
  const [guardMatch, setGuardMatch] = useState<GuardMatch>("any");
  const [controls, setControls] = useState<ControlsState>({
    window: { minutes: 30, scope: "incident" },
    maxExecutions: { count: 10, per: "hour" },
    retry: "once",
    concurrency: 1,
    approval: "None",
    timeout: 15,
  });
  const [schedule, setSchedule] = useState<ScheduleState>({
    mode: "always",
    date: "",
    time: "",
    repeat: "Once",
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [openDrop, setOpenDrop] = useState<DropKey>(null);
  const [showSched, setShowSched] = useState<boolean>(false);
  const [lastMod, setLastMod] = useState<string>("05 Jan 2026, 14:15");

  const toast = useCallback(
    (msg: string, kind: ToastItem["kind"] = "good"): void => {
      const id = Date.now();
      setToasts((t) => [...t, { id, msg, kind }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    },
    [],
  );

  const stamp = useCallback((): void => {
    const d = new Date();
    const mo = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][d.getMonth()];
    setLastMod(
      `${String(d.getDate()).padStart(2, "0")} ${mo} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    );
  }, []);

  // ── mutations ──
  const addCondition = (field: FieldKey = "ezraConfidence"): void => {
    setConditions((cs) => [...cs, mkCondition(field, { connector: "AND" })]);
    stamp();
  };
  const updateCond = (id: string, patch: Partial<Condition>): void => {
    setConditions((cs) =>
      cs.map((c: any) => (c.id === id ? { ...c, ...patch } : c)),
    );
    stamp();
  };
  const removeCond = (id: string): void => {
    setConditions((cs) => cs.filter((c) => c.id !== id));
    stamp();
  };

  const addAction = (key: ActionKey): void => {
    setActions((as) => [
      ...as,
      { id: nid(), key, detail: ACTIONS[key].detail },
    ]);
    stamp();
  };
  const removeAction = (id: string): void => {
    setActions((as) => as.filter((a) => a.id !== id));
    stamp();
  };
  const updateAction = (id: string, detail: string): void => {
    setActions((as) => as.map((a) => (a.id === id ? { ...a, detail } : a)));
  };

  const addGuard = (key: string): void => {
    if (guards.some((g) => g.key === key)) {
      toast("That guard is already added", "info");
      return;
    }
    const m = GUARD_FLAT[key];
    const g: Guard = { id: nid(), key };
    if (m?.val) g.value = m.val.def;
    setGuards((gs) => [...gs, g]);
    toast(`${m?.label ?? key} added`);
    stamp();
  };
  const removeGuard = (id: string): void => {
    setGuards((gs) => gs.filter((g) => g.id !== id));
    stamp();
  };
  const updateGuard = (id: string, v: string): void => {
    setGuards((gs) =>
      gs.map((g) =>
        g.id === id
          ? { ...g, value: parseInt(v, 10) || GUARD_FLAT[g.key]?.val?.def }
          : g,
      ),
    );
  };

  const updateControl = (path: ControlPath, v: string): void => {
    setControls((prev) => {
      const nc: ControlsState = JSON.parse(JSON.stringify(prev));
      switch (path) {
        case "win.min":
          nc.window.minutes = Math.max(1, Math.min(1440, parseInt(v, 10) || 1));
          break;
        case "win.scope":
          nc.window.scope = v as ScopeOption;
          break;
        case "max.count":
          nc.maxExecutions.count = Math.max(
            1,
            Math.min(999, parseInt(v, 10) || 1),
          );
          break;
        case "max.per":
          nc.maxExecutions.per = v as MaxPerOption;
          break;
        case "retry":
          nc.retry = v as RetryOption;
          break;
        case "conc":
          nc.concurrency = Math.max(1, Math.min(99, parseInt(v, 10) || 1));
          break;
        case "approval":
          nc.approval = v;
          break;
        case "timeout":
          nc.timeout = Math.max(1, Math.min(1440, parseInt(v, 10) || 1));
          break;
      }
      return nc;
    });
    stamp();
  };

  // ── dropdown items ──
  const matchItems: DropdownItem[] = [
    {
      label: "All of the following conditions are true (AND)",
      onClick: () => {
        setMatchType("all");
        stamp();
      },
    },
    {
      label: "Any of the following conditions are true (OR)",
      onClick: () => {
        setMatchType("any");
        stamp();
      },
    },
    {
      label: "None of the following conditions are true (NOT)",
      onClick: () => {
        setMatchType("none");
        stamp();
      },
    },
  ];
  const actionItems: DropdownItem[] = ACT_GROUPS.flatMap((g, i) => [
    ...(i > 0 ? [{ type: "sep" as const }] : []),
    { type: "label" as const, label: g.sec },
    ...g.keys
      .filter((k) => k in ACTIONS)
      .map((k) => ({
        label: ACTIONS[k].name,
        onClick: () => {
          addAction(k);
          toast(`${ACTIONS[k].name} added`);
        },
      })),
  ]);
  const condFieldItems: DropdownItem[] = COND_GROUPS.flatMap((g, i) => [
    ...(i > 0 ? [{ type: "sep" as const }] : []),
    { type: "label" as const, label: g.sec },
    ...g.fields.map((f) => ({
      label: FIELDS[f].label,
      onClick: () => addCondition(f),
    })),
  ]);
  const addedKeys = new Set(guards.map((g) => g.key));
  const guardItems: DropdownItem[] = GUARD_CATALOG.flatMap((g, i) => [
    ...(i > 0 ? [{ type: "sep" as const }] : []),
    { type: "label" as const, label: g.sec },
    ...g.items
      .filter((it) => !addedKeys.has(it.key))
      .map((it) => ({ label: it.label, onClick: () => addGuard(it.key) })),
  ]);

  const card: CSSProperties = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    boxShadow: "0 1px 2px rgba(20,23,33,.04),0 1px 3px rgba(20,23,33,.06)",
  };
  const inp: CSSProperties = {
    width: "100%",
    border: `1px solid ${T.borderStrong}`,
    borderRadius: 10,
    padding: "10px 13px",
    fontSize: 14,
    background: T.surface,
    fontFamily: "inherit",
    outline: "none",
    color: T.ink,
    boxSizing: "border-box",
  };

  const ruleJson = JSON.stringify(
    {
      $schema: "scrubbe.operational-rule/v1",
      name: ruleName,
      description: ruleDesc,
      status,
      matchType,
      conditions: conditions.map(({ id: _id, ...r }) => r),
      actions: actions.map(({ id: _id, ...r }) => r),
      guards: guards.map(({ id: _id, ...r }) => r),
      controls,
      schedule,
    },
    null,
    2,
  );

  return (
    <div
      style={{
        background: T.bg,
        minHeight: "100vh",
        fontFamily: "'DM Sans',system-ui,sans-serif",
        color: T.ink,
        fontSize: 14,
        lineHeight: 1.5,
        WebkitFontSmoothing: "antialiased",
        paddingBottom: 80,
      }}
    >
      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "22px 28px" }}>
        {/* Breadcrumb */}

        {/* Page header */}
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 27,
                fontWeight: 800,
                letterSpacing: "-.02em",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                margin: 0,
              }}
            >
              Create operational rule <StatusBadge status={status} />
            </h1>
            <p
              style={{
                color: T.ink2,
                fontSize: 14,
                marginTop: 5,
                maxWidth: 560,
              }}
            >
              Govern how Scrubbe's autonomous agents investigate and remediate.
              Ezra evaluates every condition in real time and routes each event
              between automated action, human approval, and hand-off.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Schedule */}
            <div style={{ position: "relative" }}>
              <Btn onClick={() => setShowSched((s) => !s)}>
                <Calendar size={16} /> Schedule
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.indigoInk,
                    background: T.indigoSoft,
                    borderRadius: 5,
                    padding: "1px 6px",
                  }}
                >
                  {schedule.mode === "at" && schedule.date
                    ? schedule.date
                    : "Continuous"}
                </span>
              </Btn>
              {showSched && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    zIndex: 120,
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 14,
                    boxShadow: "0 12px 40px rgba(20,23,33,.16)",
                    padding: 16,
                    width: 340,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: T.indigoSoft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Calendar size={16} color={T.indigo} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14.5 }}>
                        Schedule
                      </div>
                      <div style={{ fontSize: 11.5, color: T.ink3 }}>
                        {schedule.mode === "at"
                          ? "Activates at a scheduled time."
                          : "Evaluated continuously, in real time."}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      background: T.bg,
                      border: `1px solid ${T.borderStrong}`,
                      borderRadius: 9,
                      padding: 3,
                      gap: 3,
                    }}
                  >
                    {(["always", "at"] as ScheduleMode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSchedule((s) => ({ ...s, mode: m }))}
                        style={{
                          flex: 1,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: schedule.mode === m ? T.indigoInk : T.ink2,
                          background: schedule.mode === m ? T.surface : "none",
                          borderRadius: 7,
                          padding: "7px 13px",
                          border: "none",
                          cursor: "pointer",
                          boxShadow:
                            schedule.mode === m
                              ? "0 1px 2px rgba(20,23,33,.06)"
                              : "none",
                          fontFamily: "inherit",
                        }}
                      >
                        {m === "always" ? "Continuous" : "Scheduled"}
                      </button>
                    ))}
                  </div>
                  {schedule.mode === "at" && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                        marginTop: 12,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: T.ink2,
                            display: "block",
                            marginBottom: 7,
                          }}
                        >
                          Date
                        </label>
                        <input
                          type="date"
                          value={schedule.date}
                          onChange={(e) =>
                            setSchedule((s) => ({ ...s, date: e.target.value }))
                          }
                          style={inp}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: T.ink2,
                            display: "block",
                            marginBottom: 7,
                          }}
                        >
                          Time
                        </label>
                        <input
                          type="time"
                          value={schedule.time}
                          onChange={(e) =>
                            setSchedule((s) => ({ ...s, time: e.target.value }))
                          }
                          style={inp}
                        />
                      </div>
                      <div style={{ gridColumn: "1/-1" }}>
                        <label
                          style={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: T.ink2,
                            display: "block",
                            marginBottom: 7,
                          }}
                        >
                          Repeat
                        </label>
                        <select
                          value={schedule.repeat}
                          onChange={(e) =>
                            setSchedule((s) => ({
                              ...s,
                              repeat: e.target.value as RepeatOption,
                            }))
                          }
                          style={inp}
                        >
                          {(
                            [
                              "Once",
                              "Daily",
                              "Weekly",
                              "Monthly",
                            ] as RepeatOption[]
                          ).map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Btn onClick={() => toast("Exporting rule JSON", "info")}>
              <ArrowDown size={16} /> Export
            </Btn>
            <Btn
              onClick={() => {
                setStatus((s) => (s === "disabled" ? "enabled" : "disabled"));
                stamp();
                toast(
                  status === "disabled" ? "Rule enabled" : "Rule disabled",
                  status === "disabled" ? "good" : "info",
                );
              }}
              variant={status === "disabled" ? "good" : "danger"}
            >
              {status === "disabled" ? <Power size={16} /> : <Ban size={16} />}
              {status === "disabled" ? "Enable rule" : "Disable"}
            </Btn>
            <Btn
              onClick={() => {
                setStatus("draft");
                stamp();
                toast("Saved as draft");
              }}
            >
              <Clock size={16} /> Save as draft
            </Btn>
            <Btn
              variant="primary"
              onClick={() => {
                if (!ruleName.trim()) {
                  toast("Add a rule name first", "info");
                  return;
                }
                if (!conditions.length) {
                  toast("Add at least one condition", "info");
                  return;
                }
                if (!actions.length) {
                  toast("Add at least one action", "info");
                  return;
                }
                setStatus("enabled");
                stamp();
                toast("Rule saved and enabled");
              }}
            >
              <Zap size={16} /> Save &amp; enable
            </Btn>
          </div>
        </header>

        {/* Ezra banner */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            background: "linear-gradient(180deg,#f4f2ff 0%,#fbfaff 100%)",
            border: `1px solid ${T.indigoLine}`,
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 18,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "0 auto 0 0",
              width: 3,
              background: "linear-gradient(180deg,#5b5ef0,#8b5cf6)",
            }}
          />
          <div
            style={{
              flex: "0 0 auto",
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "linear-gradient(135deg,#5b5ef0,#8b5cf6)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Activity size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                flexWrap: "wrap",
                marginBottom: 5,
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 14.5 }}>Ezra</span>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: ".07em",
                  textTransform: "uppercase",
                  color: T.indigoInk,
                  background: T.indigoSoft,
                  padding: "3px 8px",
                  borderRadius: 6,
                }}
              >
                Autonomy Intelligence
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: "#e4faf2",
                  border: "1px solid #a7e6d2",
                  color: T.greenInk,
                }}
              >
                Advisory
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.55,
                color: T.ink2,
                margin: 0,
              }}
            >
              This rule constrains autonomous action on Production / Tier-1
              services. Ezra will flag each trigger with a confidence assessment
              and queue hold actions before any remediation executes. You have{" "}
              <b>{conditions.length} conditions</b> and{" "}
              <b>{guards.length} suppression guards</b> active.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 5,
                marginTop: 9,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 7,
                  fontSize: 12,
                  color: T.ink2,
                }}
              >
                <AlertTriangle
                  size={13}
                  color={T.amber}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                Blast-radius check uses the OR connector — a large radius alone
                can trigger this rule.
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 7,
                  fontSize: 12,
                  color: T.ink2,
                }}
              >
                <Info
                  size={13}
                  color={T.indigo}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                Consider adding an <b>Evidence Quality</b> condition to filter
                low-signal alerts.
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 7,
                  fontSize: 12,
                  color: T.ink2,
                }}
              >
                <Check
                  size={13}
                  color={T.green}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                Suppression guard coverage is strong — {guards.length} guards
                reduce false-positive automation.
              </div>
            </div>
          </div>
          <div
            style={{
              flex: "0 0 auto",
              textAlign: "center",
              alignSelf: "center",
              paddingLeft: 16,
              borderLeft: `1px solid ${T.indigoLine}`,
              minWidth: 118,
            }}
          >
            <div
              style={{
                fontWeight: 900,
                fontSize: 28,
                lineHeight: 1,
                color: T.indigoInk,
              }}
            >
              91%
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: T.ink3,
                marginTop: 6,
                lineHeight: 1.35,
              }}
            >
              Ezra diagnostic
              <br />
              confidence
            </div>
          </div>
        </div>

        {/* Main canvas */}
        <div style={{ ...card, padding: "26px 28px", marginBottom: 20 }}>
          {/* Rule details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)",
              gap: 22,
              marginBottom: 6,
            }}
          >
            <div>
              <label
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: T.ink2,
                  display: "block",
                  marginBottom: 7,
                }}
              >
                Rule name
              </label>
              <input
                value={ruleName}
                onChange={(e) => {
                  setRuleName(e.target.value);
                  stamp();
                }}
                style={inp}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: T.ink2,
                  display: "block",
                  marginBottom: 7,
                }}
              >
                Description{" "}
                <span style={{ fontWeight: 400, color: T.ink3 }}>
                  (optional)
                </span>
              </label>
              <textarea
                value={ruleDesc}
                onChange={(e) => {
                  setRuleDesc(e.target.value);
                  stamp();
                }}
                rows={3}
                style={{ ...inp, resize: "vertical" }}
              />
            </div>
          </div>

          <div style={{ height: 1, background: T.border, margin: "24px 0" }} />

          {/* IF block */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: ".06em",
                color: "#fff",
                padding: "5px 11px",
                borderRadius: 8,
                background: T.indigo,
                lineHeight: 1,
              }}
            >
              IF
            </span>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() =>
                  setOpenDrop((d) => (d === "match" ? null : "match"))
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: T.ink,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 6px",
                  borderRadius: 7,
                  fontFamily: "inherit",
                }}
              >
                <span style={{ color: T.indigo }}>
                  {matchType === "all"
                    ? "All"
                    : matchType === "any"
                      ? "Any"
                      : "None"}
                </span>{" "}
                of the following conditions are true{" "}
                <ChevronDown size={15} color={T.ink3} />
              </button>
              {openDrop === "match" && (
                <Dropdown
                  items={matchItems}
                  onClose={() => setOpenDrop(null)}
                />
              )}
            </div>
          </div>

          {conditions.length === 0 && (
            <p
              style={{
                fontSize: 13,
                color: T.ink3,
                padding: "14px 4px",
                fontStyle: "italic",
              }}
            >
              No conditions yet. Add a condition below.
            </p>
          )}
          {conditions.map((c, i) =>
            c.kind === "cond" ? (
              <ConditionRow
                key={c.id}
                cond={c}
                index={i}
                onUpdate={(p) => updateCond(c.id, p)}
                onRemove={() => removeCond(c.id)}
              />
            ) : null,
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 14,
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative" }}>
              <Btn
                size="sm"
                variant="ghost"
                onClick={() =>
                  setOpenDrop((d) => (d === "cond" ? null : "cond"))
                }
              >
                <Plus size={14} /> Add condition
              </Btn>
              {openDrop === "cond" && (
                <Dropdown
                  items={condFieldItems}
                  onClose={() => setOpenDrop(null)}
                />
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              color: T.ink3,
              margin: "18px 0",
            }}
          >
            <ArrowDown size={20} />
          </div>

          {/* THEN block */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: ".06em",
                color: "#fff",
                padding: "5px 11px",
                borderRadius: 8,
                background: T.green,
                lineHeight: 1,
              }}
            >
              THEN
            </span>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>
              Perform the following actions
            </span>
          </div>

          {actions.length === 0 && (
            <p
              style={{
                fontSize: 13,
                color: T.ink3,
                padding: "14px 4px",
                fontStyle: "italic",
              }}
            >
              No actions yet. Add an action below.
            </p>
          )}
          {actions.map((a) => (
            <ActionRow
              key={a.id}
              action={a}
              onUpdateDetail={(d) => updateAction(a.id, d)}
              onRemove={() => removeAction(a.id)}
            />
          ))}

          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginTop: 14,
            }}
          >
            <Btn
              size="sm"
              variant="ghost"
              onClick={() =>
                setOpenDrop((d) => (d === "action" ? null : "action"))
              }
            >
              <Plus size={14} /> Add action
            </Btn>
            {openDrop === "action" && (
              <Dropdown items={actionItems} onClose={() => setOpenDrop(null)} />
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              color: T.ink3,
              margin: "18px 0",
            }}
          >
            <ArrowDown size={20} />
          </div>

          {/* UNLESS block */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: ".06em",
                color: "#fff",
                padding: "5px 11px",
                borderRadius: 8,
                background: T.teal,
                lineHeight: 1,
              }}
            >
              UNLESS
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                fontSize: 13,
                color: T.ink2,
              }}
            >
              Skip the actions when
              <button
                type="button"
                onClick={() => {
                  setGuardMatch((m) => (m === "any" ? "all" : "any"));
                  stamp();
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 800,
                  fontSize: 12,
                  color: "#0c8478",
                  background: "#ecf8f6",
                  border: "1px solid #c7ebe6",
                  borderRadius: 7,
                  padding: "3px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {guardMatch} <ChevronDown size={12} />
              </button>
              of these guards are active{" "}
              {guards.length > 0 && <b>· {guards.length} set</b>}
            </div>
          </div>

          {guards.length === 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                border: `1px dashed ${T.borderStrong}`,
                borderRadius: 10,
                padding: "13px 14px",
                background: T.surface2,
                color: T.ink2,
                fontSize: 12.5,
                lineHeight: 1.45,
                marginBottom: 8,
              }}
            >
              <VolumeX size={18} color="#0c8478" style={{ flexShrink: 0 }} />
              No guards yet. Add one so this rule steps aside when a responder,
              war room, or Ezra is already handling the incident.
            </div>
          )}
          {guards.map((g) => (
            <GuardRow
              key={g.id}
              guard={g}
              onUpdateVal={(v) => updateGuard(g.id, v)}
              onRemove={() => removeGuard(g.id)}
            />
          ))}

          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginTop: 14,
            }}
          >
            <Btn
              size="sm"
              variant="ghost"
              onClick={() =>
                setOpenDrop((d) => (d === "guard" ? null : "guard"))
              }
            >
              <Plus size={14} /> Add suppression guard
            </Btn>
            {openDrop === "guard" && (
              <Dropdown items={guardItems} onClose={() => setOpenDrop(null)} />
            )}
          </div>

          <ExecControls controls={controls} onChange={updateControl} />
        </div>

        {/* Bottom 3-col grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 1fr 1fr",
            gap: 20,
            marginTop: 20,
          }}
        >
          <section style={card}>
            <div style={{ padding: "20px 22px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 4px" }}>
                Rule summary
              </h3>
              <p
                style={{
                  fontSize: 12.5,
                  color: T.ink3,
                  marginBottom: 16,
                  marginTop: 0,
                }}
              >
                Plain-language read of what this rule does.
              </p>
              <RuleSummary
                conditions={conditions}
                actions={actions}
                matchType={matchType}
                guards={guards}
                guardMatch={guardMatch}
                controls={controls}
                schedule={schedule}
              />
            </div>
          </section>

          <section style={card}>
            <div style={{ padding: "20px 22px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 4px" }}>
                Test rule
              </h3>
              <p
                style={{
                  fontSize: 12.5,
                  color: T.ink3,
                  marginBottom: 16,
                  marginTop: 0,
                }}
              >
                Run this rule against its own conditions to confirm it triggers.
              </p>
              <TestPanel
                conditions={conditions}
                actions={actions}
                matchType={matchType}
              />
            </div>
          </section>

          <section style={card}>
            <div style={{ padding: "20px 22px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 4px" }}>
                Rule status
              </h3>
              <p
                style={{
                  fontSize: 12.5,
                  color: T.ink3,
                  marginBottom: 16,
                  marginTop: 0,
                }}
              >
                Lifecycle and recent activity.
              </p>
              {(
                [
                  {
                    k: "Status",
                    v: (
                      <button
                        type="button"
                        onClick={() => {
                          setStatus((s) =>
                            s === "enabled" ? "disabled" : "enabled",
                          );
                          stamp();
                        }}
                        style={{
                          position: "relative",
                          width: 38,
                          height: 22,
                          borderRadius: 999,
                          background:
                            status === "enabled" ? T.green : "#d4d7e0",
                          border: "none",
                          cursor: "pointer",
                          transition: ".18s",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: 2,
                            left: status === "enabled" ? 18 : 2,
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "#fff",
                            boxShadow: "0 1px 2px rgba(0,0,0,.25)",
                            transition: ".18s",
                            display: "block",
                          }}
                        />
                      </button>
                    ),
                  },
                  { k: "Last triggered", v: "2 hours ago" },
                  {
                    k: "Times triggered",
                    v: <span style={{ fontFamily: "monospace" }}>12</span>,
                  },
                  {
                    k: "Success rate",
                    v: <span style={{ color: T.greenInk }}>96%</span>,
                  },
                  { k: "Created by", v: "Alex Singh" },
                  {
                    k: "Created on",
                    v: (
                      <span style={{ fontFamily: "monospace" }}>
                        05 Jan 2026, 10:30
                      </span>
                    ),
                  },
                  {
                    k: "Last modified",
                    v: (
                      <span style={{ fontFamily: "monospace" }}>{lastMod}</span>
                    ),
                  },
                ] satisfies { k: string; v: ReactNode }[]
              ).map(({ k, v }) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 0",
                    borderBottom: `1px solid ${T.border}`,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: T.ink2 }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Rule as code */}
        <section style={{ ...card, marginTop: 20, overflow: "hidden" }}>
          <details>
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                cursor: "pointer",
                listStyle: "none",
                userSelect: "none",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={17} color={T.ink2} />
                </span>
                <span>
                  <span
                    style={{ fontWeight: 800, fontSize: 15, display: "block" }}
                  >
                    Rule as code
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: T.ink3,
                      fontFamily: "monospace",
                    }}
                  >
                    scrubbe.operational-rule/v1
                  </span>
                </span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.ink3 }}>
                  Expand
                </span>
                <ChevronDown size={18} color={T.ink3} />
              </span>
            </summary>
            <div
              style={{
                borderTop: `1px solid ${T.border}`,
                padding: "14px 18px 18px",
              }}
            >
              <div
                style={{
                  border: "1px solid #1c2230",
                  borderRadius: 10,
                  background: "#0e1117",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 10px 7px 12px",
                    background: "#0b0e14",
                    borderBottom: "1px solid #1c2230",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 11.5,
                      color: "#8b93a6",
                      fontFamily: "monospace",
                    }}
                  >
                    <FileText size={13} color="#5d6577" /> operational-rule.json
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(ruleJson);
                      toast("Copied to clipboard");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      border: "none",
                      background: "none",
                      color: "#aeb6c6",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: "5px 7px",
                      borderRadius: 6,
                      fontFamily: "inherit",
                    }}
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: "14px 16px",
                    maxHeight: 420,
                    overflow: "auto",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: "#c2c9d6",
                    whiteSpace: "pre",
                  }}
                >
                  {ruleJson}
                </pre>
              </div>
            </div>
          </details>
        </section>
      </div>

      <Toast toasts={toasts} />

      <style>{`
        @keyframes pop { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none } }
        details > summary::-webkit-details-marker { display:none }
        * { box-sizing:border-box }
        input, select, textarea, button { font-family:inherit }
        input:focus, select:focus, textarea:focus { border-color:#5b5ef0 !important; box-shadow:0 0 0 3px #eef0fe !important; outline:none !important; }
      `}</style>
    </div>
  );
}
