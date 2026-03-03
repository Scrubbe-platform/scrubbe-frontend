"use client";
import React, { useState } from "react";
import Switch from "@/components/ui/Switch";
import Select from "@/components/ui/select";

const Page = () => {
  const [threatFeed, setThreatFeed] = useState("Premium Feeds");
  const [cloudApi, setCloudApi] = useState(true);

  return (
    <div className="mx-auto space-y-8">
      {/* Security Tools Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Security Tools
        </h2>
        <div className="divide-y divide-gray-200">
          {/* SIEM Integration */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                SIEM Integration
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Connect to your SIEM platform
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-2 rounded-lg text-base font-medium transition">
              Configure
            </button>
          </div>
          {/* Vulnerability Scanner */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Vulnerability Scanner
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Integrate with vulnerability scanning tools
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-2 rounded-lg text-base font-medium transition">
              Connect
            </button>
          </div>
          {/* Firewall Management */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Firewall Management
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Interface with firewall systems
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-2 rounded-lg text-base font-medium transition">
              Setup
            </button>
          </div>
        </div>
      </div>
      {/* External Services Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          External Services
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Threat Intelligence Feeds */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Threat Intelligence Feeds
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Connect to external threat intelligence sources
              </div>
            </div>
            <Select
              options={[
                { value: "Standard Feeds", label: "Standard Feeds" },
                { value: "Premium Feeds", label: "Premium Feeds" },
                { value: "Custom Feeds", label: "Custom Feeds" },
              ]}
              value={threatFeed}
              onChange={(e) => setThreatFeed(e.target.value)}
              className="!w-44 border !border-blue-500 text-blue-600"
            />
          </div>
          {/* Cloud Security APIs */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Cloud Security APIs
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Send notifications to Slack channels
              </div>
            </div>
            <Switch checked={cloudApi} onChange={setCloudApi} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
