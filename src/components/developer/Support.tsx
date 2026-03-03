/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import Select from "../ui/select";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";
import clsx from "clsx";
import { CellContext } from "@tanstack/react-table";
import { Table } from "../ui/table";
import { Button } from "@heroui/react";

const supportTickets = [
  {
    id: "#SCR-2024-001",
    description: "API Rate Limit Issues",
    status: "High",
    stage: "Resolved",
    created: "Jan 10, 2024",
  },
  {
    id: "#SCR-2024-002",
    description: "Webhook Delivery Failures",
    status: "Critical",
    stage: "In-Progress",
    created: "Jan 12, 2024",
  },
  {
    id: "#SCR-2024-003",
    description: "Feature Request: Custom Rules",
    status: "Low",
    stage: "Under-Review",
    created: "Jan 14, 2024",
  },
];

const columns = [
  {
    accessorKey: "id",
    header: () => <span className="font-semibold">Ticket ID</span>,
    cell: (info: CellContext<typeof supportTickets, unknown>) =>
      info.getValue(),
  },
  {
    accessorKey: "description",
    header: () => <span className="font-semibold">Description</span>,
    cell: (info: CellContext<typeof supportTickets, unknown>) =>
      info.getValue(),
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold">Status</span>,
    cell: (info: CellContext<typeof supportTickets, unknown>) =>
      info.getValue(),
  },
  {
    accessorKey: "stage",
    header: () => <span className="font-semibold">Stage</span>,
    cell: (info: CellContext<typeof supportTickets, unknown>) =>
      info.getValue(),
  },
  {
    accessorKey: "created",
    header: () => <span className="font-semibold">Created</span>,
    cell: (info: CellContext<typeof supportTickets, unknown>) =>
      info.getValue(),
  },
  {
    accessorKey: "action",
    header: () => <span className="font-semibold">Action</span>,
    cell: () => <Button>View</Button>,
  },
];

// Main Support Dashboard Component
const SupportDashboard: React.FC = () => {
  const [priority, setPriority] = useState("Low-general question");
  const [category, setCategory] = useState("API Integration");
  const [subject, setSubject] = useState("");
  const [emailRecipients, setEmailRecipients] = useState("");
  const [description, setDescription] = useState("");

  // Dummy data for Support Tickets

  const handleSubmitTicket = () => {
    console.log({ priority, category, subject, emailRecipients, description });
    // Add logic to submit the ticket
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className=" mx-auto">
        {/* Header and Theme Toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Support
          </h1>
        </div>

        {/* Top Section: Contact Support & Support Channels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Contact Support Card */}
          <div className="bg-white dark:bg-dark shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Contact Support
            </h2>
            <Select
              label="Priority Level"
              id="priority-level"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                {
                  value: "Low-general question",
                  label: "Low-general question",
                },
                {
                  value: "Medium-technical issue",
                  label: "Medium-technical issue",
                },
                {
                  value: "High-critical problem",
                  label: "High-critical problem",
                },
              ]}
              className="mb-4"
            />
            <Select
              label="Category"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: "API Integration", label: "API Integration" },
                { value: "Billing", label: "Billing" },
                { value: "Account Management", label: "Account Management" },
              ]}
              className="mb-4"
            />
            <Input
              label="Subject"
              id="subject"
              placeholder="Brief Description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mb-4"
            />
            <Input
              label="Email Recipients"
              id="email-recipients"
              placeholder=""
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
              className="mb-1"
            />

            <div className="space-y-2 relative mb-4">
              <p className="dark:text-white font-medium text-sm ">
                Message(Optional)
              </p>
              <textarea
                rows={4}
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                placeholder="Welcome to the team"
                className="w-full bg-transparent text-white border border-gray-300 rounded-md p-2 text-sm "
              />
            </div>
          </div>

          {/* Support Channels Card */}
          <div className="bg-white dark:bg-dark shadow rounded-lg p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Support Channels
              </h2>
              <div className="space-y-6 flex-1">
                <div className="flex items-start">
                  {/* Chat Icon */}
                  <svg
                    className="h-6 w-6 text-blue-500 mr-3 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Live Chat
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Available 24/7 - Response time: &lt; 5 min
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  {/* Email Icon */}
                  <svg
                    className="h-6 w-6 text-blue-500 mr-3 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Email Support
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      support@scrubbe.com - Response time: &lt; 2 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  {/* Phone Icon */}
                  <svg
                    className="h-6 w-6 text-blue-500 mr-3 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Phone Support
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      +1 (555) 123-4567 - Enterprise customers only
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <CButton className="w-full" onClick={handleSubmitTicket}>
              Start Live Chat
            </CButton>
          </div>
        </div>

        {/* Your Support Ticket Section (Table) */}
        <div className="bg-white dark:bg-dark shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Your Support Ticket
          </h2>
          <Table columns={columns} data={supportTickets as any} />
        </div>

        {/* Bottom Section: Knowledge Base & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Knowledge Base Card */}
          <div className="bg-white dark:bg-dark shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Knowledge Base
            </h2>
            <div className="relative mb-6">
              <Input
                id="search-knowledge"
                placeholder="Search Tickets"
                className="pr-10" // Make space for icon
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {/* Search Icon */}
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-800/20 border-l-2 border-blue-600 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Live Chat
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Available 24/7 - Response time: &lt; 5 min
                </p>
              </div>
              <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-800/20 border-l-2 border-blue-600 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  API Reference
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete API documentation
                </p>
              </div>
              <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-800/20 border-l-2 border-blue-600 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Troubleshooting
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Common issues and solutions
                </p>
              </div>
            </div>
            <CButton className="w-full">Browse All Integrations</CButton>
          </div>

          {/* System Status Card */}
          <div className="bg-white dark:bg-dark shadow rounded-lg p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                System Status
              </h2>
              <div className="text-center mb-6">
                <p className="text-5xl font-extrabold text-green-600 dark:text-green-400">
                  99.97%
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  30-day uptime
                </p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>API Service</span>
                  <StatusIndicator status="Operational" />
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Webhook Service</span>
                  <StatusIndicator status="Operational" />
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Dashboard</span>
                  <StatusIndicator status="Operational" />
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Analytics</span>
                  <StatusIndicator status="Degraded" />
                </div>
              </div>
            </div>
            <CButton className="w-full">View Status Page</CButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;

const StatusIndicator = ({ status }: { status: string }) => {
  return (
    <div
      className={clsx("px-2 py-1 text-sm rounded-md", {
        "text-green-600 bg-green-100 dark:bg-green-700/20":
          status.toLowerCase() === "operational",
        "text-orange-600 bg-orange-100 dark:bg-orange-700/20":
          status.toLowerCase() === "degraded",
      })}
    >
      {status}
    </div>
  );
};
