/**
 * Verbatim port of the Evidence Explorer blueprint's data — incident
 * SI-7A42K91, a payments-api deployment-induced retry storm. Swap for real
 * API calls once the corresponding endpoints exist; the shapes here mirror
 * what the backend will eventually return.
 */

export type SourceKey = "all" | "payments" | "postgres" | "k8s" | "cicd" | "agents";

export interface SourceRow {
  key: Exclude<SourceKey, "all">;
  label: string;
  conf: "high" | "med";
  signals: { label: string; id: string; value: number }[];
  spark: number[];
  hot: number;
  findings?: boolean;
}

export const SOURCES: SourceRow[] = [
  {
    key: "payments",
    label: "Payments API",
    conf: "high",
    signals: [
      { label: "Errors", id: "payErr", value: 2432 },
      { label: "Warnings", id: "payWarn", value: 984 },
      { label: "Deployments", id: "payDep", value: 1 },
      { label: "Changes", id: "payChg", value: 7 },
    ],
    spark: [5, 6, 5, 7, 8, 12, 10, 13, 18, 22, 28, 34],
    hot: 3,
  },
  {
    key: "postgres",
    label: "PostgreSQL Cluster",
    conf: "med",
    signals: [
      { label: "Connection Failures", id: "pgConn", value: 483 },
      { label: "Latency Events", id: "pgLat", value: 82 },
      { label: "Replication Events", id: "pgRep", value: 4 },
    ],
    spark: [8, 9, 7, 10, 12, 9, 11, 16, 21, 19, 24, 30],
    hot: 3,
  },
  {
    key: "k8s",
    label: "Kubernetes Platform",
    conf: "high",
    signals: [
      { label: "Pod Restarts", id: "k8sRestart", value: 214 },
      { label: "Scheduling Events", id: "k8sSched", value: 19 },
      { label: "Node Alerts", id: "k8sNode", value: 6 },
    ],
    spark: [6, 7, 6, 8, 9, 11, 10, 14, 16, 15, 22, 26],
    hot: 3,
  },
  {
    key: "cicd",
    label: "CI/CD Pipeline",
    conf: "med",
    signals: [
      { label: "Deployments", id: "cicdDep", value: 1 },
      { label: "Rollback Events", id: "cicdRb", value: 0 },
      { label: "Build Changes", id: "cicdBuild", value: 3 },
    ],
    spark: [2, 2, 1, 3, 2, 2, 1, 2, 3, 2, 1, 3],
    hot: -1,
  },
  {
    key: "agents",
    label: "Agent Findings",
    conf: "high",
    signals: [
      { label: "Code Agent", id: "agCode", value: 5 },
      { label: "Infrastructure Agent", id: "agInfra", value: 3 },
      { label: "Pipeline Agent", id: "agPipe", value: 2 },
    ],
    spark: [1, 2, 1, 2, 3, 2, 3, 2, 4, 3, 4, 5],
    hot: -1,
    findings: true,
  },
];

export interface FeedItem {
  id: string;
  source: Exclude<SourceKey, "all">;
  ts: string;
  kind: string;
  tag: "t-crit" | "t-warn" | "t-acc" | "t-neu";
  rail: "r-crit" | "r-warn" | "r-acc" | "r-neu";
  services: string[];
  env: string;
  region: string;
  phase: string;
  sev: "crit" | "warn" | "info";
  title: string;
  srcLabel: string;
  meta: [string, string, number?, string?][];
  raw: string;
  signals: string[];
  findings: string[];
  systems: string[];
}

