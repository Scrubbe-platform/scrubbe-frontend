"use client";
import React from "react";
import { ShieldCheck, Lightbulb, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

interface LogPayload {
  [key: string]: any;
}

interface LogEntryProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  time: string;
  payload?: LogPayload;
}

const iconForType = (type: string) => {
  if (type?.includes("policy")) return <ShieldCheck className="text-green" size={16} />;
  if (type?.includes("insight") || type?.includes("hypothesis")) return <Lightbulb className="text-yellow-400" size={16} />;
  return <Activity className="text-blue-400" size={16} />;
};

const DecisionLog: React.FC<{ incidentId?: string }> = ({ incidentId }) => {
  const { get } = useFetch();

  const { data, isLoading } = useQuery({
    queryKey: ["decisions-log", incidentId],
    queryFn: async () => {
      const url = incidentId
        ? `${endpoint.decisions.log}?incidentId=${incidentId}`
        : endpoint.decisions.log;
      const res = await get(url);
      if (res.success) return (res.data?.data?.decisions ?? res.data?.data ?? []) as any[];
      return [] as any[];
    },
  });

  const entries = data ?? [];

  return (
    <div className=" p-5 border border-IMSCyan/40 rounded-xl text-gray-700 dark:text-slate-300 bg-gradient-to-b from-IMSCyan/30 to-IMSCyan/10 dark:from-IMSCyan/20 dark:to-grayscrubbe-800 flex items-start justify-center">
      <div className="w-full ">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight mb-2">
            Decision Log
          </h2>
          <p className=" text-slate-300 font-medium">
            What happened and why (including human notes)
          </p>
          <p className="text-base text-slate-300">
            Timeline is derived from this log.
          </p>
        </div>

        {/* Entries Container */}
        <div className="bg-white dark:bg-grayscrubbe-800 border border-slate-400 rounded-2xl p-6 space-y-4 shadow-inner">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-slate-100 uppercase tracking-widest">
              Recent entries
            </h3>
            <span className="px-3 py-1 bg-white/5 dark:bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-gray-600 dark:text-slate-400">
              {isLoading ? "…" : `${entries.length} events`}
            </span>
          </div>

          {isLoading && (
            <p className="text-xs text-slate-500 animate-pulse">Loading decisions…</p>
          )}

          {!isLoading && entries.length === 0 && (
            <>
              <LogEntry
                icon={<ShieldCheck className="text-green" size={16} />}
                title="policy.evaluated"
                desc="Policy evaluated for incident."
                time="—"
                payload={{ autoActivate: false, humanGate: true, scope: "pr-only" }}
              />
              <LogEntry
                icon={<ShieldCheck className="text-green" size={16} />}
                title="policy.mode"
                desc="Policy mode set to standard."
                time="—"
              />
              <LogEntry
                icon={<ShieldCheck className="text-green" size={16} />}
                title="hypotheses.generated"
                desc="Generated top 3 likely causes (not final RCA)."
                time="—"
                payload={{ top: [{ title: "Competing refactors touching same module", conf: 0.72 }] }}
              />
            </>
          )}

          {!isLoading &&
            entries.map((entry: any, i: number) => (
              <LogEntry
                key={entry.id ?? i}
                icon={iconForType(entry.type ?? entry.action ?? "")}
                title={entry.type ?? entry.action ?? "event"}
                desc={entry.summary ?? entry.reason ?? entry.description ?? "Decision recorded."}
                time={entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString() : "—"}
                payload={entry.context ?? entry.metadata ?? undefined}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

const LogEntry: React.FC<LogEntryProps> = ({ icon, title, desc, time, payload }) => (
  <div className="border border-slate-800 rounded-xl p-4 bg-white dark:bg-grayscrubbe-800 hover:border-slate-700 transition-colors group">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-start gap-3">
        <div className="mt-1">{icon}</div>
        <div>
          <h4 className="text-sm font-black text-gray-900 dark:text-slate-100 font-mono tracking-tight">{title}</h4>
          <p className="text-[13px] text-gray-600 dark:text-slate-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <span className="text-[11px] font-medium text-slate-600 font-mono">{time}</span>
    </div>

    {payload && (
      <div className="mt-4 bg-white/80 dark:bg-grayscrubbe-800 rounded-lg p-4 border border-slate-800 font-mono text-[12px] text-gray-700 dark:text-slate-300 leading-relaxed overflow-x-auto shadow-inner">
        <pre>
          <code>{JSON.stringify(payload, null, 2)}</code>
        </pre>
      </div>
    )}
  </div>
);

export default DecisionLog;
