"use client";
import React from "react";
import EvidenceExplorer from "./_modules/components/EvidenceExplorer";
import IncidentRouteShell from "@/components/IMS/incident/IncidentRouteShell";
import NewIncidentList from "@/components/IMS/incident/NewIncidentList";

const page = () => {
  return (
    <NewIncidentList tabs="delivery">
      <IncidentRouteShell title="Evidence Explorer">
        {(incident) => <EvidenceExplorer incident={incident} />}
      </IncidentRouteShell>
    </NewIncidentList>
  );
};

export default page;
