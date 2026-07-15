"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  BarChart3,
  Check,
  Clock,
  FileText,
  Lightbulb,
  Lock,
  RefreshCcw,
  Sparkles,
  X,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import IncidentRouteShell from "@/components/IMS/incident/IncidentRouteShell";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import IncidentOverview from "@/components/IMS/incident/NewIncidentList";
import Header from "@/components/IMS/DashboardHeader";
import Button from "@/components/ui/Button1";
import toast from "react-hot-toast";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Reusable modal button ────────────────────────────────────────

function ModalBtn({
  children,
  primary,
  onClick,
}: {
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-semibold transition-colors",
        primary
          ? "bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 shadow-sm shadow-emerald-500/30 hover:brightness-105"
          : "shadow-sm shadow-light bg-white text-zinc-600 hover:bg-slate-50",
      )}
    >
      {children}
    </button>
  );
}

const shortText = (value: string, max = 120) =>
  value.length > max ? `${value.slice(0, max).trim()}...` : value;

const severityColor = (severity?: string) => {
  if (severity === "P0" || severity === "P1") return "text-rose-500";
  if (severity === "P2") return "text-amber-500";
  return "text-emerald-500";
};

const fmtTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "—";
  }
};

const fmtDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

// ── Node types (from blueprint) ───────────────────────────────────

type GraphNodeType = "root" | "service" | "infra" | "user" | "event" | "change";

interface GraphNodeData {
  label: string;
  sub: string;
  kind: string;
  nodeType: GraphNodeType;
  sev: string;
  metrics: { label: string; value: string; pct: number; color: string }[];
}

const typeStyles: Record<
  GraphNodeType,
  { stripe: string; badge: string; badgeText: string }
> = {
  root: {
    stripe: "bg-rose-500",
    badge: "bg-rose-50",
    badgeText: "text-rose-600",
  },
  service: {
    stripe: "bg-purple-500",
    badge: "bg-purple-50",
    badgeText: "text-purple-600",
  },
  infra: {
    stripe: "bg-blue-500",
    badge: "bg-blue-50",
    badgeText: "text-blue-600",
  },
  user: {
    stripe: "bg-pink-500",
    badge: "bg-pink-50",
    badgeText: "text-pink-600",
  },
  event: {
    stripe: "bg-zinc-400",
    badge: "bg-zinc-100",
    badgeText: "text-zinc-600",
  },
  change: {
    stripe: "bg-amber-500",
    badge: "bg-amber-50",
    badgeText: "text-amber-700",
  },
};

const sevBadgeStyle: Record<string, string> = {
  Critical: "bg-rose-50 text-rose-600",
  Warning: "bg-amber-50 text-amber-600",
  Info: "bg-zinc-100 text-zinc-500",
};

// ── Flow node (matching the blueprint design) ────────────────────

