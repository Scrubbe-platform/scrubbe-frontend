/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale, // For the categorical X-axis
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Needed for area filling
} from "chart.js";
import { Line } from "react-chartjs-2"; // Use Line chart for area with points
import { useThemeStore } from "@/store/themeStore";

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

const GeoImpossibleLoginChart = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  // Sample data points approximated from your screenshot
  // The labels are categorical (User 01, User 02, etc.)
  const labels = [
    "User 01",
    "User 01",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
    "User 02",
  ];

  const dataValues = [
    550, 400, 780, 400, 500, 380, 450, 350, 450, 220, 300, 580, 480, 550, 850,
    800, 750, 550, 400, 600, 500, 480, 650, 700, 880, 500, 380, 600, 780, 600,
    500, 700, 650, 400, 650, 400, 500, 380, 600, 780, 600, 500, 700, 650, 400,
    650, 400, 500,
  ];

  // Function to get chart options based on theme
  const getChartOptions = (darkTheme: boolean) => {
    const textColor = darkTheme ? "#cbd5e1" : "#475569"; // slate-300 vs slate-600
    const gridColor = darkTheme ? "#334155" : "#e2e8f0"; // slate-700 vs slate-200
    const areaFillColor = darkTheme
      ? "rgba(236, 72, 153, 0.4)"
      : "rgba(236, 72, 153, 0.2)"; // Pink with opacity
    const lineColor = darkTheme ? "#ec4899" : "#ec4899"; // Pink line
    const pointColor = darkTheme ? "#f472b6" : "#db2777"; // Lighter pink for dark, darker pink for light

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
            maxRotation: 0, // Keep labels horizontal to match screenshot
            minRotation: 0,
            autoSkip: true, // Allow skipping to prevent overcrowding
            maxTicksLimit: 10, // Adjust as needed to manage density
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
    labels: labels, // Use the labels array for the x-axis categories
    datasets: [
      {
        label: "User ID vs Location/time",
        data: dataValues,
        borderColor: isDarkTheme ? "#ec4899" : "#ec4899", // Pink line color
        backgroundColor: isDarkTheme
          ? "rgba(236, 72, 153, 0.4)"
          : "rgba(236, 72, 153, 0.2)", // Pink fill color with opacity
        fill: true, // Fill the area under the line
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: isDarkTheme ? "#f472b6" : "#db2777", // Lighter pink for dark, darker pink for light
        pointBorderColor: isDarkTheme ? "#f472b6" : "#db2777",
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

export default GeoImpossibleLoginChart;
