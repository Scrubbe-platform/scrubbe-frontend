"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Download,
  Upload,
  Plus,
  BookOpen,
  Search,
  Check,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { ACTIONS, FIELDS, COND_GROUPS, ACT_GROUPS } from "./rule-config";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type LibrarySource = "curated" | "imported" | "saved";
type LibView = "rules" | "cats";

export interface LibraryRule {
  id: string;
  name: string;
  description: string;
  status: "enabled" | "draft" | "disabled";
  matchType: "all" | "any" | "none";
  conditions: unknown[];
  actions: { key: string; detail: string }[];
  source: LibrarySource;
  icon?: string;
}

interface RuleLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (rule: LibraryRule) => void;
  currentRuleJson: string; // serialized current rule to save
  currentRuleName: string;
}

// ─── CURATED TEMPLATES ───────────────────────────────────────────────────────

const CURATED_RULES: LibraryRule[] = [
  // Execution governance
  {
    id: "t1",
    source: "curated",
    name: "No autonomous execution outside business hours",
    description:
      "Block autonomous remediation outside business hours and require manager approval.",
    status: "enabled",
    matchType: "all",
    conditions: [
      { field: "businessHours", op: "is", value: "No" },
      { field: "environment", op: "equals", value: "Production" },
    ],
    actions: [
      {
        key: "disableAutonomy",
        detail: "Force human-in-the-loop for this incident",
      },
      {
        key: "managerApproval",
        detail: "Hold for service-owner or manager sign-off",
      },
      {
        key: "sendNotification",
        detail: "Channel: Slack (#incidents), Email (On-call)",
      },
    ],
  },
  {
    id: "t2",
    source: "curated",
    name: "Emergency change → Emergency CAB (eCAB)",
    description:
      "Route emergency changes to the Emergency CAB for expedited sign-off.",
    status: "enabled",
    matchType: "all",
    conditions: [
      { field: "changeType", op: "equals", value: "Emergency change" },
    ],
    actions: [
      {
        key: "ecabApproval",
        detail: "Convene the Emergency CAB for expedited sign-off",
      },
      {
        key: "sendNotification",
        detail: "Channel: Slack (#incidents), Email (On-call)",
      },
    ],
  },
  {
    id: "t3",
    source: "curated",
    name: "Standard change in window → auto-approve",
    description:
      "Auto-approve low-risk standard changes inside an approved window.",
    status: "enabled",
    matchType: "all",
    conditions: [
      {
        field: "changeType",
        op: "is any of",
        value: "Standard change, Pre-approved change",
      },
      {
        field: "changeWindow",
        op: "is any of",
        value: "Maintenance window, Pre-approved window",
      },
      { field: "remediationRisk", op: "equals", value: "Low" },
    ],
    actions: [
      {
        key: "autoApprove",
        detail: "Execute autonomously — no human approval required",
      },
    ],
  },
  {
    id: "t4",
    source: "curated",
    name: "Change freeze → CAB approval",
    description:
      "Require Change Advisory Board sign-off during a change freeze.",
    status: "enabled",
    matchType: "all",
    conditions: [
      { field: "changeWindow", op: "equals", value: "Change freeze" },
      { field: "emergencyOverride", op: "is", value: "No" },
    ],
    actions: [
      {
        key: "cabApproval",
        detail: "Route to the Change Advisory Board for review",
      },
      { key: "blockAutomation", detail: "Prevent automated remediation" },
    ],
  },
  {
    id: "t5",
    source: "curated",
    name: "Regulated, high blast radius → multi-stage approval",
    description:
      "Multi-stage sign-off for regulated changes with a wide blast radius.",
    status: "enabled",
    matchType: "all",
    conditions: [
      { field: "complianceRisk", op: "is any of", value: "High, Regulatory" },
      { field: "blastRadius", op: "greater or equal", value: "10" },
    ],
    actions: [
      {
        key: "multiStageApproval",
        detail: "Sequential sign-off: owner → manager → change lead",
      },
      { key: "requireApproval", detail: "Hold actions for human approval" },
    ],
  },
  // Governance thresholds
  {
    id: "t6",
    source: "curated",
    name: "Low Ezra confidence → human approval",
    description:
      "Require human approval when diagnostic confidence is below 80%.",
    status: "enabled",
    matchType: "all",
    conditions: [{ field: "ezraConfidence", op: "less than", value: "80" }],
    actions: [
      { key: "requireApproval", detail: "Hold actions for human approval" },
      {
        key: "disableAutonomy",
        detail: "Force human-in-the-loop for this incident",
      },
    ],
  },
  {
    id: "t7",
    source: "curated",
    name: "Deployment root cause → auto rollback",
    description: "Roll back automatically when a deployment is the root cause.",
    status: "enabled",
    matchType: "all",
    conditions: [
      { field: "rootCauseType", op: "equals", value: "Deployment" },
      { field: "rollbackAvailable", op: "is", value: "Yes" },
    ],
    actions: [
      { key: "autoRollback", detail: "Roll back the triggering deployment" },
      {
        key: "sendNotification",
        detail: "Channel: Slack (#incidents), Email (On-call)",
      },
    ],
  },
  {
    id: "t8",
    source: "curated",
    name: "Wide blast radius → block automation",
    description:
      "Block automated remediation when more than 10 services are impacted.",
    status: "enabled",
    matchType: "all",
    conditions: [{ field: "blastRadius", op: "greater than", value: "10" }],
    actions: [
      { key: "blockAutomation", detail: "Prevent automated remediation" },
      { key: "requireApproval", detail: "Hold actions for human approval" },
    ],
  },
  {
    id: "t9",
    source: "curated",
    name: "High remediation risk → executive approval",
    description: "Gate high-risk remediations behind executive sign-off.",
    status: "enabled",
    matchType: "all",
    conditions: [{ field: "remediationRisk", op: "equals", value: "High" }],
    actions: [
      {
        key: "executiveApproval",
        detail: "Gate execution behind executive sign-off",
      },
      { key: "blockAutomation", detail: "Prevent automated remediation" },
    ],
  },
  {
    id: "t10",
    source: "curated",
    name: "Major customer impact → escalate now",
    description:
      "Escalate immediately when more than 100,000 users are affected.",
    status: "enabled",
    matchType: "all",
    conditions: [
      { field: "customerImpact", op: "greater than", value: "100000" },
    ],
    actions: [
      { key: "escalateNow", detail: "Page on-call and incident commander now" },
      { key: "executiveReview", detail: "Notify incident commander chain" },
      { key: "startWarRoom", detail: "War Room Type: Incident Response" },
    ],
  },
  // Agent behaviour governance
  {
    id: "t11",
    source: "curated",
    name: "Production → no autonomous execution",
    description:
      "Force human-in-the-loop: disable autonomous execution on production.",
    status: "enabled",
    matchType: "all",
    conditions: [{ field: "environment", op: "equals", value: "Production" }],
    actions: [
      {
        key: "disableAutonomy",
        detail: "Force human-in-the-loop for this incident",
      },
    ],
  },
  {
    id: "t12",
    source: "curated",
    name: "Tier-1 → second verification agent",
    description:
      "Require an independent verification agent on tier-1 services.",
    status: "enabled",
    matchType: "all",
    conditions: [{ field: "serviceTier", op: "equals", value: "Tier-1" }],
    actions: [
      {
        key: "secondAgent",
        detail: "Add an independent second agent to verify",
      },
    ],
  },
  {
    id: "t13",
    source: "curated",
    name: "Low remediation confidence → investigate further",
    description:
      "Launch an additional investigation agent below 90% confidence.",
    status: "enabled",
    matchType: "all",
    conditions: [
      { field: "remediationConfidence", op: "less than", value: "90" },
    ],
    actions: [
      {
        key: "investigationAgent",
        detail: "Spin up an additional diagnostic agent",
      },
    ],
  },
  {
    id: "t14",
    source: "curated",
    name: "Investigation over 5 min → escalate to human",
    description: "Hand off from agent to on-call when investigation runs long.",
    status: "enabled",
    matchType: "all",
    conditions: [
      {
        field: "investigationDuration",
        op: "for more than",
        value: "5 minutes",
      },
    ],
    actions: [
      {
        key: "escalateHuman",
        detail: "Hand off from agent to on-call engineer",
      },
    ],
  },
  // Incident & correlation
  {
    id: "t15",
    source: "curated",
    name: "P0 executive escalation",
    description: "Escalate and notify leadership for P0 incidents.",
    status: "enabled",
    matchType: "all",
    conditions: [{ field: "priority", op: "equals", value: "P0" }],
    actions: [
      { key: "escalateIncident", detail: "Escalate to Platform Engineering" },
      { key: "executiveReview", detail: "Notify incident commander chain" },
      { key: "startWarRoom", detail: "War Room Type: Incident Response" },
      {
        key: "sendNotification",
        detail: "Channel: Slack (#incidents), Email (On-call)",
      },
    ],
  },
  {
    id: "t16",
    source: "curated",
    name: "Unacknowledged incident escalation",
    description: "Escalate when an incident is not acknowledged in time.",
    status: "enabled",
    matchType: "all",
    conditions: [
      { field: "priority", op: "greater or equal", value: "P1" },
      { field: "notAckFor", op: "for more than", value: "15 minutes" },
    ],
    actions: [
      { key: "escalateIncident", detail: "Escalate to Platform Engineering" },
      { key: "addResponders", detail: "On-call + service owners" },
      {
        key: "sendNotification",
        detail: "Channel: Slack (#incidents), Email (On-call)",
      },
    ],
  },
  {
    id: "t17",
    source: "curated",
    name: "Weekend incident escalation",
    description: "Escalate incidents that occur on weekends.",
    status: "enabled",
    matchType: "all",
    conditions: [
      { field: "priority", op: "greater or equal", value: "P2" },
      { field: "dayOfWeek", op: "is any of", days: ["Sat", "Sun"] },
    ],
    actions: [
      { key: "escalateIncident", detail: "Escalate to Platform Engineering" },
      { key: "assignTeam", detail: "Team: Platform Engineering (On-call)" },
      {
        key: "sendNotification",
        detail: "Channel: Slack (#incidents), Email (On-call)",
      },
    ],
  },
  {
    id: "t18",
    source: "curated",
    name: "Mother incident auto-linking",
    description: "Link related child incidents to a mother incident.",
    status: "enabled",
    matchType: "all",
    conditions: [
      { field: "motherExists", op: "exists" },
      { field: "childCount", op: "greater than", value: "5" },
    ],
    actions: [
      { key: "linkChild", detail: "Attach to existing mother incident" },
      { key: "syncFindings", detail: "Share findings across the cluster" },
      { key: "propagateResolution", detail: "Sync resolution to children" },
    ],
  },
  {
    id: "t19",
    source: "curated",
    name: "Known risk detection",
    description: "Surface known risks and prior resolutions on match.",
    status: "enabled",
    matchType: "all",
    conditions: [
      { field: "knownRisk", op: "exists" },
      { field: "similarFound", op: "is", value: "Yes" },
    ],
    actions: [
      { key: "attachRisks", detail: "Known risks for the service" },
      { key: "attachResolutions", detail: "Top 3 prior resolutions" },
      { key: "recommendPlaybook", detail: "Suggest top-ranked playbook" },
    ],
  },
];

