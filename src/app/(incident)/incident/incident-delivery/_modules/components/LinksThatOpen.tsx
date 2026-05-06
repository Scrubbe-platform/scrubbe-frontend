import React from "react";
import { Link2, XCircle, Minus } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { buildDeliveryPayload } from "./incidentDelivery.data";

const LinksThatOpen = ({ incident }: { incident: IncidentDetailRecord }) => {
  const payloadData = buildDeliveryPayload(incident);

  return (
    <div className="flex items-center justify-center rounded-xl border border-IMSCyan/40 bg-gradient-to-b from-[#0074834D] to-[#004B571A] p-5 text-slate-300">
      <div className="w-full">
        <div className="mb-10 flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white">
              5) Links that open
            </h2>
            <p className="mt-4 font-medium text-slate-300">
              Signals & artifacts (clickable)
            </p>
            <p className="text-base text-slate-500">
              URLs are clickable for faster investigation
            </p>
          </div>
          <button className="rounded-full border border-slate-800 bg-slate-900/80 p-2 transition-colors hover:bg-slate-800">
            <Minus size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="mb-6 grid gap-6">
          <div className="flex flex-col gap-6 rounded-2xl border border-slate-800 bg-black p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-100">
              Artifacts
            </h3>

            <div className="space-y-4">
              <ArtifactLink label="runUrl" href={payloadData.artifacts.runUrl} />
              <ArtifactLink label="diffUrl" href={payloadData.artifacts.diffUrl} />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-black p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-100">
              Failing Units
            </h3>

            <div className="space-y-3">
              {payloadData.failing.map((unit) => (
                <div
                  key={unit}
                  className="group flex cursor-pointer items-center gap-3 rounded-full border border-yellow-500/30 bg-yellow-500/5 px-4 py-2 text-xs font-mono text-slate-300 transition-colors hover:border-yellow-500/50"
                >
                  <XCircle size={14} className="text-yellow-500" />
                  {unit}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-black p-6">
          <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-100">
            Signal list
          </h3>
          <div className="flex flex-wrap gap-4">
            <SignalPill label={`repo : ${payloadData.repo}`} />
            <SignalPill label={`Pr: #${payloadData.pr.number}`} />
            <SignalPill label={`sha: ${payloadData.commit.sha}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ArtifactLink = ({ label, href }: { label: string; href: string }) => (
  <div className="space-y-2">
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/5 px-3 py-1.5 text-xs font-bold text-green-400 transition-colors hover:bg-green-500/10"
    >
      <Link2 size={14} /> {label}
    </a>
    <p className="pl-1 font-mono text-xs text-slate-500">{href}</p>
  </div>
);

const SignalPill = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900/50 px-4 py-2 text-xs font-medium text-slate-300">
    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
    {label}
  </div>
);

export default LinksThatOpen;
