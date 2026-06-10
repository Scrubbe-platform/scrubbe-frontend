"use client";
import React from "react";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { useRouter } from "next/navigation";

interface Props {
  incident: IncidentDetailRecord;
  onClose: () => void;
  onGoToWorkbench: () => void;
}

/**
 * Shown after saving context when severity was upgraded to P0.
 * Prompts the user to fill the Major Incident Workbench form.
 */
const P0UpgradePromptModal: React.FC<Props> = ({
  incident,
  onClose,
  onGoToWorkbench,
}) => {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[480px] bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <X size={13} />
        </button>

        {/* Red accent top strip */}

        <div className="px-7 py-7">
          {/* Icon + heading */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-500 mb-1">
                Major Incident Declared
              </p>
              <h2 className="text-[18px] font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                Complete the P0 Workbench
              </h2>
            </div>
          </div>

          {/* Incident pill */}
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 mb-5">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mb-0.5">
                {incident.ticketId}
              </p>
              <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {incident.title}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded px-2 py-0.5">
                {incident.severity}
              </span>
              <ArrowRight size={13} className="text-zinc-400" />
              <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded px-2 py-0.5">
                P0 (MAJOR)
              </span>
            </div>
          </div>

          <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5">
            Your context has been saved. Upgrading to{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">P0</strong>{" "}
            will formally declare this as a Major Incident. The Workbench
            collects the additional information required to activate major
            incident procedures.
          </p>

          {/* What happens list */}
          <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3.5 mb-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">
              Once declared
            </p>
            <ul className="space-y-1.5 text-[12px] text-amber-800 dark:text-amber-300">
              {[
                "Incident priority will be set to P0 automatically",
                "Major incident procedures will be initiated",
                "It will be visible in the major incidents workbench",
                "Stakeholders and subscribers will be notified",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 shrink-0">›</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Do it later
            </button>
            <button
              onClick={() => {
                router.push(`/incident/workbench/${incident.id}/`);
              }}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
            >
              Open Workbench <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default P0UpgradePromptModal;
