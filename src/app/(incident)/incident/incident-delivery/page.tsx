"use client";
import React from "react";
import IncidentDelivery from "./_modules/components/IncidentDelivery";
import IncidentRouteShell from "@/components/IMS/incident/IncidentRouteShell";

const page = () => {
  return (
    <IncidentRouteShell title="Incident Delivery">
      {(incident) => (
        <div>
          <div className="border-b border-white/10 bg-dark px-6 py-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-green-400">
                {incident.ticketId}
              </span>
              <span>{incident.service || "Unknown service"}</span>
              <span>/{incident.environment || "runtime"}</span>
              <span>/{incident.region || "global"}</span>
              <span className="text-slate-500">
                Delivery routing is following the currently selected live
                incident.
              </span>
            </div>
          </div>
          <IncidentDelivery incident={incident} />
        </div>
      )}
    </IncidentRouteShell>
  );
};

export default page;
