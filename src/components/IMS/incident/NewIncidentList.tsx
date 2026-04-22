"use client";
import React from "react";
import { ChevronLeft } from "lucide-react";
import ExactIncidentSidebar from "./IncidentSidebarList";
import IncidentHeader from "./IncidentHeader";
import IncidentLifecycle from "./IncidentLifecycle";
import DetectionSignals from "./DetectionSignals";
import IncidentContextModule from "./IncidentContextModule";
import ScrubbeIntelligence from "./IntelligentModule";
import ActivityAuditTrail from "./ActivityAuditTrail";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AddContextForm from "./ContextForm";
import ContextList from "./ContextList";
import { cn } from "@/lib/utils";

const IncidentOverview: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentTab = searchParams.get("tab");
  const activeId = searchParams.get("id");

  const goBackToList = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex h-screen text-slate-300 font-sans overflow-hidden">
      {/* 1. LEFT SIDEBAR: INCIDENT LIST */}
      <aside
        className={cn(
          "md:border-r border-white/5 flex flex-col h-full shrink-0",
          // Desktop: Force a fixed width so it doesn't bleed into Main
          "md:w-[350px] md:flex",
          // Mobile: Toggle logic
          activeId ? "hidden" : "w-full flex"
        )}
      >
        <ExactIncidentSidebar />
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main
        className={cn(
          "flex-1 flex flex-col overflow-y-auto h-full",
          // Desktop: Always show
          "md:flex",
          // Mobile: Toggle logic
          !activeId ? "hidden" : "flex"
        )}
      >
        {/* Mobile-only Back Header */}
        {activeId && (
          <div className="md:hidden p-4 border-b border-white/5 flex items-center gap-3  bg-inherit">
            <button
              onClick={goBackToList}
              className="p-1 hover:bg-white/5 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold">Back to Incidents</span>
          </div>
        )}

        <IncidentHeader />

        {(currentTab === "overview" || !currentTab) && (
          <>
            <IncidentLifecycle currentStep="Analysed" />
            <DetectionSignals />
            <ScrubbeIntelligence />
            <IncidentContextModule />
            <ActivityAuditTrail />
          </>
        )}

        {currentTab === "context" && (
          <>
            <ContextList />
            <AddContextForm />
          </>
        )}
      </main>
    </div>
  );
};

export default IncidentOverview;
