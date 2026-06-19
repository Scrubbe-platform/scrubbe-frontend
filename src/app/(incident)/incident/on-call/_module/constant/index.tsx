import {
  EscalationPolicy,
  AutoEscalationRule,
  TimeoutMatrixRow,
} from "../types/oncall-type";

export const mockEscalationPolicies: EscalationPolicy[] = [
  {
    id: "policy-1",
    name: "Default — Engineering Tier",
    severity: "P1 & above",
    steps: [
      { target: "Primary on-call", timeout: 5, channels: "Page + SMS" },
      { target: "Secondary on-call", timeout: 15, channels: "Page only" },
      { target: "Team Lead", timeout: 30, channels: "Slack + Page" },
    ],
    warRoom: false,
    autoEscalate: true,
  },
  {
    id: "policy-2",
    name: "Critical — P0 War Room",
    severity: "P0 only",
    steps: [
      { target: "Primary on-call", timeout: 5, channels: "Page + SMS" },
      { target: "Team Lead", timeout: 10, channels: "Slack + Page" },
      { target: "VP Engineering", timeout: 20, channels: "All channels" },
    ],
    warRoom: true,
    autoEscalate: true,
  },
  {
    id: "policy-3",
    name: "Database — DBA Chain",
    severity: "P1 & above",
    steps: [
      { target: "Primary DBA", timeout: 5, channels: "Page only" },
      { target: "Senior DBA", timeout: 15, channels: "Page + SMS" },
      { target: "Engineering Manager", timeout: 30, channels: "All channels" },
    ],
    warRoom: false,
    autoEscalate: true,
  },
  {
    id: "policy-4",
    name: "Security — CISO Chain",
    severity: "All severities",
    steps: [
      { target: "Security on-call", timeout: 5, channels: "Page only" },
      { target: "CISO", timeout: 10, channels: "All channels" },
      { target: "CEO", timeout: 20, channels: "All channels" },
    ],
    warRoom: true,
    autoEscalate: true,
  },
];

export const mockTimeoutMatrix: TimeoutMatrixRow[] = [
  {
    sev: "P0",
    label: "P0 Critical",
    badgeStyle:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50",
    cells: ["5 min", "10 min", "20 min"],
  },
  {
    sev: "P1",
    label: "P1 High",
    badgeStyle:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50",
    cells: ["10 min", "20 min", "—"],
  },
  {
    sev: "P2",
    label: "P2 Medium",
    badgeStyle:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
    cells: ["30 min", "60 min", "—"],
  },
  {
    sev: "P3",
    label: "P3 Low",
    badgeStyle:
      "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    cells: ["4 hrs", "—", "—"],
  },
];

export const mockAutoEscRules: AutoEscalationRule[] = [
  {
    id: 1,
    name: "P0 fast-track",
    enabled: true,
    match: "all",
    conditions: [{ field: "severity", op: "is", value: "P0" }],
    action: { type: "override", params: { minutes: 5 } },
  },
  {
    id: 2,
    name: "No-ack advance",
    enabled: true,
    match: "all",
    conditions: [
      { field: "ack", op: "is", value: "not received in this step" },
    ],
    action: { type: "advance", params: {} },
  },
  {
    id: 3,
    name: "Exhausted → CTO war room",
    enabled: true,
    match: "all",
    conditions: [
      { field: "step", op: "is", value: "Final step" },
      { field: "ack", op: "is", value: "not received in any step" },
    ],
    action: { type: "warroom", params: {} },
  },
  {
    id: 4,
    name: "Off-hours speed-up",
    enabled: false,
    match: "all",
    conditions: [
      { field: "window", op: "is", value: "overnight (22:00–06:00)" },
    ],
    action: { type: "halve", params: {} },
  },
];
