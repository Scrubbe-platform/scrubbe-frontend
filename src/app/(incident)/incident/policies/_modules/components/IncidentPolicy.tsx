import React from "react";
import SeverityRules from "./severity/SeverityRules";
import RoutingNotification from "./routing/RoutingNotification";
import AutoCreateIncident from "./autocreate/AutoCreateIncident";
import SignalEnrichment from "./signal/SignalEnrichment";

const IncidentPolicy = () => {
  return (
    <div className=" bg-white dark:bg-zinc-950 text-black dark:text-zinc-200 min-h-screen p-10 space-y-3">
      <div className="flex items-center gap-3">
        <p className="text-lg dark:text-white font-medium">Incident policies</p>
        <div className="border border-white rounded-md px-2 py-1 text-xs">
          <p>Guardrails before integrations</p>
        </div>
      </div>

      <p className="text-sm max-w-md">
        This is where incidents live in Scrubbe: signal-rich, CI/CD-linked, and
        ready for Ezra summaries. Filter by priority, type, service, time
        window, or ownership â€” then click an incident to work it end-to-end.
      </p>

      <div className="flex items-center gap-3">
        <div className="border border-white rounded-md px-2 py-1 text-xs">
          <p>Severity & major incident rules</p>
        </div>
        <div className="border border-white rounded-md px-2 py-1 text-xs">
          <p>On-call routing & notifications</p>
        </div>
        <div className="border border-white rounded-md px-2 py-1 text-xs">
          <p>Signal enrichment toggles</p>
        </div>
      </div>

      <div className="grid gap-6 w-full">
        <div className="space-y-4">
          <SeverityRules />
          <RoutingNotification />
          <AutoCreateIncident />
          <SignalEnrichment />
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">
              Tip: start strict. You can loosen auto-create rules after you see real noise patterns.
            </p>
          </div>
        </div>
        <div className="col-span-3">
            
        </div>
      </div>
    </div>
  );
};

export default IncidentPolicy;
