/* eslint-disable @typescript-eslint/no-explicit-any */
import CButton from "@/components/ui/Cbutton";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/input";
import { CellContext } from "@tanstack/react-table";
import { SearchIcon } from "lucide-react";
import React from "react";
import { BiExport } from "react-icons/bi";
import { MdEmail } from "react-icons/md";

const columns = [
  {
    accessorKey: "ticketId",
    header: () => <span className="font-semibold">Incident ID</span>,
    cell: (info: CellContext<any, unknown>) => info.getValue(),
  },

  {
    accessorKey: "target",
    header: () => <span className="font-semibold">SLA Target</span>,
    cell: (info: CellContext<any, unknown>) => (
      <div className=" truncate text-nowrap max-w-sm">
        {info.getValue() as string}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold">SLA Met</span>,
    cell: (info: CellContext<any, unknown>) => (
      <div className="flex items-center gap-2">{info.getValue() as string}</div>
    ),
  },
  {
    accessorKey: "priority",
    header: () => <span className="font-semibold">Resolution Time</span>,
    cell: (info: CellContext<any, unknown>) => (
      <div className="flex items-center gap-2">{info.getValue() as string}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <span className="font-semibold">Breach Reason</span>,
    cell: (info: CellContext<any, unknown>) => info.getValue() as string,
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
console.log(columns);
const SlaReports = () => {
  return (
    <div className="bg-white">
      <p className=" text-lg font-bold">SLA Reports</p>

      <div className="mt-4">
        <div className="relative max-w-sm">
          <Input placeholder="Search Tickets" />
          <div className="absolute right-2 top-2/4 -translate-y-2/3 pb-2">
            <SearchIcon size={18} className="dark:text-white text-black" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-4">
        <CButton className=" w-fit border bg-transparent hover:text-white text-black shadow-none">
          <MdEmail /> Export Email
        </CButton>
        <CButton className=" w-fit border bg-transparent hover:text-white text-black shadow-none">
          <BiExport /> Export as CSV
        </CButton>
        <CButton className=" w-fit border bg-transparent hover:text-white text-black shadow-none">
          <BiExport /> Export as PDF
        </CButton>
      </div>

      <div className="mt-4">
        <EmptyState
          title="No SLA Reports"
          description="SLA Reports will be recorded here!"
        />
      </div>
    </div>
  );
};

export default SlaReports;
