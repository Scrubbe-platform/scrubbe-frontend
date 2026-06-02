import { useQuery } from "@tanstack/react-query";
import { useFetch } from "./useFetch";
import { endpoint } from "@/lib/api/endpoint";

const useGetConfig = () => {
    const { get } = useFetch();
     const { data: imsConfig, isLoading } = useQuery({
    queryKey: ["ims-config"],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_config);
      if (res.success) return res.data?.data ?? res.data ?? {};
      return {};
    },
    refetchOnWindowFocus: false,
  });

  return { imsConfig, isLoading };
}

export default useGetConfig;