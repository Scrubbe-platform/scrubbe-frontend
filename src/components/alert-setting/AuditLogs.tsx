"use client";
import React, { useState } from "react";
import { Table } from "../ui/table";
import { ChevronDown, Filter } from "lucide-react";
import { CellContext } from "@tanstack/react-table";
import Pagination from "./Pagination";

interface AuditLog {
  timestamp: string;
  user: string;
  action: string;
}

const auditData: AuditLog[] = [
  {
    timestamp: "2025-05-26 09:00:00",
    user: "Admin 1",
    action: "Updated Slack parameters",
  },
  {
    timestamp: "2025-05-26 09:00:00",
    user: "Admin 2",
    action: "Enabled SMS notifications",
  },
  {
    timestamp: "2025-05-26 09:00:00",
    user: "Admin 1",
    action: "Tested Email notification",
  },
  {
    timestamp: "2025-05-26 09:00:00",
    user: "Admin 2",
    action: "Reset settings to defaults",
  },
  {
    timestamp: "2025-05-26 09:00:00",
    user: "Admin 2",
    action: "Updated Teams parameters",
  },
];

const columns = [
  {
    accessorKey: "timestamp",
    header: () => <span className="font-semibold">Time Stamp</span>,
    cell: (info: CellContext<AuditLog, unknown>) => info.getValue(),
  },
  {
    accessorKey: "user",
    header: () => <span className="font-semibold">User</span>,
    cell: (info: CellContext<AuditLog, unknown>) => info.getValue(),
  },
  {
    accessorKey: "action",
    header: () => <span className="font-semibold">Action</span>,
    cell: (info: CellContext<AuditLog, unknown>) => info.getValue(),
  },
];

const AuditLogs = () => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 12;
  const totalRows = 40;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  return (
    <div className=" min-h-screen bg-neutral">
      <div className="px-4 sm:px-6 lg:px-8 pt-6 w-full max-w-[1440px] mx-auto">
        <div className="flex flex-col h-full   p-4 sm:p-6 lg:p-8 bg-white rounded-xl">
          <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 border border-zinc-200 rounded-lg px-4 py-2 text-zinc-600 bg-white text-base font-medium shadow-sm">
                <Filter size={18} />
                Filter by date
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg">
            <Table
              data={auditData}
              columns={columns}
              className="min-w-[700px]"
              headerClassName="bg-blue-100 text-base"
              rowClassName="text-base"
              cellClassName="text-base"
            />
          </div>
          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Rows per page</span>
              <select className="border border-zinc-300 rounded px-2 py-1 text-sm">
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
