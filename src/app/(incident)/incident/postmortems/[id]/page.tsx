"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useIncidentDetail } from "@/hooks/useIncidentWorkspace";

const TABS = [
  "Basic Details",
  "Root Cause Analysis",
  "Resolution Details",
  "Knowledge base draft",
  "Follow up actions",
];

const DetailSection = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div>
    <h2 className="text-lg font-medium mb-1">{label}</h2>
    <p className="text-base font-light whitespace-pre-wrap">
      {value?.trim() ? value : "Not recorded"}
    </p>
  </div>
);

const Page = () => {
  const [tab, setTab] = useState(1);
  const { push } = useRouter();
  const params = useParams<{ id: string | string[] }>();
  const routeId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const detailQuery = useIncidentDetail(routeId);
  const incident = detailQuery.data ?? null;
  const postMortem = incident?.ResolveIncident ?? incident?.postMortem ?? null;

  if (detailQuery.isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 w-48 rounded bg-white/10" />
        <div className="h-96 rounded-xl bg-white/5" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-white">
          <h1 className="text-2xl font-bold">Postmortem not found</h1>
          <p className="mt-3 text-sm text-slate-400">
            This incident could not be resolved from the current route id.
          </p>
          <button
            onClick={() => push("/incident/postmortems")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-green-500/40 px-4 py-2 text-sm font-semibold text-green-400"
          >
            <ChevronLeft size={16} />
            Back to postmortems
          </button>
        </div>
      </div>
    );
  }

  if (!postMortem) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-white">
          <h1 className="text-2xl font-bold">{incident.ticketId}</h1>
          <p className="mt-3 text-sm text-slate-400">
            This incident does not have a saved postmortem yet.
          </p>
          <button
            onClick={() => push("/incident/postmortems")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-green-500/40 px-4 py-2 text-sm font-semibold text-green-400"
          >
            <ChevronLeft size={16} />
            Back to postmortems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-xl font-bold dark:text-white text-black">
        Postmortems
      </div>
      <div className="p-4 bg-white rounded-lg space-y-4">
        <button
          onClick={() => push("/incident/postmortems")}
          className="flex items-center gap-1 text-sm cursor-pointer"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Incident
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {incident.ticketId}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{incident.title}</p>
        </div>

        <div className="flex gap-8 border-b border-gray-200 mb-6 overflow-x-auto">
          {TABS.map((item, index) => (
            <button
              key={item}
              className={`py-2 px-2 whitespace-nowrap text-sm font-medium border-b-2 transition-colors ${
                tab === index + 1
                  ? "border-green text-green"
                  : "border-transparent dark:text-gray-400 hover:text-green"
              }`}
              onClick={() => setTab(index + 1)}
            >
              {item}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          key={tab}
        >
          {tab === 1 && (
            <div className="space-y-6">
              <DetailSection label="Incident ID" value={incident.ticketId} />
              <DetailSection
                label="Date Resolved"
                value={
                  postMortem.updatedAt
                    ? new Date(postMortem.updatedAt).toLocaleString()
                    : null
                }
              />
              <DetailSection label="Incident Title" value={incident.title} />
              <DetailSection
                label="Incident Description"
                value={incident.techDescription || incident.description}
              />
              <DetailSection label="Priority" value={incident.priority} />
              <DetailSection
                label="Assigned to"
                value={incident.assignedToName || incident.assignedToEmail}
              />
            </div>
          )}

          {tab === 2 && (
            <div className="space-y-6">
              <DetailSection
                label="Cause Category"
                value={postMortem.causeCategory}
              />
              <DetailSection label="Root cause" value={postMortem.rootCause} />

              <div>
                <h2 className="text-lg font-bold text-black mb-4">5 Whys</h2>
                <div className="space-y-4">
                  <DetailSection label="Why 1" value={postMortem.why1} />
                  <DetailSection label="Why 2" value={postMortem.why2} />
                  <DetailSection label="Why 3" value={postMortem.why3} />
                  <DetailSection label="Why 4" value={postMortem.why4} />
                  <DetailSection label="Why 5" value={postMortem.why5} />
                </div>
              </div>
            </div>
          )}

          {tab === 3 && (
            <div className="space-y-6">
              <DetailSection
                label="Temporary Fix"
                value={postMortem.temporaryFix}
              />
              <DetailSection
                label="Permanent Fix"
                value={postMortem.permanentFix}
              />
            </div>
          )}

          {tab === 4 && (
            <div className="space-y-6">
              <DetailSection
                label="Title"
                value={postMortem.knowledgeTitleInternal}
              />
              <DetailSection
                label="Summary"
                value={postMortem.knowledgeSummaryInternal}
              />
              <DetailSection
                label="Identification Steps"
                value={postMortem.identificationStepsInternal}
              />
              <DetailSection
                label="Resolution Steps"
                value={postMortem.resolutionStepsInternal}
              />
              <DetailSection
                label="Preventive measures"
                value={postMortem.preventiveMeasuresInternal}
              />

              <div>
                <h2 className="text-lg font-bold mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {postMortem.knowledgeTagsInternal.length > 0 ? (
                    postMortem.knowledgeTagsInternal.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-200 text-black px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-base font-light">No tags recorded</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 5 && (
            <div className="space-y-6">
              <DetailSection
                label="Follow up task"
                value={postMortem.followUpTask}
              />
              <DetailSection
                label="Follow up owner"
                value={postMortem.followUpOwner}
              />
              <DetailSection
                label="Follow up due date"
                value={postMortem.followUpDueDate}
              />
              <DetailSection
                label="Follow up status"
                value={postMortem.followUpStatus}
              />
              <div>
                <h2 className="text-lg font-bold mb-2">
                  Follow up ticketing systems
                </h2>
                {postMortem.followUpTicketingSystems.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {postMortem.followUpTicketingSystems.map((system) => (
                      <span
                        key={system}
                        className="bg-gray-200 text-black px-3 py-1 rounded-full text-sm"
                      >
                        {system}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-base font-light">No follow-up systems recorded</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
