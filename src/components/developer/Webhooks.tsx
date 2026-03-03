"use client";
import React, { useState } from "react";
import Input from "../ui/input";
import Select from "../ui/select";
import CButton from "../ui/Cbutton";
import { Table } from "../ui/table";
import Modal from "../ui/Modal";
import { CellContext } from "@tanstack/react-table";

const webhookEndpoints = [
  {
    name: "Fraud Detected",
    url: "https://api.yourcompany.com/webhooks/fraud-alerts",
    tags: ["fraud.detected", "risk.high"],
    status: "Active",
  },
  {
    name: "User Authentication",
    url: "https://api.yourcompany.com/webhooks/auth-events",
    tags: ["fraud.detected", "risk.high"],
    status: "Active",
  },
];

interface Logs {
  timestamp: string;
  event: string;
  endpoint: string;
  status: number;
  responseTime: string;
  retries: number;
  action: string;
}
const deliveryLogs: Logs[] = [
  {
    timestamp: "2024-01-15 10:30:15",
    event: "fraud.detected",
    endpoint: "fraud-alerts",
    status: 200,
    responseTime: "120ms",
    retries: 0,
    action: "View",
  },
  {
    timestamp: "2024-01-15 10:25:42",
    event: "auth.success",
    endpoint: "auth-events",
    status: 200,
    responseTime: "95ms",
    retries: 0,
    action: "View",
  },
  {
    timestamp: "2024-01-15 10:20:33",
    event: "risk.high",
    endpoint: "fraud-alerts",
    status: 500,
    responseTime: "5000ms",
    retries: 3,
    action: "Retry",
  },
  {
    timestamp: "2024-01-15 10:20:33",
    event: "device.new",
    endpoint: "auth-events",
    status: 200,
    responseTime: "180ms",
    retries: 0,
    action: "View",
  },
];

