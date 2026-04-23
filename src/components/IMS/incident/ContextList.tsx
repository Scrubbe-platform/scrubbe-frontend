import React from "react";

// --- Types ---

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

// --- Sub-Components ---

const ContextRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="border-b border-white/10 py-5 flex flex-col gap-2">
    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
      {label}
    </span>
    <div className="text-white text-[14px] font-medium leading-relaxed">
      {children}
    </div>
  </div>
);

const TagPill = ({ label }: { label: string }) => (
  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-white">
    {label}
  </span>
);

// --- Main Component ---

const IncidentContextView: React.FC<SubmittedContextProps> = ({
  submittedBy,
  submittedAt,
  data,
}) => {
  return (
    <div className="w-full rounded-2xl p-6 border border-green-400/30 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white opacity-90 tracking-tight">
          Incident Context
        </h2>
        <div className="text-[12px] text-slate-500 font-medium">
          Submitted by <span className="text-slate-300">{submittedBy}</span> ·{" "}
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
            {data.labels.map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        </ContextRow>

        <ContextRow label="Related incidents">
          <div className="flex gap-2">
            {data.relatedIncidents.map((id) => (
              <TagPill key={id} label={id} />
            ))}
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
            <span className="text-slate-600 italic">None provided</span>
          )}
        </ContextRow>

        <ContextRow label="Escalate to">{data.escalateTo}</ContextRow>

        <ContextRow label="Evidence & attachments">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-white font-semibold">
              {data.evidenceCount} files
            </span>{" "}
            attached to this incident
          </div>
        </ContextRow>
      </div>
    </div>
  );
};

// --- Example Usage ---

export default function ContextList() {
  const sampleData = {
    customerImpact: "Partial degradation - Checkout affected",
    externalCommunication: "Not required",
    incidentCommander: "Alice Shen ( SRE Lead )",
    businessImpact: "£1,800 / min",
    additionalContext:
      "Deploy #311 coincided with a marketing campaign launch — traffic is 41% above baseline. Team is aware. DB pool fix is the right path.",
    labels: ["db-pool", "Deployment", "Checkout"],
    relatedIncidents: ["SI-0002310", "SI-0001870"],
    runbookOverrideUrl: "https://wiki.internal/runbooks/db-exhaustion",
    escalateTo: "Service Owner + Change Manager",
    evidenceCount: 4,
  };

  return (
    <div className="p-5">
      <IncidentContextView
        submittedBy="Alice Shen"
        submittedAt="19/4/26"
        data={sampleData}
      />
    </div>
  );
}
