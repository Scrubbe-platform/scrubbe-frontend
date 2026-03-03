import { querykeys } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "./useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { useParams } from "next/navigation";

const usePortalTicketDetails = () => {
  const { get } = useFetch();
  const { id } = useParams();
  return useQuery({
    queryKey: [querykeys.INCIDENT_DETAIL, id],
    queryFn: async () => {
      const res = await get(endpoint.portal.get_incident + "/" + id);
      console.log({ res });
      if (res.success) {
        return res.data.data;
      }
      return null;
    },
    refetchOnWindowFocus: false,
  });
};

export default usePortalTicketDetails;
