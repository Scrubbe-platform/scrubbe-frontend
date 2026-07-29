"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateRecord, TemplateStatus } from "./incidentTemplates.data";
import OverviewTab from "./OverviewTab";
import TriggersAgentsTab from "./TriggersAgentsTab";
import SignalsObjectivesTab from "./SignalsObjectivesTab";
import PlaybooksRulesTab from "./PlaybooksRulesTab";
import PolicyVerificationTab from "./PolicyVerificationTab";
import GovernanceTab from "./GovernanceTab";
import DependenciesTab from "./DependenciesTab";
import TimelineIntegrationsTab from "./TimelineIntegrationsTab";
import SimulationAnalyticsTab from "./SimulationAnalyticsTab";
import VersionsAuditTab from "./VersionsAuditTab";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "agents", label: "Triggers & Agents" },
  { key: "signals", label: "Signals & Objectives" },
  { key: "playbooks", label: "Playbooks & Rules" },
  { key: "policy", label: "Policy & Verification" },
  { key: "governance", label: "Governance" },
  { key: "dependencies", label: "Dependencies" },
  { key: "timeline", label: "Timeline & Integrations" },
  { key: "simulation", label: "Simulation & Analytics" },
  { key: "versions", label: "Versions & Audit" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const STATUS_STYLE: Record<TemplateStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Draft: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Archived: "bg-zinc-100 text-black/50 dark:bg-zinc-800 dark:text-zinc-500",
};
const STATUS_DOT: Record<TemplateStatus, string> = {
  Active: "bg-emerald-500",
  Draft: "bg-amber-500",
  Archived: "bg-zinc-400",
};

export default function Detail({
  template,
  templates,
  onOpenTemplate,
  onEditTemplate,
  onDuplicate,
  onBackToOverview,
}: {
  template: TemplateRecord;
  templates: TemplateRecord[];
  onOpenTemplate: (name: string) => void;
  onEditTemplate: (template: TemplateRecord) => void;
  onDuplicate: (template: TemplateRecord) => void;
  onBackToOverview: () => void;
}) {
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6">
      <div className="mb-2 flex items-center gap-1.5 text-[12.5px] text-black/40 dark:text-zinc-500">
        <button
          onClick={onBackToOverview}
          className="hover:text-black dark:hover:text-zinc-200"
        >
          Overview
        </button>
        <ChevronRight size={13} />
        <span className="font-semibold text-black dark:text-zinc-200">
          Incident Template
        </span>
      </div>

      <div className="mb-5 rounded-lg bg-white p-6 shadow-sm shadow-light dark:bg-zinc-900/60 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[26px] font-bold leading-tight text-black dark:text-zinc-100">
                {template.name}
              </h1>
              <span className="rounded-md bg-rose-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                Critical · P1
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wide",
                  STATUS_STYLE[template.status],
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[template.status])} />
                {template.status}
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-black/60 dark:text-zinc-400">
              Investigates and remediates {template.name.toLowerCase()} incidents in{" "}
              {template.cat}, orchestrating agents, correlating signals, and applying
              the configured response playbooks.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
              <MetaItem k="Category" v={template.cat} />
              <MetaItem k="Environment" v="Production" />
              <MetaItem k="Version" v="5.1" />
              <MetaItem k="Owner" v="Platform Engineering" />
              <MetaItem k="Usage (30d)" v={`${template.usage} runs`} />
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => onDuplicate(template)}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              Duplicate
            </button>
            <button
              onClick={() => onEditTemplate(template)}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              Edit
            </button>
            <button className="rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700">
              Run Simulation
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5 flex gap-6 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 pb-3 pt-1 text-[13.5px] font-medium transition-colors",
              tab === t.key
                ? "border-emerald-600 font-semibold text-black dark:text-zinc-100"
                : "border-transparent text-black/45 hover:text-black dark:text-zinc-500",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab template={template} />}
      {tab === "agents" && <TriggersAgentsTab />}
      {tab === "signals" && <SignalsObjectivesTab />}
      {tab === "playbooks" && <PlaybooksRulesTab />}
      {tab === "policy" && <PolicyVerificationTab />}
      {tab === "governance" && <GovernanceTab />}
      {tab === "dependencies" && (
        <DependenciesTab template={template} templates={templates} onOpenTemplate={onOpenTemplate} />
      )}
      {tab === "timeline" && <TimelineIntegrationsTab />}
      {tab === "simulation" && <SimulationAnalyticsTab />}
      {tab === "versions" && <VersionsAuditTab />}
    </div>
  );
}

function MetaItem({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
        {k}
      </div>
      <div className="mt-1 text-[13.5px] font-semibold text-black dark:text-zinc-100">
        {v}
      </div>
    </div>
  );
}
