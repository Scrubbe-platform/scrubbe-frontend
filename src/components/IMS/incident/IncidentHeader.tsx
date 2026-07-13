"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import {
  IncidentDetailRecord,
  IncidentStats,
} from "@/lib/incident/incident.types";
import Modal from "@/components/ui/Modal";
import WarRoom from "./WarRoom";
import AddContextForm from "./ContextForm";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button1";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Plus,
  Video,
} from "lucide-react";
import LiveViewers from "./LiveViewers";
import { BiMessageRoundedDetail } from "react-icons/bi";
import MessagesModal from "@/app/(incident)/incident/handover/_modules/components/MessagesModal";
import IncidentDurationCard from "./IncidentDurationCard";

interface TabItem {
  id: string;
  label: string;
  link: string;
}
interface IncidentHeaderProps {
  incident: IncidentDetailRecord;
  stats: IncidentStats;
  context: any;
  activeTab?: string;
}

const IncidentHeader = ({
  incident,
  context,
  activeTab,
}: IncidentHeaderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("id") ?? incident.id;
  const currentTab = searchParams.get("tab");
  const [openWarRoom, setOpenWarRoom] = useState(false);
  const [openContext, setOpenContext] = useState(false);
  const [openChatModal, setOpenChatModal] = useState(false);
  const tabs: TabItem[] = [
    {
      id: "overview",
      label: "Overview",
      link: `/incident/tickets?id=${activeId}`,
    },
    {
      id: "signal-graph",
      label: "Signal graph",
      link: `/incident/signal-graph?id=${activeId}`,
    },
    {
      id: "code-engine",
      label: "Code Engine",
      link: `/incident/code-engine?id=${activeId}`,
    },
    {
      id: "delivery",
      label: "Incident Delivery",
      link: `/incident/incident-delivery?id=${activeId}`,
    },
    {
      id: "playbook",
      label: "Playbook",
      link: `/incident/playbooks?id=${activeId}`,
    },
  ];

  return (
    <div className="w-full pt-6 flex flex-col gap-5 dark:bg-transparent font-ibm">
      {/* ── Top row ── */}
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          {/* Ticket ID + badges */}
          <div className="flex items-center gap-1 font-ibm text-sm mb-2">
            <span
              onClick={() => router.replace("/incident/tickets")}
              className="text-zinc-400 hover:text-black cursor-pointer"
            >
              Incident Library
            </span>{" "}
            <ChevronRight size={16} />
            <span>
              {activeTab === "overview"
                ? "Incident Details"
                : tabs.find((t) => t.id == activeTab)?.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xl font-ibm font-semibold text-black dark:text-zinc-500 tracking-wider">
              {incident.ticketId}
            </span>
            <span className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-700" />
            <SourceBadge>{incident.sourceType || "Manual"}</SourceBadge>
            <Dropdown
              trigger={
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border !bg-gray-100 text-gray-500">
                  View incident Duration <ChevronDown size={13} />
                </div>
              }
            >
              <IncidentDurationCard incident={incident} />
            </Dropdown>
          </div>

          {/* Title */}
          <h1 className="text-lg text-zinc-500 dark:text-white font-ibm leading-snug max-w-2xl">
            {incident.title}
          </h1>

          {/* Meta chips */}
          {/* <div className="flex flex-wrap gap-1.5">
            {[
              incident.service,
              incident.region,
              incident.environment,
              incident.status,
              incident.ticketId,
            ]
              .filter(Boolean)
              .map((val) => (
                <span
                  key={val}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-zinc-500 dark:border-zinc-700/60 text-black dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40"
                >
                  {val}
                </span>
              ))}
          </div> */}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <LiveViewers title="Viewing this Incident" ticketId={incident.id} />
          <Dropdown
            position="left"
            showSelectedIcon={false}
            items={[
              {
                value: "war-room",
                label: "War Room",
                icon: <Video size={14} />,
                onClick: () => setOpenWarRoom(true),
              },
              {
                value: "message",
                label: "Messages",
                icon: <BiMessageRoundedDetail size={14} />,
                onClick: () => setOpenChatModal(true),
              },
            ]}
            trigger={
              <Button size="sm" className="!bg-slate-200">
                <EllipsisVertical size={14} color="black" />
              </Button>
            }
          />
        </div>
      </div>

      {/* ── Tab nav ── */}
      <div className="px-4 border bg-white border-neutral-300 border-b-transparent rounded-t-md">
        <nav className="flex w-full p-2">
          {tabs.map((tab) => {
            const isActive = activeTab
              ? activeTab === tab.id
              : currentTab === tab.id || (tab.id === "overview" && !currentTab);

            return (
              <Link key={tab.id} href={tab.link} className="flex ">
                <span
                  className={`text-sm px-4 font-medium whitespace-nowrap transition-colors w-full justify-center rounded-sm text-center py-1 ${
                    isActive
                      ? "bg-neutral-100 text-black dark:bg-zinc-800 dark:text-white"
                      : "text-neutral-500 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      <Modal onClose={() => setOpenContext(false)} isOpen={openContext}>
        <AddContextForm
          incident={incident}
          onCancel={() => setOpenContext(false)}
          context={context}
        />
      </Modal>
      <Modal onClose={() => setOpenWarRoom(false)} isOpen={openWarRoom}>
        <WarRoom incident={incident} onClose={() => setOpenWarRoom(false)} />
      </Modal>
      {openChatModal && (
        <MessagesModal onClose={() => setOpenChatModal(false)} />
      )}
    </div>
  );
};

const SourceBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="px-2 py-0.5 rounded-md text-[11px] border !bg-gray-100 text-gray-500">
    {children}
  </span>
);

const SeverityBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="px-2 py-0.5 rounded-md text-[11px]  border bg-gray-100 text-gray-500">
    {children}
  </span>
);

export default IncidentHeader;
