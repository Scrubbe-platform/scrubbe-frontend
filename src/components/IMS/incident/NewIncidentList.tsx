"use client";
import AiStarIcon from "@/components/icons/ai-star";
import { Button } from "@/components/ui/button";
import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import { formatTime } from "@/lib/utils";
import { Ticket, Tticket } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { CellContext } from "@tanstack/react-table";
import clsx from "clsx";
import { motion } from "framer-motion";
import {
  CheckIcon,
  Clock,
  PlusIcon,
  Search,
  TriangleAlert,
} from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import React, { ReactNode, useState } from "react";
import { CgSoftwareUpload } from "react-icons/cg";

const incidentRecords = [
  {
    ticketId: "INC-2026-0001",
    summary: "API latency incident",
    serviceArea: "Payments",
    sourceType: "Monitoring",
    detection: "Alertmanager",
    reportedBy: "oncall_sre",
    severity: "P1",
    environment: "Production",
    region: "US-East",
    state: "INVESTIGATION",
    createdAt: "2026-01-10T14:20:00.000Z",

    techDescription:
      "Increased p95 latency on the payments API due to degraded database performance.",
    impactSummary: "Customers experienced delayed checkout responses.",
    businessFlow: "Card payment authorization",
    financialExposure: "$5,000 potential impact",
    blastRadius: "Subset of US-East traffic",
    regulatory: "None",
    customerCommNeeded: false,
    customerMessage: undefined,

    incidentCommander: "Jane Doe",
    owningSquad: "Payments-Platform",
    escalationStage: "L2",
    onCallNotes: "DB connections saturated around peak load",

    playbook: "payments-api-latency-playbook",
    suggestionId: "SUG-12345",
    fixStatus: "Mitigated",
    metrics: ["p95_latency", "error_rate"],
    logStreams: ["payments-api-logs"],
    pipelines: ["payments-deploy-pipeline"],
    fraudRiskView: [],

    rootCauseCategory: "Capacity",
    relatedIncident: "INC-2025-0001",
    internalNotes: "Consider auto-scaling DB connections",
    postActions: ["Capacity review", "Add database alerts"],
    ezraFocusMode: "stabilize",
    ezraInstructions: "Monitor latency for 24 hours",
  },
  {
    ticketId: "INC-2026-0002",
    summary: "Webhook delivery failures",
    serviceArea: "Notifications",
    sourceType: "Customer ticket",
    detection: "Support",
    reportedBy: "support_agent",
    severity: "P2",
    environment: "Production",
    region: "EU-West",
    state: "OPEN",
    createdAt: "2026-01-11T09:05:00.000Z",

    techDescription:
      "Webhook retry worker stuck due to message queue backpressure.",
    impactSummary: "Some partners did not receive real-time notifications.",
    businessFlow: "Partner webhooks",
    financialExposure: "Low",
    blastRadius: "Affected partners in EU-West",
    regulatory: undefined,
    customerCommNeeded: true,
    customerMessage: "We are investigating delayed webhook deliveries.",

    incidentCommander: "John Smith",
    owningSquad: "Messaging-Core",
    escalationStage: "L1",
    onCallNotes: undefined,

    playbook: "webhook-retry-failure-playbook",
    suggestionId: "SUG-67890",
    fixStatus: "In Progress",
    metrics: ["retry_queue_depth"],
    logStreams: ["webhook-worker-logs"],
    pipelines: [],
    fraudRiskView: [],

    rootCauseCategory: "Queue Backpressure",
    relatedIncident: undefined,
    internalNotes: "Possible memory leak in worker",
    postActions: ["Add queue autoscaling", "Profile worker memory"],
    ezraFocusMode: undefined,
    ezraInstructions: undefined,
  },
];

export const statusColors = (status: string) => {
  console.log(status);
  return (
    <div className="flex items-center text-sm gap-2">
      <div
        className={clsx(
          "p-1 px-2 rounded-md capitalize text-xs border",
          status === "OPEN"
            ? "border-red-500 text-red-500"
            : status === "CLOSED"
            ? "border-gray-500 text-gray-500"
            : status === "ACKNOWLEDGED"
            ? "border-cyan-500 text-cyan-500"
            : status === "INVESTIGATION"
            ? "border-amber-500 text-amber-500"
            : status === "MITIGATED"
            ? "border-orange-500 text-orange-500"
            : status === "RESOLVED"
            ? "border-emerald-500 text-emerald-500"
            : "border-gray-500 text-gray-500"
        )}
      >
        {status}
      </div>
    </div>
  );
};

