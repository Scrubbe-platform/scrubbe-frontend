"use client";
import React, { useState } from "react";
import { Table } from "../ui/table";
import Select from "../ui/select";
import CButton from "../ui/Cbutton";
import Modal from "../ui/Modal";
import { CellContext } from "@tanstack/react-table";
import Input from "../ui/input";
import { IoWarning } from "react-icons/io5";

interface IAuditTrail {
  timestamp: string;
  event: string;
  user: string;
  ip: string;
  resource: string;
  status: string;
  action: string;
}

const auditTrailData = [
  {
    timestamp: "2024-01-15 10:30:15",
    event: "API Call",
    user: "john@company.com",
    ip: "192.168.1.100",
    resource: "/v1/fingerprint",
    status: "200",
    action: "View",
  },
  {
    timestamp: "2024-01-15 10:25:42",
    event: "Configuration",
    user: "john@company.com",
    ip: "192.168.1.100",
    resource: "API Key",
    status: "Uploaded",
    action: "View",
  },
  {
    timestamp: "2024-01-15 10:20:33",
    event: "Security",
    user: "System",
    ip: "192.168.1.100",
    resource: "Login",
    status: "Failed",
    action: "View",
  },
  {
    timestamp: "2024-01-15 10:20:33",
    event: "Authentication",
    user: "john@company.com",
    ip: "192.168.1.100",
    resource: "Dashboard",
    status: "Login",
    action: "View",
  },
  {
    timestamp: "INC52527",
    event: "API Call",
    user: "john@company.com",
    ip: "192.168.1.100",
    resource: "/v1/identify",
    status: "Login",
    action: "View",
  },
  {
    timestamp: "INC52527",
    event: "Configuration",
    user: "john@company.com",
    ip: "192.168.1.100",
    resource: "Webhook",
    status: "Login",
    action: "View",
  },
];

