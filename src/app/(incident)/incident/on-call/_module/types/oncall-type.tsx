export type EscalationChannel = "EMAIL" | "SMS" | "SLACK" | "CALL";
export type EscalationTargetType = "USER" | "TEAM" | "ROLE";

export interface EscalationStepRecord {
  id?: string;
  order: number;
  targetType: EscalationTargetType;
  targetUserId?: string | null;
  targetLabel?: string | null;
  channel: EscalationChannel;
  timeoutMinutes: number;
}

export interface EscalationPolicyRecord {
  id: string;
  name: string;
  severities: string[];
  autoEscalate: boolean;
  warRoomOnFinalStep: boolean;
  isActive: boolean;
  steps: EscalationStepRecord[];
  createdAt: string;
}

export type MatchStrategy = "ALL" | "ANY";

export interface RuleCondition {
  field: string;
  operator: string;
  value: string | number;
}

export interface RuleAction {
  type: string;
  params: Record<string, string | number>;
}

export interface AutoEscalationRuleRecord {
  id: string;
  name: string;
  enabled: boolean;
  matchType: MatchStrategy;
  conditions: RuleCondition[];
  action: RuleAction;
  order: number;
}

export interface OnCallConfigRecord {
  id: string;
  businessId: string;
  autoEscalateEnabled: boolean;
  warRoomTriggerEnabled: boolean;
  channelsAutoCreate: boolean;
  smsFallback: boolean;
  offHoursStrict: boolean;
  timeoutMatrix: Record<string, number[]>;
}

export type EscalationEventType =
  | "STARTED"
  | "ESCALATED"
  | "ACKNOWLEDGED"
  | "WAR_ROOM_TRIGGERED"
  | "EXHAUSTED"
  | "CANCELLED";

export interface EscalationEventRecord {
  id: string;
  type: EscalationEventType;
  message: string;
  createdAt: string;
}

export interface ActiveEscalationTicketRecord {
  id: string;
  ticketId: string;
  summary: string;
  severity: string | null;
  priority: string;
  status: string;
  createdAt: string;
}

export interface ActiveEscalationRecord {
  id: string;
  ticketId: string;
  currentStepIndex: number;
  status: "ACTIVE" | "ACKNOWLEDGED" | "EXHAUSTED" | "CANCELLED";
  stepStartedAt: string;
  ticket: ActiveEscalationTicketRecord;
  policy: EscalationPolicyRecord;
  events: EscalationEventRecord[];
}
