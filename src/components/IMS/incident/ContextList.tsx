import React from "react";
import {
  IncidentContextRecord,
  IncidentDetailRecord,
} from "@/lib/incident/incident.types";
import { getIncidentSubmittedAt } from "@/lib/incident/incident.mapper";

interface SubmittedContextProps {
  submittedBy: string;
  submittedAt: string;
  data: {
    customerImpact: string;
    externalCommunication: string;
    incidentCommander: string;
    businessImpact: string;
    additionalContext: string;
    labels: string[];
    relatedIncidents: string[];
    runbookOverrideUrl?: string;
    escalateTo: string;
    evidenceCount: number;
  };
}

const ContextRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="border-b border-zinc-200 dark:border-white/10 py-5 flex flex-col gap-2">
    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
      {label}
    </span>
    <div className="text-zinc-900 dark:text-white text-[14px] font-medium leading-relaxed">
      {children}
    </div>
  </div>
);

const TagPill = ({ label }: { label: string }) => (
  <span className="px-3 py-1 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded text-xs text-zinc-800 dark:text-white">
    {label}
  </span>
);

const IncidentContextView: React.FC<SubmittedContextProps> = ({
  submittedBy,
  submittedAt,
  data,
}) => {
  return (
    <div className="w-full rounded-2xl p-6 border border-green-400/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white opacity-90 tracking-tight">
          Incident Context
        </h2>
        <div className="text-[12px] text-slate-500 font-medium">
          Submitted by <span className="text-slate-600 dark:text-slate-300">{submittedBy}</span> ·{" "}
          {submittedAt}
        </div>
      </div>

      <div className="flex flex-col">
        <ContextRow label="Customer Impact">{data.customerImpact}</ContextRow>

        <ContextRow label="External communication">
          <TagPill label={data.externalCommunication} />
        </ContextRow>

        <ContextRow label="Incident commander">
          {data.incidentCommander}
        </ContextRow>

        <ContextRow label="Business impact">{data.businessImpact}</ContextRow>

        <ContextRow label="Additional Context">
          {data.additionalContext}
        </ContextRow>

        <ContextRow label="Labels / tags">
          <div className="flex gap-2 flex-wrap">
            {data.labels.length > 0 ? (
              data.labels.map((tag) => <TagPill key={tag} label={tag} />)
            ) : (
              <span className="text-slate-600 dark:text-slate-400 italic">No labels added</span>
            )}
          </div>
        </ContextRow>

        <ContextRow label="Related incidents">
          <div className="flex gap-2 flex-wrap">
            {data.relatedIncidents.length > 0 ? (
              data.relatedIncidents.map((id) => <TagPill key={id} label={id} />)
            ) : (
              <span className="text-slate-600 dark:text-slate-400 italic">None linked</span>
            )}
          </div>
        </ContextRow>

        <ContextRow label="Runbook override URL">
          {data.runbookOverrideUrl ? (
            <a
              href={data.runbookOverrideUrl}
              className="text-green-400 hover:underline"
            >
              {data.runbookOverrideUrl}
            </a>
          ) : (
            <span className="text-slate-600 dark:text-slate-400 italic">None provided</span>
          )}
        </ContextRow>

        <ContextRow label="Escalate to">{data.escalateTo}</ContextRow>

        <ContextRow label="Evidence & attachments">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="text-zinc-900 dark:text-white font-semibold">
              {data.evidenceCount} files
            </span>{" "}
            attached to this incident
          </div>
        </ContextRow>
      </div>
    </div>
  );
};

export default function ContextList({
  context,
  incident,
}: {
  context: IncidentContextRecord | null;
  incident: IncidentDetailRecord;
}) {
  if (!context) {
    return (
      <div className="p-5">
        <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-white/10 p-6 text-sm text-slate-600 dark:text-slate-400">
          No context has been saved for {incident.ticketId} yet. Add incident
          context below to enrich this workspace.
        </div>
      </div>
    );
  }

  const submittedAtValue = getIncidentSubmittedAt(context);
  const submittedAt = submittedAtValue
    ? new Date(submittedAtValue).toLocaleString()
    : "Unknown time";

  return (
    <div className="p-5">
      <IncidentContextView
        submittedBy={context.submittedBy || "A team member"}
        submittedAt={submittedAt}
        data={{
          customerImpact: context.customerImpact || "Not recorded",
          externalCommunication:
            context.externalCommunication || "Not recorded",
          incidentCommander:
            context.incidentCommander ||
            incident.incidentCommander ||
            "Not assigned",
          businessImpact: context.businessImpact || "Not recorded",
          additionalContext: context.additionalContext || "Not recorded",
          labels: context.labels,
          relatedIncidents: context.relatedIncidents,
          runbookOverrideUrl: context.runbookOverrideUrl,
          escalateTo: context.escalateTo || "Not recorded",
          evidenceCount: context.attachments.length,
        }}
      />
    </div>
  );
}
