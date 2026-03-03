/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { Line } from "react-chartjs-2";

const PerformanceTrendChart = () => {
  const data = {
    labels: ["Jan", "Feb", "Marc", "April", "May", "June", "July"],
    datasets: [
      {
        label: "SLA Performance",
        data: [100, 80, 110, 85, 95, 120, 115], // Mock data for a wavy trend
        borderColor: "#00A3A3", // Teal/Green line color
        backgroundColor: "rgba(0, 163, 163, 0.2)", // Light fill color
        fill: true,
        tension: 0.4, // Smooths the line
        pointRadius: 0, // Hides the data points for a cleaner look
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, boxWidth: 6 },
      },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 60,
        max: 140,
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={data} options={options as any} />
    </div>
  );
};

export default PerformanceTrendChart;
