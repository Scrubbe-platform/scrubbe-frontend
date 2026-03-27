"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  AlertCircle,
  Zap,
  Database,
  ShieldCheck,
  RefreshCcw,
  LayoutDashboard,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Clock,
  Activity,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RightPanel } from "./_module/component/RightPanel";

/** * Utility for Tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type NodeStatus =
  | "HEALTHY"
  | "WARNING"
  | "CRITICAL"
  | "DEGRADED"
  | "STRESSED"
  | "CRASHLOOP";

interface ServiceNodeData {
  label: string;
  kind: string;
  status: NodeStatus;
  metrics: { label: string; value: string; color: string }[];
  uptime?: string;
  incidentId?: string;
  icon: React.ReactNode;
}

// --- Custom Node Component ---
const SignalNode = ({ data }: { data: ServiceNodeData }) => {
  const statusColors = {
    HEALTHY: "border-emerald-500/30 bg-emerald-950/20 text-emerald-400",
    WARNING: "border-amber-500/30 bg-amber-950/20 text-amber-400",
    CRITICAL: "border-rose-500/45 bg-rose-950/30 text-rose-400 animate-pulse",
    DEGRADED: "border-orange-500/30 bg-orange-950/20 text-orange-400",
    STRESSED: "border-purple-500/30 bg-purple-950/20 text-purple-400",
    CRASHLOOP:
      "border-rose-600 bg-rose-950/40 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
  };

  return (
    <div
      className={cn(
        "min-w-[180px] rounded-xl border backdrop-blur-md transition-all hover:shadow-2xl",
        statusColors[data.status] || "border-slate-700 bg-slate-900"
      )}
    >
      <Handle type="target" position={Position.Top} />
      <div className="p-3 border-b border-white/5 flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-white/5">{data.icon}</div>
        <div>
          <div className="text-xs font-bold text-slate-100 leading-tight">
            {data.label}
          </div>
          <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider">
            {data.kind}
          </div>
        </div>
      </div>
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full shadow-sm",
              data.status === "HEALTHY" ? "bg-emerald-400" : "bg-current"
            )}
          />
          <span className="text-[10px] font-bold tracking-tighter">
            {data.status}
          </span>
        </div>
        {data.incidentId && (
          <span className="text-[9px] font-mono opacity-80">
            {data.incidentId}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 border-t border-white/5 divide-x divide-white/5">
        {data.metrics.map((m, i) => (
          <div key={i} className="p-2 flex flex-col items-center">
            <span className="text-[8px] uppercase text-slate-500 font-mono tracking-widest">
              {m.label}
            </span>
            <span className={cn("text-xs font-bold", m.color)}>{m.value}</span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
};

// --- Mock Data ---
const initialNodes: Node[] = [
  {
    id: "gateway",
    type: "signalNode",
    position: { x: 50, y: 150 },
    data: {
      label: "Gateway",
      kind: "INGRESS",
      status: "HEALTHY",
      metrics: [
        { label: "REQ/S", value: "1.2k", color: "text-blue-400" },
        { label: "P99", value: "45ms", color: "text-emerald-400" },
      ],
      icon: <ShieldCheck size={14} />,
    },
  },
  {
    id: "payment",
    type: "signalNode",
    position: { x: 300, y: 50 },
    data: {
      label: "Payment Service",
      kind: "MICROSERVICE",
      status: "CRITICAL",
      incidentId: "INC-#1298",
      metrics: [
        { label: "ERR RATE", value: "12%", color: "text-rose-400" },
        { label: "LATENCY", value: "120ms", color: "text-rose-400" },
      ],
      icon: <Zap size={14} />,
    },
  },
  {
    id: "db",
    type: "signalNode",
    position: { x: 550, y: 180 },
    data: {
      label: "PostgreSQL",
      kind: "DATABASE",
      status: "DEGRADED",
      incidentId: "INC-#1291",
      metrics: [
        { label: "CONN", value: "94%", color: "text-amber-400" },
        { label: "LATENCY", value: "350ms", color: "text-amber-400" },
      ],
      icon: <Database size={14} />,
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "gateway",
    target: "payment",
    label: "DEPENDS ON",
    animated: true,
    style: { stroke: "#f43f5e", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#f43f5e" },
  },
  {
    id: "e2-3",
    source: "payment",
    target: "db",
    label: "DB CALL",
    animated: true,
    style: { stroke: "#f59e0b", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" },
  },
];

// --- Main Component ---
export default function IncidentIntelligence() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const nodeTypes = useMemo(() => ({ signalNode: SignalNode }), []);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-dark text-slate-200 overflow-hidden font-sans">
      {/* Top Nav */}
      <nav className="h-14 border-b border-blue-500/10 bg-darkEzra flex items-center px-4 justify-between shrink-0 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-emerald-500 opacity-30" />

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Signal Graph
            </span>
          </div>

          <div className="flex gap-2">
            <div className="px-3 py-1.5 rounded bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 cursor-pointer hover:bg-rose-500/20 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-wider">
                INC-#1298 · PAYMENT API
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-48 bg-slate-900 border border-slate-800 rounded flex items-center px-3 gap-2 text-slate-500 cursor-pointer">
            <Search size={12} />
            <span className="text-[10px] font-mono">CMD + K</span>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 rounded bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 cursor-pointer hover:bg-rose-500/20 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-wider">
                P1-Live
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-blue-500/10 bg-darkEzra flex flex-col shrink-0 overflow-y-auto">
          <div className="grid grid-cols-2 border-b border-blue-500/10">
            <div className="p-4 border-r border-blue-500/10 hover:bg-white/5 cursor-pointer">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                Incidents
              </div>
              <div className="text-2xl font-bold text-rose-500">3</div>
            </div>
            <div className="p-4 hover:bg-white/5 cursor-pointer">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                Impact
              </div>
              <div className="text-2xl font-bold text-purple-500">4</div>
            </div>
          </div>

          <div className="p-4 bg-white/[0.02] border-b border-blue-500/10">
            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">
              Active Alerts
            </h3>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg border border-white/5 bg-slate-900/50 hover:border-blue-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono text-rose-400 font-bold">
                      P1 CRITICAL
                    </span>
                    <span className="text-[9px] text-slate-600">12m</span>
                  </div>
                  <div className="text-xs font-semibold group-hover:text-blue-400 transition-colors">
                    Payment API Failures
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Graph Area */}
        <main className="flex-1 relative bg-[#020408]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#02091B" gap={20} variant={undefined} />
            <Controls className="!bg-slate-900 !border-slate-800 !fill-blue-400" />

            <Panel
              position="top-left"
              className="bg-slate-950/80 p-2 rounded flex items-center gap-2"
            >
              <div className="w-fit flex items-center gap-2 px-2 py-1 border border-emerald-500 rounded-sm">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] text-emerald-500 font-mono font-bold tracking-widest uppercase">
                  P1 LIVE
                </span>
              </div>
              <p className="text-sm">Service Dependency Graph</p>
            </Panel>
          </ReactFlow>

          {/* Right Panel / Drawer (Overlay on Mobile/Overlaying Graph on desktop) */}
          {selectedNode && (
            <div className="absolute right-4 top-4 bottom-4 w-80 bg-slate-950/95 border border-blue-500/30 rounded-xl shadow-2xl z-50 flex flex-col backdrop-blur-xl animate-in fade-in slide-in-from-right-4">
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-blue-400" />
                  <span className="font-bold text-sm">Service Details</span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-1">
                    {selectedNode.data.label as string}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono tracking-tight">
                    System Status: {selectedNode.data.status as string}
                  </p>
                </div>

                <div className="space-y-4">
                  <section>
                    <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Suggested Remediation
                    </h4>
                    <div className="space-y-2">
                      <button className="w-full p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-3 hover:bg-rose-500/20 transition-all">
                        <RefreshCcw size={14} />
                        Rollback to v2.4.0
                      </button>
                      <button className="w-full p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold flex items-center gap-3 hover:bg-blue-500/20 transition-all">
                        <LayoutDashboard size={14} />
                        Open Grafana Dashboard
                      </button>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Recent Logs
                    </h4>
                    <div className="space-y-2 font-mono">
                      <div className="p-2 bg-black/40 rounded border-l-2 border-rose-500 text-[10px]">
                        <span className="text-slate-500">12:44:02</span>{" "}
                        NullPointerException at PaymentProcessor.java:247
                      </div>
                      <div className="p-2 bg-black/40 rounded border-l-2 border-amber-500 text-[10px]">
                        <span className="text-slate-500">12:43:58</span> Latency
                        threshold exceeded (150ms)
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </main>

        <RightPanel />
      </div>

      {/* Footer Status Bar */}
      <footer className="h-7 bg-[#060b12] border-t border-blue-500/10 px-4 flex items-center justify-between shrink-0 text-[10px] font-mono text-slate-500">
        <div className="flex gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Neo4j Connected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={10} className="text-blue-500" />
            <span>11 nodes · 14 edges</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={10} />
          <span>{new Date().toISOString()}</span>
        </div>
      </footer>
    </div>
  );
}
