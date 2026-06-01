"use client";

import React, { useEffect, useMemo, useState } from "react";
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

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type NodeStatus =
  | "HEALTHY"
  | "WARNING"
  | "CRITICAL"
  | "DEGRADED"
  | "STRESSED";

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
  if (severity === "P0" || severity === "P1") return "text-rose-400";
  if (severity === "P2") return "text-amber-400";
  return "text-emerald-400";
};

const resolveNodeStatus = (incident: IncidentDetailRecord): NodeStatus => {
  if (incident.status === "RESOLVED" || incident.status === "CLOSED") {
    return "HEALTHY";
  }

  if (incident.status === "INVESTIGATION") {
    return "STRESSED";
  }

  if (incident.status === "MITIGATED") {
    return "DEGRADED";
  }

  if (incident.severity === "P0" || incident.severity === "P1") {
    return "CRITICAL";
  }

  return "WARNING";
};

const SignalNode = ({ data }: { data: ServiceNodeData }) => {
  const statusColors: Record<NodeStatus, string> = {
    HEALTHY: "border-emerald-500/30 bg-emerald-950/20 text-emerald-400",
    WARNING: "border-amber-500/30 bg-amber-950/20 text-amber-400",
    CRITICAL: "border-rose-500/45 bg-rose-950/30 text-rose-400",
    DEGRADED: "border-orange-500/30 bg-orange-950/20 text-orange-400",
    STRESSED: "border-purple-500/30 bg-purple-950/20 text-purple-400",
  };

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-xl border backdrop-blur-md transition-all hover:shadow-2xl",
        statusColors[data.status]
      )}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-3 border-b border-white/5 p-3">
        <div className="rounded-lg bg-white/5 p-1.5">{data.icon}</div>
        <div>
          <div className="text-xs font-bold text-slate-100 leading-tight">
            {data.label}
          </div>
          <div className="text-[10px] font-mono uppercase tracking-wider opacity-50">
            {data.kind}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full shadow-sm",
              data.status === "HEALTHY" ? "bg-emerald-400" : "bg-current"
            )}
          />
          <span className="text-[10px] font-bold tracking-tighter">
            {data.status}
          </span>
        </div>
        {data.incidentId ? (
          <span className="text-[9px] font-mono opacity-80">
            {data.incidentId}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 divide-x divide-white/5 border-t border-white/5">
        {data.metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col items-center p-2">
            <span className="text-[8px] font-mono uppercase tracking-widest text-slate-500">
              {metric.label}
            </span>
            <span className={cn("text-xs font-bold", metric.color)}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
};

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
            color: "text-emerald-400",
          },
          {
            label: "STATUS",
            value: incident.status,
            color: "text-blue-400",
          },
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
            color: "text-amber-400",
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
            color: "text-blue-400",
          },
          {
            label: "COMMENTS",
            value: String(incident.commentsCount),
            color: "text-purple-400",
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
    style: { stroke: "#0ea5e9", strokeWidth: 2 },
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

function SignalGraphWorkspace({ incident }: { incident: IncidentDetailRecord }) {
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

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedNodeData = selectedNode?.data as ServiceNodeData | undefined;

  return (
    <div className="flex min-h-[760px] flex-col bg-dark text-slate-200">
      <div className="grid flex-1 gap-0 md:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="border-r border-white/10 bg-darkEzra/70 p-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Active Incident
            </p>
            <h2 className="mt-3 text-xl font-black text-white">
              {incident.ticketId}
            </h2>
            <p className="mt-2 text-sm text-slate-300">{incident.title}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-rose-500/30 bg-rose-500/5 px-3 py-1 text-[10px] font-bold uppercase text-rose-400">
                {incident.severity} / {incident.priority}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
                {incident.status}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Signals
              </p>
              <p className="mt-2 text-3xl font-black text-purple-400">
                {Math.max(alertFeed.length, incident.correlatedSignalIds.length || 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Comments
              </p>
              <p className="mt-2 text-3xl font-black text-emerald-400">
                {incident.commentsCount}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Live Alert Feed
            </h3>
            <div className="mt-4 space-y-3">
              {alertFeed.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                      {alert.level}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {alert.timestamp}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-100">
                    {shortText(alert.title, 88)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="relative min-h-[680px] bg-slate-950 dark:bg-grayscrubbe-950">
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
              color="#0f172a"
              gap={22}
              size={1}
              variant={BackgroundVariant.Dots}
            />
            <Controls className="!bg-slate-900 !border-slate-800 !fill-blue-400" />
          </ReactFlow>

          <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
            <div className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-400">
              {incident.ticketId} / {incident.service || "Incident"}
            </div>
            <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              {incident.environment || "runtime"} / {incident.region || "global"}
            </div>
          </div>
        </main>

        <aside className="border-l border-white/10 bg-darkEzra/70 p-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
                Node Detail
              </h3>
            </div>

            {selectedNodeData ? (
              <>
                <h4 className="mt-4 text-xl font-black text-white">
                  {selectedNodeData.label}
                </h4>
                <p className="mt-1 text-xs font-mono uppercase tracking-[0.16em] text-slate-500">
                  {selectedNodeData.kind} / {selectedNodeData.status}
                </p>

                <div className="mt-4 space-y-2">
                  {selectedNodeData.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                    >
                      <span className="text-[11px] font-mono text-slate-500">
                        {metric.label}
                      </span>
                      <span className={cn("text-sm font-semibold", metric.color)}>
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle size={16} />
              <h3 className="text-sm font-bold uppercase tracking-[0.18em]">
                Response Guidance
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm font-semibold text-rose-300">
                {incident.recommendedActions[0] ||
                  incident.aiAnalysis?.suggestion ||
                  "No automated remediation recommendation is available yet."}
              </div>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-left text-sm font-semibold text-blue-300"
              >
                <RefreshCcw size={14} />
                Review {incident.service || "service"} telemetry and recent change path
              </button>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-400">
                {shortText(
                  incident.techDescription ||
                    incident.description ||
                    "Technical context has not been captured for this incident yet.",
                  180
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-purple-400">
              <Database size={16} />
              <h3 className="text-sm font-bold uppercase tracking-[0.18em]">
                Shared Context
              </h3>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>
                Service: <span className="text-white">{incident.service || "N/A"}</span>
              </p>
              <p>
                Owner:{" "}
                <span className="text-white">
                  {incident.assignedToName ||
                    incident.incidentCommander ||
                    incident.assignedToEmail ||
                    "Unassigned"}
                </span>
              </p>
              <p>
                Source:{" "}
                <span className="text-white">
                  {incident.sourceType || incident.source || "Manual"}
                </span>
              </p>
            </div>
          </div>
        </aside>
      </div>

      <footer className="flex h-8 items-center justify-between border-t border-white/10 bg-slate-950/90 dark:bg-grayscrubbe-950/90 px-4 text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{incident.ticketId} graph hydrated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={10} className="text-blue-500" />
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
    <IncidentRouteShell title="Signal Graph">
      {(incident) => <SignalGraphWorkspace incident={incident} />}
    </IncidentRouteShell>
  );
}
