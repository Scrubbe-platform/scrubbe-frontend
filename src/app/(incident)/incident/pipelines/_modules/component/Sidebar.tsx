"use client";
import React, { ReactNode } from "react";
import {
  AlertTriangle,
  GitPullRequest,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useIncidentWorkspace } from "@/hooks/useIncidentWorkspace";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { usePipelineFilter } from "../state/usePipelineFilter";

interface ActivityItem {
  id: number | string;
  type?: string;
  title: string;
  subtitle: string;
  environment?: string;
  status: string;
  icon: keyof typeof iconMap;
}

const iconMap: Record<string, ReactNode> = {
  alert: <AlertTriangle size={18} />,
  git: <GitPullRequest size={18} />,
  zap: <Zap size={18} />,
  check: <CheckCircle2 size={18} />,
};

const Sidebar = () => {
  const { selectedIncident } = useIncidentWorkspace();
  const router = useRouter();
  const { get } = useFetch();
  const { setStatusFilter } = usePipelineFilter();

  const goToIncident = () => {
    if (selectedIncident?.id) {
      router.push(`/incident/incident-delivery?id=${selectedIncident.id}`);
    }
  };

  const { data: health } = useQuery({
    queryKey: ["pipeline-health"],
    queryFn: async () => {
      const res = await get(endpoint.pipelines.health);
      return res.success ? res.data?.data ?? null : null;
    },
    refetchOnWindowFocus: false,
  });

  const needsApproval: number = health?.needsApproval ?? 0;
  const deliveryFailures: number = health?.deliveryFailures ?? 0;
  const listenerHealth: { name: string; status: string; count?: number }[] =
    health?.listenerHealth ?? [];

  const systemActivity = [
    {
      category: "Needs approval",
      items: [
        {
          id: "pending-approvals",
          type: "decision",
          title: `${needsApproval} decision${needsApproval === 1 ? "" : "s"} pending approval`,
          subtitle: "Across all open incidents",
          environment: "",
          status: needsApproval > 0 ? "Review" : "Clear",
          icon: "alert" as const,
          onClick: () => router.push("/incident/workbench"),
        },
        ...(selectedIncident?.id
          ? [
              {
                id: "selected-incident",
                type: "incident",
                title: `Review ${selectedIncident.ticketId ?? "incident"} deploy`,
                subtitle: selectedIncident.service || selectedIncident.affectedSystem || "selected-service",
                environment: "",
                status: "Approve",
                icon: "git" as const,
                onClick: goToIncident,
              },
            ]
          : []),
      ],
    },
    {
      category: "Delivery Failures",
      items: [
        {
          id: "delivery-failures",
          type: "pipeline",
          title: `${deliveryFailures} delivery failure${deliveryFailures === 1 ? "" : "s"} (24h)`,
          subtitle: "Click to filter the run list",
          environment: "",
          status: deliveryFailures > 0 ? "Failed" : "Clear",
          icon: "git" as const,
          onClick: () => setStatusFilter("error"),
        },
      ],
    },
  ];

  const healthGroups = [
    {
      category: "Listener health",
      items: listenerHealth.map((item) => ({
        id: item.name,
        type: "",
        title: item.name,
        subtitle:
          item.name === "Connectors" && typeof item.count === "number"
            ? `${item.count} connector${item.count === 1 ? "" : "s"} healthy`
            : item.status === "HEALTHY"
            ? "Receiving events"
            : "No recent activity",
        environment: "",
        status: item.status === "HEALTHY" ? "Approve" : "Failed",
        icon: (item.name === "Connectors" ? "zap" : "git") as keyof typeof iconMap,
      })),
    },
  ];

  return (
    <div className="w-full max-w-md rounded-xl bg-[#030D25] p-6 font-sans text-white">
      {systemActivity.map((group) => (
        <div key={group.category}>
          <h3 className="mb-4 text-[17px] font-bold">{group.category}</h3>

          <div className="space-y-3">
            {group.items.map((item) => (
              <SidebarRow key={item.id} item={item} onClick={item.onClick} />
            ))}
          </div>

          <div className="my-6 h-px bg-[#1F2937]" />
        </div>
      ))}

      {healthGroups.map((group, groupIdx) => (
        <div key={group.category}>
          <h3 className="mb-4 text-[17px] font-bold">{group.category}</h3>

          <div className="space-y-3">
            {group.items.map((item) => (
              <SidebarRow key={item.id} item={item} />
            ))}
          </div>

          {groupIdx < healthGroups.length - 1 ? (
            <div className="my-6 h-px bg-[#1F2937]" />
          ) : null}
        </div>
      ))}

      <p className="mt-8 text-[11px] leading-relaxed text-[#64748B]">
        Pipelines are governed by{" "}
        <span className="font-medium text-white">Policies + Playbooks</span>.
        <br />
        Approvals and merges are audited.
      </p>
    </div>
  );
};

const SidebarRow = ({ item, onClick }: { item: ActivityItem; onClick?: () => void }) => (
  <div className="flex items-center justify-between rounded-2xl p-3 transition-all">
    <div className="flex items-center gap-3">
      <div className="text-white opacity-90">{iconMap[item.icon]}</div>
      <div>
        <p className="mb-1 text-sm font-bold leading-none">{item.title}</p>
        <p className="text-[11px] text-[#94A3B8]">
          {item.subtitle}
          {item.type ? ` · ${item.type}` : ""}
          {item.environment ? ` · ${item.environment}` : ""}
        </p>
      </div>
    </div>

    <button
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-full border px-3 py-1 text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed ${
        item.status === "Approve" || item.status === "Tracked" || item.status === "Resolved"
          ? "border-[#00CAD8] text-[#00CAD8]"
          : "border-[#EF4444] text-[#EF4444]"
      }`}
    >
      {item.status}
    </button>
  </div>
);

export default Sidebar;
