"use client";
import React, { useState, useRef, useEffect } from "react";
import CButton from "../ui/Cbutton";
import Input from "../ui/input";
import { SearchIcon } from "lucide-react";
import { IoFilterOutline } from "react-icons/io5";
import { CellContext } from "@tanstack/react-table";
import clsx from "clsx";
import { Table } from "../ui/table";
import SideModal from "../ui/SideModal";
import ProjectConfiguration from "./ProjectConfiguration";
import DeviceDetail from "./DeviceDetail";

export type Fingerprint = {
  id: string;
  user_identity: string;
  risk: "high" | "medium" | "low";
  location: string;
  sessionDuration: string;
  flags: string;
  deviceScore: "Trusted" | "Verified" | "Suspicious";
  createdAt: string;
};

const FingerprintData: Fingerprint[] = [
  {
    id: "INC52527",
    user_identity: "User reported a bug",
    location: "John Doe",
    risk: "medium",
    deviceScore: "Suspicious",
    sessionDuration: "23m 31s",
    flags: "2 anomalies",
    createdAt: "2025-05-26 09:00:00",
  },
  {
    id: "INC52527",
    user_identity: "User reported a bug",
    location: "John Doe",
    risk: "high",
    deviceScore: "Trusted",
    sessionDuration: "23m 31s",
    flags: "2 anomalies",
    createdAt: "2025-05-26 09:00:00",
  },
  {
    id: "INC52527",
    user_identity: "User reported a bug",
    location: "John Doe",
    risk: "low",
    deviceScore: "Verified",
    sessionDuration: "23m 31s",
    flags: "2 anomalies",
    createdAt: "2025-05-26 09:00:00",
  },
  {
    id: "INC52527",
    user_identity: "User reported a bug",
    location: "John Doe",
    risk: "high",
    deviceScore: "Verified",
    sessionDuration: "23m 31s",
    flags: "2 anomalies",
    createdAt: "2025-05-26 09:00:00",
  },
  {
    id: "INC52527",
    user_identity: "User reported a bug",
    location: "John Doe",
    risk: "high",
    deviceScore: "Verified",
    sessionDuration: "23m 31s",
    flags: "2 anomalies",
    createdAt: "2025-05-26 09:00:00",
  },
  {
    id: "INC52527",
    user_identity: "User reported a bug",
    location: "John Doe",
    risk: "high",
    deviceScore: "Verified",
    sessionDuration: "23m 31s",
    flags: "2 anomalies",
    createdAt: "2025-05-26 09:00:00",
  },
  {
    id: "INC52527",
    user_identity: "User reported a bug",
    location: "John Doe",
    risk: "high",
    deviceScore: "Verified",
    sessionDuration: "23m 31s",
    flags: "2 anomalies",
    createdAt: "2025-05-26 09:00:00",
  },
];

const columns = [
  {
    accessorKey: "id",
    header: () => <span className="font-semibold">Device ID</span>,
    cell: (info: CellContext<Fingerprint, unknown>) => info.getValue(),
  },
  {
    accessorKey: "score",
    header: () => <span className="font-semibold">Score</span>,
    cell: (info: CellContext<Fingerprint, unknown>) => info.getValue(),
  },
  {
    accessorKey: "user_identity",
    header: () => <span className="font-semibold">User Identity</span>,
    cell: (info: CellContext<Fingerprint, unknown>) => info.getValue(),
  },
  {
    accessorKey: "risk",
    header: () => <span className="font-semibold">Risk Score</span>,
    cell: (info: CellContext<Fingerprint, unknown>) => (
      <div className="flex items-center gap-2">
        {riskColors(info.getValue() as string)}
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: () => <span className="font-semibold">Location</span>,
    cell: (info: CellContext<Fingerprint, unknown>) => info.getValue(),
  },

  {
    accessorKey: "sessionDuration",
    header: () => <span className="font-semibold">Session Duration</span>,
    cell: (info: CellContext<Fingerprint, unknown>) => info.getValue(),
  },

  {
    accessorKey: "deviceScore",
    header: () => <span className="font-semibold">Device Score</span>,
    cell: (info: CellContext<Fingerprint, unknown>) => (
      <div className="flex items-center gap-2">
        {deviceScoreColors(info.getValue() as string)}
      </div>
    ),
  },
];

const deviceScoreColors = (deviceScore: string) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          "px-3 py-1 rounded-md capitalize",
          deviceScore.toLowerCase() === "suspicious"
            ? "bg-red-100 text-red-500"
            : deviceScore.toLowerCase() === "trusted"
            ? "bg-green-100 text-green-600"
            : deviceScore.toLowerCase() === "verified"
            ? "bg-yellow-100 text-orange-600"
            : "bg-indigo-100 text-indigo-500"
        )}
      >
        {deviceScore}
      </div>
    </div>
  );
};

