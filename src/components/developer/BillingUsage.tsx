"use client";
import { CellContext } from "@tanstack/react-table";
import ProgressBar from "../ezra/ProgressBar";
import CButton from "../ui/Cbutton";
import UsageChart from "./BillingUsageChart";
import moment from "moment";
import { Table } from "../ui/table";

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
}

interface IBillingHistory {
  date: Date;
  description: string;
  amount: number;
  status: string;
}

const billingHistory: IBillingHistory[] = [
  {
    date: new Date(Date.now()),
    amount: 300,
    description: "Enterprise Monthly",
    status: "Paid",
  },
  {
    date: new Date(Date.now()),
    amount: 300,
    description: "Enterprise Monthly",
    status: "Paid",
  },
  {
    date: new Date(Date.now()),
    amount: 300,
    description: "Enterprise Monthly",
    status: "Paid",
  },
  {
    date: new Date(Date.now()),
    amount: 300,
    description: "Enterprise Monthly",
    status: "Paid",
  },
];

const columns = [
  {
    accessorKey: "date",
    header: () => <span className="font-semibold">Date</span>,
    cell: (info: CellContext<IBillingHistory, unknown>) =>
      moment(info.getValue() as Date).format("MMM DD,YYYY"),
  },
  {
    accessorKey: "description",
    header: () => <span className="font-semibold">Description</span>,
    cell: (info: CellContext<IBillingHistory, unknown>) => info.getValue(),
  },
  {
    accessorKey: "amount",
    header: () => <span className="font-semibold">Amount</span>,
    cell: (info: CellContext<IBillingHistory, unknown>) =>
      `$${(info.getValue() as number).toLocaleString()}`,
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold">Status</span>,
    cell: (info: CellContext<IBillingHistory, unknown>) => {
      const value = (info.getValue() as string).toLowerCase();
      let color = "";
      if (value === "paid")
        color =
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      else if (value === "pending")
        color = "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      else if (value === "Failed")
        color = "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      else
        color = "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";

      return (
        <span className={`px-2 py-1 rounded font-semibold text-xs ${color}`}>
          {value as string}
        </span>
      );
    },
  },
  {
    accessorKey: "action",
    header: () => <span className="font-semibold">Action</span>,
    cell: () => <CButton className="w-fit">Download</CButton>,
  },
];

const Progress: React.FC<ProgressBarProps> = ({ label, current, total }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="mb-4 p-3 bg-zinc-100 dark:bg-subDark rounded-md">
      <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300 mb-1">
        <span>{label}</span>
        <span className=" text-colorScBlue">
          {current}/{total}
        </span>
      </div>
      <ProgressBar value={percentage} color="bg-blue-500" />
    </div>
  );
};

const BillingUsage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className=" mx-auto">
        {/* Header and Theme Toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Billing and Usage
          </h1>
        </div>

        {/* Top Section: Current Plan & This Month's Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Current Plan Card */}
          <div className="bg-white dark:bg-dark rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Current Plan
            </h2>
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                Enterprise
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Billed Monthly
              </p>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>API Calls</span>
                <span className="font-medium">Unlimited</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Team Members</span>
                <span className="font-medium">Up to 50</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Support</span>
                <span className="font-medium">Priority 24/7</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>SLA</span>
                <span className="font-medium">99.9%</span>
              </div>
            </div>
            <CButton
              className="w-full"
              onClick={() => console.log("Manage Plan")}
            >
              Manage Plan
            </CButton>
          </div>

          {/* This Month's Usage Card */}
          <div className="bg-white dark:bg-dark rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              This Month&apos;s Usage
            </h2>
            <Progress label="API Call" current={2847} total={10000} />
            <Progress label="Fingerprints" current={1234} total={5000} />
            <Progress label="Webhook Calls" current={567} total={2000} />
          </div>
          {/* Bottom Section: Billing Information */}
          <div className="bg-white dark:bg-dark rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Billing Information
            </h2>
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Next Billing Date</span>
                <span className="font-medium">Feb 15, 2024</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Payment Method</span>
                <span className="font-medium">......4243</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Amount</span>
                <span className="font-medium">$299.00</span>
              </div>
              <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span>Status</span>
                <StatusIndicator status="Active" />
              </div>
            </div>
            <CButton
              className="w-full"
              onClick={() => console.log("Update Payment")}
            >
              Update Payment
            </CButton>
          </div>
        </div>

        <div className="bg-white dark:bg-dark rounded-lg p-6 pb-16 h-[600px] mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Usage History
          </h2>

          <UsageChart />
        </div>

        <div className="bg-white dark:bg-dark rounded-lg p-6 pb-16 h-[600px]">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Billing History
          </h2>
          <Table columns={columns} data={billingHistory} />
        </div>
      </div>
    </div>
  );
};

export default BillingUsage;

interface StatusIndicatorProps {
  status: "Active" | "Due" | "Enabled" | "Disabled"; // Added more statuses from previous context if needed
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
