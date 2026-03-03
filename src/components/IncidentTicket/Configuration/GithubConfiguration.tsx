// components/MonitorRepositories.tsx

"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { FiCheckCircle } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

const mockRepositories = [
  { id: 1, name: "Scrubbe repo", private: true, owner: "user1" },
  { id: 2, name: "atlas-core", private: false, owner: "user1" },
  { id: 3, name: "nova-ui", private: true, owner: "user2" },
  { id: 4, name: "aether-api", private: true, owner: "user3" },
  { id: 5, name: "CodeSphere", private: false, owner: "user4" },
  { id: 6, name: "Scrubbe repo", private: true, owner: "user1" },
  { id: 7, name: "nova-ui", private: false, owner: "user2" },
  { id: 8, name: "aether-api", private: true, owner: "user3" },
];

type IRepo = {
  id: number;
  name: string;
  private: boolean;
  owner: string;
};

function GithubConfiguration() {
  const [selectedRepoIds, setSelectedRepoIds] = useState<IRepo[] | undefined>(
    []
  );
  const { get } = useFetch();

  const {} = useQuery({
    queryKey: ["GITHUB_REPO"],
    queryFn: async () => {
      const res = await get(endpoint.incident_ticket.github_repos);
      console.log({ res });
      if (res.success) {
        return res.data.data;
      }
      return [];
    },
  });

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
    if (selectedRepoIds?.length === mockRepositories.length) {
      setSelectedRepoIds([]);
    } else {
      const allIds = mockRepositories;
      setSelectedRepoIds(allIds);
    }
  };

  const selectedCount = selectedRepoIds?.length;
  const totalCount = mockRepositories.length;

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Monitor Repositories
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Link your code repositories to enable real-time monitoring and
          proactive threat detection.
        </p>
      </div>

      {/* Select All */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-700 font-medium">
          {selectedCount} selected{" "}
          <span className="text-green cursor-pointer" onClick={handleToggleAll}>
            (Select All ({totalCount}))
          </span>
        </span>
      </div>

      {/* Repository List */}
      <div className="space-y-4">
        {mockRepositories.map((repo) => {
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
                    <span className="text-gray-800 font-semibold">
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
          disabled={!selectedRepoIds || selectedRepoIds?.length <= 0}
          className="w-full px-4 py-3 disabled:bg-neutral-500 disabled:opacity-60 bg-green text-white rounded-full font-semibold transition-colors duration-200"
        >
          Monitor Selected Repositories
        </button>
      </div>
    </div>
  );
}

export default GithubConfiguration;
