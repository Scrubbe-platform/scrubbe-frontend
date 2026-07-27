export type RecordStatus = "Resolved" | "In progress";
export type Priority = "P0" | "P1" | "P2";
export type Tone = "ok" | "warn" | "major" | "accent" | "info" | "neutral";

export interface ChildIncident {
  id: string;
  title: string;
  status: RecordStatus;
  resolvedIn: string;
  group: string;
  addedToProblem: boolean;
  kb: string | false;
  merged?: boolean;
}

export interface HistoryEvent {
  date: string;
  event: string;
  who?: string;
  done: boolean;
}

export interface SimilarIncident {
  score: number;
  id: string;
  title: string;
  status: string;
  pr: string;
  resolution: string;
}

export interface Operational {
  services: string[];
  totalChildren: number;
  teams: string[];
  avgResolution: string;
  problemRecord: string;
  knowledgeArticle: string;
  knownError: boolean;
}

export interface Evidence {
  signals: string[];
  confidence: number;
}

export interface AIAnalysis {
  paragraph: string;
  recommendation: string;
}

export interface Outcome {
  items: [string, boolean][];
  reviewedBy: { name: string; team: string };
}

export interface RelationshipRecord {
  id: string;
  title: string;
  status: RecordStatus;
  priority: Priority;
  occurred: string;
  problemRecord: string | null;
  knowledgeArticle: string | null;
  knownError: boolean;
  rootCause: string;
  resolution: string;
  assignmentGroup: string;
  children: ChildIncident[];
  history: HistoryEvent[];
  similar: SimilarIncident[];
  operational: Operational;
  evidence: Evidence;
  ai: AIAnalysis;
  outcome: Outcome;
}

export type ProposalKind = "join" | "recurrence";

export interface Proposal {
  id: string;
  kind: ProposalKind;
  target: string;
  confidence: number;
  incident: {
    id: string;
    title: string;
    priority: Priority;
    service: string;
    when: string;
  };
  by: string;
  signals: string[];
}

export interface AuditEntry {
  when: string;
  actor: string;
  text: string;
}

export const STATUS_ORDER: RecordStatus[] = ["Resolved", "In progress"];

