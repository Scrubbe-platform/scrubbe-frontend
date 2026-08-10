/* Static reference data + pure helpers for the redesigned onboarding checklist
   (WelcomePageV2). Kept separate from the component so the render file stays
   readable — mirrors the asset-inventory module's `*.data.ts` convention. */

export type FieldType = "text" | "password" | "url" | "select" | "textarea";

export interface FieldDef {
  k: string;
  l: string;
  t: FieldType;
  ph?: string;
  opts?: string[];
}

export const F = (
  k: string,
  l: string,
  t: FieldType = "text",
  ph = "",
  opts?: string[],
): FieldDef => ({ k, l, t, ph, opts });

export interface ItemDef {
  id: string;
  n: number;
  ic: string;
  dom: string | null;
  weight: number;
  title: string;
  blurb: string;
  why: string;
}

export interface DiscoveryCounts {
  services: number;
  assets: number;
  infra: number;
  deps: number;
  clusters: number;
  databases: number;
  certs: number;
  unowned: { nm: string; tier: string; hint: string }[];
}

export interface InviteRow {
  email: string;
  role: string;
  perm: string;
}
export interface Invite extends InviteRow {
  when: string;
}
export interface CustomConnector {
  name: string;
  url: string;
  method: string;
  auth: string;
  secret: string;
  events: string;
}
export interface Rotation {
  nm: string;
  group: string;
  pattern: string;
}
export interface Incident {
  id: string;
  title: string;
  sev: string;
  service: string;
  group: string;
}
export interface Recommendation {
  t: string;
  why: string;
  go: string;
}

/* Vendor monogram + brand colour. Swap `mk` for an official SVG from the
   vendor's brand kit before shipping — redistributing their real logos
   needs their licence, not ours. */
export const VENDOR: Record<string, { c: string; mk: string }> = {
  GitHub: { c: "#24292F", mk: "GH" },
  GitLab: { c: "#FC6D26", mk: "GL" },
  Bitbucket: { c: "#0052CC", mk: "BB" },
  "GitHub Actions": { c: "#2088FF", mk: "GA" },
  "Azure DevOps": { c: "#0078D4", mk: "AZ" },
  CircleCI: { c: "#343434", mk: "CI" },
  Jenkins: { c: "#D33833", mk: "JK" },
  "Argo CD": { c: "#EF7B4D", mk: "AR" },
  AWS: { c: "#FF9900", mk: "AWS" },
  Azure: { c: "#0089D6", mk: "AZ" },
  "Google Cloud": { c: "#4285F4", mk: "GC" },
  Datadog: { c: "#632CA6", mk: "DD" },
  "New Relic": { c: "#1CE783", mk: "NR" },
  Grafana: { c: "#F46800", mk: "GF" },
  Prometheus: { c: "#E6522C", mk: "PR" },
  Elastic: { c: "#00BFB3", mk: "ES" },
  PagerDuty: { c: "#06AC38", mk: "PD" },
  Opsgenie: { c: "#172B4D", mk: "OG" },
  Slack: { c: "#4A154B", mk: "SL" },
  "Microsoft Teams": { c: "#5059C9", mk: "MT" },
  Jira: { c: "#0052CC", mk: "JR" },
  Linear: { c: "#5E6AD2", mk: "LN" },
};
export function vendorStyle(name: string) {
  const v = VENDOR[name] || { c: "#5B6472", mk: (name || "?").slice(0, 2).toUpperCase() };
  const dark = ["#1CE783", "#FF9900", "#F46800"].includes(v.c);
  return { bg: v.c, fg: dark ? "#0B1220" : "#fff", mk: v.mk };
}

