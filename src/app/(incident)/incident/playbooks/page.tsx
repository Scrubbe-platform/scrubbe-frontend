"use client";
import React, { useEffect, useState } from "react";
import IncidentRouteShell from "@/components/IMS/incident/IncidentRouteShell";
import NewIncidentList from "@/components/IMS/incident/NewIncidentList";
import PlaybookDetailPage from "../playbook-library/_modules/components/detail/PlaybookDetailPage";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

function PlaybookPageContent({ incident }: { incident: any }) {
  const [playbookId, setPlaybookId] = useState<string>("PB-0101");

  useEffect(() => {
    const incidentId = incident?.id ?? incident?.ticketId;
    if (!incidentId) return;
    customAxios
      .post(endpoint.playbooks.match, { incidentId })
      .then((res) => {
        const matched = res.data?.data ?? res.data;
        if (matched?.id) setPlaybookId(matched.id);
        // else keep the default "PB-0101"
      })
      .catch(() => {}); // fallback to default on error
  }, [incident?.id, incident?.ticketId]);

  return <PlaybookDetailPage playbookId={playbookId} isIncident={!!incident} />;
}

const page = () => {
  return (
    <NewIncidentList tabs="playbook">
      <IncidentRouteShell title="Playbooks">
        {(incident) => <PlaybookPageContent incident={incident} />}
      </IncidentRouteShell>
    </NewIncidentList>
  );
};

export default page;
