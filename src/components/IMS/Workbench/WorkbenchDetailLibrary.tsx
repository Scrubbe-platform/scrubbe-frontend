"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { X, ExternalLink } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkbenchRecord } from "./WorkbenchLibraryPage";
import { fetchIncidentDetail, fetchIncidentHistory } from "@/lib/incident/incident.api";
import { fetchHandovers, addHandoverIncident } from "@/lib/handover/handover.api";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import useMember from "@/hooks/useMember";

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
          {v || "—"}
        </p>
      </div>
    ))}
  </div>
);

const Divider = () => (
  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-3" />
);

const EmptyNote = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[12px] text-zinc-400 dark:text-zinc-500">{children}</p>
);

// ── Component ─────────────────────────────────────────────────────

interface Props {
  workbench: WorkbenchRecord;
  onClose: () => void;
}

const WorkbenchDetailModal: React.FC<Props> = ({ workbench: wb, onClose }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { get } = useFetch();
  const { data: members = [] } = useMember();

  const resolveActor = (id?: string | null) => {
    if (!id) return "system";
    const member = members.find((m) => m.id === id);
    return member ? `${member.firstname} ${member.lastname}` : id;
  };

  const { data: incident } = useQuery({
    queryKey: ["workbench-incident-detail", wb.incidentId],
    queryFn: () => fetchIncidentDetail(wb.incidentId),
    enabled: !!wb.incidentId,
  });

  const { data: history = [] } = useQuery({
    queryKey: ["workbench-incident-history", wb.incidentId],
    queryFn: () => fetchIncidentHistory(wb.incidentId),
    enabled: !!wb.incidentId,
  });

  const { data: execution } = useQuery({
    queryKey: ["workbench-playbook-execution", wb.incidentId],
    queryFn: async () => {
      const res = await get(`${endpoint.playbooks.executions}?ticketId=${wb.incidentId}&limit=1`);
      const execs: any[] = res.data?.data?.executions ?? res.data?.data ?? [];
      return execs[0] ?? null;
    },
    enabled: !!wb.incidentId,
  });

  const { data: ezraAnalysis } = useQuery({
    queryKey: ["workbench-ezra-analysis", wb.incidentId],
    queryFn: async () => {
      const res = await get(`${endpoint.ezra.analysis}/${wb.incidentId}`);
      return res.success ? (res.data?.data ?? null) : null;
    },
    enabled: !!wb.incidentId,
  });

  const { data: handovers = [] } = useQuery({
    queryKey: ["workbench-handovers"],
    queryFn: () => fetchHandovers(),
  });

  const { data: postmortems = [] } = useQuery({
    queryKey: ["workbench-postmortems"],
    queryFn: async () => {
      const res = await get(`${endpoint.postmortems.list}?limit=50`);
      return res.data?.data?.postmortems ?? res.data?.data ?? [];
    },
  });

  const matchingHandover = handovers.find((h) =>
    h.incidents.some(
      (link) => link.incident.id === incident?.id || link.incidentId === wb.incidentId || link.incident.ticketId === wb.incidentId
    )
  );
  const activeHandover = handovers.find((h) => h.status !== "COMPLETED");

  const matchingPostmortem = postmortems.find(
    (pm: any) => pm.ticket?.id === incident?.id || pm.ticket?.ticketId === wb.incidentId
  );

  const feedToHandover = useMutation({
    mutationFn: async () => {
      if (!activeHandover || !incident) throw new Error("No active handover or incident");
      return addHandoverIncident(activeHandover.id, { incidentId: incident.id });
    },
    onSuccess: () => {
      toast.success("Incident added to active handover");
      queryClient.invalidateQueries({ queryKey: ["workbench-handovers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const incidentContext = incident
    ? {
        Service: incident.service || incident.affectedSystem || "—",
        Environment: incident.environment || "—",
        Region: incident.region || "—",
        Status: incident.status || "—",
      }
    : null;

  const incidentDetails = incident
    ? {
        Summary: incident.summary || incident.title || "—",
        Detection: incident.detection || "—",
        "Reported by": incident.reportedBy || incident.userName || "—",
        Priority: incident.priority || incident.severity || "—",
      }
    : null;

  const timeline = history.length > 0
    ? history.slice(0, 6).reduce<Record<string, string>>((acc, item) => {
        const ts = new Date(item.timestamp).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        acc[ts] = `${item.action}${item.newValue ? ` → ${item.newValue}` : ""}`;
        return acc;
      }, {})
    : null;

  const diagnosis = incident
    ? {
        "Root cause": incident.aiAnalysis?.suggestion || "No AI analysis generated yet.",
        "Tech description": incident.techDescription || "—",
        Impact: incident.impactSummary || "—",
      }
    : null;

  const roles = incident
    ? {
        "Incident commander": incident.incidentCommander || "—",
        "Assigned to": incident.assignedToName || incident.assignedToEmail || "—",
        "Owning squad": incident.owningSquad || "—",
      }
    : null;

  const comms = incident?.aiAnalysis?.stakeholderMsg
    ? { "Stakeholder message": incident.aiAnalysis.stakeholderMsg }
    : null;

  const playbookUsed = execution?.playbook?.name;
  const playbookOwner = execution ? resolveActor(execution.triggeredBy) : undefined;
  const completion = execution?.stepOutcomes?.length
    ? Math.round(
        (execution.stepOutcomes.filter((s: any) => s.status === "COMPLETED" || s.status === "SKIPPED").length /
          execution.stepOutcomes.length) *
          100
      )
    : undefined;

  const aiReasons: string[] | undefined = ezraAnalysis?.rootCause?.hypotheses?.length
    ? ezraAnalysis.rootCause.hypotheses.map((h: any) => h.title ?? h.description).filter(Boolean)
    : undefined;
  const modelConfidence = ezraAnalysis?.rootCause?.confidence
    ? Math.round(ezraAnalysis.rootCause.confidence * 100)
    : undefined;

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
          {incidentContext && (
            <Card>
              <CardTitle>Incident Context</CardTitle>
              <FieldGrid fields={incidentContext} />
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => router.push(`/incident/tickets/${incident?.id ?? wb.incidentId}`)}
                  className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500 dark:border-emerald-500/40 rounded-lg px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink size={12} /> View Incident
                </button>
              </div>
            </Card>
          )}

          {/* Incident Details */}
          {incidentDetails && (
            <Card>
              <CardTitle>Incident Details</CardTitle>
              <FieldGrid fields={incidentDetails} />
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardTitle>Timeline</CardTitle>
            {timeline ? <FieldGrid fields={timeline} /> : <EmptyNote>No history recorded for this incident yet.</EmptyNote>}
          </Card>

          {/* Diagnosis & response */}
          {diagnosis && (
            <Card>
              <CardTitle>Diagnosis &amp; response</CardTitle>
              <FieldGrid fields={diagnosis} />
            </Card>
          )}

          {/* Roles & ownership */}
          {roles && (
            <Card>
              <CardTitle>Roles &amp; ownership</CardTitle>
              <FieldGrid fields={roles} />
            </Card>
          )}

          {/* Communication & Notification */}
          {comms && (
            <Card>
              <CardTitle>Communication &amp; Notification</CardTitle>
              <FieldGrid fields={comms} />
            </Card>
          )}

          {/* Playbook */}
          <Card>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
              Playbook Execution
            </p>
            {playbookUsed ? (
              <>
                <p className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 mb-3 mt-2">
                  {playbookUsed}
                </p>
                <Divider />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                  Triggered by
                </p>
                <p className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
                  {playbookOwner}
                </p>
                {completion !== undefined && (
                  <>
                    <Divider />
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                        Completion — {completion}%
                      </p>
                    </div>
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </>
                )}
              </>
            ) : (
              <EmptyNote>No playbook has been executed for this incident.</EmptyNote>
            )}
          </Card>

          {/* AI Decision Analysis */}
          <Card>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
              AI Decision Analysis
            </p>
            {aiReasons && aiReasons.length > 0 ? (
              <>
                <p className="text-[16px] font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                  Root-cause hypotheses
                </p>
                <div className="space-y-2.5 mb-5">
                  {aiReasons.map((r) => (
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
                {modelConfidence !== undefined && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[32px] font-black text-blue-600 dark:text-blue-400">
                      {modelConfidence}%
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      Model Confidence
                    </span>
                  </div>
                )}
              </>
            ) : (
              <EmptyNote>No Ezra analysis has been generated for this incident yet.</EmptyNote>
            )}
          </Card>

          {/* Handover Integration */}
          <Card>
            <CardTitle>Handover integration</CardTitle>
            {matchingHandover ? (
              <FieldGrid
                fields={{
                  Status: matchingHandover.status,
                  "Current owner": matchingHandover.currentOwnerLabel,
                  "Next owner": matchingHandover.nextOwnerLabel,
                }}
              />
            ) : (
              <EmptyNote>This incident is not part of any handover record.</EmptyNote>
            )}
            {!matchingHandover && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => feedToHandover.mutate()}
                  disabled={!activeHandover || feedToHandover.isPending}
                  className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500 dark:border-emerald-500/40 rounded-lg px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors disabled:opacity-40"
                >
                  {activeHandover ? "Feed to active handover" : "No active handover"}
                </button>
              </div>
            )}
          </Card>

          {/* Knowledge Intelligence */}
          <Card>
            <CardTitle>Knowledge intelligence</CardTitle>
            <EmptyNote>Knowledge search is not available yet — coming soon.</EmptyNote>
          </Card>

          {/* Postmortem Integration */}
          <Card>
            <CardTitle>Postmortem integration</CardTitle>
            {matchingPostmortem ? (
              <>
                <p className="text-[13px] text-zinc-700 dark:text-zinc-300 mb-5">
                  {matchingPostmortem.title ?? "Postmortem record found for this incident."}
                </p>
                <button
                  onClick={() => router.push(`/incident/postmortems/${matchingPostmortem.id}`)}
                  className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                >
                  Open PostMortem
                </button>
              </>
            ) : (
              <EmptyNote>No postmortem has been created for this incident yet.</EmptyNote>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default WorkbenchDetailModal;
