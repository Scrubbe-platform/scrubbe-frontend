"use client";
import React from "react";
import LineChart from "./LineChart";
import DoughnutChart from "./DoughnutChart";
import { CellContext } from "@tanstack/react-table";
import { Table } from "../ui/table";

interface IAnalytics {
  endpoint: string;
  totalRequest: number;
  avgtime: string;
  successRate: string;
  errorRate: string;
}

const columns = [
  {
    accessorKey: "endpoint",
    header: () => <span className="font-semibold">Endpoint</span>,
    cell: (info: CellContext<IAnalytics, unknown>) => info.getValue(),
  },
  {
    accessorKey: "totalRequest",
    header: () => <span className="font-semibold">Total Requests</span>,
    cell: (info: CellContext<IAnalytics, unknown>) => info.getValue(),
  },
  {
    accessorKey: "avgtime",
    header: () => <span className="font-semibold">Avg Time</span>,
    cell: (info: CellContext<IAnalytics, unknown>) => info.getValue(),
  },
  {
    accessorKey: "successRate",
    header: () => <span className="font-semibold">Success Rate</span>,
    cell: (info: CellContext<IAnalytics, unknown>) => info.getValue(),
  },
  {
    accessorKey: "errorRate",
    header: () => <span className="font-semibold">Error Rate</span>,
    cell: (info: CellContext<IAnalytics, unknown>) => info.getValue(),
  },
];
const Analytics = () => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="font-semibold text-lg dark:text-white">Analytics</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-dark rounded-xl">
          <div className=" flex justify-between items-center">
            <h2 className="font-semibold text-lg dark:text-white">
              API Usage Trends
            </h2>
          </div>
          <div className="mt-6">
            <LineChart
              labels={[
                "8:00",
                "8:15",
                "8:20",
                "8:30",
                "8:40",
                "8:50",
                "9:00",
                "9:10",
                "9:20",
                "9:30",
                "9:40",
                "9:50",
                "10:00",
                "10:10",
                "10:20",
              ]}
              datasets={[
                {
                  label: "Number of Requests",
                  data: [
                    120, 30, 130, 140, 0, 110, 125, 135, 120, 80, 110, 90, 60,
                    100, 120,
                  ],
                  borderColor: "#2563eb",
                  backgroundColor: "#2563eb",
                  yAxisID: "y",
                  pointBorderColor: "#fff",
                  pointBackgroundColor: "#2563eb",
                  pointRadius: 6,
                  pointHoverRadius: 8,
                  fill: false,
                },
                {
                  label: "Rate Error time",
                  data: [
                    0.12, 0.02, 0.11, 0.09, 0.04, 0.1, 0.11, 0.12, 0.1, 0.11,
                    0.09, 0.05, 0.04, 0.08, 0.1,
                  ],
                  borderColor: "#0f766e",
                  backgroundColor: "#0f766e",
                  yAxisID: "y1",
                  pointBorderColor: "#fff",
                  pointBackgroundColor: "#0f766e",
                  pointRadius: 6,
                  pointHoverRadius: 8,
                  fill: false,
                },
              ]}
              yAxes={[
                {
                  id: "y",
                  position: "left",
                  label: "Response Time(ms)",
                  min: 0,
                  max: 150,
                  stepSize: 20,
                },
                {
                  id: "y1",
                  position: "right",
                  label: "Rate Error time",
                  min: 0,
                  max: 0.12,
                  stepSize: 0.02,
                },
              ]}
              height={350}
            />
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-dark rounded-xl">
          <div className=" flex justify-between items-center">
            <h2 className="font-semibold text-lg dark:text-white">
              Geographic Distribution
            </h2>
          </div>

          {/* implement it here */}
          <div className="mt-6">
            <DoughnutChart
              labels={[
                "United states",
                "Brazil",
                "United Kingdom",
                "India",
                "Germany",
                "France",
                "Canada",
                "Australia",
                "Netherlands",
                "Japan",
              ]}
              data={[32, 10, 12, 15, 8, 7, 3, 15, 8, 10]}
              colors={[
                "#2563eb",
                "#a78bfa",
                "#14b8a6",
                "#06b6d4",
                "#f59e42",
                "#e11d48",
                "#38bdf8",
                "#22c55e",
                "#ef4444",
                "#64748b",
              ]}
              legendPosition="right"
              height={250}
            />
          </div>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-dark rounded-xl space-y-4">
        <h2 className="font-semibold text-lg dark:text-white">
          Detailed Analytics
        </h2>

        <Table columns={columns} data={dummyAnalytics} />
      </div>
    </div>
  );
};

export const dummyAnalytics: IAnalytics[] = [
  {
    endpoint: "/api/user/login",
    totalRequest: 1200,
    avgtime: "110ms",
    successRate: "98.5%",
    errorRate: "1.5%",
  },
  {
    endpoint: "/api/user/logout",
    totalRequest: 800,
    avgtime: "90ms",
    successRate: "99.2%",
    errorRate: "0.8%",
  },
  {
    endpoint: "/api/data/fetch",
    totalRequest: 1500,
    avgtime: "130ms",
    successRate: "97.8%",
    errorRate: "2.2%",
  },
  {
    endpoint: "/api/notifications/read",
    totalRequest: 600,
    avgtime: "100ms",
    successRate: "99.0%",
    errorRate: "1.0%",
  },
];

export default Analytics;
