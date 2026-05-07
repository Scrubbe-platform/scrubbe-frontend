"use client";

import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import useTicketDetails from "@/hooks/useTicketDetails";
import { endpoint } from "@/lib/api/endpoint";

type ThreatIntelEntry = {
  id: string;
  name: string;
  status: string;
};

const TreatIntel = () => {
  const { get } = useFetch();
  const { data: ticket } = useTicketDetails();

  const { data: entries = [], isLoading } = useQuery<ThreatIntelEntry[]>({
    queryKey: ["threat-intel", ticket?.id],
    queryFn: async () => {
      if (!ticket?.id) {
        return [];
      }

      const res = await get(
        `${endpoint.incident_ticket.threat_intel}/${ticket.id}/threat-intel`
      );

      if (res.success) {
        return (res.data?.data ?? res.data ?? []) as ThreatIntelEntry[];
      }

      return [];
    },
    enabled: Boolean(ticket?.id),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="flex flex-col max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 dark:bg-transparent bg-white">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-5 rounded bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-2">
            {entries.map((item) => (
              <div key={item.id} className="dark:text-white">
                <span>{item.name}-</span>
                <span>
                  <b>Status: </b>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-300">
            No threat intelligence indicators were found for this incident.
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatIntel;
