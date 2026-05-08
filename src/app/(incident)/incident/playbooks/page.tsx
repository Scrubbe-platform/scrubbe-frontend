"use client";
import React from "react";
import PlaybookHeader from "./_modules/components/Header";
import PlaybookSidebar from "./_modules/components/Sidebar";
import PlaybookRightSidebar from "./_modules/components/RightSidebar";
import PlaybookStatusCard from "./_modules/components/ContentTaps/PlaybookStatusCard";
import TriggerConditions from "./_modules/components/ContentTaps/TriggerConditions";
import InvestigationTimeline from "./_modules/components/ContentTaps/InvestigationTimeline";
import RemediationModule from "./_modules/components/ContentTaps/RemediationModule";
import BlastRadiusModule from "./_modules/components/ContentTaps/BlastRadiusModule";
import GuardrailModule from "./_modules/components/ContentTaps/GuardrailModule";
import ExecutionGate from "./_modules/components/ContentTaps/ExecutionGate";
import ActivityTrail from "./_modules/components/ContentTaps/ActivityTrail";
import LearnedPatterns from "./_modules/components/ContentTaps/LearnedPatterns";
import IncidentRouteShell from "@/components/IMS/incident/IncidentRouteShell";

const page = () => {
  return (
    <IncidentRouteShell title="Playbooks">
      {(incident) => (
        <div>
          <div className="border-b border-white/10 bg-dark px-6 py-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-green-400">
                {incident.ticketId}
              </span>
              <span>{incident.service || "Unknown service"}</span>
              <span>/{incident.severity}</span>
              <span>/{incident.status}</span>
              <span className="text-slate-500">
                Playbook intelligence is anchored to the selected incident
                identity.
              </span>
            </div>
          </div>
          <PlaybookHeader incident={incident} />
          <div className="flex flex-row">
            <div className="flex-[.3]">
              <PlaybookSidebar incident={incident} />
            </div>
            <div className="flex-1 bg-darkEzra p-2 space-y-4">
              <PlaybookStatusCard incident={incident} />
              <TriggerConditions incident={incident} />
              <InvestigationTimeline incident={incident} />
              <RemediationModule incident={incident} />
              <BlastRadiusModule incidentId={incident.id} />
              <GuardrailModule incidentId={incident.id} />
              <ExecutionGate incidentId={incident.id} />
              <ActivityTrail incident={incident} />
              <LearnedPatterns />
            </div>
            <div className="flex-[.3]">
              <PlaybookRightSidebar incident={incident} />
            </div>
          </div>
        </div>
      )}
    </IncidentRouteShell>
  );
};

export default page;
