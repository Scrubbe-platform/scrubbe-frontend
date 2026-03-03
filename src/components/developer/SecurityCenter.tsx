"use client";
import React, { useState } from "react";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";
import Select from "../ui/select";
import Modal from "../ui/Modal";
import { CellContext } from "@tanstack/react-table";
import { Table } from "../ui/table";
interface StatusIndicatorProps {
  status: "Active" | "Due" | "Enabled" | "Disabled";
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  let bgColor = "";
  let textColor = "";

  switch (status) {
    case "Active":
      bgColor = "bg-green-100 dark:bg-green-800";
      textColor = "text-green-800 dark:text-green-200";
      break;
    case "Due":
      bgColor = "bg-yellow-100 dark:bg-yellow-800";
      textColor = "text-yellow-800 dark:text-yellow-200";
      break;
    case "Enabled":
      bgColor = "bg-blue-100 dark:bg-blue-800";
      textColor = "text-blue-800 dark:text-blue-200";
      break;
    case "Disabled":
      bgColor = "bg-red-100 dark:bg-red-800";
      textColor = "text-red-800 dark:text-red-200";
      break;
    default:
      bgColor = "bg-gray-100 dark:bg-gray-700";
      textColor = "text-gray-800 dark:text-gray-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {status}
    </span>
  );
};

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  id,
}) => {
  return (
    <div className="flex items-center justify-between py-2">
      <label
        htmlFor={id}
        className="text-gray-700 dark:text-gray-300 text-sm font-medium cursor-pointer"
      >
        {label}
      </label>
      <input
        type="checkbox"
        id={id}
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
        }`}
      >
        <span className="sr-only">Use setting</span>
        <span
          className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        >
          <span
            className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
              checked
                ? "opacity-0 duration-100 ease-out"
                : "opacity-100 duration-200 ease-in"
            }`}
            aria-hidden="true"
          >
            {/* Off state icon */}
          </span>
          <span
            className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
              checked
                ? "opacity-100 duration-200 ease-in"
                : "opacity-0 duration-100 ease-out"
            }`}
            aria-hidden="true"
          >
            {/* On state icon */}
          </span>
        </span>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-dark shadow rounded-lg p-6 mb-6 min-h-[300px]">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        {title}
      </h2>
      {children}
    </div>
  );
};

interface IRateLimit {
  timestamp: string;
  limitType: string;
  ip: string;
  request: string;
  action: string;
}

const rateLimitViolation: IRateLimit[] = [
  {
    timestamp: "2024-01-15 10:30:15",
    limitType: "Per Minute",
    ip: "192.168.1.100",
    request: "1,250/1,000",
    action: "Block",
  },
  {
    timestamp: "2024-01-15 10:30:15",
    limitType: "Per Minute",
    ip: "192.168.1.100",
    request: "1,250/1,000",
    action: "Block",
  },
  {
    timestamp: "2024-01-15 10:30:15",
    limitType: "Per Minute",
    ip: "192.168.1.100",
    request: "1,250/1,000",
    action: "Block",
  },
  {
    timestamp: "2024-01-15 10:30:15",
    limitType: "Per Minute",
    ip: "192.168.1.100",
    request: "1,250/1,000",
    action: "Block",
  },
  {
    timestamp: "2024-01-15 10:30:15",
    limitType: "Per Minute",
    ip: "192.168.1.100",
    request: "1,250/1,000",
    action: "Block",
  },
];

const columns = [
  {
    accessorKey: "timestamp",
    header: () => <span className="font-semibold">Timestamp</span>,
    cell: (info: CellContext<IRateLimit, unknown>) => info.getValue(),
  },
  {
    accessorKey: "ip",
    header: () => <span className="font-semibold">IP Address</span>,
    cell: (info: CellContext<IRateLimit, unknown>) => info.getValue(),
  },
  {
    accessorKey: "limitType",
    header: () => <span className="font-semibold">Event</span>,
    cell: (info: CellContext<IRateLimit, unknown>) => info.getValue(),
  },
  {
    accessorKey: "requests",
    header: () => <span className="font-semibold">Requests</span>,
    cell: (info: CellContext<IRateLimit, unknown>) => info.getValue(),
  },

  {
    accessorKey: "action",
    header: () => <span className="font-semibold">Action</span>,
    cell: () => (
      <button className="text-blue-600 border border-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900 transition">
        View
      </button>
    ),
  },
];

const SecurityCenter: React.FC = () => {
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [apiKeyRotation, setApiKeyRotation] = useState(false);
  const [loginNotification, setLoginNotification] = useState(true);
  const [openRateLimitViolation, setOpenRateLimitViolation] = useState(false);
  const [openSecurityScan, setOpenSecurityScan] = useState(false);
  const [openManageIPWhiteList, setOpenManageIPWhiteList] = useState(false);
  const [openThreatDetails, setOpenThreatDetails] = useState(false);

  //   Manage IP Whitelist
  const [currentWhitelist, setCurrentWhitelist] = useState([
    "192.168.1.100",
    "10.0.0.0/24",
    "203.0.113.0/24",
  ]);
  const [newIpRange, setNewIpRange] = useState("");
  const [description, setDescription] = useState("");
  const handleRemoveIp = (ipToRemove: string) => {
    setCurrentWhitelist(currentWhitelist.filter((ip) => ip !== ipToRemove));
  };

  const handleAddIp = () => {
    if (newIpRange && !currentWhitelist.includes(newIpRange)) {
      setCurrentWhitelist([...currentWhitelist, newIpRange]);
      setNewIpRange("");
      setDescription(""); // Clear description after adding
    }
  };

  const handleClearAll = () => {
    setCurrentWhitelist([]);
  };

  return (
    <div className=" py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Security Dashboard
          </h1>
        </div>

        {/* Security Limiting Configuration */}
        <Card title="Rate Limiting Configuration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Select
                label="Requests Per Minute"
                id="requests-per-minute"
                options={[{ value: "1000", label: "1000" }]}
                defaultValue="1000"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Current: 856/1000 (85.6%)
              </p>

              <Select
                label="Requests Per Hour"
                id="requests-per-hour"
                options={[{ value: "10000", label: "10000" }]}
                defaultValue="10000"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Current: 2,847/10,000 (28.4%)
              </p>

              <Input
                label="Requests Per Day"
                id="requests-per-day"
                type="number"
                defaultValue="500000"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Current: 122,234/500,000 (25.4%)
              </p>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Rate Limit Headers
                </h3>
                <div className="flex items-center mb-2">
                  <input
                    id="include-limit-headers"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    defaultChecked
                  />
                  <label
                    htmlFor="include-limit-headers"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Include rate limit headers
                  </label>
                </div>
                <div className="flex items-center mb-2">
                  <input
                    id="include-retry-after"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="include-retry-after"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Include retry-after header
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="include-reset-timestamp"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="include-reset-timestamp"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Include reset timestamp
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Select
                label="Rate Limit Response"
                id="rate-limit-response"
                options={[
                  {
                    value: "HTTP 429-Too Many Requests",
                    label: "HTTP 429-Too Many Requests",
                  },
                ]}
                defaultValue="HTTP 429-Too Many Requests"
              />
              <Input
                label="Burst Allowance"
                id="burst-allowance"
                type="number"
                defaultValue="150"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Additional request allowed in burst
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <CButton className=" w-fit">Update Limit</CButton>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rate Limit Violations */}
          <Card title="Rate Limit Violations">
            <div className="text-center mb-6">
              <p className="text-5xl font-bold text-red-600 dark:text-red-400">
                23
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Violations Today
              </p>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Per Minute</span>
                <span>12</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Per Hour</span>
                <span>8</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Per Day</span>
                <span>3</span>
              </div>
            </div>
            <CButton
              className="w-full"
              onClick={() => setOpenRateLimitViolation(true)}
            >
              View Violation Log
            </CButton>
          </Card>

          {/* Security Status */}
          <Card title="Security Status">
            <div className="flex flex-col justify-evenly h-full">
              <div className="space-y-4 ">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    SSL Certificate
                  </span>
                  <StatusIndicator status="Active" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    API Key Rotation
                  </span>
                  <StatusIndicator status="Due" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    Rate Limiting
                  </span>
                  <StatusIndicator status="Enabled" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    IP Whitelisting
                  </span>
                  <StatusIndicator status="Disabled" />
                </div>
              </div>
              <CButton
                className="w-full"
                onClick={() => setOpenSecurityScan(true)}
              >
                Security Scan
              </CButton>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* IP Whitelisting */}
          <Card title="IP Whitelisting">
            <Input
              label="Add IP Addresses"
              id="add-ip"
              type="text"
              placeholder="192.168.1.100"
            />
            <CButton className="w-full mb-6">Add IP</CButton>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Whitelist
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>192.168.1.100</li>
                <li>10.0.0.0/24</li>
                <li>203.0.113.0/24</li>
              </ul>
            </div>
            <CButton
              className="w-full"
              onClick={() => setOpenManageIPWhiteList(true)}
            >
              Manage Whitelist
            </CButton>
          </Card>

          {/* Threat Detection */}
          <Card title="Threat Detection">
            <div className="flex flex-col justify-evenly">
              <div className="text-center mb-6">
                <p className="text-5xl font-bold text-green-600 dark:text-green-400">
                  0
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Active Threats
                </p>
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Block IPs</span>
                  <span>3</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Suspicious Request</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Failed Authentications</span>
                  <span>5</span>
                </div>
              </div>
              <CButton
                className="w-full"
                onClick={() => setOpenThreatDetails(true)}
              >
                View Threat Details
              </CButton>
            </div>
          </Card>
        </div>

        {/* Security Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Security Settings">
            <ToggleSwitch
              id="two-factor-auth"
              label="Two-Factor Authentication"
              checked={twoFactorAuth}
              onChange={setTwoFactorAuth}
            />
            <ToggleSwitch
              id="api-key-rotation"
              label="API Key Rotation"
              checked={apiKeyRotation}
              onChange={setApiKeyRotation}
            />
            <ToggleSwitch
              id="login-notification"
              label="Login Notification"
              checked={loginNotification}
              onChange={setLoginNotification}
            />
            <div className="mt-6">
              <CButton className="w-full">Save Settings</CButton>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={openRateLimitViolation}
        onClose={() => setOpenRateLimitViolation(false)}
      >
        <h2 className="text-2xl font-semibold mb-6 dark:text-white">
          Rate Limit Violation
        </h2>
        <Table columns={columns} data={rateLimitViolation} />

        <div className="flex justify-end gap-4 mt-5">
          <CButton
            onClick={() => setOpenRateLimitViolation(false)}
            className="w-fit bg-transparent border border-colorScBlue text-colorScBlue hover:text-white"
          >
            Cancel
          </CButton>
          <CButton className="w-fit bg-transparent border border-colorScBlue text-colorScBlue hover:text-white">
            Block IP Address
          </CButton>
          <CButton className="w-fit">Export logs</CButton>
        </div>
      </Modal>

      <Modal
        isOpen={openSecurityScan}
        onClose={() => setOpenSecurityScan(false)}
      >
        <div className=" flex items-center justify-center transition-colors duration-300">
          <div className="w-full rounded-lg">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Security Scan Results
            </h1>

            {/* Scan Complete Status */}
            <div className="flex items-center text-green-600 dark:text-green-400 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-lg font-semibold">
                Security Scan Complete
              </span>
            </div>

            {/* All Systems Secure Message */}
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-md mb-6">
              <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
                All Systems are secure
              </p>
              <ul className="list-disc list-inside text-green-700 dark:text-green-300 space-y-1 text-sm">
                <li>SSL Certificates are valid</li>
                <li>No suspicious activity detected</li>
                <li>API keys secure</li>
                <li>Rate limiting active</li>
              </ul>
            </div>

            {/* Last Scan Information */}
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
              Last Scan : 7/23/2025, 9:23:49 AM
            </p>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <CButton
                className="w-fit bg-transparent border border-colorScBlue text-colorScBlue hover:text-white"
                onClick={() => setOpenSecurityScan(false)}
              >
                Cancel
              </CButton>
              <CButton
                className="w-fit"
                onClick={() => console.log("View Full Reports")}
              >
                View Full Reports
              </CButton>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={openManageIPWhiteList}
        onClose={() => setOpenManageIPWhiteList(false)}
      >
        <div className="flex items-center justify-center transition-colors duration-300">
          <div className=" w-full rounded-lg">
            {/* Close Button (top right) - using a simple X icon or component */}

            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Manage IP Whitelist
            </h1>

            {/* Current Whitelist Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Current Whitelist
              </h2>
              <div className="space-y-3  border border-gray-200 dark:border-gray-700  rounded-md">
                {currentWhitelist.length > 0 ? (
                  currentWhitelist.map((ip) => (
                    <div
                      key={ip}
                      className="flex items-center justify-between p-3 rounded-md border-b border-gray-200 dark:border-gray-700 "
                    >
                      <span className="text-gray-800 dark:text-gray-200">
                        {ip}
                      </span>
                      <CButton
                        className=" w-fit bg-zinc-200 border border-zinc-500 text-black hover:bg-rose-500 hover:text-white"
                        onClick={() => handleRemoveIp(ip)}
                      >
                        Remove
                      </CButton>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No IPs in whitelist.
                  </p>
                )}
              </div>
            </div>

            {/* Add New IP/Range Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Add New IP/Range
              </h2>
              <Input
                id="new-ip-range"
                placeholder="192.168.1.100"
                value={newIpRange}
                onChange={(e) => setNewIpRange(e.target.value)}
              />
            </div>

            {/* Description Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Description (Optional)
              </h2>
              <Input
                id="description"
                placeholder="Office Network"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <CButton
                className="w-fit bg-transparent border border-colorScBlue text-colorScBlue hover:text-white"
                onClick={() => setOpenManageIPWhiteList(false)}
              >
                Cancel
              </CButton>
              <CButton
                className="w-fit bg-transparent border border-colorScBlue text-colorScBlue hover:text-white"
                onClick={handleClearAll}
              >
                Clear all
              </CButton>
              <CButton className="w-fit" onClick={handleAddIp}>
                Add IP
              </CButton>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        onClose={() => setOpenThreatDetails(false)}
        isOpen={openThreatDetails}
      >
        <ThreatDetectionDetails onClose={() => setOpenThreatDetails(false)} />
      </Modal>
    </div>
  );
};

export default SecurityCenter;

interface ThreatDetailProps {
  type: string;
  ip: string;
  issue: string;
  action: string;
  timeAgo: string;
}

const ThreatItem: React.FC<ThreatDetailProps> = ({
  type,
  ip,
  issue,
  action,
  timeAgo,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-l-4 border-red-500 rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-500 mr-2 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {type}
          </h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {timeAgo}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm mb-1">
        <span className="font-medium">IP:</span> {ip}
      </p>
      <p className="text-gray-700 dark:text-gray-300 text-sm mb-1">
        <span className="font-medium">
          {type === "Suspicious Login Attempts"
            ? "Attempts:"
            : type === "Unusual API Pattern"
            ? "Pattern:"
            : "Issue:"}
        </span>{" "}
        {issue}
      </p>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        <span className="font-medium">Action:</span> {action}
      </p>
    </div>
  );
};

type Props = {
  onClose: () => void;
};
const ThreatDetectionDetails = ({ onClose }: Props) => {
  const threats = [
    {
      type: "Suspicious Login Attempts",
      ip: "45.123.67.89",
      issue: "15 failed logins in 5 minutes",
      action: "IP temporarily blocked",
      timeAgo: "2 hours ago",
    },
    {
      type: "Unusual API Pattern",
      ip: "198.51.100.45",
      issue: "Rapid sequential requests",
      action: "Rate limited",
      timeAgo: "2 hours ago",
    },
    {
      type: "Malformed Requests",
      ip: "203.0.113.22",
      issue: "Invalid JSON payloads",
      action: "Requests blocked",
      timeAgo: "2 hours ago",
    },
  ];

  return (
    <div className="flex items-center justify-center p-4 transition-colors duration-300">
      <div className=" w-full">
        {/* Close Button (top right) - using a simple X icon or component */}

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Threat Detection Details
        </h1>

        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Recent Threats
        </h2>

        {/* List of Threat Items */}
        <div>
          {threats.map((threat, index) => (
            <ThreatItem
              key={index}
              type={threat.type}
              ip={threat.ip}
              issue={threat.issue}
              action={threat.action}
              timeAgo={threat.timeAgo}
            />
          ))}
        </div>

        {/* Last updated information */}
        <p className="text-right text-gray-500 dark:text-gray-400 text-sm mt-6 mb-8">
          Last updated: 7/23/2025, 10:00:09 AM
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <CButton
            className="w-fit bg-transparent border border-colorScBlue text-colorScBlue hover:text-white"
            onClick={onClose}
          >
            Cancel
          </CButton>
          <CButton
            className="w-fit bg-transparent border border-colorScBlue text-colorScBlue hover:text-white"
            onClick={() => console.log("Generate Report")}
          >
            Generate Report
          </CButton>
          <CButton
            className="w-fit"
            onClick={() => console.log("Block all Threats")}
          >
            Block all Threats
          </CButton>
        </div>
      </div>

      {/* Dark Theme Toggle for demonstration */}
    </div>
  );
};
