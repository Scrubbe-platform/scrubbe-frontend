// app/incidents/iqa/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Clock,
  HelpCircle,
  Check,
  X,
  Plus,
  Trash2,
  Send,
  Info,
  Eye,
  ArrowRight,
  ShieldAlert,
  CornerDownRight,
  RefreshCw,
  BookOpen,
  Bolt,
} from "lucide-react";
import Button from "@/components/ui/Button1";
import { FaBoltLightning } from "react-icons/fa6";
import { TbBolt, TbMessageDots } from "react-icons/tb";
import { HiMiniSparkles } from "react-icons/hi2";

// ─── STATIC CONSTANTS & DICTIONARIES DIRECT FROM THE BLUEPRINT ───
const SERVICES = [
  "Payments",
  "Checkout",
  "Billing",
  "Authentication",
  "API Gateway",
  "Search",
  "Notifications",
  "User Profile",
  "Orders",
  "Inventory",
  "Data Pipeline",
  "CDN",
];
const ENVS = ["Production", "Staging", "Development", "Testing"];
const SOURCES = [
  "Manual",
  "Monitoring",
  "Webhook",
  "CI/CD",
  "Infrastructure",
  "Observability",
  "Cloud Platform",
];
const ENTRY_TYPES = [
  "Incident Update",
  "Investigation Finding",
  "Customer Impact",
  "Timeline Event",
  "Root Cause Evidence",
  "Mitigation Action",
  "Decision Log",
  "Handover Note",
  "Executive Update",
  "Resolution Summary",
];
const ATTACH_TYPES = [
  "Logs",
  "Screenshot",
  "Deployment ID",
  "Link",
  "Monitoring snapshot",
  "Config file",
  "Runbook",
  "Metrics",
];
const TAG_SUGGEST = [
  "payments",
  "database",
  "deployment",
  "latency",
  "network",
  "authentication",
  "timeout",
  "config",
  "capacity",
  "security",
];

const PRIOS = [
  {
    k: "P0",
    label: "Critical",
    blurb: "Severe customer-facing outage",
    color: "#e5484d",
  },
  {
    k: "P1",
    label: "High",
    blurb: "Major degradation, urgent",
    color: "#d9730d",
  },
  {
    k: "P2",
    label: "Moderate",
    blurb: "Partial or limited impact",
    color: "#3b82f6",
  },
  {
    k: "P3",
    label: "Low",
    blurb: "Minor, no customer impact",
    color: "#7c818c",
  },
];

const PLAYBOOKS: Record<string, string> = {
  Database: "Database Capacity Recovery",
  "Code Regression": "Release Rollback & Verify",
  Infrastructure: "Node Drain & Reschedule",
  Configuration: "Config Revert Procedure",
  Network: "Upstream Failover",
  "Third Party": "Vendor Degradation Response",
  Capacity: "Emergency Scale-Out",
  Security: "Access Anomaly Response",
  Unknown: "General Triage",
};

const HIST = [
  {
    id: "SI-1041288",
    title: "Checkout API returning HTTP 503 after deploy",
    service: "Checkout",
    cat: "Code Regression",
    prio: "P0",
    tags: ["checkout", "deployment", "payments"],
  },
  {
    id: "SI-1039542",
    title: "Payment authorization latency spike",
    service: "Payments",
    cat: "Third Party",
    prio: "P1",
    tags: ["payments", "latency", "timeout"],
  },
  {
    id: "SI-1038001",
    title: "Auth service token validation failures",
    service: "Authentication",
    cat: "Configuration",
    prio: "P1",
    tags: ["authentication", "config"],
  },
  {
    id: "SI-1037410",
    title: "Database connection pool exhausted",
    service: "Orders",
    cat: "Database",
    prio: "P0",
    tags: ["database", "capacity"],
  },
  {
    id: "SI-1036220",
    title: "API gateway 5xx after config push",
    service: "API Gateway",
    cat: "Configuration",
    prio: "P1",
    tags: ["config", "network"],
  },
  {
    id: "SI-1035114",
    title: "Search indexing pipeline stalled",
    service: "Search",
    cat: "Capacity",
    prio: "P2",
    tags: ["capacity", "latency"],
  },
  {
    id: "SI-1034588",
    title: "Notification webhook delivery delays",
    service: "Notifications",
    cat: "Network",
    prio: "P2",
    tags: ["network", "timeout"],
  },
  {
    id: "SI-1033190",
    title: "Billing reconciliation job failure",
    service: "Billing",
    cat: "Code Regression",
    prio: "P1",
    tags: ["deployment", "payments"],
  },
  {
    id: "SI-1032004",
    title: "CDN cache poisoning on release",
    service: "CDN",
    cat: "Configuration",
    prio: "P1",
    tags: ["config", "deployment"],
  },
  {
    id: "SI-1030771",
    title: "Suspicious access pattern on profiles",
    service: "User Profile",
    cat: "Security",
    prio: "P1",
    tags: ["security", "authentication"],
  },
];

const GUIDE: Record<
  string,
  {
    name: string;
    purpose: string;
    tip?: string;
    good?: string[];
    avoid?: string[];
  }
> = {
  title: {
    name: "Incident title",
    purpose:
      "A concise summary of the problem so anyone can grasp it at a glance.",
    good: [
      "Checkout API returning HTTP 503",
      "Payment processing failures after deployment",
      "Authentication service unavailable",
    ],
    avoid: ["Server broken", "Help", "Urgent issue"],
  },
  priority: {
    name: "Priority",
    purpose:
      "Priority governs the incident: SLA timers, SLO monitoring, operational rules, escalations, War Room eligibility, and executive notifications.",
    tip: "Choose by business impact, not technical complexity.",
  },
  service: {
    name: "Affected service",
    purpose:
      "The primary affected service lets Scrubbe correlate telemetry, build the signal graph, load SLA/SLO policy, apply service playbooks, and detect related incidents and downstream dependencies.",
  },
  env: {
    name: "Environment",
    purpose:
      "Where the incident is occurring. Environment determines which autonomous actions Scrubbe is permitted to execute.",
    tip: "Production unlocks the full response; lower environments restrict automated actions.",
  },
  source: {
    name: "Incident source",
    purpose:
      "How the incident originated — manual, monitoring, webhook, CI/CD, infrastructure, observability, or cloud platform. This shapes enrichment and correlation.",
  },
  desc: {
    name: "Detailed description",
    purpose:
      "Describe what you know: what happened, when it began, visible symptoms, what changed recently, what you have checked, and which systems appear affected.",
    tip: "Don't worry if it's incomplete — Scrubbe enriches automatically. Separate evidence from assumptions.",
  },
  entry: {
    name: "Entry type",
    purpose:
      "Structures your information for better investigation, post-incident reporting, and knowledge generation.",
    tip: "Match the entry to what you are recording — a finding, a customer-impact note, a decision, a mitigation.",
  },
  attach: {
    name: "Evidence & attachments",
    purpose:
      "Logs, screenshots, deployment IDs, links, monitoring snapshots, config files, runbooks and metrics become evidence for the Causal Reconstruction Engine.",
  },
  tags: {
    name: "Tags",
    purpose:
      "Meaningful tags improve searching, similarity detection, and future incident recommendations.",
    good: ["payments", "database", "deployment", "latency", "authentication"],
  },
};

