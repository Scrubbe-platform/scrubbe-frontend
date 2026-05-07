/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { Line } from "react-chartjs-2";

type PerformanceTrendChartProps = {
  labels?: string[];
  values?: number[];
};

const PerformanceTrendChart = ({
  labels = [],
  values = [],
}: PerformanceTrendChartProps) => {
  const chartLabels =
    labels.length > 0
      ? labels
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const chartValues = values.length > 0 ? values : [0, 0, 0, 0, 0, 0, 0];
  const maxValue = Math.max(...chartValues, 100);
  const minValue = Math.min(...chartValues, 60);

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: "SLA Performance",
        data: chartValues,
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
        min: Math.max(0, Math.floor(minValue / 10) * 10 - 10),
        max: Math.max(100, Math.ceil(maxValue / 10) * 10 + 10),
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
