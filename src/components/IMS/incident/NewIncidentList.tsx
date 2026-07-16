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
import IncidentDetailSkeleton from "@/components/loaders/incidentDetailLoader";
import Image from "next/image";
import IncidentUpdatePage from "./IncidentUpdatePage";
import Link from "next/link";

type Props = {
  children?: React.ReactNode;
  tabs?: "overview" | "signal-graph" | "code-engine" | "delivery" | "playbook";
};
const IncidentOverview = ({ children, tabs }: Props) => {
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
    if (isSelectionInvalid) clearSelectedIncident();
  }, [clearSelectedIncident, isSelectionInvalid]);

  const showMainPanel = Boolean(incidentId && selectedIncident);

  return (
    <div className="flex h-screen dark:text-slate-300 text-black font-sans overflow-hidden">
      {/* ── Sidebar ── */}

      {/* ── Main panel — skeleton, content, or empty state ── */}
      <main
        className={cn(
          "flex-1 flex flex-col overflow-y-auto h-full px-5 md:px-8",
          // on mobile: only show when there is something to render
          showMainPanel || isSelectionLoading ? "flex" : "hidden md:flex",
        )}
      >
        {/* Loading skeleton — takes the full main panel */}
        {isSelectionLoading && <IncidentDetailSkeleton />}

        {/* Incident content — only when fully loaded */}
        {showMainPanel && (
          <>
            {/* Mobile back button */}
            <div className="md:hidden p-4 border-b border-white/5 flex items-center gap-3 bg-inherit">
              <button
                onClick={clearSelectedIncident}
                className="p-1 hover:bg-white/5 rounded-full"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-bold">Back to Incidents</span>
            </div>

            {selectedIncident && (
              <>
                <IncidentHeader
                  incident={selectedIncident}
                  stats={stats}
                  context={context}
                  activeTab={tabs}
                />

                {/* Lifecycle ribbon — visible across every incident-context tab, not just overview */}

                <div className="border border-neutral-300">
                  {tabs === "overview" ? (
                    <>
                      <IncidentLifecycle incident={selectedIncident} />
                      <IncidentUpdatePage
                        incident={selectedIncident}
                        onCancel={() => {}}
                        context={context}
                      />
                      {/* <DetectionSignals incident={selectedIncident} /> */}
                      {/* <ScrubbeIntelligence incident={selectedIncident} /> */}
                      <IncidentContextModule
                        incident={selectedIncident}
                        context={context}
                      />
                      <ActivityAuditTrail
                        ticket={{
                          id: selectedIncident?.id,
                          comments: selectedIncident?.comments,
                          history,
                        }}
                      />
                    </>
                  ) : (
                    <>{children}</>
                  )}
                </div>
                {/* {tabs === "context" && (
                  <>
                    <ContextList
                      context={context}
                      incident={selectedIncident}
                    />
                    <AddContextForm
                      context={context}
                      incident={selectedIncident}
                    />
                  </>
                )} */}
              </>
            )}
          </>
        )}

        {/* Empty state — desktop only, nothing selected and not loading */}
        {!showMainPanel && (
          <div className="hidden md:flex flex-1 items-center justify-center p-10">
            <div className="max-w-lg rounded-xl shadow-md border border-white/10 bg-white/[0.02] p-8 text-center flex flex-col items-center justify-center">
              <Image
                src={"/IMS/folder.png"}
                alt="empty"
                height={100}
                width={100}
              />

              <h2 className="mt-4 text-2xl font-bold text-black dark:text-white">
                Select an incident or Create a new Incident to open a live
                workspace
              </h2>
              <p className="mt-3 text-sm leading-2 text-slate-400">
                The workspace only appears when a real incident is selected. Use
                the sidebar to browse current incidents or raise a new one.{" "}
                <Link
                  href="/incident/tickets"
                  className="text-IMSLightGreen font-semibold hover:underline"
                >
                  Go to incident library.
                </Link>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default IncidentOverview;
