"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Activity,
  AlertTriangle,
  Database,
  RefreshCcw,
  ShieldCheck,
  UserRound,
  Zap,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import IncidentRouteShell from "@/components/IMS/incident/IncidentRouteShell";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import IncidentOverview from "@/components/IMS/incident/NewIncidentList";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type NodeStatus = "HEALTHY" | "WARNING" | "CRITICAL" | "DEGRADED" | "STRESSED";

interface ServiceNodeData {
  label: string;
  kind: string;
  status: NodeStatus;
  incidentId?: string;
  metrics: { label: string; value: string; color: string }[];
  icon: React.ReactNode;
}

const shortText = (value: string, max = 120) =>
  value.length > max ? `${value.slice(0, max).trim()}...` : value;

const severityColor = (severity?: string) => {
  if (severity === "P0" || severity === "P1") return "text-rose-500";
  if (severity === "P2") return "text-amber-500";
  return "text-emerald-500";
};

const resolveNodeStatus = (incident: IncidentDetailRecord): NodeStatus => {
  if (incident.status === "RESOLVED" || incident.status === "CLOSED")
    return "HEALTHY";
  if (incident.status === "INVESTIGATION") return "STRESSED";
  if (incident.status === "MITIGATED") return "DEGRADED";
  if (incident.severity === "P0" || incident.severity === "P1")
    return "CRITICAL";
  return "WARNING";
};

// ── Node styles ──────────────────────────────────────────────────

const nodeStatus: Record<
  NodeStatus,
  { ring: string; dot: string; label: string }
> = {
  HEALTHY: {
    ring: "border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-emerald-950/20",
    dot: "bg-emerald-400",
    label: "text-emerald-600 dark:text-emerald-400",
  },
  WARNING: {
    ring: "border-amber-200 dark:border-amber-500/30 bg-white dark:bg-amber-950/20",
    dot: "bg-amber-400",
    label: "text-amber-600 dark:text-amber-400",
  },
  CRITICAL: {
    ring: "border-rose-200 dark:border-rose-500/40 bg-white dark:bg-rose-950/20",
    dot: "bg-rose-400",
    label: "text-rose-600 dark:text-rose-400",
  },
  DEGRADED: {
    ring: "border-orange-200 dark:border-orange-500/30 bg-white dark:bg-orange-950/20",
    dot: "bg-orange-400",
    label: "text-orange-600 dark:text-orange-400",
  },
  STRESSED: {
    ring: "border-purple-200 dark:border-purple-500/30 bg-white dark:bg-purple-950/20",
    dot: "bg-purple-400",
    label: "text-purple-600 dark:text-purple-400",
  },
};

// ── Flow node ────────────────────────────────────────────────────

