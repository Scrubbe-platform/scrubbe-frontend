/**
 * Dummy data for the Incident Delivery surface, mirroring the "auto-raised"
 * scenario from the design blueprint (checkout-service resource exhaustion).
 * Every section renders from this file for now — swap these for real API
 * calls once the corresponding backend endpoints are ready.
 */

export const RAISE_TYPE: "manual" | "auto" = "auto";

export const RAISE_NOTE = {
  manual: {
    label: "Manually raised",
    note: "Opened by an analyst. No pipeline signal is bound, so Ezra works from incident metadata only.",
  },
  auto: {
    label: "Auto-raised · pipeline signal",
    note: "Raised automatically from a CI / runtime signal. Evidence is bound from the source pipeline.",
  },
}[RAISE_TYPE];

export const LEAD = {
  ticketId: "SI-9F3K2L",
  title: "Checkout latency spike & failed payments",
  service: "checkout-service",
};

export const CHIPS = [
  { tone: "acc", label: "Playbook Active" },
  { tone: "warn", label: "2 failing units" },
];

export const TRACE_STATUS = "Remediation proposed";

export const TRACE_STEPS = [
  { title: "Event received", sub: "Webhook / pipeline signal ingested", state: "done" as const },
  { title: "Incident created/updated", sub: "Correlation + dedup applied", state: "done" as const },
  { title: "Signals bound", sub: "Logs, jobs, PR, commit, artifacts", state: "done" as const },
  { title: "Playbook selected", sub: "Delivery-incident playbook", state: "done" as const },
  { title: "Policy decision", sub: "Auto-activate? Gate? Scope", state: "done" as const },
  { title: "Remediation + verification", sub: "Suggest → verify → summarize", state: "active" as const },
];

export const PAYLOAD = {
  tag: "Pipeline signal",
  warn: "",
  obj: {
    isLive: true,
    service: "checkout-service",
    receivedAt: "2026-06-28T13:41:09.204Z",
    eventType: "CI failure + runtime error cluster",
    action: "INVESTIGATING",
    conclusion: "",
    failureCategory: "resource-exhaustion",
    failing: ["payment-confirm", "cart-checkout"],
  },
};

export const INCIDENT_ROWS = [
  { title: "Incident ID", value: "SI-9F3K2L" },
  { title: "Correlation key", value: "checkout-service · db-pool-exhaustion · prod" },
  { title: "Repo / PR / commit", value: "scrubbe/checkout-api · #4821 · a1f9c3e", link: true },
  { title: "Type / subtype", value: "Delivery incident · Resource exhaustion", chips: true },
  { title: "Incident title", value: "Checkout latency spike & failed payments", full: true },
];

export const SIGNALS = {
  artifactsNote: "2 artifacts captured — CI run and diff are linkable below.",
  links: [
    { label: "runUrl", href: "https://ci.scrubbe.io/runs/4821" },
    { label: "diffUrl", href: "https://github.com/scrubbe/checkout-api/pull/4821/files" },
  ],
  units: ["payment-confirm", "cart-checkout"],
  kv: [
    { label: "repo", value: "checkout-api" },
    { label: "pr", value: "#4821" },
    { label: "sha", value: "a1f9c3e" },
  ],
};

export const PLAYBOOK = {
  matched: true,
  name: "Delivery incident · Resource exhaustion",
  description: "Safe restart + pool-tuning sequence with post-action verification.",
  scope: "service:checkout-service",
  steps: [
    { title: "Confirm saturation", desc: "Snapshot pool + error-rate metrics and verify 100% utilization against the 17-incident baseline." },
    { title: "Rolling restart", desc: "Drain and restart checkout-service one pod at a time to release the saturated pool." },
    { title: "Verify pool recovery", desc: "Watch pool utilization fall below 60% and error rate return under 1%." },
    { title: "Re-run required gates", desc: "Trigger payment-confirm and cart-checkout; both must return green before closing." },
    { title: "Harden (follow-up PR)", desc: "Raise the pool ceiling and add a retry-budget guard so the pattern cannot recur." },
  ],
};

export const POLICY = {
  configured: true,
  auto: "Gated",
  gate: "On-call approval",
  scope: "Single-service",
  reasons: [
    "Auto-activation is gated to a single service.",
    "Restart actions are pre-approved for P1 resource-exhaustion when flake rate is SAFE.",
  ],
  details: [
    { label: "Trigger conditions", value: "P1 · resource-exhaustion · flake rate SAFE" },
    { label: "Pre-approved action", value: "Rolling restart, single service" },
    { label: "Execution scope", value: "service:checkout-service only" },
    { label: "Approval gate", value: "On-call acknowledgement before execute" },
    { label: "Audit trail", value: "Every action written to the decision log" },
  ],
};

export const REMEDIATION = {
  confidence: 91,
  risk: "LOW",
  source: "EZRA + CONNECTOR",
  approval: "auto-eligible",
  action:
    "Restart checkout-service to release the saturated database connection pool, then verify recovery on payment-confirm and cart-checkout.",
  prChange:
    'Optional follow-up PR raises pool ceiling and adds a retry-budget guard so the pattern cannot recur. Aligns with the "Diff provenance" review.',
  ciAction:
    "Re-run payment-confirm and cart-checkout once the restart completes; both are required gates and must return green before closing.",
  previewId: "connector:7b2e9a14-checkout:restart",
  preview: "kubectl rollout restart deploy/checkout-service -n prod  # releases pool, verified against 17 prior incidents",
  verify: { ciRerun: "Ready", flake: "SAFE", jobs: 2 },
  verifyNote: "Restart matched a known-good remediation. Execute to populate live verification.",
  executive: "--",
  analyst: "--",
  executiveDone: "checkout-service restarted; pool released; checkout recovered. No customer-facing follow-up required.",
  analystDone: "Pool utilization 100%→34%; error rate 68%→0.4%; payment-confirm + cart-checkout green.",
};

