import {
  IncidentCommentRecord,
  IncidentContextRecord,
  IncidentDetailRecord,
  IncidentHistoryRecord,
  IncidentLifecycleStep,
  IncidentListItem,
  IncidentListResult,
  IncidentMessageRecord,
  IncidentPostMortemRecord,
  IncidentSidebarStatus,
  IncidentStats,
} from "./incident.types";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  !!value && typeof value === "object" && !Array.isArray(value);

const asRecord = (value: unknown): UnknownRecord => (isRecord(value) ? value : {});

const asString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
};

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => asString(entry).trim()).filter(Boolean);
};

const firstNonEmpty = (...values: unknown[]) => {
  for (const value of values) {
    const normalized = asString(value).trim();
    if (normalized) return normalized;
  }
  return "";
};

const parseDate = (value: unknown): Date | null => {
  const stringValue = asString(value);
  if (!stringValue) return null;
  const parsed = new Date(stringValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatRelativeIncidentTime = (value: unknown) => {
  const date = parseDate(value);
  if (!date) return "Unknown time";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export const getElapsedMinutes = (value: unknown) => {
  const date = parseDate(value);
  if (!date) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
};

const priorityToSeverity = (priority: string) => {
  const normalized = priority.toUpperCase();
  if (normalized === "CRITICAL") return "P1";
  if (normalized === "HIGH") return "P1";
  if (normalized === "MEDIUM") return "P2";
  return "P3";
};

const toLifecycleStep = (statusValue: unknown, stateValue: unknown): IncidentLifecycleStep => {
  const normalized = firstNonEmpty(statusValue, stateValue).toUpperCase();

  switch (normalized) {
    case "ACKNOWLEDGED":
      return "Enriched";
    case "INVESTIGATION":
    case "INVESTIGATING":
      return "Analysed";
    case "MITIGATED":
      return "Executed";
    case "APPROVED":
      return "Approved";
    case "PROPOSED":
      return "Proposed";
    case "RESOLVED":
    case "CLOSED":
      return "Resolved";
    default:
      return "Detected";
  }
};

const lifecycleToProgress = (step: IncidentLifecycleStep) => {
  const progressMap: Record<IncidentLifecycleStep, number> = {
    Detected: 1,
    Enriched: 2,
    Analysed: 3,
    Proposed: 4,
    Approved: 5,
    Executed: 6,
    Resolved: 7,
  };

  return progressMap[step];
};

const toSidebarStatus = (
  lifecycleStep: IncidentLifecycleStep,
  statusValue: unknown,
  hasPostMortem: boolean
): IncidentSidebarStatus => {
  if (hasPostMortem) return "Post-Mortem";

  const normalized = firstNonEmpty(statusValue).toUpperCase();
  if (normalized === "INVESTIGATION" || normalized === "INVESTIGATING") {
    return "Investigating";
  }

  const sidebarMap: Record<IncidentLifecycleStep, IncidentSidebarStatus> = {
    Detected: "Detected",
    Enriched: "Enriched",
    Analysed: "Analyzed",
    Proposed: "Proposed",
    Approved: "Approved",
    Executed: "Executing",
    Resolved: "Resolved",
  };

  return sidebarMap[lifecycleStep];
};

export const extractIncidentListResponse = (payload: unknown): IncidentListResult => {
  const root = asRecord(payload);
  const data = asRecord(root.data);

  const ticketsCandidate =
    (Array.isArray(data.tickets) && data.tickets) ||
    (Array.isArray(root.tickets) && root.tickets) ||
    (Array.isArray(data.incidents) && data.incidents) ||
    (Array.isArray(root.incidents) && root.incidents) ||
    (Array.isArray(root.data) && root.data) ||
    [];

  const total = asNumber(root.total ?? data.total ?? asRecord(root.meta).total, ticketsCandidate.length);
  const page = asNumber(root.page ?? data.page ?? asRecord(root.meta).page, 1);
  const limit = asNumber(root.limit ?? data.limit ?? asRecord(root.meta).limit, Math.max(ticketsCandidate.length, 1));

  return {
    incidents: ticketsCandidate.map(mapIncidentListItem),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / Math.max(limit, 1))),
    },
  };
};

