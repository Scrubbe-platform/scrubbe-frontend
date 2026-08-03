/**
 * Data layer for the Admin Settings page: group/category registry, tint
 * palette, per-category default state, and the connector registry. Ported
 * from the supplied design blueprint; state shapes stay loose (Record-based)
 * since categories are structurally unrelated to each other.
 */

export type Tint = "slate";

export const TINTS: Record<Tint, [string, string]> = {
  slate: ["bg-zinc-100 dark:bg-zinc-800", "text-zinc-600 dark:text-zinc-400"],
};

export interface Group {
  id: string;
  name: string;
  icon: string;
  tint: Tint;
}
export const GROUPS: Group[] = [
  { id: "workspace", name: "Workspace", icon: "org", tint: "slate" },
  { id: "operations", name: "Operations", icon: "flow", tint: "slate" },
  { id: "agents", name: "AI & agents", icon: "ai", tint: "slate" },
  { id: "connect", name: "Integrations & delivery", icon: "integ", tint: "slate" },
  { id: "governance", name: "Governance & security", icon: "security", tint: "slate" },
  { id: "platform", name: "Platform & developer", icon: "env", tint: "slate" },
  { id: "account", name: "Account", icon: "billing", tint: "slate" },
];

export interface Category {
  id: string;
  group: string;
  name: string;
  desc: string;
  icon: string;
  tint: Tint;
  cta: string;
  badge?: string;
}
export const CATS: Category[] = [
  { id: "organization", group: "workspace", name: "Organization", desc: "Company profile, business units and locations.", icon: "org", tint: "slate", cta: "Manage" },
  { id: "users", group: "workspace", name: "Users & teams", desc: "People, teams and team memberships.", icon: "users", tint: "slate", cta: "Manage" },
  { id: "roles", group: "workspace", name: "Roles & permissions", desc: "Roles, access levels and controls.", icon: "roles", tint: "slate", cta: "Manage" },
  { id: "authentication", group: "workspace", name: "Authentication", desc: "Identity providers, SAML/OIDC, password and MFA policy.", icon: "auth", tint: "slate", cta: "Configure", badge: "New" },
  { id: "appearance", group: "workspace", name: "Appearance & branding", desc: "Logo, brand colour, theme, email branding and domain.", icon: "paint", tint: "slate", cta: "Customize", badge: "New" },

  { id: "services", group: "operations", name: "Services", desc: "Services, tiers and ownership.", icon: "services", tint: "slate", cta: "Manage" },
  { id: "environments", group: "operations", name: "Environments", desc: "Production, staging, dev and freezes.", icon: "env", tint: "slate", cta: "Manage" },
  { id: "workflows", group: "operations", name: "Incident workflows", desc: "Lifecycle states and transition controls.", icon: "flow", tint: "slate", cta: "Manage" },
  { id: "orules", group: "operations", name: "Operational rules & policies", desc: "Automation ceiling, approvals, escalation and response rules.", icon: "rules", tint: "slate", cta: "Manage", badge: "Updated" },
  { id: "sla", group: "operations", name: "SLA / SLO policies", desc: "Response targets, SLOs and error budgets.", icon: "sla", tint: "slate", cta: "Manage" },
  { id: "incidentpolicies", group: "operations", name: "Incident policies", desc: "Numbering, priority / severity / impact matrices and major-incident triggers.", icon: "policy", tint: "slate", cta: "Configure", badge: "New" },
  { id: "assets", group: "operations", name: "Asset inventory", desc: "Servers, clusters, databases, cloud resources and ownership.", icon: "asset", tint: "slate", cta: "Manage", badge: "New" },
  { id: "automation", group: "operations", name: "Automation & jobs", desc: "Scheduled jobs, queues, retries and circuit breakers.", icon: "automation", tint: "slate", cta: "Configure", badge: "New" },
  { id: "quality", group: "operations", name: "Incident Quality Engine", desc: "Scoring rules, pass threshold and best-practice checks.", icon: "quality", tint: "slate", cta: "Configure", badge: "New" },

  { id: "agents", group: "agents", name: "Agents & governance", desc: "Register agents, set autonomy tiers and guardrails.", icon: "agents", tint: "slate", cta: "Manage", badge: "New" },
  { id: "ai", group: "agents", name: "AI & automation", desc: "Ezra assistant, triage and confidence.", icon: "ai", tint: "slate", cta: "Manage" },
  { id: "playbooks", group: "agents", name: "Playbooks", desc: "Runbooks that agents follow during incidents.", icon: "playbook", tint: "slate", cta: "Manage", badge: "New" },
  { id: "aimodels", group: "agents", name: "AI models & providers", desc: "LLM providers, model selection, fallbacks and hallucination guards.", icon: "ai", tint: "slate", cta: "Configure", badge: "New" },
  { id: "causal", group: "agents", name: "Causal Reconstruction Engine", desc: "Correlation window, signal depth and evidence retention.", icon: "causal", tint: "slate", cta: "Configure", badge: "New" },

  { id: "integrations", group: "connect", name: "Integrations", desc: "Connect source control, cloud, observability and chat.", icon: "integ", tint: "slate", cta: "Manage" },
  { id: "notifications", group: "connect", name: "Notifications", desc: "Channels, digests and quiet hours.", icon: "notif", tint: "slate", cta: "Manage" },
  { id: "delivery", group: "connect", name: "Incident delivery", desc: "Alert channels and message templates.", icon: "delivery", tint: "slate", cta: "Manage" },
  { id: "status", group: "connect", name: "Status pages", desc: "Public status, components and scheduled maintenance.", icon: "status", tint: "slate", cta: "Manage" },

  { id: "security", group: "governance", name: "Security", desc: "SSO, 2FA, sessions and IP allowlist.", icon: "security", tint: "slate", cta: "Manage" },
  { id: "retention", group: "governance", name: "Data & retention", desc: "Retention windows, archival and cleanup.", icon: "data", tint: "slate", cta: "Manage" },
  { id: "audit", group: "governance", name: "Audit logs", desc: "Tamper-evident record of every change.", icon: "audit", tint: "slate", cta: "View logs" },
  { id: "apikeys", group: "governance", name: "API & access keys", desc: "Programmatic access tokens and scopes.", icon: "apikey", tint: "slate", cta: "Manage", badge: "New" },
  { id: "decisions", group: "governance", name: "Decision Center", desc: "Approval chains, delegations and risk thresholds for execution.", icon: "decision", tint: "slate", cta: "Configure", badge: "Gate" },
  { id: "compliance", group: "governance", name: "Compliance", desc: "SOC 2, ISO 27001, GDPR, legal hold and evidence export.", icon: "compliance", tint: "slate", cta: "Manage", badge: "New" },

  { id: "developer", group: "platform", name: "Developer", desc: "Webhooks, OAuth apps, SDK / CLI, rate limits and MCP.", icon: "developer", tint: "slate", cta: "Manage", badge: "New" },
  { id: "system", group: "platform", name: "System", desc: "Platform health, queues, workers, feature flags and maintenance.", icon: "system", tint: "slate", cta: "View", badge: "New" },

  { id: "billing", group: "account", name: "Billing & subscription", desc: "Plan, seats, invoices and payment.", icon: "billing", tint: "slate", cta: "Manage" },
];
export const CATMAP: Record<string, Category> = Object.fromEntries(CATS.map((c) => [c.id, c]));

