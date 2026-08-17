/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import moment from "moment";
import clsx from "clsx";
import { AlertCircle, CheckCircle, Clock, Filter } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

type Signal = {
  id: string;
  source: string;
  type: string;
  severity: string;
  status: string;
  summary: string;
  createdAt: string;
  acknowledgedAt?: string;
};

type SignalStats = {
  total: number;
  open: number;
  acknowledged: number;
  resolved: number;
};

const severityColors: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-600",
  HIGH: "bg-orange-100 text-orange-600",
  MEDIUM: "bg-yellow-100 text-yellow-600",
  LOW: "bg-blue-100 text-blue-600",
};

const statusIcons: Record<string, React.ReactNode> = {
  OPEN: <AlertCircle size={14} className="text-red-500" />,
  ACKNOWLEDGED: <Clock size={14} className="text-green-500" />,
  RESOLVED: <CheckCircle size={14} className="text-emerald-500" />,
  SUPPRESSED: <CheckCircle size={14} className="text-gray-500" />,
};

export default function ErrorLogs() {
  const { get } = useFetch();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: signals, isLoading } = useQuery<Signal[]>({
    queryKey: ["signals-list"],
    queryFn: async () => {
      const res = await get(endpoint.signals.list);
      if (res.success) {
        const items =
          res.data?.data?.signals ?? res.data?.data ?? res.data ?? [];
        return items as Signal[];
      }
      return [];
    },
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery<SignalStats>({
    queryKey: ["signals-stats"],
    queryFn: async () => {
      const res = await get(endpoint.signals.stats);
      if (res.success) return (res.data?.data ?? {}) as SignalStats;
      return { total: 0, open: 0, acknowledged: 0, resolved: 0 };
    },
    refetchOnWindowFocus: false,
  });

  const filtered =
    statusFilter === "ALL"
      ? signals ?? []
      : (signals ?? []).filter((s) => s.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total signals",
            value: stats?.total ?? 0,
            color: "text-black dark:text-white",
          },
          { label: "Open", value: stats?.open ?? 0, color: "text-red-500" },
          {
            label: "Acknowledged",
            value: stats?.acknowledged ?? 0,
            color: "text-green-400",
          },
          {
            label: "Resolved",
            value: stats?.resolved ?? 0,
            color: "text-emerald-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-black/10 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-dark"
          >
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              {s.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>
              {isLoading ? "—" : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Filter size={14} className="text-gray-500" />
        <span className="text-xs text-gray-500">Filter:</span>
        {["ALL", "OPEN", "ACKNOWLEDGED", "RESOLVED", "SUPPRESSED"].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={clsx(
              "text-xs px-3 py-1 rounded-lg border transition-colors",
              statusFilter === f
                ? "border-IMSCyan text-IMSCyan bg-IMSCyan/10"
                : "border-black/10 dark:border-white/10 text-gray-400 hover:border-black/30 dark:hover:border-white/30"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Signals table */}
      <div className="border border-black/10 dark:border-white/10 rounded-xl bg-white dark:bg-dark overflow-hidden">
        <div className="p-4 border-b border-black/10 dark:border-white/10">
          <h3 className="text-sm font-bold text-black dark:text-white">
            Ingestion signals & error log
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Inbound events from all connected sources. Errors and suppressed
            signals appear here.
          </p>
        </div>

        {isLoading && (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 bg-black/5 dark:bg-white/5 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="p-8">
            <EmptyState
              title="No signals found"
              description="Inbound events from your connected integrations will appear here."
            />
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            <div className="grid grid-cols-[120px_80px_100px_80px_1fr_140px] gap-4 px-4 py-2 text-[10px] text-gray-500 uppercase tracking-widest border-b border-black/5 dark:border-white/5">
              <span>Source</span>
              <span>Type</span>
              <span>Severity</span>
              <span>Status</span>
              <span>Summary</span>
              <span>Time</span>
            </div>
            {filtered.map((signal) => (
              <div
                key={signal.id}
                className="grid grid-cols-[120px_80px_100px_80px_1fr_140px] gap-4 px-4 py-3 items-center hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-sm"
              >
                <span className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate capitalize">
                  {signal.source?.toLowerCase() ?? "—"}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {signal.type ?? "—"}
                </span>
                <span>
                  <span
                    className={clsx(
                      "text-[10px] px-2 py-0.5 rounded font-medium",
                      severityColors[signal.severity] ??
                        "bg-gray-100 text-gray-500"
                    )}
                  >
                    {signal.severity ?? "—"}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  {statusIcons[signal.status] ?? null}
                  <span className="text-[10px] text-gray-400">
                    {signal.status}
                  </span>
                </span>
                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                  {signal.summary ?? "—"}
                </span>
                <span className="text-xs text-gray-500">
                  {moment(signal.createdAt).fromNow()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