export const CONN_FIELDS: Record<string, FieldDef[]> = {
  GitHub: [F("org", "Organization", "text", "northwind"), F("token", "Personal access token or App private key", "password", "ghp_…"), F("base", "Enterprise base URL (self-hosted only)", "url", "https://github.northwind.com/api/v3")],
  GitLab: [F("group", "Top-level group", "text", "northwind"), F("token", "Access token", "password", "glpat-…"), F("base", "Instance URL", "url", "https://gitlab.com")],
  Bitbucket: [F("workspace", "Workspace", "text", "northwind"), F("user", "Username", "text"), F("token", "App password", "password")],
  "GitHub Actions": [F("org", "Organization", "text", "northwind"), F("token", "Access token with workflow scope", "password")],
  "Azure DevOps": [F("org", "Organization", "text", "northwind"), F("project", "Default project", "text"), F("pat", "Personal access token", "password")],
  CircleCI: [F("slug", "Project slug", "text", "gh/northwind"), F("token", "API token", "password")],
  Jenkins: [F("url", "Controller URL", "url", "https://ci.northwind.com"), F("user", "Username", "text"), F("token", "API token", "password")],
  "Argo CD": [F("url", "Argo CD server", "url", "https://argocd.northwind.com"), F("token", "Auth token", "password")],
  AWS: [F("account", "Account ID", "text", "123456789012"), F("role", "Cross-account role ARN", "text", "arn:aws:iam::123456789012:role/ScrubbeReadOnly"), F("ext", "External ID", "text"), F("regions", "Regions", "text", "eu-west-1, eu-west-2")],
  Azure: [F("tenant", "Tenant ID", "text"), F("sub", "Subscription ID", "text"), F("client", "Client ID", "text"), F("secret", "Client secret", "password")],
  "Google Cloud": [F("project", "Project ID", "text", "northwind-prod"), F("sa", "Service account key (JSON)", "textarea", '{ "type": "service_account", … }')],
  Datadog: [F("site", "Site", "select", "", ["datadoghq.com", "datadoghq.eu", "us3.datadoghq.com", "ddog-gov.com"]), F("api", "API key", "password"), F("app", "Application key", "password")],
  "New Relic": [F("account", "Account ID", "text"), F("key", "User API key", "password"), F("region", "Region", "select", "", ["US", "EU"])],
  Grafana: [F("url", "Grafana URL", "url", "https://grafana.northwind.com"), F("token", "Service account token", "password")],
  Prometheus: [F("url", "Query endpoint", "url", "https://prometheus.northwind.com"), F("auth", "Bearer token (optional)", "password")],
  Elastic: [F("url", "Cluster URL", "url", "https://elastic.northwind.com:9243"), F("key", "API key", "password")],
  PagerDuty: [F("key", "REST API key", "password"), F("from", "Default from-address", "text", "ops@northwind.com")],
  Opsgenie: [F("key", "API key", "password"), F("region", "Region", "select", "", ["US", "EU"])],
  Slack: [F("workspace", "Workspace", "text", "northwind"), F("bot", "Bot user OAuth token", "password", "xoxb-…"), F("channel", "Default incident channel", "text", "#incidents")],
  "Microsoft Teams": [F("tenant", "Tenant ID", "text"), F("team", "Default team", "text"), F("webhook", "Incoming webhook URL", "url")],
  Jira: [F("site", "Site URL", "url", "https://northwind.atlassian.net"), F("email", "Account email", "text"), F("token", "API token", "password"), F("project", "Default project key", "text", "OPS")],
  Linear: [F("key", "API key", "password"), F("team", "Default team key", "text", "OPS")],
};

export const INTEGRATIONS: { cat: string; req: boolean; items: string[] }[] = [
  { cat: "Source control", req: true, items: ["GitHub", "GitLab", "Bitbucket"] },
  { cat: "CI/CD", req: false, items: ["GitHub Actions", "Azure DevOps", "CircleCI", "Jenkins", "Argo CD"] },
  { cat: "Cloud", req: true, items: ["AWS", "Azure", "Google Cloud"] },
  { cat: "Observability", req: true, items: ["Datadog", "New Relic", "Grafana", "Prometheus", "Elastic"] },
  { cat: "Incident", req: false, items: ["PagerDuty", "Opsgenie"] },
  { cat: "Communication", req: true, items: ["Slack", "Microsoft Teams"] },
  { cat: "Ticketing", req: false, items: ["Jira", "Linear"] },
];
export const REQ_CATS = ["Source control", "Cloud", "Observability", "Communication"];

