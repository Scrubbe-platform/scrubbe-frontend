"use client";
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
import { BsArrowRight } from "react-icons/bs";

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

// Sample data for the chart
const data = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [
    {
      label: "SLA Breaches",
      data: [], // Example data points
      borderColor: "#22D3EE", // Tailwind's cyan-400
      backgroundColor: "rgba(34, 211, 238, 0.2)",
      fill: true,
      tension: 0.4,
      pointRadius: 0,
    },
  ],
};

// Configuration options for the chart
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Hide the legend as per the design
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 14,
        },
      },
    },
    y: {
      title: {
        display: true,
        text: "Breaches",
        color: "#4B5563",
        font: {
          size: 14,
        },
      },
      grid: {
        borderDash: [5, 5],
        color: "#E5E7EB",
      },
      min: 0,
      max: 140,
      ticks: {
        stepSize: 20,
      },
    },
  },
};

const SlaBreachesChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          SLA Breaches ( last 30 days)
        </h2>
        <a
          href="/compliance-details"
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <span className="underline">See compliance details</span>
          <BsArrowRight className="ml-2" />
        </a>
      </div>
      <div style={{ height: "300px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default SlaBreachesChart;
