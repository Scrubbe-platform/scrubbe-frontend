/* Types, mock data, and pure helpers for the War Rooms library. Mirrors the
   asset-inventory module's `*.data.ts` convention — kept separate from the
   rendering components so those stay readable. */

export type Severity = "P0" | "P1" | "P2" | "P3";
export type WarRoomStatus = "resolved" | "monitoring";
export type FollowUpType = "action" | "modification" | "metric" | "date" | "decision";
export type FollowUpStatus = "needs" | "motion" | "done";
export type Bucket = "needs" | "motion" | "done";

export interface TimelineEntry {
  at: string;
  text: string;
}
export interface MeetingSummary {
  exec: string;
  impact: string[];
  rootCause: string;
  timeline: TimelineEntry[];
  decisions: string[];
  resolution: string;
}
export interface FollowUpTarget {
  k: string;
  n: string;
  arg: string;
}
export interface Approval {
  role: string;
  state: "pending" | "approved";
}
export interface FollowUp {
  id: string;
  type: FollowUpType;
  text: string;
  by: string;
  at: string;
  quote: string;
  src: string;
  did: string;
  target: FollowUpTarget;
  owner: string;
  status: FollowUpStatus;
  plan: string;
  aiRunnable?: boolean;
  approval?: Approval;
}
export interface WarRoom {
  wr: string;
  inc: string;
  title: string;
  sev: Severity;
  status: WarRoomStatus;
  date: string;
  dateSort: number;
  duration: string;
  durMin: number;
  ic: string;
  humans: number;
  agents: number;
  team: string[];
  teamAI: string[];
  problem: string;
  service: string;
  meeting: MeetingSummary;
  caps: FollowUp[];
}

export const CURRENT_USER = "Paschal Ifediora";

export const HUMANS: Record<string, { i: string; c: string; role: string }> = {
  "Paschal Ifediora": { i: "PI", c: "#2A6DB0", role: "Founder / CEO" },
  "Sarah Okafor": { i: "SO", c: "#1B4DFF", role: "Incident commander" },
  "David Morakinyo": { i: "DM", c: "#6B4DE6", role: "Platform engineer" },
  "Amara Eze": { i: "AE", c: "#0B7A5B", role: "Backend engineer" },
  "Tunde Bello": { i: "TB", c: "#C6383A", role: "Site reliability" },
  "Priya Nair": { i: "PN", c: "#B7791F", role: "Platform lead" },
};
export const AGENTS: Record<string, string> = {
  Ezra: "Incident orchestrator",
  "Infrastructure Agent": "Infra remediation",
  "Database Agent": "Data plane",
  "Deployment Agent": "Release automation",
  "Logs Agent": "Log analysis",
  "Playbook Agent": "Runbook authoring",
  IQA: "Incident quality assurance",
  "Security team": "Security",
};
export const isAgent = (n: string) => n in AGENTS;
export const initOf = (n: string): string => {
  if (isAgent(n)) return n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  if (HUMANS[n]) return HUMANS[n].i;
  return (n || "?").slice(0, 2).toUpperCase();
};
export const colorOf = (n: string) => HUMANS[n]?.c ?? "#5B6675";
export const roleOf = (n: string) => (isAgent(n) ? AGENTS[n] : HUMANS[n]?.role ?? "");
export const ownerType = (o: string): "ai" | "team" | "human" => (isAgent(o) ? "ai" : /team$/i.test(o) ? "team" : "human");

export const BUCKET_LABEL: Record<Bucket, string> = { needs: "Needs a person", motion: "In motion", done: "Done" };
export const bucketOf = (s: FollowUpStatus): Bucket => (s === "needs" ? "needs" : s === "done" ? "done" : "motion");
export const TYPE_LABEL: Record<FollowUpType, string> = { action: "Action", modification: "Change", metric: "Metric", date: "Date", decision: "Decision" };
export const sevRank = (s: Severity): number => Number(s.replace("P", ""));

export function tally(room: WarRoom) {
  const t = { total: room.caps.length, needs: 0, motion: 0, done: 0 };
  room.caps.forEach((c) => { t[bucketOf(c.status)]++; });
  return t;
}

/* Classifies a freehand follow-up composed by the signed-in user into a type,
   owner, and initial status — the same heuristic Ezra applies live in the
   room, ported from keyword buckets to keep the demo self-contained. */
