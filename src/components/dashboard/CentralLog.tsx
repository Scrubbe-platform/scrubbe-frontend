"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Input from "../ui/input";
import { ChevronDown, Search } from "lucide-react";
import { IoFilter } from "react-icons/io5";
import CButton from "../ui/Cbutton";
import { CellContext } from "@tanstack/react-table";
import clsx from "clsx";
import { Table } from "../ui/table";
import SideModal from "../ui/SideModal";
import Modal from "../ui/Modal";
import PlaybookBuilder from "../ezra/playbook/PlaybookBuilder";
import NaturalLanguageRule from "../ezra/RulesInput/NaturalLanguageInputRule";

export type Log = {
  id: string;
  source: string;
  eventType: string;
  severity: "high" | "medium" | "low";
  userId: string;
  ipAddress: number;
  timeStamp: string;
};

// Sample array of logs
const centralLogs: Log[] = [
  {
    id: "1",
    source: "Firewall",
    eventType: "Blocked Connection",
    severity: "high",
    userId: "Alice",
    ipAddress: 3232235777, // 192.168.1.1
    timeStamp: "2024-06-01T10:15:00Z",
  },
  {
    id: "2",
    source: "Web Server",
    eventType: "Login Attempt",
    severity: "medium",
    userId: "Bob",
    ipAddress: 3232235778, // 192.168.1.2
    timeStamp: "2024-06-01T11:00:00Z",
  },
  {
    id: "3",
    source: "Database",
    eventType: "Data Export",
    severity: "low",
    userId: "Charlie",
    ipAddress: 3232235779, // 192.168.1.3
    timeStamp: "2024-06-01T12:30:00Z",
  },
];

const columns = [
  {
    accessorKey: "timeStamp",
    header: () => <span className="font-semibold">Timestamp</span>,
    cell: (info: CellContext<Log, unknown>) => info.getValue(),
  },
  {
    accessorKey: "source",
    header: () => <span className="font-semibold">Source</span>,
    cell: (info: CellContext<Log, unknown>) => info.getValue(),
  },
  {
    accessorKey: "eventType",
    header: () => <span className="font-semibold">Event Type</span>,
    cell: (info: CellContext<Log, unknown>) => info.getValue(),
  },
  {
    accessorKey: "userId",
    header: () => <span className="font-semibold">User</span>,
    cell: (info: CellContext<Log, unknown>) => info.getValue(),
  },
  {
    accessorKey: "ipAddress",
    header: () => <span className="font-semibold">IP Address</span>,
    cell: (info: CellContext<Log, unknown>) => info.getValue(),
  },
  {
    accessorKey: "severity",
    header: () => <span className="font-semibold">Severity</span>,
    cell: (info: CellContext<Log, unknown>) => (
      <div>{priorityColors(info.getValue() as string)}</div>
    ),
  },
];

const priorityColors = (priority: string) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          "px-3 py-1 rounded-md capitalize",
          priority === "high"
            ? "bg-red-100 text-red-500"
            : priority === "medium"
            ? "bg-yellow-100 text-yellow-500"
            : "bg-gray-100 text-gray-500"
        )}
      >
        {priority}
      </div>
    </div>
  );
};

