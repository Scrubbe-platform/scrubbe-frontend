/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale, // For the categorical X-axis (API endpoints)
  LinearScale, // For the numerical Y-axis (access frequency)
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

const ApiEndpointsAccessFrequencyChart = () => {
  const chartRef = useRef<ChartJS>(null); // Ref to access the Chart.js instance
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  // Exact data from your screenshot
  const labels = ["API 1", "API 2", "API 3", "API 4", "API 5"];

  const dataValues = [
    10, // For API 1
    20, // For API 2
    10, // For API 3
    16, // For API 4 (approximated from image)
    6, // For API 5 (approximated from image)
  ];

  // Function to create a linear gradient for the bars
  const createBarGradient = (
    ctx: CanvasRenderingContext2D,
    chartArea: any,
    darkTheme: boolean
  ) => {
    if (!chartArea) return null; // Ensure chartArea is defined

    const gradient = ctx.createLinearGradient(
      0,
      chartArea.bottom,
      0,
      chartArea.top
    );

    // Colors matching the teal/light blue gradient in your screenshot
    const topColorLight = "#00C9B7"; // A darker teal for the top
    const bottomColorLight = "#FFFF"; // A lighter teal for the bottom

    const topColorDark = "#00796B"; // Darker teal for dark mode top
    const bottomColorDark = "#4DB6AC"; // Lighter teal for dark mode bottom

    if (darkTheme) {
      gradient.addColorStop(0, bottomColorDark);
      gradient.addColorStop(1, topColorDark);
    } else {
      gradient.addColorStop(0, bottomColorLight);
      gradient.addColorStop(1, topColorLight);
    }

    return gradient;
  };

  // Function to get chart options based on theme
  const getChartOptions = (darkTheme: boolean) => {
    const textColor = darkTheme ? "#cbd5e1" : "#475569"; // slate-300 vs slate-600
    const gridColor = darkTheme ? "#334155" : "#e2e8f0"; // slate-700 vs slate-200

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
              return `API: ${context[0].label}`;
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
        bar: {
          borderRadius: 0, // No border radius, bars are sharp as in screenshot
          borderSkipped: false, // Don't skip borders on any side
        },
      },
    };
  };

  const chartData = {
    labels: labels, // Use the labels array for the x-axis categories
    datasets: [
      {
        label: "API endpoints vs access frequency", // Legend label from screenshot
        data: dataValues,
        // The background color will be set dynamically via effect for gradient
        borderColor: isDarkTheme ? "#00796B" : "#00B8D9", // A solid border color for definition
        borderWidth: 1, // Add a slight border for definition
        hoverBackgroundColor: isDarkTheme ? "#004D40" : "#00838F", // Slightly different on hover for feedback
        barThickness: 50, // Adjust bar thickness as needed
        categoryPercentage: 0.7, // Adjust space between bars
        barPercentage: 0.8,
      },
    ],
  };

  // Effect to apply the gradient once the chart is rendered
  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      const chartDataset = chart.data.datasets[0];
      const gradient = createBarGradient(
        chart.ctx,
        chart.chartArea,
        isDarkTheme
      );
      if (gradient) {
        chartDataset.backgroundColor = gradient;
        chart.update(); // Update chart to apply the new background
      }
    }
  }, [isDarkTheme]); // Re-run if theme changes

  return (
    <div className="w-full mx-auto h-full">
      <div className="relative h-full pb-10">
        <Bar
          ref={chartRef as any}
          data={chartData}
          options={getChartOptions(isDarkTheme) as any}
        />
      </div>
    </div>
  );
};

export default ApiEndpointsAccessFrequencyChart;