export interface IdpDef {
  id: string;
  nm: string;
  sub: string;
  c: string;
  mk: string;
  fields: FieldDef[];
}
export const IDP: IdpDef[] = [
  {
    id: "entra", nm: "Microsoft Entra ID", sub: "SAML 2.0 · SCIM ready", c: "#0078D4", mk: "MS",
    fields: [F("tenant", "Directory (tenant) ID", "text", "00000000-0000-0000-0000-000000000000"), F("client", "Application (client) ID", "text"), F("secret", "Client secret", "password"), F("domain", "Verified domain", "text", "northwind.com")],
  },
  {
    id: "google", nm: "Google Workspace", sub: "OIDC · directory sync", c: "#4285F4", mk: "GW",
    fields: [F("client", "Client ID", "text", "…apps.googleusercontent.com"), F("secret", "Client secret", "password"), F("hd", "Hosted domain", "text", "northwind.com"), F("admin", "Admin account for directory sync", "text", "sso-admin@northwind.com")],
  },
  {
    id: "okta", nm: "Okta", sub: "SAML 2.0 · SCIM ready", c: "#007DC1", mk: "OK",
    fields: [F("domain", "Okta domain", "url", "https://northwind.okta.com"), F("client", "Client ID", "text"), F("secret", "Client secret", "password"), F("scim", "SCIM base URL (optional)", "url", "https://northwind.okta.com/scim/v2")],
  },
  {
    id: "onelogin", nm: "OneLogin", sub: "SAML 2.0", c: "#1C1F2A", mk: "OL",
    fields: [F("sub", "Subdomain", "text", "northwind"), F("client", "Client ID", "text"), F("secret", "Client secret", "password")],
  },
  {
    id: "oidc", nm: "Generic OIDC", sub: "Any compliant provider", c: "#5B6472", mk: "ID",
    fields: [F("issuer", "Issuer URL", "url", "https://idp.northwind.com"), F("client", "Client ID", "text"), F("secret", "Client secret", "password"), F("scopes", "Scopes", "text", "openid profile email groups")],
  },
  {
    id: "saml", nm: "Generic SAML 2.0", sub: "Metadata XML", c: "#5B6472", mk: "SA",
    fields: [F("entity", "Identity provider entity ID", "text", "https://idp.northwind.com/metadata"), F("sso", "SSO endpoint URL", "url", "https://idp.northwind.com/sso"), F("cert", "x509 signing certificate", "textarea", "-----BEGIN CERTIFICATE-----")],
  },
];

export const GROUPS_DEFAULT = ["Platform Engineering", "SRE", "Infrastructure"];
export const GROUPS_ALL = ["Platform Engineering", "SRE", "Infrastructure", "Database", "Security", "Networking", "Payments", "Identity"];

export const AGENTS = [
  { id: "infra", nm: "Infrastructure Agent", note: "Saturation, capacity, and node health" },
  { id: "deploy", nm: "Deployment Agent", note: "Release verification and rollback readiness" },
  { id: "logs", nm: "Logs Agent", note: "Error-rate and log pattern shifts" },
  { id: "impact", nm: "Customer Impact Agent", note: "Blast radius and affected-account estimates" },
  { id: "security", nm: "Security Agent", note: "Credential exposure and policy violations" },
];
export const AGENT_MODES = ["Suggest only", "Execute with approval", "Execute autonomously"];

export const CHANNELS = [
  { id: "slack", nm: "Slack", note: "Incident channels, alerts, and agent handoffs", needs: "Slack" },
  { id: "email", nm: "Email", note: "Digests and escalation notices", needs: null },
  { id: "teams", nm: "Microsoft Teams", note: "Incident channels and alerts", needs: "Microsoft Teams" },
  { id: "webhook", nm: "Webhook", note: "Push events to your own endpoint", needs: null },
  { id: "sms", nm: "SMS", note: "P1 escalation only, carrier rates apply", needs: null },
];

export const SEVERITIES = [
  { id: "P0", nm: "Critical", colour: "#DC2626", resp: 5, res: 60, note: "Customer-facing outage, data loss, or a breach in progress" },
  { id: "P1", nm: "High", colour: "#E4572E", resp: 15, res: 240, note: "Major degradation with revenue or contractual impact" },
  { id: "P2", nm: "Moderate", colour: "#D97706", resp: 60, res: 1440, note: "Partial impact, a workaround exists" },
  { id: "P3", nm: "Low", colour: "#71717A", resp: 240, res: 4320, note: "Cosmetic, internal, or deferred work" },
];
export const RESP_OPTS = [5, 10, 15, 30, 60, 120, 240];
export const RES_OPTS = [60, 120, 240, 480, 720, 1440, 2880, 4320];
export const PREFIXES = [
  { v: "INC", note: "Matches most ITSM tooling — the safe default if you already run ServiceNow or Jira Service Management." },
  { v: "SI", note: "Scrubbe Incident. Use this when incidents raised here must be distinguishable from your existing ITSM queue." },
];
export function mins(n: number): string {
  if (n < 60) return n + " min";
  if (n < 1440) return n / 60 + " hr" + (n / 60 === 1 ? "" : "s");
  return n / 1440 + " day" + (n / 1440 === 1 ? "" : "s");
}