const columns = [
  {
    accessorKey: "timestamp",
    header: () => <span className="font-semibold">Timestamp</span>,
    cell: (info: CellContext<IAuditTrail, unknown>) => info.getValue(),
  },
  {
    accessorKey: "event",
    header: () => <span className="font-semibold">Event</span>,
    cell: (info: CellContext<IAuditTrail, unknown>) => info.getValue(),
  },
  {
    accessorKey: "user",
    header: () => <span className="font-semibold">User</span>,
    cell: (info: CellContext<IAuditTrail, unknown>) => info.getValue(),
  },
  {
    accessorKey: "ip",
    header: () => <span className="font-semibold">IP Address</span>,
    cell: (info: CellContext<IAuditTrail, unknown>) => info.getValue(),
  },
  {
    accessorKey: "resource",
    header: () => <span className="font-semibold">Resource</span>,
    cell: (info: CellContext<IAuditTrail, unknown>) => info.getValue(),
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold">Status</span>,
    cell: (info: CellContext<IAuditTrail, unknown>) => {
      const value = info.getValue();
      const text = value;
      let color = "";
      if (value === "200" || value === "Login")
        color =
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      else if (value === "Uploaded")
        color = "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      else if (value === "Failed")
        color = "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      else
        color = "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
      return (
        <span className={`px-2 py-1 rounded font-semibold text-xs ${color}`}>
          {text as string}
        </span>
      );
    },
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
const relatedEventsColumns = [
  {
    accessorKey: "timestamp",
    header: () => <span className="font-semibold">Timestamp</span>,
    cell: (info: CellContext<IAuditTrail, unknown>) => info.getValue(),
  },
  {
    accessorKey: "event",
    header: () => <span className="font-semibold">Event</span>,
    cell: (info: CellContext<IAuditTrail, unknown>) => info.getValue(),
  },
  {
    accessorKey: "user",
    header: () => <span className="font-semibold">User</span>,
    cell: (info: CellContext<IAuditTrail, unknown>) => info.getValue(),
  },

  {
    accessorKey: "status",
    header: () => <span className="font-semibold">Status</span>,
    cell: (info: CellContext<IAuditTrail, unknown>) => {
      const value = info.getValue();
      let color = "";
      const text = value;
      if (value === "200" || value === "Login")
        color =
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      else if (value === "Uploaded")
        color = "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      else if (value === "Failed")
        color = "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      else
        color = "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
      return (
        <span className={`px-2 py-1 rounded font-semibold text-xs ${color}`}>
          {text as string}
        </span>
      );
    },
  },
];

const auditData = {
  timestamp: "2024-01-15 10:30:45",
  eventType: "API Call",
  user: "john@company.com",
  ipAddress: "192.168.1.100",
  resource: "/v1/fingerprint",
  status: 200,
  eventDetails: {
    event_type: "api_call",
    endpoint: "/v1/fingerprint",
    method: "POST",
    status_code: 200,
    response_time: "69ms",
    request_size: "587 bytes",
    response_size: "2812 bytes",
    user_agent: "ScrubsSDK/2.1.4",
    timestamp: "2025-07-22T12:04:44.636Z",
  },
  requestInformation: {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    requestID: "req_rv2lkuqov",
    sessionID: "sess_v5puj6l0z5j",
    bytesSent: 859,
    bytesReceived: 1442,
  },
};

const AuditLogs = () => {
  const [dateRange, setDateRange] = useState("Last 24 hours");
  const [eventType, setEventType] = useState("All Events");
  const [user, setUser] = useState("All Users");
  const [ip, setIp] = useState("192.168.1.100");
  const [openSchedule, setOpenSchedule] = useState(false);
  const [reportType, setReportType] = useState("API Usage Summary");
  const [frequency, setFrequency] = useState("Daily");
  const [deliveryTime, setDeliveryTime] = useState("9:00 am");
  const [recipients, setRecipients] = useState("");
  const [openConfigAlert, setOpenConfigAlert] = useState(false);
  const [formats, setFormats] = useState<string[]>(["PDF"]);
  const [alertType, setAlertType] = useState("API Rate Limit");
  const [threshold, setThreshold] = useState("100");
  const [condition, setCondition] = useState("Greater than");
  const [selectedMethods, setSelectedMethods] = useState<string[]>(["Email"]);
  const [openAchiveLog, setOpenAchiveLog] = useState(false);
  const [archiveOlderThan, setArchiveOlderThan] = useState("7");
  const storageLocation = "Amazon S3";
  const [compression, setCompression] = useState("GZIP");
  const [openAuditDetails, setOpenAuditDetails] = useState(false);
  const [openRelatedEvents, setOpenRelatedEvents] = useState(false);

  const compressionOptions = [
    { value: "GZIP", label: "GZIP" },
    { value: "BZIP2", label: "BZIP2" },
    { value: "ZIP", label: "ZIP" },
  ];

  const notificationMethods = [
    { value: "Email", label: "Email" },
    { value: "Slack", label: "Slack" },
    { value: "Webhook", label: "Webhook" },
  ];

  const handleFormatChange = (format: string) => {
    setFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  };

  const handleMethodChange = (method: string) => {
    setSelectedMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const handleCreateAlert = () => {
    // Implement alert creation logic here
    console.log("Creating alert:", {
      alertType,
      threshold,
      condition,
      selectedMethods,
    });
    setOpenConfigAlert(false);
  };

  const handleStartArchive = () => {
    // Implement archive logic here
    console.log("Starting archive:", {
      archiveOlderThan,
      storageLocation,
      compression,
    });
    setOpenAchiveLog(false);
  };

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">
        Audit Logs
      </h2>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Log Filters */}
        <div className="bg-white dark:bg-dark rounded-xl p-6 flex flex-col gap-2 shadow-sm">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            Log Filters
          </h3>
          <Select
            label="Date Range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: "Last 24 hours", label: "Last 24 hours" },
              { value: "Last 7 days", label: "Last 7 days" },
              { value: "Last 30 days", label: "Last 30 days" },
            ]}
          />
          <Select
            label="Event Type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            options={[
              { value: "All Events", label: "All Events" },
              { value: "API Call", label: "API Call" },
              { value: "Configuration", label: "Configuration" },
              { value: "Security", label: "Security" },
              { value: "Authentication", label: "Authentication" },
            ]}
          />
          <Select
            label="User"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            options={[
              { value: "All Users", label: "All Users" },
              { value: "john@company.com", label: "john@company.com" },
              { value: "System", label: "System" },
            ]}
          />
          <Select
            label="IP Addresses"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            options={[
              { value: "192.168.1.100", label: "192.168.1.100" },
              { value: "192.168.1.101", label: "192.168.1.101" },
            ]}
          />
          <CButton className="w-full">Apply Filters</CButton>
        </div>
        {/* Activity Summary */}
        <div className="bg-white dark:bg-dark rounded-xl p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold dark:text-white">
              Activity Summary
            </h3>
            <button className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-600 dark:text-gray-200 bg-white dark:bg-[#181C2A] font-medium hover:bg-gray-100 dark:hover:bg-[#23263a] transition">
              Export Report
            </button>
          </div>
          <div className="space-y-1 text-right rounded-md border dark:border-gray-600 border-gray-200 p-4 ">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-300">
                Total Events Today
              </span>
              <span className="font-bold text-lg dark:text-white">3,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-300">
                API Calls
              </span>
              <span className="font-bold text-lg dark:text-white">3,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-300">
                Authentication Events
              </span>
              <span className="font-bold text-lg dark:text-white">261</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-300">
                Configuration Changes
              </span>
              <span className="font-bold text-lg dark:text-white">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-300">
                Security Events
              </span>
              <span className="font-bold text-lg text-red-500">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-300">
                Error Events
              </span>
              <span className="font-bold text-lg text-red-500">72</span>
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <CButton className="bg-blue-600 w-fit text-white">Export CSV</CButton>
        <CButton className="border border-blue-600 w-fit text-blue-600 bg-transparent dark:text-blue-400 dark:border-blue-400">
          Export JSON
        </CButton>
        <CButton
          onClick={() => setOpenSchedule(true)}
          className="border border-blue-600 w-fit text-blue-600 bg-transparent  dark:text-blue-400 dark:border-blue-400"
        >
          Schedule Report
        </CButton>
        <CButton
          onClick={() => setOpenConfigAlert(true)}
          className="border border-blue-600 w-fit text-blue-600 bg-transparent  dark:text-blue-400 dark:border-blue-400"
        >
          Set Alert
        </CButton>
        <CButton
          onClick={() => setOpenAchiveLog(true)}
          className="border border-blue-600 w-fit text-blue-600 bg-transparent  dark:text-blue-400 dark:border-blue-400"
        >
          Archive Logs
        </CButton>
      </div>
      {/* Audit Trail Table */}
      <div className="bg-white dark:bg-dark rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Audit Trail
        </h3>
        <Table
          columns={columns}
          data={auditTrailData}
          onRowClick={() => setOpenAuditDetails(true)}
        />
      </div>

      <Modal isOpen={openSchedule} onClose={() => setOpenSchedule(false)}>
        <div className="p-4 min-w-[340px] md:min-w-[480px]">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">
            Schedule Report
          </h2>
          <div className="space-y-4">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { value: "API Usage Summary", label: "API Usage Summary" },
                { value: "Security Audit", label: "Security Audit" },
                {
                  value: "Performance Metrics",
                  label: "Performance Metrics",
                },
                {
                  value: "Error Analysis",
                  label: "Error Analysis",
                },
                {
                  value: "Billing Summary",
                  label: "Billing Summary",
                },
              ]}
            />
            <Select
              label="Frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              options={[
                { value: "Daily", label: "Daily" },
                { value: "Weekly", label: "Weekly" },
                { value: "Monthly", label: "Monthly" },
                { value: "Quarterly", label: "Quarterly" },
              ]}
            />
            <Select
              label="Delivery Time"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              options={[
                { value: "9:00 am", label: "9:00 am" },
                { value: "12:00 pm", label: "12:00 pm" },
                { value: "3:00 pm", label: "3:00 pm" },
                { value: "6:00 pm", label: "6:00 pm" },
              ]}
            />
            <div>
              <div className="font-medium mb-2 dark:text-white">
                Email Recipients
              </div>
              <textarea
                rows={4}
                className="w-full bg-transparent dark:text-white border border-gray-300 rounded-md p-2 text-sm "
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="email1@company.com, email2@company.com"
              />
            </div>
            <div>
              <div className="font-medium mb-2 dark:text-white">Format</div>
              <div className="flex flex-col gap-2">
                {[
                  { value: "PDF", label: "PDF" },
                  { value: "Excel", label: "Excel" },
                  { value: "CSV", label: "CSV" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={formats.includes(opt.value)}
                      onChange={() => handleFormatChange(opt.value)}
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
              onClick={() => setOpenSchedule(false)}
            >
              Cancel
            </CButton>
            <CButton className="w-fit" onClick={() => setOpenSchedule(false)}>
              Schedule Report
            </CButton>
          </div>
        </div>
      </Modal>

      <Modal isOpen={openConfigAlert} onClose={() => setOpenConfigAlert(false)}>
        <div className="p-4 min-w-[340px] md:min-w-[480px]">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">
            Configure Alert
          </h2>
          <div className="space-y-4">
            <Select
              label="Alert Type"
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              options={[
                { value: "API Rate Limit", label: "API Rate Limit" },
                { value: "Error Rate", label: "Error Rate" },
                { value: "Latency", label: "Latency" },
                { value: "Custom", label: "Custom" },
              ]}
            />
            <Input
              label="Threshold"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Enter threshold value"
              type="number"
            />
            <Select
              label="Condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              options={[
                { value: "Greater than", label: "Greater than" },
                { value: "Less than", label: "Less than" },
                { value: "Equal to", label: "Equal to" },
              ]}
            />
            <div>
              <div className="font-medium mb-2 dark:text-white">
                Notification method
              </div>
              <div className="flex flex-col gap-2">
                {notificationMethods.map((method) => (
                  <label
                    key={method.value}
                    className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMethods.includes(method.value)}
                      onChange={() => handleMethodChange(method.value)}
                      className="accent-blue-600 w-5 h-5 rounded"
                    />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <CButton
              className="border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white"
              onClick={() => setOpenConfigAlert(false)}
            >
              Cancel
            </CButton>
            <CButton className="w-fit" onClick={handleCreateAlert}>
              Create Alert
            </CButton>
          </div>
        </div>
      </Modal>

      <Modal isOpen={openAchiveLog} onClose={() => setOpenAchiveLog(false)}>
        <div className="p-4 min-w-[340px] md:min-w-[480px]">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">
            Archive Logs
          </h2>
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-6 flex items-start gap-2">
            <IoWarning size={24} />
            <div>
              <span className="font-semibold">Archive Notice:</span> This will
              move logs older than the specified date to cold storage. Archived
              logs will take longer to retrieve.
            </div>
          </div>
          <div className="space-y-4">
            <Select
              label="Archive logs older than"
              value={archiveOlderThan}
              onChange={(e) => setArchiveOlderThan(e.target.value)}
              options={[
                { value: "7", label: "7 days" },
                { value: "14", label: "14 days" },
                { value: "30", label: "30 days" },
                { value: "60", label: "60 days" },
                { value: "90", label: "90 days" },
              ]}
            />
            <Input label="Storage Location" value={storageLocation} readOnly />
            <div>
              <div className="font-medium mb-2 dark:text-white">
                Compression
              </div>
              <div className="flex flex-col gap-2">
                {compressionOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200"
                  >
                    <input
                      type="radio"
                      name="compression"
                      checked={compression === opt.value}
                      onChange={() => setCompression(opt.value)}
                      className="accent-blue-600 w-5 h-5 rounded-full"
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
              onClick={() => setOpenAchiveLog(false)}
            >
              Cancel
            </CButton>
            <CButton className="w-fit" onClick={handleStartArchive}>
              Start Archive
            </CButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={openAuditDetails}
        onClose={() => setOpenAuditDetails(false)}
      >
        <div className=" transition-colors duration-300">
          <div className=" mx-auto rounded-lg p-6 relative">
            {/* Close Button (top right) - using a simple X icon or component */}

            <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6">
              Audit Log Details
            </h1>

            {/* Audit Log Key-Value Pairs */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8 text-gray-700 dark:text-gray-300 text-sm">
              <div className="font-medium">Timestamp</div>
              <div>{auditData.timestamp}</div>

              <div className="font-medium">Event Type</div>
              <div>{auditData.eventType}</div>

              <div className="font-medium">User</div>
              <div>{auditData.user}</div>

              <div className="font-medium">IP Address</div>
              <div>{auditData.ipAddress}</div>

              <div className="font-medium">Resource</div>
              <div>{auditData.resource}</div>

              <div className="font-medium">Status</div>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    auditData.status === 200
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
                  }`}
                >
                  {auditData.status}
                </span>
              </div>
            </div>

            {/* Event Details JSON Block */}
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Event Details
            </h2>
            <pre className="bg-gray-900 dark:bg-black text-white dark:text-gray-100 p-4 rounded-md overflow-auto text-sm font-mono mb-8">
              {JSON.stringify(auditData.eventDetails, null, 2)}
            </pre>

            {/* Request Information Key-Value Pairs */}
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Request Information
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-10 text-gray-700 dark:text-gray-300 text-sm">
              <div className="font-medium">User Agent</div>
              <div>{auditData.requestInformation.userAgent}</div>

              <div className="font-medium">Request ID</div>
              <div>{auditData.requestInformation.requestID}</div>

              <div className="font-medium">Session ID</div>
              <div>{auditData.requestInformation.sessionID}</div>

              <div className="font-medium">Bytes Sent</div>
              <div>{auditData.requestInformation.bytesSent}</div>

              <div className="font-medium">Bytes Received</div>
              <div>{auditData.requestInformation.bytesReceived}</div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <CButton onClick={() => console.log("Cancel")}>Cancel</CButton>
              <CButton onClick={() => setOpenRelatedEvents(true)}>
                View related events
              </CButton>
              <CButton onClick={() => console.log("Export Details")}>
                Export Details
              </CButton>
            </div>
          </div>

          {/* Dark Theme Toggle for demonstration */}
        </div>
      </Modal>

      <Modal
        isOpen={openRelatedEvents}
        onClose={() => setOpenRelatedEvents(false)}
      >
        <div className=" min-w-[340px] md:min-w-[480px]">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">
            Related Events
          </h2>

          <Table columns={relatedEventsColumns} data={auditTrailData} />
        </div>
      </Modal>
    </div>
  );
};

export default AuditLogs;
