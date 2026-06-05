export type IncidentLifecycleStep =
  | "Detected"
  | "Enriched"
  | "Analysed"
  | "Proposed"
  | "Approved"
  | "Executed"
  | "Resolved";

export type IncidentSidebarStatus =
  | "Detected"
  | "Enriched"
  | "Analyzed"
  | "Proposed"
  | "Approved"
  | "Executing"
  | "Resolved"
  | "Post-Mortem"
  | "Investigating";

export interface IncidentCommentRecord {
  id: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string | null;
  };
}

export interface IncidentMessageRecord {
  id: string;
  content: string;
  createdAt: string;
  isSystem?: boolean;
  sender: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string | null;
  };
}

export interface IncidentHistoryRecord {
  id: string;
  action: string;
  actor: string;
  oldValue: string;
  newValue: string;
  comment: string;
  timestamp: string;
  ticketId?: string;
  ticketSummary?: string;
}

export interface IncidentContextAttachmentRecord {
  id?: string;
  name?: string;
  url?: string;
  type?: string;
}

export interface IncidentContextRecord {
  id?: string;
  customerImpact: string;
  externalCommunication: string;
  incidentCommander: string;
  businessImpact: string;
  additionalContext: string;
  labels: string[];
  relatedIncidents: string[];
  runbookOverrideUrl: string;
  escalateTo: string;
  attachments: IncidentContextAttachmentRecord[];
  updatedAt?: string | null;
  createdAt?: string | null;
  submittedBy?: string;
}

export interface IncidentPostMortemRecord {
  id: string;
  incidentTicketId: string;
  createdAt: string | null;
  updatedAt: string | null;
  causeCategory: string;
  rootCause: string;
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
  temporaryFix: string;
  permanentFix: string;
  knowledgeTitleInternal: string;
  knowledgeSummaryInternal: string;
  identificationStepsInternal: string;
  resolutionStepsInternal: string;
  preventiveMeasuresInternal: string;
  knowledgeTagsInternal: string[];
  knowledgeTitleCustomer: string | null;
  knowledgeSummaryCustomer: string | null;
  followUpTask: string;
  followUpOwner: string;
  followUpDueDate: string;
  followUpStatus: string;
  followUpTicketingSystems: string[];
  communicationChannel: string;
  targetStakeholders: string[];
  messageContent: string;
}

export interface IncidentListItem {
  id: string;
  ticketId: string;
  title: string;
  summary: string;
  reason: string;
  description: string;
  service: string;
  region: string;
  environment: string;
  severity: string;
  priority: string;
  status: string;
  state: string;
  source: string;
  sourceType: string;
  assignedToEmail: string;
  assignedToName: string;
  incidentCommander: string;
  owningSquad: string;
  createdAt: string;
  updatedAt: string;
  elapsedLabel: string;
  elapsedMinutes: number;
  sidebarStatus: IncidentSidebarStatus;
  lifecycleStep: IncidentLifecycleStep;
  stageProgress: number;
  progressPercentage: number;
  commentsCount: number;
  recommendedActions: string[];
  raw: Record<string, unknown>;
}

export interface IncidentDetailRecord extends IncidentListItem {
  techDescription: string;
  impactSummary: string;
  businessFlow: string;
  financialExposure: string;
  blastRadius: string;
  detection: string;
  affectedSystem: string;
  category: string;
  subCategory: string;
  score: number;
  riskScore: number;
  correlatedSignalIds: string[];
  reportedBy: string;
  userName: string;
  aiAnalysis: {
    suggestion: string;
    stakeholderMsg: string;
    fiveWhys?: Record<string, string> | null;
    customerKb?: unknown[];
  } | null;
  comments: IncidentCommentRecord[];
  messages: IncidentMessageRecord[];
  postMortem?: IncidentPostMortemRecord | null;
  ResolveIncident?: IncidentPostMortemRecord | null;
}

export interface IncidentListResult {
  incidents: IncidentListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IncidentStats {
  active: number;
  investigating: number;
  resolved: number;
}
