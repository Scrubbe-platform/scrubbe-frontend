/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { CellContext } from "@tanstack/react-table";
import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Table } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import moment from "moment";
import CButton from "@/components/ui/Cbutton";
import EmptyState from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { Filter, Plus } from "lucide-react";
import TableLoader from "@/components/ui/LoaderUI/TableLoader";
import ProgressBar from "@/components/ezra/ProgressBar";
import { Button } from "@heroui/react";
import { Ticket } from "@/types";

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

const statusColors = (status: string) => {
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

const ActiveIncidentTable = () => {
  const { get } = useFetch();
  const [filter, setFilter] = useState<string | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: [querykeys.INCIDENT_TICKET, filter],
    queryFn: async () => {
      try {
        const res = await get(
          filter
            ? `${endpoint.portal.get_incidents}?status=${filter}`
            : endpoint.portal.get_incidents
        );
        if (res.success) {
          return res.data.data;
        }
        return [];
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  const columns = [
    {
      accessorKey: "ticketNumber",
      header: () => <span className="font-semibold">Incident ID</span>,
      cell: (info: CellContext<Ticket, unknown>) => info.getValue(),
    },

    {
      accessorKey: "shortDescription",
      header: () => <span className="font-semibold">Title</span>,
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
        moment(info.getValue() as string).fromNow(),
    },
    {
      accessorKey: "SLA",
      header: () => <span className="font-semibold">SLA Progress</span>,
      cell: (info: CellContext<Ticket, unknown>) => {
        console.log(info);
        return (
          <div className=" max-w-sm">
            <ProgressBar color="bg-IMSLightGreen" value={70} />
          </div>
        );
      },
    },
    {
      accessorKey: "Action",
      header: () => <span className="font-semibold">Action</span>,
      cell: (info: CellContext<Ticket, unknown>) => {
        const id = info.row.original.id;

        return (
          <div className=" max-w-sm">
            <Button
              onClick={() => router.push("/portal/ticket/" + id)}
              size="sm"
            >
              View Details
            </Button>
          </div>
        );
      },
    },
  ];

  const statusFilterRef = useRef<HTMLDivElement>(null);
  const [openStatusFilter, setOpenStatusFilter] = useState<boolean>(false);

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
  const router = useRouter();

  if (isLoading) {
    return <TableLoader />;
  }

  return (
    <div className=" bg-white p-4">
      <div className="flex justify-between items-start mb-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Active Incidents Feed
        </h2>

        <div className="flex gap-2 ">
          <div className="relative" ref={statusFilterRef}>
            <CButton
              onClick={() => setOpenStatusFilter(!openStatusFilter)}
              className="w-fit border-green hover:bg-green hover:text-white dark:text-white border bg-transparent text-green"
            >
              Filter by Status <Filter />
            </CButton>
            {/* click outside to close */}
            {openStatusFilter && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 text-sm rounded-md shadow-lg">
                {[
                  { label: "Open", value: "OPEN" },
                  { label: "Closed", value: "CLOSED" },
                  { label: "In Progress", value: "IN_PROGRESS" },
                  { label: "Resolve", value: "RESOLVED" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value);
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
          {/* <CButton className="w-fit border-green hover:bg-green hover:text-white dark:text-white border bg-transparent text-green">
            More Filter <Filter />
          </CButton> */}
        </div>
      </div>
      {data?.incidents?.length > 0 ? (
        <Table data={data?.incidents} columns={columns} />
      ) : (
        <EmptyState
          title="You have no incident ticket yet"
          action={
            <CButton
              onClick={() => router.push("/portal/ticket")}
              className="w-fit  bg-IMSLightGreen text-white hover:bg-IMSGreen shadow-none"
            >
              Create New Incident <Plus />
            </CButton>
          }
        />
      )}
    </div>
  );
};

export default ActiveIncidentTable;
