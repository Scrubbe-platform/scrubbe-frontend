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
    <div className="min-h-screen font-ibm text-black dark:text-zinc-200">
      <div className="px-6 md:px-10 py-8 space-y-5">
        <Header incident={incident} />
        <DeliverySignal />

        {/* ── Two-column layout ── */}
        <div className="grid xl:grid-cols-2 gap-5 pt-2">
          <Evidence />
          <EzraAssessment ticketId={incident.id} />
          <IncidentDetails incidentId={incident.id} />
          <LinksThatOpen />
          <DecisionLog incidentId={incident.id} />
          <PlaybookSection />
          <AnalystNotes incidentId={incident.id} />
          <PolicySection />
        </div>
        <Remediation incidentId={incident.id} />
        <HypothesisLedger incidentId={incident.id} />

        {/* ── Full-width: ranked root-cause hypotheses ── */}
      </div>
    </div>
  );
};

export default IncidentDelivery;
