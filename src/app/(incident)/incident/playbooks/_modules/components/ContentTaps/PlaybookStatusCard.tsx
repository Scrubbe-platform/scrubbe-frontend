"use client";
import React from "react";
import { TriangleAlert, Copy, Play } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

const getPlaybookTitle = (incident: IncidentDetailRecord) =>
  incident.title || incident.reason || incident.summary || `${incident.service || "Service"} Incident`;

export default function PlaybookStatusCard({ incident }: { incident: IncidentDetailRecord }) {
  const playbookTitle = getPlaybookTitle(incident);
  const serviceName   = incident.service || incident.affectedSystem || "unknown-service";
  const stageLabel    = incident.lifecycleStep === "Resolved" ? "STAGE 6 · RESOLVED" : "STAGE 3 · ASSISTED EXECUTION";
  const versionLabel  = incident.environment || "runtime";
  const severityLabel = `${incident.severity || incident.priority || "P3"} ${incident.status || "ACTIVE"}`;

  const tags = [stageLabel, versionLabel, serviceName, severityLabel];

  const automationLevels = [
    { label: "playbook", value: "3", active: true  },
    { label: "policy",   value: "3", active: true  },
    { label: "risk",     value: "2", active: false },
  ];

  return (
    <div className="w-full p-2">
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">

        {/* Left — icon + title + tags */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <TriangleAlert className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <div className="space-y-2.5">
            <h2 className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100 leading-snug">
              {playbookTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2 shrink-0">
          {[
            { icon: <Copy className="h-3 w-3" />, label: "Clone"   },
            { icon: <Play className="h-3 w-3" />, label: "Dry Run" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="text-zinc-400 dark:text-zinc-500">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Automation level panel */}
      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">
            Effective Automation Level · CP Enforced
          </p>
          <div className="space-y-1.5 text-right">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Automation Stages</p>
            <div className="flex gap-1">
              <div className="h-1 w-10 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              <div className="h-1 w-10 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              <div className="h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[12px] text-zinc-400 dark:text-zinc-500">
          <span>min(</span>
          {automationLevels.map(({ label, value }, i) => (
            <React.Fragment key={label}>
              <span className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 font-medium text-zinc-600 dark:text-zinc-300">
                {label}: {value}
              </span>
              {i < automationLevels.length - 1 && <span>,</span>}
            </React.Fragment>
          ))}
          <span>) =</span>
          <span className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 font-medium text-zinc-700 dark:text-zinc-200">
            2 · PROPOSE
          </span>
        </div>
      </div>
    </div>
  );
}