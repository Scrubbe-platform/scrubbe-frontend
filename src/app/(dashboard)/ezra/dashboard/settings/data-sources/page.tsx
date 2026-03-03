"use client";
import React, { useState } from "react";
import Switch from "@/components/ui/Switch";
import Select from "@/components/ui/select";
import { IoIosLock } from "react-icons/io";
import { FaBolt } from "react-icons/fa";

const Page = () => {
  const [networkTraffic, setNetworkTraffic] = useState(true);
  const [systemLogs, setSystemLogs] = useState(true);
  const [vulnDb, setVulnDb] = useState(true);
  const [scanFrequency, setScanFrequency] = useState("Every 15 minutes");
  const [deepScan, setDeepScan] = useState(false);

  return (
    <div className="mx-auto space-y-8">
      {/* Data Sources Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Data Sources
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Network Traffic Analysis */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white ">
                Network Traffic Analysis
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300 flex items-center gap-2">
                Monitor and analyze network traffic patterns
                <span className="ml-2 px-2 py-0.5 text-xs rounded-md bg-green-100 text-green-700 border border-green-300 flex items-center gap-1">
                  <IoIosLock size={16} />
                  Secure
                </span>
              </div>
            </div>
            <Switch checked={networkTraffic} onChange={setNetworkTraffic} />
          </div>
          {/* System logs */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">System logs</div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Access to system and application logs
              </div>
            </div>
            <Switch checked={systemLogs} onChange={setSystemLogs} />
          </div>
          {/* Vulnerability Databases */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Vulnerability Databases
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Connect to CVE and threat Intelligence Funds
              </div>
            </div>
            <Switch checked={vulnDb} onChange={setVulnDb} />
          </div>
        </div>
      </div>
      {/* Scan Configuration Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Scan Configuration
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Scan Frequency */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">Scan Frequency</div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                How often Ezra performs security Scans
              </div>
            </div>
            <Select
              options={[
                { value: "Continuous", label: "Continuous" },
                { value: "Every 15 minutes", label: "Every 15 minutes" },
                { value: "Hourly", label: "Hourly" },
                { value: "Daily", label: "Daily" },
              ]}
              value={scanFrequency}
              onChange={(e) => setScanFrequency(e.target.value)}
              className="!w-48 border !border-blue-500 text-blue-600"
            />
          </div>
          {/* Deep Scan Mode */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white ">Deep Scan Mode</div>
              <div className="text-gray-500 text-sm dark:text-gray-300 flex items-center gap-2">
                Enable comprehensive security analysis
                <span className="ml-2 px-2 py-0.5 text-xs rounded-md bg-yellow-100 text-yellow-700 border border-yellow-300 flex items-center gap-1">
                  <FaBolt size={16} />
                  High CPU
                </span>
              </div>
            </div>
            <Switch checked={deepScan} onChange={setDeepScan} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
