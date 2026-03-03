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
    impactSummary:
      "Customers experienced delayed checkout responses.",
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
    impactSummary:
      "Some partners did not receive real-time notifications.",
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
      cell: (info: CellContext<Tticket, unknown>) =>
        info.getValue() as string,
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
        <CButton className="border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan">
          <AiStarIcon stroke="#06eefd"/>
          Ezra Lead
        </CButton>
        <CButton className="border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan">
          <AiStarIcon stroke="#06eefd"/>
          Ezra Analyst
        </CButton>
       </div>
      ),
    },
  ];

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
        console.log({ res });
        if (res.success) {
          setTotalPages(res.data?.pagination.totalPages);
          setCurrentPage(res.data?.pagination.currentPage);
          return res.data;
        }
        return [];
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  const incidents = data?.incidents as Ticket[];


  const router = useRouter();

  const handleRowClick = () => {
    router.push("/incident/tickets/1234")
  }
  return (
    <div className="bg-dark w-full min-h-screen p-10 text-gray-100 space-y-4">
      {/* header */}
      <div className="flex justify-between items-center">
        <p className="font-bold">All incidents</p>
        <CButton
          onClick={() => router.push("/incident/tickets/create")}
          className="w-fit shadow-none"
        >
          <PlusIcon /> New Incident
        </CButton>
      </div>
      <p className="text-base">
        This is where incidents live in Scrubbe: signal-rich, CI/CD-linked, and
        ready for Ezra summaries. Filter by priority, type, service, time
        window, or ownership — then click an incident to work it end-to-end.
      </p>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8">
          <StepWrapper
            title="Queue health"
            rightContent={
              <div className="rounded-full px-2 py-1 border border-zinc-300 flex gap-2 items-center text-IMSLightGreen text-sm">
                {" "}
                <div className="size-2 rounded-full bg-IMSLightGreen" />
                Stable
              </div>
            }
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-1 w-full">
                <div className="border border-zinc-500 rounded-lg p-3 space-y-2 flex-1">
                  <div className="text-base flex items-center gap-2 font-medium">
                    <TriangleAlert className="size-4 text-yellow-400" />{" "}
                    <span>Open Now</span>{" "}
                  </div>
                  <div className="text-3xl font-bold">6</div>
                  <div className="text-base">Across your filtered view</div>
                </div>
                <div className="border border-zinc-500 rounded-lg p-3 space-y-2 flex-1">
                  <div className="text-base flex items-center gap-2 font-medium">
                    <Clock className="size-4 text-red-400" />{" "}
                    <span>P1/P2 active</span>{" "}
                  </div>
                  <div className="text-3xl font-bold">6</div>
                  <div className="text-base">Priority focus</div>
                </div>
              </div>
              <div className="border border-zinc-500 rounded-lg p-3 space-y-2 flex-1">
                <div className="text-base flex items-center gap-2 font-medium">
                  <AiStarIcon className="size-4 text-red-400" />{" "}
                  <span>P1/P2 active</span>{" "}
                </div>
                <div className="text-base">
                  Use Ezra on each row to generate leadership-ready summaries or
                  analyst deep dives without opening the incident.
                </div>
              </div>
            </div>
          </StepWrapper>
        </div>
        <div className="col-span-4">
          <StepWrapper title="What’s enterprise here">
            <div className="border border-zinc-500 rounded-lg p-3 space-y-2 flex-1">
              <p className="text-sm">What’s enterprise here</p>
              <ul className="pl-2 space-y-1">
                <li className="flex items-center gap-2 text-sm">
                  <CheckIcon className="size-4 text-IMSLightGreen" /> Filters +
                  saved views (how real teams work).
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckIcon className="size-4 text-IMSLightGreen" />
                  Full-screen incident workbench (not a cramped panel).
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckIcon className="size-4 text-IMSLightGreen" />
                  Timeline comments + field edits + audit-style updates.
                </li>
              </ul>
            </div>
          </StepWrapper>
        </div>
      </div>

      {/* filter */}
      <div className="flex flex-wrap gap-4 w-full">
        {/* state */}
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm text-white">
            Title
          </label>
          <div className="flex items-center gap-3 border rounded-md border-gray-400 h-[42px] bg-[#0A1635] px-3">
            <Search className="size-4 text-white" />
            <input
              id="title"
              className="h-auto border-none outline-none bg-transparent text-sm text-white"
              placeholder="Search by ID , Title , Service , owner"
            />
          </div>
          <p className="text-xs text-white ">
          Tip: try “checkout”, “P1”, “pipeline”, “fraud”.
          </p>
        </div>
        {/* date range */}
        <div className="flex flex-col">
          <label htmlFor="date" className="text-sm text-white mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" className="!bg-[#0A1635]" id="date" />
            <Input type="date" className="!bg-[#0A1635]" />
          </div>
          <p className="text-xs text-white -mt-2">
            Filter by detected/created time.
          </p>
        </div>

        <div>
          <Select
            label="Priority"
            className="!bg-[#0A1635]"
            labelClassName="text-white"
            options={[
              { value: "", label: "All" },
              { label: "P4-Low", value: "LOW" },
              { label: "P3-Medium", value: "MEDIUM" },
              { label: "P2-High", value: "HIGH" },
              { label: "P1-Critical", value: "CRITICAL" },
            ]}
          />
           <p className="text-xs text-white -mt-2">
           Sort is Separate.
          </p>
        </div>

        <div>
          <Select
            label="State"
            className="!bg-[#0A1635]"
            labelClassName="text-white"
            options={[
              { value: "", label: "All" },
              { label: "P4-Low", value: "LOW" },
              { label: "P3-Medium", value: "MEDIUM" },
              { label: "P2-High", value: "HIGH" },
              { label: "P1-Critical", value: "CRITICAL" },
            ]}
          />
           <p className="text-xs text-white -mt-2">
           Lifecycle View
          </p>
        </div>

        <div>
          <Select
            label="Type"
            className="!bg-[#0A1635] flex-1"
            labelClassName="text-white"
            options={[
              { value: "", label: "All" },
              { label: "P4-Low", value: "LOW" },
              { label: "P3-Medium", value: "MEDIUM" },
              { label: "P2-High", value: "HIGH" },
              { label: "P1-Critical", value: "CRITICAL" },
            ]}
          />
           <p className="text-xs text-white -mt-2">
           Scrubbe-native
          </p>
        </div>
      </div>

      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-2">
          <p className=" text-base text-white font-semibold">Incident List</p>
          <div className="p-1 border border-gray-400 text-gray-300 text-xs rounded-lg w-fit">14 Incidents Unfiltered</div>
        </div>

        <Button className="border border-IMSCyan" size={"sm"}>
          <CgSoftwareUpload className="size-4 text-IMSCyan"/>
          <p className="text-IMSCyan text-sm">Export</p>
        </Button>
      </div>

      <Table data={incidentRecords as any} columns={columns} onRowClick={handleRowClick} />


    </div>
  );
};

export default NewIncidentList;

const StepWrapper = ({
  title,
  children,
  rightContent,
}: {
  title: string;
  children: ReactNode;
  rightContent?: ReactNode;
}) => (
  <div
    className={`bg-gradient-to-b from-[#0074834D] to-[#004B571A] border rounded-xl transition-all border-IMSCyan/40 overflow-clip`}
  >
    <div className="p-4 border-b border-[#1F2937] flex justify-between items-center ">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <>{rightContent && rightContent}</>
    </div>
    <div className="px-4 py-4">{children}</div>
  </div>
);
