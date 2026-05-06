import { UseQueryResult } from "@tanstack/react-query";
import { useIncidentDetail } from "./useIncidentWorkspace";
import { useIncidentSelection } from "./useIncidentSelection";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

const useTicketDetails = () => {
  const { incidentId } = useIncidentSelection();
  return useIncidentDetail(incidentId) as UseQueryResult<IncidentDetailRecord | null>;
};

export default useTicketDetails;
