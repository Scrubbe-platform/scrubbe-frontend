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
  Filler,
  TimeScale, // For the time-based X-axis
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useThemeStore } from "@/store/themeStore"; // Assuming you have a theme store
import "chartjs-adapter-date-fns"; // Essential for TimeScale

// Register Chart.js components
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const UserVsTimeOfDayChart = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  // Generate highly fluctuating data to mimic the "spiky" appearance
  const generateSpikyData = (
    startTime: string,
    endTime: string,
    baseValue: number,
    fluctuation: number,
    numPoints: number
  ) => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const step = (end - start) / (numPoints - 1);
    const data = [];

    for (let i = 0; i < numPoints; i++) {
      const time = new Date(start + i * step);
      const value = baseValue + (Math.random() - 0.5) * fluctuation * 2;
      data.push({ x: time, y: Math.max(0, value) }); // Ensure no negative values
    }
    return data;
  };

  const startTime = "2025-07-28T08:30:00";
  const endTime = "2025-07-28T09:10:00";
  const numDataPoints = 80; // More points for a spikier look

  // Data for the bottom (blue) layer
  const blueLayerData = generateSpikyData(
    startTime,
    endTime,
    10,
    5,
    numDataPoints
  );
  // Data for the middle (orange) layer, stacked on blue
  const orangeLayerData = generateSpikyData(
    startTime,
    endTime,
    8,
    4,
    numDataPoints
  );
  // Data for the top (red) layer, stacked on orange
  const redLayerData = generateSpikyData(
    startTime,
    endTime,
    7,
    3.5,
    numDataPoints
  );

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
                // For stacked charts, tooltip shows current segment's value
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
            unit: "minute",
            stepSize: 10, // 10-minute intervals
            displayFormats: {
              minute: "HH:mm", // Format as 08:30
            },
            tooltipFormat: "HH:mm",
          },
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
          stacked: true, // Crucial for stacked area chart
          beginAtZero: true,
          max: 60, // Max Y-axis value from screenshot
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            stepSize: 15, // 0, 15, 30, 45, 60 as seen in screenshot
            // Custom callback to mimic the "User-367" label from the screenshot
            callback: function (value: any) {
              if (value === 0) return 0; // Keep 0 as number
              return "User-367";
            },
          },
          border: {
            color: gridColor,
          },
        },
      },
      elements: {
        point: {
          radius: 0, // No points are visible in the screenshot
          hoverRadius: 5, // Show points on hover for interactivity
        },
        line: {
          tension: 0.1, // Very low tension for "spiky" appearance
          borderWidth: 1.5, // Line thickness
          fill: true, // Crucial for area chart
        },
      },
    };
  };

  const chartData = {
    datasets: [
      {
        label: "Bottom Layer", // You might want to rename these labels based on what they represent
        data: blueLayerData,
        backgroundColor: isDarkTheme
          ? "rgba(70, 130, 180, 0.7)"
          : "rgba(173, 216, 230, 0.7)", // SteelBlue / LightBlue
        borderColor: isDarkTheme ? "#4682b4" : "#add8e6", // Darker shades for border
        pointBackgroundColor: isDarkTheme ? "#4682b4" : "#add8e6",
        pointBorderColor: isDarkTheme ? "#4682b4" : "#add8e6",
        stack: "combined", // All datasets in the same stack
      },
      {
        label: "Middle Layer",
        data: orangeLayerData,
        backgroundColor: isDarkTheme
          ? "rgba(255, 165, 0, 0.7)"
          : "rgba(255, 195, 100, 0.7)", // Orange / Lighter Orange
        borderColor: isDarkTheme ? "#ffa500" : "#ffc364",
        pointBackgroundColor: isDarkTheme ? "#ffa500" : "#ffc364",
        pointBorderColor: isDarkTheme ? "#ffa500" : "#ffc364",
        stack: "combined",
      },
      {
        label: "Top Layer",
        data: redLayerData,
        backgroundColor: isDarkTheme
          ? "rgba(220, 20, 60, 0.7)"
          : "rgba(255, 99, 71, 0.7)", // Crimson / Tomato
        borderColor: isDarkTheme ? "#dc143c" : "#ff6347",
        pointBackgroundColor: isDarkTheme ? "#dc143c" : "#ff6347",
        pointBorderColor: isDarkTheme ? "#dc143c" : "#ff6347",
        stack: "combined",
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

export default UserVsTimeOfDayChart;