export const EVIDENCE: FeedItem[] = [
  {
    id: "e-deploy", source: "cicd", ts: "17:07:12", kind: "Deployment Event", tag: "t-acc", rail: "r-acc",
    services: ["payments-api"], env: "production", region: "eu-west-1", phase: "investigation", sev: "info",
    title: "Deployment completed", srcLabel: "CI/CD Pipeline",
    meta: [["Version", "payments-api:v4.3.8", 1], ["Triggered by", "GitHub Actions"], ["Status", "Successful"]],
    raw: 'event=deployment.completed\nservice=payments-api\nversion=v4.3.8\nprevious=v4.3.7\nstrategy=rolling\nactor=github-actions[bot]\nduration=92s',
    signals: ["Image digest changed vs previous release", "Rolling update across 12 replicas", "New env var RETRY_MAX_ATTEMPTS=8"],
    findings: ["Code Agent: retry-handling logic modified (87%)"],
    systems: ["payments-api", "argo-rollouts", "gha-runner-7"],
  },
  {
    id: "e-pod", source: "k8s", ts: "17:07:25", kind: "Infrastructure Event", tag: "t-warn", rail: "r-warn",
    services: ["payments-api"], env: "production", region: "eu-west-1", phase: "investigation", sev: "warn",
    title: "Pod restart detected", srcLabel: "Kubernetes Platform",
    meta: [["Service", "payments-api"], ["Restart Count", "43", 1], ["Reason", "CrashLoopBackOff"]],
    raw: 'event=pod.restart\nnamespace=payments\npod=payments-api-7c9f-x\nrestarts=43\nreason=CrashLoopBackOff\nexit_code=137',
    signals: ["OOM and liveness-probe timeouts coincide with traffic", "Restart rate rose sharply after 17:06", "Memory ceiling reached under retry load"],
    findings: ["Infra Agent: restart cascade correlates with deploy (74%)"],
    systems: ["payments-api", "node-eu-west-1b", "kubelet"],
  },
  {
    id: "e-agent", source: "agents", ts: "17:07:28", kind: "Agent Finding", tag: "t-acc", rail: "r-acc",
    services: ["payments-api"], env: "production", region: "eu-west-1", phase: "investigation", sev: "info",
    title: "Code Agent finding", srcLabel: "Code Agent",
    meta: [["Summary", "Deployment modified retry handling logic"], ["Confidence", "87%", 1], ["Agent", "Code Agent"]],
    raw: 'finding=code.change.risk\nfile=src/http/retry.ts\nchange=backoff removed; max attempts 3→8\nblast_radius=high\nconfidence=0.87',
    signals: ["Exponential backoff replaced with fixed 50ms interval", "Retry ceiling raised 3→8", "No jitter applied — synchronized retries"],
    findings: ["Linked to error spike at 17:07:30", "Linked to DB latency increase at 17:07:34"],
    systems: ["payments-api", "retry-handler", "postgres-primary"],
  },
  {
    id: "e-err", source: "payments", ts: "17:07:30", kind: "Error Cluster", tag: "t-crit", rail: "r-crit",
    services: ["payments-api"], env: "production", region: "eu-west-1", phase: "investigation", sev: "crit",
    title: "Error spike detected", srcLabel: "Payments API",
    meta: [["Pattern", "HTTP 500 responses increased"], ["Baseline", "34/min"], ["Current", "__errRate__", 1, "up"]],
    raw: 'event=error.cluster\nstatus=500\nhandler=payments.charge\nbaseline=34/min\ncurrent=1,842/min\ntop_error="connection pool exhausted"',
    signals: ["54× increase over baseline", "Dominant error: DB connection pool exhausted", "Onset 18s after deployment"],
    findings: ["Correlates with retry-handling change", "Correlates with DB latency increase"],
    systems: ["payments-api", "pgbouncer", "postgres-primary"],
  },
  {
    id: "e-db", source: "postgres", ts: "17:07:34", kind: "Dependency Event", tag: "t-warn", rail: "r-warn",
    services: ["payments-api", "postgres-cluster"], env: "production", region: "eu-west-1", phase: "investigation", sev: "warn",
    title: "Database latency increased", srcLabel: "PostgreSQL Cluster",
    meta: [["Metric", "Average query latency"], ["Average", "18ms"], ["Current", "__latency__", 1, "up"]],
    raw: 'event=dependency.latency\ncluster=postgres-primary\navg_baseline=18ms\navg_current=732ms\nactive_connections=198/200\nwait="ClientRead / pool"',
    signals: ["Connection pool 198/200 saturated", "Retry storm amplifies query volume", "Replication lag rising on replica-2"],
    findings: ["Latency is partly symptom of retry amplification", "Pool exhaustion drives 500s upstream"],
    systems: ["postgres-primary", "pgbouncer", "replica-2"],
  },
  {
    id: "e-cust", source: "payments", ts: "17:07:37", kind: "Customer Impact Signal", tag: "t-crit", rail: "r-crit",
    services: ["payments-api", "checkout-service"], env: "production", region: "eu-west-1", phase: "investigation", sev: "crit",
    title: "Checkout failures observed", srcLabel: "Checkout Service",
    meta: [["Affected Requests", "__affected__", 1, "up"], ["Impact", "High"], ["Onset", "Immediate"]],
    raw: 'event=customer.impact\nflow=checkout\nfailed_requests=14,293\nimpact=high\nfirst_seen=17:07:37',
    signals: ["Checkout failure rate tracks payments 500s", "Cart abandonment rising in real time", "Support ticket volume +210%"],
    findings: ["Customer impact began immediately after error spike"],
    systems: ["checkout-service", "customer-portal", "payments-api"],
  },
  {
    id: "e-sec", source: "payments", ts: "17:07:41", kind: "Security Event", tag: "t-crit", rail: "r-crit",
    services: ["payments-api"], env: "production", region: "eu-west-1", phase: "investigation", sev: "crit",
    title: "Authentication failures increased", srcLabel: "Payments API",
    meta: [["Pattern", "Auth failures"], ["Current Rate", "+320%", 1, "up"], ["Assessment", "Likely retry side-effect"]],
    raw: 'event=security.auth_failures\nrate_change=+320%\nsource=internal-retries\nassessment=no external indicators\nclassification=likely-benign',
    signals: ["Spike driven by token re-validation on retries", "No anomalous source IPs detected", "Pattern matches internal retry storm"],
    findings: ["Ezra assessment: side-effect of retry change, not an attack"],
    systems: ["payments-api", "auth-service"],
  },
  {
    id: "e-pgconn", source: "postgres", ts: "17:06:58", kind: "Dependency Event", tag: "t-warn", rail: "r-warn",
    services: ["payments-api", "postgres-cluster"], env: "production", region: "eu-west-1", phase: "investigation", sev: "warn",
    title: "Connection failures rising", srcLabel: "PostgreSQL Cluster",
    meta: [["Metric", "Failed connections"], ["Current", "__pgConn__", 1, "up"], ["Pool", "pgbouncer"]],
    raw: 'event=dependency.conn_failures\nfailures=483\npool=pgbouncer\nmax_clients=200\nstate=saturated',
    signals: ["Earliest infrastructure signal of the incident", "Precedes error spike by ~30s"],
    findings: ["First measurable symptom of pool saturation"],
    systems: ["pgbouncer", "postgres-primary"],
  },
  {
    id: "e-sched", source: "k8s", ts: "17:07:02", kind: "Infrastructure Event", tag: "t-neu", rail: "r-neu",
    services: ["payments-api"], env: "production", region: "eu-west-1", phase: "investigation", sev: "info",
    title: "Scheduling event recorded", srcLabel: "Kubernetes Platform",
    meta: [["Type", "Pod rescheduled"], ["Node", "node-eu-west-1b"], ["Count", "19"]],
    raw: 'event=pod.scheduled\nreason=rolling-update\nnode=node-eu-west-1b\nevents=19',
    signals: ["Scheduling churn tied to rolling deployment", "No node pressure prior to deploy"],
    findings: ["Consistent with planned rollout, not the cause"],
    systems: ["kube-scheduler", "node-eu-west-1b"],
  },
  {
    id: "e-aginfra", source: "agents", ts: "17:07:19", kind: "Agent Finding", tag: "t-acc", rail: "r-acc",
    services: ["payments-api"], env: "production", region: "eu-west-1", phase: "investigation", sev: "info",
    title: "Infrastructure Agent finding", srcLabel: "Infrastructure Agent",
    meta: [["Summary", "Restart cascade correlates with deploy"], ["Confidence", "74%", 1], ["Agent", "Infra Agent"]],
    raw: 'finding=infra.cascade\npattern=restart-after-deploy\nlag=~13s\nconfidence=0.74',
    signals: ["Restarts begin ~13s after rollout start", "Memory pressure under amplified retries"],
    findings: ["Supports deployment as upstream trigger"],
    systems: ["payments-api", "kubelet"],
  },
  {
    id: "e-build", source: "cicd", ts: "17:05:40", kind: "Deployment Event", tag: "t-neu", rail: "r-neu",
    services: ["build-pipeline"], env: "staging", region: "eu-west-1", phase: "investigation", sev: "info",
    title: "Build change merged", srcLabel: "CI/CD Pipeline",
    meta: [["Branch", "release/4.3.8"], ["Environment", "staging"], ["Checks", "Passed"]],
    raw: 'event=build.merged\nbranch=release/4.3.8\nenv=staging\nchecks=passed',
    signals: ["Staging build that preceded the production release", "Tests did not cover retry-under-load path"],
    findings: ["Gap: no load test for retry handler"],
    systems: ["gha-runner-7", "staging-cluster"],
  },
  {
    id: "e-canary", source: "payments", ts: "17:08:50", kind: "Error Cluster", tag: "t-crit", rail: "r-crit",
    services: ["payments-api"], env: "production", region: "us-east-1", phase: "investigation", sev: "crit",
    title: "Canary error spike (us-east-1)", srcLabel: "Payments API",
    meta: [["Region", "us-east-1"], ["Pattern", "HTTP 500"], ["Current", "612/min", 1, "up"]],
    raw: 'event=error.cluster\nregion=us-east-1\nstatus=500\ncurrent=612/min',
    signals: ["Same failure signature appearing in secondary region", "Confirms change-driven, not region-local"],
    findings: ["Strengthens deployment as root cause across regions"],
    systems: ["payments-api", "postgres-us-east"],
  },
  {
    id: "e-prep", source: "cicd", ts: "16:40:00", kind: "Deployment Event", tag: "t-neu", rail: "r-neu",
    services: ["payments-api"], env: "production", region: "eu-west-1", phase: "investigation", sev: "info",
    title: "Config change applied", srcLabel: "CI/CD Pipeline",
    meta: [["Type", "Feature flag update"], ["Flag", "retry_v2"], ["State", "enabled"]],
    raw: 'event=config.change\nflag=retry_v2\nstate=enabled\nactor=platform-eng',
    signals: ["Earlier change that primed the new retry path", "Within the last hour, outside the 15-min window"],
    findings: ["Context for why v4.3.8 behaviour changed"],
    systems: ["feature-flags", "payments-api"],
  },
  {
    id: "e-baseline", source: "payments", ts: "14:05:00", kind: "Error Cluster", tag: "t-neu", rail: "r-neu",
    services: ["payments-api"], env: "production", region: "eu-west-1", phase: "investigation", sev: "info",
    title: "Baseline snapshot", srcLabel: "Payments API",
    meta: [["Errors", "34/min"], ["Latency", "18ms"], ["Window", "Pre-incident"]],
    raw: 'event=baseline.snapshot\nerrors=34/min\nlatency=18ms\nstate=healthy',
    signals: ["Healthy baseline for comparison", "Captured earlier today (24h window)"],
    findings: ["Reference point for deviation analysis"],
    systems: ["payments-api"],
  },
  {
    id: "e-resurge", source: "payments", ts: "17:15:40", kind: "Security Event", tag: "t-crit", rail: "r-crit",
    services: ["payments-api"], env: "production", region: "eu-west-1", phase: "investigation", sev: "crit",
    title: "Auth retry surge continues", srcLabel: "Payments API",
    meta: [["Rate", "+341%", 1, "up"], ["Window", "Last 5 min"], ["Source", "Internal retries"]],
    raw: 'event=security.auth_failures\nrate_change=+341%\nwindow=5m\nsource=internal-retries',
    signals: ["Most recent signal in the feed", "Confirms retry storm is still active"],
    findings: ["Pressure persists until rollback is applied"],
    systems: ["payments-api", "auth-service"],
  },
];

