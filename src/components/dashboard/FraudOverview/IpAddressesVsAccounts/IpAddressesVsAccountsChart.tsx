/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale, // For the categorical X-axis (IP addresses)
  LinearScale, // For the numerical Y-axis (number of accounts)
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useThemeStore } from "@/store/themeStore"; // Assuming you have a theme store

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const IpAddressesVsAccountsChart = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  // Sample data extracted directly from your screenshot
  const labels = [
    "192.168.1.100",
    "10.0.0.45",
    "203.0.113.12",
    "198.51.100.8",
    "172.16.0.55",
  ];

  const dataValues = [
    32, // For 192.168.1.100
    28, // For 10.0.0.45
    22, // For 203.0.113.12
    34, // For 198.51.100.8
    41, // For 172.16.0.55
  ];

  // Function to get chart options based on theme
  const getChartOptions = (darkTheme: boolean) => {
    const textColor = darkTheme ? "#cbd5e1" : "#475569"; // slate-300 vs slate-600
    const gridColor = darkTheme ? "#334155" : "#e2e8f0"; // slate-700 vs slate-200
    // Solid blue colors for bars
    // const barColor = darkTheme ? "#60a5fa" : "#93c5fd"; // blue-400 for dark, blue-300 for light
    // const barBorderColor = darkTheme ? "#3b82f6" : "#60a5fa"; // blue-500 for dark, blue-400 for light

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
            title: function (context: any) {
              return `IP: ${context[0].label}`; // Show the IP address for the title
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
            maxRotation: 45, // Allow some rotation for long IP addresses
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
        label: "Device IP VS User count",
        data: dataValues,
        backgroundColor: isDarkTheme ? "#60a5fa" : "#93c5fd", // Solid blue color
        borderColor: isDarkTheme ? "#3b82f6" : "#60a5fa", // Solid border color
        borderWidth: 1, // Add a slight border to match the screenshot
        hoverBackgroundColor: isDarkTheme ? "#3b82f6" : "#60a5fa", // Slightly different on hover
        barThickness: 50, // Adjust bar thickness as needed
        categoryPercentage: 0.7, // Adjust space between bars
        barPercentage: 0.8,
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

export default IpAddressesVsAccountsChart;
