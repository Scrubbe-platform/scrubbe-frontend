"use client";
import React from "react";
import { Bar } from "react-chartjs-2";

// --- Mock Data ---
// This data simulates the structure for the chart's appearance.
const mockTeamMTTRData = {
  labels: ["Devops", "Support", "Ops"],
  data: [32, 10, 25],
};

const ByTeamChart = () => {
  const { labels, data: chartData } = mockTeamMTTRData;

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Avg MTTR (min)",
        data: chartData,
        backgroundColor: "#4B89F7", // Blue color
        borderRadius: 4,
        barPercentage: 0.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 40,
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm ">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">By Team</h3>
        <button className="text-sm text-gray-500 flex items-center">
          Filter by Last Performing
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
      <div className="h-64">
        <Bar
          data={data}
          options={{
            ...options,
          }}
        />
      </div>
    </div>
  );
};

export default ByTeamChart;
