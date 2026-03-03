import { querykeys } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "./useFetch";
import { endpoint } from "@/lib/api/endpoint";

export type Member = {
  firstname: string;
  lastname: string;
  email: string;
  level: string;
  role: string;
  id: string;
};
const useMember = () => {
  const { get } = useFetch();

  return useQuery<Member[]>({
    queryKey: [querykeys.GET_MEMBERS],
    queryFn: async () => {
      try {
        const res = await get(endpoint.incident_ticket.get_members);
        console.log({ memeber: res });
        if (res.success) {
          return res.data;
        }
        return [];
      } catch (error) {
        console.log(error);
        return [];
      }
    },
  });
};

export default useMember;
