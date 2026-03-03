// SlackIntegrationLoading.tsx
import React from "react";
import { CgSpinner } from "react-icons/cg"; // A spinner icon for the loading state
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { querykeys } from "@/lib/constant";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import { FaGitlab } from "react-icons/fa";

const GitlabIntegration: React.FC = () => {
  const { get } = useFetch();
  const { isLoading, refetch, isError } = useQuery({
    queryKey: [querykeys.GITLAB_INTEGRATION],
    queryFn: async () => {
      const res = await get(endpoint.integration.gitlab);
      console.log(res);
      if (res.success) {
        if (typeof window !== "undefined") {
          window.location.href = res.data;
        }
        return res.data;
      }
      toast.error("Gitlab Integration failed");
      return;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <div className="flex items-center justify-center p-8 min-h-[200px] ">
      <div className="flex flex-col items-center space-y-4">
        {/* Slack Icon with Loading Spinner */}
        <div className="relative">
          <FaGitlab size={48} className="opacity-80" />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <CgSpinner size={24} className="animate-spin text-blue-500" />
            </div>
          )}
        </div>

        {/* Loading Text */}
        <p className="text-lg font-medium text-gray-700 dark:text-white">
          Integrating with Gitlab...
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
            <span
              className=" text-colorScBlue cursor-pointer"
              onClick={() => refetch()}
            >
              Retry
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default GitlabIntegration;