const POST_SUBMIT = [
  "Signal correlation",
  "Causal reconstruction",
  "Dependency analysis",
  "Deployment analysis",
  "Infrastructure investigation",
  "Operational Rule evaluation",
  "SLA timer activation",
  "SLO monitoring",
  "Related incident detection",
  "Playbook recommendation",
  "War Room evaluation",
  "Incident Delivery preparation",
];
const VAGUE = [
  "help",
  "urgent",
  "broken",
  "issue",
  "problem",
  "error",
  "down",
  "asap",
  "please",
];
const CRITICAL_SERVICES = [
  "Payments",
  "Checkout",
  "Billing",
  "Authentication",
  "API Gateway",
  "Orders",
];

const SLA: Record<
  string,
  { resp: string; res: string; war: boolean; color: string }
> = {
  P0: { resp: "5 minutes", res: "2 hours", war: true, color: "#e5484d" },
  P1: { resp: "15 minutes", res: "4 hours", war: false, color: "#d9730d" },
  P2: { resp: "1 hour", res: "24 hours", war: false, color: "#3b82f6" },
  P3: { resp: "4 hours", res: "3 business days", war: false, color: "#7c818c" },
};

const PLAYBOOK_STEPS_REGISTRY: Record<string, Array<[string, string]>> = {
  "Config Revert Procedure": [
    [
      "Freeze config changes",
      "Lock the config service and announce the freeze.",
    ],
    [
      "Locate offending revision",
      "Diff active config against last known-good.",
    ],
    ["Revert to known-good", "Roll back to the previous validated revision."],
    ["Invalidate caches", "Purge config caches across affected services."],
    ["Verify recovery", "Confirm error-rate and latency return to baseline."],
  ],
  "Release Rollback & Verify": [
    [
      "Identify the bad release",
      "Correlate error onset with the deploy timeline.",
    ],
    ["Halt the rollout", "Pause the pipeline and freeze deploys."],
    ["Roll back", "Redeploy the last known-good artifact."],
    ["Drain bad instances", "Recycle pods on the regressed version."],
    ["Verify recovery", "Confirm signals recover post-rollback."],
  ],
  "Database Capacity Recovery": [
    ["Assess saturation", "Check pool, slow-query log and IOPS headroom."],
    ["Shed load", "Throttle non-critical writes; route reads to replicas."],
    ["Reclaim capacity", "Kill long queries; add connections/storage."],
    ["Scale primary", "Promote a larger instance if needed."],
    ["Verify recovery", "Watch latency return to baseline."],
  ],
  "Upstream Failover": [
    ["Confirm upstream fault", "Verify the dependency is degraded."],
    ["Fail over", "Shift traffic to a healthy region/provider."],
    ["Enable fallbacks", "Turn on cached/degraded responses."],
    ["Verify recovery", "Confirm error-rate drops."],
    ["Fail back", "Restore primary routing once stable."],
  ],
};