export const SEED_RECORDS: RelationshipRecord[] = [
  {
    id: "SI-P000124",
    title: "Checkout Platform Failure",
    status: "Resolved",
    priority: "P0",
    occurred: "24 Jun 2026",
    problemRecord: "PR-00034",
    knowledgeArticle: "KB-00021",
    knownError: true,
    rootCause:
      "Redis memory exhaustion 90s after deploy #4821, cascading into API latency and checkout failure.",
    resolution:
      "Redis Recovery playbook + connection-pool ceiling + 80% memory alert",
    assignmentGroup: "Checkout Platform",
    children: [
      { id: "SI-P000082", title: "Checkout Failure", status: "Resolved", resolvedIn: "31m", group: "Checkout Platform", addedToProblem: true, kb: false },
      { id: "SI-P000051", title: "Redis Saturation", status: "Resolved", resolvedIn: "18m", group: "Database", addedToProblem: true, kb: false },
      { id: "SI-P000126", title: "Checkout 5xx spike", status: "Resolved", resolvedIn: "---", group: "Checkout Platform", addedToProblem: true, kb: false, merged: true },
    ],
    history: [
      { date: "24 Jun 2026", event: "Parent incident created", who: "AI Correlation", done: true },
      { date: "24 Jun 2026", event: "3 child incidents linked automatically", done: true },
      { date: "24 Jun 2026", event: "Duplicate SI-P000126 merged", who: "David Okafor", done: true },
      { date: "24 Jun 2026", event: "All children resolved", done: true },
      { date: "25 Jun 2026", event: "Problem Record PR-00034 created", done: true },
      { date: "26 Jun 2026", event: "Knowledge Article KB-00021 published", done: true },
      { date: "28 Jun 2026", event: "Relationship archived", done: true },
    ],
    similar: [
      { score: 96, id: "SI-P000082", title: "Checkout Failure", status: "Resolved", pr: "PR-00034", resolution: "Redis restart + cache flush" },
      { score: 91, id: "SI-P000051", title: "Redis Saturation", status: "Resolved", pr: "PR-00030", resolution: "Connection-pool flush" },
    ],
    operational: {
      services: ["Checkout", "Payments", "API Gateway", "Authentication"],
      totalChildren: 3,
      teams: ["Checkout Platform", "Database", "Payments"],
      avgResolution: "25m",
      problemRecord: "PR-00034",
      knowledgeArticle: "KB-00021",
      knownError: true,
    },
    evidence: {
      signals: ["Same deployment (#4821)", "Same Kubernetes cluster", "Same Redis instance", "Same root cause", "Same infrastructure", "Same signal fingerprint"],
      confidence: 97,
    },
    ai: {
      paragraph:
        "Ezra determined that SI-P000082, SI-P000051 and SI-P000126 were secondary service failures caused by the Redis memory exhaustion recorded under parent incident SI-P000124. These incidents share identical infrastructure dependencies, deployment identifiers and signal-correlation patterns.",
      recommendation:
        "Treat as a single operational event. On recurrence, reuse the Redis Recovery playbook and the Database Failover Approval rule.",
    },
    outcome: {
      items: [
        ["Root cause identified", true],
        ["Problem record created", true],
        ["Known error created", true],
        ["Knowledge published", true],
        ["Playbook updated", true],
        ["Incident pattern learned", true],
      ],
      reviewedBy: { name: "Emma Jones", team: "Checkout Platform" },
    },
  },
  {
    id: "SI-P000010",
    title: "API Gateway Failure",
    status: "Resolved",
    priority: "P0",
    occurred: "14 Jul 2025",
    problemRecord: "PR-00012",
    knowledgeArticle: "KB-00008",
    knownError: true,
    rootCause:
      "Expired TLS certificate on the API-Gateway edge failed handshakes, breaking auth and cascading into checkout and payments.",
    resolution: "Certificate reissue + edge rotation; auto-renewal introduced",
    assignmentGroup: "Platform Infrastructure",
    children: [
      { id: "SI-P000011", title: "Auth login failures", status: "Resolved", resolvedIn: "49m", group: "Identity", addedToProblem: true, kb: false },
      { id: "SI-P000012", title: "Checkout unavailable", status: "Resolved", resolvedIn: "44m", group: "Checkout Platform", addedToProblem: true, kb: false },
    ],
    history: [
      { date: "14 Jul 2025", event: "Parent incident created", who: "David Okafor", done: true },
      { date: "14 Jul 2025", event: "2 child incidents linked", done: true },
      { date: "14 Jul 2025", event: "All children resolved", done: true },
      { date: "15 Jul 2025", event: "Problem Record PR-00012 created", done: true },
      { date: "17 Jul 2025", event: "Knowledge Article KB-00008 published", done: true },
      { date: "20 Jul 2025", event: "Relationship archived", done: true },
    ],
    similar: [
      { score: 88, id: "SI-P000010", title: "Edge TLS handshake errors", status: "Resolved", pr: "PR-00012", resolution: "Reissue certificate" },
    ],
    operational: {
      services: ["API Gateway", "Authentication", "Checkout", "Payments"],
      totalChildren: 2,
      teams: ["Platform Infrastructure", "Identity", "Checkout Platform"],
      avgResolution: "47m",
      problemRecord: "PR-00012",
      knowledgeArticle: "KB-00008",
      knownError: true,
    },
    evidence: {
      signals: ["Same edge component", "Simultaneous failure", "Same error signature", "Same certificate authority"],
      confidence: 93,
    },
    ai: {
      paragraph:
        "Ezra determined that SI-P000011 and SI-P000012 were downstream of the expired TLS certificate recorded under parent incident SI-P000010. Auth failed first, then checkout, following the gateway → auth → checkout dependency path.",
      recommendation:
        "Treat as a single operational event. Certificate auto-renewal now prevents recurrence; keep 30-day expiry alerting on the runbook.",
    },
    outcome: {
      items: [
        ["Root cause identified", true],
        ["Problem record created", true],
        ["Known error created", true],
        ["Knowledge published", true],
        ["Playbook updated", true],
        ["Incident pattern learned", true],
      ],
      reviewedBy: { name: "David Okafor", team: "Platform Infrastructure" },
    },
  },
  {
    id: "SI-P000137",
    title: "Payments Auth Cascade",
    status: "In progress",
    priority: "P0",
    occurred: "18 Jul 2026",
    problemRecord: null,
    knowledgeArticle: null,
    knownError: false,
    rootCause:
      "Auth token-service latency is saturating payment-capture retries and timing out checkout — active, still under investigation.",
    resolution: "Token-service scale-out + traffic shedding (in progress)",
    assignmentGroup: "Payments",
    children: [
      { id: "SI-P000140", title: "Payment capture retries", status: "In progress", resolvedIn: "---", group: "Payments", addedToProblem: false, kb: false },
    ],
    history: [
      { date: "18 Jul 2026", event: "Parent incident created", who: "AI Correlation", done: true },
      { date: "18 Jul 2026", event: "1 child incident linked", done: true },
      { date: "18 Jul 2026", event: "War room opened", done: true },
      { date: "---", event: "Problem record — pending", done: false },
      { date: "---", event: "Knowledge article — pending", done: false },
      { date: "---", event: "Relationship archived — pending", done: false },
    ],
    similar: [
      { score: 87, id: "SI-P000124", title: "Checkout Platform Failure", status: "Resolved", pr: "PR-00034", resolution: "Redis Recovery + traffic shift" },
      { score: 79, id: "SI-P000010", title: "API Gateway Failure", status: "Resolved", pr: "PR-00012", resolution: "Reissue certificate" },
    ],
    operational: {
      services: ["Payments", "Authentication", "Checkout", "API Gateway"],
      totalChildren: 1,
      teams: ["Payments", "Identity"],
      avgResolution: "ongoing",
      problemRecord: "pending",
      knowledgeArticle: "pending",
      knownError: false,
    },
    evidence: {
      signals: ["Shared timeline", "Shared dependencies", "Cascading latency signature", "Same token service"],
      confidence: 89,
    },
    ai: {
      paragraph:
        "Ezra assesses that SI-P000140 is a secondary failure of the auth token-service latency captured under parent incident SI-P000137. Capture retries are backing up behind auth timeouts, matching the token-latency correlation signature.",
      recommendation:
        "Treat as a single operational event. Scale the token service and shed non-critical traffic; a problem record should be opened once the cascade is contained.",
    },
    outcome: {
      items: [
        ["Root cause identified", true],
        ["Problem record created", false],
        ["Known error created", false],
        ["Knowledge published", false],
        ["Playbook updated", false],
        ["Incident pattern learned", false],
      ],
      reviewedBy: { name: "On-call review pending", team: "Payments" },
    },
  },
  {
    id: "SI-P000101",
    title: "Checkout Error-Rate Spike",
    status: "Resolved",
    priority: "P1",
    occurred: "29 May 2026",
    problemRecord: "PR-00051",
    knowledgeArticle: null,
    knownError: true,
    rootCause:
      "Terraform drift left stale feature-flag config in production, misrouting a fraction of checkout traffic — a recurring known-error with only a manual workaround so far.",
    resolution: "Manual config reconcile; drift-detection CI gate pending (CHG-00251)",
    assignmentGroup: "Release Engineering",
    children: [
      { id: "SI-P000118", title: "Traffic misroute", status: "Resolved", resolvedIn: "19m", group: "Release Engineering", addedToProblem: true, kb: false },
    ],
    history: [
      { date: "29 May 2026", event: "Parent incident created", who: "AI Correlation", done: true },
      { date: "29 May 2026", event: "1 child incident linked", done: true },
      { date: "29 May 2026", event: "All children resolved", done: true },
      { date: "30 May 2026", event: "Problem Record PR-00051 created", done: true },
      { date: "---", event: "Knowledge article — pending", done: false },
      { date: "---", event: "Permanent fix CHG-00251 — pending", done: false },
    ],
    similar: [
      { score: 83, id: "SI-P000118", title: "Traffic misroute", status: "Resolved", pr: "PR-00051", resolution: "Reconcile config" },
    ],
    operational: {
      services: ["Checkout", "API Gateway"],
      totalChildren: 1,
      teams: ["Release Engineering"],
      avgResolution: "20m",
      problemRecord: "PR-00051",
      knowledgeArticle: "pending",
      knownError: true,
    },
    evidence: {
      signals: ["Identical config diff", "Same drifted module", "Repeat error signature", "Same change window"],
      confidence: 81,
    },
    ai: {
      paragraph:
        "Ezra determined that SI-P000118 shares the same drifted Terraform module as parent incident SI-P000101 — the second occurrence of the same stale feature-flag pattern. This is a recurring known-error awaiting a permanent CI drift-detection gate.",
      recommendation:
        "Reuse the manual Config Reconcile workaround. Prioritise CHG-00251 to close this out; publish a KB once the permanent fix ships.",
    },
    outcome: {
      items: [
        ["Root cause identified", true],
        ["Problem record created", true],
        ["Known error created", true],
        ["Knowledge published", false],
        ["Playbook updated", true],
        ["Incident pattern learned", true],
      ],
      reviewedBy: { name: "Sarah Lin", team: "Release Engineering" },
    },
  },
];

