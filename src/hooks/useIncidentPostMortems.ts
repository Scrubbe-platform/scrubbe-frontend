"use client";

import { useQuery } from "@tanstack/react-query";
import { querykeys } from "@/lib/constant";
import { fetchIncidentPostMortems } from "@/lib/incident/incident.api";

export const useIncidentPostMortems = () => {
  return useQuery({
    queryKey: [querykeys.POSTMORTEM_TICKET],
    queryFn: fetchIncidentPostMortems,
    refetchOnWindowFocus: false,
  });
};