// ─── TAG BADGE ───────────────────────────────────────────────────────────────

function SourceTag({ source }: { source: LibrarySource }): React.JSX.Element {
  const cls: Record<LibrarySource, string> = {
    curated: "bg-indigo-50 text-indigo-600",
    imported: "bg-emerald-50 text-emerald-600",
    saved: "bg-amber-50 text-amber-700",
  };
  const labels: Record<LibrarySource, string> = {
    curated: "Curated",
    imported: "Imported",
    saved: "Saved",
  };
  return (
    <span
      className={`text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${cls[source]}`}
    >
      {labels[source]}
    </span>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function RuleLibraryModal({
  isOpen,
  onClose,
  onLoad,
  currentRuleJson,
  currentRuleName,
}: RuleLibraryModalProps): React.JSX.Element | null {
  const [view, setView] = useState<LibView>("rules");
  const [search, setSearch] = useState<string>("");
  const [library, setLibrary] = useState<LibraryRule[]>(CURATED_RULES);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // ── save current rule ──
  const saveCurrentRule = (): void => {
    if (!currentRuleName.trim()) {
      alert("Give the current rule a name first.");
      return;
    }
    try {
      const parsed = JSON.parse(currentRuleJson);
      const entry: LibraryRule = {
        id: `saved_${Date.now()}`,
        name: currentRuleName,
        description: parsed.description ?? "",
        status: "enabled",
        matchType: parsed.matchType ?? "all",
        conditions: parsed.conditions ?? [],
        actions: parsed.actions ?? [],
        source: "saved",
      };
      setLibrary((prev) => [entry, ...prev]);
      setView("rules");
    } catch {
      alert("Could not parse the current rule.");
    }
  };

  // ── export pack ──
  const exportPack = (): void => {
    const pack = {
      schema: "scrubbe.rule-pack/v1",
      name: "Operational rule library",
      exportedAt: new Date().toISOString(),
      rules: library,
    };
    const blob = new Blob([JSON.stringify(pack, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "operational-rule-pack.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ── download single ──
  const downloadRule = (rule: LibraryRule): void => {
    const blob = new Blob([JSON.stringify(rule, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rule.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ── import pack ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev): void => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const rules: LibraryRule[] = Array.isArray(data)
          ? data
          : Array.isArray(data.rules)
            ? data.rules
            : [data];
        const valid = rules
          .filter((r) => r.name && (r.conditions || r.actions))
          .map((r) => ({
            ...r,
            id: `imp_${Date.now()}_${Math.random()}`,
            source: "imported" as LibrarySource,
          }));
        setLibrary((prev) => [...valid, ...prev]);
        setView("rules");
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── remove rule ──
  const removeRule = (id: string): void =>
    setLibrary((prev) => prev.filter((r) => r.id !== id));

  // ── filter ──
  const filtered = library.filter(
    (r) =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-[200] backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[660px] max-h-[88vh] flex flex-col pointer-events-auto">
          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-4">
            <div>
              <h3 className="text-[18px] font-extrabold text-zinc-900 tracking-tight">
                Rule library
              </h3>
              <p className="text-[12.5px] text-zinc-400 mt-1 max-w-[420px] leading-relaxed">
                Reusable rules as code. Load one into the builder, or download
                the pack, edit the JSON to add or change rules, and upload it to
                create them.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors ml-3 shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-5 border-b border-zinc-100">
            {(["rules", "cats"] as LibView[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`text-[13px] font-semibold px-3 py-2.5 border-b-2 -mb-px transition-colors ${view === v ? "text-indigo-500 border-indigo-500" : "text-zinc-500 border-transparent hover:text-zinc-700"}`}
              >
                {v === "rules" ? "Curated rules" : "Categories"}
              </button>
            ))}
          </div>

          {/* Toolbar — only on rules view */}
          {view === "rules" && (
            <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-100 bg-zinc-50 flex-wrap">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 hover:bg-zinc-50 transition-colors"
              >
                <Upload size={13} /> Upload pack
              </button>
              <button
                type="button"
                onClick={exportPack}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 hover:bg-zinc-50 transition-colors"
              >
                <Download size={13} /> Download pack
              </button>
              <button
                type="button"
                onClick={saveCurrentRule}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 hover:bg-zinc-50 transition-colors"
              >
                <Plus size={13} /> Save current rule
              </button>
              {/* Search */}
              <div className="relative ml-auto">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="text"
                  placeholder="Search rules…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-7 pr-3 py-1.5 text-[12.5px] border border-zinc-200 rounded-lg bg-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 w-44 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {view === "rules" && (
              <div className="p-4">
                {filtered.length === 0 ? (
                  <div className="text-center text-[13px] text-zinc-400 italic py-10">
                    {search
                      ? `No rules matching "${search}".`
                      : "No rules in the library yet."}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filtered.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent hover:bg-zinc-50 hover:border-zinc-200 transition-all group"
                      >
                        {/* Icon */}
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                          <BookOpen size={16} className="text-indigo-500" />
                        </div>
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-zinc-900 leading-snug truncate">
                            {rule.name}
                          </p>
                          <p className="text-[12px] text-zinc-400 truncate mt-0.5">
                            {rule.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <SourceTag source={rule.source} />
                            <span className="text-[11px] text-zinc-400">
                              {rule.conditions.length} condition
                              {rule.conditions.length !== 1 ? "s" : ""} ·{" "}
                              {rule.actions.length} action
                              {rule.actions.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onLoad(rule)}
                            className="text-[12.5px] font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadRule(rule)}
                            title="Download"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                          >
                            <Download size={14} />
                          </button>
                          {rule.source !== "curated" && (
                            <button
                              type="button"
                              onClick={() => removeRule(rule.id)}
                              title="Remove"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === "cats" && (
              <div className="p-5">
                <p className="text-[12.5px] text-zinc-400 mb-5 leading-relaxed">
                  Conditions and actions are grouped into governance domains —
                  AI analysis, remediation, business impact and agent
                  governance. Pick any block to add it to the rule you are
                  editing.
                </p>

                {/* Condition categories */}
                <div className="text-[11px] font-black tracking-widest text-zinc-500 uppercase pb-2 mb-3 border-b border-zinc-100">
                  Condition categories
                </div>
                {COND_GROUPS.map((g) => (
                  <div key={g.sec} className="mb-4">
                    <div className="text-[10.5px] font-bold tracking-widest text-zinc-400 uppercase mb-2">
                      {g.sec}
                    </div>
                    <div className="space-y-1">
                      {g.fields.map((fk) => {
                        const f = FIELDS[fk];
                        return (
                          <div
                            key={fk}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg border border-transparent hover:bg-indigo-50 hover:border-indigo-100 cursor-pointer group transition-colors"
                          >
                            <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center shrink-0">
                              <div className="w-2 h-2 rounded-full bg-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <b className="text-[13px] font-semibold text-zinc-800 block">
                                {f.label}
                              </b>
                            </div>
                            <ChevronRight
                              size={14}
                              className="text-zinc-300 group-hover:text-indigo-400 transition-colors"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Action categories */}
                <div className="text-[11px] font-black tracking-widest text-zinc-500 uppercase pb-2 mb-3 border-b border-zinc-100 mt-6">
                  Action categories
                </div>
                {ACT_GROUPS.map((g) => (
                  <div key={g.sec} className="mb-4">
                    <div className="text-[10.5px] font-bold tracking-widest text-zinc-400 uppercase mb-2">
                      {g.sec}
                    </div>
                    <div className="space-y-1">
                      {g.keys
                        .filter((k) => k in ACTIONS)
                        .map((k) => {
                          const a = ACTIONS[k];
                          return (
                            <div
                              key={k}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-transparent hover:bg-emerald-50 hover:border-emerald-100 cursor-pointer group transition-colors"
                            >
                              <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <b className="text-[13px] font-semibold text-zinc-800 block">
                                  {a.name}
                                </b>
                                <span className="text-[11.5px] text-zinc-400 block truncate">
                                  {a.detail}
                                </span>
                              </div>
                              <ChevronRight
                                size={14}
                                className="text-zinc-300 group-hover:text-emerald-400 transition-colors"
                              />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