export const extractIncidentDetailResponse = (payload: unknown): IncidentDetailRecord | null => {
  const root = asRecord(payload);
  const data = asRecord(root.data);

  if (Object.keys(data).length > 0) {
    return mapIncidentDetailRecord(data);
  }

  if (Object.keys(root).length > 0 && "id" in root) {
    return mapIncidentDetailRecord(root);
  }

  return null;
};

export const extractIncidentHistoryResponse = (payload: unknown): IncidentHistoryRecord[] => {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const history = Array.isArray(root.history)
    ? root.history
    : Array.isArray(data.history)
    ? data.history
    : [];

  return history.map((entry) => {
    const record = asRecord(entry);
    return {
      id: asString(record.id),
      action: asString(record.action),
      actor: firstNonEmpty(record.actor, "System"),
      oldValue: asString(record.oldValue),
      newValue: asString(record.newValue),
      comment: asString(record.comment),
      timestamp: asString(record.timestamp),
      ticketId: asString(record.ticketId),
      ticketSummary: asString(record.ticketSummary),
    };
  });
};

export const extractIncidentCommentsResponse = (payload: unknown): IncidentCommentRecord[] => {
  const root = asRecord(payload);
  const comments = Array.isArray(root.data)
    ? root.data
    : Array.isArray(root.comments)
    ? root.comments
    : [];

  return comments.map((entry) => {
    const record = asRecord(entry);
    const author = asRecord(record.author);

    return {
      id: asString(record.id),
      content: asString(record.content),
      createdAt: asString(record.createdAt),
      isInternal: Boolean(record.isInternal),
      author: {
        id: asString(author.id),
        firstName: firstNonEmpty(author.firstName, record.firstname),
        lastName: firstNonEmpty(author.lastName, record.lastname),
        profileImage: asString(author.profileImage) || null,
      },
    };
  });
};

export const extractIncidentMessagesResponse = (payload: unknown): IncidentMessageRecord[] => {
  const messages = Array.isArray(payload)
    ? payload
    : Array.isArray(asRecord(payload).data)
    ? (asRecord(payload).data as unknown[])
    : [];

  return messages.map((entry) => {
    const record = asRecord(entry);
    const sender = asRecord(record.sender);

    return {
      id: asString(record.id),
      content: asString(record.content),
      createdAt: asString(record.createdAt),
      isSystem: Boolean(record.isSystem),
      sender: {
        id: asString(sender.id),
        email: asString(sender.email),
        firstName: asString(sender.firstName),
        lastName: asString(sender.lastName),
        profileImage: asString(sender.profileImage) || null,
      },
    };
  });
};

export const extractIncidentContextResponse = (payload: unknown): IncidentContextRecord | null => {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const context = Object.keys(data).length > 0 ? data : Object.keys(root).length > 0 && "customerImpact" in root ? root : null;

  if (!context) return null;

  const attachments = Array.isArray(context.attachments)
    ? context.attachments.map((entry) => {
        const record = asRecord(entry);
        return {
          id: asString(record.id),
          name: asString(record.name),
          url: asString(record.url),
          type: asString(record.type),
        };
      })
    : [];

  return {
    id: asString(context.id),
    customerImpact: asString(context.customerImpact),
    externalCommunication: asString(context.externalCommunication),
    incidentCommander: asString(context.incidentCommander),
    businessImpact: asString(context.businessImpact),
    additionalContext: asString(context.additionalContext),
    labels: asStringArray(context.labels),
    relatedIncidents: asStringArray(context.relatedIncidents),
    childIncidents: Array.isArray(context.childIncidents)
      ? context.childIncidents.map((c: unknown) => {
          const r = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
          return {
            id: String(r.id ?? ""),
            ticketId: String(r.ticketId ?? ""),
            title: String(r.title ?? ""),
            severity: String(r.severity ?? ""),
          };
        })
      : [],
    runbookOverrideUrl: asString(context.runbookOverrideUrl),
    escalateTo: asString(context.escalateTo),
    attachments,
    updatedAt: asString(context.updatedAt) || null,
    createdAt: asString(context.createdAt) || null,
    submittedBy: asString(context.submittedBy),
  };
};