/* ───────────────────── default state per category ───────────────────── */

export const DEFAULTS: Record<string, any> = {
  organization: {
    orgName: "Scrubbe", legalName: "Scrubbe, Inc.", domain: "scrubbe.com", industry: "Software",
    timezone: "Europe/London",
    units: ["Platform Engineering", "Customer Reliability", "Security"],
    locations: ["London, UK", "Lagos, NG", "Remote-first"],
  },
  users: {
    defaultRole: "Responder",
    list: [
      { name: "Uchenna Chinka", email: "uchenna@scrubbe.com", role: "Admin", active: true },
      { name: "David Morakinyo", email: "david@scrubbe.com", role: "Manager", active: true },
      { name: "Sandra Ejiofor", email: "sandra@scrubbe.com", role: "Responder", active: true },
    ],
    teams: ["SRE", "Security", "Frontend"],
  },
  roles: {
    list: [
      { name: "Viewer", level: "Read-only" },
      { name: "Responder", level: "Operate" },
      { name: "Manager", level: "Approve" },
      { name: "Super Admin", level: "Full admin" },
    ],
  },
  services: {
    list: [
      { name: "policy-service", tier: 1, owner: "SRE" },
      { name: "ingestion-service", tier: 2, owner: "SRE" },
      { name: "notification-service", tier: 3, owner: "Platform" },
    ],
  },
  environments: {
    list: [
      { name: "Production", protected: true, freeze: false },
      { name: "Staging", protected: false, freeze: false },
      { name: "Development", protected: false, freeze: false },
    ],
  },
  integrations: {
    list: [
      { id: "github", on: true, config: { apiBaseUrl: "https://api.github.com", org: "scrubbe", token: "", webhookSecret: "whs_9f2a4c31", events: ["push", "pull_request", "workflow_run", "deployment_status"], inHook: "gh_2f8a91" } },
      { id: "gitlab", on: false, config: { apiBaseUrl: "https://gitlab.com/api/v4", group: "", token: "", webhookSecret: "", events: ["push", "merge_request", "pipeline"], inHook: "gl_71bd0c" } },
      { id: "bitbucket", on: false, config: { workspace: "", username: "", appPassword: "", webhookSecret: "", inHook: "bb_44a2e1" } },
      { id: "aws", on: true, config: { accountId: "481516234299", region: "eu-west-2", roleArn: "arn:aws:iam::481516234299:role/scrubbe-responder", accessKeyId: "", secretAccessKey: "" } },
      { id: "azure", on: false, config: { tenantId: "", clientId: "", clientSecret: "", subscriptionId: "" } },
      { id: "gcp", on: false, config: { projectId: "", serviceAccountKey: "" } },
      { id: "datadog", on: true, config: { site: "datadoghq.eu", apiKey: "", appKey: "", inHook: "dd_c091ab" } },
      { id: "prometheus", on: false, config: { endpoint: "https://prom.scrubbe.internal", bearerToken: "", inHook: "pr_88ff20" } },
      { id: "grafana", on: false, config: { endpoint: "", apiToken: "", inHook: "gf_10c7de" } },
      { id: "sentry", on: false, config: { org: "", dsn: "", authToken: "", inHook: "sn_5521aa" } },
      { id: "slack", on: true, config: { workspace: "scrubbe", botToken: "", defaultChannel: "#incidents" } },
      { id: "teams", on: false, config: { tenantId: "", incomingWebhook: "" } },
      { id: "pagerduty", on: true, config: { apiToken: "", serviceId: "", escalationPolicy: "On-call → Tier 1" } },
      { id: "opsgenie", on: false, config: { apiKey: "", team: "" } },
      { id: "jira", on: true, config: { baseUrl: "https://scrubbe.atlassian.net", email: "ops@scrubbe.com", apiToken: "", project: "INC" } },
      { id: "servicenow", on: false, config: { instanceUrl: "", username: "", password: "" } },
    ],
  },
  sla: {
    enabled: true, autoEscalate: true,
    p0: { resp: 5, res: 60 }, p1: { resp: 15, res: 240 }, p2: { resp: 60, res: 1440 }, p3: { resp: 240, res: 4320 },
    errorBudget: 1.0, sloTarget: 99.9,
  },
  orules: {
    enabled: true, maxAutomation: "Assisted", autoApproveBelow: "None", requireApproval: true, escalateAfter: "15",
    admins: ["uchenna@scrubbe.com"], effectiveFrom: "2026-07-15T09:00",
    riskTolerance: "Balanced", businessHoursOnly: false, bizStart: "08:00", bizEnd: "18:00",
    autoCreate: true, autoClose: false, emergencyOverride: true, breakGlassRole: "Super Admin",
    list: [
      { when: "Deploy fails in Production", then: "Roll back to the last good release", on: true },
      { when: "P0 incident declared", then: "Open a war room and page on-call", on: true },
      { when: "CPU > 90% for 10 minutes", then: "Scale the service by +2 replicas", on: false },
    ],
  },
  workflows: {
    requireResolveApproval: true, requireMitigationApproval: true, requireCloseApproval: true,
    autoAck: false, autoTriage: true, autoWarRoomP0: true, autoPageOncall: true,
    twoPersonProd: true, blockResolveOpenTasks: true, requirePostmortem: "P0 & P1",
    reopenWindow: "72", resolveRole: "Manager",
    templates: { P0: "War room + exec brief", P1: "Full incident", P2: "Standard incident", P3: "Lightweight" },
  },
  notifications: {
    alertEmail: "", slackChannel: "",
    email: true, sms: false, push: true, slack: true, teams: false, voice: false, webhook: true,
    digest: "Real-time", escalationNotify: true, notifyOnCreate: true, notifyOnResolve: true,
    quietOn: false, quietStart: "22:00", quietEnd: "07:00",
  },
  delivery: {
    channel: "Slack", subject: "[{{severity}}] {{service}} incident — {{title}}",
    body: "Incident {{id}} on {{service}} was detected at {{time}}.\nCurrent status: {{status}}.\nResponder: {{owner}}.",
  },
  status: {
    enabled: true, domain: "status.scrubbe.com", notifySubscribers: true,
    components: ["API", "Dashboard", "Webhooks", "Ingestion", "Agents"],
    maintenance: [
      { title: "Database failover drill", components: "API, Ingestion", start: "2026-07-18T02:00", end: "2026-07-18T04:00", status: "Scheduled", message: "Brief write pauses expected while we exercise our failover path.", notify: true },
      { title: "TLS certificate rotation", components: "Webhooks", start: "2026-07-02T01:00", end: "2026-07-02T01:30", status: "Completed", message: "Rotated inbound webhook certificates. No downtime observed.", notify: true },
    ],
  },
  ai: { ezra: true, defaultStage: "Assisted", confidence: 75, autoTriage: true },
  retention: { incidents: 365, audit: 730, telemetry: 30, autoArchive: true, autoCleanup: false },
  security: {
    ssoOn: true, ssoEnforced: false, ssoProvider: "Okta", enforce2fa: true, sessionTimeout: 60, passwordPolicy: "Strong",
    allowlist: ["203.0.113.0/24", "198.51.100.14"],
  },
  audit: { retention: 730, exportEnabled: true },
  billing: { plan: "Enterprise", seats: 320, payment: "Visa •••• 4242" },
  agents: {
    requireApprovalRemediation: true, blockDestructive: true, sandbox: false, maxConcurrent: 4,
    scopes: ["Read logs & metrics", "Restart a service", "Scale a service", "Roll back a deploy", "Failover a datastore"],
    list: [
      { name: "Diagnostician", role: "Diagnostics", tier: "Assisted", on: true },
      { name: "Remediator", role: "Remediation", tier: "Suggest", on: true },
      { name: "Scribe", role: "Comms", tier: "Autonomous", on: true },
      { name: "Forensics", role: "Forensics", tier: "Assisted", on: false },
    ],
  },
  playbooks: {
    defaultPlaybook: "Standard incident response",
    list: [
      { name: "Standard incident response", trigger: "Any incident opened", tier: "Assisted", on: true },
      { name: "P0 war room", trigger: "Severity is P0", tier: "Assisted", on: true },
      { name: "Failed deploy rollback", trigger: "Deploy fails in Production", tier: "Autonomous", on: true },
      { name: "Latency spike triage", trigger: "p99 latency > 2s for 10m", tier: "Suggest", on: false },
    ],
  },
  apikeys: {
    baseUrl: "https://api.scrubbe.com/v1",
    list: [
      { label: "CI pipeline", scope: "Write", created: "2026-04-11", last: "2h ago" },
      { label: "Grafana webhook", scope: "Write", created: "2026-02-02", last: "6m ago" },
      { label: "Reporting export", scope: "Read", created: "2025-11-20", last: "3d ago" },
    ],
  },

  authentication: {
    ssoOn: true, primary: "Okta", passwordPolicy: "Strong", minLength: 12, rotateDays: 90,
    mfaPolicy: "Required for all", mfaMethods: ["Authenticator app", "Security key", "SMS fallback"],
    providers: [
      { name: "Okta", protocol: "SAML 2.0", domain: "scrubbe.okta.com", on: true },
      { name: "Microsoft Entra ID", protocol: "OpenID Connect", domain: "login.microsoftonline.com", on: false },
      { name: "Google Workspace", protocol: "OpenID Connect", domain: "scrubbe.com", on: false },
      { name: "GitHub", protocol: "OAuth 2.0", domain: "github.com/scrubbe", on: true },
      { name: "GitLab", protocol: "OAuth 2.0", domain: "gitlab.com/scrubbe", on: false },
    ],
  },
  appearance: {
    brandColor: "#28A745", theme: "System", logoText: "Scrubbe",
    emailBranding: true, emailFooter: "Sent by Scrubbe · Governed incident response",
    customDomainOn: true, customDomain: "app.scrubbe.com",
  },
  incidentpolicies: {
    numberPrefix: "INC", numberPad: 6, nextNumber: 204418, autoAssign: true,
    defaultResponders: ["uchenna@scrubbe.com", "david@scrubbe.com"],
    requireImpact: true, requireRootCauseOnClose: true, majorAtSeverity: "P1", warRoomAtSeverity: "P0",
    mandatoryFields: ["Title", "Affected service", "Severity", "Impact summary"],
    matrix: [
      { impact: "Widespread", urgency: "High", priority: 1 },
      { impact: "Widespread", urgency: "Medium", priority: 2 },
      { impact: "Localized", urgency: "High", priority: 2 },
      { impact: "Localized", urgency: "Low", priority: 3 },
    ],
  },
  assets: {
    autoDiscover: true, requireOwner: true,
    list: [
      { name: "prod-api-cluster", type: "Kubernetes cluster", env: "Production", owner: "SRE", lifecycle: "Active" },
      { name: "orders-db-primary", type: "Database", env: "Production", owner: "SRE", lifecycle: "Active" },
      { name: "payments-svc-vm-01", type: "Virtual machine", env: "Production", owner: "Platform", lifecycle: "Active" },
      { name: "edge-lb-eu", type: "Network device", env: "Production", owner: "Platform", lifecycle: "Active" },
      { name: "staging-sandbox", type: "Cloud resource", env: "Staging", owner: "SRE", lifecycle: "Decommissioning" },
    ],
  },
  automation: {
    enabled: true, maxRetries: 3, retryBackoff: "Exponential", circuitBreaker: true, breakerThreshold: 5, pauseAll: false,
    jobs: [
      { name: "Nightly config backup", schedule: "Daily · 02:00", on: true },
      { name: "Stale incident sweep", schedule: "Hourly", on: true },
      { name: "Error-budget recompute", schedule: "Every 15 min", on: true },
      { name: "Weekly compliance export", schedule: "Sun · 06:00", on: false },
    ],
  },
  quality: {
    enabled: true, minScore: 80, coachOn: true, blockCloseBelowMin: true,
    checks: [
      { check: "Timeline is complete", weight: 20, on: true },
      { check: "Root cause documented", weight: 25, on: true },
      { check: "Customer impact recorded", weight: 20, on: true },
      { check: "Action items assigned", weight: 20, on: true },
      { check: "Post-mortem linked", weight: 15, on: true },
    ],
  },
  aimodels: {
    primary: "Claude Opus 4.8", fallback: "Claude Sonnet 5", provider: "Anthropic",
    reasoningDepth: "Balanced", maxExecutionScope: "Assisted", confidenceFloor: 75,
    hallucinationGuard: true, citeEvidence: true, learningOn: false,
    providers: [
      { name: "Anthropic", model: "Claude Opus 4.8", role: "Primary", on: true },
      { name: "Anthropic", model: "Claude Sonnet 5", role: "Fallback", on: true },
      { name: "OpenAI", model: "GPT-class", role: "Disabled", on: false },
    ],
  },
  causal: {
    correlationWindow: 15, maxSignalDepth: 6, confidenceThreshold: 70,
    dependencyWeighting: "High", noiseFiltering: true, timelineReconstruction: true, evidenceRetention: 90,
    signalSources: ["Metrics", "Logs", "Traces", "Deploys", "Config changes", "Alerts"],
  },
  decisions: {
    requireApprovalToExecute: true, twoPersonHighRisk: true, riskThreshold: "Medium", autoExpireHours: 4,
    chains: [
      { action: "Roll back a deploy", approver: "Manager", backup: "Super Admin", on: true },
      { action: "Failover a datastore", approver: "Super Admin", backup: "Super Admin", on: true },
      { action: "Scale a service", approver: "Responder", backup: "Manager", on: true },
      { action: "Restart a service", approver: "Responder", backup: "Manager", on: true },
    ],
    delegates: ["david@scrubbe.com"],
  },
  compliance: {
    legalHold: false, evidenceExport: true, dataRetentionDays: 365, auditRetentionDays: 730,
    frameworks: [
      { name: "SOC 2 Type II", status: "Certified", owner: "Security", on: true },
      { name: "ISO 27001", status: "Certified", owner: "Security", on: true },
      { name: "GDPR", status: "Compliant", owner: "Legal", on: true },
      { name: "HIPAA", status: "Not in scope", owner: "—", on: false },
    ],
  },
  developer: {
    sandboxOn: true, rateLimit: 600, mcpOn: true, mcpEndpoint: "https://mcp.scrubbe.com/v1",
    webhooks: [
      { name: "CI deploy events", url: "https://ci.scrubbe.com/hooks/deploy", on: true },
      { name: "Incident mirror", url: "https://data.scrubbe.com/incidents", on: true },
    ],
    oauthApps: [
      { name: "Scrubbe CLI", scopes: "read, write", on: true },
      { name: "Grafana panel", scopes: "read", on: true },
    ],
  },
  system: {
    maintenanceMode: false, version: "2026.7.2",
    services: [
      { name: "API", status: "Operational" },
      { name: "Ingestion queue", status: "Operational" },
      { name: "Agent workers", status: "Operational" },
      { name: "Database (primary)", status: "Operational" },
      { name: "Cache", status: "Degraded" },
      { name: "Background jobs", status: "Operational" },
    ],
    flags: [
      { flag: "New war-room UI", on: true },
      { flag: "Predictive escalation", on: false },
      { flag: "Agent auto-retry", on: true },
    ],
  },
};

