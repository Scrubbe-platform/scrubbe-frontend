"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Link2,
  ArrowLeftRight,
  AlertTriangle,
  Plus,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  Clock,
  Search,
  FileEdit,
  Check,
} from "lucide-react";
import Topbar from "./Topbar";
import Button from "@/components/ui/Button1";
import AttachExistingHandover from "./AttachExistingHandover";
import TransferOwnershipModal from "./TransferOwnershipModal";
import AddIncidentModal from "./AddIncidentModal";
import AddTaskModal from "./AddTaskModal";
import RollbackProductionModal from "./RollbackProductionModal";
import AddNoteModal from "./AddHandoverNote";
import { fetchHandoverById, removeHandoverIncident, refreshEzraBrief, updateHandoverTask } from "@/lib/handover/handover.api";
import { fetchIncidentDetail, fetchIncidentHistory } from "@/lib/incident/incident.api";
import { HandoverTaskRecord } from "../types/index";

// ── Shared bits ───────────────────────────────────────────────────

const StatusDot = ({ color }: { color: string }) => {
  const map: Record<string, string> = {
    red: "bg-red-500",
    green: "bg-emerald-500",
    yellow: "bg-amber-400",
    blue: "bg-blue-500",
    gray: "bg-zinc-300 dark:bg-zinc-600",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[color] ?? "bg-zinc-400"}`} />;
};

const Pill = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${className}`}>{children}</span>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/40 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ icon, title, right }: { icon?: React.ReactNode; title: string; right?: React.ReactNode }) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
    <div className="flex items-center gap-2 text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
      {icon} {title}
    </div>
    {right}
  </div>
);

const severityColor = (severity?: string | null) =>
  severity === "CRITICAL" ? "red" : severity === "HIGH" ? "yellow" : severity === "LOW" ? "green" : "blue";

