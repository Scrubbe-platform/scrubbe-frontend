"use client";
import { CellContext } from "@tanstack/react-table";
import React from "react";
import clsx from "clsx";
import { Table } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import moment from "moment";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";
import CButton from "@/components/ui/Cbutton";
import { Plus } from "lucide-react";

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

type Props = {
  activeIncident: {
    id: string;
    title: string;
    createdAt: string;
    assignedTo: string;
    status: string;
  }[];
};

type Ticket = {
  id: string;
  title: string;
  createdAt: string;
  assignedTo: string;
  status: string;
};

const ActiveIncidentTable = ({ activeIncident }: Props) => {
  const { get } = useFetch();
  const router = useRouter();
  const { data } = useQuery({
    queryKey: [querykeys.INCIDENT_TICKET],
    queryFn: async () => {
      try {
        const res = await get(endpoint.incident_ticket.get);
        console.log({ res });
        if (res.success) {
          return res.data.incidents.splice(0, 5);
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
      accessorKey: "ticketId",
      header: () => <span className="font-semibold">Incident ID</span>,
      cell: (info: CellContext<Ticket, unknown>) => info.getValue(),
    },

    {
      accessorKey: "title",
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
      accessorKey: "createdAt",
      header: () => <span className="font-semibold">Date Opened</span>,
      cell: (info: CellContext<Ticket, unknown>) =>
        moment(info.getValue() as string).fromNow(),
    },
    // {
    //   accessorKey: "assignedToEmail",
    //   header: () => <span className="font-semibold">Assigned to</span>,
    //   cell: (info: CellContext<Ticket, unknown>) => {
    //     console.log({ info });
    //     const currentId = info.row.original.id;

    //     const teams = [
    //       {
    //         first_name: "Jane",
    //         last_name: "morakinyo",
    //         id: "1",
    //         email: "olamidemoraks@gmail.com",
    //       },
    //       {
    //         first_name: "david",
    //         last_name: "morakinyo",
    //         id: "1",
    //         email: "olamidemoraks@gmail.com",
    //       },
    //       {
    //         first_name: "david",
    //         last_name: "morakinyo",
    //         id: "1",
    //         email: "olamidemoraks@gmail.com",
    //       },
    //       {
    //         first_name: "david",
    //         last_name: "morakinyo",
    //         id: "1",
    //         email: "olamidemoraks@gmail.com",
    //       },
    //     ];

    //     const handleOnchange = (value: string) => {
    //       reassignTicketToTeam(currentId, value);
    //     };

    //     return (
    //       <div className=" max-w-sm">
    //         <Select
    //           options={teams.map((item) => ({
    //             label: item.first_name + " " + item.last_name,
    //             value: item.id,
    //           }))}
    //           onChange={(e) => handleOnchange(e.target.value)}
    //         />
    //       </div>
    //     );
    //   },
    // },
  ];

  // const reassignTicketToTeam = (id: string, teamId: string) => {
  //   console.log(id, teamId);
  // };
  const handleRowClick = (ticket: Ticket) => {
    console.log(ticket);
    router.push(`/incident/${ticket.id}`);
  };

  return (
    <div className=" bg-white p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Active Incidents Feed
        </h2>
        <p
          onClick={() => router.push("/incident/tickets")}
          className="text-base text-IMSLightGreen underline"
        >
          See more
        </p>
      </div>
      {data && data?.length > 0 ? (
        <Table
          data={activeIncident}
          columns={columns}
          onRowClick={handleRowClick}
        />
      ) : (
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
      )}
    </div>
  );
};

export default ActiveIncidentTable;