const SignalNode = ({ data }: { data: GraphNodeData }) => {
  const t = typeStyles[data.nodeType];
  return (
    <div
      className="relative bg-white rounded-xl shadow-sm shadow-light shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
      style={{ minWidth: 160 }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-zinc-300 !border-white"
      />

      {/* Left color stripe */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
          t.stripe,
        )}
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5 pl-4">
        <div
          className={cn(
            "w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0",
            t.badge,
            t.badgeText,
          )}
        >
          <span className="text-[9px] font-bold">
            {data.nodeType === "root"
              ? "RC"
              : data.nodeType === "service"
                ? "SV"
                : data.nodeType === "infra"
                  ? "IN"
                  : data.nodeType === "user"
                    ? "US"
                    : data.nodeType === "event"
                      ? "EV"
                      : "CF"}
          </span>
        </div>
        <span className="text-[12px] font-bold text-zinc-900 leading-tight truncate">
          {data.label}
        </span>
      </div>

      {/* Sub + severity */}
      <div className="px-3 pb-2 pl-4">
        <p className="text-[11px] text-zinc-500 font-medium leading-snug">
          {data.sub}
        </p>
        {data.sev && (
          <span
            className={cn(
              "inline-block mt-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded",
              sevBadgeStyle[data.sev] || "bg-zinc-100 text-zinc-500",
            )}
          >
            {data.sev}
          </span>
        )}
      </div>

      {/* Metrics */}
      {data.metrics.length > 0 && (
        <div className="border-t border-zinc-100 px-3 py-2 pl-4 space-y-1.5">
          {data.metrics.slice(0, 3).map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-[9px] mb-0.5">
                <span className="font-mono uppercase tracking-wider text-zinc-400">
                  {m.label}
                </span>
                <span className="font-bold text-zinc-700">{m.value}</span>
              </div>
              <div className="h-[3px] rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${m.pct}%`, background: m.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-zinc-300 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-2 !h-2 !bg-zinc-300 !border-white"
      />
    </div>
  );
};

// ── Graph data builders (full 10-node blueprint graph) ───────────

const buildSignalNodes = (incident: IncidentDetailRecord): Node[] => {
  const svc = incident.service || "Primary Service";
  const sev = incident.severity;
  const isCrit = sev === "P0" || sev === "P1";

  return [
    {
      id: "deploy",
      type: "signalNode",
      position: { x: 0, y: 226 },
      data: {
        label: "Deployment",
        sub: `${incident.ticketId} · service rollout`,
        kind: "Deployment / CI-CD",
        nodeType: "event",
        sev: "Info",
        metrics: [
          {
            label: "Build",
            value: incident.ticketId,
            pct: 0,
            color: "#94A3B8",
          },
          { label: "Rollout", value: "100%", pct: 100, color: "#02DD82" },
        ],
      },
    },
    {
      id: "config",
      type: "signalNode",
      position: { x: 210, y: 226 },
      data: {
        label: "Config change",
        sub: incident.reason || "Configuration modified",
        kind: "Configuration",
        nodeType: "change",
        sev: "Warning",
        metrics: [
          { label: "Applied to", value: "6 pods", pct: 60, color: "#F59E0B" },
          { label: "Reverted", value: "Yes", pct: 100, color: "#02DD82" },
        ],
      },
    },
    {
      id: "root",
      type: "signalNode",
      position: { x: 430, y: 218 },
      data: {
        label: incident.category || "Root Cause",
        sub:
          incident.impactSummary || incident.description || "Signal saturated",
        kind: "Infrastructure",
        nodeType: "root",
        sev: "Critical",
        metrics: [
          {
            label: "Confidence",
            value: `${incident.score || 92}%`,
            pct: incident.score || 92,
            color: "#EF4444",
          },
          { label: "Errors", value: "1,287", pct: 82, color: "#EF4444" },
          {
            label: "Duration",
            value: incident.elapsedLabel,
            pct: 70,
            color: "#F59E0B",
          },
        ],
      },
    },
    {
      id: "checkout",
      type: "signalNode",
      position: { x: 680, y: 60 },
      data: {
        label: svc,
        sub: `Error rate ↑ ${isCrit ? "68" : "34"}%`,
        kind: "Service",
        nodeType: "service",
        sev: isCrit ? "Critical" : "Warning",
        metrics: [
          {
            label: "Error rate",
            value: isCrit ? "68%" : "34%",
            pct: isCrit ? 68 : 34,
            color: "#A855F7",
          },
          {
            label: "p95 latency",
            value: isCrit ? "2.1s" : "1.2s",
            pct: isCrit ? 84 : 48,
            color: "#A855F7",
          },
        ],
      },
    },
    {
      id: "payment",
      type: "signalNode",
      position: { x: 920, y: 60 },
      data: {
        label: "Payment-service",
        sub: `Failure spike ↑ 52%`,
        kind: "Service",
        nodeType: "service",
        sev: "Critical",
        metrics: [
          { label: "Failure rate", value: "52%", pct: 52, color: "#A855F7" },
          { label: "Retry loops", value: "2,113", pct: 64, color: "#F59E0B" },
        ],
      },
    },
    {
      id: "auth",
      type: "signalNode",
      position: { x: 680, y: 220 },
      data: {
        label: "Auth-service",
        sub: "Latency ↑ 1200ms",
        kind: "Service",
        nodeType: "service",
        sev: "Warning",
        metrics: [
          {
            label: "Added latency",
            value: "1200ms",
            pct: 80,
            color: "#F59E0B",
          },
          { label: "Token timeouts", value: "688", pct: 55, color: "#F59E0B" },
        ],
      },
    },
    {
      id: "session",
      type: "signalNode",
      position: { x: 920, y: 220 },
      data: {
        label: "Session-service",
        sub: "Latency ↑ 950ms",
        kind: "Service",
        nodeType: "service",
        sev: "Warning",
        metrics: [
          { label: "Added latency", value: "950ms", pct: 63, color: "#F59E0B" },
          { label: "Dropped", value: "214", pct: 30, color: "#F59E0B" },
        ],
      },
    },
    {
      id: "dbserver",
      type: "signalNode",
      position: { x: 650, y: 400 },
      data: {
        label: "Database server",
        sub: "Connections 95%",
        kind: "Infrastructure / Host",
        nodeType: "infra",
        sev: "Critical",
        metrics: [
          { label: "Conn usage", value: "95%", pct: 95, color: "#3B82F6" },
          { label: "Active queries", value: "612", pct: 78, color: "#3B82F6" },
        ],
      },
    },
    {
      id: "cpu",
      type: "signalNode",
      position: { x: 860, y: 400 },
      data: {
        label: "CPU",
        sub: "Utilisation 87%",
        kind: "Infrastructure / Compute",
        nodeType: "infra",
        sev: "Warning",
        metrics: [
          { label: "CPU", value: "87%", pct: 87, color: "#3B82F6" },
          { label: "Run queue", value: "6.4", pct: 64, color: "#3B82F6" },
        ],
      },
    },
    {
      id: "users",
      type: "signalNode",
      position: { x: 1120, y: 180 },
      data: {
        label: "Customers impacted",
        sub: "5,243 users",
        kind: "Business / User impact",
        nodeType: "user",
        sev: "Critical",
        metrics: [
          { label: "Users", value: "5,243", pct: 90, color: "#EC4899" },
          { label: "Failed txns", value: "3,118", pct: 70, color: "#EC4899" },
        ],
      },
    },
  ];
};

const buildSignalEdges = (_incident: IncidentDetailRecord): Edge[] => [
  {
    id: "e-deploy-config",
    source: "deploy",
    target: "config",
    sourceHandle: "right",
    label: "triggers",
    animated: true,
    style: { stroke: "#EF4444", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
  },
  {
    id: "e-config-root",
    source: "config",
    target: "root",
    sourceHandle: "right",
    label: "causes",
    animated: true,
    style: { stroke: "#EF4444", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
  },
  {
    id: "e-root-checkout",
    source: "root",
    target: "checkout",
    sourceHandle: "right",
    label: "r .98",
    animated: true,
    style: { stroke: "#EF4444", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
  },
  {
    id: "e-checkout-payment",
    source: "checkout",
    target: "payment",
    sourceHandle: "right",
    label: "r .94",
    animated: true,
    style: { stroke: "#EF4444", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
  },
  {
    id: "e-root-auth",
    source: "root",
    target: "auth",
    sourceHandle: "right",
    label: "r .91",
    animated: true,
    style: { stroke: "#EF4444", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
  },
  {
    id: "e-auth-session",
    source: "auth",
    target: "session",
    sourceHandle: "right",
    label: "r .86",
    style: { stroke: "#F59E0B", strokeWidth: 2, strokeDasharray: "7 6" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#F59E0B" },
  },
  {
    id: "e-root-db",
    source: "root",
    target: "dbserver",
    sourceHandle: "bottom",
    label: "r .97",
    style: { stroke: "#F59E0B", strokeWidth: 2, strokeDasharray: "7 6" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#F59E0B" },
  },
  {
    id: "e-db-cpu",
    source: "dbserver",
    target: "cpu",
    sourceHandle: "right",
    style: { stroke: "#94A3B8", strokeWidth: 1.5, strokeDasharray: "2 7" },
  },
  {
    id: "e-payment-users",
    source: "payment",
    target: "users",
    sourceHandle: "right",
    label: "impact",
    animated: true,
    style: { stroke: "#EF4444", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
  },
  {
    id: "e-session-users",
    source: "session",
    target: "users",
    sourceHandle: "right",
    style: { stroke: "#F59E0B", strokeWidth: 1.5, strokeDasharray: "7 6" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#F59E0B" },
  },
];

// ── Timeline events (from blueprint) ─────────────────────────────

interface TimelineEvent {
  time: string;
  nodeId: string;
  label: string;
  tag: string;
  tagColor: string;
}

const buildTimeline = (incident: IncidentDetailRecord): TimelineEvent[] => [
  {
    time: "20:25",
    nodeId: "deploy",
    label: `Deployment started (${incident.ticketId})`,
    tag: "Deployment",
    tagColor: "#64748b",
  },
  {
    time: "20:30",
    nodeId: "config",
    label: incident.reason || "Config change applied",
    tag: "Change",
    tagColor: "#D97706",
  },
  {
    time: "20:32",
    nodeId: "root",
    label: incident.category || "Root cause signal detected",
    tag: "Infra",
    tagColor: "#EF4444",
  },
  {
    time: "20:34",
    nodeId: "checkout",
    label: `${incident.service || "Service"} errors begin`,
    tag: "Service",
    tagColor: "#A855F7",
  },
  {
    time: "20:36",
    nodeId: "payment",
    label: "Cascade across payment & auth services",
    tag: "Service",
    tagColor: "#A855F7",
  },
  {
    time: "20:41",
    nodeId: "users",
    label: "Customer impact detected (5,243 users)",
    tag: "Impact",
    tagColor: "#EC4899",
  },
  {
    time: "20:42",
    nodeId: "root",
    label: "Mitigation triggered — config reverted",
    tag: "Action",
    tagColor: "#3B82F6",
  },
  {
    time: "20:45",
    nodeId: "users",
    label: "System stabilised",
    tag: "Recovery",
    tagColor: "#02DD82",
  },
];

// ── Build audit trail from incident data ─────────────────────────

interface AuditEntry {
  time: string;
  actor: string;
  isEzra: boolean;
  event: string;
  ref: string;
}

const buildAuditTrail = (incident: IncidentDetailRecord): AuditEntry[] => {
  const entries: AuditEntry[] = [];
  entries.push({
    time: fmtTime(incident.createdAt),
    actor: "System",
    isEzra: false,
    event: `State → DETECTED — incident ${incident.ticketId} raised`,
    ref: `audit:txn · ${incident.source || "signal"}`,
  });
  if (incident.assignedToName || incident.incidentCommander) {
    entries.push({
      time: fmtTime(incident.createdAt),
      actor: incident.assignedToName || incident.incidentCommander || "System",
      isEzra: false,
      event: `State → ACKNOWLEDGED — assigned to ${incident.assignedToName || incident.incidentCommander}`,
      ref: `audit:txn · assignment`,
    });
  }
  if (incident.aiAnalysis?.suggestion) {
    entries.push({
      time: fmtTime(incident.updatedAt),
      actor: "Ezra",
      isEzra: true,
      event: `State → INVESTIGATING — auto-correlation started across signal sources`,
      ref: `audit:txn · run RR-${incident.ticketId}`,
    });
  }
  if (incident.category || incident.subCategory) {
    entries.push({
      time: fmtTime(incident.updatedAt),
      actor: "Ezra",
      isEzra: true,
      event: `Root cause IDENTIFIED — ${incident.category || "analysis complete"} · ${incident.subCategory || ""}`,
      ref: `audit:txn · confidence ${incident.score || "—"}%`,
    });
  }
  if (
    incident.status === "MITIGATED" ||
    incident.status === "RESOLVED" ||
    incident.status === "CLOSED"
  ) {
    entries.push({
      time: fmtTime(incident.updatedAt),
      actor: incident.assignedToName || "System",
      isEzra: false,
      event: `State → ${incident.status}`,
      ref: `audit:txn · lifecycle`,
    });
  }
  entries.push({
    time: fmtTime(incident.updatedAt),
    actor: "System",
    isEzra: false,
    event: `Latest state: ${incident.status} — ${incident.lifecycleStep || "active"}`,
    ref: `audit:txn · ${incident.ticketId}`,
  });
  return entries;
};

// ── Severity pill styles ─────────────────────────────────────────

const sevPill: Record<string, string> = {
  P0: "bg-red-50 text-red-600 border-red-200",
  P1: "bg-red-50 text-red-600 border-red-200",
  P2: "bg-amber-50 text-amber-600 border-amber-200",
  P3: "bg-zinc-50 text-zinc-500 border-zinc-200",
};

// ── Reusable atoms ───────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[.06em] text-zinc-400 mb-2">
      {children}
    </p>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-dashed border-zinc-100 last:border-b-0">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="text-xs font-semibold text-zinc-800 text-right font-mono">
        {value}
      </span>
    </div>
  );
}

function ContextCell({
  label,
  value,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 min-w-[120px] flex flex-col gap-1 px-4 py-3 border-r border-zinc-100 last:border-r-0 hover:bg-slate-50 transition-colors text-left"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[.06em] text-zinc-400">
        {label}
      </span>
      <span className="text-[13px] font-semibold text-zinc-800 flex items-center gap-2">
        {value}
      </span>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL SHELL
// ══════════════════════════════════════════════════════════════════

function Modal({
  open,
  onClose,
  icon,
  title,
  subtitle,
  wide,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  wide?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-12 px-5 pb-8 overflow-auto bg-zinc-900/45 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "bg-white rounded-2xl shadow-sm shadow-light shadow-2xl w-full animate-in fade-in slide-in-from-bottom-3 duration-200",
          wide ? "max-w-[920px]" : "max-w-[640px]",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-zinc-900">{title}</h3>
            {subtitle && (
              <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        {/* Body */}
        <div className="px-5 py-4 max-h-[64vh] overflow-auto">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-5 py-3.5 border-t border-zinc-100 bg-zinc-50 rounded-b-2xl flex justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// RECONSTRUCTION REPORT MODAL
// ══════════════════════════════════════════════════════════════════

function ReconstructionModal({
  open,
  onClose,
  incident,
}: {
  open: boolean;
  onClose: () => void;
  incident: IncidentDetailRecord;
}) {
  const timeline = useMemo(
    () => [
      {
        time: fmtDate(incident.createdAt),
        signal: "Incident raised",
        layer: incident.sourceType || "Detection",
      },
      {
        time: fmtDate(incident.createdAt),
        signal: `${incident.service || "Service"} impacted`,
        layer: "Service",
      },
      ...(incident.aiAnalysis
        ? [
            {
              time: fmtDate(incident.updatedAt),
              signal: "Ezra analysis computed",
              layer: "Engine",
            },
          ]
        : []),
      {
        time: fmtDate(incident.updatedAt),
        signal: `Current state: ${incident.status}`,
        layer: "Lifecycle",
      },
    ],
    [incident],
  );

  const confidenceMetrics = [
    {
      label: "Temporal correlation",
      value: incident.score ? `${Math.min(incident.score + 4, 100)}%` : "—",
      pct: incident.score ? Math.min(incident.score + 4, 100) : 0,
    },
    {
      label: "Dependency match",
      value: incident.score ? `${Math.max(incident.score - 1, 0)}%` : "—",
      pct: incident.score ? Math.max(incident.score - 1, 0) : 0,
    },
    {
      label: "Signal path accuracy",
      value: incident.riskScore && incident.riskScore > 50 ? "High" : "Medium",
      pct: incident.riskScore && incident.riskScore > 50 ? 88 : 55,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      icon={<Sparkles size={18} />}
      title="Incident reconstruction report"
      subtitle={`${incident.ticketId} · Ezra · confidence ${incident.score || "—"}%`}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-xs font-semibold shadow-sm shadow-light bg-white text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-xs font-bold bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 hover:brightness-105 transition"
          >
            Export report
          </button>
        </>
      }
    >
      {/* Run metadata */}
      <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3.5 mb-4 space-y-0">
        {[
          { k: "Run ID", v: `RR-${incident.ticketId}-01` },
          { k: "Computed", v: fmtDate(incident.updatedAt) },
          { k: "Engine", v: "Ezra Causal v3.2 (pinned)" },
          {
            k: "Signal sources",
            v: `${incident.correlatedSignalIds?.length || 1} · logs / metrics / traces`,
          },
          { k: "Method", v: "temporal + dependency counterfactual" },
        ].map((row) => (
          <div
            key={row.k}
            className="flex justify-between gap-3 py-2 border-b border-dashed border-zinc-200 last:border-b-0 text-xs"
          >
            <span className="text-zinc-400">{row.k}</span>
            <span className="font-semibold text-zinc-700 font-mono text-right">
              {row.v}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <p className="text-[13px] text-zinc-600 leading-relaxed mb-4">
        {incident.aiAnalysis?.suggestion ||
          incident.impactSummary ||
          incident.description ||
          "The reconstruction engine analyzed correlated signals and identified the most probable causal chain for this incident."}
      </p>

      {/* Reconstructed sequence */}
      <Eyebrow>Reconstructed sequence</Eyebrow>
      <div className="border border-zinc-100 rounded-xl overflow-hidden mb-5">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-3 py-2.5 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                Time
              </th>
              <th className="text-left px-3 py-2.5 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                Signal
              </th>
              <th className="text-left px-3 py-2.5 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                Layer
              </th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((row, i) => (
              <tr key={i} className="border-b border-zinc-100 last:border-b-0">
                <td className="px-3 py-2.5 font-mono text-zinc-500">
                  {row.time}
                </td>
                <td className="px-3 py-2.5 text-zinc-700">{row.signal}</td>
                <td className="px-3 py-2.5 text-zinc-500">{row.layer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confidence breakdown */}
      <Eyebrow>Confidence breakdown</Eyebrow>
      <div className="space-y-3">
        {confidenceMetrics.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-zinc-500 font-medium">{m.label}</span>
              <span className="font-bold font-mono text-zinc-700">
                {m.value}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${m.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════
// RE-RUN MODAL (animated log lines)
// ══════════════════════════════════════════════════════════════════

function RerunModal({
  open,
  onClose,
  incident,
}: {
  open: boolean;
  onClose: () => void;
  incident: IncidentDetailRecord;
}) {
  const [logLines, setLogLines] = useState<
    { type: string; text: string; time: string }[]
  >([]);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = useMemo(
    () => [
      ["info", `Loading signal sources for ${incident.ticketId}`],
      ["info", "Aligning logs, metrics, traces & deploys"],
      [
        "ok",
        `First failing signal: ${incident.service || "service"} (${fmtTime(incident.createdAt)})`,
      ],
      ["info", `Mapping dependency propagation across services`],
      ["warn", "Amplification point: retry storm detected"],
      ["ok", `Root cause confirmed · confidence ${incident.score || "—"}%`],
    ],
    [incident],
  );

  useEffect(() => {
    if (!open) {
      setLogLines([]);
      setDone(false);
      return;
    }
    let i = 0;
    setLogLines([]);
    setDone(false);
    const next = () => {
      if (i >= steps.length) {
        setDone(true);
        return;
      }
      const s = steps[i++];
      const time = `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(31 + i).padStart(2, "0")}`;
      setLogLines((prev) => [...prev, { type: s[0], text: s[1], time }]);
      timerRef.current = setTimeout(next, 520);
    };
    timerRef.current = setTimeout(next, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, steps]);

  const logColors: Record<string, string> = {
    info: "bg-zinc-50 text-zinc-600",
    ok: "bg-emerald-50 text-emerald-800",
    warn: "bg-amber-50 text-amber-800",
    err: "bg-red-50 text-red-800",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<RefreshCcw size={18} />}
      title="Re-running reconstruction"
      subtitle="Re-correlating signal sources…"
    >
      <div className="space-y-1.5">
        {logLines.map((line, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 items-start px-3 py-2 rounded-lg font-mono text-[11.5px]",
              logColors[line.type] || logColors.info,
            )}
          >
            <span className="text-zinc-400 shrink-0">{line.time}</span>
            <span>{line.text}</span>
          </div>
        ))}
        {!done && logLines.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-400">
            <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            Processing…
          </div>
        )}
        {done && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <Check size={14} />
            Re-run complete — root cause re-confirmed at {incident.score || "—"}
            % confidence
          </div>
        )}
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════
// REMEDIATION TYPES & HELPERS
// ══════════════════════════════════════════════════════════════════

interface RemediationAction {
  title: string;
  description: string;
  playbook: string;
  policy: string;
  stage: number;
  policyMax: number;
  risk: number;
  blast: {
    level: "LOW" | "MEDIUM" | "UNKNOWN";
    svc: number | null;
    infra: number | null;
    note: string;
  };
  done: boolean;
}

const EAL_NAME: Record<number, string> = {
  0: "Manual",
  1: "Suggest",
  2: "Approval-gated",
  3: "Auto-execute",
};

function computeEAL(a: RemediationAction) {
  return Math.min(a.stage, a.policyMax, a.risk);
}

function routeFor(
  a: RemediationAction,
): "auto" | "approval" | "manual" | "blocked" {
  if (a.blast.level === "UNKNOWN") return "blocked";
  const eal = computeEAL(a);
  if (eal >= 3) return "auto";
  if (eal === 2) return "approval";
  return "manual";
}

const ROUTE_LABEL: Record<string, string> = {
  auto: "Auto-execute",
  approval: "Approval-gated",
  manual: "Manual",
  blocked: "Blocked",
};

const ROUTE_COLORS: Record<string, string> = {
  auto: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approval: "bg-amber-50 text-amber-700 border-amber-200",
  manual: "bg-blue-50 text-blue-700 border-blue-200",
  blocked: "bg-red-50 text-red-700 border-red-200",
};

const EAL_COLORS: Record<number, string> = {
  0: "bg-zinc-100 text-zinc-600",
  1: "bg-blue-50 text-blue-700",
  2: "bg-amber-50 text-amber-700",
  3: "bg-emerald-50 text-emerald-700",
};

const BLAST_COLORS: Record<string, string> = {
  LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  UNKNOWN: "bg-red-50 text-red-700 border-red-200",
};

function buildActions(incident: IncidentDetailRecord): RemediationAction[] {
  const actions: RemediationAction[] = [];

  if (incident.recommendedActions?.length) {
    incident.recommendedActions.forEach((action, i) => {
      actions.push({
        title: action,
        description: `Recommended remediation step for ${incident.service || "the affected service"}.`,
        playbook: `PB-${incident.ticketId}-${String(i + 1).padStart(2, "0")}`,
        policy: "POL-PROD-INFRA",
        stage: i === 0 ? 3 : 2,
        policyMax: 2,
        risk: i === 0 ? 2 : i === 1 ? 1 : 3,
        blast:
          i < 2
            ? {
                level: "MEDIUM",
                svc: 3,
                infra: 1,
                note: `${incident.service || "service"} tier`,
              }
            : { level: "LOW", svc: 1, infra: 0, note: "observability only" },
        done: false,
      });
    });
  }

  if (actions.length === 0) {
    actions.push({
      title: "Investigate and triage manually",
      description:
        "No automated remediation actions available. Manual investigation required.",
      playbook: `PB-MANUAL-${incident.ticketId}`,
      policy: "POL-PROD-GENERAL",
      stage: 1,
      policyMax: 1,
      risk: 1,
      blast: {
        level: "UNKNOWN",
        svc: null,
        infra: null,
        note: "No dependency data available",
      },
      done: false,
    });
  }

  return actions;
}

// ══════════════════════════════════════════════════════════════════
// REMEDIATION PLAN MODAL
// ══════════════════════════════════════════════════════════════════

function RemediationModal({
  open,
  onClose,
  incident,
  onOpenGate,
}: {
  open: boolean;
  onClose: () => void;
  incident: IncidentDetailRecord;
  onOpenGate: (index: number) => void;
}) {
  const actions = useMemo(() => buildActions(incident), [incident]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      icon={<Lightbulb size={18} />}
      title="Remediation plan"
      subtitle="Ezra proposes · each step is individually governed"
      footer={
        <ModalBtn primary onClick={onClose}>
          Got it
        </ModalBtn>
      }
    >
      <div className="space-y-2.5">
        {actions.map((action, i) => {
          const eal = computeEAL(action);
          const route = routeFor(action);

          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                onClose();
                onOpenGate(i);
              }}
              className="w-full flex gap-3 items-start p-4 rounded-xl border border-zinc-100 bg-white hover:bg-slate-50 hover:border-zinc-200 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-zinc-900">
                  {action.title}
                </p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  {action.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      EAL_COLORS[eal],
                    )}
                  >
                    EAL L{eal}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      ROUTE_COLORS[route],
                    )}
                  >
                    {ROUTE_LABEL[route]}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      BLAST_COLORS[action.blast.level],
                    )}
                  >
                    Blast {action.blast.level}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-zinc-400 mt-3">
        Nothing here executes without passing blast-radius and automation-level
        checks at the gate.
      </p>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════
// EXECUTION GATE MODAL
// ══════════════════════════════════════════════════════════════════

function ExecutionGateModal({
  open,
  onClose,
  incident,
  actionIndex,
}: {
  open: boolean;
  onClose: () => void;
  incident: IncidentDetailRecord;
  actionIndex: number | null;
}) {
  const actions = useMemo(() => buildActions(incident), [incident]);
  const action = actionIndex !== null ? actions[actionIndex] : null;

  if (!action) return null;

  const eal = computeEAL(action);
  const route = routeFor(action);
  const blast = action.blast;
  const isUnknown = blast.level === "UNKNOWN";

  const handleExecute = () => {
    toast.success(
      `Executed: ${action.title} — EAL L${eal}, blast ${blast.level}`,
    );
    onClose();
  };

  // Gate step component
  const GateStep = ({
    step,
    title,
    children,
    highlight,
  }: {
    step: number;
    title: string;
    children: React.ReactNode;
    highlight?: boolean;
  }) => (
    <div
      className={cn(
        "rounded-xl border p-4",
        highlight ? "border-zinc-200 bg-white" : "border-zinc-100 bg-zinc-50",
      )}
    >
      <h4 className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[.05em] text-zinc-400 mb-3">
        <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
          {step}
        </span>
        {title}
      </h4>
      {children}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect
            x="5"
            y="11"
            width="14"
            height="9"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 11V8a4 4 0 018 0v3"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      }
      title={`Execution gate · ${action.title}`}
      subtitle="EAL computed once at match time · never recomputed"
      footer={
        <>
          <ModalBtn onClick={onClose}>Cancel</ModalBtn>
          {route === "blocked" ? (
            <ModalBtn onClick={onClose}>Open in War Room</ModalBtn>
          ) : route === "approval" ? (
            <ModalBtn primary onClick={handleExecute}>
              Approve & execute
            </ModalBtn>
          ) : route === "auto" ? (
            <ModalBtn primary onClick={handleExecute}>
              Execute now
            </ModalBtn>
          ) : (
            <ModalBtn primary onClick={handleExecute}>
              Acknowledge & assign
            </ModalBtn>
          )}
        </>
      }
    >
      <div className="space-y-3.5">
        {/* Step 1 — EAL */}
        <GateStep step={1} title="Effective Automation Level">
          <div className="text-[12.5px] text-zinc-600 font-mono leading-relaxed">
            EAL = <b className="text-zinc-900">min</b>( playbook.automationStage{" "}
            <b className="text-zinc-900">L{action.stage}</b>,
            policy.maxAutomationLevel{" "}
            <b className="text-zinc-900">L{action.policyMax}</b>,
            riskClassifier.computedLevel{" "}
            <b className="text-zinc-900">L{action.risk}</b>) ={" "}
            <span
              className={cn(
                "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ml-1",
                EAL_COLORS[eal],
              )}
            >
              L{eal} · {EAL_NAME[eal]}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="inline-flex items-center text-[10px] font-semibold text-zinc-500 bg-white shadow-sm shadow-light rounded-full px-2.5 py-1">
              <span className="text-zinc-400 mr-1.5">playbook</span>{" "}
              {action.playbook}
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-zinc-500 bg-white shadow-sm shadow-light rounded-full px-2.5 py-1">
              <span className="text-zinc-400 mr-1.5">policy</span>{" "}
              {action.policy}
            </span>
          </div>
        </GateStep>

        {/* Step 2 — Blast radius */}
        <GateStep step={2} title="Blast radius — evaluated first">
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg p-3 text-xs",
              isUnknown
                ? "bg-red-50 border border-red-200 text-red-800"
                : blast.level === "MEDIUM"
                  ? "bg-amber-50 border border-amber-200 text-amber-800"
                  : "bg-emerald-50 border border-emerald-200 text-emerald-800",
            )}
          >
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <div>
              {isUnknown ? (
                <>
                  Blast radius is <b>UNKNOWN</b> — {blast.note}. UNKNOWN never
                  resolves to LOW, so the gate blocks execution regardless of
                  automation level.
                </>
              ) : (
                <>
                  Blast radius <b>{blast.level}</b> — {blast.svc} service(s),{" "}
                  {blast.infra} infra node(s). {blast.note}.
                </>
              )}
            </div>
          </div>
        </GateStep>

        {/* Step 3 — Guardrails */}
        <GateStep step={3} title="Guardrails">
          {isUnknown ? (
            <div className="flex items-center gap-2.5 text-xs text-zinc-400">
              <span className="w-5 h-5 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-400">
                –
              </span>
              Guardrail checks not run — blocked upstream by unknown blast
              radius
            </div>
          ) : (
            <div className="space-y-2">
              {[
                "Change-freeze window: none active",
                `Policy ceiling honoured: max L${action.policyMax}`,
                route === "approval"
                  ? "Approver present: you (on-call lead)"
                  : "Idempotency & rollback path: verified",
              ].map((guard, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 text-xs text-zinc-700"
                >
                  <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Check size={12} />
                  </span>
                  {guard}
                </div>
              ))}
            </div>
          )}
        </GateStep>

        {/* Step 4 — Routing */}
        <GateStep step={4} title={`Routing · ${ROUTE_LABEL[route]}`} highlight>
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg p-3 text-xs",
              route === "blocked"
                ? "bg-red-50 border border-red-200 text-red-800"
                : route === "approval"
                  ? "bg-amber-50 border border-amber-200 text-amber-800"
                  : route === "auto"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-blue-50 border border-blue-200 text-blue-800",
            )}
          >
            {route === "blocked" ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="shrink-0 mt-0.5"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : route === "auto" ? (
              <Check size={14} className="shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            )}
            <div>
              {route === "blocked"
                ? "Execution blocked. Resolve the dependency set, then re-evaluate."
                : route === "approval"
                  ? "EAL L2 — needs human approval before it runs."
                  : route === "auto"
                    ? "EAL L3 — eligible for auto-execution within policy."
                    : "EAL L1 — Ezra can prepare it, but a human executes."}
            </div>
          </div>
        </GateStep>
      </div>
    </Modal>
  );
}

// ── Right panel tab ids ──────────────────────────────────────────

type IntelTab = "narrative" | "details" | "evidence";

// ══════════════════════════════════════════════════════════════════
// MAIN WORKSPACE
// ══════════════════════════════════════════════════════════════════

function SignalGraphWorkspace({
  incident,
}: {
  incident: IncidentDetailRecord;
}) {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("service");
  const [intelTab, setIntelTab] = useState<IntelTab>("narrative");
  const [showReport, setShowReport] = useState(false);
  const [showRerun, setShowRerun] = useState(false);
  const [showRemediation, setShowRemediation] = useState(false);
  const [gateActionIndex, setGateActionIndex] = useState<number | null>(null);

  const timeline = useMemo(() => buildTimeline(incident), [incident]);
  const auditTrail = useMemo(() => buildAuditTrail(incident), [incident]);
  const nodeTypes = useMemo(() => ({ signalNode: SignalNode }), []);

  useEffect(() => {
    setNodes(buildSignalNodes(incident));
    setEdges(buildSignalEdges(incident));
    setSelectedNodeId("service");
  }, [incident, setEdges, setNodes]);

  const selectedNodeData = (nodes.find((n) => n.id === selectedNodeId)?.data ??
    null) as GraphNodeData | null;

  const engineSteps = [
    "Correlates logs, metrics, deployments & events",
    "Identifies the first failing signal",
    "Maps dependency propagation",
    "Highlights amplification points",
    "Rebuilds the full incident timeline",
    "Scores root-cause confidence & alternatives",
  ];

  return (
    <div className="flex flex-col text-zinc-800 font-ibm">
      {/* ── Page header ── */}
      <div className="flex items-end justify-between gap-5 px-5 pt-5 pb-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
            Signal Graph
          </h1>
          <p className="text-[13px] text-zinc-500 mt-1 max-w-2xl">
            How this incident unfolded across systems, services and
            dependencies. Select any node to inspect its evidence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setShowRemediation(true)}
            size="sm"
          >
            <Lightbulb size={14} />
            Remediation plan
          </Button>
        </div>
      </div>

      {/* ── Context bar ── */}
      <div className="mx-5 mb-4 flex flex-wrap items-stretch bg-white rounded-xl shadow-sm shadow-light overflow-hidden">
        <ContextCell
          label="Incident"
          value={
            <span className="font-mono text-[13px]">{incident.ticketId}</span>
          }
        />
        <ContextCell label="Service" value={incident.service || "—"} />
        <ContextCell
          label="Environment"
          value={
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              {incident.environment || "Production"}
            </span>
          }
        />
        <ContextCell
          label="Severity"
          value={
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
                sevPill[incident.severity] || sevPill.P3,
              )}
            >
              {incident.severity}
            </span>
          }
        />
        <ContextCell
          label="Status"
          value={
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-600 capitalize">
              {incident.status.toLowerCase().replace(/_/g, " ")}
            </span>
          }
        />
        <ContextCell
          label="Source"
          value={incident.sourceType || incident.source || "Manual"}
        />
      </div>

      {/* ── Ezra insight banner ── */}
      {incident.aiAnalysis?.suggestion && (
        <div className="mx-5 mb-4 flex gap-4 items-start rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-white p-4 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-l-xl" />
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/40">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-zinc-900 mb-1">
              Ezra Analysis
            </p>
            <p className="text-[13px] text-zinc-600 leading-relaxed">
              {shortText(incident.aiAnalysis.suggestion, 280)}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 bg-white shadow-sm shadow-light rounded-full px-2.5 py-1">
                <span className="w-[7px] h-[7px] rounded-full bg-rose-500" />
                {incident.severity}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 bg-white shadow-sm shadow-light rounded-full px-2.5 py-1">
                <span className="w-[7px] h-[7px] rounded-full bg-purple-500" />
                {incident.service || "Service"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 3-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[268px_minmax(0,1fr)_322px] gap-4 px-5 items-start">
        {/* LEFT: Reconstruction timeline */}
        <div className="bg-white rounded-xl shadow-sm shadow-light overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <h2 className="text-[13px] font-bold flex items-center gap-2 text-zinc-800">
              <Clock size={14} className="text-zinc-400" />
              Reconstruction timeline
            </h2>
            <span className="text-[11px] text-zinc-400 font-medium">
              {timeline.length} events
            </span>
          </div>
          <div className="py-2 px-1.5">
            {timeline.map((ev, i) => (
              <button
                key={`${ev.nodeId}-${i}`}
                type="button"
                onClick={() => setSelectedNodeId(ev.nodeId)}
                className={cn(
                  "w-full grid grid-cols-[46px_1fr] gap-2 px-2.5 py-2.5 rounded-lg text-left transition-colors",
                  selectedNodeId === ev.nodeId
                    ? "bg-indigo-50"
                    : "hover:bg-slate-50",
                )}
              >
                <div className="flex flex-col items-center relative">
                  {i < timeline.length - 1 && (
                    <div className="absolute top-5 bottom-[-14px] w-[2px] bg-zinc-200 left-1/2 -translate-x-1/2" />
                  )}
                  <span className="text-[10px] font-mono font-bold text-zinc-500">
                    {ev.time}
                  </span>
                  <div
                    className="relative z-10 w-2.5 h-2.5 rounded-full bg-white border-[2.5px] mt-1"
                    style={{ borderColor: ev.tagColor }}
                  />
                </div>
                <div>
                  <p className="text-[12px] text-zinc-600 font-medium leading-snug">
                    {ev.label}
                  </p>
                  <span
                    className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md"
                    style={{
                      background: ev.tagColor + "18",
                      color: ev.tagColor,
                    }}
                  >
                    {ev.tag}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Graph canvas */}
        <div className="bg-white rounded-xl shadow-sm shadow-light overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-100">
            <h2 className="text-sm font-bold text-zinc-800">
              System signal flow & causal chain
            </h2>
            <p className="text-[12px] text-zinc-500 mt-1 max-w-[760px]">
              This incident originated from{" "}
              <b className="text-zinc-700">
                {incident.service || "the primary service"}
              </b>
              . Select any node to inspect its evidence.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 border-b border-zinc-100 bg-slate-50/80">
            {[
              { color: "bg-rose-500", label: "Root cause" },
              { color: "bg-amber-400", label: "Contributing" },
              { color: "bg-purple-500", label: "Service" },
              { color: "bg-blue-500", label: "Infrastructure" },
              { color: "bg-pink-500", label: "User impact" },
            ].map((l) => (
              <span
                key={l.label}
                className="inline-flex items-center gap-2 text-[11px] font-semibold text-zinc-500"
              >
                <span className={cn("w-3 h-3 rounded", l.color)} />
                {l.label}
              </span>
            ))}
          </div>
          <div className="relative h-[480px]">
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
              />
              <Controls className="!bg-white !border-zinc-200 !shadow-sm" />
            </ReactFlow>
            <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-rose-200 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-rose-600">
                {incident.ticketId} / {incident.service || "Incident"}
              </span>
              <span className="rounded-full shadow-sm shadow-light bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-zinc-600">
                {incident.environment || "runtime"} /{" "}
                {incident.region || "global"}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Intelligence panel */}
        <div className="bg-white rounded-xl shadow-sm shadow-light overflow-hidden">
          <div className="px-4 py-3.5 border-b border-zinc-100 bg-gradient-to-b from-slate-50 to-white">
            {selectedNodeData ? (
              <p className="text-[15px] font-bold text-zinc-900 mt-1.5 tracking-tight leading-snug">
                {selectedNodeData.label}
              </p>
            ) : (
              <p className="text-sm text-zinc-400">
                Click a node to inspect it.
              </p>
            )}
          </div>
          <div className="flex gap-1 px-4 border-b border-zinc-100">
            {(
              [
                { id: "narrative" as IntelTab, label: "Narrative" },
                { id: "details" as IntelTab, label: "Details" },
                { id: "evidence" as IntelTab, label: "Evidence" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setIntelTab(tab.id)}
                className={cn(
                  "py-2.5 px-1 mr-3 text-xs font-medium border-b-2 -mb-px transition-colors",
                  intelTab === tab.id
                    ? "border-black text-black"
                    : "border-transparent text-zinc-400 hover:text-zinc-600",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-4">
            {intelTab === "narrative" && (
              <div className="text-[13px] text-zinc-600 leading-[1.74] space-y-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-1 mb-2">
                  <Sparkles size={11} />
                  Ezra's read · {selectedNodeData?.label || "—"}
                </span>
                <p className="text-sm text-zinc-800 font-medium">
                  {incident.impactSummary ||
                    incident.description ||
                    "Narrative is being computed by the analysis engine."}
                </p>
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      incident.techDescription ||
                      incident.description ||
                      "Technical context has not been captured yet.",
                  }}
                  className="text-sm text-zinc-500"
                />
              </div>
            )}
            {intelTab === "details" && selectedNodeData && (
              <div>
                <KV label="Type" value={selectedNodeData.kind} />
                <KV label="Severity" value={selectedNodeData.sev} />
                <Eyebrow>Key metrics</Eyebrow>
                <div className="space-y-3 mt-1">
                  {selectedNodeData.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 font-medium">
                          {m.label}
                        </span>
                        <span className="font-bold font-mono text-zinc-800">
                          {m.value}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-100 mt-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${m.pct}%`, background: m.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase text-red-600 mb-1">
                    <AlertTriangle size={12} />
                    Why this matters
                  </p>
                  {incident.reason ||
                    incident.description ||
                    "Impact assessment pending."}
                </div>
              </div>
            )}
            {intelTab === "evidence" && (
              <div className="space-y-2">
                {[
                  {
                    title: incident.sourceType || "Signal source",
                    meta: `${incident.source || "system"} · ${incident.elapsedLabel}`,
                  },
                  {
                    title: `${incident.service || "Service"} error correlation`,
                    meta: `metric · ${incident.severity}`,
                  },
                  ...(incident.correlatedSignalIds || [])
                    .slice(0, 3)
                    .map((s) => ({
                      title: `Correlated signal ${s.slice(0, 8)}`,
                      meta: "link · correlation",
                    })),
                ].map((ev, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-full flex gap-3 items-start p-3 rounded-lg border border-zinc-100 bg-white hover:bg-slate-50 hover:border-zinc-200 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-500">
                      <FileText size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-800">
                        {ev.title}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        {ev.meta}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-zinc-100 px-4 py-3.5">
            <h3 className="text-xs font-bold flex items-center gap-2 text-zinc-700 mb-3">
              <AlertTriangle size={13} className="text-amber-500" />
              Contributing factors
            </h3>
            <div className="space-y-0">
              {(incident.recommendedActions || [])
                .slice(0, 3)
                .map((action, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2 border-b border-dashed border-zinc-100 last:border-b-0"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-xs text-zinc-600 flex-1">
                      {shortText(action, 100)}
                    </span>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-600">
                      Med
                    </span>
                  </div>
                ))}
              {(!incident.recommendedActions ||
                incident.recommendedActions.length === 0) && (
                <p className="text-xs text-zinc-400 italic">
                  No contributing factors identified yet.
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-zinc-100 px-4 py-3.5">
            <h3 className="text-xs font-bold flex items-center gap-2 text-zinc-700 mb-3">
              <BarChart3 size={13} className="text-pink-500" />
              Impact summary
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Services affected",
                  value: incident.correlatedSignalIds?.length || 1,
                  color: "text-purple-600",
                },
                {
                  label: "Signals",
                  value: timeline.length,
                  color: "text-blue-600",
                },
                {
                  label: "Comments",
                  value: incident.commentsCount,
                  color: "text-pink-600",
                },
                {
                  label: "Risk score",
                  value: incident.riskScore ?? "—",
                  color: "text-amber-600",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-zinc-100 bg-slate-50 p-3 text-center hover:bg-white hover:border-zinc-200 transition-colors cursor-default"
                >
                  <p
                    className={cn(
                      "text-xl font-bold font-mono tracking-tight",
                      stat.color,
                    )}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lower section: Ezra Causal Reconstruction ── */}
      <div className="mx-5 mt-4 bg-white rounded-xl shadow-sm shadow-light overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <h2 className="text-[13px] font-bold flex items-center gap-2 text-zinc-800">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Sparkles size={12} />
            </span>
            Ezra · Causal Reconstruction
          </h2>
          <span className="text-[11px] text-zinc-400 font-medium">
            {incident.ticketId}
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2.5">
              {engineSteps.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-3 items-start text-[12.5px] text-zinc-600"
                >
                  <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} />
                  </span>
                  {step}
                </li>
              ))}
            </ul>
            <div className="rounded-xl border border-zinc-100 bg-slate-50 p-4">
              <h4 className="text-[11px] uppercase tracking-[.05em] text-zinc-400 font-bold mb-3">
                Ezra output
              </h4>
              {[
                {
                  label: "Root cause identified",
                  value: (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {incident.category || "Yes"}
                    </span>
                  ),
                },
                {
                  label: "Confidence score",
                  value: (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                      {incident.score ? `${incident.score}%` : "—"}
                    </span>
                  ),
                },
                {
                  label: "Signal path accuracy",
                  value: (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                      {incident.riskScore && incident.riskScore > 50
                        ? "High"
                        : "Medium"}
                    </span>
                  ),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-2.5 border-b border-dashed border-zinc-200 last:border-b-0 text-[12.5px]"
                >
                  <span className="text-zinc-600">{row.label}</span>
                  {row.value}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2.5 mt-4">
            <button
              type="button"
              onClick={() => setShowReport(true)}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-semibold shadow-sm shadow-light bg-white text-zinc-600 hover:bg-slate-50 transition-colors"
            >
              <FileText size={14} />
              View full report
            </button>
            <button
              type="button"
              onClick={() => setShowRerun(true)}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-semibold shadow-sm shadow-light bg-white text-zinc-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCcw size={14} />
              Ask Ezra to re-run
            </button>
          </div>
        </div>
      </div>

      {/* ── Append-only audit trail ── */}
      <div className="mx-5 mt-4 bg-white rounded-xl shadow-sm shadow-light overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <h2 className="text-[13px] font-bold flex items-center gap-2 text-zinc-800">
            <FileText size={14} className="text-zinc-400" />
            Append-only audit
          </h2>
          <span className="text-[11px] text-zinc-400 font-medium">
            {auditTrail.length} events
          </span>
        </div>
        <div className="max-h-[330px] overflow-auto py-1 px-1.5">
          {auditTrail.map((entry, i) => (
            <div
              key={i}
              className="grid grid-cols-[74px_1fr] gap-3 px-3 py-2.5 rounded-lg border-b border-dashed border-zinc-100 last:border-b-0 hover:bg-slate-50 transition-colors"
            >
              <span className="font-mono text-[10.5px] text-zinc-400 pt-0.5">
                {entry.time}
              </span>
              <div>
                <span
                  className={cn(
                    "text-[11.5px] font-bold",
                    entry.isEzra ? "text-indigo-600" : "text-zinc-800",
                  )}
                >
                  {entry.actor}
                </span>
                <p className="text-xs text-zinc-600 mt-0.5">{entry.event}</p>
                <p className="font-mono text-[10px] text-zinc-400 mt-1">
                  {entry.ref}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-zinc-100 bg-zinc-50 rounded-b-xl text-[10.5px] text-zinc-400 font-mono">
          <Lock size={12} className="text-emerald-600" />
          Immutable · every state transition and execution is recorded here
        </div>
      </div>

      {/* ── Footer bar ── */}
      <footer className="flex items-center justify-between h-9 mt-4 mx-5 mb-5 px-4 rounded-lg bg-slate-50 border border-zinc-100 text-[10px] font-mono text-zinc-400">
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

      {/* ── Modals ── */}
      <ReconstructionModal
        open={showReport}
        onClose={() => setShowReport(false)}
        incident={incident}
      />
      <RerunModal
        open={showRerun}
        onClose={() => setShowRerun(false)}
        incident={incident}
      />
      <RemediationModal
        open={showRemediation}
        onClose={() => setShowRemediation(false)}
        incident={incident}
        onOpenGate={(i) => setGateActionIndex(i)}
      />
      <ExecutionGateModal
        open={gateActionIndex !== null}
        onClose={() => setGateActionIndex(null)}
        incident={incident}
        actionIndex={gateActionIndex}
      />
    </div>
  );
}

export default function SignalGraphPage() {
  return (
    <>
      <Header title="Signal graph" />
      <IncidentOverview tabs="signal-graph">
        <IncidentRouteShell title="Signal Graph">
          {(incident) => <SignalGraphWorkspace incident={incident} />}
        </IncidentRouteShell>
      </IncidentOverview>
    </>
  );
}