const mapIncidentPostMortemRecord = (
  value: unknown
): IncidentPostMortemRecord | null => {
  const record = asRecord(value);

  if (Object.keys(record).length === 0) return null;

  return {
    id: asString(record.id),
    incidentTicketId: firstNonEmpty(record.incidentTicketId, record.ticketId),
    createdAt: asString(record.createdAt) || null,
    updatedAt: asString(record.updatedAt) || null,
    causeCategory: asString(record.causeCategory),
    rootCause: asString(record.rootCause),
    why1: asString(record.why1),
    why2: asString(record.why2),
    why3: asString(record.why3),
    why4: asString(record.why4),
    why5: asString(record.why5),
    temporaryFix: asString(record.temporaryFix),
    permanentFix: asString(record.permanentFix),
    knowledgeTitleInternal: asString(record.knowledgeTitleInternal),
    knowledgeSummaryInternal: asString(record.knowledgeSummaryInternal),
    identificationStepsInternal: asString(record.identificationStepsInternal),
    resolutionStepsInternal: asString(record.resolutionStepsInternal),
    preventiveMeasuresInternal: asString(record.preventiveMeasuresInternal),
    knowledgeTagsInternal: asStringArray(record.knowledgeTagsInternal),
    knowledgeTitleCustomer: asString(record.knowledgeTitleCustomer) || null,
    knowledgeSummaryCustomer: asString(record.knowledgeSummaryCustomer) || null,
    followUpTask: asString(record.followUpTask),
    followUpOwner: asString(record.followUpOwner),
    followUpDueDate: asString(record.followUpDueDate),
    followUpStatus: asString(record.followUpStatus),
    followUpTicketingSystems: asStringArray(record.followUpTicketingSystems),
    communicationChannel: asString(record.communicationChannel),
    targetStakeholders: asStringArray(record.targetStakeholders),
    messageContent: asString(record.messageContent),
  };
};

export const extractIncidentPostMortemsResponse = (payload: unknown) => {
  const root = asRecord(payload);
  const rows = Array.isArray(root.data)
    ? root.data
    : Array.isArray(root.postMortems)
    ? root.postMortems
    : [];

  return rows.map((entry) => mapIncidentDetailRecord(entry));
};

export const mapIncidentListItem = (entry: unknown): IncidentListItem => {
  const record = asRecord(entry);
  const lifecycleStep = toLifecycleStep(record.status, record.state);
  const severity = firstNonEmpty(record.severity, priorityToSeverity(asString(record.priority)), "P3");
  const hasPostMortem = isRecord(record.ResolveIncident) || isRecord(record.postMortem);
  const createdAt = firstNonEmpty(record.createdAt, record.detectedAt);

  const assignedTo = asRecord(record.assignedTo);
  const assignedToName = firstNonEmpty(
    `${asString(assignedTo.firstName)} ${asString(assignedTo.lastName)}`.trim(),
    record.assignedToEmail
  );

  return {
    id: firstNonEmpty(record.id),
    ticketId: firstNonEmpty(record.ticketId, record.id),
    title: firstNonEmpty(record.title, record.summary, record.reason, record.description, "Untitled incident"),
    summary: firstNonEmpty(record.summary, record.reason, record.description),
    reason: firstNonEmpty(record.reason, record.summary, record.description),
    description: firstNonEmpty(record.description, record.techDescription),
    service: firstNonEmpty(record.serviceArea, record.affectedSystem, record.businessFlow, "Unknown service"),
    region: firstNonEmpty(record.region, "Unknown region"),
    environment: firstNonEmpty(record.environment, "Unknown environment"),
    severity,
    priority: firstNonEmpty(record.priority, "MEDIUM"),
    status: firstNonEmpty(record.status, "OPEN"),
    state: firstNonEmpty(record.state, record.status),
    source: firstNonEmpty(record.source, record.sourceType, record.detection, "Manual"),
    sourceType: firstNonEmpty(record.sourceType, record.source, "Manual"),
    assignedToEmail: firstNonEmpty(record.assignedToEmail, assignedTo.email),
    assignedToName,
    incidentCommander: firstNonEmpty(record.incidentCommander),
    owningSquad: firstNonEmpty(record.owningSquad),
    createdAt,
    updatedAt: firstNonEmpty(record.updatedAt, createdAt),
    elapsedLabel: formatRelativeIncidentTime(createdAt),
    elapsedMinutes: getElapsedMinutes(createdAt),
    sidebarStatus: toSidebarStatus(lifecycleStep, record.status, hasPostMortem),
    lifecycleStep,
    stageProgress: hasPostMortem ? 9 : lifecycleToProgress(lifecycleStep),
    progressPercentage: asNumber(record.progressPercentage, hasPostMortem ? 100 : lifecycleToProgress(lifecycleStep) * 14),
    commentsCount: asNumber(record.commentsCount),
    recommendedActions: asStringArray(record.recommendedActions),
    raw: record,
  };
};