export const SEED_PROPOSALS: Proposal[] = [
  {
    id: "PROP-1",
    kind: "join",
    target: "SI-P000124",
    confidence: 88,
    incident: { id: "SI-P000141", title: "Checkout 5xx + Redis evictions", priority: "P1", service: "Checkout", when: "14 min ago" },
    by: "AI Correlation · Database Agent",
    signals: ["Redis eviction signature", "Shared deploy #4831", "Timeline overlap 92%", "Same connection-pool metric"],
  },
  {
    id: "PROP-2",
    kind: "join",
    target: "SI-P000137",
    confidence: 84,
    incident: { id: "SI-P000142", title: "Auth token timeouts (EU)", priority: "P1", service: "Authentication", when: "31 min ago" },
    by: "AI Correlation · Signal Agent",
    signals: ["Token-latency signature", "Dependency: Auth Token Service", "Timeline overlap 88%"],
  },
  {
    id: "PROP-3",
    kind: "recurrence",
    target: "SI-P000010",
    confidence: 74,
    incident: { id: "SI-P000143", title: "Gateway 503s on edge-2", priority: "P2", service: "API Gateway", when: "1 h ago" },
    by: "AI Correlation · Infrastructure Agent",
    signals: ["Matches a known error", "TLS handshake errors", "Edge component overlap"],
  },
];

export const SEED_AUDIT: AuditEntry[] = [
  { when: "09:24", actor: "War Room", text: "opened for SI-P000137 — Payments Auth Cascade" },
  { when: "12:07", actor: "David Okafor", text: "merged duplicate SI-P000126 into SI-P000124" },
  { when: "14:19", actor: "Emma Jones", text: "reviewed and closed relationship SI-P000124" },
];

export function findRecord(records: RelationshipRecord[], id: string) {
  return records.find((r) => r.id === id);
}

export const statusTone = (s: RecordStatus): Tone => (s === "Resolved" ? "ok" : "major");
export const confidenceTone = (c: number): Tone => (c >= 85 ? "ok" : c >= 75 ? "warn" : "neutral");

export function nowClock() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
