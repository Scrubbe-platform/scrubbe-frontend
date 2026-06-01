import React from "react";
import { Tag, Layers } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { buildDeliveryPayload } from "./incidentDelivery.data";

const IncidentDetails = ({ incident }: { incident: IncidentDetailRecord }) => {
  const payloadData = buildDeliveryPayload(incident);
  const correlationKey = `${payloadData.repo}::pr${payloadData.pr.number}::${payloadData.artifacts.runUrl}::${payloadData.commit.sha}`;

  return (
    <div className="rounded-xl border border-IMSCyan/40 bg-gradient-to-b from-IMSCyan/30 to-IMSCyan/10 dark:from-IMSCyan/20 dark:to-grayscrubbe-800 p-5 text-gray-700 dark:text-slate-300">
      <div className="mx-auto max-w-6xl space-y-10">
        <section>
          <div className="mb-8 flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Incident
              </h1>
              <p className="font-medium tracking-wide text-slate-400">
                Raised from the selected live incident context
              </p>
              <p className="text-base italic text-slate-500">
                Dedup keeps one incident per correlated failure pattern.
              </p>
            </div>
              <span className="rounded-full border border-slate-800 bg-white dark:bg-black px-4 py-1.5 text-xs font-mono tracking-widest text-gray-600 dark:text-slate-400">
              {incident.ticketId}
            </span>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-6">
            <InfoCard title="Incident ID" value={incident.ticketId} />
            <InfoCard
              title="Correlation key (dedup)"
              value={correlationKey}
              sub="repo + pr + run + sha"
            />
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-white dark:bg-grayscrubbe-800 p-6">
              <h3 className="text-sm font-black tracking-widest text-white">
                Type / subtype
              </h3>
              <div className="flex gap-3">
                <Badge
                  icon={<Layers size={14} className="text-IMSCyan" />}
                  label={payloadData.eventType}
                />
                <Badge
                  icon={<Tag size={14} className="text-IMSCyan" />}
                  label={payloadData.failureCategory}
                />
              </div>
            </div>
            <InfoCard
              title="Repo / PR / Commit"
              value={`repo: ${payloadData.repo}`}
              list={[
                `pr: #${payloadData.pr.number}`,
                `sha: ${payloadData.commit.sha}`,
              ]}
            />
          </div>
          <div className="rounded-2xl border border-slate-800 bg-black p-6">
            <h3 className="mb-3 text-sm font-black tracking-widest text-white">
              Incident title
            </h3>
            <p className="text-sm font-semibold text-slate-200">
              {incident.title || payloadData.pr.title}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

const InfoCard = ({
  title,
  value,
  sub,
  list,
}: {
  title: string;
  value: string;
  sub?: string;
  list?: string[];
}) => (
  <div className="group flex flex-col gap-2 rounded-2xl border border-slate-800 bg-white dark:bg-grayscrubbe-800 p-6 transition-colors hover:border-green-500/30">
    <h3 className="text-sm font-black tracking-widest text-gray-900 dark:text-white">{title}</h3>
    <p className="break-all text-sm text-gray-700 dark:text-slate-100">{value}</p>
    {sub ? <p className="mt-1 text-sm text-gray-700 dark:text-white">{sub}</p> : null}
    {list
      ? list.map((item, index) => (
          <p key={index} className="text-sm font-medium text-gray-600 dark:text-slate-400">
            {item}
          </p>
        ))
      : null}
  </div>
);

const Badge = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/5 dark:bg-slate-900/50 px-3 py-1.5 text-[11px] font-bold text-gray-700 dark:text-slate-300">
    {icon} {label}
  </div>
);

export default IncidentDetails;