const deliveryLogColumns = [
  {
    accessorKey: "timestamp",
    header: () => <span className="font-semibold">Timestamp</span>,
    cell: (info: CellContext<Logs, unknown>) => info.getValue(),
  },
  {
    accessorKey: "event",
    header: () => <span className="font-semibold">Event</span>,
    cell: (info: CellContext<Logs, unknown>) => info.getValue(),
  },
  {
    accessorKey: "endpoint",
    header: () => <span className="font-semibold">Endpoint</span>,
    cell: (info: CellContext<Logs, unknown>) => info.getValue(),
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold">Status</span>,
    cell: (info: CellContext<Logs, unknown>) => {
      const status = info.getValue();
      return (
        <span
          className={`px-2 py-1 rounded font-semibold text-xs ${
            status === 200
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {status as string}
        </span>
      );
    },
  },
  {
    accessorKey: "responseTime",
    header: () => <span className="font-semibold">Response Time</span>,
    cell: (info: CellContext<Logs, unknown>) => info.getValue(),
  },
  {
    accessorKey: "retries",
    header: () => <span className="font-semibold">Retries</span>,
    cell: (info: CellContext<Logs, unknown>) => info.getValue(),
  },
  {
    accessorKey: "action",
    header: () => <span className="font-semibold">Action</span>,
    cell: (info: CellContext<Logs, unknown>) => {
      const action = info.getValue();
      return action === "Retry" ? (
        <button className="text-blue-600 border border-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900 transition">
          Retry
        </button>
      ) : (
        <button className="text-blue-600 border border-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900 transition">
          View
        </button>
      );
    },
  },
];

const eventOptions = [
  { value: "fraud.detected", label: "fraud.detected" },
  { value: "auth.success", label: "auth.success" },
  { value: "auth.failed", label: "auth.failed" },
  { value: "risk.high", label: "risk.high" },
  { value: "device.new", label: "device . new" },
];

const Webhooks = () => {
  const [openAddWebhook, setOpenAddWebhook] = useState(false);
  const [webhookName, setWebhookName] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "fraud.detected",
  ]);
  const [openEditConfig, setOpenEditConfig] = useState(false);
  const [editConfigName, setEditConfigName] = useState("Default Configuration");
  const [editConfigEnv, setEditConfigEnv] = useState("Production");
  const [editConfigSettings, setEditConfigSettings] = useState(`{
  "timeout": 5000,
  "retryAttempts": 3,
  "enableLogging": true,
  "compressionEnabled": false
}`);

  const [openLogs, setOpenLogs] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  const handleCheckbox = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const webhookLogsColumns = [
    {
      accessorKey: "timestamp",
      header: () => <span className="font-semibold">Timestamp</span>,
      cell: (info: CellContext<Logs, unknown>) => info.getValue(),
    },
    {
      accessorKey: "event",
      header: () => <span className="font-semibold">Event</span>,
      cell: (info: CellContext<Logs, unknown>) => info.getValue(),
    },
    {
      accessorKey: "status",
      header: () => <span className="font-semibold">Status</span>,
      cell: (info: CellContext<Logs, unknown>) => {
        const status = info.getValue();
        return (
          <span
            className={`px-2 py-1 rounded font-semibold text-xs ${
              status === 200
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {status as string}
          </span>
        );
      },
    },
    {
      accessorKey: "responseTime",
      header: () => <span className="font-semibold">Response Time</span>,
      cell: (info: CellContext<Logs, unknown>) => info.getValue(),
    },
  ];

  const handleRowClick = (value: Logs) => {
    setOpenDetails(true);
    console.log(value);
  };

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">Webhooks</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Webhook Endpoints */}
        <div className="bg-white dark:bg-dark rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold dark:text-white">
              Webhook Endpoints
            </h3>
            <button
              onClick={() => setOpenAddWebhook(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Add Webhook
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {webhookEndpoints.map((wh) => (
              <div
                key={wh.name}
                className="bg-gray-50 dark:bg-subDark rounded-lg p-4 border flex flex-col gap-3 border-gray-100 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="font-semibold text-base dark:text-white">
                    {wh.name}
                  </div>
                  <span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                    {wh.status}
                  </span>
                </div>
                <div className="text-gray-500 dark:text-gray-300 text-sm mb-2">
                  {wh.url}
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {wh.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <CButton
                    className="border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white"
                    onClick={() => setOpenEditConfig(true)}
                  >
                    Test
                  </CButton>
                  <CButton
                    className="border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white"
                    onClick={() => setOpenEditConfig(true)}
                  >
                    Edit
                  </CButton>
                  <CButton
                    className="border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white"
                    onClick={() => setOpenLogs(true)}
                  >
                    View logs
                  </CButton>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Webhook Testing */}
        <div className="bg-white dark:bg-dark rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">
            Webhook Testing
          </h3>
          <div className="flex flex-col gap-3">
            <Input
              label="Webhook URL"
              type="text"
              value="https://api.yourcompany.com/webhooks/test"
              readOnly
            />

            <Select
              label="Event Type"
              options={[
                { value: "fraud.detected", label: "fraud.detected" },
                { value: "auth.success", label: "auth.success" },
                { value: "risk.high", label: "risk.high" },
                { value: "device.new", label: "device.new" },
              ]}
            />

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                Test Payload
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-dark dark:text-white font-mono"
                rows={6}
                value={`"timestamp": "2024-01-15T10:30:00Z",
"data": {
  "visitorId": "fp_abc123",
  "riskScore": 0.95,
  "reason": "Suspicious device pattern",
  "userId": "user_456",
  "ip": "192.168.1.100"
}`}
                readOnly
              />
            </div>
            <CButton>Send Test Webhook</CButton>
          </div>
        </div>
      </div>
      {/* Webhook Delivery Logs */}
      <div className="bg-white dark:bg-dark rounded-xl p-6 mt-8 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Webhook Delivery Logs
        </h3>
        <Table
          columns={deliveryLogColumns}
          data={deliveryLogs}
          onRowClick={handleRowClick}
        />
      </div>

      <Modal isOpen={openAddWebhook} onClose={() => setOpenAddWebhook(false)}>
        <div className="p-4 min-w-[340px] md:min-w-[480px]">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">
            Add New Webhook
          </h2>
          <div className="space-y-4">
            <Input
              label="Webhook Name"
              placeholder="Enter Webhook name"
              value={webhookName}
              onChange={(e) => setWebhookName(e.target.value)}
            />
            <Input
              label="Endpoint URL"
              placeholder="https://your-domain.com/webhook"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
            />
            <div>
              <div className="font-medium mb-2 dark:text-white">
                Endpoint URL
              </div>
              <div className="flex flex-col gap-2">
                {eventOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(opt.value)}
                      onChange={() => handleCheckbox(opt.value)}
                      className="accent-blue-600 w-5 h-5 rounded"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <CButton
              className="border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white"
              onClick={() => setOpenAddWebhook(false)}
            >
              Cancel
            </CButton>
            <CButton className="w-fit" onClick={() => setOpenAddWebhook(false)}>
              Create Webhook
            </CButton>
          </div>
        </div>
      </Modal>

      <Modal isOpen={openEditConfig} onClose={() => setOpenEditConfig(false)}>
        <div className="p-4 min-w-[340px] md:min-w-[480px]">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">
            Edit Configuration
          </h2>
          <div className="space-y-4">
            <Input
              label="Configuration Name"
              placeholder="Enter configuration name"
              value={editConfigName}
              onChange={(e) => setEditConfigName(e.target.value)}
            />
            <Select
              label="Environment"
              options={[
                { value: "Production", label: "Production" },
                { value: "Staging", label: "Staging" },
                { value: "Development", label: "Development" },
              ]}
              value={editConfigEnv}
              onChange={(e) => setEditConfigEnv(e.target.value)}
            />
            <div>
              <div className="font-medium mb-2 dark:text-white">Settings</div>
              <textarea
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-dark dark:text-white font-mono"
                rows={6}
                value={editConfigSettings}
                onChange={(e) => setEditConfigSettings(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <CButton
              className="border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white"
              onClick={() => setOpenEditConfig(false)}
            >
              Cancel
            </CButton>
            <CButton className="w-fit" onClick={() => setOpenEditConfig(false)}>
              Save changes
            </CButton>
          </div>
        </div>
      </Modal>

      <Modal onClose={() => setOpenLogs(false)} isOpen={openLogs}>
        <div className="p-4 min-w-[340px] md:min-w-[600px]">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">
            Webhook Logs
          </h2>
          <div className="flex justify-end mb-2">
            <button className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-600 dark:text-gray-200 bg-white dark:bg-[#181C2A] font-medium hover:bg-gray-100 dark:hover:bg-[#23263a] transition">
              Filter Logs
            </button>
          </div>
          <Table columns={webhookLogsColumns} data={deliveryLogs} />
          <div className="flex justify-end gap-4 mt-8">
            <CButton
              className="border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white"
              onClick={() => setOpenLogs(false)}
            >
              Cancel
            </CButton>
            <CButton className="w-fit" onClick={() => setOpenLogs(false)}>
              Export Logs
            </CButton>
          </div>
        </div>
      </Modal>

      <Modal onClose={() => setOpenDetails(false)} isOpen={openDetails}>
        <div className="p-4 min-w-[340px] md:min-w-[600px]">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">
            View Details
          </h2>
          <div className="mb-6">
            <div className="font-semibold mb-2 dark:text-white">
              Request Details:
            </div>
            <div className="bg-gray-100 dark:bg-[#23263a] rounded-lg p-4 text-gray-700 dark:text-gray-200 text-sm whitespace-pre-line">
              <p>
                <span className="font-semibold">Timestamp:</span>{" "}
                2025-07-21T11:59:10.965Z
              </p>
              <p>
                <span className="font-semibold">Method:</span> POST
              </p>
              <p>
                <span className="font-semibold">Endpoint:</span> /v1/fingerprint
              </p>
              <p>
                <span className="font-semibold">Response Code:</span> 200
              </p>
              <p>
                <span className="font-semibold">Response Time:</span> 145ms
              </p>
              <p>
                <span className="font-semibold">User</span>
                Agent: Mozilla/5.0... IP Address: 192.168.1.100
              </p>
            </div>
          </div>
          <div className="mb-6">
            <div className="font-semibold mb-2 dark:text-white">
              Response Body:
            </div>
            <pre className="bg-black text-white rounded-lg p-4 text-sm overflow-x-auto">
              {`{ "visitorId": "fp_abc123def456",
"confidence": 0.97, 
"riskScore": 0.12, 
"timestamp": "2025-07-21T11:59:10.965Z" }`}
            </pre>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <CButton
              className="border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white"
              onClick={() => setOpenDetails(false)}
            >
              Cancel
            </CButton>
            <CButton className="w-fit" onClick={() => setOpenDetails(false)}>
              View Raw Data
            </CButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Webhooks;
