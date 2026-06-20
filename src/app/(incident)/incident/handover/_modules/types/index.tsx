// types/handover.ts

export type HandoverStatus = "SCHEDULED" | "ACTIVE" | "COMPLETING" | "COMPLETED" | "MERGED";
export type HandoverTaskPriority = "CRITICAL" | "HIGH" | "NORMAL";
export type HandoverTaskStatus = "PENDING" | "COMPLETED" | "WAIVED";
export type HandoverScheduleType = "FOLLOW_THE_SUN" | "RECURRING" | "ONE_TIME";

export interface HandoverUserRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string | null;
}

export interface HandoverIncidentLink {
  id: string;
  incidentId: string;
  isPrimary: boolean;
  contextNotes?: string | null;
  addedAt: string;
  incident: {
    id: string;
    ticketId: string;
    summary: string;
    status: string;
    severity?: string | null;
    priority: string;
  };
}

export interface HandoverNoteRecord {
  id: string;
  body: string;
  isCommander: boolean;
  createdAt: string;
  author: HandoverUserRef;
}

export interface HandoverTaskRecord {
  id: string;
  title: string;
  assigneeLabel?: string | null;
  dueAt?: string | null;
  priority: HandoverTaskPriority;
  status: HandoverTaskStatus;
  completedBy?: { id: string; firstName: string; lastName: string } | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface HandoverRecord {
  id: string;
  handoverRef: string;
  status: HandoverStatus;
  shiftType: string;
  shiftWindowStart: string;
  shiftWindowEnd: string;
  transferAt: string;
  currentOwnerLabel: string;
  currentCommanderId?: string | null;
  currentCommander?: HandoverUserRef | null;
  nextOwnerLabel: string;
  nextCommanderId?: string | null;
  nextCommander?: HandoverUserRef | null;
  scheduleId?: string | null;
  mergeTargetId?: string | null;
  mergeNote?: string | null;
  ezraBrief?: {
    generatedAt?: string;
    executiveSummary?: string;
    rcaConfidence?: number;
    recommendation?: string | null;
    usersImpacted?: number;
    derivedSeverity?: string;
    customerExposure?: string;
  } | null;
  ezraBriefAt?: string | null;
  isImmutable: boolean;
  createdAt: string;
  updatedAt: string;
  incidents: HandoverIncidentLink[];
  notes?: HandoverNoteRecord[];
  tasks?: HandoverTaskRecord[];
}

export interface HandoverScheduleRecord {
  id: string;
  scheduleType: HandoverScheduleType;
  label?: string | null;
  transferTime: string;
  fromLabel: string;
  toLabel: string;
  groupId?: string | null;
  isActive: boolean;
}

export interface HandoverAutomationRuleRecord {
  onCommanderChange: boolean;
  onShiftEnd: boolean;
  on24hOpen: boolean;
  autoEzraBrief: boolean;
}