/* ───────────────────── connector registry ───────────────────── */

export interface ConnField {
  k: string;
  label: string;
  ph?: string;
  help?: string;
  secret?: boolean;
  area?: boolean;
}
export interface ConnDef {
  name: string;
  cat: string;
  short: string;
  tint: Tint;
  blurb: string;
  inbound?: boolean;
  events?: string[];
  fields: ConnField[];
}
export const CONN_CATS = [
  { id: "scm", name: "Source control" },
  { id: "cloud", name: "Cloud" },
  { id: "obs", name: "Observability" },
  { id: "chat", name: "ChatOps" },
  { id: "oncall", name: "On-call & ticketing" },
  { id: "custom", name: "Custom" },
];
export const CONN: Record<string, ConnDef> = {
  github: {
    name: "GitHub", cat: "scm", short: "GH", tint: "slate", blurb: "Repos, checks & deploys", inbound: true,
    events: ["push", "pull_request", "workflow_run", "deployment_status", "check_run"],
    fields: [
      { k: "apiBaseUrl", label: "API base URL", ph: "https://api.github.com", help: "Use your GitHub Enterprise URL if self-hosted." },
      { k: "org", label: "Organization", ph: "your-org" },
      { k: "token", label: "Access token", secret: true, ph: "ghp_…", help: "Needs repo, workflow and admin:repo_hook scopes." },
    ]
  },
  gitlab: {
    name: "GitLab", cat: "scm", short: "GL", tint: "slate", blurb: "Pipelines & merge requests", inbound: true,
    events: ["push", "merge_request", "pipeline", "deployment", "job"],
    fields: [
      { k: "apiBaseUrl", label: "API base URL", ph: "https://gitlab.com/api/v4" },
      { k: "group", label: "Group", ph: "your-group" },
      { k: "token", label: "Access token", secret: true, ph: "glpat-…", help: "Requires the api scope." },
    ]
  },
  bitbucket: {
    name: "Bitbucket", cat: "scm", short: "BB", tint: "slate", blurb: "Repos & pipelines", inbound: true,
    fields: [
      { k: "workspace", label: "Workspace", ph: "your-workspace" },
      { k: "username", label: "Username" },
      { k: "appPassword", label: "App password", secret: true },
    ]
  },
  aws: {
    name: "Amazon Web Services", cat: "cloud", short: "AWS", tint: "slate", blurb: "CloudWatch, EC2 & Lambda",
    fields: [
      { k: "accountId", label: "Account ID", ph: "000000000000" },
      { k: "region", label: "Default region", ph: "eu-west-2" },
      { k: "roleArn", label: "Assume-role ARN", ph: "arn:aws:iam::…:role/…", help: "Preferred over static keys — Scrubbe assumes this role." },
      { k: "accessKeyId", label: "Access key ID", secret: true, help: "Only if you can’t use a role." },
      { k: "secretAccessKey", label: "Secret access key", secret: true },
    ]
  },
  azure: {
    name: "Microsoft Azure", cat: "cloud", short: "AZ", tint: "slate", blurb: "Monitor & Resource Graph",
    fields: [
      { k: "tenantId", label: "Tenant ID" }, { k: "clientId", label: "Client ID" },
      { k: "clientSecret", label: "Client secret", secret: true }, { k: "subscriptionId", label: "Subscription ID" },
    ]
  },
  gcp: {
    name: "Google Cloud", cat: "cloud", short: "GCP", tint: "slate", blurb: "Monitoring & Logging",
    fields: [
      { k: "projectId", label: "Project ID" },
      { k: "serviceAccountKey", label: "Service account JSON key", secret: true, area: true, ph: '{ "type": "service_account", … }' },
    ]
  },
  datadog: {
    name: "Datadog", cat: "obs", short: "DD", tint: "slate", blurb: "Metrics, monitors & traces", inbound: true,
    fields: [
      { k: "site", label: "Datadog site", ph: "datadoghq.eu", help: "e.g. datadoghq.com, datadoghq.eu, us3.datadoghq.com" },
      { k: "apiKey", label: "API key", secret: true }, { k: "appKey", label: "Application key", secret: true },
    ]
  },
  prometheus: {
    name: "Prometheus", cat: "obs", short: "PR", tint: "slate", blurb: "Alertmanager & queries", inbound: true,
    fields: [
      { k: "endpoint", label: "Query endpoint", ph: "https://prom.internal" },
      { k: "bearerToken", label: "Bearer token", secret: true },
    ]
  },
  grafana: {
    name: "Grafana", cat: "obs", short: "GF", tint: "slate", blurb: "Dashboards & alerts", inbound: true,
    fields: [
      { k: "endpoint", label: "Grafana URL", ph: "https://grafana.internal" },
      { k: "apiToken", label: "API token", secret: true },
    ]
  },
  sentry: {
    name: "Sentry", cat: "obs", short: "SN", tint: "slate", blurb: "Error tracking", inbound: true,
    fields: [
      { k: "org", label: "Organization slug" }, { k: "dsn", label: "DSN" },
      { k: "authToken", label: "Auth token", secret: true },
    ]
  },
  slack: {
    name: "Slack", cat: "chat", short: "SL", tint: "slate", blurb: "War rooms & alerts",
    fields: [
      { k: "workspace", label: "Workspace" }, { k: "botToken", label: "Bot token", secret: true, ph: "xoxb-…" },
      { k: "defaultChannel", label: "Default channel", ph: "#incidents" },
    ]
  },
  teams: {
    name: "Microsoft Teams", cat: "chat", short: "MT", tint: "slate", blurb: "Channel notifications",
    fields: [
      { k: "tenantId", label: "Tenant ID" },
      { k: "incomingWebhook", label: "Incoming webhook URL", ph: "https://outlook.office.com/webhook/…" },
    ]
  },
  pagerduty: {
    name: "PagerDuty", cat: "oncall", short: "PD", tint: "slate", blurb: "Paging & on-call",
    fields: [
      { k: "apiToken", label: "API token", secret: true }, { k: "serviceId", label: "Service ID" },
      { k: "escalationPolicy", label: "Escalation policy" },
    ]
  },
  opsgenie: {
    name: "Opsgenie", cat: "oncall", short: "OG", tint: "slate", blurb: "Alerting & schedules",
    fields: [{ k: "apiKey", label: "API key", secret: true }, { k: "team", label: "Team" }]
  },
  jira: {
    name: "Jira", cat: "oncall", short: "JR", tint: "slate", blurb: "Issue tracking",
    fields: [
      { k: "baseUrl", label: "Base URL", ph: "https://you.atlassian.net" }, { k: "email", label: "Account email" },
      { k: "apiToken", label: "API token", secret: true }, { k: "project", label: "Project key", ph: "INC" },
    ]
  },
  servicenow: {
    name: "ServiceNow", cat: "oncall", short: "SNW", tint: "slate", blurb: "ITSM incidents",
    fields: [
      { k: "instanceUrl", label: "Instance URL", ph: "https://you.service-now.com" }, { k: "username", label: "Username" },
      { k: "password", label: "Password", secret: true },
    ]
  },
};

