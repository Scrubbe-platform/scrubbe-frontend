import { Table } from "@/components/ui/table";
import { CellContext } from "@tanstack/react-table";
import React from "react";

export type Project = {
  id: string;
  projectName: string;
  environment: string;
  module: string[];
  lastSeen: string;
};

const activeProject: Project[] = [
  {
    id: "1234667",
    environment: "Production",
    projectName: "Customer Portal",
    module: ["Device Fingerprint", "Location Tracker"],
    lastSeen: "30s ago",
  },
];

const columns = [
  {
    accessorKey: "id",
    header: () => <span className="font-semibold">Project ID</span>,
    cell: (info: CellContext<Project, unknown>) => `#${info.getValue()}`,
  },
  {
    accessorKey: "projectName",
    header: () => <span className="font-semibold">Project</span>,
    cell: (info: CellContext<Project, unknown>) => `${info.getValue()}`,
  },
  {
    accessorKey: "environment",
    header: () => <span className="font-semibold">Environment</span>,
    cell: (info: CellContext<Project, unknown>) => `${info.getValue()}`,
  },
  {
    accessorKey: "module",
    header: () => <span className="font-semibold">Modules Detected</span>,
    cell: (info: CellContext<Project, unknown>) =>
      (info.getValue() as string[]).map((module) => (
        <p key={module}>{module}</p>
      )),
  },
  {
    accessorKey: "lastSeen",
    header: () => <span className="font-semibold">Last Seen</span>,
    cell: (info: CellContext<Project, unknown>) => `${info.getValue()}`,
  },
];
const ActiveProject = () => {
  return (
    <div className="mt-4 p-4">
      <p className=" font-medium mb-2">Active Projects</p>

      <Table
        data={activeProject}
        columns={columns}
        //   onRowClick={handleRowClick}
      />
    </div>
  );
};

export default ActiveProject;
