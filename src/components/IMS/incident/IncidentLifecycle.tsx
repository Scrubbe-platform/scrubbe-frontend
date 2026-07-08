"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import ResolveIncidentForm from "./ResolveIncidentForm";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import {
  acknowledgeIncident,
  investigateIncident,
  mitigateIncident,
  closeIncident,
} from "@/lib/incident/incident.api";
import { querykeys } from "@/lib/constant";
import { CiWavePulse1 } from "react-icons/ci";

// --- Types ---

// Real server-side ticket statuses that a human can manually transition between.
// (DETECTED / ENRICHED / ACTION_PROPOSED / EXECUTING are automation-only states.)
type TicketStatusValue =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "INVESTIGATION"
  | "MITIGATED"
  | "RESOLVED"
  | "CLOSED";

interface StatusMeta {
  id: number;
  label: TicketStatusValue;
  display: string;
  dotColor: string;
  ribbonActive: string;
  ribbonDone: string;
  textColor: string;
}

export const TICKET_STATUS_CONFIG: StatusMeta[] = [
  {
    id: 1,
    label: "OPEN",
    display: "Open",
    dotColor: "bg-cyan-400",
    ribbonActive: "bg-cyan-500 text-white border-l-cyan-500",
    ribbonDone: "bg-cyan-500/5 text-cyan-600 dark:text-cyan-400/40",
    textColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    id: 2,
    label: "ACKNOWLEDGED",
    display: "Acknowledged",
    dotColor: "bg-amber-500",
    ribbonActive: "bg-amber-500 text-white border-l-amber-500",
    ribbonDone: "bg-amber-500/5 text-amber-600 dark:text-[#f3ab3d]/40",
    textColor: "text-amber-500 dark:text-[#f3ab3d]",
  },
  {
    id: 3,
    label: "INVESTIGATION",
    display: "Investigating",
    dotColor: "bg-blue-500",
    ribbonActive: "bg-blue-500 text-white border-l-blue-500",
    ribbonDone: "bg-blue-500/5 text-blue-600 dark:text-blue-400/40",
    textColor: "text-blue-500 dark:text-blue-400",
  },
  {
    id: 4,
    label: "MITIGATED",
    display: "Mitigated",
    dotColor: "bg-orange-500",
    ribbonActive: "bg-orange-500 text-white border-l-orange-500",
    ribbonDone: "bg-orange-500/5 text-orange-600 dark:text-orange-400/40",
    textColor: "text-orange-500 dark:text-orange-400",
  },
  {
    id: 5,
    label: "RESOLVED",
    display: "Resolved",
    dotColor: "bg-emerald-500",
    ribbonActive: "bg-emerald-500 text-white border-l-emerald-500",
    ribbonDone: "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400/40",
    textColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    id: 6,
    label: "CLOSED",
    display: "Closed",
    dotColor: "bg-zinc-500",
    ribbonActive: "bg-zinc-600 text-white border-l-zinc-600",
    ribbonDone: "bg-zinc-500/5 text-zinc-600 dark:text-zinc-400/40",
    textColor: "text-zinc-500 dark:text-zinc-400",
  },
];

type Props = {
  incident: IncidentDetailRecord;
};

