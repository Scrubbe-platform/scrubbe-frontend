"use client";

import { querykeys } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import { fetchIncidentList } from "@/lib/incident/incident.api";

export const useIncidentList = () => {
  return useQuery({
    queryKey: [querykeys.INCIDENT_TICKET, "workspace"],
    queryFn: fetchIncidentList,
    refetchOnWindowFocus: false,
  });
};
