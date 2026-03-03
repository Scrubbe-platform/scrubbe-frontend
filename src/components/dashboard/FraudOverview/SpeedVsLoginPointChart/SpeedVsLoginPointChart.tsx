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
import { Line } from "react-chartjs-2"; // Use Line chart for area with points
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

const SpeedVsLoginpointsChart = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  // Sample data points approximated from your screenshot
  // X-axis looks like a sequential index (1 to 40)
  const chartDataPoints = [];
  // Generating synthetic data to mimic the screenshot's shape
  for (let i = 1; i <= 40; i++) {
    let yValue;
    if (i <= 10) {
      yValue = 350 - Math.abs(i - 5) * 60 + (Math.random() * 50 - 25);
    } else if (i <= 15) {
      yValue = 100 + (i - 10) * 60 + (Math.random() * 50 - 25);
    } else if (i <= 20) {
      yValue = 400 + Math.sin((i - 15) * 0.8) * 200 + (Math.random() * 50 - 25);
    } else if (i <= 25) {
      yValue = 500 + Math.cos((i - 20) * 0.6) * 250 + (Math.random() * 50 - 25);
    } else if (i <= 30) {
      yValue = 300 + (i - 25) * 60 + (Math.random() * 50 - 25);
    } else {
      yValue =
        500 +
        Math.sin((i - 30) * 0.5) * 200 +
        (i - 30) * 20 +
        (Math.random() * 50 - 25);
    }
    chartDataPoints.push({ x: i, y: Math.max(0, yValue) }); // Ensure y is not negative
  }

  console.log(JSON.stringify(chartDataPoints, null, 2));

  // Function to get chart options based on theme
  const getChartOptions = (darkTheme: boolean) => {
    const textColor = darkTheme ? "#cbd5e1" : "#475569"; // slate-300 vs slate-600
    const gridColor = darkTheme ? "#334155" : "#e2e8f0"; // slate-700 vs slate-200
    const areaFillColor = darkTheme
      ? "rgba(96, 165, 250, 0.4)"
      : "rgba(147, 197, 253, 0.4)"; // blue-400 with opacity for dark, blue-300 for light
    const lineColor = darkTheme ? "#60a5fa" : "#93c5fd"; // Corresponding blue line color
    const pointColor = darkTheme ? "#60a5fa" : "#93c5fd"; // Corresponding blue point color

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
                label += context.parsed.y.toFixed(0); // Format Y as whole number
              }
              return label;
            },
            title: function (context: any) {
              return `Index: ${context[0].parsed.x}`; // Show the index for X-axis
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear", // X-axis is linear (numerical index)
          position: "bottom",
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            stepSize: 5, // 1, 5, 10, ... 40
            autoSkip: true, // Allow skipping to prevent overcrowding
            maxTicksLimit: 9, // Adjust as needed
          },
          border: {
            color: gridColor,
          },
          min: 1, // Start x-axis at 1
          max: 40, // End x-axis at 40
        },
        y: {
          type: "linear", // Y-axis is linear (numerical)
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
        label: "Speed(km/h) vs Loginpoints",
        data: chartDataPoints, // Use data points with numerical x
        borderColor: isDarkTheme ? "#60a5fa" : "#93c5fd", // blue line color
        backgroundColor: isDarkTheme
          ? "rgba(96, 165, 250, 0.4)"
          : "rgba(147, 197, 253, 0.4)", // blue fill color with opacity
        fill: true, // Fill the area under the line
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: isDarkTheme ? "#60a5fa" : "#93c5fd", // blue points
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

export default SpeedVsLoginpointsChart;
