/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import Modal from "@/components/ui/Modal";
import { EzraChatWidget } from "@/components/ezra/EzraChatWidget";
import CreateIncident from "@/components/IncidentTicket/CreateIncident";
import CButton from "@/components/ui/Cbutton";
import UsefulIpTrafficChart from "./UsefulIpTrafficChart";

const refreshOptions = [
  {
    value: "off",
    label: "Off",
  },
  {
    value: "auto",
    label: "Auto",
  },
  {
    value: "5s",
    label: "5s",
  },
  {
    value: "10s",
    label: "10s",
  },
  {
    value: "30s",
    label: "30s",
  },
  {
    value: "1m",
    label: "1m",
  },
  {
    value: "5m",
    label: "5m",
  },
  {
    value: "15m",
    label: "15m",
  },
  {
    value: "30m",
    label: "30m",
  },
  {
    value: "1h",
    label: "1h",
  },
  {
    value: "2h",
    label: "2h",
  },
  {
    value: "30s",
    label: "30s",
  },
];

const UsefulIpTrafficDetails = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [askEzra, setAskEzra] = useState(false);
  const [openCreateIncident, setOpenCreateIncident] = useState(false);
  const [openExportOption, setOpenExportOption] = useState(false);
  const [openTimeFilter, setOpenTimeFilter] = useState(false);

  useEffect(() => {
    if (!openMenu && !openExportOption && !openTimeFilter) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
        setOpenExportOption(false);
        setOpenTimeFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu, openExportOption, openTimeFilter]);

  return (
    <div>
      <div className=" mx-auto  rounded-lg ">
        {/* Top Header Section */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search for a user by ID, Email or Fingerprint"
            className=" max-w-2xl w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                         bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600
                         text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
          />
        </div>
        {/* Main Chart Section */}
        <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg shadow-inner mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Network Traffic Volume (Mbps) by IP Address Over Time
            </h2>
            <div className="flex space-x-2">
              <div
                onClick={() => setOpenTimeFilter(true)}
                className="px-3 py-1 relative flex gap-1 cursor-pointer items-center rounded-md border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm"
              >
                <Clock size={15} /> Filter by time <ChevronDown size={17} />
                {openTimeFilter && (
                  <div
                    ref={menuRef}
                    className=" min-w-[200px] border z-50 border-gray-200 p-5 absolute   h-fit bg-white rounded-md top-full right-0 transform  mt-1"
                  >
                    <p className=" text-black mb-2 font-medium">
                      Absolute Time Range
                    </p>

                    <label className=" text-black flex flex-col mb-4">
                      From
                      <input
                        type="datetime-local"
                        name=""
                        className="bg-transparent border border-zinc-300 p-2 rounded-md outline-none"
                        id=""
                      />
                    </label>
                    <label className=" text-black flex flex-col mb-4">
                      To
                      <input
                        type="datetime-local"
                        name=""
                        className="bg-transparent border border-zinc-300 p-2 rounded-md outline-none"
                        id=""
                      />
                    </label>

                    <CButton>Apply Time Range</CButton>
                  </div>
                )}
              </div>
              <div className="px-3 py-1 rounded-md border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm">
                <select className="w-full bg-transparent h-full outline-none">
                  <option>Refresh</option>
                  {refreshOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                onClick={() => setOpenExportOption((prev) => !prev)}
                className="px-3 py-1 relative flex items-center cursor-pointer rounded-md border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm"
              >
                Export <ChevronDown size={17} />
                {openExportOption && (
                  <div
                    ref={menuRef}
                    className=" min-w-[200px] border z-50 border-gray-200 p-2 absolute   h-fit bg-white rounded-md top-full right-0 transform  mt-1"
                  >
                    <div className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors">
                      Export as PDF
                    </div>
                    <div
                      onClick={() => setAskEzra(true)}
                      className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors"
                    >
                      Export as JSON
                    </div>
                  </div>
                )}
              </div>

              <div
                onClick={() => setOpenMenu((prev) => !prev)}
                className=" size-10 relative rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
              >
                <BsThreeDotsVertical />

                {openMenu && (
                  <div
                    ref={menuRef}
                    className=" min-w-[200px] border z-50 border-gray-200 p-2 absolute   h-fit bg-white rounded-md top-full right-0 transform  mt-1"
                  >
                    <div className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors">
                      View Log
                    </div>
                    <div
                      onClick={() => setAskEzra(true)}
                      className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors"
                    >
                      Ask Ezra
                    </div>
                    <div
                      onClick={() => {
                        setOpenCreateIncident(true);
                      }}
                      className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors"
                    >
                      Create an Incident Ticket
                    </div>
                    <div className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors">
                      Send Alert
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="relative h-80">
            <UsefulIpTrafficChart />
          </div>
          <div className="flex justify-start space-x-4 mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
            <a href="#" className="hover:underline">
              View Graph Information
            </a>
            <a href="#" className="hover:underline">
              View Log
            </a>
          </div>
        </div>

        {/* Multiple Failed Login Information Section */}
        <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Network Traffic Volume (Mbps) by IP Address Over Time
            </h2>
            <div className="flex space-x-2">
              <button className="px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                Graph Information
              </button>
              <button className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                Log
              </button>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm">
            Detects unexpected surges or changes in endpoint access
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm">
            <span className="font-semibold">Use Cases:</span> Flag scraping,
            probing, or automation. Detect abuse of admin or financial
            endpoints.
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            <span className="font-semibold">Benefits:</span> Prevents API abuse
            or DoS attempts. Optimizes alerting to avoid alert fatigue.
          </p>
        </div>
      </div>

      <Modal isOpen={askEzra} onClose={() => setAskEzra(false)}>
        <EzraChatWidget />
      </Modal>
      <CreateIncident
        isModal={true}
        isOpen={openCreateIncident}
        onClose={() => setOpenCreateIncident(false)}
      />
    </div>
  );
};

export default UsefulIpTrafficDetails;