export const priorityColors = (priority: string) => {
  return (
    <div className="flex items-center gap-2 ">
      <div
        className={clsx(
          "p-1 px-2 text-xs rounded-md capitalize border",
          priority === "P1"
            ? "border-red-500 text-red-500"
            : priority === "P2"
            ? "text-yellow-500 border-yellow-500"
            : priority === "P3"
            ? "border-blue-500 text-blue-500"
            : priority === "P4"
            ? "border-emerald-500 text-emerald-500"
            : "border-gray-500 text-gray-500"
        )}
      >
        {priority}
      </div>
    </div>
  );
};
const NewIncidentList = () => {
  const columns = [
    {
      accessorKey: "ticketId",
      header: () => <span className="font-semibold">Incident ID</span>,
      cell: (info: CellContext<Tticket, unknown>) => info.getValue(),
    },

    {
      accessorKey: "summary",
      header: () => <span className="font-semibold">Title</span>,
      cell: (info: CellContext<Tticket, unknown>) => (
        <div className=" truncate text-nowrap max-w-sm">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: "serviceArea",
      header: () => <span className="font-semibold">Service</span>,
      cell: (info: CellContext<Tticket, unknown>) => (
        <div className=" truncate text-nowrap max-w-sm">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: "severity",
      header: () => <span className="font-semibold">Severity</span>,
      cell: (info: CellContext<Tticket, unknown>) => (
        <div className="flex items-center gap-2">
          {priorityColors((info.getValue() as string) ?? "low")}
        </div>
      ),
    },
    {
      accessorKey: "state",
      header: () => <span className="font-semibold">State</span>,
      cell: (info: CellContext<Tticket, unknown>) => (
        <div className="flex items-center gap-2">
          {statusColors(info.getValue() as string)}
        </div>
      ),
    },
    {
      accessorKey: "sourceType",
      header: () => <span className="font-semibold">Type</span>,
      cell: (info: CellContext<Tticket, unknown>) => info.getValue() as string,
    },
    {
      accessorKey: "createdAt",
      header: () => <span className="font-semibold">Detected</span>,
      cell: (info: CellContext<Tticket, unknown>) =>
        moment(info.getValue() as string).format("YYYY-MM-DD HH:MM:SS"),
    },
    // {
    //   accessorKey: "MTTR",
    //   header: () => <span className="font-semibold">Time taken to raise</span>,
    //   cell: (info: CellContext<Tticket, unknown>) => (
    //     <div className="flex items-center gap-2">
    //       {formatTime(Number(info.getValue()))}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "Action",
      header: () => <span className="font-semibold">Action</span>,
      cell: () => (
        <div className="flex items-center gap-3">
          <EzraButton>
            <AiStarIcon stroke="#06eefd" /> Ezra Lead
          </EzraButton>
          <EzraButton>
            <AiStarIcon stroke="#06eefd" /> Ezra Analyst
          </EzraButton>
        </div>
      ),
    },
  ];

  const EzraButton = ({ children, ...props }: any) => (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <CButton
        {...props}
        className="border bg-transparent hover:bg-IMSCyan/10 border-IMSCyan text-IMSCyan transition-colors relative overflow-hidden group"
      >
        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
        {children}
      </CButton>
    </motion.div>
  );

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { get } = useFetch();

  const { data, isLoading } = useQuery({
    queryKey: [querykeys.INCIDENT_TICKET, currentPage],
    queryFn: async () => {
      try {
        const res = await get(
          endpoint.incident_ticket.get + `?page=${currentPage}`
        );
        if (res.success) {
          const payload = res.data?.data ?? res.data;
          setTotalPages(payload?.pagination?.totalPages ?? 0);
          setCurrentPage(payload?.pagination?.currentPage ?? 1);
          return payload;
        }
        return null;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    refetchOnWindowFocus: false,
  });

  const incidents = data?.incidents as Tticket[];

  const router = useRouter();

  const handleRowClick = (item: any) => {
    router.push("/incident/tickets/" + item.id);
  };
  return (
    <div className="bg-dark w-full min-h-screen p-10 text-gray-300 space-y-8 font-sans selection:bg-IMSCyan/30">
      {/* HEADER SECTION */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              All Incidents
            </h1>
            <p className="text-[13px] text-gray-400 max-w-2xl leading-relaxed mt-1">
              Signal-rich, CI/CD-linked, and ready for Ezra intelligence. Filter
              by priority, service, or ownership to work incidents
              end-to-end[cite: 12, 115].
            </p>
          </div>
          <CButton
            onClick={() => router.push("/incident/tickets/create")}
            className="w-fit shadow-lg bg-IMSCyan text-black font-bold hover:brightness-110 px-6"
          >
            <PlusIcon className="size-4 mr-2" /> New Incident
          </CButton>
        </div>
      </div>

      {/* INSIGHTS CARDS */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <StepWrapper
            title="Queue Health"
            rightContent={
              <div className="rounded-full px-3 py-1 border border-IMSLightGreen/30 bg-IMSLightGreen/5 flex gap-2 items-center text-IMSLightGreen text-[11px] font-bold uppercase tracking-wider">
                <div className="size-1.5 rounded-full bg-IMSLightGreen animate-pulse" />
                Stable
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-black/20 border border-white/10 rounded-xl p-4 flex-1 transition-hover hover:border-yellow-500/30">
                  <div className="text-[10px] flex items-center gap-2 font-bold text-gray-400 uppercase tracking-widest mb-1">
                    <TriangleAlert className="size-3 text-yellow-500" />
                    <span>Open Now</span>
                  </div>
                  <div className="text-3xl font-bold text-white">6</div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Active in filtered view [cite: 20]
                  </div>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-xl p-4 flex-1 transition-hover hover:border-red-500/30">
                  <div className="text-[10px] flex items-center gap-2 font-bold text-gray-400 uppercase tracking-widest mb-1">
                    <Clock className="size-3 text-red-500" />
                    <span>P1/P2 Active</span>
                  </div>
                  <div className="text-3xl font-bold text-white">6</div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Priority response required [cite: 57]
                  </div>
                </div>
              </div>
              <div className="bg-IMSCyan/5 border border-IMSCyan/20 rounded-xl p-4 transition-hover hover:bg-IMSCyan/10">
                <div className="text-[10px] flex items-center gap-2 font-bold text-IMSCyan uppercase tracking-widest mb-1">
                  <AiStarIcon className="size-3" />
                  <span>Ezra Intelligence</span>
                </div>
                <div className="text-[13px] text-gray-300 leading-snug">
                  Generate leadership-ready summaries or analyst deep dives
                  without opening the incident detail[cite: 138].
                </div>
              </div>
            </div>
          </StepWrapper>
        </div>

        <div className="col-span-4">
          <StepWrapper title="Enterprise Controls">
            <div className="bg-black/20 border border-white/10 rounded-xl p-4 space-y-4 h-full">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-[12px] leading-tight">
                  <CheckIcon className="size-4 text-IMSLightGreen shrink-0" />
                  <span>
                    Saved views and filters for professional workflows[cite:
                    74].
                  </span>
                </li>
                <li className="flex items-start gap-3 text-[12px] leading-tight">
                  <CheckIcon className="size-4 text-IMSLightGreen shrink-0" />
                  <span>
                    Full-screen workbench designed for complex
                    investigation[cite: 135].
                  </span>
                </li>
                <li className="flex items-start gap-3 text-[12px] leading-tight">
                  <CheckIcon className="size-4 text-IMSLightGreen shrink-0" />
                  <span>
                    Immutable audit trails for governance and learning[cite: 70,
                    73].
                  </span>
                </li>
              </ul>
            </div>
          </StepWrapper>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-panel/50 border border-white/5 rounded-2xl p-6 space-y-6">
        <div className="flex flex-wrap gap-6 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[300px] space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Search
            </label>
            <div className="flex items-center gap-3 border border-white/10 rounded-xl h-[44px] bg-[#0A1635] px-4 transition-focus focus-within:border-IMSCyan/50">
              <Search className="size-4 text-gray-500" />
              <input
                id="title"
                className="w-full border-none outline-none bg-transparent text-[13px] text-white placeholder:text-gray-600"
                placeholder="ID, Title, Service, or Owner..."
              />
            </div>
            <p className="text-[10px] text-gray-500 italic ml-1">
              Try: "payments", "P1", "production"[cite: 27].
            </p>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Time Window
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="!bg-[#0A1635] !border-white/10 !rounded-xl !h-[44px] !text-xs text-white"
              />
              <div className="text-gray-600 text-xs">to</div>
              <Input
                type="date"
                className="!bg-[#0A1635] !border-white/10 !rounded-xl !h-[44px] !text-xs text-white"
              />
            </div>
          </div>

          {/* Selects */}
          <div className="flex gap-4">
            <div className="w-[140px] space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Priority
              </label>
              <Select
                className="!bg-[#0A1635] !border-white/10 !rounded-xl !h-[44px] !text-xs"
                options={[
                  { label: "All Priorities", value: "" },
                  { label: "P1 - Critical", value: "CRITICAL" },
                ]}
              />
            </div>
            <div className="w-[140px] space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Status
              </label>
              <Select
                className="!bg-[#0A1635] !border-white/10 !rounded-xl !h-[44px] !text-xs"
                options={[
                  { label: "All States", value: "" },
                  { label: "Investigating", value: "INVESTIGATION" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION HEADER */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">Incident List</h2>
          <div className="px-2 py-0.5 border border-white/10 bg-white/5 text-gray-400 text-[10px] font-bold rounded uppercase tracking-tighter">
            14 Total Unfiltered [cite: 116]
          </div>
        </div>
        <Button className="border border-IMSCyan/50 bg-IMSCyan/5 hover:bg-IMSCyan/10 text-IMSCyan text-xs font-bold rounded-xl h-9 px-4 transition-all">
          <CgSoftwareUpload className="size-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* TABLE COMPONENT */}
      <div className="border border-white/5 rounded-2xl overflow-hidden bg-panel/30">
        <Table
          data={
            incidents && incidents.length > 0
              ? incidents
              : (incidentRecords as any)
          }
          columns={columns}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
};

export default NewIncidentList;

const StepWrapper = ({ title, children, rightContent }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="bg-gradient-to-b from-[#0074834D] to-[#004B571A] border rounded-xl border-IMSCyan/40 overflow-clip"
  >
    <div className="p-4 border-b border-[#1F2937] flex justify-between items-center">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          {title}
        </h2>
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>
    <div className="px-4 py-4">{children}</div>
  </motion.div>
);
