/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Needed for area filling
  TimeScale, // For the time-based X-axis
} from "chart.js";
import { Line } from "react-chartjs-2"; // Use Line chart for area with points
import { useThemeStore } from "@/store/themeStore"; // Assuming you have a theme store
import "chartjs-adapter-date-fns"; // Essential for TimeScale to work with date objects

// Register Chart.js components
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Register Filler plugin
  TimeScale // Register TimeScale
);

const TimeVsSessionTokensChart = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  // Sample data points approximated from your screenshot for "Time vs session tokens"
  // Note: Y-axis labels in your image were unreadable, so a generic scale (0-1000) is used.
  const chartDataPoints = [
    { x: new Date("2025-07-28T08:30:00"), y: 200 },
    { x: new Date("2025-07-28T08:33:00"), y: 300 },
    { x: new Date("2025-07-28T08:36:00"), y: 250 },
    { x: new Date("2025-07-28T08:39:00"), y: 350 },
    { x: new Date("2025-07-28T08:42:00"), y: 280 },
    { x: new Date("2025-07-28T08:45:00"), y: 200 },
    { x: new Date("2025-07-28T08:48:00"), y: 950 }, // The large peak
    { x: new Date("2025-07-28T08:51:00"), y: 300 },
    { x: new Date("2025-07-28T08:54:00"), y: 400 },
    { x: new Date("2025-07-28T08:57:00"), y: 300 },
    { x: new Date("2025-07-28T09:00:00"), y: 250 },
    { x: new Date("2025-07-28T09:03:00"), y: 350 },
    { x: new Date("2025-07-28T09:06:00"), y: 280 },
    { x: new Date("2025-07-28T09:09:00"), y: 300 },
    { x: new Date("2025-07-28T09:12:00"), y: 200 },
  ];

  // Function to get chart options based on theme
  const getChartOptions = (darkTheme: boolean) => {
    const textColor = darkTheme ? "#cbd5e1" : "#475569"; // slate-300 vs slate-600
    const gridColor = darkTheme ? "#334155" : "#e2e8f0"; // slate-700 vs slate-200
    // Using blue shades similar to the screenshot
    const areaFillColor = darkTheme
      ? "rgba(96, 165, 250, 0.4)"
      : "rgba(147, 197, 253, 0.4)"; // blue-400/300 with opacity
    const lineColor = darkTheme ? "#60a5fa" : "#93c5fd"; // blue-400/300
    const pointColor = darkTheme ? "#60a5fa" : "#93c5fd";

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
            title: function (context: any) {
              const date = new Date(context[0].parsed.x);
              return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hourCycle: "h23",
              });
            },
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
          type: "time", // Set x-axis type to 'time'
          time: {
            unit: "minute", // Display major ticks for minutes
            stepSize: 10, // For 10-minute intervals (8:30, 8:40, etc.)
            displayFormats: {
              minute: "HH:mm", // Format for labels (e.g., 08:30)
            },
            tooltipFormat: "HH:mm", // Format for tooltip display
          },
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
          max: 1000, // Assuming a max value to fit the visual, as labels were unreadable
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            stepSize: 250, // 0, 250, 500, 750, 1000
          },
          border: {
            color: gridColor,
          },
        },
      },
      elements: {
        point: {
          radius: 0, // No points are visible on the line in the screenshot
          hoverRadius: 5, // Show points on hover for interactivity
          backgroundColor: pointColor,
          borderColor: pointColor,
        },
        line: {
          tension: 0.4, // Smoothness of the line, as seen in the screenshot
          borderWidth: 1.5, // Line thickness
          borderColor: lineColor,
          fill: true, // Crucial for area chart
          backgroundColor: areaFillColor,
        },
      },
    };
  };

  const chartData = {
    datasets: [
      {
        label: "Time vs session tokens",
        data: chartDataPoints, // Use data points with Date objects for x
        borderColor: isDarkTheme ? "#60a5fa" : "#93c5fd", // blue line color
        backgroundColor: isDarkTheme
          ? "rgba(96, 165, 250, 0.4)"
          : "rgba(147, 197, 253, 0.4)", // blue fill color with opacity
        fill: true, // Fill the area under the line
        pointRadius: 0, // No points by default
        pointHoverRadius: 5,
        pointBackgroundColor: isDarkTheme ? "#60a5fa" : "#93c5fd", // blue points on hover
        pointBorderColor: isDarkTheme ? "#60a5fa" : "#93c5fd",
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

export default TimeVsSessionTokensChart;
