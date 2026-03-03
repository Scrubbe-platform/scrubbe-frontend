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
import { useThemeStore } from "@/store/themeStore";
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

const PasswordGuessChart = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  // Sample data points approximated from your screenshot
  // Use Date objects for 'x' values for the TimeScale
  const chartDataPoints = [
    { x: new Date("2025-07-24T08:50:00"), y: 550 },
    { x: new Date("2025-07-24T08:51:00"), y: 400 },
    { x: new Date("2025-07-24T08:52:00"), y: 250 },
    { x: new Date("2025-07-24T08:53:00"), y: 500 },
    { x: new Date("2025-07-24T08:54:00"), y: 450 },
    { x: new Date("2025-07-24T08:55:00"), y: 250 },
    { x: new Date("2025-07-24T08:56:00"), y: 600 },
    { x: new Date("2025-07-24T08:57:00"), y: 400 },
    { x: new Date("2025-07-24T08:58:00"), y: 280 },
    { x: new Date("2025-07-24T08:59:00"), y: 580 },
    { x: new Date("2025-07-24T09:00:00"), y: 780 },
    { x: new Date("2025-07-24T09:01:00"), y: 420 },
    { x: new Date("2025-07-24T09:02:00"), y: 350 },
    { x: new Date("2025-07-24T09:03:00"), y: 200 },
    { x: new Date("2025-07-24T09:04:00"), y: 280 },
    { x: new Date("2025-07-24T09:05:00"), y: 180 },
    { x: new Date("2025-07-24T09:06:00"), y: 300 },
    { x: new Date("2025-07-24T09:07:00"), y: 580 },
    { x: new Date("2025-07-24T09:08:00"), y: 480 },
    { x: new Date("2025-07-24T09:09:00"), y: 550 },
    { x: new Date("2025-07-24T09:10:00"), y: 850 },
    { x: new Date("2025-07-24T09:11:00"), y: 800 },
    { x: new Date("2025-07-24T09:12:00"), y: 750 },
    { x: new Date("2025-07-24T09:13:00"), y: 550 },
    { x: new Date("2025-07-24T09:14:00"), y: 400 },
    { x: new Date("2025-07-24T09:15:00"), y: 600 },
    { x: new Date("2025-07-24T09:16:00"), y: 500 },
    { x: new Date("2025-07-24T09:17:00"), y: 480 },
    { x: new Date("2025-07-24T09:18:00"), y: 650 },
    { x: new Date("2025-07-24T09:19:00"), y: 700 },
    { x: new Date("2025-07-24T09:20:00"), y: 880 },
    { x: new Date("2025-07-24T09:21:00"), y: 500 },
    { x: new Date("2025-07-24T09:22:00"), y: 380 },
    { x: new Date("2025-07-24T09:23:00"), y: 600 },
    { x: new Date("2025-07-24T09:24:00"), y: 780 },
    { x: new Date("2025-07-24T09:25:00"), y: 600 },
    { x: new Date("2025-07-24T09:26:00"), y: 500 },
    { x: new Date("2025-07-24T09:27:00"), y: 700 },
    { x: new Date("2025-07-24T09:28:00"), y: 650 },
    { x: new Date("2025-07-24T09:29:00"), y: 400 },
    { x: new Date("2025-07-24T09:30:00"), y: 650 },
  ];

  // Function to get chart options based on theme
  const getChartOptions = (darkTheme: boolean) => {
    const textColor = darkTheme ? "#cbd5e1" : "#475569"; // slate-300 vs slate-600
    const gridColor = darkTheme ? "#334155" : "#e2e8f0"; // slate-700 vs slate-200
    const areaFillColor = darkTheme
      ? "rgba(20, 184, 166, 0.4)"
      : "rgba(56, 161, 105, 0.4)"; // Teal/Green with opacity
    const lineColor = darkTheme ? "#14b8a6" : "#38a169"; // Teal/Green line
    const pointColor = darkTheme ? "#14b8a6" : "#319795"; // Teal/Green points

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
            stepSize: 5, // For 5-minute intervals like in your screenshot
            displayFormats: {
              minute: "HH:mm", // Format for labels (e.g., 08:50)
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
          max: 1000, // Based on your screenshot's y-axis max
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
          radius: 3, // Size of the points
          hoverRadius: 5,
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
        label: "Time vs number of attempts",
        data: chartDataPoints, // Use data points with Date objects for x
        borderColor: isDarkTheme ? "#14b8a6" : "#38a169", // Teal/Green line color
        backgroundColor: isDarkTheme
          ? "rgba(20, 184, 166, 0.4)"
          : "rgba(56, 161, 105, 0.4)", // Teal/Green fill color with opacity
        fill: true, // Fill the area under the line
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: isDarkTheme ? "#14b8a6" : "#319795", // Teal/Green points
        pointBorderColor: isDarkTheme ? "#14b8a6" : "#319795",
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

export default PasswordGuessChart;