export const DECISION_LOG = [
  {
    kind: "signal bound",
    desc: "CI failure + runtime error cluster correlated to checkout-service.",
    time: "13:41:09",
    who: "connector",
  },
  {
    kind: "playbook matched",
    desc: "Resource-exhaustion playbook activated (gated).",
    time: "13:41:22",
    who: "policy engine",
  },
  {
    kind: "hypothesis ranked",
    desc: "Ezra ranked DB pool exhaustion as lead cause at 91%.",
    time: "13:42:04",
    who: "Ezra",
  },
  {
    kind: "remediation proposed",
    desc: "Restart checkout-service proposed — Low risk, auto-eligible.",
    time: "13:42:31",
    who: "Ezra",
  },
];

export const NOTES = [
  {
    author: "A. Okafor",
    timestamp: "13:43 · today",
    content:
      "Pool sat at 100% for ~90s before error rate climbed. Restart matches the 17-incident precedent — proceeding once on-call ack lands.",
  },
];

export const EZRA = {
  pct: 91,
  hi: true,
  sub: "Lead cause Identified",
  finding:
    "The database connection pool is saturated at 100%, driving a 68% error rate on checkout. A service restart has resolved this exact pattern 17 times previously. Recommended action is Low risk and auto-eligible.",
  findingParts: [
    { text: "The database connection pool is " },
    { text: "saturated at 100%", bold: true },
    { text: ", driving a 68% error rate on checkout. A service restart has resolved this exact pattern " },
    { text: "17 times", bold: true },
    { text: " previously. Recommended action is " },
    { text: "Low risk", bold: true },
    { text: " and auto-eligible." },
  ] as { text: string; bold?: boolean }[],
};

export const SUGGESTED_QUESTIONS: { q: string; key: "cause" | "db" | "impact" | "change" }[] = [
  { q: "Why does Ezra believe the deployment caused the incident?", key: "cause" },
  { q: "Is the database the root cause or a symptom?", key: "db" },
  { q: "What is the fastest way to reduce customer impact?", key: "impact" },
  { q: "What changed in the deployment?", key: "change" },
];

export const ANSWERS: Record<string, string> = {
  cause:
    "The timing chain is tight and corroborated. Deployment #4821 raised retry pressure, database pool utilization hit 100%, and checkout error rate climbed to 68%. The Code Agent independently found the release modified retry-handling logic. Together that puts confidence at 91%.",
  db:
    "Mostly a symptom. The retry pressure from the deploy flooded the connection pool, which pushed error rates up. The database isn't unhealthy on its own — releasing the pool via a restart should bring things back toward baseline.",
  impact:
    "Restart checkout-service — highest leverage, matched 17 prior incidents, Low risk and auto-eligible. Open the full plan from Review remediation below.",
  change:
    "Deploy #4821 raised retry pressure on checkout-service, which combined with existing pool sizing to exhaust the database connection pool under load.",
  _fallback:
    "I can speak to the deployment link, whether the database is cause or symptom, the fastest way to cut customer impact, or exactly what changed. Try one of the suggested questions, or rephrase and I'll do my best.",
};

export const classifyQuestion = (q: string): string => {
  const s = q.toLowerCase();
  if (/(rollback|remediat|mitigat|fix|reduce|impact|fastest)/.test(s)) return "impact";
  if (/(database|db|latency|postgres|symptom)/.test(s)) return "db";
  if (/(change|code|retry|what.*deploy|modif)/.test(s)) return "change";
  if (/(deploy|cause|why|believe|trigger|correlat)/.test(s)) return "cause";
  return "_fallback";
};

export const HYPOTHESES = [
  {
    id: "HYP-1",
    ref: "connector:7b2e9a14-checkout:restart",
    top: true,
    title: "Restart checkout-service",
    why: "Database pool exhausted",
    confidence: 91,
    risk: "Low",
    evidence: ["Connection pool 100%", "Error rate 68%", "Restart resolved similar incident 17 times"],
    runUrl: "https://ci.scrubbe.io/runs/4821",
    diffUrl: "https://github.com/scrubbe/checkout-api/pull/4821/files",
  },
  {
    id: "HYP-2",
    ref: "connector:7b2e9a14-checkout:pr",
    top: false,
    title: "Connection pool exhaustion from retry storm",
    why: "Retry budget exceeded after deploy #4821",
    confidence: 74,
    risk: "Medium",
    evidence: ["Retries up 4.2× post-deploy", "Pool wait time 3.1s p95"],
    runUrl: "https://ci.scrubbe.io/runs/4821",
    diffUrl: "https://github.com/scrubbe/checkout-api/pull/4821/files",
  },
  {
    id: "HYP-3",
    ref: "connector:7b2e9a14-checkout:verify",
    top: false,
    title: "Downstream DB failover lag",
    why: "Replica promotion added latency",
    confidence: 58,
    risk: "Medium",
    evidence: ["Failover completed 13:39", "Latency normalized after"],
    runUrl: "#",
    diffUrl: "#",
  },
];
