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

const page = () => {
  return (
    <div>
      <PlaybookHeader />
      <div className="flex flex-row">
        <div className="flex-[.3]">
          <PlaybookSidebar />
        </div>
        <div className="flex-1 bg-darkEzra p-2 space-y-4">
          <PlaybookStatusCard />
          <TriggerConditions />
          <InvestigationTimeline />
          <RemediationModule />
          <BlastRadiusModule />
          <GuardrailModule />
          <ExecutionGate />
          <ActivityTrail />
          <LearnedPatterns />
        </div>
        <div className="flex-[.3]">
          <PlaybookRightSidebar />
        </div>
      </div>
    </div>
  );
};

export default page;
