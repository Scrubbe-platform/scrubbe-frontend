"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";

type OverallComplianceChartProps = {
  compliance?: number;
};

const OverallComplianceChart = ({
  compliance = 94,
}: OverallComplianceChartProps) => {
  const safeCompliance = Math.min(100, Math.max(0, compliance));
  const nonCompliance = Math.max(0, 100 - safeCompliance);

  const data = {
    labels: ["Compliance", "Non-Compliance"],
    datasets: [
      {
        data: [safeCompliance, nonCompliance],
        backgroundColor: [
          "#00A3A3", // Teal/Green
          "#E5E7EB", // Light Gray (for the remaining 6%)
        ],
        hoverBackgroundColor: ["#008080", "#D1D5DB"],
        borderWidth: 0,
        circumference: 180, // Makes it a half-circle (Gauge/Meter style)
        rotation: -90, // Starts the half-circle correctly at the top
        cutout: "80%", // Defines the thickness of the ring
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
  };

  return (
    <div className="relative h-48 w-full flex items-center justify-center">
      <Doughnut data={data} options={options} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-2 text-center">
        <span className="text-4xl font-bold text-gray-800">
          {safeCompliance}%
        </span>
      </div>
    </div>
  );
};

export default OverallComplianceChart;
