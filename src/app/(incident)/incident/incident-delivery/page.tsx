"use client";
import React from "react";
import IncidentDelivery from "./_modules/components/IncidentDelivery";
import IncidentRouteShell from "@/components/IMS/incident/IncidentRouteShell";
import NewIncidentList from "@/components/IMS/incident/NewIncidentList";

const page = () => {
  return (
    <NewIncidentList tabs="delivery">
      <IncidentRouteShell title="Incident Delivery">
        {(incident) => (
          <div>
            <div className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 px-6 py-4">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-black dark:text-slate-300">
                <span className="rounded-full border px-3 py-1 text-green-500">
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
    </NewIncidentList>
  );
};

export default page;