const SignalNode = ({ data }: { data: ServiceNodeData }) => {
  const s = nodeStatus[data.status];
  return (
    <div
      className={cn(
        "min-w-[200px] rounded-xl border shadow-sm transition-shadow hover:shadow-md",
        s.ring,
      )}
    >
      <Handle type="target" position={Position.Top} />

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-zinc-100 dark:border-white/5">
        <div className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-white/5 flex items-center justify-center shrink-0 text-black dark:text-zinc-400">
          {data.icon}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-black dark:text-zinc-100 leading-tight truncate">
            {data.label}
          </p>
          <p className="text-[9px] font-mono uppercase tracking-wider text-black dark:text-zinc-500">
            {data.kind}
          </p>
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
          <span
            className={cn("text-[10px] font-semibold tracking-wide", s.label)}
          >
            {data.status}
          </span>
        </div>
        {data.incidentId && (
          <span className="text-[9px] font-mono text-black dark:text-zinc-500">
            {data.incidentId}
          </span>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 divide-x divide-zinc-100 dark:divide-white/5 border-t border-zinc-100 dark:border-white/5">
        {data.metrics.map((m) => (
          <div key={m.label} className="flex flex-col items-center py-2 px-1">
            <span className="text-[8px] font-mono uppercase tracking-widest text-black dark:text-zinc-500 mb-0.5">
              {m.label}
            </span>
            <span className={cn("text-[11px] font-bold", m.color)}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
};

// ── Graph data builders ──────────────────────────────────────────

const buildSignalNodes = (incident: IncidentDetailRecord): Node[] => {
  const serviceStatus = resolveNodeStatus(incident);
  return [
    {
      id: "source",
      type: "signalNode",
      position: { x: 40, y: 190 },
      data: {
        label: incident.sourceType || "Manual raise",
        kind: "SIGNAL SOURCE",
        status:
          incident.status === "RESOLVED" || incident.status === "CLOSED"
            ? "HEALTHY"
            : "WARNING",
        incidentId: incident.ticketId,
        metrics: [
          {
            label: "DETECTED",
            value: incident.elapsedLabel,
            color: "text-emerald-500",
          },
          { label: "STATUS", value: incident.status, color: "text-blue-500" },
        ],
        icon: <ShieldCheck size={14} />,
      },
    },
    {
      id: "service",
      type: "signalNode",
      position: { x: 330, y: 80 },
      data: {
        label: incident.service || "Primary Service",
        kind: "SERVICE",
        status: serviceStatus,
        incidentId: incident.ticketId,
        metrics: [
          {
            label: "SEVERITY",
            value: incident.severity,
            color: severityColor(incident.severity),
          },
          {
            label: "REGION",
            value: incident.region || "GLOBAL",
            color: "text-amber-500",
          },
        ],
        icon: <Zap size={14} />,
      },
    },
    {
      id: "response",
      type: "signalNode",
      position: { x: 620, y: 200 },
      data: {
        label:
          incident.assignedToName ||
          incident.incidentCommander ||
          incident.assignedToEmail ||
          "Response owner",
        kind: "OWNERSHIP",
        status:
          incident.assignedToName ||
          incident.assignedToEmail ||
          incident.incidentCommander
            ? "HEALTHY"
            : "WARNING",
        incidentId: incident.environment || incident.ticketId,
        metrics: [
          {
            label: "ENV",
            value: incident.environment || "N/A",
            color: "text-blue-500",
          },
          {
            label: "COMMENTS",
            value: String(incident.commentsCount),
            color: "text-purple-500",
          },
        ],
        icon: <UserRound size={14} />,
      },
    },
  ];
};

const buildSignalEdges = (incident: IncidentDetailRecord): Edge[] => [
  {
    id: `${incident.id}-source-service`,
    source: "source",
    target: "service",
    label: "TRIGGERED",
    animated: true,
    style: { stroke: "#0ea5e9", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#0ea5e9" },
  },
  {
    id: `${incident.id}-service-response`,
    source: "service",
    target: "response",
    label: "OWNED BY",
    animated: true,
    style: {
      stroke:
        incident.status === "RESOLVED" || incident.status === "CLOSED"
          ? "#10b981"
          : "#f59e0b",
      strokeWidth: 1.5,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color:
        incident.status === "RESOLVED" || incident.status === "CLOSED"
          ? "#10b981"
          : "#f59e0b",
    },
  },
];

const buildAlertFeed = (incident: IncidentDetailRecord) => [
  {
    id: "identity",
    level: `${incident.severity} ${incident.status}`,
    title: incident.title || incident.ticketId,
    timestamp: incident.elapsedLabel,
  },
  {
    id: "impact",
    level: incident.service || "Impact",
    title:
      incident.impactSummary ||
      incident.description ||
      "Impact details are still being collected.",
    timestamp: incident.region || "live",
  },
  {
    id: "response",
    level: incident.sourceType || "Response",
    title:
      incident.recommendedActions[0] ||
      incident.aiAnalysis?.suggestion ||
      "No automated remediation recommendation yet.",
    timestamp: incident.environment || "runtime",
  },
];

// ── Sidebar section label ────────────────────────────────────────

const SideLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-3">
    {children}
  </p>
);

// ── Main workspace ───────────────────────────────────────────────

function SignalGraphWorkspace({
  incident,
}: {
  incident: IncidentDetailRecord;
}) {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("service");

  const alertFeed = useMemo(() => buildAlertFeed(incident), [incident]);
  const nodeTypes = useMemo(() => ({ signalNode: SignalNode }), []);

  useEffect(() => {
    setNodes(buildSignalNodes(incident));
    setEdges(buildSignalEdges(incident));
    setSelectedNodeId("service");
  }, [incident, setEdges, setNodes]);

  const selectedNodeData = (nodes.find((n) => n.id === selectedNodeId)?.data ??
    null) as ServiceNodeData | null;

  return (
    <div className="flex min-h-[760px] flex-col bg-white dark:bg-zinc-950 text-black dark:text-zinc-200">
      <div className="grid flex-1 grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)_300px]">
        {/* ── Left sidebar ── */}
        <aside className="border-r border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-5 overflow-y-auto">
          {/* Incident card */}
          <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 p-4 mb-6">
            <SideLabel>Active Incident</SideLabel>
            <p className="text-[16px] font-bold text-black dark:text-white mb-1">
              {incident.ticketId}
            </p>
            <p className="text-[13px] text-black dark:text-zinc-400 leading-snug mb-4">
              {incident.title}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/5">
                {incident.severity} / {incident.priority}
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold border border-zinc-500 dark:border-zinc-700 text-black dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800">
                {incident.status}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {[
              {
                label: "Signals",
                value: Math.max(
                  alertFeed.length,
                  incident.correlatedSignalIds.length || 0,
                ),
                color: "text-purple-600 dark:text-purple-400",
              },
              {
                label: "Comments",
                value: incident.commentsCount,
                color: "text-emerald-600 dark:text-emerald-400",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 p-3.5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-1">
                  {s.label}
                </p>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Alert feed */}
          <SideLabel>Live Alert Feed</SideLabel>
          <div className="flex flex-col gap-2">
            {alertFeed.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-500 dark:text-rose-400">
                    {alert.level}
                  </span>
                  <span className="text-[10px] font-mono text-black dark:text-zinc-500 shrink-0">
                    {alert.timestamp}
                  </span>
                </div>
                <p className="text-[12px] font-medium text-black dark:text-zinc-200 leading-snug">
                  {shortText(alert.title, 88)}
                </p>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Canvas ── */}
        <main className="relative min-h-[480px] bg-zinc-50 dark:bg-zinc-950">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            fitView
          >
            <Background
              color="#e4e4e7"
              gap={22}
              size={1}
              variant={BackgroundVariant.Dots}
              className="dark:[--bg-color:#18181b]"
            />
            <Controls className="!bg-white dark:!bg-zinc-900 !border-zinc-200 dark:!border-zinc-700 !shadow-sm" />
          </ReactFlow>

          {/* Floating badges */}
          <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-rose-200 dark:border-rose-500/30 bg-white/90 dark:bg-rose-500/10 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
              {incident.ticketId} / {incident.service || "Incident"}
            </span>
            <span className="rounded-full border border-zinc-500 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-black dark:text-zinc-300">
              {incident.environment || "runtime"} /{" "}
              {incident.region || "global"}
            </span>
          </div>
        </main>

        {/* ── Right sidebar ── */}
        <aside className="border-l border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-5 overflow-y-auto">
          {/* Node detail */}
          <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 p-4 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-sky-500" />
              <SideLabel>Node Detail</SideLabel>
            </div>

            {selectedNodeData ? (
              <>
                <p className="text-[16px] font-bold text-black dark:text-white mb-0.5">
                  {selectedNodeData.label}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-black dark:text-zinc-500 mb-4">
                  {selectedNodeData.kind} / {selectedNodeData.status}
                </p>
                <div className="flex flex-col gap-2">
                  {selectedNodeData.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center justify-between rounded-lg border border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2"
                    >
                      <span className="text-[11px] font-mono text-black dark:text-zinc-500">
                        {m.label}
                      </span>
                      <span
                        className={cn("text-[12px] font-semibold", m.color)}
                      >
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[13px] text-black dark:text-zinc-500">
                Click a node to inspect it.
              </p>
            )}
          </div>

          {/* Response guidance */}
          <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 p-4 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={14} className="text-amber-500" />
              <SideLabel>Response Guidance</SideLabel>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="rounded-lg border border-rose-100 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-3 text-[13px] font-medium text-rose-700 dark:text-rose-300 leading-snug">
                {incident.recommendedActions[0] ||
                  incident.aiAnalysis?.suggestion ||
                  "No automated remediation recommendation yet."}
              </div>
              <button
                type="button"
                onClick={() => router.push(`/incident/incident-delivery?id=${incident.id}`)}
                className="flex items-center gap-2 rounded-lg border border-sky-100 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/10 p-3 text-left text-[13px] font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-500/15 transition-colors"
              >
                <RefreshCcw size={13} />
                Review {incident.service || "service"} telemetry and recent
                change path
              </button>
              <div className="rounded-lg border border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-3 text-[12px] text-black dark:text-zinc-400 leading-relaxed">
                {shortText(
                  incident.techDescription ||
                    incident.description ||
                    "Technical context has not been captured yet.",
                  180,
                )}
              </div>
            </div>
          </div>

          {/* Shared context */}
          <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Database size={14} className="text-purple-500" />
              <SideLabel>Shared Context</SideLabel>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Service", value: incident.service || "N/A" },
                {
                  label: "Owner",
                  value:
                    incident.assignedToName ||
                    incident.incidentCommander ||
                    incident.assignedToEmail ||
                    "Unassigned",
                },
                {
                  label: "Source",
                  value: incident.sourceType || incident.source || "Manual",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-[11px] text-black dark:text-zinc-500">
                    {row.label}
                  </span>
                  <span className="text-[12px] font-medium text-black dark:text-zinc-200 truncate max-w-[140px] text-right">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Footer ── */}
      <footer className="flex items-center justify-between h-8 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-5 text-[10px] font-mono text-black dark:text-zinc-500">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{incident.ticketId} graph hydrated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={10} className="text-sky-400" />
            <span>
              {nodes.length} nodes / {edges.length} edges
            </span>
          </div>
        </div>
        <span>{new Date().toISOString()}</span>
      </footer>
    </div>
  );
}

export default function SignalGraphPage() {
  return (
    <IncidentOverview tabs="signal-graph">
      <IncidentRouteShell title="Signal Graph">
        {(incident) => <SignalGraphWorkspace incident={incident} />}
      </IncidentRouteShell>
    </IncidentOverview>
  );
}
