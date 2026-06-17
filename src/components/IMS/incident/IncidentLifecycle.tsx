"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import ResolveIncidentForm from "./ResolveIncidentForm";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { LifecycleStage, STAGES_CONFIG } from "@/lib/constant/index";

// --- Types ---

type Props = {
  incident: IncidentDetailRecord;
};

export default function IncidentLifecycleManager({ incident }: Props) {
  const [currentStage, setCurrentStage] =
    useState<LifecycleStage>("INVESTIGATING");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenResolve, setIsOpenResolve] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeIndex = STAGES_CONFIG.findIndex((s) => s.label === currentStage);
  const activeMeta = STAGES_CONFIG[activeIndex];

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

  const handleSelect = (label: LifecycleStage) => {
    setCurrentStage(label);
    setIsOpen(false);
    if (label === "RESOLVED") {
      setIsOpenResolve(true);
    }
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-[#030712] p-4 md:p-6 space-y-6 font-sans transition-colors duration-300">
      <Modal isOpen={isOpenResolve} onClose={() => setIsOpenResolve(false)}>
        <ResolveIncidentForm
          onClose={() => setIsOpenResolve(false)}
          incident={incident}
        />
      </Modal>
      {/* ─────────────────────────────────────────────────────────────────
          RIBBON STEP TRACKER (Top Component)
          ───────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-[11px] font-mono font-bold tracking-[0.15em] text-black dark:text-slate-500 uppercase">
            Incident Lifecycle
          </p>
          <div className="w-[70%] h-0.5 bg-zinc-100 " />
        </div>

        {/* Scrollable Ribbon Wrapper */}
        <div className="overflow-x-auto no-scrollbar dark:border-white/5 rounded-xl bg-transparent dark:bg-[#0b1329]">
          <div className="flex w-full h-[58px] bg-transparent">
            {STAGES_CONFIG.map((stage, idx) => {
              const isCompleted = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const isPending = idx > activeIndex;

              return (
                <div
                  key={stage.label}
                  style={{ zIndex: STAGES_CONFIG.length + idx }}
                  className={cn(
                    "relative flex-1 flex flex-col justify-center pl-8 pr-4 h-full transition-all duration-300",
                    // idx !== STAGES_CONFIG.length - 1 && "clip-path-chevron",
                    "clip-path-chevron",
                    isCompleted && stage.ribbonDone,
                    isCurrent && stage.ribbonActive,
                    isPending &&
                      "bg-zinc-200 dark:bg-[#0e172e] text-zinc-500 dark:text-slate-600",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Status Node Indicators */}
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

                    <div className="flex flex-col select-none">
                      <span className="text-[9px] font-mono font-bold tracking-wider opacity-60 uppercase">
                        Stage {stage.id}
                      </span>
                      <span className="text-[12px] font-bold tracking-tight uppercase">
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

      {/* ─────────────────────────────────────────────────────────────────
          INCIDENT MANAGEMENT CONTROLLER CARD (Bottom Component)
          ───────────────────────────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#080f21] border border-zinc-700 dark:border-white/5 rounded-xl p-5 md:p-6 space-y-6 shadow-sm">
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
              className={cn(
                "w-full h-[48px] px-4 rounded-xl border flex items-center justify-between text-left transition-all bg-white dark:bg-[#091124]",
                isOpen
                  ? "border-blue-500 dark:border-blue-500 ring-4 ring-blue-500/10 shadow-sm"
                  : "border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full shrink-0",
                    activeMeta.dotColor,
                  )}
                />
                <span className="text-[14px] font-bold text-black dark:text-white">
                  {activeMeta.display}
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
                {STAGES_CONFIG.map((stage, idx) => {
                  const isCurrentItem = stage.label === currentStage;
                  const isDoneItem = idx < activeIndex;

                  return (
                    <button
                      key={stage.label}
                      type="button"
                      onClick={() => handleSelect(stage.label)}
                      className={cn(
                        "w-full h-[42px] px-3 rounded-lg flex items-center justify-between text-left transition-colors group",
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
              Stage {activeMeta.id} of {STAGES_CONFIG.length}
            </p>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-white/5" />

        <p className="text-[13px] italic text-black dark:text-slate-500 leading-relaxed">
          Set the incident state from the dropdown — the lifecycle ribbon
          updates to reflect the current stage. Choosing{" "}
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            Resolved
          </span>{" "}
          opens a resolution checklist that must be completed first. Every
          change is written to the audit trail below.
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
