/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale, // Still often registered, but TimeScale takes over for x-axis
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Import TimeScale
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useThemeStore } from "@/store/themeStore";
import "chartjs-adapter-date-fns"; // Import the date adapter

// Register Chart.js components, including TimeScale
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale // Register TimeScale
);

const MultipleFailedLoginAttemptChart = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark"; // Simplified boolean assignment

  // Updated Sample Data: Use Date objects for the 'x' values
  // This allows Chart.js's TimeScale to correctly plot time intervals.
  // The 'y' values are approximated from your screenshot.
  const chartDataPoints = [
    { x: new Date("2025-07-24T08:50:00"), y: 1000 },
    { x: new Date("2025-07-24T08:55:00"), y: 600 },
    { x: new Date("2025-07-24T09:00:00"), y: 950 },
    { x: new Date("2025-07-24T09:05:00"), y: 500 },
    { x: new Date("2025-07-24T09:10:00"), y: 1050 },
    { x: new Date("2025-07-24T09:15:00"), y: 350 },
    { x: new Date("2025-07-24T09:20:00"), y: 580 },
    { x: new Date("2025-07-24T09:25:00"), y: 800 },
    { x: new Date("2025-07-24T09:30:00"), y: 120 },
    { x: new Date("2025-07-24T09:35:00"), y: 450 },
    { x: new Date("2025-07-24T09:40:00"), y: 1000 },
    { x: new Date("2025-07-24T09:45:00"), y: 950 },
    { x: new Date("2025-07-24T09:50:00"), y: 1000 },
  ];

  // Function to get chart options based on theme
  const getChartOptions = (darkTheme: boolean) => {
    const textColor = darkTheme ? "#cbd5e1" : "#475569"; // slate-300 vs slate-600
    const gridColor = darkTheme ? "#334155" : "#e2e8f0"; // slate-700 vs slate-200
    // Using your specific blue from the screenshot (which is #2664EA) for light theme
    // and a fitting blue-400 for dark theme for good contrast.
    const barBackgroundColor = darkTheme ? "#60a5fa" : "#2664EA";

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
            // Updated to format timestamp for tooltip title
            title: function (context: any) {
              // `context[0].parsed.x` gives the timestamp
              const date = new Date(context[0].parsed.x);
              // Format to HH:mm (e.g., 08:50)
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
                label += context.parsed.y; // Or add currency/unit if needed
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          type: "time", // Explicitly set to 'time' scale
          time: {
            unit: "minute", // Display major ticks for minutes
            stepSize: 5, // For 5-minute intervals
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
            // To align labels under the center of the bars for intervals,
            // you typically rely on Chart.js's time scale behavior.
            // 'offset: true' can also be explored if labels seem off-center.
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
      // Styling to match the screenshot's bar appearance
      elements: {
        bar: {
          backgroundColor: barBackgroundColor,
          borderRadius: 2, // Slight border radius for bars
          borderSkipped: false, // Don't skip borders on any side
        },
      },
    };
  };

  const chartData = {
    // Labels array is no longer directly used for x-axis when 'type: "time"' is used.
    // The 'x' property in 'data' objects handles labeling.
    datasets: [
      {
        label: "Time vs user/IP",
        data: chartDataPoints, // Use the data points with 'x' (Date object) and 'y'
        backgroundColor: isDarkTheme ? "#60a5fa" : "#2664EA", // blue-400 for dark, your specific blue for light
        hoverBackgroundColor: isDarkTheme ? "#3b82f6" : "#60a5fa", // blue-500 for dark, blue-400 for light
      },
    ],
  };

  return (
    <div className="w-full mx-auto h-full">
      <div className="relative h-full pb-10">
        <Bar
          data={chartData} // Pass the chartData object directly
          options={getChartOptions(isDarkTheme) as any}
        />
      </div>
    </div>
  );
};

export default MultipleFailedLoginAttemptChart;
