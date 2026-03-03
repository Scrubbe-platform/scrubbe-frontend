"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Pie } from "react-chartjs-2";

const BreachesByPriorityChart = () => {
  const data = {
    labels: ["P1", "P2", "P3", "P4"],
    datasets: [
      {
        data: [15, 25, 40, 20], // Mock size approximation (P3 is largest)
        backgroundColor: [
          "#EF4444", // Red (P1)
          "#10B981", // Green (P2)
          "#4B89F7", // Blue (P3)
          "#F59E0B", // Orange (P4)
        ],
        hoverOffset: 4,
        borderWidth: 0, // Minimalistic, no heavy borders
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 10, padding: 20 },
      },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="h-64">
      <Pie data={data} options={options as any} />
    </div>
  );
};

export default BreachesByPriorityChart;
