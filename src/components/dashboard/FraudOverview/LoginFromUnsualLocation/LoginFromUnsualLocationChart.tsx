/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Chart as ChartJS,
  LinearScale, // For both X and Y axes as they are numerical
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Needed for area filling
} from "chart.js";
import { Scatter } from "react-chartjs-2"; // Using Scatter to allow arbitrary x-values
import { useThemeStore } from "@/store/themeStore";

// Register Chart.js components
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Register Filler plugin
);

const LoginFromUnsualLocationChart = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  // Sample data points approximated from your screenshot
  // Each dataset represents a layer in the stacked area chart
  // The 'x' values are continuous numerical, 'y' values are counts/magnitudes
  const dataset1 = []; // Bottom layer (Teal/Green points)
  const dataset2 = []; // Middle layer (Red points)
  const dataset3 = []; // Top layer (Blue points)

  // Generate synthetic data to mimic the screenshot pattern
  // For a real app, this data would come from your backend
  const numPoints = 60; // Total number of data points
  const xStart = -80;
  const xEnd = 160;

  for (let i = 0; i < numPoints; i++) {
    const x =
      xStart + (i / numPoints) * (xEnd - xStart) + (Math.random() * 5 - 2.5); // Slightly randomized x
    // Base layer (green/teal)
    const y1 = Math.max(0, 5 + Math.random() * 5 + Math.sin(x / 10) * 3);
    dataset1.push({ x: x, y: y1 });

    // Middle layer (red) - adds on top of y1
    const y2 = y1 + (5 + Math.random() * 5 + Math.cos(x / 8) * 4);
    dataset2.push({ x: x, y: y2 });

    // Top layer (blue) - adds on top of y2
    const y3 = y2 + (5 + Math.random() * 10 + Math.sin(x / 5) * 5);
    dataset3.push({ x: x, y: y3 });
  }

  // Sort data by x-value to ensure correct line/area drawing
  dataset1.sort((a, b) => a.x - b.x);
  dataset2.sort((a, b) => a.x - b.x);
  dataset3.sort((a, b) => a.x - b.x);

  // Function to get chart options based on theme
  const getChartOptions = (darkTheme: boolean) => {
    const textColor = darkTheme ? "#cbd5e1" : "#475569"; // slate-300 vs slate-600
    const gridColor = darkTheme ? "#334155" : "#e2e8f0"; // slate-700 vs slate-200

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
            label: function (context: any) {
              const label = context.dataset.label || "";
              if (label) {
                return `${label}: X ${context.parsed.x.toFixed(
                  3
                )}, Y ${context.parsed.y.toFixed(0)}`;
              }
              return `X ${context.parsed.x.toFixed(
                3
              )}, Y ${context.parsed.y.toFixed(0)}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear", // X-axis is linear (numerical, not time or category)
          position: "bottom",
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            // You can format ticks if they represent specific coordinates or ranges
            callback: function (value: any, index: number, ticks: any[]) {
              console.log(index, ticks);
              return Number(value).toFixed(3); // Format to 3 decimal places
            },
          },
          border: {
            color: gridColor,
          },
          // Adjust min/max if your data doesn't span the full visible range
          // min: -75, // Example min
          // max: 165, // Example max
        },
        y: {
          type: "linear", // Y-axis is linear (numerical)
          beginAtZero: true,
          max: 60, // Based on your screenshot's y-axis max
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            stepSize: 15, // 0, 15, 30, 45, 60
          },
          border: {
            color: gridColor,
          },
        },
      },
      elements: {
        point: {
          radius: 3, // Point size
          hoverRadius: 5,
        },
        line: {
          tension: 0.4, // Smoothness of the line
          borderWidth: 1.5, // Line thickness
        },
      },
    };
  };

  const chartData = {
    datasets: [
      {
        label: "Geocoordinates vs user", // Legend for the entire chart (as shown in your screenshot)
        data: dataset3, // The top-most layer represents the total sum in a stacked chart
        backgroundColor: isDarkTheme
          ? "rgba(96, 165, 250, 0.4)" // blue-400 with opacity for dark theme
          : "rgba(147, 197, 253, 0.4)", // blue-300 with opacity for light theme (base fill)
        borderColor: isDarkTheme ? "#60a5fa" : "#93c5fd", // Corresponding border color for the top layer
        fill: "origin", // Fill from origin (bottom of the chart)
        pointBackgroundColor: isDarkTheme ? "#60a5fa" : "#4299E1", // Blue points for top layer
        pointBorderColor: isDarkTheme ? "#60a5fa" : "#4299E1",
      },
      {
        label: "Middle Layer", // Internal label, might not be shown if only one legend entry is desired
        data: dataset2,
        backgroundColor: isDarkTheme
          ? "rgba(239, 68, 68, 0.4)" // red-500 with opacity for dark theme
          : "rgba(252, 129, 129, 0.4)", // red-300 with opacity for light theme
        borderColor: isDarkTheme ? "#ef4444" : "#fc8181", // Red border color
        fill: "-1", // Fill from the previous dataset (stacking)
        pointBackgroundColor: isDarkTheme ? "#ef4444" : "#E53E3E", // Red points
        pointBorderColor: isDarkTheme ? "#ef4444" : "#E53E3E",
      },
      {
        label: "Bottom Layer", // Internal label
        data: dataset1,
        backgroundColor: isDarkTheme
          ? "rgba(20, 184, 166, 0.4)" // teal-500 with opacity for dark theme
          : "rgba(56, 161, 105, 0.4)", // green-500 (similar to teal) with opacity for light theme
        borderColor: isDarkTheme ? "#14b8a6" : "#38a169", // Teal/Green border color
        fill: "origin", // This layer fills from the chart's origin
        pointBackgroundColor: isDarkTheme ? "#14b8a6" : "#319795", // Teal/Green points
        pointBorderColor: isDarkTheme ? "#14b8a6" : "#319795",
      },
    ].reverse(), // Reverse order so bottom layer is drawn first, then middle, then top for stacking
  };

  return (
    <div className="w-full mx-auto h-full">
      <div className="relative h-full pb-10">
        <Scatter
          data={chartData}
          options={getChartOptions(isDarkTheme) as any}
        />
      </div>
    </div>
  );
};

export default LoginFromUnsualLocationChart;
