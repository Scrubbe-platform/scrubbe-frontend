/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale, // For the categorical X-axis
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useThemeStore } from "@/store/themeStore";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UserIdUniqueFingerprintsChart = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  // Sample data extracted from your screenshot
  const labels = ["user 001", "user 002", "user 003", "user 004", "user 005"];

  const dataValues = [
    32, // for user 001
    28, // for user 002
    22, // for user 003
    34, // for user 004
    41, // for user 005
  ];

  // Function to get chart options based on theme
  const getChartOptions = (darkTheme: boolean) => {
    const textColor = darkTheme ? "#cbd5e1" : "#475569"; // slate-300 vs slate-600
    const gridColor = darkTheme ? "#334155" : "#e2e8f0"; // slate-700 vs slate-200
    // Using a light green/mint for light theme, and a slightly darker/more saturated for dark theme
    const barBackgroundColor = darkTheme ? "#2dd4bf" : "#6ee7b7"; // teal-400 for dark, emerald-300 for light

    return {
      responsive: true,
      maintainAspectRatio: false, // Allows the chart to fill its container
      plugins: {
        legend: {
          position: "bottom", // As seen in your screenshot
          labels: {
            color: textColor,
          },
        },
        title: {
          display: false, // No explicit title in the screenshot
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: darkTheme
            ? "rgba(30,41,59,0.9)"
            : "rgba(255,255,255,0.9)", // slate-900 / white
          borderColor: darkTheme ? "#475569" : "#e2e8f0", // slate-600 / slate-200
          borderWidth: 1,
          titleColor: darkTheme ? "#cbd5e1" : "#1e293b", // slate-300 / slate-900
          bodyColor: darkTheme ? "#94a3b8" : "#475569", // slate-400 / slate-600
          callbacks: {
            label: function (context: any) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          type: "category", // Set x-axis type to 'category' for discrete labels
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            maxRotation: 0, // Keep labels horizontal
            minRotation: 0,
          },
          border: {
            color: gridColor,
          },
        },
        y: {
          beginAtZero: true,
          max: 40, // Based on your screenshot's y-axis max
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            stepSize: 10, // 0, 10, 20, 30, 40
          },
          border: {
            color: gridColor,
          },
        },
      },
      elements: {
        bar: {
          backgroundColor: barBackgroundColor,
          borderRadius: 4, // Slight border radius for bars, as seen in screenshot
          borderSkipped: false, // Don't skip borders on any side
        },
      },
    };
  };

  const chartData = {
    labels: labels, // Use the labels array for the x-axis categories
    datasets: [
      {
        label: "User ID per Number of unique fingerprints",
        data: dataValues,
        backgroundColor: isDarkTheme ? "#2dd4bf" : "#6ee7b7", // teal-400 for dark, emerald-300 for light
        hoverBackgroundColor: isDarkTheme ? "#14b8a6" : "#2dd4bf", // teal-500 for dark, teal-400 for light
        barThickness: 30, // Adjust bar thickness as needed
      },
    ],
  };

  return (
    <div className="w-full mx-auto h-full">
      <div className="relative h-full pb-10">
        <Bar data={chartData} options={getChartOptions(isDarkTheme) as any} />
      </div>
    </div>
  );
};

export default UserIdUniqueFingerprintsChart;
