"use client";
import React, { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { WorkbenchRecord } from "./WorkbenchLibraryPage";

// ── Helpers ───────────────────────────────────────────────────────

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 mb-4 ${className}`}
  >
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 mb-4">
    {children}
  </p>
);

const FieldGrid = ({ fields }: { fields: Record<string, string> }) => (
  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
    {Object.entries(fields).map(([k, v]) => (
      <div key={k}>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-0.5">
          {k}
        </p>
        <p
          className={`text-[13px] font-medium leading-snug ${k === "Priority" ? "text-red-500 font-bold bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-2 py-0.5 rounded w-fit text-[12px]" : "text-zinc-800 dark:text-zinc-200"}`}
        >
          {v}
        </p>
      </div>
    ))}
  </div>
);

const Divider = () => (
  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-3" />
);

// ── Component ─────────────────────────────────────────────────────

interface Props {
  workbench: WorkbenchRecord;
  onClose: () => void;
}

const WorkbenchDetailModal: React.FC<Props> = ({ workbench: wb, onClose }) => {
  const [knowledgeQ, setKnowledgeQ] = useState(wb.knowledgeQuery ?? "");
  const [asked, setAsked] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[520px] max-w-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div>
            <h2 className="text-[16px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight mb-0.5">
              {wb.title}
            </h2>
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
              {wb.incidentId}
              {wb.declaredAt ? ` · ${wb.declaredAt}` : ""}
              {wb.declaredBy ? ` · declared by ${wb.declaredBy}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 ml-4"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Incident Context */}
          {wb.incidentContext && (
            <Card>
              <CardTitle>Incident Context</CardTitle>
              <FieldGrid fields={wb.incidentContext} />
              <div className="flex justify-end mt-4">
                <button className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500 dark:border-emerald-500/40 rounded-lg px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors flex items-center gap-1.5">
                  <ExternalLink size={12} /> View Incident
                </button>
              </div>
            </Card>
          )}

          {/* Incident Details */}
          {wb.incidentDetails && (
            <Card>
              <CardTitle>Incident Details</CardTitle>
              <FieldGrid fields={wb.incidentDetails} />
            </Card>
          )}

          {/* Timeline */}
          {wb.timeline && (
            <Card>
              <CardTitle>Timeline</CardTitle>
              <FieldGrid fields={wb.timeline} />
            </Card>
          )}

          {/* Diagnosis & response */}
          {wb.diagnosis && (
            <Card>
              <CardTitle>Diagnosis &amp; response</CardTitle>
              <FieldGrid fields={wb.diagnosis} />
            </Card>
          )}

          {/* Roles & ownership */}
          {wb.roles && (
            <Card>
              <CardTitle>Roles &amp; ownership</CardTitle>
              <FieldGrid fields={wb.roles} />
            </Card>
          )}

          {/* Communication & Notification */}
          {wb.comms && (
            <Card>
              <CardTitle>Communication &amp; Notification</CardTitle>
              <FieldGrid fields={wb.comms} />
            </Card>
          )}

          {/* Playbook */}
          {wb.playbookUsed && (
            <Card>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                Playbook Used
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1 mt-3">
                Playbook Executed
              </p>
              <p className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                {wb.playbookUsed}
              </p>
              <Divider />
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                Owner
              </p>
              <p className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
                {wb.playbookOwner}
              </p>
              {wb.completion !== undefined && (
                <>
                  <Divider />
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      Completion — {wb.completion}%
                    </p>
                  </div>
                  <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${wb.completion}%` }}
                    />
                  </div>
                </>
              )}
            </Card>
          )}

          {/* AI Decision Analysis */}
          {wb.aiReasons && (
            <Card>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
                AI Decision Analysis
              </p>
              <p className="text-[16px] font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Why was P0 declared?
              </p>
              <div className="space-y-2.5 mb-5">
                {wb.aiReasons.map((r) => (
                  <div key={r} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path
                          d="M1.5 4l2 2 3-3"
                          stroke="#3b82f6"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
                      {r}
                    </span>
                  </div>
                ))}
              </div>
              {wb.modelConfidence !== undefined && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-black text-blue-600 dark:text-blue-400">
                    {wb.modelConfidence}%
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Model Confidence
                  </span>
                </div>
              )}
            </Card>
          )}

          {/* Related Incidents */}
          {wb.relatedIncidents && wb.relatedIncidents.length > 0 && (
            <Card>
              <p className="text-[11px] font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200 mb-3">
                Related Incidents
              </p>
              <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
                {wb.relatedIncidents.map((id) => (
                  <div key={id} className="py-2.5">
                    <span className="text-[13px] font-mono text-zinc-600 dark:text-zinc-400">
                      {id}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Handover Integration */}
          {wb.handover && (
            <Card>
              <CardTitle>Handover integration</CardTitle>
              <FieldGrid fields={wb.handover} />
              <div className="flex justify-end mt-4">
                <button className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500 dark:border-emerald-500/40 rounded-lg px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors">
                  Feed to active handover
                </button>
              </div>
            </Card>
          )}

          {/* Knowledge Intelligence */}
          {(wb.knowledgeQuery || wb.knowledgeAnswer) && (
            <Card>
              <CardTitle>Knowledge intelligence</CardTitle>
              {wb.knowledgeAnswer && (
                <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-lg p-4 mb-4 text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                    "{wb.knowledgeQuery}"
                  </p>
                  <p>{wb.knowledgeAnswer}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={knowledgeQ}
                  onChange={(e) => setKnowledgeQ(e.target.value)}
                  placeholder="Ask Knowledge Intelligence"
                  className="flex-1 text-[13px] text-zinc-700 dark:text-zinc-300 bg-transparent outline-none placeholder:text-zinc-400"
                />
                <button
                  onClick={() => setAsked(true)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-bold transition-colors"
                >
                  Ask
                </button>
              </div>
            </Card>
          )}

          {/* Postmortem Integration */}
          {wb.postmortemItems && (
            <Card>
              <CardTitle>Postmortem integration</CardTitle>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-4">
                Automatically populated from this record — no duplicate work.
              </p>
              <div className="space-y-2.5 mb-6">
                {wb.postmortemItems.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center shrink-0">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 5l2.5 2.5 3.5-3.5"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors">
                  Open PostMortem
                </button>
                <button className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  Export Record
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkbenchDetailModal;