export default function IncidentLifecycleManager({ incident }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const currentStatus = (
    incident.status || "OPEN"
  ).toUpperCase() as TicketStatusValue;
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenResolve, setIsOpenResolve] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeIndex = TICKET_STATUS_CONFIG.findIndex(
    (s) => s.label === currentStatus,
  );
  const activeMeta =
    activeIndex >= 0
      ? TICKET_STATUS_CONFIG[activeIndex]
      : TICKET_STATUS_CONFIG[0];
  const isTerminal = currentStatus === "CLOSED";

  const refreshIncident = () => {
    queryClient.invalidateQueries({
      queryKey: [querykeys.INCIDENT_DETAIL, incident.id],
    });
    queryClient.invalidateQueries({ queryKey: [querykeys.INCIDENT_TICKET] });
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (label: TicketStatusValue) => {
    setIsOpen(false);
    if (label === currentStatus) return;

    if (label === "RESOLVED") {
      if (currentStatus === "RESOLVED") return;
      setIsOpenResolve(true);
      return;
    }

    if (label === "CLOSED" && currentStatus !== "RESOLVED") {
      // Closing requires the incident to be resolved (and have a postmortem) first.
      return;
    }

    const transition = {
      ACKNOWLEDGED: acknowledgeIncident,
      INVESTIGATION: investigateIncident,
      MITIGATED: mitigateIncident,
      CLOSED: closeIncident,
    }[label as "ACKNOWLEDGED" | "INVESTIGATION" | "MITIGATED" | "CLOSED"];

    if (!transition) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      await transition(incident.id);
      refreshIncident();
    } catch {
      setSaveError("Failed to update incident status. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolved = (postMortemId?: string) => {
    setIsOpenResolve(false);
    refreshIncident();
    if (postMortemId) {
      router.push(`/incident/postmortems/${postMortemId}`);
    }
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-[#030712] p-4 md:p-6 space-y-6 font-sans transition-colors duration-300">
      <Modal isOpen={isOpenResolve} onClose={() => setIsOpenResolve(false)}>
        <ResolveIncidentForm
          onClose={() => setIsOpenResolve(false)}
          incident={incident}
          onResolved={handleResolved}
        />
      </Modal>
      {/* ─────────────────────────────────────────────────────────────────
          RIBBON STEP TRACKER (Top Component)
          ───────────────────────────────────────────────────────────────── */}
      <div className="flex flex-row justify-between items-center gap-2">
        <div className="space-y-4 w-full">
          <div className="flex items-center gap-3">
            <p className="text-[11px] font-mono font-bold tracking-[0.15em] text-black dark:text-slate-500 uppercase">
              Incident Lifecycle
            </p>
            <div className="w-[70%] h-0.5 bg-zinc-200 " />
          </div>

          {/* Scrollable Ribbon Wrapper */}
          <div className="overflow-x-auto no-scrollbar dark:border-white/5 rounded-sm bg-transparent dark:bg-[#0b1329]">
            <div className="flex w-full max-w-2xl h-[50px] bg-transparent">
              {TICKET_STATUS_CONFIG.map((stage, idx) => {
                const isCompleted = idx < activeIndex;
                const isCurrent = idx === activeIndex;
                const isPending = idx > activeIndex;

                return (
                  <div
                    key={stage.label}
                    style={{ zIndex: TICKET_STATUS_CONFIG.length + idx }}
                    className={cn(
                      "relative flex-1 flex flex-col justify-center pl-8 pr-4 h-full transition-all duration-300",
                      "clip-path-chevron",
                      isCompleted && stage.ribbonDone,
                      isCurrent && stage.ribbonActive,
                      isPending &&
                        "bg-zinc-200 dark:bg-[#0e172e] text-zinc-500 dark:text-slate-600",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Status Node Indicators */}

                      <div className="flex flex-col select-none">
                        <div className="flex items-center  gap-2">
                          <div className="shrink-0 flex items-center justify-center">
                            {isCompleted ? (
                              <Check
                                size={12}
                                strokeWidth={3}
                                className={stage.textColor}
                              />
                            ) : isCurrent ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-current" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-slate-700" />
                            )}
                          </div>
                          <span className="text-[9px] font-mono font-bold tracking-wider opacity-60 uppercase">
                            Stage {stage.id}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold tracking-tight uppercase">
                          {stage.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative group inline-block">
          <span className="absolute inset-0 rounded-full bg-black/30 animate-ping pointer-events-none" />

          <div
            onClick={() => router.push(`/incident/tickets/qa/${incident.id}`)}
            className="relative z-10 size-10 flex justify-center items-center rounded-full bg-black shadow-lg shadow-zinc-200 cursor-pointer active:scale-95 transition-transform"
          >
            <CiWavePulse1 size={22} className="text-white stroke-2" />
          </div>

          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-2.5 py-1.5 bg-zinc-900 text-white text-[11px] font-semibold font-sans rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-md transform translate-y-1 group-hover:translate-y-0">
            Analyze Quality (IQA)
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          INCIDENT MANAGEMENT CONTROLLER CARD (Bottom Component)
          ───────────────────────────────────────────────────────────────── */}
      <div className="w-full hidden bg-white dark:bg-[#080f21] border border-zinc-700 dark:border-white/5 rounded-xl p-5 md:p-6 space-y-6 shadow-sm">
        <div className=" flex justify-between gap-6 items-center">
          {/* Dropdown Field */}
          <div
            ref={dropdownRef}
            className="space-y-2 relative max-w-[400px] w-full"
          >
            <label className="block text-[11px] font-mono font-bold tracking-wider text-black dark:text-slate-500 uppercase">
              Incident State
            </label>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              disabled={isSaving || isTerminal}
              className={cn(
                "w-full h-[48px] px-4 rounded-xl border flex items-center justify-between text-left transition-all bg-white dark:bg-[#091124] disabled:opacity-70 disabled:cursor-not-allowed",
                isOpen
                  ? "border-blue-500 dark:border-blue-500 ring-4 ring-blue-500/10 shadow-sm"
                  : "border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10",
              )}
            >
              <div className="flex items-center gap-3">
                {isSaving ? (
                  <Loader2
                    size={14}
                    className="animate-spin text-slate-400 shrink-0"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full shrink-0",
                      activeMeta.dotColor,
                    )}
                  />
                )}
                <span className="text-[14px] font-bold text-black dark:text-white">
                  {isSaving ? "Updating..." : activeMeta.display}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "text-black dark:text-slate-500 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {/* Custom Popover Dropdown Selection Options */}
            {isOpen && (
              <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white dark:bg-[#0e172e] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden p-1.5 space-y-0.5">
                {TICKET_STATUS_CONFIG.map((stage, idx) => {
                  const isCurrentItem = stage.label === currentStatus;
                  const isDoneItem = idx < activeIndex;
                  const isLockedClosed =
                    stage.label === "CLOSED" && currentStatus !== "RESOLVED";

                  return (
                    <button
                      key={stage.label}
                      type="button"
                      onClick={() => handleSelect(stage.label)}
                      disabled={isLockedClosed}
                      title={
                        isLockedClosed
                          ? "Resolve the incident before closing it"
                          : undefined
                      }
                      className={cn(
                        "w-full h-[42px] px-3 rounded-lg flex items-center justify-between text-left transition-colors group",
                        isLockedClosed && "opacity-40 cursor-not-allowed",
                        isCurrentItem
                          ? "bg-slate-100 dark:bg-white/5"
                          : "hover:bg-slate-50 dark:hover:bg-white/[0.02]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full shrink-0",
                            stage.dotColor,
                          )}
                        />
                        <span className="text-[13px] font-bold text-black dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                          {stage.display}
                        </span>
                      </div>

                      <div className="flex items-center">
                        {isCurrentItem ? (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-[#f3ab3d] rounded border border-amber-500/20">
                            CURRENT
                          </span>
                        ) : isDoneItem ? (
                          <span
                            className={cn(
                              "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border bg-opacity-10 dark:bg-opacity-20",
                              stage.textColor,
                              "bg-current/10 border-current/20",
                            )}
                          >
                            DONE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-black dark:text-slate-600">
                            Stage {stage.id}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Progress panel metric column */}
          <div className="md:col-span-7 space-y-1.5 md:pl-6 md:border-l border-slate-100 dark:border-white/5 text-end">
            <label className="block text-[11px] font-mono font-bold tracking-wider text-black dark:text-slate-500 uppercase">
              Progress
            </label>
            <p className="text-xl font-bold text-black dark:text-white flex items-center">
              Stage {activeMeta.id} of {TICKET_STATUS_CONFIG.length}
            </p>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-white/5" />

        {saveError && (
          <p className="text-[13px] font-semibold text-red-500">{saveError}</p>
        )}

        <p className="text-[13px] italic text-black dark:text-slate-500 leading-relaxed">
          {isTerminal ? (
            <>
              This incident is{" "}
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                closed
              </span>{" "}
              and its lifecycle is locked.
            </>
          ) : (
            <>
              Set the incident state from the dropdown — the lifecycle ribbon
              updates to reflect the current stage. Choosing{" "}
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Resolved
              </span>{" "}
              opens a resolution checklist that must be completed first. Closing
              is only available once an incident is resolved. Every change is
              written to the audit trail below.
            </>
          )}
        </p>
      </div>

      {/* Clip-Path Utility Definitions */}
      <style jsx global>{`
        .clip-path-chevron {
          clip-path: polygon(
            0% 0%,
            calc(100% - 14px) 0%,
            100% 50%,
            calc(100% - 14px) 100%,
            0% 100%,
            14px 50%
          );
        }
        .clip-path-chevron:first-child {
          padding-left: 1.5rem !important;
          clip-path: polygon(
            0% 0%,
            calc(100% - 14px) 0%,
            100% 50%,
            calc(100% - 14px) 100%,
            0% 100%
          );
        }
      `}</style>
    </div>
  );
}