const CentralLog = () => {
  const [openLogDetail, setOpenLogDetail] = useState(false);
  const [openPlaybookBuilder, setOpenPlaybookBuilder] = useState(false);
  const [openNaturalLanguageRule, setOpenNaturalLanguageRule] = useState(false);
  const handleRowClick = (log: Log) => {
    console.log(log);
    setOpenLogDetail(true);
  };
  return (
    <div className="p-6">
      <div className="text-2xl font-bold dark:text-white text-black">
        Centralized Log Management{" "}
      </div>
      <div className="mt-5 dark:bg-dark bg-white p-6  space-y-5 h-full rounded-xl">
        <div className="flex justify-between">
          <div className="relative min-w-[300px]">
            <Input placeholder="Search Tickets" />
            <div className="absolute top-3 right-2">
              <Search className=" dark:text-white" size={20} />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <CButton className="w-fit !bg-transparent flex gap-2 text-sm items-center border border-gray-200 dark:border-gray-700 rounded-md px-3 p-2 text-black/70 hover:text-black dark:text-white/70 hover:dark:text-white cursor-pointer">
              <IoFilter size={16} />
              <p>Last 24 hours</p>
              <ChevronDown />
            </CButton>
            <CButton className="w-fit !bg-transparent flex gap-2 text-sm items-center border border-gray-200 dark:border-gray-700 rounded-md px-2 p-2 text-black/70 hover:text-black dark:text-white/70 hover:dark:text-white cursor-pointer">
              <IoFilter size={16} />
              <p>All Severity</p>
              <ChevronDown />
            </CButton>

            <CButton className=" w-fit">Export</CButton>
            <CButton className=" w-fit">Ezra</CButton>
          </div>
        </div>
        <p className=" font-medium text-lg dark:text-white">
          Ezra Query Results
        </p>
        <Table
          data={centralLogs}
          columns={columns}
          onRowClick={handleRowClick}
        />
      </div>

      {openLogDetail && (
        <SideModal
          isOpen={openLogDetail}
          onClose={() => setOpenLogDetail(false)}
          title="Log Details"
        >
          <div className=" space-y-4">
            <p className="dark:text-white">
              user.login for user123 from 192.168.1.1(Status : medium){" "}
            </p>
            <div className=" dark:text-white">
              <h2 className=" font-medium text-lg">Parsed Log</h2>
              <p>event type : user login</p>
              <p>User ID : User 123</p>
              <p>IP address : 192.638.1.1</p>
              <p>Status : Medium</p>
            </div>

            <div>
              <h2 className=" font-medium text-lg dark:text-white">
                JSON Payload
              </h2>
              <pre className="bg-black text-green-400 rounded p-4 text-xs overflow-x-auto max-h-100 mt-2">
                {`{
“host”: “db.example.com”,
“port”: 5432,
“username”: “scrubbe_user”,
“password”: “*****”
“database”: “enterprise_logs”,
“table”: “fraud_alerts”,
“schema”: “public”
}`}
              </pre>
            </div>

            <div className=" dark:text-white">
              <h2 className=" font-medium text-lg">Ezra Insights</h2>
              <ul className=" list-disc pl-5">
                <li>
                  Potential brute force attack detected on IP
                  192.168.1.1 (Severity: High, Action: Block IP)
                </li>
                <li>
                  Unusual login activity from user123 (Severity: Medium,
                  Action: Monitor user)
                </li>
                <li>
                  No anomalies detected in PostgreSQL logs (Severity: Low,
                  Action: No action required
                </li>
              </ul>
            </div>
            <div className=" dark:text-white">
              <h2 className=" font-medium text-lg">
                AI Powered Next Step Suggestion
              </h2>
              <ul className=" list-disc pl-5">
                <li>
                  Let Ezra suggest: 
                  <span
                    onClick={() => setOpenPlaybookBuilder(true)}
                    className=" text-colorScBlue cursor-pointer"
                  >
                    Create a playbook from this rule
                  </span>
                </li>
                <li>
                  Let Ezra suggest: 
                  <span onClick={() => {}} className=" text-colorScBlue">
                    Escalate this session to incident queue?
                  </span>
                </li>
                <li>
                  Let Ezra suggest: 
                  <span
                    onClick={() => setOpenNaturalLanguageRule(true)}
                    className=" text-colorScBlue"
                  >
                    Add this pattern to NLRI library
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </SideModal>
      )}

      <Modal
        isOpen={openPlaybookBuilder}
        onClose={() => setOpenPlaybookBuilder(false)}
      >
        <PlaybookBuilder />
      </Modal>

      <Modal
        isOpen={openNaturalLanguageRule}
        onClose={() => setOpenNaturalLanguageRule(false)}
      >
        <NaturalLanguageRule />
      </Modal>
    </div>
  );
};

export default CentralLog;
