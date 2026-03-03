"use client";
import React, { useState } from "react";
import Switch from "@/components/ui/Switch";
import Select from "@/components/ui/select";
import { IoIosLock } from "react-icons/io";

const Page = () => {
  const [encryption, setEncryption] = useState(true);
  const [retention, setRetention] = useState("90 days");
  const [auditLogging, setAuditLogging] = useState(true);
  const [mfa, setMfa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30 minutes");

  return (
    <div className="mx-auto space-y-8">
      {/* Data Protection Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Data Protection
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Data Encryption */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">Data Encryption</div>
              <div className="text-gray-500 text-sm dark:text-gray-300 flex items-center gap-2">
                Encrypt all data processed by Ezra
                <span className="ml-2 px-2 py-0.5 text-xs rounded-md bg-green-100 text-green-700 border border-green-300 flex items-center gap-1">
                  <IoIosLock size={16} /> AES-256
                </span>
              </div>
            </div>
            <Switch checked={encryption} onChange={setEncryption} />
          </div>
          {/* Data Retention Period */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white   cursor-pointer">
                Data Retention Period
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                How long to retain analysis data
              </div>
            </div>
            <Select
              options={[
                { value: "7 days", label: "7 days" },
                { value: "30 days", label: "30 days" },
                { value: "90 days", label: "90 days" },
                { value: "1 year", label: "1 year" },
              ]}
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
              className="!w-32 border !border-blue-500 text-blue-600"
            />
          </div>
          {/* Audit Logging */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">Audit Logging</div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Log all Ezra activities for compliance
              </div>
            </div>
            <Switch checked={auditLogging} onChange={setAuditLogging} />
          </div>
        </div>
      </div>
      {/* Access Control Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Access Control
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Multi-Factor Authentication */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Multi-Factor Authentication
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Require MFA for sensitive operations
              </div>
            </div>
            <Switch checked={mfa} onChange={setMfa} />
          </div>
          {/* Session Timeout */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">Session Timeout</div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Auto-log out after inactivity
              </div>
            </div>
            <Select
              options={[
                { value: "15 minutes", label: "15 minutes" },
                { value: "30 minutes", label: "30 minutes" },
                { value: "1 hour", label: "1 hour" },
                { value: "4 hours", label: "4 hours" },
              ]}
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="!w-32 border !border-blue-500 text-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