export const NOW = 17 * 3600 + 17 * 60 + 30; // 17:17:30 reference
export const t = (hms: string) => {
  const [h, m, s] = hms.split(":").map(Number);
  return h * 3600 + m * 60 + (s || 0);
};
export const minsAgo = (hms: string) => (NOW - t(hms)) / 60;
export const secToHMS = (sec: number) => {
  sec = ((sec % 86400) + 86400) % 86400;
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
};

export const TIME_OPTS: [string, number][] = [["Last 5 Minutes", 5], ["Last 15 Minutes", 15], ["Last Hour", 60], ["Last 24 Hours", 1440]];
export const QUICK: [string, number][] = [["Last 5 minutes", 5], ["Last 15 minutes", 15], ["Last 30 minutes", 30], ["Last 1 hour", 60], ["Last 3 hours", 180], ["Last 6 hours", 360], ["Last 24 hours", 1440]];
export const AR_OPTS: [string, number][] = [["Off", 0], ["5s", 5000], ["10s", 10000], ["30s", 30000], ["1m", 60000], ["5m", 300000]];
export const SRC_OPTS: [string, SourceKey][] = [["All Sources", "all"], ["Payments API", "payments"], ["PostgreSQL Cluster", "postgres"], ["Kubernetes Platform", "k8s"], ["CI/CD Pipeline", "cicd"], ["Agent Findings", "agents"]];

