"use client";
import React from "react";
import Header from "./Header";
import DeliverySignal from "./DeliverySignal";
import Evidence from "./Evidence";
import IncidentDetails from "./IncidentDetails";
import DecisionLog from "./DecisionLog";
import AnalystNotes from "./AnalystNotes";
import EzraAssessment from "./EzraAssessment";
import LinksThatOpen from "./LinksThatOpen";
import PlaybookSection from "./PlaybookSection";
import PolicySection from "./PolicySection";
import Remediation from "./Remediation";
import HypothesisLedger from "./HypothesisLedger";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

const IncidentDelivery = ({ incident }: { incident: IncidentDetailRecord }) => {
  return (
    <div className="min-h-screen  text-black dark:text-zinc-200">
      <div className="px-6 md:px-10 py-8 space-y-5">
        <Header incident={incident} />
        <DeliverySignal />

        {/* ── Two-column layout ── */}
        <div className="flex flex-col md:flex-row gap-5 pt-2">
          <div className="flex-1 space-y-4">
            <Evidence />
            <IncidentDetails />
            <DecisionLog />
            <AnalystNotes />
          </div>
          <div className="flex-1 space-y-4">
            <EzraAssessment ticketId={incident.id} />
            <LinksThatOpen />
            <PlaybookSection />
            <PolicySection />
            <Remediation incidentId={incident.id} />
            <HypothesisLedger incidentId={incident.id} />
          </div>
        </div>

        {/* ── Full-width: ranked root-cause hypotheses ── */}
      </div>
    </div>
  );
};

export default IncidentDelivery;
