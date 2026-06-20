export interface EscalationStep {
  target: string; // e.g., 'Primary on-call', 'Team Lead'
  timeout: number; // duration in minutes
  channels: string; // e.g., 'Page + SMS', 'All channels'
}

export interface EscalationPolicy {
  id: string;
  name: string;
  severity: string; // e.g., 'P0 only', 'P1 & above'
  steps: EscalationStep[];
  warRoom: boolean; // Auto-create Slack + Zoom war room
  autoEscalate: boolean; // Move to next step if no acknowledgment
}

// types/autoEscalation.ts

export type MatchStrategy = "all" | "any";

export interface RuleCondition {
  field: string;
  op: string;
  value: string | number;
}

export interface RuleAction {
  type: string;
  params: Record<string, string | number>;
}

export interface AutoEscalationRule {
  id: number;
  name: string;
  enabled: boolean;
  match: MatchStrategy;
  conditions: RuleCondition[];
  action: RuleAction;
}

export interface TimeoutMatrixRow {
  sev: string;
  label: string;
  badgeStyle: string;
  cells: string[];
}

export interface TimelineEvent {
  timestamp: string;
  text: string;
  type: "detected" | "matched" | "escalated" | "warroom";
}

export interface ActiveEscalation {
  incidentId: string;
  title: string;
  severity: string;
  durationUnacknowledged: string;
  currentStep: string;
  nextTarget: string;
  initialRemainingSeconds: number;
  timeline: TimelineEvent[];
}