export interface Alert { id: string; sev: "crit" | "warn"; name: string; meta: string; state: "firing" | "acked" | "silenced" }
export const ALERTS: Alert[] = [
  { id: "al-err", sev: "crit", name: "Payments 500 error spike", meta: "payments-api · 1,842/min · 54× baseline", state: "firing" },
  { id: "al-pool", sev: "crit", name: "Connection pool saturated", meta: "pgbouncer · 198/200 clients", state: "firing" },
  { id: "al-lat", sev: "warn", name: "Database latency elevated", meta: "postgres-primary · 732ms avg", state: "firing" },
  { id: "al-restart", sev: "warn", name: "Pod restart cascade", meta: "payments-api · CrashLoopBackOff ×43", state: "firing" },
  { id: "al-checkout", sev: "crit", name: "Checkout failure rate high", meta: "checkout-service · 14,293 requests", state: "firing" },
  { id: "al-canary", sev: "warn", name: "Canary errors in us-east-1", meta: "payments-api · 612/min", state: "acked" },
];

export interface WrLogEntry { t: string; cls: "" | "gate" | "appr" | "act"; who: string; html: string }
export const WRLOG: WrLogEntry[] = [
  { t: "17:07", cls: "", who: "PagerDuty", html: "Incident <b>SI-7A42K91</b> opened and routed to payments on-call" },
  { t: "17:08", cls: "", who: "Ezra (agent)", html: "Proposed root cause: deployment-induced retry storm <b>(82%)</b>" },
  { t: "17:09", cls: "appr", who: "A. Mensah (IC)", html: "Approved diagnosis path · assigned remediation to Infra Agent" },
  { t: "17:10", cls: "", who: "Infra Agent", html: "Proposed mitigation: raise pool 200→320, scale pods 12→20" },
  { t: "17:11", cls: "gate", who: "Policy gate", html: "Mitigation held at <b>execution gate</b> — awaiting human approval" },
  { t: "17:12", cls: "appr", who: "A. Mensah (IC)", html: "Approved bridge mitigation · applied to production" },
  { t: "17:14", cls: "", who: "Code Agent", html: "Proposed rollback payments-api v4.3.8 → v4.3.7 <b>(84%)</b>" },
  { t: "17:15", cls: "gate", who: "Policy gate", html: "Rollback staged at gate — review in <b>Review remediation</b>" },
];

