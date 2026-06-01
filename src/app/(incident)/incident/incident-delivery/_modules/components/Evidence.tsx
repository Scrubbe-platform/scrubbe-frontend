import React from "react";
import { Terminal } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { buildDeliveryPayload } from "./incidentDelivery.data";

const Evidence = ({ incident }: { incident: IncidentDetailRecord }) => {
  const evidencePayload = buildDeliveryPayload(incident);

  return (
    <div>
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-xl border border-IMSCyan/40 bg-gradient-to-b from-IMSCyan/30 to-IMSCyan/10 dark:from-IMSCyan/20 dark:to-grayscrubbe-800 p-5 text-gray-900 dark:text-white shadow-2xl backdrop-blur-sm">
          <div className="mb-6 flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                Evidence · event payload
              </h2>
              <p className="text-slate-300">Incoming signal for the selected incident</p>
              <p className="text-base text-slate-500">
                Raw evidence projected from the current incident context.
              </p>
            </div>
            <span className="rounded-full border border-slate-800 bg-black px-3 py-1 text-xs font-mono text-slate-200">
              {evidencePayload.eventType}
            </span>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-white dark:bg-grayscrubbe-800 p-6">
            <div className="absolute right-4 top-4 text-slate-700 transition-colors group-hover:text-green-500">
              <Terminal size={18} />
            </div>
            <pre className="overflow-x-auto text-sm font-mono leading-relaxed text-gray-700 dark:text-slate-300">
              <code>{JSON.stringify(evidencePayload, null, 2)}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Evidence;
