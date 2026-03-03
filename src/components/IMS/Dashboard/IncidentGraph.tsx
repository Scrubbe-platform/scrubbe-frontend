"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register the necessary components from Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Data for the graph

type Props = {
  incidentTrends: { date: string; opened: number; resolved: number }[];
};
const IncidentGraph = ({ incidentTrends }: Props) => {
  const data = {
    labels: incidentTrends?.map((value) => value.date),
    datasets: [
      {
        label: "Opened",
        data: incidentTrends?.map((value) => value.opened),
        // data: [105, 108, 88, 85, 95, 82, 98, 120, 128],
        borderColor: "#3B82F6", // Blue
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Resolved",
        data: incidentTrends?.map((value) => value.resolved),
        // data: [95, 105, 92, 90, 88, 85, 95, 110, 116],
        borderColor: "#22D3EE", // Cyan
        backgroundColor: "rgba(34, 211, 238, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Chart options to customize appearance
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
        },
      },
      title: {
        display: false,
        text: "Incident Trend Graph ( Last 30 days)",
      },
    },
    scales: {
      x: {
        title: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Incidents",
        },
        grid: {
          borderDash: [8, 4],
          color: "#e5e7eb",
        },
      },
    },
  };
  return (
    <div className="bg-white p-6 rounded-lg w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Incident Trend Graph ( Last 30 days)
      </h2>
      <div style={{ height: "300px" }}>
        <Line data={data} options={options as any} />
      </div>
    </div>
  );
};

export default IncidentGraph;