export function connMeta(id: string, custom?: Record<string, any>): ConnDef {
  if (CONN[id]) return CONN[id];
  const cu = custom || {};
  return {
    name: cu.name || "Integration", cat: cu.cat || "custom",
    short: (cu.name || "IN").replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "IN",
    tint: "slate", blurb: cu.blurb || "Custom connector", inbound: cu.inbound !== false,
    fields: [
      { k: "apiBaseUrl", label: "Base URL", ph: "https://api.example.com" },
      { k: "token", label: "API token / key", secret: true },
    ],
  };
}

/* ───────────────────── quick actions ───────────────────── */

export interface QuickAction {
  label: string;
  icon: string;
  open: string;
}
export const QUICK: QuickAction[] = [
  { label: "Invite a user", icon: "users", open: "users" },
  { label: "Add a service", icon: "services", open: "services" },
  { label: "Connect an integration", icon: "integ", open: "integrations" },
  { label: "Schedule maintenance", icon: "status", open: "status" },
  { label: "Register an agent", icon: "agents", open: "agents" },
  { label: "View audit log", icon: "audit", open: "audit" },
];

/* ───────────────────── helpers ───────────────────── */

export const TIER_LABELS: Record<number, string> = { 1: "P0", 2: "P1", 3: "P2", 4: "P3" };
export const TIER_TONE: Record<number, string> = {
  1: "text-rose-600 dark:text-rose-400",
  2: "text-orange-600 dark:text-orange-400",
  3: "text-amber-600 dark:text-amber-400",
  4: "text-IMSDarkGreen",
};

