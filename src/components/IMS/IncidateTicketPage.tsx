/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Plus, SearchIcon } from "lucide-react";
import CButton from "../ui/Cbutton";
import Input from "../ui/input";
import { CellContext } from "@tanstack/react-table";
import { Table } from "../ui/table";
import clsx from "clsx";
import React, { useState, useRef, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { querykeys } from "@/lib/constant";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import moment from "moment";
import EmptyState from "@/components/ui/EmptyState";
import TableLoader from "../ui/LoaderUI/TableLoader";
import { usePathname, useRouter } from "next/navigation";
import { formatTime } from "@/lib/utils";
import { Ticket } from "@/types";
import Pagination from "../ui/Pagination";

const columns = [
  {
    accessorKey: "ticketId",
    header: () => <span className="font-semibold">Incident ID</span>,
    cell: (info: CellContext<Ticket, unknown>) => info.getValue(),
  },

  {
    accessorKey: "reason",
    header: () => <span className="font-semibold">Short Description</span>,
    cell: (info: CellContext<Ticket, unknown>) => (
      <div className=" truncate text-nowrap max-w-sm">
        {info.getValue() as string}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold">Status</span>,
    cell: (info: CellContext<Ticket, unknown>) => (
      <div className="flex items-center gap-2">
        {statusColors(info.getValue() as string)}
      </div>
    ),
  },
  {
    accessorKey: "priority",
    header: () => <span className="font-semibold">Priority</span>,
    cell: (info: CellContext<Ticket, unknown>) => (
      <div className="flex items-center gap-2">
        {priorityColors((info.getValue() as string) ?? "low")}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <span className="font-semibold">Date Opened</span>,
    cell: (info: CellContext<Ticket, unknown>) =>
      moment(info.getValue() as string).format("YYYY-MM-DD HH:MM:SS"),
  },
  {
    accessorKey: "MTTR",
    header: () => <span className="font-semibold">Time taken to raise</span>,
    cell: (info: CellContext<Ticket, unknown>) => (
      <div className="flex items-center gap-2">
        {formatTime(Number(info.getValue()))}
      </div>
    ),
  },
  {
    accessorKey: "Action",
    header: () => <span className="font-semibold">Action</span>,
    cell: () => (
      <div className=" p-2 rounded-md gap-2 bg-gray-200 text-center dark:text-black">
        View Details
      </div>
    ),
  },
];

const statusColors = (status: string) => {
  console.log(status);
  return (
    <div className="flex items-center text-sm gap-2">
      <div
        className={clsx(
          "px-3 py-1 rounded-md capitalize text-xs",
          status === "OPEN"
            ? "bg-red-100 text-red-500"
            : status === "CLOSED"
            ? "bg-gray-100 text-gray-500"
            : status === "ACKNOWLEDGED"
            ? "bg-cyan-100 text-cyan-500"
            : status === "INVESTIGATION"
            ? "bg-amber-100 text-amber-500"
            : status === "MITIGATED"
            ? "bg-orange-100 text-orange-500"
            : status === "RESOLVED"
            ? "bg-emerald-100 text-emerald-500"
            : "bg-gray-100 text-gray-500"
        )}
      >
        {status}
      </div>
    </div>
  );
};

const priorityColors = (priority: string) => {
  return (
    <div className="flex items-center gap-2 ">
      <div
        className={clsx(
          "px-3 py-1 text-xs rounded-md capitalize",
          priority === "CRITICAL"
            ? "bg-red-100 text-red-500"
            : priority === "HIGH"
            ? "text-orange-500 bg-orange-100"
            : priority === "MEDIUM"
            ? "bg-yellow-100 text-yellow-500"
            : priority === "LOW"
            ? "bg-blue-100 text-blue-500"
            : "bg-gray-100 text-gray-500"
        )}
      >
        {priority}
      </div>
    </div>
  );
};
const IncidentTicketPage = () => {
  const [openStatusFilter, setOpenStatusFilter] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  // const { notification } = useNotificationProvider();

  const statusFilterRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!openStatusFilter) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setOpenStatusFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openStatusFilter]);

  const handleRowClick = (ticket: Ticket) => {
    console.log(ticket);
    router.push(`${pathname}/${ticket.id}`);
  };

  let content: ReactNode;
  if (isLoading) {
    content = <TableLoader />;
  }
  if (!isLoading && (!incidents || incidents?.length < 1)) {
    content = (
      <EmptyState
        title="You have no incident ticket yet"
        action={
          <CButton
            onClick={() => router.push("/incident/tickets/create")}
            className="w-fit  bg-IMSLightGreen text-white hover:bg-IMSGreen shadow-none"
          >
            Create New Incident <Plus />
          </CButton>
        }
      />
    );
  }
  if (incidents?.length > 0) {
    content = (
      <div className="space-y-5">
        <div className="flex justify-between items-start mb-5">
          <div className="relative w-1/2">
            <Input placeholder="Search Tickets" />
            <div className="absolute right-2 top-2/4 -translate-y-2/3 pb-2">
              <SearchIcon size={18} className="dark:text-white text-black" />
            </div>
          </div>

          <div className="flex gap-2 ">
            <div className="relative" ref={statusFilterRef}>
              <CButton
                onClick={() => setOpenStatusFilter(!openStatusFilter)}
                className="w-fit border-green hover:bg-green hover:text-white dark:text-white border bg-transparent text-green"
              >
                Filter by Status
              </CButton>
              {/* click outside to close */}
              {openStatusFilter && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 text-sm rounded-md shadow-lg">
                  {[
                    { label: "Open", value: "open" },
                    { label: "Closed", value: "closed" },
                    { label: "In Progress", value: "in-progress" },
                    { label: "On Hold", value: "on-hold" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        // setStatusFilter(option.value);
                        setOpenStatusFilter(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-gray-900 first:rounded-t-md last:rounded-b-md"
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <CButton className="w-fit border-green hover:bg-green hover:text-white dark:text-white border bg-transparent text-green">
              More Filter
            </CButton>
          </div>
        </div>
        <Table data={incidents} columns={columns} onRowClick={handleRowClick} />
        <div className="flex justify-end mt-10">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(value) => setCurrentPage(value)}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold dark:text-white text-black">
          Create and Manage new critical Incidents
        </div>
        <div className=" space-x-3">
          <CButton
            onClick={() => router.push("/incident/tickets/create")}
            className="w-fit shadow-none"
          >
            Create New Incident <Plus />
          </CButton>
        </div>
      </div>

      <div className="mt-5 dark:bg-dark bg-white p-6   h-full rounded-xl">
        {content}
      </div>
    </div>
  );
};

export default IncidentTicketPage;
