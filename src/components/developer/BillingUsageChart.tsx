// components/UsageChart.tsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useThemeStore } from "@/store/themeStore";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const UsageChart: React.FC = () => {
  const { theme } = useThemeStore();

  const isDarkTheme = theme == "dark";
  // Define colors based on theme
  const textColor = isDarkTheme ? "#E5E7EB" : "#4B5563"; // gray-200 / gray-700
  const gridColor = isDarkTheme ? "#4B556355" : "#E5E7EB"; // gray-600 with transparency / gray-200

  const data = {
    labels: [
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "March",
      "April",
      "May",
    ],
    datasets: [
      {
        type: "bar" as const,
        label: "API Calls",
        backgroundColor: "#3B82F6", // blue-500
        data: [
          61000, 55000, 8000, 34000, 50000, 80000, 49000, 3000, 78000, 5000,
        ], // Approximate values from screenshot
        borderColor: "white", // Not visible for bars but good practice
        borderWidth: 0,
        yAxisID: "y",
        borderRadius: 4, // To match the rounded corners of bars
      },
      {
        type: "line" as const,
        label: "Monthly Cost($)",
        borderColor: "#EF4444", // red-500
        borderWidth: 2,
        fill: false,
        data: [200, 200, 180, 210, 250, 290, 180, 250, 290, 150], // Approximate values from screenshot
        yAxisID: "y1",
        pointBackgroundColor: "#EF4444", // red-500
        pointBorderColor: "#EF4444",
        pointBorderWidth: 1,
        pointRadius: 4,
        tension: 0.3, // To give a slight curve
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows flexible height
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: textColor, // Legend text color
          usePointStyle: true, // Use point style for line, rectangle for bar
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: isDarkTheme
          ? "rgba(31, 41, 55, 0.9)"
          : "rgba(255, 255, 255, 0.9)", // gray-800 / white
        titleColor: isDarkTheme ? "#E5E7EB" : "#1F2937", // gray-200 / gray-900
        bodyColor: isDarkTheme ? "#D1D5DB" : "#374151", // gray-300 / gray-700
        borderColor: isDarkTheme ? "#4B5563" : "#D1D5DB", // gray-600 / gray-300
        borderWidth: 1,
        cornerRadius: 4,
        displayColors: true,
      },
      title: {
        display: false, // We'll handle the title outside the chart
      },
    },
    scales: {
      x: {
        // X-axis (Months)
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
          drawBorder: false, // Hide x-axis border line
        },
      },
      y: {
        // Left Y-axis (API Calls)
        type: "linear" as const,
        position: "left" as const,
        title: {
          display: true,
          text: "API Calls",
          color: textColor,
        },
        ticks: {
          color: textColor,
          beginAtZero: true,
          // formatter for thousands
          callback: function (value: number) {
            if (value >= 1000) {
              return value / 1000 + "k";
            }
            return value;
          },
        },
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        min: 0,
        max: 80000, // Based on screenshot
      },
      y1: {
        // Right Y-axis (Cost($))
        type: "linear" as const,
        position: "right" as const,
        title: {
          display: true,
          text: "Cost($)",
          color: textColor,
        },
        ticks: {
          color: textColor,
          beginAtZero: true,
          callback: function (value: number) {
            return "$" + value;
          },
        },
        grid: {
          drawOnChartArea: false, // Only show grid lines for the left Y-axis
          drawBorder: false,
        },
        min: 0,
        max: 300, // Based on screenshot
      },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Bar data={data as any} options={options as any} />;
};

export default UsageChart;
