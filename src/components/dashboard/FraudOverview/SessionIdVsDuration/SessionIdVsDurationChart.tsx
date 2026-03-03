/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale, // For the categorical X-axis (Session IDs)
  LinearScale, // For the numerical Y-axis (duration)
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Needed for area filling
} from "chart.js";
import { Line } from "react-chartjs-2"; // Use Line chart for area with points
import { useThemeStore } from "@/store/themeStore"; // Assuming you have a theme store

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Register Filler plugin
);

const SessionIdVsDurationChart = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  // Exact labels from the screenshot
  const labels = [
    "sess-23566",
    "sess-23566",
    "sess-23566", // This is where the peak occurs
    "sess-23566",
    "sess-23566",
  ];

  // Data values carefully approximated to match the shape and Y-axis scale
  const dataValues = [
    3, // First point
    2.5, // Second point
    20, // Third point, the peak
    3, // Fourth point
    2.5, // Fifth point
  ];

  // Function to get chart options based on theme
  const getChartOptions = (darkTheme: boolean) => {
    const textColor = darkTheme ? "#cbd5e1" : "#475569"; // slate-300 vs slate-600
    const gridColor = darkTheme ? "#334155" : "#e2e8f0"; // slate-700 vs slate-200
    // Using light green/mint colors as seen in the screenshot
    const areaFillColor = darkTheme
      ? "rgba(100, 220, 170, 0.5)"
      : "rgba(150, 250, 200, 0.5)"; // Adjusted for light/dark
    const lineColor = darkTheme ? "#64dcab" : "#96fac8"; // Brighter for light, slightly deeper for dark
    const pointColor = darkTheme ? "#64dcab" : "#96fac8";

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom", // As seen in your screenshot
          labels: {
            color: textColor,
          },
        },
        title: {
          display: false, // No explicit title above the chart area in the screenshot
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
              return `Session ID: ${context[0].label}`; // Show the Session ID for the title
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
          max: 20, // Max Y-axis value from screenshot
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            stepSize: 5, // 0, 5, 10, 15, 20 as seen in screenshot
          },
          border: {
            color: gridColor,
          },
        },
      },
      elements: {
        point: {
          radius: 3, // Points are visible in the screenshot
          hoverRadius: 5,
          backgroundColor: pointColor,
          borderColor: pointColor,
        },
        line: {
          tension: 0.2, // Slight curve for the line
          borderWidth: 1.5, // Line thickness
          borderColor: lineColor,
          fill: true, // Crucial for area chart
          backgroundColor: areaFillColor,
        },
      },
    };
  };

  const chartData = {
    labels: labels, // Use the labels array for the x-axis categories
    datasets: [
      {
        label: "Session ID vs Session duration", // Legend label from screenshot
        data: dataValues,
        borderColor: isDarkTheme ? "#64dcab" : "#96fac8", // light green line color
        backgroundColor: isDarkTheme
          ? "rgba(100, 220, 170, 0.5)"
          : "rgba(150, 250, 200, 0.5)", // light green fill with opacity
        fill: true, // Fill the area under the line
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: isDarkTheme ? "#64dcab" : "#96fac8", // light green points
        pointBorderColor: isDarkTheme ? "#64dcab" : "#96fac8",
      },
    ],
  };

  return (
    <div className="w-full mx-auto h-full">
      <div className="relative h-full pb-10">
        <Line data={chartData} options={getChartOptions(isDarkTheme) as any} />
      </div>
    </div>
  );
};

export default SessionIdVsDurationChart;
