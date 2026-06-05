"use client";

import React, { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import ExactIncidentSidebar from "./IncidentSidebarList";
import IncidentHeader from "./IncidentHeader";
import IncidentLifecycle from "./IncidentLifecycle";
import DetectionSignals from "./DetectionSignals";
import IncidentContextModule from "./IncidentContextModule";
import ScrubbeIntelligence from "./IntelligentModule";
import ActivityAuditTrail from "./ActivityAuditTrail";
import AddContextForm from "./ContextForm";
import ContextList from "./ContextList";
import { cn } from "@/lib/utils";
import { useIncidentWorkspace } from "@/hooks/useIncidentWorkspace";

const IncidentOverview: React.FC = () => {
  const {
    currentTab,
    incidentId,
    selectedIncident,
    stats,
    history,
    context,
    isSelectionInvalid,
    isSelectionLoading,
    clearSelectedIncident,
  } = useIncidentWorkspace();

  useEffect(() => {
    if (isSelectionInvalid) {
      clearSelectedIncident();
    }
  }, [clearSelectedIncident, isSelectionInvalid]);

  const showMainPanel = Boolean(incidentId && selectedIncident);

  return (
    <div className="flex h-screen dark:text-slate-300 text-black font-sans overflow-hidden">
      <aside
        className={cn(
          "md:border-r border-white/5 flex flex-col h-full shrink-0",
          "md:w-[350px] md:flex",
          showMainPanel ? "hidden" : "w-full flex"
        )}
      >
        <ExactIncidentSidebar />
      </aside>

        {
          showMainPanel && (
      <main
        className={cn(
          "flex-1 flex flex-col overflow-y-auto h-full",
          "md:flex",
          !showMainPanel ? "hidden" : "flex"
        )}
      >
        {showMainPanel && (
          <div className="md:hidden p-4 border-b border-white/5 flex items-center gap-3 bg-inherit">
            <button
              onClick={clearSelectedIncident}
              className="p-1 hover:bg-white/5 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold">Back to Incidents</span>
          </div>
        )}

        {selectedIncident ? (
          <>
            <IncidentHeader incident={selectedIncident} stats={stats} context={context} />

            {(currentTab === "overview" || !currentTab) && (
              <>
                <IncidentLifecycle
                  currentStep={selectedIncident.lifecycleStep}
                />
                <DetectionSignals incident={selectedIncident} />
                <ScrubbeIntelligence incident={selectedIncident} />
                <IncidentContextModule
                  incident={selectedIncident}
                  context={context}
                />
                <ActivityAuditTrail history={history} />
              </>
            )}

            {currentTab === "context" && (
              <>
                <ContextList context={context} incident={selectedIncident} />
                <AddContextForm context={context} incident={selectedIncident} />
              </>
            )}
          </>
        ) : isSelectionLoading ? (
          <div className="p-6 md:p-8 space-y-4">
            <div className="h-24 rounded-2xl border border-white/10 bg-white/[0.03]" />
            <div className="h-40 rounded-2xl border border-white/10 bg-white/[0.03]" />
            <div className="h-48 rounded-2xl border border-white/10 bg-white/[0.03]" />
          </div>
        ) : null}
      </main>
          )
        }

      {!showMainPanel && (
        <main className="hidden md:flex flex-1 items-center justify-center p-10 mx-auto">
          <div className="max-w-lg rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Incident Workspace
            </p>
            <h2 className="mt-4 text-2xl font-bold text-black dark:text-white">
              Select an incident to open the live workspace
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              The workspace only appears when a real incident is selected. Use
              the sidebar to browse current incidents or raise a new one.
            </p>
          </div>
        </main>
      )}
    </div>
  );
};

export default IncidentOverview;
