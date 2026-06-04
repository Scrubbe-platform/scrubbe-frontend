// components/MonitorRepositories.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { FiCheckCircle } from "react-icons/fi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import useAuthStore from "@/lib/stores/auth.store";
import { querykeys } from "@/lib/constant";
import { toast } from "sonner";

type IRepo = {
  id: number;
  name: string;
  private: boolean;
  fullName?: string;
  url?: string;
  defaultBranch?: string;
};

type IntegrationRecord = {
  provider: string;
  config?: {
    repos?: IRepo[];
  } | null;
};

function GithubConfiguration() {
  const [selectedRepoIds, setSelectedRepoIds] = useState<IRepo[] | undefined>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasHydratedSelection, setHasHydratedSelection] = useState(false);
  const { get, patch } = useFetch();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: repositories = [] } = useQuery<IRepo[]>({
    queryKey: ["GITHUB_REPO"],
    queryFn: async () => {
      const res = await get(endpoint.incident_ticket.github_repos);
      if (res.success) {
        return (res.data?.data ?? []) as IRepo[];
      }
      return [] as IRepo[];
    },
  });

  const { data: integrations = [], isLoading: isLoadingIntegrations } =
    useQuery<IntegrationRecord[]>({
    queryKey: [querykeys.INTEGRATIONS, user?.id],
    queryFn: async () => {
      const res = await get(`${endpoint.incident_ticket.integrations}/${user?.id}`);
      if (res.success) {
        return (res.data?.data ?? []) as IntegrationRecord[];
      }
      return [];
    },
    enabled: !!user?.id,
  });

  const savedRepoIds = useMemo(() => {
    const githubIntegration = integrations.find(
      (integration) => integration.provider.toLowerCase() === "github"
    );

    return new Set(
      (githubIntegration?.config?.repos ?? [])
        .map((repo) => repo.id)
        .filter((repoId): repoId is number => Number.isFinite(repoId))
    );
  }, [integrations]);

  useEffect(() => {
    if (hasHydratedSelection || repositories.length === 0 || isLoadingIntegrations) {
      return;
    }

    const preselectedRepositories = repositories.filter((repo) =>
      savedRepoIds.has(repo.id)
    );

    setSelectedRepoIds(
      preselectedRepositories.length > 0 ? preselectedRepositories : repositories
    );
    setHasHydratedSelection(true);
  }, [hasHydratedSelection, isLoadingIntegrations, repositories, savedRepoIds]);

  const handleToggleRepo = (repo: IRepo) => {
    setSelectedRepoIds((prevSelected) => {
      if (!!prevSelected?.find((value) => repo.id === value.id)) {
        return prevSelected?.filter((value) => value.id !== repo.id);
      } else {
        return [...(prevSelected ?? []), repo];
      }
    });
  };

  const handleToggleAll = () => {
    if (selectedRepoIds?.length === repositories.length) {
      setSelectedRepoIds([]);
    } else {
      const allIds = repositories;
      setSelectedRepoIds(allIds);
    }
  };

  const selectedCount = selectedRepoIds?.length;
  const totalCount = repositories.length;

  const handleSaveSelection = async () => {
    if (!selectedRepoIds?.length) return;

    setIsSaving(true);
    try {
      const res = await patch(endpoint.incident_ticket.github_repos, {
        repoIds: selectedRepoIds.map((repo) => repo.id),
      });

      if (!res.success) {
        toast.error(
          typeof res.data === "string"
            ? res.data
            : "Unable to save monitored GitHub repositories"
        );
        return;
      }

      toast.success("GitHub monitored repositories updated");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [querykeys.INTEGRATIONS, user?.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["GITHUB_REPO"] }),
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black">
          Monitor Repositories
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Link your code repositories to enable real-time monitoring and
          proactive threat detection.
        </p>
      </div>

      {/* Select All */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-black font-medium">
          {selectedCount} selected{" "}
          <span className="text-green cursor-pointer" onClick={handleToggleAll}>
            (Select All ({totalCount}))
          </span>
        </span>
      </div>

      {/* Repository List */}
      <div className="space-y-4">
        {repositories.map((repo) => {
          const isSelected = !!selectedRepoIds?.find(
            (value) => value.id == repo.id
          );

          return (
            <div
              key={repo.id}
              className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleRepo(repo)}
                  className="form-checkbox w-4 h-4 text-green rounded-sm focus:ring-green transition-colors"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-black font-semibold">
                      {repo.name}
                    </span>
                    <span
                      className={clsx(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        {
                          "bg-emerald-100 text-emerald-600": !repo.private,
                          "bg-blue-100 text-blue-600": repo.private,
                        }
                      )}
                    >
                      {repo.private ? "Private" : "Public"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggleRepo(repo)}
                className={clsx(
                  "flex items-center px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200",
                  {
                    "text-green border border-green hover:bg-blue-50":
                      !isSelected,
                    "bg-green-100 text-green-700 border border-green-400":
                      isSelected,
                  }
                )}
              >
                {isSelected && <FiCheckCircle className="mr-1 w-4 h-4" />}
                {isSelected ? "Selected" : "Select"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <button
          disabled={!selectedRepoIds || selectedRepoIds.length <= 0 || isSaving}
          onClick={handleSaveSelection}
          className="w-full px-4 py-3 disabled:bg-neutral-500 disabled:opacity-60 bg-green text-white rounded-full font-semibold transition-colors duration-200"
        >
          {isSaving ? "Saving..." : "Monitor Selected Repositories"}
        </button>
      </div>
    </div>
  );
}

export default GithubConfiguration;
