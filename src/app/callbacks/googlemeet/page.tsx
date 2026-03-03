// SlackIntegrationLoading.tsx
"use client";
import React from "react";
import { CgSpinner } from "react-icons/cg"; // A spinner icon for the loading state
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { querykeys } from "@/lib/constant";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

const Page: React.FC = () => {
  const { get } = useFetch();
  const { replace } = useRouter();
  const { isLoading, isError } = useQuery({
    queryKey: [querykeys.GOOGLE_MEET_INTEGRATION],
    queryFn: async () => {
      const res = await get(endpoint.integration.googlemeet_callback);
      if (res.success) {
        replace("/dashboard/incident-ticket");
        return res.data;
      }
      replace("/dashboard/incident-ticket");
      toast.error("Google Meet Integration failed");
      return;
    },
    refetchOnWindowFocus: false,
  });

  console.log({ isError });
  return (
    <div className="flex items-center justify-center p-8 dark:bg-subDark bg-white h-screen ">
      <div className="flex flex-col items-center space-y-4">
        {/* Slack Icon with Loading Spinner */}
        <div className="relative">
          <FcGoogle size={48} className="text-[#E01E5A] opacity-80" />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <CgSpinner size={24} className="animate-spin text-blue-500" />
            </div>
          )}
        </div>

        {/* Loading Text */}
        <p className="text-lg font-medium text-gray-700 dark:text-white">
          Integrating with Google Meet...
        </p>

        {/* Progress Bar (optional, but good for UX) */}
        {isLoading && (
          <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 0.5,
              }}
            />
          </div>
        )}

        {isLoading && (
          <p className="text-sm text-gray-500">This may take a few moments.</p>
        )}
        {isError && (
          <p className="text-sm text-gray-500">
            Integration Faild.{" "}
            {/* <span
              className=" text-colorScBlue cursor-pointer"
              onClick={() => refetch()}
            >
              Retry
            </span> */}
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;