export function classify(text: string): { type: FollowUpType; owner: string; target: FollowUpTarget; did: string; status: FollowUpStatus; plan: string } {
  const t = text.toLowerCase();
  if (/alert|threshold|monitor|dashboard|metric|saturat|latency|lag|%|rate/.test(t))
    return { type: "metric", owner: "Logs Agent", target: { k: "Monitor", n: "new monitor", arg: "the new monitor" }, did: "Created a monitor and added it to the service dashboard.", status: "motion", plan: "Live monitor — Ezra alerts the room if it fires." };
  if (/revert|roll ?back|lower|raise|ceiling|config|toggle|restore|default|scale/.test(t))
    return { type: "modification", owner: "Deployment Agent", target: { k: "Change record", n: "new change", arg: "the change record" }, did: "Logged it to the change record and linked this war room.", status: "motion", plan: "Ezra tracks the change and schedules a revert if it was temporary." };
  if (/review|by |deadline|next week|two weeks|friday|schedule|remind|checkpoint/.test(t))
    return { type: "date", owner: "Ezra", target: { k: "Schedule", n: "Scheduled", arg: "the scheduled item" }, did: "Scheduled it and set a reminder.", status: "motion", plan: "Ezra reminds the room ahead of time." };
  if (/decid|confirm|agree|root cause|won'?t|keep|policy|record/.test(t))
    return { type: "decision", owner: "Ezra", target: { k: "Operational memory", n: "Updated", arg: "operational memory" }, did: "Recorded the decision to operational memory.", status: "done", plan: "Kept for the record and available to the next incident." };
  if (/playbook|runbook|recovery|procedure/.test(t))
    return { type: "action", owner: "Playbook Agent", target: { k: "Playbook", n: "the playbook", arg: "the playbook" }, did: "Routed to the Playbook Agent, which can draft it automatically.", status: "motion", plan: "The Playbook Agent handles this on its own." };
  if (/security|auth|token|secret|rotate|permission/.test(t))
    return { type: "action", owner: "Security team", target: { k: "Repository", n: "auth-service", arg: "repository auth-service" }, did: "Routed to the Security team.", status: "needs", plan: "Needs the Security team to pick it up." };
  return { type: "action", owner: "David Morakinyo", target: { k: "Repository", n: "the repository", arg: "the repository" }, did: "Routed to David Morakinyo on the backlog.", status: "needs", plan: "Needs an owner to schedule it." };
}
export function nextFollowUpId(room: WarRoom): string {
  const max = room.caps.reduce((m, c) => { const n = parseInt(c.id.slice(3), 10); return n > m ? n : m; }, 100);
  return "FU-" + String(max + 1).padStart(6, "0");
}

export const INITIAL_ROOMS: WarRoom[] = [
  {
    wr: "WR-1043", inc: "SI-001043", title: "Payment API failure", sev: "P1", status: "resolved",
    date: "30 Jul 2026", dateSort: 20260730, duration: "27 min", durMin: 27, ic: "Sarah Okafor", humans: 14, agents: 7,
    team: ["Sarah Okafor", "David Morakinyo", "Amara Eze", "Tunde Bello"], teamAI: ["Ezra", "Infrastructure Agent", "Logs Agent"],
    problem: "PR-000221", service: "Payments API",
    meeting: {
      exec: "Payment authorization on payments-api began failing at 14:05 GMT as the Redis connection pool saturated under a retry storm. Requests queued and timed out, cascading into checkout. Ezra convened the war room; the Infrastructure Agent traced the failure to the pool hitting its 200-connection ceiling. The ceiling was raised to 500 in staging then production, and error rate recovered by 14:32 — 27 minutes end to end.",
      impact: [
        "3.1% of checkout attempts failed or were delayed at peak",
        "Payment authorization degraded for 27 minutes (14:05–14:32 GMT)",
        "Roughly 4,200 checkout sessions affected across web and mobile",
        "No data loss and no duplicate charges — failed authorizations were safely retried",
      ],
      rootCause: "The Redis connection pool on payments-api reached its 200-connection ceiling. New authorizations could not acquire a connection, and client retries amplified the load until timeouts cascaded into checkout. A short-lived traffic surge was the trigger; the fixed pool ceiling was the underlying weakness.",
      timeline: [
        { at: "14:05", text: "Authorization failures begin on payments-api; Ezra opens the war room." },
        { at: "14:07", text: "Infrastructure Agent confirms the Redis pool is saturated at 200/200 connections." },
        { at: "14:15", text: "Circuit breaker lowered and checkout rate limit relaxed to protect the path." },
        { at: "14:20", text: "Pool ceiling raised to 500 in staging and validated with no regressions." },
        { at: "14:28", text: "Change promoted to production after Platform-manager sign-off." },
        { at: "14:32", text: "Error rate returns to baseline; incident resolved." },
      ],
      decisions: [
        "Confirmed root cause: Redis connection-pool exhaustion under a retry storm.",
        "Raised the pool ceiling on payments-api from 200 to 500.",
        "Kept the 14:00 deploy — confirmed unrelated to the failure.",
        "Sarah to lead a payments capacity review within two weeks.",
      ],
      resolution: "Payment authorization fully recovered at 14:32 once the pool ceiling reached 500 in production. Temporary protections (the circuit-breaker and rate-limit changes) are scheduled to revert on 5 Aug. A capacity review is set for 12 Aug, and the postmortem is published and linked to problem record PR-000221.",
    },
    caps: [
      { id: "FU-000142", type: "action", text: "Increase the Redis connection pool on payments-api from 200 to 500", by: "Infrastructure Agent", at: "14:10", quote: "500 gives headroom without straining the node. Four prior incidents on this service used the same ceiling.", src: "Infrastructure Agent, 14:10", did: "Routed to the Infrastructure Agent and applied in staging. Production needs Platform-manager sign-off.", target: { k: "Change record", n: "CH-004821", arg: "change record CH-004821" }, owner: "Infrastructure Agent", aiRunnable: true, approval: { role: "Platform manager", state: "pending" }, status: "needs", plan: "Ezra applies it to production the moment it's approved, then triggers the load test in FU-000154." },
      { id: "FU-000147", type: "modification", text: "Circuit-breaker threshold lowered at 14:15 to shed load", by: "Deployment Agent", at: "14:15", quote: "Dropped the circuit-breaker threshold to protect checkout while we drain the queue.", src: "Deployment Agent, 14:15", did: "Flagged as temporary. Ezra scheduled a revert-to-default check.", target: { k: "Schedule", n: "Revert · 5 Aug", arg: "the scheduled revert on 5 Aug" }, owner: "Ezra", status: "needs", plan: "Needs a person to confirm the revert on 5 Aug so the breaker returns to default." },
      { id: "FU-000154", type: "date", text: "Re-run the payments load test after the pool change lands", by: "IQA", at: "14:37", quote: "We should re-run the load test once 500 is in production.", src: "IQA, 14:37", did: "Scheduled the load test — waiting on the production pool change.", target: { k: "Schedule", n: "Load test · pending", arg: "the scheduled load test" }, owner: "IQA", status: "needs", plan: "Depends on FU-000142 being approved and applied." },
      { id: "FU-000143", type: "action", text: "Add retry backoff with jitter to the payments client", by: "Ezra", at: "14:11", quote: "The retries turned a blip into an outage — let's fix the client too.", src: "Sarah Okafor, 14:11", did: "Routed to David Morakinyo on the payments-api backlog.", target: { k: "Repository", n: "payments-api", arg: "repository payments-api" }, owner: "David Morakinyo", status: "motion", plan: "Due with the next payments-api release. Ezra is watching the pull request." },
      { id: "FU-000145", type: "action", text: "Add a regression test that reproduces pool exhaustion under load", by: "IQA", at: "14:36", quote: "No test covers connection-pool exhaustion — that's why it surprised us.", src: "IQA, 14:36", did: "Routed to the testing queue, owned by IQA.", target: { k: "Repository", n: "payments-api", arg: "repository payments-api" }, owner: "IQA", aiRunnable: true, status: "motion", plan: "IQA is writing the load scenario; lands after the pool change." },
      { id: "FU-000149", type: "metric", text: "Redis pool saturated at 200/200 connections (100%) at 14:07", by: "Infrastructure Agent", at: "14:07", quote: "Redis pool is at 200 of 200 connections — new authorizations can't acquire a connection.", src: "Infrastructure Agent, 14:07", did: "Created a monitor on payments-api that alerts at 80% pool utilization.", target: { k: "Monitor", n: "redis.pool.utilization", arg: "monitor redis.pool.utilization" }, owner: "Logs Agent", status: "motion", plan: "Live monitor — it fires before saturation next time." },
      { id: "FU-000148", type: "modification", text: "Checkout rate limit relaxed at 14:18 to drain the queue", by: "Deployment Agent", at: "14:18", quote: "Eased the checkout rate limit temporarily to clear the backlog.", src: "Deployment Agent, 14:18", did: "Flagged temporary and bundled into the 5 Aug revert.", target: { k: "Schedule", n: "Revert · 5 Aug", arg: "the scheduled revert on 5 Aug" }, owner: "Ezra", status: "motion", plan: "Held until the revert window; surfaces with FU-000147." },
      { id: "FU-000152", type: "date", text: "Payments capacity review committed for two weeks out", by: "Ezra", at: "14:24", quote: "I'll own a capacity review across payments in two weeks.", src: "Sarah Okafor, 14:24", did: "Scheduled the review for 12 Aug and assigned it to Sarah.", target: { k: "Schedule", n: "Review · 12 Aug", arg: "the capacity review on 12 Aug" }, owner: "Sarah Okafor", status: "motion", plan: "Ezra reminds the room two days before, with this incident attached." },
      { id: "FU-000150", type: "metric", text: "Checkout error rate peaked at 3.1% of attempts", by: "Logs Agent", at: "14:22", quote: "Error rate peaked at 3.1% of checkout attempts, now falling.", src: "Logs Agent, 14:22", did: "Added to the Payments API service dashboard as an error-budget marker.", target: { k: "Service", n: "Payments API", arg: "service Payments API" }, owner: "Logs Agent", status: "motion", plan: "Tracked against the service error budget for the quarter." },
      { id: "FU-000144", type: "action", text: "Update the Redis recovery playbook with the pool-saturation signal", by: "Playbook Agent", at: "14:34", quote: "The room found the signal before the alert did — updating the playbook.", src: "Playbook Agent, 14:34", did: "The Playbook Agent drafted and merged the change automatically.", target: { k: "Playbook", n: "Redis recovery", arg: "playbook Redis recovery" }, owner: "Playbook Agent", status: "done", plan: "Live in the playbook and linked back to this war room." },
      { id: "FU-000146", type: "modification", text: "Pool ceiling raised to 500 in staging at 14:20", by: "Deployment Agent", at: "14:20", quote: "Pool ceiling set to 500 in staging — validated, no regressions.", src: "Deployment Agent, 14:20", did: "Logged to the payments-api change record and linked to this war room.", target: { k: "Change record", n: "CH-004821", arg: "change record CH-004821" }, owner: "Deployment Agent", status: "done", plan: "Recorded. Promoted to production with FU-000142." },
      { id: "FU-000151", type: "metric", text: "Time to resolution: 27 minutes (14:05–14:32)", by: "Ezra", at: "14:33", quote: "27 minutes end to end. Recording resolution metrics.", src: "Ezra, 14:33", did: "Recorded to the incident's resolution metrics.", target: { k: "Incident", n: "SI-001043", arg: "incident SI-001043" }, owner: "Ezra", status: "done", plan: "Feeds the service's mean-time-to-resolution trend." },
      { id: "FU-000153", type: "date", text: "Postmortem published by 1 Aug", by: "Ezra", at: "14:35", quote: "Postmortem out by Friday.", src: "Sarah Okafor, 14:35", did: "Drafted the postmortem from the timeline and published it on time.", target: { k: "Postmortem", n: "Linked", arg: "the postmortem" }, owner: "Ezra", status: "done", plan: "Published and linked to problem record PR-000221." },
      { id: "FU-000155", type: "decision", text: "Root cause confirmed: connection-pool exhaustion under a retry storm", by: "Ezra", at: "14:34", quote: "Root cause confirmed: pool exhaustion amplified by client retries.", src: "Ezra, 14:34", did: "Written to operational memory and opened problem record PR-000221.", target: { k: "Problem record", n: "PR-000221", arg: "problem record PR-000221" }, owner: "Ezra", status: "done", plan: "On the next matching signal, Ezra recommends the pool fix immediately." },
      { id: "FU-000156", type: "decision", text: "Not rolling back the 14:00 deploy — confirmed unrelated", by: "Ezra", at: "14:16", quote: "The 14:00 deploy is unrelated — it doesn't touch the pool.", src: "Amara Eze, 14:16", did: "Recorded the decision in the postmortem and closed the rollback thread.", target: { k: "Postmortem", n: "Linked", arg: "the postmortem" }, owner: "Ezra", status: "done", plan: "No further action — kept for the record." },
    ],
  },
  {
    wr: "WR-1038", inc: "SI-001038", title: "Checkout latency spike", sev: "P2", status: "resolved",
    date: "24 Jul 2026", dateSort: 20260724, duration: "41 min", durMin: 41, ic: "David Morakinyo", humans: 9, agents: 5,
    team: ["David Morakinyo", "Amara Eze", "Priya Nair"], teamAI: ["Ezra", "Deployment Agent", "Logs Agent"],
    problem: "PR-000209", service: "Checkout",
    meeting: {
      exec: "After a config push at 09:20, product-image requests began missing the CDN cache, driving p95 checkout latency to 2.4s — four times baseline. The Deployment Agent traced it to a cold cache left by the config push. The team warmed the cache manually and raised the cache TTL, and latency returned to baseline by 10:01.",
      impact: [
        "p95 checkout latency peaked at 2.4s (4× baseline)",
        "Slow checkout for ~38 minutes; no failed orders",
        "Highest impact on image-heavy product pages",
      ],
      rootCause: "The 09:20 config push invalidated the product-image cache. With a short TTL, assets aged out before traffic could repopulate the cache, so a cold cache drove origin fetches and latency until it was warmed and the TTL raised.",
      timeline: [
        { at: "09:22", text: "Latency alerts fire on the checkout path; David opens the war room." },
        { at: "09:36", text: "Logs Agent reports p95 at 2.4s, four times baseline." },
        { at: "09:40", text: "Cache warmed manually to stop the bleeding." },
        { at: "09:44", text: "Cache TTL raised in staging for product images." },
        { at: "10:01", text: "Latency back to baseline; incident resolved." },
      ],
      decisions: [
        "Root cause: cold cache after the 09:20 config push.",
        "Raise the product-image cache TTL.",
        "Design a warm-on-deploy step next sprint.",
      ],
      resolution: "Latency recovered by 10:01 after the cache was warmed and the TTL raised. A production TTL change is pending review, and a cache-strategy design review is scheduled for 11 Aug. The decision is recorded in problem record PR-000209.",
    },
    caps: [
      { id: "FU-000121", type: "action", text: "Raise the CDN cache TTL for product images", by: "Deployment Agent", at: "09:44", quote: "The TTL is too short for these assets — they age out before traffic reuses them.", src: "Deployment Agent, 09:44", did: "Applied the new TTL in staging; production pending a quick review.", target: { k: "Change record", n: "CH-004790", arg: "change record CH-004790" }, owner: "David Morakinyo", status: "needs", plan: "Needs a person to confirm the production TTL before Ezra promotes it." },
      { id: "FU-000122", type: "metric", text: "p95 checkout latency peaked at 2.4s", by: "Logs Agent", at: "09:36", quote: "p95 is at 2.4 seconds, four times baseline.", src: "Logs Agent, 09:36", did: "Created a latency monitor on the checkout path, alerting at 1.2s.", target: { k: "Monitor", n: "checkout.latency.p95", arg: "monitor checkout.latency.p95" }, owner: "Logs Agent", status: "motion", plan: "Live monitor — catches the next cache regression early." },
      { id: "FU-000123", type: "modification", text: "Cache warmed manually at 09:40", by: "Deployment Agent", at: "09:40", quote: "Warming the cache now to stop the bleeding.", src: "Deployment Agent, 09:40", did: "Logged the manual warm to the change record.", target: { k: "Change record", n: "CH-004790", arg: "change record CH-004790" }, owner: "Deployment Agent", status: "done", plan: "Recorded; superseded by the TTL fix." },
      { id: "FU-000124", type: "decision", text: "Root cause: cold cache after the 09:20 config push", by: "Ezra", at: "09:58", quote: "The config push invalidated the image cache — that's the trigger.", src: "Ezra, 09:58", did: "Written to operational memory and opened problem record PR-000209.", target: { k: "Problem record", n: "PR-000209", arg: "problem record PR-000209" }, owner: "Ezra", status: "done", plan: "Ezra will flag cache-invalidating config pushes in future." },
      { id: "FU-000125", type: "date", text: "Revisit the image cache strategy next sprint", by: "Ezra", at: "10:00", quote: "We should design a proper warm-on-deploy step next sprint.", src: "Priya Nair, 10:00", did: "Scheduled a design review for 11 Aug, owned by Priya.", target: { k: "Schedule", n: "Review · 11 Aug", arg: "the cache review on 11 Aug" }, owner: "Priya Nair", status: "motion", plan: "Ezra brings this incident as context." },
    ],
  },
  {
    wr: "WR-1051", inc: "SI-001051", title: "Auth token rotation failure", sev: "P1", status: "resolved",
    date: "2 Aug 2026", dateSort: 20260802, duration: "18 min", durMin: 18, ic: "Tunde Bello", humans: 7, agents: 4,
    team: ["Tunde Bello", "Priya Nair"], teamAI: ["Ezra", "Deployment Agent"],
    problem: "PR-000228", service: "Auth service",
    meeting: {
      exec: "A scheduled secret rotation at 11:04 failed halfway, leaving the token service with a mix of old and new keys. 12% of sessions failed authentication for four minutes. The team rolled back the rotation job and re-issued keys cleanly, and the service recovered by 11:22.",
      impact: [
        "12% of sessions failed authentication for four minutes",
        "Brief sign-in failures across web and API clients",
        "No credential exposure; keys re-issued cleanly",
      ],
      rootCause: "The rotation job began before every node could reach the new key store, so some nodes validated against the old key set and others the new one. The absence of a pre-rotation health check let the half-applied rotation proceed.",
      timeline: [
        { at: "11:06", text: "Auth failures spike; Tunde opens the war room." },
        { at: "11:10", text: "Logs Agent reports 12% of sessions failing auth." },
        { at: "11:12", text: "Rotation job rolled back to the last good key set." },
        { at: "11:18", text: "Keys re-issued cleanly across all nodes." },
        { at: "11:22", text: "Auth success restored; incident resolved." },
      ],
      decisions: [
        "Add a pre-rotation health check before any rotation starts.",
        "Move to staggered secret rotation, one node group at a time.",
      ],
      resolution: "Auth recovered by 11:22 after rollback and clean re-issue. A pre-rotation health check and a rotation-runbook review (due 8 Aug) are open with the Security team. The staggered-rotation decision is recorded in problem record PR-000228.",
    },
    caps: [
      { id: "FU-000161", type: "action", text: "Add a pre-rotation health check to the token service", by: "Ezra", at: "11:16", quote: "Rotation shouldn't start unless every node can reach the new key store.", src: "Tunde Bello, 11:16", did: "Routed to the Security team as a required change.", target: { k: "Repository", n: "auth-service", arg: "repository auth-service" }, owner: "Security team", status: "needs", plan: "Needs the Security team to design the check before the next rotation window." },
      { id: "FU-000162", type: "date", text: "Security review of the rotation runbook by 8 Aug", by: "Ezra", at: "11:20", quote: "Let's walk the whole rotation runbook this week.", src: "Tunde Bello, 11:20", did: "Scheduled the review for 8 Aug, owned by the Security team.", target: { k: "Schedule", n: "Review · 8 Aug", arg: "the rotation runbook review on 8 Aug" }, owner: "Security team", status: "needs", plan: "Ezra attaches this incident and PR-000228." },
      { id: "FU-000163", type: "metric", text: "12% of sessions failed auth for four minutes", by: "Logs Agent", at: "11:10", quote: "Auth failures spiked to 12% of sessions.", src: "Logs Agent, 11:10", did: "Added to the auth-service dashboard as an availability marker.", target: { k: "Service", n: "Auth service", arg: "service Auth service" }, owner: "Logs Agent", status: "motion", plan: "Tracked against the auth availability SLO." },
      { id: "FU-000164", type: "modification", text: "Rotation job rolled back at 11:12", by: "Deployment Agent", at: "11:12", quote: "Rolling the rotation job back to the last good key set.", src: "Deployment Agent, 11:12", did: "Logged to the change record and linked to this war room.", target: { k: "Change record", n: "CH-004838", arg: "change record CH-004838" }, owner: "Deployment Agent", status: "done", plan: "Recorded. Keys re-issued cleanly afterward." },
      { id: "FU-000165", type: "decision", text: "Move to staggered secret rotation", by: "Ezra", at: "11:21", quote: "Rotate one node group at a time, not all at once.", src: "Priya Nair, 11:21", did: "Written to operational memory as the new rotation policy.", target: { k: "Operational memory", n: "Updated", arg: "operational memory" }, owner: "Ezra", status: "done", plan: "Ezra recommends staggered rotation on the next rotation." },
    ],
  },
  {
    wr: "WR-1047", inc: "SI-001047", title: "Orders queue backlog", sev: "P2", status: "resolved",
    date: "29 Jul 2026", dateSort: 20260729, duration: "1 h 12 min", durMin: 72, ic: "Amara Eze", humans: 11, agents: 6,
    team: ["Amara Eze", "David Morakinyo", "Sarah Okafor"], teamAI: ["Ezra", "Infrastructure Agent", "Logs Agent"],
    problem: "PR-000216", service: "Orders",
    meeting: {
      exec: "The orders-worker consumers fell behind at 15:02 after a traffic surge, and the queue grew to 48k messages. The team scaled the worker pool from 4 to 10 pods and raised consumer concurrency; the backlog cleared by 16:14 with no lost orders.",
      impact: [
        "Queue backlog peaked at 48k messages",
        "Order processing delayed up to 40 minutes for ~1 h",
        "No orders lost; all messages processed",
      ],
      rootCause: "A traffic surge outpaced the fixed consumer concurrency on orders-worker. With no autoscaling headroom and no dead-letter visibility, the backlog grew before the team could react.",
      timeline: [
        { at: "15:02", text: "Consumers fall behind; Amara opens the war room." },
        { at: "15:20", text: "Logs Agent reports queue depth at 48k and climbing." },
        { at: "15:20", text: "orders-worker scaled from 4 to 10 pods." },
        { at: "15:28", text: "Consumer concurrency raised in staging." },
        { at: "16:14", text: "Backlog cleared; incident resolved." },
      ],
      decisions: [
        "Increase consumer concurrency on orders-worker.",
        "Add dead-letter queue alerting.",
        "Keep the extra pods until the load test passes.",
      ],
      resolution: "The backlog cleared by 16:14. A concurrency change is validated in staging and a load test (6 Aug) gates the production rollout; DLQ alerting is live. The hold on scale-down is recorded in problem record PR-000216.",
    },
    caps: [
      { id: "FU-000131", type: "date", text: "Load-test the consumer after the concurrency change", by: "IQA", at: "16:08", quote: "We need to prove the new concurrency holds under a surge.", src: "IQA, 16:08", did: "Scheduled a load test — waiting on the concurrency change to settle.", target: { k: "Schedule", n: "Load test · 6 Aug", arg: "the orders load test on 6 Aug" }, owner: "IQA", status: "needs", plan: "Needs a person to confirm the test window." },
      { id: "FU-000132", type: "action", text: "Increase consumer concurrency on orders-worker", by: "Infrastructure Agent", at: "15:28", quote: "Concurrency is the bottleneck — raise it and the backlog drains.", src: "Infrastructure Agent, 15:28", did: "Applied in staging by the Infrastructure Agent.", target: { k: "Change record", n: "CH-004815", arg: "change record CH-004815" }, owner: "Infrastructure Agent", aiRunnable: true, status: "motion", plan: "Promotes to production after the load test passes." },
      { id: "FU-000133", type: "metric", text: "Backlog peaked at 48k messages", by: "Logs Agent", at: "15:20", quote: "Queue depth is at 48 thousand and climbing.", src: "Logs Agent, 15:20", did: "Created a queue-depth monitor alerting at 10k.", target: { k: "Monitor", n: "orders.queue.depth", arg: "monitor orders.queue.depth" }, owner: "Logs Agent", status: "motion", plan: "Live monitor — warns long before a backlog builds." },
      { id: "FU-000134", type: "modification", text: "Scaled orders-worker from 4 to 10 pods at 15:20", by: "Deployment Agent", at: "15:20", quote: "Scaling the worker pool to 10 to catch up.", src: "Deployment Agent, 15:20", did: "Logged to the change record and linked to this war room.", target: { k: "Change record", n: "CH-004815", arg: "change record CH-004815" }, owner: "Deployment Agent", status: "done", plan: "Recorded. Kept until the load test passes." },
      { id: "FU-000135", type: "action", text: "Add dead-letter queue alerting", by: "Logs Agent", at: "15:52", quote: "We were blind to messages falling into the DLQ.", src: "Amara Eze, 15:52", did: "The Logs Agent added DLQ alerting automatically.", target: { k: "Monitor", n: "orders.dlq", arg: "monitor orders.dlq" }, owner: "Logs Agent", status: "done", plan: "Live — any DLQ growth now pages the on-call." },
      { id: "FU-000136", type: "decision", text: "Keep the extra worker pods until the load test passes", by: "Ezra", at: "16:12", quote: "Don't scale back down until we've proven the fix.", src: "Amara Eze, 16:12", did: "Written to operational memory with a hold on autoscaling.", target: { k: "Operational memory", n: "Updated", arg: "operational memory" }, owner: "Ezra", status: "done", plan: "Ezra holds the scale-down until FU-000131 passes." },
    ],
  },
  {
    wr: "WR-1055", inc: "SI-001055", title: "Search indexing stalled", sev: "P2", status: "monitoring",
    date: "4 Aug 2026", dateSort: 20260804, duration: "ongoing", durMin: 9999, ic: "Priya Nair", humans: 6, agents: 4,
    team: ["Priya Nair", "David Morakinyo"], teamAI: ["Ezra", "Deployment Agent"],
    problem: "PR-000231", service: "Search",
    meeting: {
      exec: "The search indexing pipeline stalled at 08:10 and index lag grew to 3.2M documents. The team restarted the pipeline with backpressure and is watching the re-index catch up. The war room is still open while the backlog drains.",
      impact: [
        "Index lag reached 3.2M documents",
        "Search results up to two hours stale during the stall",
        "No data loss; re-index in progress",
      ],
      rootCause: "The indexing pipeline stalled without surfacing an alert — it was detected from user reports. Restarting without backpressure risked re-stalling on the accumulated backlog.",
      timeline: [
        { at: "08:10", text: "Indexing pipeline stalls (detected from user reports)." },
        { at: "08:18", text: "Logs Agent reports index lag at 3.2M documents." },
        { at: "08:24", text: "Pipeline restarted with backpressure; re-index running." },
        { at: "08:40", text: "Checkpoint set for 6 Aug to confirm the re-index completes." },
      ],
      decisions: [
        "Restart the pipeline with backpressure.",
        "Add a stall detector to the indexer.",
      ],
      resolution: "The re-index is in progress and the war room stays open until index lag is under 500k. A stall detector is open with IQA, and a checkpoint on 6 Aug will confirm completion. Tracked in problem record PR-000231.",
    },
    caps: [
      { id: "FU-000171", type: "action", text: "Add a stall detector to the indexer", by: "IQA", at: "08:52", quote: "Nothing told us the pipeline had stopped — we found it from user reports.", src: "Priya Nair, 08:52", did: "Routed to IQA to design the detector.", target: { k: "Repository", n: "search-indexer", arg: "repository search-indexer" }, owner: "IQA", status: "needs", plan: "Needs a person to define the stall threshold." },
      { id: "FU-000172", type: "action", text: "Restart the indexing pipeline with backpressure", by: "Deployment Agent", at: "08:24", quote: "Restarting with backpressure so it doesn't stall again on the backlog.", src: "Deployment Agent, 08:24", did: "Applied by the Deployment Agent; the re-index is running.", target: { k: "Change record", n: "CH-004851", arg: "change record CH-004851" }, owner: "Deployment Agent", status: "motion", plan: "Ezra is watching throughput until the lag clears." },
      { id: "FU-000173", type: "metric", text: "Index lag reached 3.2M documents", by: "Logs Agent", at: "08:18", quote: "Index lag is at 3.2 million documents.", src: "Logs Agent, 08:18", did: "Created a lag monitor alerting at 500k documents.", target: { k: "Monitor", n: "search.index.lag", arg: "monitor search.index.lag" }, owner: "Logs Agent", status: "motion", plan: "Live monitor — the war room stays open until lag is under 500k." },
      { id: "FU-000174", type: "date", text: "Confirm full re-index complete by 6 Aug", by: "Ezra", at: "08:40", quote: "We should be fully caught up within two days.", src: "Priya Nair, 08:40", did: "Scheduled a checkpoint for 6 Aug to confirm the re-index finished.", target: { k: "Schedule", n: "Checkpoint · 6 Aug", arg: "the re-index checkpoint on 6 Aug" }, owner: "Ezra", status: "motion", plan: "Ezra closes the war room once the checkpoint passes." },
    ],
  },
];
