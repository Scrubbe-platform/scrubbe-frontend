/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Modal from "../ui/Modal";
import { useQuery } from "@tanstack/react-query";
import { querykeys } from "@/lib/constant";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { Loader } from "lucide-react";
import SLADashboard from "./SLADashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Dummy data, replace with real data via props or context in the future
const ticketStatusData = {
  labels: ["OPEN", "ON_HOLD", "IN_PROGRESS", "CLOSED"],
  datasets: [
    {
      label: "Number of Tickets",
      data: [0, 0, 0, 0],
      backgroundColor: "#14D8C8",
      borderRadius: 6,
      maxBarThickness: 60,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (items: any) => `Ticket Status : ${items[0].label}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        label: (item: any) => `Number of tickets : ${item.parsed.y}`,
      },
      backgroundColor: "#18181b",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "#14D8C8",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
    },
  },
  scales: {
    x: {
      //   grid: {
      //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //     color: (ctx: any) =>
      //       ctx.chart.canvas.parentNode.classList.contains("dark")
      //         ? "#23263a"
      //         : "#e5e7eb",
      //   },
      ticks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        color: (ctx: any) =>
          ctx.chart.canvas.parentNode.classList.contains("dark")
            ? "#fff"
            : "#9ca3af",
        font: { size: 16, weight: 700 },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        color: (ctx: any) =>
          ctx.chart.canvas.parentNode.classList.contains("dark")
            ? "#23263a"
            : "#e5e7eb",
      },
      ticks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        color: (ctx: any) =>
          ctx.chart.canvas.parentNode.classList.contains("dark")
            ? "#fff"
            : "#9ca3af",
        font: { size: 15 },
        stepSize: 50,
      },
      title: {
        display: true,
        text: "Number of Tickets",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        color: (ctx: any) =>
          ctx.chart.canvas.parentNode.classList.contains("dark")
            ? "#22223b"
            : "#9ca3af",
        font: { size: 16, weight: 700 },
        padding: { bottom: 10 },
      },
    },
  },
  layout: {
    padding: { top: 20, right: 20, left: 10, bottom: 10 },
  },
} as any;

const tabs = [{ label: "Metrics" }, { label: "Trends" }, { label: "SLA" }];

const IncidentAnalysis = ({ isOpen = true, onClose = () => {} }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [analytics, setAnalytics] = useState(ticketStatusData);
  const { get } = useFetch();

  const { data, isLoading } = useQuery({
    queryKey: [querykeys.ANALYTICS],
    queryFn: async () => {
      const res = await get(endpoint.incident_ticket.analytics);
      if (res.success) return res.data.metrics;
    },
    initialData: [],
  });

  useEffect(() => {
    const chartData = data?.map(
      (value: { count: number; status: number }) => value.count
    );
    setAnalytics((prev) => ({
      ...prev,
      datasets: [{ ...prev.datasets[0], data: chartData }],
    }));
  }, [data]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="min-w-[320px] sm:min-w-[500px] md:min-w-[600px]">
        <h2 className="text-2xl font-semibold mb-2 dark:text-white text-gray-900">
          Incident Analytics
        </h2>
        {/* Tabs */}
        <div className="flex border-b border-gray-700/30 dark:border-gray-400/10 my-4 gap-4">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              className={`pb-2 font-medium transition-colors duration-200 focus:outline-none ${
                activeTab === idx
                  ? "text-primary-500 border-b-2 border-primary"
                  : "text-gray-400 border-b-2 border-transparent hover:text-primary-500"
              }`}
              onClick={() => setActiveTab(idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Chart Area */}
        {activeTab === 0 && (
          <div className="w-full h-[340px] flex items-center justify-center">
            {isLoading ? (
              <div className="flex justify-center items-center">
                <Loader />
                <p>Retrieving analytics</p>
              </div>
            ) : (
              <div className="w-full h-full">
                <Bar
                  data={analytics}
                  options={chartOptions}
                  className="bg-transparent"
                />
              </div>
            )}
          </div>
        )}
        {activeTab === 1 && (
          <div className="w-full h-[340px] flex items-center justify-center">
            <div className="text-gray-400 dark:text-gray-500 text-lg">
              Trends coming soon...
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className=" max-w-5xl min-h-[340px]">
            <SLADashboard />
          </div>
        )}
        {/* Close Button */}
      </div>
    </Modal>
  );
};

export default IncidentAnalysis;