export const mapIncidentDetailRecord = (entry: unknown): IncidentDetailRecord => {
  const record = asRecord(entry);
  const base = mapIncidentListItem(record);
  const aiAnalysis = isRecord(record.aiAnalysis) ? record.aiAnalysis : null;
  const postMortem = mapIncidentPostMortemRecord(
    record.ResolveIncident ?? record.postMortem
  );

  return {
    ...base,
    techDescription: firstNonEmpty(record.techDescription, record.description),
    impactSummary: firstNonEmpty(record.impactSummary),
    businessFlow: firstNonEmpty(record.businessFlow),
    financialExposure: firstNonEmpty(record.financialExposure),
    blastRadius: firstNonEmpty(record.blastRadius),
    detection: firstNonEmpty(record.detection),
    affectedSystem: firstNonEmpty(record.affectedSystem, record.serviceArea),
    category: firstNonEmpty(record.category),
    subCategory: firstNonEmpty(record.subCategory),
    score: asNumber(record.score),
    riskScore: asNumber(record.riskScore),
    correlatedSignalIds: asStringArray(record.correlatedSignalIds),
    reportedBy: firstNonEmpty(record.reportedBy),
    userName: firstNonEmpty(record.userName),
    aiAnalysis: aiAnalysis
      ? {
          suggestion: asString(aiAnalysis.suggestion),
          stakeholderMsg: asString(aiAnalysis.stakeholderMsg),
          fiveWhys: isRecord(aiAnalysis.fiveWhys)
            ? Object.fromEntries(
                Object.entries(aiAnalysis.fiveWhys).map(([key, value]) => [key, asString(value)])
              )
            : null,
          customerKb: Array.isArray(aiAnalysis.customerKb) ? aiAnalysis.customerKb : [],
        }
      : null,
    comments: extractIncidentCommentsResponse({ data: record.comments }),
    messages: extractIncidentMessagesResponse(record.messages),
    postMortem,
    ResolveIncident: postMortem,
  };
};

export const deriveIncidentStats = (incidents: IncidentListItem[]): IncidentStats => {
  return incidents.reduce<IncidentStats>(
    (stats, incident) => {
      if (incident.status === "RESOLVED" || incident.sidebarStatus === "Resolved") {
        stats.resolved += 1;
      } else {
        stats.active += 1;
      }

      if (
        incident.sidebarStatus === "Investigating" ||
        incident.lifecycleStep === "Analysed" ||
        incident.status === "INVESTIGATION"
      ) {
        stats.investigating += 1;
      }

      return stats;
    },
    { active: 0, investigating: 0, resolved: 0 }
  );
};

export const getIncidentDisplayId = (incident: IncidentListItem | IncidentDetailRecord | null) =>
  incident?.ticketId || incident?.id || "";

export const getIncidentSubmittedAt = (context: IncidentContextRecord | null) =>
  firstNonEmpty(context?.updatedAt, context?.createdAt);
