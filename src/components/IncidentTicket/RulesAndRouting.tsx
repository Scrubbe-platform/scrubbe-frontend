/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { AlertTriangle, GitBranch, Zap, ArrowRight, CheckCircle, Circle } from "lucide-react";

type FingerprintConfig = {
  dedupWindowSeconds?: number;
  thresholds?: Record<string, number>;
  routingRules?: Array<{
    id: string;
    name: string;
    source: string;
    condition: string;
    action: string;
    enabled: boolean;
  }>;
};

const defaultRules = [
  {
    id: "rule-1",
    name: "GitHub CI failure → P2 incident",
    source: "github",
    condition: "deployment_status == failure",
    action: "Create incident (priority: HIGH)",
    enabled: true,
  },
  {
    id: "rule-2",
    name: "GitLab pipeline failure → P2 incident",
    source: "gitlab",
    condition: "pipeline.status == failed",
    action: "Create incident (priority: HIGH)",
    enabled: true,
  },
  {
    id: "rule-3",
    name: "Kubernetes pod crash → P1 incident",
    source: "kubernetes",
    condition: "reason == CrashLoopBackOff",
    action: "Create incident (priority: CRITICAL)",
    enabled: true,
  },
  {
    id: "rule-4",
    name: "PagerDuty alert → auto-acknowledge",
    source: "pagerduty",
    condition: "event.type == trigger",
    action: "Create incident + acknowledge PD",
    enabled: true,
  },
  {
    id: "rule-5",
    name: "Prometheus alert → P2 incident",
    source: "prometheus",
    condition: "status == firing",
    action: "Create incident (priority: HIGH)",
    enabled: true,
  },
  {
    id: "rule-6",
    name: "Datadog monitor alert → incident",
    source: "datadog",
    condition: "alert_type == error",
    action: "Create incident (priority: MEDIUM)",
    enabled: false,
  },
];

const sourceColors: Record<string, string> = {
  github: "text-white bg-gray-800 border-gray-600",
  gitlab: "text-orange-400 bg-orange-900/20 border-orange-700",
  kubernetes: "text-blue-400 bg-blue-900/20 border-blue-700",
  pagerduty: "text-green-400 bg-green-900/20 border-green-700",
  prometheus: "text-red-400 bg-red-900/20 border-red-700",
  datadog: "text-purple-400 bg-purple-900/20 border-purple-700",
};

export default function RulesAndRouting() {
  const { get } = useFetch();
  const [rules, setRules] = useState(defaultRules);

  const { data: config } = useQuery<FingerprintConfig>({
    queryKey: ["fingerprint-config"],
    queryFn: async () => {
      const res = await get(endpoint.data_source.fingerprint_configuration);
      if (res.success) return res.data?.data ?? res.data ?? {};
      return {};
    },
    refetchOnWindowFocus: false,
  });

  const toggleRule = (id: string) => {
    setRules(prev =>
      prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const dedupWindow = config?.dedupWindowSeconds ?? 300;

  return (
    <div className="space-y-6">
      {/* Dedup / routing summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-white/10 rounded-xl p-4 bg-dark space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Dedup window</p>
          <p className="text-lg font-bold text-white">{dedupWindow}s</p>
          <p className="text-xs text-gray-400">Duplicate signals within this window are merged.</p>
        </div>
        <div className="border border-white/10 rounded-xl p-4 bg-dark space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Active rules</p>
          <p className="text-lg font-bold text-green">{rules.filter(r => r.enabled).length}</p>
          <p className="text-xs text-gray-400">of {rules.length} routing rules enabled</p>
        </div>
        <div className="border border-white/10 rounded-xl p-4 bg-dark space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Sources</p>
          <p className="text-lg font-bold text-white">6</p>
          <p className="text-xs text-gray-400">GitHub, GitLab, K8s, PagerDuty, Prometheus, Datadog</p>
        </div>
      </div>

      {/* Routing pipeline visual */}
      <div className="border border-white/10 rounded-xl p-6 bg-dark">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Signal routing pipeline</h3>
        <div className="flex items-center gap-3 flex-wrap">
          {["Ingest", "Normalise", "Deduplicate", "Fingerprint", "Route", "Create Incident"].map((step, i, arr) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-bold">
                <Zap size={12} />
                {step}
              </div>
              {i < arr.length - 1 && <ArrowRight size={14} className="text-gray-600" />}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          All inbound webhooks pass through this pipeline. Routing rules are applied at the <span className="text-white">Route</span> step based on source and condition.
        </p>
      </div>

      {/* Rules table */}
      <div className="border border-white/10 rounded-xl bg-dark overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-white">Routing rules</h3>
          <button className="text-xs text-IMSCyan border border-IMSCyan px-3 py-1 rounded-lg hover:bg-IMSCyan/10 transition-colors">
            + Add rule
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02]">
              <button onClick={() => toggleRule(rule.id)} className="shrink-0">
                {rule.enabled
                  ? <CheckCircle size={16} className="text-green" />
                  : <Circle size={16} className="text-gray-600" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{rule.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${sourceColors[rule.source] ?? "text-gray-400 bg-gray-900/20 border-gray-700"}`}>
                    {rule.source}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">{rule.condition}</span>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2 text-[10px] text-gray-400 border border-white/5 rounded px-2 py-1">
                <GitBranch size={10} />
                {rule.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook URLs */}
      <div className="border border-white/10 rounded-xl p-6 bg-dark space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Webhook endpoints</h3>
        <p className="text-xs text-gray-400">Point your source systems to these URLs. Include your Scrubbe API key in the <span className="font-mono text-white">X-API-Key</span> header.</p>
        <div className="space-y-2">
          {["github", "gitlab", "kubernetes", "pagerduty", "prometheus", "datadog", "webhook"].map(src => (
            <div key={src} className="flex items-center gap-3 bg-black/30 rounded-lg px-4 py-2">
              <span className="text-xs font-mono text-IMSCyan w-24 shrink-0">{src}</span>
              <span className="text-xs font-mono text-gray-400 flex-1 truncate">
                {`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.scrubbe.com"}/api/v1/ingestion/${src}`}
              </span>
              <span className="text-[10px] text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">POST</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
