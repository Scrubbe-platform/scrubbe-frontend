/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
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

const CountrySeverityScoreChart = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  const labels = [
    "Country 1",
    "Country 2",
    "Country 3",
    "Country 4",
    "Country 5",
  ]; // X-axis labels

  // Data values extracted precisely from the screenshot
  // Segment 1 (Blue - bottom): Consistent height
  const segment1Data = [0.6, 0.6, 0.6, 0.6, 0.6];

  // Segment 2 (Light Blue/Cyan - second from bottom): Consistent height
  const segment2Data = [1.0, 1.0, 1.0, 1.0, 1.0]; // Adds 1.0 to segment1, total 1.6

  // Segment 3 (Green - third from bottom): Consistent height
  const segment3Data = [1.2, 1.2, 1.2, 1.2, 1.2]; // Adds 1.2 to segment2, total 2.8

  // Segment 4 (Grey - top): Varies per country
  const segment4Data = [
    1.0, // Country 1: Total approx 3.8 (2.8 + 1.0)
    0.4, // Country 2: Total approx 3.2 (2.8 + 0.4)
    1.3, // Country 3: Total approx 4.1 (2.8 + 1.3) - tallest bar
    1.0, // Country 4: Total approx 3.8 (2.8 + 1.0)
    1.0, // Country 5: Total approx 3.8 (2.8 + 1.0)
  ];

  // Colors extracted from screenshot and adapted for dark mode
  const blueColorLight = "#6A92EA"; // Bottom blue segment
  const blueColorDark = "#4A69B1";

  const lightBlueCyanColorLight = "#7BD6F3"; // Second from bottom
  const lightBlueCyanColorDark = "#5BA8C2";

  const greenColorLight = "#3AA97D"; // Third from bottom
  const greenColorDark = "#2B7A5C";

  const greyColorLight = "#A9A9A9"; // Top grey segment
  const greyColorDark = "#7F7F7F";

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
          display: false, // No explicit title above the chart area in the screenshot
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: darkTheme
            ? "rgba(30,41,59,0.9)"
            : "rgba(255,255,255,0.9)",
          borderColor: darkTheme ? "#475569" : "#e2e8f0",
          borderWidth: 1,
          titleColor: darkTheme ? "#cbd5e1" : "#1e293b",
          bodyColor: darkTheme ? "#94a3b8" : "#475569",
          callbacks: {
            label: function (context: any) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              // For stacked charts, show the value of the current segment
              if (context.parsed.y !== null) {
                const currentY = context.parsed._stacks.y[context.datasetIndex];
                const prevY =
                  context.parsed._stacks.y[context.datasetIndex - 1] || 0;
                label += (currentY - prevY).toFixed(1); // Display segment value with 1 decimal place
              }
              return label;
            },
            title: function (context: any) {
              return `Country: ${context[0].label}`;
            },
            footer: function (context: any) {
              let sum = 0;
              context.forEach((item: any) => {
                sum += item.parsed.y;
              });
              return `Total: ${sum.toFixed(1)}`; // Show total stack value
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true, // Crucial for stacked bars
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            maxRotation: 0,
            minRotation: 0,
          },
          border: {
            color: gridColor,
          },
        },
        y: {
          stacked: true, // Crucial for stacked bars
          beginAtZero: true,
          max: 4, // Max Y-axis value from screenshot
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            stepSize: 1, // 0, 1, 2, 3, 4 as seen in screenshot
          },
          border: {
            color: gridColor,
          },
        },
      },
      elements: {
        bar: {
          borderRadius: 0, // Bars are sharp as in screenshot
          borderSkipped: false, // No skipped borders
        },
      },
    };
  };

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Segment 1 (Blue)", // Bottom segment
        data: segment1Data,
        backgroundColor: isDarkTheme ? blueColorDark : blueColorLight,
        borderColor: isDarkTheme ? blueColorDark : blueColorLight,
        borderWidth: 1,
        hoverBackgroundColor: isDarkTheme ? "#37528E" : "#8CAFF5",
      },
      {
        label: "Segment 2 (Light Blue)", // Second from bottom
        data: segment2Data,
        backgroundColor: isDarkTheme
          ? lightBlueCyanColorDark
          : lightBlueCyanColorLight,
        borderColor: isDarkTheme
          ? lightBlueCyanColorDark
          : lightBlueCyanColorLight,
        borderWidth: 1,
        hoverBackgroundColor: isDarkTheme ? "#438EA3" : "#93E2FA",
      },
      {
        label: "Segment 3 (Green)", // Third from bottom
        data: segment3Data,
        backgroundColor: isDarkTheme ? greenColorDark : greenColorLight,
        borderColor: isDarkTheme ? greenColorDark : greenColorLight,
        borderWidth: 1,
        hoverBackgroundColor: isDarkTheme ? "#1E5E43" : "#4DBA8C",
      },
      {
        label: "Segment 4 (Grey)", // Top segment
        data: segment4Data,
        backgroundColor: isDarkTheme ? greyColorDark : greyColorLight,
        borderColor: isDarkTheme ? greyColorDark : greyColorLight,
        borderWidth: 1,
        hoverBackgroundColor: isDarkTheme ? "#6A6A6A" : "#BFBFBF",
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

export default CountrySeverityScoreChart;
