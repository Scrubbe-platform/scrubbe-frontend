import { querykeys } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "./useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { useParams } from "next/navigation";
import { Ticket, Tticket } from "@/types";

const useTicketDetails = () => {
  const { get } = useFetch();
  const { id } = useParams();
  return useQuery<Ticket | Tticket>({
    queryKey: [querykeys.INCIDENT_DETAIL, id],
    queryFn: async () => {
      const res = await get(endpoint.incident_ticket.getTicket + "/" + id);
      console.log({ res });
      if (res.success) {
        return res.data.data[0];
      }
      return null;
    },
    refetchOnWindowFocus: false,
  });
};

export default useTicketDetails;