export const ITEMS: ItemDef[] = [
  { id: "org", n: 1, ic: "building", dom: "Identity", weight: 5, title: "Organization profile", blurb: "Who you are, where you operate, and when your business hours run.", why: "Every incident timestamp, escalation window, and report is anchored to this. It is the one thing everything else assumes." },
  { id: "team", n: 2, ic: "people", dom: "Identity", weight: 5, title: "Invite your team", blurb: "Engineers, SREs, platform engineers, managers, and executives.", why: "Roles decide who can approve production changes later. You can change any of them after the fact." },
  { id: "auth", n: 3, ic: "key", dom: "Identity", weight: 5, title: "Configure authentication", blurb: "Single sign-on through your existing identity provider.", why: "SCIM provisioning arrives once SSO is live, so group membership stays in step with your directory automatically." },
  { id: "stack", n: 4, ic: "plug", dom: "Integrations", weight: 5, title: "Connect your engineering stack", blurb: "Source control, CI/CD, cloud, observability, incident, chat, and ticketing.", why: "This is the largest step and the one that pays for the rest. Everything Scrubbe discovers, correlates, and acts on comes through these connections." },
  { id: "discover", n: 5, ic: "radar", dom: "Assets", weight: 5, title: "Discover your environment", blurb: "Find the services, assets, and dependencies you already run.", why: "This is the moment Scrubbe becomes operational. Nothing below this line has to be typed in by hand." },
  { id: "catalog", n: 6, ic: "layers", dom: "Service catalog", weight: 3, title: "Review service catalog", blurb: "Approve what discovery found, merge duplicates, assign owners.", why: "Ownership is the only part of the catalog a machine cannot infer reliably. Everything else is filled in for you." },
  { id: "groups", n: 7, ic: "users", dom: "Governance", weight: 3, title: "Configure assignment groups", blurb: "The teams that own services and receive incidents.", why: "Groups are the routing table for every incident, approval, and escalation Scrubbe raises." },
  { id: "policies", n: 8, ic: "alert", dom: "Governance", weight: 5, title: "Configure incident policies", blurb: "Severity definitions, response targets, escalation, and numbering.", why: "Sensible defaults are already applied. Adjust them to match the language your organization already uses." },
  { id: "rules", n: 9, ic: "sliders", dom: "Operational rules", weight: 5, title: "Configure operational rules", blurb: "What may be changed in production, by whom, and under what approval.", why: "This is the heart of Scrubbe. Nothing autonomous happens outside the boundary you draw here." },
  { id: "ai", n: 10, ic: "brain", dom: "AI", weight: 5, title: "Configure AI", blurb: "Enable Ezra, choose your agents, and set their execution limits.", why: "Agents inherit the operational rules above. Raise their authority only as far as you are comfortable, then raise it again later." },
  { id: "notify", n: 11, ic: "bell", dom: "Notifications", weight: 3, title: "Configure notifications", blurb: "Where incidents, approvals, and agent findings show up.", why: "People act on what reaches them. Channels here decide whether Scrubbe is noticed or ignored." },
  { id: "oncall", n: 12, ic: "clock", dom: "Notifications", weight: 3, title: "Configure on-call", blurb: "Schedules, escalation levels, and a fallback group.", why: "Without a fallback, an unacknowledged P1 has nowhere to go. That is the failure mode this step exists to prevent." },
  { id: "readiness", n: 13, ic: "gauge", dom: null, weight: 0, title: "Run operational readiness check", blurb: "A full audit of the configuration above, with what to fix.", why: "Run this whenever you like. It reads your live configuration, so the result is never a snapshot of something stale." },
  { id: "launch", n: 14, ic: "flag", dom: null, weight: 0, title: "Start your first incident", blurb: "Put the whole thing to work.", why: "" },
];
export const DOMAINS = ["Identity", "Integrations", "Assets", "Service catalog", "Governance", "Operational rules", "AI", "Notifications"];
export const CHECKLIST_ITEMS = ITEMS.filter((i) => i.id !== "launch");
export const byId = (id: string) => ITEMS.find((i) => i.id === id)!;

export const DISCOVERY_STEPS: [string, keyof Omit<DiscoveryCounts, "unowned">][] = [
  ["Services", "services"], ["Assets", "assets"], ["Infrastructure", "infra"],
  ["Dependencies", "deps"], ["Kubernetes clusters", "clusters"], ["Databases", "databases"], ["Certificates", "certs"],
];
export const DISCOVERY_RESULTS: Omit<DiscoveryCounts, "unowned"> = { services: 64, assets: 238, infra: 41, deps: 112, clusters: 4, databases: 9, certs: 23 };