export function randTok(prefix?: string) {
  return (prefix || "tok") + "_" + Math.random().toString(16).slice(2, 10);
}
export function hookUrl(connId: string, inHook: string) {
  return "https://hooks.scrubbe.com/in/" + connId + "/" + inHook;
}
export function ago(ts: number): string {
  const d = Date.now() - ts, m = Math.floor(d / 60000), h = Math.floor(m / 60), day = Math.floor(h / 24);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  if (h < 24) return h + "h ago";
  if (day < 7) return day + "d ago";
  return new Date(ts).toLocaleDateString();
}
export function fmtTs(ts: number): string {
  return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function fmtWindow(s?: string, e?: string): string {
  const f = (x?: string) => {
    if (!x) return "—";
    const d = new Date(x);
    return isNaN(d.getTime()) ? x : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  return f(s) + " → " + f(e);
}

export interface LedgerEntry {
  cat: string;
  catName: string;
  summary: string;
  ts: number;
  actor: string;
}
export interface NotifItem {
  id: number;
  type: string;
  title: string;
  body: string;
  ts: number;
  read: boolean;
}
export const SEED_NOTIFS: NotifItem[] = [
  { id: 1, type: "incident", title: "P0 incident raised", body: "checkout-service · SI-204417 needs an owner.", ts: Date.now() - 1000 * 60 * 6, read: false },
  { id: 2, type: "approval", title: "Approval requested", body: "Automated rollback awaiting your approval.", ts: Date.now() - 1000 * 60 * 42, read: false },
  { id: 3, type: "policy", title: "SLA breach risk", body: "payments-api is within 8 min of P1 response SLA.", ts: Date.now() - 1000 * 60 * 90, read: false },
  { id: 4, type: "user", title: "New member joined", body: "sandra@scrubbe.com accepted their invite.", ts: Date.now() - 1000 * 60 * 60 * 5, read: false },
  { id: 5, type: "integration", title: "Datadog connected", body: "Monitoring data is now flowing into Scrubbe.", ts: Date.now() - 1000 * 60 * 60 * 22, read: false },
  { id: 6, type: "security", title: "Sign-in from new device", body: "London, UK · Chrome on macOS.", ts: Date.now() - 1000 * 60 * 60 * 26, read: false },
  { id: 7, type: "policy", title: "Error budget low", body: "search-service has 12% of its monthly budget left.", ts: Date.now() - 1000 * 60 * 60 * 48, read: false },
];
export const NOTIF_TINT: Record<string, Tint> = {
  incident: "slate", approval: "slate", policy: "slate", user: "slate", integration: "slate", security: "slate",
};
export const NOTIF_ICON: Record<string, string> = {
  incident: "rules", approval: "roles", policy: "sla", user: "users", integration: "integ", security: "security",
};

export function userName(users: { email: string; name?: string }[], email: string): string {
  const u = users.find((x) => x.email === email);
  if (u?.name) return u.name;
  const p = String(email || "").split("@")[0].replace(/[._-]+/g, " ");
  return p.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function downloadText(filename: string, text: string) {
  try {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    /* download unavailable in this environment */
  }
}

export const STORAGE_KEY = "scrubbe.settings.v2";
export const LEDGER_KEY = "scrubbe.ledger.v1";
export const NOTIFS_KEY = "scrubbe.notifs.v1";
