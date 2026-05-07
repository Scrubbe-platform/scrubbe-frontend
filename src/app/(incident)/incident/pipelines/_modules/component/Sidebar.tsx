"use client";
import React, { ReactNode } from "react";
import {
  AlertTriangle,
  GitPullRequest,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useIncidentWorkspace } from "@/hooks/useIncidentWorkspace";

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

  const serviceName =
    selectedIncident?.service ||
    selectedIncident?.affectedSystem ||
    "selected-service";
  const repoName = `Scrubbe/${serviceName.replace(/\s+/g, "-").toLowerCase()}`;
  const ticketId = selectedIncident?.ticketId || "INCIDENT";
  const incidentTitle =
    selectedIncident?.title ||
    selectedIncident?.reason ||
    selectedIncident?.summary ||
    "Selected incident";
  const environment = selectedIncident?.environment || "runtime";
  const statusLabel =
    selectedIncident?.status === "RESOLVED" || selectedIncident?.status === "CLOSED"
      ? "Resolved"
      : "Approve";

  const systemActivity = [
    {
      category: "Needs approval",
      items: [
        {
          id: `${ticketId}-pr`,
          type: "pr",
          title: `Approve ${ticketId}`,
          subtitle: repoName,
          environment: "",
          status: statusLabel,
          icon: "alert" as const,
        },
        {
          id: `${ticketId}-deploy`,
          type: "deploy",
          title: `Review ${serviceName} deploy`,
          subtitle: repoName,
          environment,
          status: statusLabel,
          icon: "alert" as const,
        },
      ],
    },
    {
      category: "Delivery Failures",
      items: [
        {
          id: `${ticketId}-1`,
          type: "incident",
          title: ticketId,
          subtitle: repoName,
          environment,
          status: selectedIncident?.status || "Failed",
          icon: "git" as const,
        },
        {
          id: `${ticketId}-2`,
          type: "service",
          title: incidentTitle,
          subtitle: `${repoName} · ${serviceName}`,
          environment: selectedIncident?.region || "",
          status: selectedIncident?.severity || "P3",
          icon: "git" as const,
        },
        {
          id: `${ticketId}-3`,
          type: "owner",
          title: "Response owner",
          subtitle:
            selectedIncident?.assignedToName ||
            selectedIncident?.assignedToEmail ||
            selectedIncident?.incidentCommander ||
            "Unassigned",
          environment: "",
          status: selectedIncident ? "Tracked" : "Pending",
          icon: "alert" as const,
        },
      ],
    },
  ];

  const health = [
    {
      category: "Listener health",
      items: [
        {
          id: "webhook",
          title: "Webhook Ingestion",
          subtitle: selectedIncident
            ? `${selectedIncident.elapsedLabel} · source ${
                selectedIncident.sourceType || selectedIncident.source || "manual"
              }`
            : "Awaiting incident selection",
          status: selectedIncident ? "Approve" : "Failed",
          icon: "git" as const,
        },
        {
          id: "connector",
          title: "Connector",
          subtitle: selectedIncident
            ? `${serviceName} · ${environment}`
            : "No service bound",
          status: selectedIncident ? "Approve" : "Failed",
          icon: "zap" as const,
        },
        {
          id: "policy",
          title: "Policy engine",
          subtitle: selectedIncident
            ? `${selectedIncident.severity || "P3"} · gates active`
            : "Balanced · gates active",
          status: "Approve",
          icon: "check" as const,
        },
      ],
    },
  ];

  return (
    <div className="w-full max-w-md rounded-xl bg-[#030D25] p-6 font-sans text-white">
      {systemActivity.map((group) => (
        <div key={group.category}>
          <h3 className="mb-4 text-[17px] font-bold">{group.category}</h3>

          <div className="space-y-3">
            {group.items.map((item) => (
              <SidebarRow key={item.id} item={item} />
            ))}
          </div>

          <div className="my-6 h-px bg-[#1F2937]" />
        </div>
      ))}

      {health.map((group, groupIdx) => (
        <div key={group.category}>
          <h3 className="mb-4 text-[17px] font-bold">{group.category}</h3>

          <div className="space-y-3">
            {group.items.map((item) => (
              <SidebarRow key={item.id} item={item} />
            ))}
          </div>

          {groupIdx < health.length - 1 ? (
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

const SidebarRow = ({ item }: { item: ActivityItem }) => (
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
      className={`rounded-full border px-3 py-1 text-[10px] font-bold ${
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
