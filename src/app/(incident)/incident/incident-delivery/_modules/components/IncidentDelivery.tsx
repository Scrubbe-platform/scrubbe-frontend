"use client";
import React from "react";
import Header from "./Header";
import DeliverySignal from "./DeliverySignal";
import Evidence from "./Evidence";
import LinksThatOpen from "./LinksThatOpen";
import IncidentDetails from "./IncidentDetails";
import PlaybookSection from "./PlaybookSection";
import PolicySection from "./PolicySection";
import DecisionLog from "./DecisionLog";
import Remediation from "./Remediation";
import AnalystNotes from "./AnalystNotes";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useIncidentWorkspace } from "@/hooks/useIncidentWorkspace";

const IncidentDelivery = ({ incident }: { incident: IncidentDetailRecord }) => {
  const queryClient = useQueryClient();
  const { comments } = useIncidentWorkspace();
  const handleRefreshDeliverySignals = () => {
    queryClient.invalidateQueries({ queryKey: ["decisions-log", incident.id] });
    queryClient.invalidateQueries({
      queryKey: ["playbook-match", incident.id],
    });
    queryClient.invalidateQueries({
      queryKey: ["guardrails-incident", incident.id],
    });
    queryClient.invalidateQueries({
      queryKey: ["ezra-analysis-delivery", incident.id],
    });
    toast.success("Delivery configuration refreshed");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-zinc-200">
      <div className="px-6 md:px-10 py-8 space-y-5">
        <Header incident={incident} />
        <DeliverySignal onRefresh={handleRefreshDeliverySignals} />

        {/* ── Two-column layout ── */}
        <div className="flex flex-col md:flex-row gap-5 pt-2">
          <div className="flex-1 space-y-4">
            <Evidence incident={incident} />
            <IncidentDetails incident={incident} />
            <DecisionLog incidentId={incident.id} />
            <AnalystNotes incident={incident} notes={comments} />
          </div>
          <div className="flex-1 space-y-4">
            <LinksThatOpen incident={incident} />
            <PlaybookSection
              incidentId={incident.id}
              category={incident.category}
            />
            <PolicySection incidentId={incident.id} />
            <Remediation incidentId={incident.id} />
          </div>
        </div>

        {/* ── Footer bar ── */}
      </div>
    </div>
  );
};

export default IncidentDelivery;