export const CAUSES: [string, number][] = [
  ["Database latency spike", 78],
  ["Deployment introduced retry failure", 91],
  ["Pod restart cascade", 64],
];
export const FINDINGS: string[] = [
  "Database response times increased 18ms → 732ms",
  "Deployment v4.3.8 occurred 3 minutes before incident",
  "Error rates correlate with database latency increase",
  "Customer checkout failures started immediately afterwards",
];
export const TIMELINE: [string, string, boolean][] = [
  ["17:03", "Deployment completed", false],
  ["17:05", "Database latency increased", false],
  ["17:06", "Pod restarts began", false],
  ["17:07", "Error rate spiked", true],
  ["17:08", "Customer failures detected", false],
];

export const SUGGEST: [string, string][] = [
  ["Why does Ezra believe the deployment caused the incident?", "cause"],
  ["Is the database the root cause or a symptom?", "db"],
  ["What is the fastest way to reduce customer impact?", "impact"],
  ["What changed in the deployment?", "change"],
];
export const ANSWERS: Record<string, string> = {
  cause: 'The timing chain is tight and corroborated. Deployment <b>v4.3.8</b> completed at 17:03; database latency began climbing at 17:05; pod restarts started at 17:06; and the error spike hit at 17:07 — 18 seconds after the rollout reached full traffic. The Code Agent independently found the release modified retry-handling logic (87% confidence), and the same failure signature appeared in us-east-1, ruling out a region-local fault. Together that puts confidence at <b>82%</b>.',
  db: "Mostly a symptom. The new retry logic removed backoff and raised max attempts 3→8 with no jitter, so failing requests retried in synchronised bursts. That flooded the connection pool (198/200), which pushed average query latency from 18ms to <b>732ms</b>. The database isn't unhealthy on its own — relieving the retry storm via rollback should bring latency back toward baseline.",
  impact: 'Roll back to <b>v4.3.7</b> — highest leverage, expected −80% failures at 84% confidence. If you need a bridge while the rollback propagates: raise the PostgreSQL connection pool 200→320 and scale payments-api pods 12→20 to absorb the retry load. Open the full plan from <b>Review remediation</b>.',
  change: 'The Code Agent flagged <b>src/http/retry.ts</b>: exponential backoff was replaced with a fixed 50ms interval, retry ceiling raised from 3 to 8, and no jitter was applied — so retries fire in lockstep. Staging tests passed but didn’t cover the retry-under-load path, which is why it reached production.',
  _fallback: "I can speak to the deployment link, whether the database is cause or symptom, the fastest way to cut customer impact, or exactly what changed. Try one of the suggested questions, or rephrase and I'll do my best.",
};
export const classify = (q: string): string => {
  const s = q.toLowerCase();
  if (/(rollback|remediat|mitigat|fix|reduce|impact|fastest)/.test(s)) return "impact";
  if (/(database|db|latency|postgres|symptom)/.test(s)) return "db";
  if (/(change|code|retry|what.*deploy|modif)/.test(s)) return "change";
  if (/(deploy|cause|why|believe|trigger|correlat)/.test(s)) return "cause";
  return "_fallback";
};

export const REMEDIES: [string, string, string, string, string, boolean][] = [
  ["1", "Roll back payments-api to v4.3.7", "Reverts the retry-handling change that triggered the cascade.", "−80% failures", "84%", true],
  ["2", "Increase PostgreSQL connection pool 200 → 320", "Relieves pool saturation while traffic recovers.", "↓latency", "61%", false],
  ["3", "Scale payments-api pods 12 → 20", "Absorbs retry load and reduces restart pressure.", "stabilises", "57%", false],
];

export const SETTINGS_DEF: [string, string, string][] = [
  ["live", "Live updates", "Stream new signals and counts in real time"],
  ["compact", "Compact density", "Tighten spacing to fit more evidence on screen"],
  ["autoscroll", "Follow new evidence", "Scroll the feed as new signals arrive"],
  ["reduceMotion", "Reduce motion", "Minimise animations and transitions"],
];