const riskColors = (risk: string) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          "px-3 py-1 rounded-md capitalize",
          risk === "high"
            ? "bg-red-100 text-red-600"
            : risk === "medium"
            ? "bg-yellow-100 text-orange-600"
            : "bg-green-100 text-green-600"
        )}
      >
        {risk}
      </div>
    </div>
  );
};

const DeviceIntelligence = () => {
  const [openStatusFilter, setOpenStatusFilter] = useState<boolean>(false);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const [viewConfiguration, setViewConfiguration] = useState(false);
  const [openDeviceDetails, setOpenDeviceDetails] = useState(false);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRowClick = (data: any) => {
    console.log(data);
    setOpenDeviceDetails(true);
  };
  return (
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-semibold text-lg dark:text-white">
            Device Intelligence and Fraud Detection
          </h2>
          <p className="dark:text-white">
            Real time behavioural analytics and device fingerprinting{" "}
          </p>
        </div>
        <div className="flex gap-3">
          <CButton className="border border-colorScBlue hover:text-white bg-transparent text-colorScBlue dark:text-white dark:bg-colorScBlue dark:border-none">
            Refresh
          </CButton>
          <CButton className="border border-colorScBlue hover:text-white bg-transparent text-colorScBlue dark:text-white dark:bg-colorScBlue dark:border-none">
            Export Analytics
          </CButton>
          <CButton
            onClick={() => setViewConfiguration(!viewConfiguration)}
            className="border border-colorScBlue hover:text-white bg-transparent text-colorScBlue dark:text-white dark:bg-colorScBlue dark:border-none"
          >
            View Project Configuration
          </CButton>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5 mt-7">
        <div className="dark:bg-dark bg-white rounded-xl gap-3 dark:shadow-md p-4 w-full h-[163px] flex flex-col items-center justify-center  border-t-4 border-blue-400/60 relative">
          <p className=" text-4xl font-bold text-colorScBlue dark:text-white">
            1,247
          </p>
          <p className="text-colorScBlue dark:text-white">Security Score</p>
        </div>
        <div className="dark:bg-dark bg-white rounded-xl gap-3 dark:shadow-md p-4 w-full h-[163px] flex flex-col items-center justify-center  border-t-4 border-blue-400/60 relative">
          <p className=" text-4xl font-bold text-colorScBlue dark:text-white">
            98.7%
          </p>
          <p className="text-colorScBlue dark:text-white">Detection Accuracy</p>
        </div>
        <div className="dark:bg-dark bg-white rounded-xl gap-3 dark:shadow-md p-4 w-full h-[163px] flex flex-col items-center justify-center  border-t-4 border-blue-400/60 relative">
          <p className=" text-4xl font-bold text-colorScBlue dark:text-white">
            25
          </p>
          <p className="text-colorScBlue dark:text-white">Threats Blocked</p>
        </div>
        <div className="dark:bg-dark bg-white rounded-xl gap-3 dark:shadow-md p-4 w-full h-[163px] flex flex-col items-center justify-center  border-t-4 border-blue-400/60 relative">
          <p className=" text-4xl font-bold text-colorScBlue dark:text-white">
            4.2ms
          </p>
          <p className="text-colorScBlue dark:text-white">Avg Response Time</p>
        </div>
      </div>

      <div className=" bg-white dark:bg-dark p-8 rounded-xl w-full mt-7">
        <p className="text-xl font-bold text-white">
          Device Fingerprint Sessions
        </p>

        <div className="my-4 flex justify-between items-center">
          <div className="relative w-1/2">
            <Input placeholder="Search Tickets" />
            <div className="absolute right-2 top-2/4 -translate-y-2/3 ">
              <SearchIcon size={20} className=" text-black dark:text-white" />
            </div>
          </div>

          <div className="relative " ref={statusFilterRef}>
            <CButton
              onClick={() => setOpenStatusFilter(!openStatusFilter)}
              className="w-fit border-zinc-200 dark:border-zinc-500 hover:text-white border bg-transparent dark:text-white text-black"
            >
              <IoFilterOutline /> Filter
            </CButton>
            {/* click outside to close */}
            {openStatusFilter && (
              <div className="absolute right-2 z-10 w-[130%] mt-1 bg-white border border-gray-300 text-sm rounded-md shadow-lg">
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
        </div>
        <Table
          data={FingerprintData}
          columns={columns}
          onRowClick={handleRowClick}
        />
      </div>

      {viewConfiguration && (
        <SideModal
          isOpen={viewConfiguration}
          onClose={() => setViewConfiguration(false)}
          title="Project Configuration"
        >
          <ProjectConfiguration />
        </SideModal>
      )}

      <DeviceDetail
        isOpen={openDeviceDetails}
        onClose={() => setOpenDeviceDetails(false)}
      />
    </div>
  );
};

export default DeviceIntelligence;