export default function CompleteIncidentQualityAssurancePage() {
  // ─── STATE MANAGEMENT HOOKS ───
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<string | null>(null);
  const [service, setService] = useState("");
  const [env, setEnv] = useState("");
  const [source, setSource] = useState("");
  const [desc, setDesc] = useState("");
  const [entry, setEntry] = useState(ENTRY_TYPES[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [attach, setAttach] = useState<string[]>([]);

  const [focusField, setFocusField] = useState("title");
  const [autoRaised, setAutoRaised] = useState(false);
  const [warRoom, setWarRoom] = useState(false);
  const [linkedParent, setLinkedParent] = useState<string | null>(null);
  const [verified, setVerified] = useState<Record<string, boolean>>({});

  const [tagInput, setTagInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<
    Array<{ who: "ezra" | "you"; html: string }>
  >([
    {
      who: "ezra",
      html: "I'm Ezra, running Incident Quality Assurance. As you complete the incident I validate completeness, priority against operational policy, SLA, operational rules, duplicates and investigation gaps. Ask me anything.",
    },
  ]);
  const [toasts, setToasts] = useState<
    Array<{ id: number; title: string; sub?: string }>
  >([]);

  // Post-Submit Process Tracking States
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [activeEngineStep, setActiveEngineStep] = useState(0);

  // Playbook Simulation Overlay States
  const [playbookName, setPlaybookName] = useState<string | null>(null);
  const [playbookStep, setPlaybookStep] = useState(0);
  const [isPlaybookRunning, setIsPlaybookRunning] = useState(false);

  const ezraLogRef = useRef<HTMLDivElement>(null);

  // ─── DEFINED EXPLICIT HELPERS ───
  const addToast = (toastTitle: string, sub?: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title: toastTitle, sub }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  // Fixed the missing function definition
  const explainField = (fieldKey: string) => {
    setFocusField(fieldKey);
    const labelName = GUIDE[fieldKey]?.name || fieldKey;
    addToast(`Viewing Field Guide`, labelName);
  };

  // ─── REAL-TIME LOGIC TEXT HEURISTICS ENGINE ───
  const textContext = useMemo(
    () => `${title} ${desc}`.toLowerCase(),
    [title, desc],
  );
  const hasToken = (keywords: string[]) =>
    keywords.some((w) => textContext.includes(w));

  const categoryDetected = useMemo(() => {
    if (
      hasToken([
        "deploy",
        "release",
        "rollback",
        "regression",
        "version",
        "build",
        "merge",
        "shipped",
      ])
    )
      return "Code Regression";
    if (
      hasToken([
        "config",
        "configuration",
        "flag",
        "setting",
        "env var",
        "toggle",
      ])
    )
      return "Configuration";
    if (
      hasToken([
        "database",
        "query",
        "connection pool",
        "replica",
        "sql",
        "deadlock",
        "index",
      ])
    )
      return "Database";
    if (
      hasToken([
        "dns",
        "network",
        "upstream",
        "timeout",
        "packet",
        "routing",
        "gateway 5",
      ])
    )
      return "Network";
    if (
      hasToken([
        "cpu",
        "memory",
        "scale",
        "capacity",
        "throttle",
        "saturat",
        "queue",
        "oom",
      ])
    )
      return "Capacity";
    if (
      hasToken([
        "auth",
        "login",
        "token",
        "credential",
        "breach",
        "access",
        "unauthorized",
        "suspicious",
      ])
    )
      return "Security";
    if (
      hasToken([
        "vendor",
        "third party",
        "third-party",
        "provider",
        "stripe",
        "twilio",
        "upstream provider",
        "external api",
      ])
    )
      return "Third Party";
    if (
      hasToken([
        "node",
        "pod",
        "host",
        "cluster",
        "kubernetes",
        "instance",
        "disk",
      ])
    )
      return "Infrastructure";
    return "Unknown";
  }, [textContext]);

  const customerImpactDetected = useMemo(() => {
    return hasToken([
      "users",
      "customers",
      "customer",
      "revenue",
      "impact",
      "affected",
      "unable",
      "cannot",
      "can't",
      "failing",
      "fails",
      "503",
      "500",
      "outage",
      "unavailable",
      "degrad",
      "error rate",
    ]);
  }, [textContext]);

  const productionAffected = useMemo(
    () => env === "Production" || /\bprod(uction)?\b/.test(textContext),
    [env, textContext],
  );

  const criticalDependency = useMemo(() => {
    return (
      CRITICAL_SERVICES.includes(service) ||
      hasToken([
        "dependency",
        "upstream",
        "downstream",
        "database",
        "payment",
        "gateway",
        "auth",
      ])
    );
  }, [service, textContext]);

  const deploymentDetected = useMemo(() => {
    return (
      hasToken([
        "deploy",
        "release",
        "rollout",
        "shipped",
        "rolled out",
        "merged",
        "v4.",
        "v5.",
      ]) ||
      attach.some((a) => /deploy/i.test(a)) ||
      categoryDetected === "Code Regression"
    );
  }, [textContext, attach, categoryDetected]);

  // Priority Assessment against Corporate Operational Policy
  const policyRules = useMemo(() => {
    const reasons = [
      {
        ok: customerImpactDetected,
        pos: "Customer impact detected",
        neg: "No customer impact detected",
      },
      {
        ok: productionAffected,
        pos: "Production service affected",
        neg: "No production service affected",
      },
      {
        ok: criticalDependency,
        pos: "Critical dependency affected",
        neg: "No critical dependency affected",
      },
      {
        ok: hasToken([
          "all users",
          "everyone",
          "all customers",
          "global",
          "widespread",
          "entire",
          "every user",
        ]),
        pos: "Widespread / all-user scope",
        neg: "Impact is not widespread",
      },
      {
        ok: hasToken([
          "data loss",
          "breach",
          "leak",
          "unauthorized",
          "security",
          "exfil",
          "corrupt",
        ]),
        pos: "Data-loss or security exposure",
        neg: "No data-loss or security exposure",
      },
    ];
    const score = reasons.filter((r) => r.ok).length;
    let level = score >= 4 ? "P0" : score >= 2 ? "P1" : "P2";
    if (score === 0 && (env === "Development" || env === "Testing"))
      level = "P3";
    return { level, reasons, score };
  }, [
    customerImpactDetected,
    productionAffected,
    criticalDependency,
    env,
    textContext,
  ]);

  // 6-Question Primer Calculation Mapping
  const questionPrimerStates = useMemo(() => {
    return {
      what:
        title.trim().length > 8 && !VAGUE.includes(title.trim().toLowerCase()),
      when: /\b(began|started|since|at \d|ago|this morning|yesterday|today|\d{1,2}:\d{2}|after the|following)\b/.test(
        textContext,
      ),
      service: !!service,
      changed: hasToken([
        "deploy",
        "release",
        "config",
        "change",
        "update",
        "rollout",
        "migrat",
        "pushed",
        "merged",
      ]),
      evidence:
        attach.length > 0 ||
        hasToken([
          "log",
          "metric",
          "error",
          "trace",
          "dashboard",
          "graph",
          "screenshot",
        ]),
      impact: (!!priority && priority !== "P3") || customerImpactDetected,
    };
  }, [title, service, attach, priority, customerImpactDetected, textContext]);

  // Similar Incidents Scanning Engine
  const similarHistory = useMemo(() => {
    return HIST.map((h) => {
      let matchScore = 0;
      if (h.service === service) matchScore += 42;
      if (h.cat === categoryDetected && categoryDetected !== "Unknown")
        matchScore += 30;
      const sharedTagsCount = h.tags.filter((tg) => tags.includes(tg)).length;
      matchScore += sharedTagsCount * 10;
      h.tags.forEach((tg) => {
        if (textContext.includes(tg)) matchScore += 4;
      });
      if (
        title &&
        h.title
          .toLowerCase()
          .split(" ")
          .some((w) => w.length > 4 && textContext.includes(w))
      )
        matchScore += 6;
      return { ...h, m: Math.min(98, matchScore) };
    })
      .filter((h) => h.m > 20)
      .sort((a, b) => b.m - a.m)
      .slice(0, 3);
  }, [service, categoryDetected, tags, textContext, title]);

  // Validation Checklist Matrix (11 rules)
  const checklistRules = useMemo(() => {
    const wordsCount = desc.trim() ? desc.trim().split(/\s+/).length : 0;
    const pbAvailable =
      categoryDetected !== "Unknown" && !!PLAYBOOKS[categoryDetected];
    return [
      { k: "Service selected", ok: !!service, note: "" },
      { k: "Environment selected", ok: !!env, note: "" },
      {
        k: "Priority consistent",
        ok: !!priority && priority === policyRules.level,
        warn: !!priority && priority !== policyRules.level,
        note: priority
          ? priority === policyRules.level
            ? "matches policy"
            : "policy: " + policyRules.level
          : "",
      },
      { k: "Business impact described", ok: customerImpactDetected, note: "" },
      {
        k: "Root symptoms described",
        ok: questionPrimerStates.what && wordsCount >= 12,
        note: "",
      },
      { k: "Timeline provided", ok: questionPrimerStates.when, note: "" },
      {
        k: "Similar incident found",
        ok: similarHistory.length > 0,
        note: similarHistory.length ? similarHistory.length + " found" : "",
      },
      { k: "Deployment detected", ok: deploymentDetected, note: "" },
      {
        k: "Alert matches incident",
        ok:
          (source === "Monitoring" ||
            source === "Observability" ||
            autoRaised) &&
          (customerImpactDetected || deploymentDetected),
        note: "",
      },
      {
        k: "SLA selected",
        ok: !!priority,
        note: priority ? SLA[priority].resp + " / " + SLA[priority].res : "",
      },
      {
        k: "Required playbook available",
        ok: pbAvailable,
        note: categoryDetected !== "Unknown" ? PLAYBOOKS[categoryDetected] : "",
      },
    ];
  }, [
    service,
    env,
    priority,
    policyRules,
    customerImpactDetected,
    questionPrimerStates,
    similarHistory,
    deploymentDetected,
    source,
    autoRaised,
    categoryDetected,
    desc,
  ]);

  // Missing Fields List
  const missingMandatoryFields = useMemo(() => {
    const fields = [];
    if (!title.trim()) fields.push("Title");
    if (!service) fields.push("Service");
    if (!env) fields.push("Environment");
    if (!priority) fields.push("Priority");
    if (!customerImpactDetected) fields.push("Customer impact");
    return fields;
  }, [title, service, env, priority, customerImpactDetected]);

  // Investigation Questions Suite
  const investigationSuite = useMemo(() => {
    return [
      {
        q: "Was there a recent deployment in the impact window?",
        ok: deploymentDetected,
      },
      {
        q: "Is customer impact quantified (users or % affected)?",
        ok: /\d+\s?%|\b\d+\s+(users|customers|requests)\b/.test(textContext),
      },
      {
        q: "Are downstream dependencies affected?",
        ok: hasToken(["downstream", "dependency", "upstream", "depends"]),
      },
      {
        q: "Has a rollback candidate been identified?",
        ok: hasToken([
          "rollback",
          "revert",
          "roll back",
          "previous version",
          "last known good",
        ]),
      },
      {
        q: "Are logs, metrics or traces attached?",
        ok:
          attach.length > 0 ||
          hasToken(["log", "metric", "trace", "dashboard", "graph"]),
      },
      {
        q: "Has an initial mitigation been attempted?",
        ok: hasToken([
          "mitigat",
          "restart",
          "failover",
          "scaled",
          "throttl",
          "disabled",
          "workaround",
        ]),
      },
    ];
  }, [deploymentDetected, textContext, attach]);

  // Triggered Regulations list
  const operationalRegulations = useMemo(() => {
    const out = [];
    if (priority === "P0")
      out.push({
        rule: "P0 incidents must create a War Room",
        met: warRoom,
        action: "war-room",
        actionLabel: "Create War Room",
      });
    if (priority === "P0" || priority === "P1")
      out.push({
        rule: `${priority}: page on-call & post an executive update`,
        met: true,
      });
    if (productionAffected && (priority === "P0" || priority === "P1"))
      out.push({
        rule: `Production ${priority}: notify the service owner`,
        met: true,
      });
    if (categoryDetected === "Security")
      out.push({
        rule: "Security incidents follow Access Anomaly Response",
        met: true,
      });
    if (CRITICAL_SERVICES.includes(service))
      out.push({
        rule: `${service} is business-critical — notify stakeholders`,
        met: true,
      });
    if (!out.length)
      out.push({
        rule: `No mandatory operational rule triggered${priority ? " at " + priority : ""}`,
        met: true,
        none: true,
      });
    return out;
  }, [priority, warRoom, productionAffected, categoryDetected, service]);

  // Final Scoring Engine
  const iqaVerdict = useMemo(() => {
    const score = Math.round(
      (checklistRules.filter((c) => c.ok).length / checklistRules.length) * 100,
    );
    if (!title.trim() && !priority && !service) {
      return {
        state: "idle",
        tone: "#7c818c",
        label: "Awaiting incident",
        msg: "Fill the incident on the left — IQA validates it live against your operational policy.",
        score: 0,
      };
    }
    if (missingMandatoryFields.length > 0) {
      return {
        state: "blocked",
        tone: "#d9730d",
        label: `Incomplete — ${missingMandatoryFields.length} fields missing`,
        msg: `IQA blocks raise until present: ${missingMandatoryFields.join(", ")}.`,
        score,
      };
    }
    if (priority !== policyRules.level || (priority === "P0" && !warRoom)) {
      return {
        state: "attention",
        tone: "#d9730d",
        label: "Needs attention",
        msg: `${priority !== policyRules.level ? `Priority mismatch — policy reads ${policyRules.level}. ` : ""}${priority === "P0" && !warRoom ? "P0 mandates a War Room." : ""}`,
        score,
      };
    }
    return {
      state: "pass",
      tone: "#1f9d5b",
      label: "Passes IQA",
      msg: "Complete, priority matches policy, operational rules satisfied — ready for response.",
      score,
    };
  }, [
    checklistRules,
    title,
    priority,
    service,
    missingMandatoryFields,
    policyRules,
    warRoom,
  ]);

  // AI findings list constructor
  const aiFindingsList = useMemo(() => {
    return [
      {
        key: "deploy",
        label: "AI detected deployment",
        status: "verified",
        detail: "Release v4.2.1 correlated to the impact window (±6 min).",
      },
      {
        key: "impact",
        label: "AI detected customer impact",
        status: verified.impact ? "verified" : "evidence-missing",
        detail: verified.impact
          ? "Customer-impact evidence attached and confirmed."
          : "Asserted from error rate, but no customer-facing evidence attached.",
      },
      {
        key: "rollback",
        label: "AI detected rollback candidate",
        status: verified.rollback ? "verified" : "confidence",
        conf: 62,
        detail: verified.rollback
          ? "Rollback to v4.2.0 confirmed by engineer."
          : "Rollback to v4.2.0 proposed — more evidence required.",
      },
      {
        key: "alert",
        label: "AI matched alert to incident",
        status: "verified",
        detail: "Monitoring alert “checkout-5xx” matches the reported symptom.",
      },
    ];
  }, [verified]);

  // ─── ACTION DRIVERS ───
  const handleAutoRaise = () => {
    setAutoRaised(true);
    setVerified({});
    setWarRoom(false);
    setLinkedParent(null);
    setTitle("Checkout API returning HTTP 503 after deployment");
    setPriority("P1");
    setService("Checkout");
    setEnv("Production");
    setSource("Monitoring");
    setDesc(
      "Error rate on the Checkout API began climbing at 14:32 UTC, ~6 minutes after release v4.2.1 rolled out. Users see HTTP 503 on payment submission; roughly 18% of checkout attempts are failing. Latency on the orders dependency is elevated. Logs show upstream timeouts; no config change in the window.",
    );
    setEntry("Investigation Finding");
    setAttach(["Deployment ID: v4.2.1", "Monitoring snapshot", "Logs"]);
    setTags(["checkout", "deployment", "payments"]);

    setChatLog((prev) => [
      ...prev,
      {
        who: "ezra",
        html: "Scrubbe auto-raised this from a monitoring signal — so IQA is <b>validating the AI’s findings</b> instead of asking you. Deployment is <b>verified</b>, customer impact is asserted but <b>evidence is missing</b>, and the rollback candidate sits at <b>62% confidence</b>.",
      },
    ]);
    addToast("Auto-raised incident", "IQA is validating the AI findings");
  };

  const handleResetAll = () => {
    setTitle("");
    setPriority(null);
    setService("");
    setEnv("");
    setSource("");
    setDesc("");
    setEntry(ENTRY_TYPES[0]);
    setTags([]);
    setAttach([]);
    setAutoRaised(false);
    setWarRoom(false);
    setLinkedParent(null);
    setVerified({});
    setTagInput("");
    setChatInput("");
  };

  const handleAddTag = (text: string) => {
    const cleaned = text.trim().replace(/^#/, "").toLowerCase();
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
  };

  const handleCustomAddTagSubmit = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(tagInput);
      setTagInput("");
    }
  };

  const handleByPassedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeIncidentRaiseSubmit();
  };

  const executeIncidentRaiseSubmit = () => {
    if (missingMandatoryFields.length > 0) {
      addToast(
        "Prerequisite fields needed",
        "Complete Title, Priority and Service to submit",
      );
      if (!title.trim()) setFocusField("title");
      else if (!priority) setFocusField("priority");
      else setFocusField("service");
      return;
    }
    setSubmittedId("SI-1042" + String(100 + Math.floor(Math.random() * 899)));
    setIsSubmitted(true);
    setActiveEngineStep(0);
  };

  // Ticking effect for post-submit logs pipeline
  useEffect(() => {
    if (isSubmitted && activeEngineStep < POST_SUBMIT.length) {
      const timer = setTimeout(() => {
        setActiveEngineStep((prev) => prev + 1);
      }, 230);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, activeEngineStep]);

  // Ticking effect for active playbook step execution simulation
  useEffect(() => {
    if (isPlaybookRunning && playbookName) {
      const activeStepsLength =
        PLAYBOOK_STEPS_REGISTRY[playbookName]?.length || 5;
      if (playbookStep < activeStepsLength) {
        const timer = setTimeout(() => setPlaybookStep((s) => s + 1), 500);
        return () => clearTimeout(timer);
      } else {
        setIsPlaybookRunning(false);
        addToast("Playbook complete", `${playbookName} executed successfully`);
      }
    }
  }, [isPlaybookRunning, playbookStep, playbookName]);

  const svgCircumference = 326.7;
  const strokeDashoffset = svgCircumference * (1 - iqaVerdict.score / 100);
  const activeGuide = GUIDE[focusField] || GUIDE.title;

  return (
    <div className="bg-[#fafafb] text-[#15151a] font-ibm antialiased min-h-screen pb-16">
      <main className="max-w-[1600px] mx-auto p-4 sm:p-6">
        {!isSubmitted ? (
          <>
            {/* TWO-COLUMN BASE SPLIT CANVAS LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT CANVAS FORM PANEL COLUMN */}
              <section className="lg:col-span-8 space-y-3">
                {/* Title Summary Metadata Block */}
                <div className="pt-6 pb-4 flex justify-between item-start gap-4 border-b border-[#ebebef] mb-5">
                  <div>
                    <h1 className="font-tight font-ibm text-[26px] sm:text-[30px] tracking-tight leading-none">
                      Incident Quality Assurance{" "}
                      <span className="text-[#8c8c97] font-ibm text-[20px] sm:text-[22px]">
                        (IQA)
                      </span>
                    </h1>
                    <p className="text-[#5b5b66] font-light text-sm mt-2 max-w-sm">
                      IQA validates every raised incident before it enters
                      response — completeness, priority against operational
                      policy, SLA, operational rules, duplication and
                      investigation gaps. When Scrubbe auto-raises an incident,
                      IQA validates the AI's findings instead of asking you
                      questions.
                    </p>
                  </div>
                  <div className="flex h-fit gap-2">
                    <Button
                      type="button"
                      onClick={() => {}}
                      variant="outline-dark"
                      size="sm"
                      leftIcon={<TbBolt size={13} />}
                      className=" font-light"
                    >
                      Simulate auto-raised
                    </Button>
                    <Button
                      type="button"
                      variant="outline-dark"
                      size="sm"
                      onClick={handleResetAll}
                      className=" font-light"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                {/* 6 Questions Progress Box */}
                <div className="rounded-md border border-zinc-300 bg-white shadow-xs overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between bg-zinc-50/30">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="eyebrow font-medium uppercase">
                        Before you begin
                      </span>
                      <span className="text-[#8c8c97]">
                        a strong incident answers six questions
                      </span>
                    </div>
                    <span className="text-[10px] tnum text-zinc-300 font-bold">
                      {
                        Object.values(questionPrimerStates).filter(Boolean)
                          .length
                      }
                      /6 answered
                    </span>
                  </div>
                  <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2  gap-1.5">
                    {Object.entries({
                      what: "What happened?",
                      when: "When did it start?",
                      service: "Which service is affected?",
                      changed: "What changed before it?",
                      evidence: "What evidence exists?",
                      impact: "What is the impact?",
                    }).map(([k, label]) => {
                      const complete =
                        questionPrimerStates[
                          k as keyof typeof questionPrimerStates
                        ];
                      return (
                        <div
                          key={k}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-sm border text-xs font-medium transition-all ${complete ? "bg-[#e8f6ee] border-emerald-100 text-zinc-900" : "bg-[#fafafb] border-[#ebebef] text-[#8c8c97]"}`}
                        >
                          <span
                            className={`h-3.5 w-3.5 rounded-full flex items-center justify-center border text-[9px] ${complete ? "bg-[#1f9d5b] text-white border-[#1f9d5b]" : "border-zinc-200 bg-white"}`}
                          >
                            {complete && "✓"}
                          </span>
                          <span className="truncate">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleByPassedSubmit} className="space-y-3">
                  {/* Field: Title */}
                  <div
                    className={`rounded-xl border bg-white p-4 shadow-xs transition-all duration-200 ${focusField === "title" ? "border-indigo-200 ring-4 ring-[#eef0fe]" : "border-[#ebebef]"}`}
                    onClick={() => setFocusField("title")}
                  >
                    <div className="flex items-center justify-between mb-2 text-xs font-bold text-zinc-700">
                      <span>Incident Title Summary</span>
                      <button
                        type="button"
                        onClick={() => explainField("title")}
                        className="text-IMSDarkGreen text-[11px] hover:underline"
                      >
                        Explain ›
                      </button>
                    </div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Checkout API returning HTTP 503 for all users"
                      className="inp h-8 px-3 text-[11px] border outline-none w-full rounded-md"
                    />
                    <div className="mt-1.5 text-[11px] text-zinc-300">
                      A concise summary of the problem — symptom, system, and
                      scope.
                    </div>
                  </div>

                  {/* Field: Priority Selectors */}
                  <div
                    className={`rounded-xl border bg-white p-4 shadow-xs transition-all duration-200 ${focusField === "priority" ? "border-indigo-200 ring-4 ring-[#eef0fe]" : "border-[#ebebef]"}`}
                    onClick={() => setFocusField("priority")}
                  >
                    <div className="flex items-center justify-between mb-2 text-xs font-bold text-zinc-700">
                      <span>Priority</span>
                      <button
                        type="button"
                        onClick={() => explainField("priority")}
                        className="text-IMSDarkGreen text-[11px] hover:underline"
                      >
                        Explain ›
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {PRIOS.map((p) => (
                        <button
                          key={p.k}
                          type="button"
                          onClick={() => setPriority(p.k)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${priority === p.k ? "border-indigo-500 bg-[#eef0fe]/60" : "border-[#ebebef] hover:bg-[#fafafb]"}`}
                        >
                          <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: p.color }}
                            />
                            <span>{p.k}</span>
                            <span className="text-[10px] text-[#5b5b66] font-ibm font-medium">
                              {p.label}
                            </span>
                          </div>
                          <div className="text-[9px] text-zinc-400 mt-1 leading-tight font-medium line-clamp-1">
                            {p.blurb}
                          </div>
                        </button>
                      ))}
                    </div>
                    {priority && (
                      <div
                        className={`mt-2 text-xs rounded-lg px-2.5 py-2 border font-medium ${priority === policyRules.level ? "bg-[#e8f6ee] border-emerald-100 text-emerald-800" : "bg-[#fdf2e4] border-amber-100 text-amber-800"}`}
                      >
                        {priority === policyRules.level
                          ? "✓ Matches Ezra's evaluation of system signals."
                          : `Ezra reads this structural pattern closer to ${policyRules.level}.`}
                      </div>
                    )}
                  </div>

                  {/* Dropdowns line: Service + Env */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      className={`rounded-xl border bg-white p-4 shadow-xs ${focusField === "service" ? "border-indigo-200 ring-4 ring-[#eef0fe]" : "border-[#ebebef]"}`}
                      onClick={() => setFocusField("service")}
                    >
                      <label className="flex items-center justify-between mb-2 text-xs font-bold text-zinc-700">
                        <span>Affected</span>
                        <button
                          type="button"
                          onClick={() => explainField("service")}
                          className="text-IMSDarkGreen text-[11px] hover:underline"
                        >
                          Explain ›
                        </button>
                      </label>
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="inp h-10 px-2.5 border outline-none text-xs font-bold bg-white cursor-pointer w-full rounded-md"
                      >
                        <option value="">Select a service…</option>
                        {SERVICES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      className={`rounded-xl border bg-white p-4 shadow-xs ${focusField === "env" ? "border-indigo-200 ring-4 ring-[#eef0fe]" : "border-[#ebebef]"}`}
                      onClick={() => setFocusField("env")}
                    >
                      <label className="flex items-center justify-between mb-2 text-xs font-bold text-zinc-700">
                        <span>Environment</span>
                        <button
                          type="button"
                          onClick={() => explainField("env")}
                          className="text-IMSDarkGreen text-[11px] hover:underline"
                        >
                          Explain ›
                        </button>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {ENVS.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => setEnv(e)}
                            className={`h-9 rounded-md border text-xs font-semibold ${env === e ? "border-indigo-500 bg-[#eef0fe] text-IMSDarkGreen" : "border-[#ebebef] hover:bg-[#fafafb] text-zinc-600"}`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Field: Source */}
                  <div
                    className={`rounded-xl border bg-white p-4 shadow-xs ${focusField === "source" ? "border-indigo-200 ring-4 ring-[#eef0fe]" : "border-[#ebebef]"}`}
                    onClick={() => setFocusField("source")}
                  >
                    <label className="flex items-center justify-between mb-2 text-xs font-bold text-zinc-700">
                      <span>Incident Source</span>
                      <button
                        type="button"
                        onClick={() => explainField("source")}
                        className="text-IMSDarkGreen text-[11px] hover:underline"
                      >
                        Explain ›
                      </button>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SOURCES.map((src) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setSource(src)}
                          className={`h-8 px-3 rounded-lg border text-xs font-medium ${source === src ? "border-indigo-500 bg-[#eef0fe] text-IMSDarkGreen" : "border-[#ebebef] hover:border-zinc-400 text-zinc-600"}`}
                        >
                          {src}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field: Description text */}
                  <div
                    className={`rounded-xl border bg-white p-4 shadow-xs ${focusField === "desc" ? "border-indigo-200 ring-4 ring-[#eef0fe]" : "border-[#ebebef]"}`}
                    onClick={() => setFocusField("desc")}
                  >
                    <div className="flex items-center justify-between mb-2 text-xs font-bold text-zinc-700">
                      <span>Detailed Description</span>
                      <button
                        type="button"
                        onClick={() => explainField("desc")}
                        className="text-IMSDarkGreen text-[11px] hover:underline"
                      >
                        Explain ›
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Describe visible symptoms, what changed recently, what you have checked..."
                      className="inp p-3 text-xs outline-none border resize-y bg-white text-zinc-800 leading-relaxed font-medium w-full rounded-md"
                    />
                    <div className="mt-1.5 flex justify-between items-center text-[10px] text-zinc-400 ">
                      <span>
                        Coverage of the six questions appears in the coach
                      </span>
                      <span className="tnum font-bold">
                        {desc.length} words
                      </span>
                    </div>
                  </div>

                  {/* Field: Entry Type */}
                  <div
                    className={`rounded-xl border bg-white p-4 shadow-xs ${focusField === "entry" ? "border-indigo-200 ring-4 ring-[#eef0fe]" : "border-[#ebebef]"}`}
                    onClick={() => setFocusField("entry")}
                  >
                    <label className="flex items-center justify-between mb-2 text-xs font-bold text-zinc-700">
                      <span>Entry Type</span>
                      <button
                        type="button"
                        onClick={() => explainField("entry")}
                        className="text-IMSDarkGreen text-[11px] hover:underline"
                      >
                        Explain ›
                      </button>
                    </label>
                    <select
                      value={entry}
                      onChange={(e) => setEntry(e.target.value)}
                      className="inp h-10 px-2.5 bg-white border text-xs font-semibold outline-none cursor-pointer w-full rounded-md"
                    >
                      {ENTRY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field: Attachments quick selection lists */}
                  <div
                    className={`rounded-xl border bg-white p-4 shadow-xs ${focusField === "attach" ? "border-indigo-200 ring-4 ring-[#eef0fe]" : "border-[#ebebef]"}`}
                    onClick={() => setFocusField("attach")}
                  >
                    <label className="text-xs  font-medium block mb-2">
                      Evidence &amp; Attachments
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2 border-b pb-2">
                      {ATTACH_TYPES.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => {
                            if (!attach.includes(a)) setAttach([...attach, a]);
                          }}
                          className="h-7 px-2.5 rounded-xl border border-dashed border-[#ebebef] bg-[#fafafb] text-[11px] text-zinc-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                        >
                          + {a}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {attach.map((a, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-lg border text-xs font-mono bg-zinc-50 border-zinc-200 text-zinc-600 font-semibold"
                        >
                          {a}{" "}
                          <X
                            size={12}
                            className="text-zinc-400 hover:text-zinc-700 cursor-pointer ml-1"
                            onClick={() =>
                              setAttach(attach.filter((_, idx) => idx !== i))
                            }
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Field: Tags lists */}
                  <div
                    className={`rounded-xl border bg-white p-4 shadow-xs ${focusField === "tags" ? "border-indigo-200 ring-4 ring-[#eef0fe]" : "border-[#ebebef]"}`}
                    onClick={() => setFocusField("tags")}
                  >
                    <label className="text-xs  font-medium block mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleCustomAddTagSubmit}
                        placeholder="Add custom metadata token and press enter..."
                        className="inp h-9 px-3 border outline-none text-xs flex-1 rounded-md w-full"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2 border-b pb-2">
                      {TAG_SUGGEST.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleAddTag(t)}
                          className="px-2 py-0.5 border text-[11px] font-medium text-[#5b5b66] bg-[#fafafb] border-[#ebebef] hover:border-indigo-300 rounded"
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-lg border bg-[#eef0fe] border-indigo-100 text-IMSDarkGreen text-xs font-bold font-mono"
                        >
                          #{t}{" "}
                          <X
                            size={12}
                            className="cursor-pointer text-indigo-400 hover:text-indigo-700"
                            onClick={() =>
                              setTags(tags.filter((tg) => tg !== t))
                            }
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sticky Footer Commit Dock Bar Control */}
                  <div className="sticky bottom-3 z-10 animate-fadeIn">
                    <div className="rounded-xl border border-[#ebebef] bg-white/95 backdrop-blur-md shadow-lg p-2.5 flex items-center gap-3">
                      <div className="flex items-center gap-2 pl-1 text-xs font-bold">
                        <span className="text-zinc-400 font-thin">IQA</span>
                        <span className="text-sm">{iqaVerdict.score}</span>
                      </div>
                      <div className="flex-1 h-1.5 rounded-full bg-[#f2f2f5] overflow-hidden">
                        <div
                          className="h-full bg-[#4f46e5] transition-all duration-300"
                          style={{
                            width: `${iqaVerdict.score}%`,
                            backgroundColor: iqaVerdict.tone,
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {}}
                        className="h-9 px-3.5 border rounded-lg text-xs font-bold hover:bg-zinc-50 bg-white shadow-2xs"
                      >
                        Save draft
                      </button>
                      <Button
                        type="button"
                        onClick={executeIncidentRaiseSubmit}
                        size="sm"
                      >
                        Analyze
                      </Button>
                    </div>
                  </div>
                </form>
              </section>

              {/* ========================================================
                  RIGHT COLUMN CONTAINER: STICKY ASSURANCE SUITE MODULES
                  ======================================================== */}
              <aside className="lg:col-span-4 space-y-3">
                <div className="lg:sticky lg:top-[72px] space-y-3">
                  {/* Gauge Scoring Wheel Frame Block */}
                  <div className="rounded-xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-2.5 h-10 border-b border-[#f2f2f5] bg-[#eef0fe]/40 text-xs font-bold flex justify-between items-center">
                      <span className="flex items-center gap-1.5 capitalize">
                        Incident Quality Assurance
                      </span>
                      <span className="text-[9.5px] font-mono tracking-widest text-white rounded-sm px-2 py-1 bg-IMSDarkGreen font-bold">
                        Live
                      </span>
                    </div>

                    <div className="p-4 flex items-center gap-4">
                      <div className="relative h-20 w-20 shrink-0 select-none">
                        <svg
                          viewBox="0 0 120 120"
                          className="h-20 w-20 -rotate-90"
                        >
                          <circle
                            cx="60"
                            cy="60"
                            r="52"
                            fill="none"
                            stroke="#f2f2f5"
                            strokeWidth="11"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="52"
                            fill="none"
                            stroke={iqaVerdict.tone}
                            strokeWidth="11"
                            strokeLinecap="round"
                            strokeDasharray={svgCircumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500 ease-out"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold tracking-tight text-zinc-950">
                          {iqaVerdict.score}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-zinc-900 tracking-tight">
                          {iqaVerdict.label}
                        </div>
                        <p className="text-xs text-zinc-500 leading-snug">
                          {iqaVerdict.msg}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Core checklist items database array render stacks */}
                  <div className="space-y-3 overflow-y-auto pr-1 scroll-thin">
                    {/* Block A: Machine-parsed verification items from alerts */}
                    {autoRaised && (
                      <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm space-y-2">
                        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b pb-1.5 flex items-center gap-1.5">
                          <Sparkles size={12} /> Validating AI Telemetry
                          Extraction
                        </div>
                        <div className="space-y-2 text-xs">
                          {aiFindingsList.map((find) => (
                            <div
                              key={find.key}
                              className="p-2.5 border rounded-lg bg-zinc-50/50"
                            >
                              <div className="flex justify-between items-center font-semibold text-zinc-800">
                                <span>{find.label}</span>
                                <span
                                  className={
                                    find.status === "verified"
                                      ? "text-emerald-600"
                                      : "text-amber-600"
                                  }
                                >
                                  {find.status === "verified"
                                    ? "✓ Verified"
                                    : `Confidence ${find.conf}%`}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 mt-1 leading-normal">
                                {find.detail}
                              </p>
                              {find.status !== "verified" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setVerified({
                                      ...verified,
                                      [find.key]: true,
                                    })
                                  }
                                  className="text-[11px] text-indigo-600 font-bold hover:underline block pt-1"
                                >
                                  Confirm and verify finding &rarr;
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Block B: Comprehensive 11 Validation Checks List */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm space-y-2">
                      <div className="flex justify-between border-b pb-1.5 text-[10px]  text-zinc-500 uppercase tracking-wider">
                        <span>Validation Checklist Suite</span>
                        <span className="font-mono tnum">
                          {checklistRules.filter((c) => c.ok).length}/
                          {checklistRules.length}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs font-semibold text-zinc-700">
                        {checklistRules.map((c, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span
                              className={`h-3.5 w-3.5 rounded-full border text-[9px] font-bold flex items-center justify-center ${c.ok ? "bg-emerald-500 border-emerald-500 text-white" : c.warn ? "bg-amber-500 border-amber-500 text-white" : "border-zinc-200"}`}
                            >
                              {c.ok ? "✓" : c.warn ? "!" : ""}
                            </span>
                            <span
                              className={`flex-1 truncate font-medium ${c.ok ? "text-zinc-800" : "text-zinc-400"}`}
                            >
                              {c.k}
                            </span>
                            {c.note && (
                              <span className="font-mono text-[10px] text-zinc-400 shrink-0 max-w-[110px] truncate">
                                {c.note}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Block C: Completeness Mandatory status blocks */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm space-y-2">
                      <div className="text-[10px] text-zinc-500 uppercase border-b pb-1.5 flex justify-between">
                        <span>Completeness </span>
                        <span
                          className={
                            missingMandatoryFields.length
                              ? "text-orange-600"
                              : "text-emerald-600"
                          }
                        >
                          {missingMandatoryFields.length
                            ? `${missingMandatoryFields.length} missing`
                            : "Complete"}
                        </span>
                      </div>
                      <div className="text-xs">
                        {missingMandatoryFields.length > 0 ? (
                          <div className="space-y-1.5">
                            <p className="text-zinc-500 font-medium">
                              Mandatory fields not yet satisfied
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {missingMandatoryFields.map((f) => (
                                <span
                                  key={f}
                                  className="text-[10px] font-bold font-mono bg-amber-50 text-orange-700 px-1.5 py-0.5 rounded border border-amber-100"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-emerald-700 font-medium">
                            All prerequisite data criteria fields satisfy
                            baseline requirements.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Block D: Policy Priority check logs */}
                    {(priority || service) && (
                      <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm space-y-2.5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase border-b pb-1.5">
                          <span>Priority Compliance Assessment</span>
                          <span className="font-mono text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded font-black">
                            {policyRules.level}
                          </span>
                        </div>
                        <div className="text-xs space-y-2 leading-relaxed">
                          <p
                            className={`font-semibold ${priority === policyRules.level ? "text-emerald-600" : "text-amber-600"}`}
                          >
                            {priority === policyRules.level
                              ? `✓ Selected code alignment matches system parameters.`
                              : `Selected priority ${priority} conflicts with telemetry evaluation.`}
                          </p>
                          <ul className="space-y-1 text-[11px] font-medium text-zinc-500 list-none">
                            {policyRules.reasons.map((r, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span
                                  className={
                                    r.ok ? "text-emerald-500" : "text-zinc-300"
                                  }
                                >
                                  {r.ok ? "✓" : "•"}
                                </span>
                                {r.ok ? r.pos : r.neg}
                              </li>
                            ))}
                          </ul>
                          {priority !== policyRules.level && (
                            <button
                              type="button"
                              onClick={() => setPriority(policyRules.level)}
                              className="text-xs text-indigo-600 font-bold block hover:underline"
                            >
                              Apply corporate recommended path:{" "}
                              {policyRules.level} &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Block E: SLA Matrix bindings details */}
                    {priority && (
                      <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm space-y-2">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b pb-1.5">
                          Active SLA Policy Grids
                        </div>
                        <div className="space-y-1 text-xs">
                          {["P0", "P1", "P2", "P3"].map((p) => {
                            const active = p === priority;
                            return (
                              <div
                                key={p}
                                className={`flex justify-between items-center p-1.5 rounded-md text-[11px] font-medium ${active ? "bg-indigo-50 border border-indigo-100 font-bold text-indigo-950" : "text-zinc-500 border border-transparent"}`}
                              >
                                <span
                                  className="font-mono font-black w-6"
                                  style={{ color: SLA[p].color }}
                                >
                                  {p}
                                </span>
                                <span className="flex-1 px-2 text-left">
                                  Respond:{" "}
                                  <b
                                    className={
                                      active ? "text-zinc-950" : "text-zinc-700"
                                    }
                                  >
                                    {SLA[p].resp}
                                  </b>
                                </span>
                                <span>
                                  Resolve:{" "}
                                  <b
                                    className={
                                      active ? "text-zinc-950" : "text-zinc-700"
                                    }
                                  >
                                    {SLA[p].res}
                                  </b>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Block F: Operational Rules */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm space-y-2">
                      <div className="text-[10px] text-zinc-500 uppercase border-b pb-1.5">
                        Operational rules in place
                      </div>
                      <div className="space-y-1.5 text-xs font-semibold text-zinc-600">
                        {operationalRegulations.map((r, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-start gap-2"
                          >
                            <span
                              className={
                                r.met ? "text-emerald-500" : "text-amber-500"
                              }
                            >
                              {r.met ? "✓" : "!"}
                            </span>
                            <span className="flex-1 font-medium leading-normal">
                              {r.rule}
                            </span>
                            {r.action === "war-room" && !warRoom && (
                              <button
                                type="button"
                                onClick={() => setWarRoom(true)}
                                className="text-[10px] text-indigo-600 font-bold whitespace-nowrap"
                              >
                                Create Room &rarr;
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Block G: Investigation Primers checklist questions */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm space-y-2">
                      <div className="text-[10px]  text-zinc-500 uppercase border-b pb-1.5">
                        Invstigation questions
                      </div>
                      <div className="space-y-2 text-xs font-semibold">
                        {investigationSuite.map((i, n) => (
                          <div key={n} className="flex items-start gap-2.5">
                            <span
                              className={
                                i.ok ? "text-emerald-500" : "text-zinc-300"
                              }
                            >
                              {i.ok ? "✓" : "?"}
                            </span>
                            <span
                              className={`flex-1 font-medium ${i.ok ? "text-zinc-400 line-through" : "text-zinc-700"}`}
                            >
                              {i.q}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active Context-Aware Guidance Info Component panel */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs space-y-2 animate-fadeIn">
                    <div className="text-[10px]  uppercase  text-zinc-500 flex items-center gap-1.5 border-b pb-1.5">
                      Active Guide Matrix: {activeGuide.name}
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                      {activeGuide.purpose}
                    </p>
                    {activeGuide.tip && (
                      <p className="text-[10.5px] font-bold text-indigo-700 bg-indigo-50/50 border p-2 rounded-md">
                        Tip: {activeGuide.tip}
                      </p>
                    )}
                  </div>

                  {/* Interactive Ezra Console Chat Interface module */}
                  <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-64 flex flex-col justify-between">
                    <div className="px-4 h-9 border-b flex items-center gap-1.5 text-[10px]  uppercase  text-zinc-500 bg-zinc-50/50">
                      <TbMessageDots size={16} />
                      Ask IQA
                    </div>
                    <div
                      ref={ezraLogRef}
                      className="p-3 flex-1 overflow-y-auto space-y-3 scrollbar-thin text-xs leading-normal"
                    >
                      {chatLog.map((chat, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-2 ${chat.who === "you" ? "justify-end" : "justify-start"}`}
                        >
                          {chat.who === "ezra" && (
                            <span className="h-6 w-6 bg-IMSDarkGreen text-white rounded-full font-bold text-[9px] flex items-center justify-center mt-0.5">
                              <HiMiniSparkles size={16} />
                            </span>
                          )}
                          <div
                            dangerouslySetInnerHTML={{ __html: chat.html }}
                            className={`p-2 rounded-xl max-w-[85%] text-[11.5px] ${chat.who === "you" ? "bg-zinc-900 text-white rounded-br-none" : "bg-zinc-50 border border-zinc-100 text-zinc-700 rounded-bl-none font-medium"}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t flex items-center gap-1.5 bg-zinc-50/50">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter"}
                        placeholder="Ask IQA about this incident."
                        className="h-8 bg-white border px-2.5 rounded-md text-xs flex-1 outline-none text-zinc-800"
                      />
                      <button
                        type="button"
                        onClick={() => {}}
                        className="h-8 w-8 bg-IMSDarkGreen text-white rounded-md flex items-center justify-center shadow-2xs"
                      >
                        <Send size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        ) : (
          // ─── POST-SUBMIT AUTOMATION ANALYSIS VIEW RENDER ───
          <section className="space-y-6 pt-4 animate-growIn">
            <div className="border-b pb-4 flex flex-wrap justify-between items-end gap-4">
              <div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                  ✓ Target Incident Operational Records Bound
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                  {title}
                </h2>
                <div className="font-mono text-zinc-400 text-xs font-bold mt-1">
                  Platform Identifier Stable Key:{" "}
                  <span className="text-zinc-900">{submittedId}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPlaybookName(
                    PLAYBOOKS[categoryDetected] || "General Triage",
                  )
                }
                className="h-9 px-4 rounded-lg bg-zinc-950 text-white text-xs font-bold shadow-xs flex items-center gap-2"
              >
                <BookOpen size={13} /> Open Remediation Runbook
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column Section: Sequential Pipeline Tick Progress Row */}
              <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-400 border-b pb-2 uppercase tracking-wider">
                  <span>Scrubbe Autonomous Pipelines Dispatched</span>
                  <span className="font-mono">
                    {Math.round(
                      (Math.min(activeEngineStep, POST_SUBMIT.length) /
                        POST_SUBMIT.length) *
                        100,
                    )}
                    % Complete
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {POST_SUBMIT.map((pipeline, idx) => {
                    const complete = idx < activeEngineStep;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${complete ? "border-emerald-200 bg-emerald-50/40 text-emerald-800 font-bold" : "border-zinc-100 bg-zinc-50/20 text-zinc-300 opacity-40"}`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full border text-[9px] flex items-center justify-center font-bold ${complete ? "bg-emerald-500 border-emerald-500 text-white font-black" : "border-zinc-200 bg-white"}`}
                        >
                          {complete ? "✓" : "!"}
                        </div>
                        <span>{pipeline}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column Section: Gated Summary Telemetry Cache Box */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border p-4 rounded-xl shadow-2xs space-y-2.5 text-xs">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b pb-1">
                    IQA Snapshot Telemetry Verification Logs
                  </div>
                  <div className="flex justify-between">
                    <span>Checklist Rules Pass Rating:</span>{" "}
                    <span className="font-mono font-bold text-zinc-950">
                      {iqaVerdict.score}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inferred Incident Category:</span>{" "}
                    <span className="font-bold text-zinc-800">
                      {categoryDetected}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bound SLA Timers Context:</span>{" "}
                    <span className="font-semibold text-zinc-800">
                      {priority
                        ? `${SLA[priority].resp} / ${SLA[priority].res}`
                        : "—"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full h-10 border bg-white rounded-xl text-xs font-bold text-zinc-700 shadow-2xs hover:bg-zinc-50 transition-colors"
                >
                  Return to Workspace Editor
                </button>
              </div>
            </div>

            {/* Simulated Runnable Playbook Remediator Modal Host Overlay Window */}
            {playbookName && (
              <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 border shadow-2xl animate-growIn">
                  <div className="border-b pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={14} className="text-indigo-600" /> Playbook
                        Runbook Simulator
                      </h3>
                      <span className="text-[10.5px] text-zinc-400 mt-0.5 font-medium">
                        {playbookName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPlaybookName(null);
                        setPlaybookStep(0);
                        setIsPlaybookRunning(false);
                      }}
                      className="text-zinc-400 hover:text-zinc-700"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scroll-thin">
                    {(
                      PLAYBOOK_STEPS_REGISTRY[playbookName] || [
                        ["Establish Scope", "Assess bounds"],
                        ["Mitigate", "Apply patch"],
                      ]
                    ).map((s, n) => {
                      const stepComplete = n < playbookStep;
                      return (
                        <div
                          key={n}
                          className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-3 transition-colors ${stepComplete ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-zinc-100 text-zinc-400 bg-white"}`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full border text-[9px] flex items-center justify-center font-bold ${stepComplete ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-200"}`}
                          >
                            {stepComplete ? "✓" : n + 1}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900">
                              {s[0]}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5 font-medium">
                              {s[1]}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t flex justify-end gap-1.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setPlaybookName(null);
                        setPlaybookStep(0);
                        setIsPlaybookRunning(false);
                      }}
                      className="h-8.5 px-3 border rounded-lg bg-white text-zinc-600"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      disabled={
                        isPlaybookRunning ||
                        playbookStep ===
                          (PLAYBOOK_STEPS_REGISTRY[playbookName]?.length || 2)
                      }
                      onClick={() => {}}
                      className="h-8.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                    >
                      {playbookStep ===
                      (PLAYBOOK_STEPS_REGISTRY[playbookName]?.length || 2)
                        ? "Remediation Complete ✓"
                        : isPlaybookRunning
                          ? "Running..."
                          : "Trigger Playbook Sequence"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );

  function esc(s: string) {
    return s.replace(
      /[&<>"]/g,
      (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] || c,
    );
  }
}
