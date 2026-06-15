"use client";
import React, { useState } from "react";
import { TriangleAlert, Copy, Play, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

const getPlaybookTitle = (incident: IncidentDetailRecord) =>
  incident.title || incident.reason || incident.summary || `${incident.service || "Service"} Incident`;

const severityToRiskLevel = (incident: IncidentDetailRecord): number => {
  const sev = (incident.severity || incident.priority || "").toUpperCase();
  if (sev === "P0" || sev === "CRITICAL") return 1;
  if (sev === "P1" || sev === "HIGH")     return 2;
  if (sev === "P2" || sev === "MEDIUM")   return 3;
  return Math.min(4, Math.max(1, incident.riskScore ?? 3));
};

export default function PlaybookStatusCard({ incident }: { incident: IncidentDetailRecord }) {
  const { post } = useFetch();
  const queryClient = useQueryClient();
  const [cloneMsg, setCloneMsg] = useState("");

  const { data: matchedPlaybook } = useQuery({
    queryKey: ["playbook-matched-id", incident.id],
    queryFn: async () => {
      const res = await post(endpoint.playbooks.match, {
        serviceNames: (incident.service || incident.affectedSystem)
          ? [incident.service || incident.affectedSystem]
          : undefined,
        incidentType: incident.category || incident.sourceType,
        signalTypes: incident.detection ? [incident.detection] : undefined,
      });
      const matches: any[] = res.data?.data?.matches ?? res.data?.data ?? [];
      // Each match is { playbook, confidenceScore } — extract the playbook
      return (matches[0]?.playbook ?? matches[0]) ?? null;
    },
    enabled: !!incident.id,
    staleTime: 30_000,
  });

  const cloneMutation = useMutation({
    mutationFn: async () => {
      if (!matchedPlaybook?.id) throw new Error("No playbook to clone");
      const res = await post(`${endpoint.playbooks.clone}/${matchedPlaybook.id}/clone`, {});
      if (!res.success) throw new Error("Clone failed");
      return res.data;
    },
    onSuccess: () => {
      setCloneMsg("Cloned ✓");
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      setTimeout(() => setCloneMsg(""), 3000);
    },
    onError: () => setCloneMsg("Clone failed"),
  });

  const dryRunMutation = useMutation({
    mutationFn: async () => {
      if (!matchedPlaybook?.id) throw new Error("No playbook to run");
      const res = await post(`${endpoint.playbooks.execute}/${matchedPlaybook.id}/execute`, {
        ticketId: incident.id,
        confidenceScore: matchedPlaybook.confidenceScore ?? 0.91,
      });
      if (!res.success) throw new Error("Execution failed");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook-executions", incident.id] });
      queryClient.invalidateQueries({ queryKey: ["playbook-execution-active", incident.id] });
    },
  });

  const playbookTitle = matchedPlaybook?.name ?? getPlaybookTitle(incident);
  const serviceName   = incident.service || incident.affectedSystem || "unknown-service";
  const stageLabel    = incident.lifecycleStep === "Resolved" ? "STAGE 6 · RESOLVED" : "STAGE 3 · ASSISTED EXECUTION";
  const versionLabel  = incident.environment || "runtime";
  const severityLabel = `${incident.severity || incident.priority || "P3"} ${incident.status || "ACTIVE"}`;

  const tags = [stageLabel, versionLabel, serviceName, severityLabel];

  const riskLevel = severityToRiskLevel(incident);
  const automationLevels = [
    { label: "playbook", value: String(matchedPlaybook?.automationLevel ?? 3), active: true  },
    { label: "policy",   value: "3",              active: true  },
    { label: "risk",     value: String(riskLevel), active: false },
  ];

  return (
    <div className="w-full p-2">
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">

        {/* Left — icon + title + tags */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <TriangleAlert className="h-3.5 w-3.5 text-black dark:text-zinc-400" />
          </div>
          <div className="space-y-2.5">
            <h2 className="text-[15px] font-semibold text-black dark:text-zinc-100 leading-snug">
              {playbookTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => cloneMutation.mutate()}
            disabled={cloneMutation.isPending || !matchedPlaybook}
            className="flex items-center gap-2 rounded-lg border border-zinc-500 dark:border-zinc-700 px-3 py-1.5 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <span className="text-zinc-400 dark:text-zinc-500">
              {cloneMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Copy className="h-3 w-3" />}
            </span>
            {cloneMsg || "Clone"}
          </button>
          <button
            onClick={() => dryRunMutation.mutate()}
            disabled={dryRunMutation.isPending || !matchedPlaybook}
            className="flex items-center gap-2 rounded-lg border border-zinc-500 dark:border-zinc-700 px-3 py-1.5 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <span className="text-zinc-400 dark:text-zinc-500">
              {dryRunMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            </span>
            {dryRunMutation.isPending ? "Running…" : dryRunMutation.isSuccess ? "Started ✓" : "Dry Run"}
          </button>
        </div>
      </div>

      {/* Automation level panel */}
      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[13px] font-medium text-black dark:text-zinc-200">
            Effective Automation Level · CP Enforced
          </p>
          <div className="space-y-1.5 text-right">
            <p className="text-[11px] font-medium text-black dark:text-zinc-400">Automation Stages</p>
            <div className="flex gap-1">
              <div className="h-1 w-10 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              <div className="h-1 w-10 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              <div className="h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[12px] text-black dark:text-zinc-500">
          <span>min(</span>
          {automationLevels.map(({ label, value }, i) => (
            <React.Fragment key={label}>
              <span className="rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 font-medium text-zinc-600 dark:text-zinc-300">
                {label}: {value}
              </span>
              {i < automationLevels.length - 1 && <span>,</span>}
            </React.Fragment>
          ))}
          <span>) =</span>
          <span className="rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 font-medium text-black dark:text-zinc-200">
            2 · PROPOSE
          </span>
        </div>
      </div>
    </div>
  );
}