const formatCountdown = (totalSecs: number) => {
  const clamped = Math.max(0, totalSecs);
  const h = String(Math.floor(clamped / 3600)).padStart(2, "0");
  const m = String(Math.floor((clamped % 3600) / 60)).padStart(2, "0");
  const s = String(clamped % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

// ── Main component ────────────────────────────────────────────────

export default function HandoverDetailPage() {
  const params = useParams<{ id: string }>();
  const handoverId = params?.id as string;
  const queryClient = useQueryClient();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeTask, setActiveTask] = useState<HandoverTaskRecord | null>(null);
  const [isOpenModal, setIsOpenModal] = useState({
    attachHandover: false,
    transferOwnership: false,
    addIncidentHandover: false,
    addTask: false,
    rollback: false,
    addHandoverNote: false,
  });

  const { data: handover, refetch } = useQuery({
    queryKey: ["handover", handoverId],
    queryFn: () => fetchHandoverById(handoverId),
    enabled: Boolean(handoverId),
    refetchInterval: 20_000,
  });

  const invalidate = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["handovers"] });
  };

  const primaryLink = useMemo(
    () => handover?.incidents.find((i) => i.isPrimary) ?? handover?.incidents[0],
    [handover]
  );
  const primaryIncidentId = primaryLink?.incident.id;

  const { data: incidentDetail } = useQuery({
    queryKey: ["incident-detail", primaryIncidentId],
    queryFn: () => fetchIncidentDetail(primaryIncidentId!),
    enabled: Boolean(primaryIncidentId),
  });

  const { data: incidentHistory = [] } = useQuery({
    queryKey: ["incident-history", primaryIncidentId],
    queryFn: () => fetchIncidentHistory(primaryIncidentId!),
    enabled: Boolean(primaryIncidentId),
  });

  const [secondsLeft, setSecondsLeft] = useState(0);
  useEffect(() => {
    if (!handover) return;
    const deadline = new Date(handover.transferAt).getTime();
    const update = () => setSecondsLeft(Math.round((deadline - Date.now()) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [handover?.transferAt]);

  const toggleIncident = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const tasks = handover?.tasks ?? [];
  const criticalPending = tasks.filter((t) => t.priority === "CRITICAL" && t.status === "PENDING");

  const handleToggleTask = async (task: HandoverTaskRecord) => {
    if (task.status !== "PENDING") return;
    if (task.priority === "CRITICAL") {
      setActiveTask(task);
      setIsOpenModal((p) => ({ ...p, rollback: true }));
      return;
    }
    try {
      await updateHandoverTask(handoverId, task.id, { status: "COMPLETED" });
      invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleCatchMeUp = async () => {
    try {
      await refreshEzraBrief(handoverId);
      invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate Ezra brief");
    }
  };

  const handleRemoveIncident = async (linkId: string) => {
    try {
      await removeHandoverIncident(handoverId, linkId);
      invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove incident");
    }
  };

  if (!handover) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Topbar activeIncidents={0} />
        <div className="p-8 text-center text-sm text-zinc-400">Loading handover…</div>
      </div>
    );
  }

  const severity = primaryLink?.incident.severity || primaryLink?.incident.priority || "—";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Topbar activeIncidents={handover.incidents.length} />

      <div className="mx-auto px-8 py-6">
        {/* ── Back + action buttons ── */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/incident/handover"
            className="flex items-center gap-1.5 text-[13px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <ChevronLeft size={14} /> Back to Handovers
          </Link>
          <div className="flex items-center gap-2">
            <Button
              leftIcon={<Link2 size={14} />}
              size="sm"
              variant="outline-dark"
              disabled={handover.isImmutable}
              onClick={() => setIsOpenModal((prev) => ({ ...prev, attachHandover: !prev.attachHandover }))}
            >
              Attach to Handover
            </Button>
            <Button
              leftIcon={<ArrowLeftRight size={14} />}
              size="sm"
              variant="outline-dark"
              disabled={handover.isImmutable}
              onClick={() => setIsOpenModal((prev) => ({ ...prev, transferOwnership: !prev.transferOwnership }))}
            >
              Transfer Ownership
            </Button>
          </div>
        </div>

        {/* ── Header card ── */}
        <Card className="p-6 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
            Handover &nbsp;•&nbsp; {handover.handoverRef} &nbsp;•&nbsp; {handover.currentOwnerLabel}{" "}
            <span className="text-zinc-300 dark:text-zinc-600">→</span> {handover.nextOwnerLabel}
          </p>
          <h1 className="text-[26px] font-black text-zinc-900 dark:text-zinc-100 mb-3">
            {primaryLink?.incident.summary ?? "No primary incident linked"}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Pill className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 flex items-center gap-1.5">
              <StatusDot color="red" /> {handover.status}
            </Pill>
            <Pill className="text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
              Severity <span className="text-red-500 font-bold ml-1">{severity}</span>
            </Pill>
            <Pill className="text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
              Created{" "}
              <span className="text-zinc-900 dark:text-zinc-100 font-bold ml-1">
                {new Date(handover.createdAt).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC
              </span>
            </Pill>
            <Pill className="text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
              Date{" "}
              <span className="text-zinc-900 dark:text-zinc-100 font-bold ml-1">
                {new Date(handover.createdAt).toLocaleDateString()}
              </span>
            </Pill>
            <Pill className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5">
              {handover.incidents.length} incidents this handover
            </Pill>
          </div>
        </Card>

        {/* ── Ownership transfer strip ── */}
        <div className="rounded-2xl px-8 py-6 mb-4 flex items-center justify-between" style={{ background: "#0a0f0c" }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Current Owner</p>
            <p className="text-[18px] font-bold text-white mb-0.5">{handover.currentOwnerLabel}</p>
            <p className="text-[12px] text-zinc-500">
              Commander: {handover.currentCommander ? `${handover.currentCommander.firstName} ${handover.currentCommander.lastName}` : "Unassigned"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[20px] font-black text-emerald-400 mb-1">
              {new Date(handover.transferAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
              {secondsLeft >= 0 ? "Transfer in" : "Overdue by"}
            </p>
            <span className="text-[14px] font-mono font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1">
              {formatCountdown(Math.abs(secondsLeft))}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Next Owner</p>
            <p className="text-[18px] font-bold text-white mb-0.5">{handover.nextOwnerLabel}</p>
            <p className="text-[12px] text-zinc-500">
              Commander: {handover.nextCommander ? `${handover.nextCommander.firstName} ${handover.nextCommander.lastName}` : "Unassigned"}
            </p>
          </div>
        </div>

        {/* ── Incidents in this handover ── */}
        <Card className="mb-4 overflow-hidden">
          <CardHeader
            icon={<AlertTriangle size={15} className="text-amber-500" />}
            title="Incidents in this Handover"
            right={
              <div className="flex items-center gap-3">
                <Pill className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5">
                  {handover.incidents.length} incidents
                </Pill>
                <button
                  disabled={handover.isImmutable}
                  onClick={() => setIsOpenModal((prev) => ({ ...prev, addIncidentHandover: !prev.addIncidentHandover }))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  <Plus size={13} /> Add Incident
                </button>
              </div>
            }
          />
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {handover.incidents.map((link) => (
              <div key={link.id} className="px-5 py-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleIncident(link.id)}>
                  <div className="flex items-center gap-2.5">
                    {expanded[link.id] ? (
                      <ChevronDown size={14} className="text-zinc-400" />
                    ) : (
                      <ChevronRight size={14} className="text-zinc-400" />
                    )}
                    <Link
                      href={`/incident/tickets/${link.incident.id}`}
                      className="text-[13px] font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {link.incident.ticketId}
                    </Link>
                    <span className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">{link.incident.summary}</span>
                    {link.isPrimary && (
                      <Pill className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 py-0">
                        Primary
                      </Pill>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Pill className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                      <StatusDot color={severityColor(link.incident.severity)} /> {link.incident.status}
                    </Pill>
                    <span className="text-[12px] font-bold text-amber-500">{link.incident.severity || link.incident.priority}</span>
                    {!handover.isImmutable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveIncident(link.id);
                        }}
                        className="text-[11px] text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                {expanded[link.id] && (
                  <div className="ml-6 mt-2">
                    {link.contextNotes && (
                      <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">{link.contextNotes}</p>
                    )}
                    <Link
                      href={`/incident/tickets/${link.incident.id}`}
                      className="inline-block px-4 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      View Investigation
                    </Link>
                  </div>
                )}
              </div>
            ))}
            {handover.incidents.length === 0 && (
              <div className="px-5 py-6 text-center text-sm text-zinc-400">No incidents linked yet.</div>
            )}
          </div>
        </Card>

        {/* ── Two column layout ── */}
        <div className="grid grid-cols-[1fr_340px] gap-4 items-start">
          {/* ── Left column ── */}
          <div className="space-y-4">
            {/* Ezra card */}
            <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={{ background: "#0d1410", border: "1px solid #1f2922" }}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <Sparkles size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-[14px] font-bold text-white">Ezra</p>
                    <p className="text-[11px] text-zinc-500">Reasoning Engine · Incident Brief</p>
                  </div>
                </div>
                <Pill className="text-zinc-400 border-zinc-700 bg-zinc-800/60">
                  {handover.ezraBrief ? "READY" : "NOT GENERATED"}
                </Pill>
              </div>

              {handover.ezraBrief ? (
                <div className="text-left max-w-2xl mx-auto">
                  <p className="text-[15px] text-zinc-100 leading-relaxed mb-4">{handover.ezraBrief.executiveSummary}</p>
                  <div className="flex items-center gap-6 text-[12px] text-zinc-400">
                    {handover.ezraBrief.rcaConfidence !== undefined && (
                      <span>RCA Confidence: <strong className="text-emerald-400">{Math.round((handover.ezraBrief.rcaConfidence ?? 0) * 100)}%</strong></span>
                    )}
                    {handover.ezraBrief.derivedSeverity && <span>Severity: {handover.ezraBrief.derivedSeverity}</span>}
                    {handover.ezraBrief.customerExposure && <span>Exposure: {handover.ezraBrief.customerExposure}</span>}
                  </div>
                  {handover.ezraBrief.recommendation && (
                    <p className="text-[13px] text-emerald-300 mt-3">→ {handover.ezraBrief.recommendation}</p>
                  )}
                  <button
                    onClick={handleCatchMeUp}
                    className="mt-5 text-[12px] font-semibold text-emerald-400 hover:underline"
                  >
                    Refresh brief
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center mx-auto mb-6">
                    <Sparkles size={24} className="text-emerald-400" />
                  </div>
                  <h2 className="text-[26px] font-black text-white mb-3">Get up to speed in under two minutes.</h2>
                  <p className="text-[13px] text-zinc-400 leading-relaxed max-w-md mx-auto mb-6">
                    Ezra surfaces the existing analysis for this handover's primary incident — root cause, confidence,
                    and recommendation — distilled for the incoming team.
                  </p>
                  <button
                    onClick={handleCatchMeUp}
                    className="w-full max-w-md mx-auto block py-3 rounded-xl font-bold text-[14px] text-zinc-900"
                    style={{ background: "linear-gradient(90deg, #34d399, #bef264)" }}
                  >
                    Catch Me Up
                  </button>
                </>
              )}
            </div>

            {/* Current Incident State */}
            <Card>
              <CardHeader
                icon={<AlertTriangle size={15} className="text-amber-500" />}
                title="Current Incident State"
                right={
                  <Pill className="flex items-center gap-1.5 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5">
                    <StatusDot color="red" /> LIVE
                  </Pill>
                }
              />
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {[
                  { label: "Incident ID", value: incidentDetail?.ticketId ?? "—" },
                  { label: "Status", value: incidentDetail?.status ?? "—" },
                  { label: "Severity", value: incidentDetail?.severity ?? incidentDetail?.priority ?? "—" },
                  { label: "Affected System", value: incidentDetail?.affectedSystem || "—" },
                  { label: "Risk Score", value: incidentDetail ? `${Math.round(incidentDetail.riskScore)}` : "—" },
                  { label: "Blast Radius", value: incidentDetail?.blastRadius || "—" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{row.label}</span>
                    <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">{row.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pending tasks */}
            <Card>
              <CardHeader
                icon={<ClipboardList size={15} className="text-zinc-500" />}
                title="Pending Tasks"
                right={
                  <button
                    disabled={handover.isImmutable}
                    onClick={() => setIsOpenModal((prev) => ({ ...prev, addTask: !prev.addTask }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    <Plus size={13} /> Add task
                  </button>
                }
              />
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 px-5 py-4">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                        task.status !== "PENDING" ? "bg-emerald-500 border-emerald-500" : "border-zinc-300 dark:border-zinc-600"
                      }`}
                    >
                      {task.status !== "PENDING" && <Check size={12} className="text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[14px] font-semibold ${
                          task.status !== "PENDING" ? "text-zinc-400 dark:text-zinc-500 line-through" : "text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{task.assigneeLabel || "Unassigned"}</span>
                        {task.priority === "CRITICAL" && task.status === "PENDING" && (
                          <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded px-1.5 py-0.5">
                            Critical
                          </span>
                        )}
                        {task.dueAt && (
                          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                            Due {new Date(task.dueAt).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC
                          </span>
                        )}
                      </div>
                    </div>
                    {task.priority === "CRITICAL" && task.status === "PENDING" && (
                      <button
                        onClick={() => {
                          setActiveTask(task);
                          setIsOpenModal((p) => ({ ...p, rollback: true }));
                        }}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-bold transition-colors shrink-0"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                ))}
                {tasks.length === 0 && <div className="px-5 py-6 text-center text-sm text-zinc-400">No tasks yet.</div>}
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                  <Clock size={15} className="text-zinc-500" /> Timeline — Key Events
                </div>
                {primaryIncidentId && (
                  <Link
                    href={`/incident/tickets/${primaryIncidentId}`}
                    className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    View full incident →
                  </Link>
                )}
              </div>
              <div className="space-y-0">
                {incidentHistory.slice(0, 10).map((item, i) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <StatusDot color="blue" />
                      {i < Math.min(incidentHistory.length, 10) - 1 && (
                        <div className="w-px flex-1 bg-zinc-100 dark:bg-zinc-800 mt-1" />
                      )}
                    </div>
                    <div className="pb-5 flex-1 min-w-0">
                      <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mb-0.5">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                      <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">{item.action}</p>
                      {(item.oldValue || item.newValue) && (
                        <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                          {item.oldValue} → {item.newValue}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {incidentHistory.length === 0 && <p className="text-xs text-zinc-400">No history recorded yet.</p>}
              </div>
            </Card>

            {/* Handover Notes */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                  <FileEdit size={15} className="text-zinc-500" /> Handover Notes
                </div>
                <button
                  onClick={() => setIsOpenModal((prev) => ({ ...prev, addHandoverNote: !prev.addHandoverNote }))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Plus size={13} /> Add Note
                </button>
              </div>
              <div className="space-y-4">
                {(handover.notes ?? []).map((note, i) => (
                  <div key={note.id} className={`flex gap-3 ${i < (handover.notes?.length ?? 0) - 1 ? "pb-4 border-b border-zinc-100 dark:border-zinc-800" : ""}`}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0 bg-zinc-700">
                      {note.author.firstName[0]}
                      {note.author.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
                          {note.author.firstName} {note.author.lastName}
                        </span>
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          • {new Date(note.createdAt).toLocaleString()}
                          {note.isCommander ? " • Incident Commander" : ""}
                        </span>
                      </div>
                      <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{note.body}</p>
                    </div>
                  </div>
                ))}
                {(handover.notes ?? []).length === 0 && <p className="text-xs text-zinc-400">No notes yet.</p>}
              </div>
            </Card>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-4">
            {/* Blocking tasks */}
            <Card>
              <CardHeader icon={<CheckCircle2 size={15} className="text-zinc-500" />} title="Blocking Tasks" />
              <div className="p-5">
                {criticalPending.length === 0 ? (
                  <p className="text-[13px] text-zinc-500 dark:text-zinc-400">No critical tasks blocking transfer.</p>
                ) : (
                  <div className="space-y-3">
                    {criticalPending.map((task) => (
                      <div key={task.id} className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">{task.title}</p>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{task.assigneeLabel || "Unassigned"}</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTask(task);
                            setIsOpenModal((p) => ({ ...p, rollback: true }));
                          }}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-bold transition-colors shrink-0"
                        >
                          Resolve
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Investigation Summary */}
            <Card>
              <CardHeader icon={<Search size={15} className="text-zinc-500" />} title="Investigation Summary" />
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {[
                  { label: "Created", value: incidentDetail ? new Date(incidentDetail.createdAt).toLocaleString() : "—" },
                  { label: "Affected System", value: incidentDetail?.affectedSystem || "—" },
                  { label: "Detection", value: incidentDetail?.detection || "—" },
                  { label: "Blast Radius", value: incidentDetail?.blastRadius || "—" },
                  { label: "Root Cause", value: incidentDetail?.aiAnalysis?.suggestion ? "See Ezra brief" : "Not yet determined" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-5 py-3">
                    <span className="text-[12px] text-zinc-400 dark:text-zinc-500">{row.label}</span>
                    <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 text-right ml-3 truncate max-w-[160px]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Ownership Transfer */}
            <Card>
              <CardHeader icon={<ArrowLeftRight size={15} className="text-zinc-500" />} title="Ownership Transfer" />
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {[
                  { label: "From", value: handover.currentOwnerLabel },
                  { label: "To", value: handover.nextOwnerLabel },
                  {
                    label: "Commander",
                    value: handover.nextCommander ? `${handover.nextCommander.firstName} ${handover.nextCommander.lastName}` : "Unassigned",
                  },
                  {
                    label: "Transfer At",
                    value: `${new Date(handover.transferAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC`,
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-5 py-3">
                    <span className="text-[12px] text-zinc-400 dark:text-zinc-500">{row.label}</span>
                    <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">{row.value}</span>
                  </div>
                ))}
              </div>
              {!handover.isImmutable && (
                <div className="flex items-center gap-2 p-4">
                  <button
                    onClick={() => setIsOpenModal((prev) => ({ ...prev, transferOwnership: true }))}
                    className="flex-1 py-2.5 rounded-xl border border-emerald-500 dark:border-emerald-500/40 text-[13px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors"
                  >
                    Edit Transfer
                  </button>
                  <button
                    onClick={() => setIsOpenModal((prev) => ({ ...prev, transferOwnership: true }))}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:brightness-110"
                    style={{ background: "linear-gradient(135deg, #14532d, #22c55e)" }}
                  >
                    Confirm Now
                  </button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <AttachExistingHandover
        isOpen={isOpenModal.attachHandover}
        onClose={() => setIsOpenModal((prev) => ({ ...prev, attachHandover: false }))}
        currentHandoverId={handover.id}
        currentHandoverRef={handover.handoverRef}
        currentIncidents={handover.incidents}
        onAttached={invalidate}
      />

      <TransferOwnershipModal
        isOpen={isOpenModal.transferOwnership}
        onClose={() => setIsOpenModal((prev) => ({ ...prev, transferOwnership: false }))}
        handover={handover}
        onTransferred={invalidate}
      />

      <AddIncidentModal
        isOpen={isOpenModal.addIncidentHandover}
        onClose={() => setIsOpenModal((prev) => ({ ...prev, addIncidentHandover: false }))}
        handoverId={handover.id}
        excludeIncidentIds={handover.incidents.map((i) => i.incidentId)}
        onAdded={invalidate}
      />

      <AddTaskModal
        isOpen={isOpenModal.addTask}
        onClose={() => setIsOpenModal((prev) => ({ ...prev, addTask: false }))}
        handoverId={handover.id}
        onAdded={invalidate}
      />

      <RollbackProductionModal
        isOpen={isOpenModal.rollback}
        onClose={() => setIsOpenModal((prev) => ({ ...prev, rollback: false }))}
        handoverId={handover.id}
        task={activeTask}
        onResolved={invalidate}
      />

      <AddNoteModal
        isOpen={isOpenModal.addHandoverNote}
        onClose={() => setIsOpenModal((prev) => ({ ...prev, addHandoverNote: false }))}
        handoverId={handover.id}
        onAdded={invalidate}
      />
    </div>
  );
}