export const UNOWNED_SEED: { nm: string; tier: string; hint: string }[] = [
  { nm: "payments-api", tier: "Tier 0", hint: "12 assets · eu-west-1" },
  { nm: "checkout-web", tier: "Tier 0", hint: "8 assets · eu-west-1" },
  { nm: "identity-broker", tier: "Tier 0", hint: "6 assets · global" },
  { nm: "ledger-writer", tier: "Tier 1", hint: "9 assets · eu-west-1" },
  { nm: "settlement-batch", tier: "Tier 1", hint: "4 assets · eu-west-2" },
  { nm: "notification-relay", tier: "Tier 1", hint: "5 assets · eu-west-1" },
  { nm: "fraud-scoring", tier: "Tier 1", hint: "7 assets · eu-west-1" },
  { nm: "customer-profile", tier: "Tier 2", hint: "6 assets · eu-west-2" },
  { nm: "search-indexer", tier: "Tier 2", hint: "3 assets · eu-west-2" },
  { nm: "reporting-etl", tier: "Tier 2", hint: "11 assets · eu-west-1" },
  { nm: "internal-admin", tier: "Tier 3", hint: "4 assets · eu-west-2" },
  { nm: "legacy-archive", tier: "Tier 3", hint: "2 assets · eu-west-2" },
];
export const DUPES: [string, string][] = [
  ["payments-api", "payments-api-v2"],
  ["search-indexer", "search-index-service"],
  ["reporting-etl", "reporting_etl"],
];

export const AUTO_PANEL = [
  { nm: "Service dependencies", ic: "link", note: "Derived from live traffic between services, not from a diagram somebody drew once." },
  { nm: "Assets", ic: "cube", note: "Discovered continuously from your cloud, cluster, and database connections." },
  { nm: "AI prompts", ic: "spark", note: "Ezra and the agents come pre-trained on operational context. There is nothing to write." },
  { nm: "Fingerprints", ic: "fingerprint", note: "Stable identities that survive restarts, rebuilds, and re-addressing." },
  { nm: "Operational memory", ic: "brain", note: "Every incident, fix, and outcome is remembered so the next one resolves faster." },
];

export const TZS = ["Europe/London", "Europe/Dublin", "Europe/Berlin", "America/New_York", "America/Los_Angeles", "Asia/Singapore", "Australia/Sydney"];
export const LANGS = ["English (UK)", "English (US)", "Deutsch", "Français", "Español", "日本語"];
export const CALS = ["Follow the sun", "Business hours only", "24/7 coverage"];
export const INDUSTRIES = ["Financial services", "Healthcare", "Retail & e-commerce", "Media", "Public sector", "Software", "Other"];
export const ROLES = ["Engineer", "SRE", "Platform Engineer", "Manager", "Executive"];
export const PERMS = [
  { v: "Administrator", note: "Full configuration, billing, and policy control" },
  { v: "Operator", note: "Raise, run, and resolve incidents; execute approved actions" },
  { v: "Approver", note: "Approve production changes without executing them" },
  { v: "Responder", note: "Join incidents and act inside their own services" },
  { v: "Viewer", note: "Read-only across the tenant" },
];
export const PERMS_LIST = PERMS.map((p) => p.v);
export const ACCENTS = ["#28A745", "#2456D6", "#4F46E5", "#7C3AED", "#0D9488", "#0891B2", "#D97706", "#DC2626", "#0B1220"];

export function mapPermToRole(perm: string): string {
  switch (perm) {
    case "Administrator": return "ADMIN";
    case "Operator": return "OPERATIONS_MANAGER";
    case "Approver": return "INCIDENT_COMMANDER";
    case "Viewer": return "VIEWER";
    case "Responder":
    default:
      return "RESPONDER";
  }
}

export function slugify(text?: string): string {
  return String(text || "tenant").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tenant";
}
export function initials(name?: string): string {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "AD";
  return (parts[0][0] + (parts[1] ? parts[1][0] : parts[0][1] || "")).toUpperCase();
}
export function isValidEmail(v: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
}
export function parseBulkRows(text: string): InviteRow[] {
  const rows: InviteRow[] = [];
  text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).forEach((line) => {
    const [email, role, perm] = line.split(",").map((x) => (x || "").trim());
    if (!isValidEmail(email || "")) return;
    rows.push({ email, role: ROLES.includes(role) ? role : "Engineer", perm: PERMS_LIST.includes(perm) ? perm : "Responder" });
  });
  return rows;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) || 0);
}
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string): number {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
/* Pick whichever of ink/white actually reads better against the accent, rather than guessing at a threshold. */
export function readableInk(hex: string): string {
  return contrast(hex, "#0B1220") >= contrast(hex, "#FFFFFF") ? "#0B1220" : "#FFFFFF";
}
export function shade(hex: string, amt: number): string {
  const v = hexToRgb(hex).map((c) => Math.max(0, Math.min(255, Math.round(c * amt))));
  return "#" + v.map((x) => x.toString(16).padStart(2, "0")).join("");
}
