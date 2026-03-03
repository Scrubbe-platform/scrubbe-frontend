/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect } from "react";
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

const IpAddressDetectionFlagsChart = () => {
  const chartRef = useRef<ChartJS>(null);
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  // The X-axis labels are all the same, as per the screenshot
  const labels = [
    "192.168.1.100",
    "192.168.1.100",
    "192.168.1.100",
    "192.168.1.100",
    "192.168.1.100",
  ];

  // We need to map the categorical Y-axis labels to numerical values.
  // Let's assign numerical values:
  // suspicious: 1
  // Malicious: 2
  // blocked: 3
  // Under review: 4
  // Based on the bar heights relative to these labels:
  const dataValues = [
    3.7, // Bar 1: Just below "Under review" (4)
    3.3, // Bar 2: Below "blocked" (3), closer to 3 than 4
    2.4, // Bar 3: Below "Malicious" (2), closer to 2 than 3
    3.6, // Bar 4: Just below "Under review" (4)
    4.1, // Bar 5: Slightly above "Under review" (4) - this seems to be the max
  ];

  // Function to create a linear gradient for the bars
  const createBarGradient = (
    ctx: CanvasRenderingContext2D,
    chartArea: any,
    darkTheme: boolean
  ) => {
    if (!chartArea) return null;

    const gradient = ctx.createLinearGradient(
      0,
      chartArea.bottom,
      0,
      chartArea.top
    );

    // Colors matching the purple gradient in your screenshot
    // From bottom (lighter purple) to top (darker purple)
    const bottomColorLight = "#D8BFD8"; // Thistle (lighter purple)
    const topColorLight = "#7826EA"; // Purple (darker purple)

    const bottomColorDark = "#4B0082"; // Indigo (darker purple for dark theme)
    const topColorDark = "#BA55D3"; // MediumOrchid (lighter purple for dark theme)

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
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(1); // Display value with one decimal
              }
              return label;
            },
            title: function (context: any) {
              return `IP: ${context[0].label}`;
            },
          },
        },
      },
      scales: {
        x: {
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
            // Custom callback to map numerical values to categorical labels on Y-axis
            callback: function (value: any) {
              if (value === 1) return "suspicious";
              if (value === 2) return "Malicious";
              if (value === 3) return "blocked";
              if (value === 4) return "Under review";
              return ""; // For 0, or any other values not explicitly mapped
            },
          },
          border: {
            color: gridColor,
          },
        },
      },
      elements: {
        bar: {
          borderRadius: 0, // Bars are sharp as in screenshot
          borderSkipped: false,
        },
      },
    };
  };

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "IP address vs detection flags", // Legend label from screenshot
        data: dataValues,
        // Background color will be set by the gradient
        borderColor: isDarkTheme ? "#BA55D3" : "#800080", // Border color for definition
        borderWidth: 1,
        hoverBackgroundColor: isDarkTheme ? "#8A2BE2" : "#9932CC", // Slightly different on hover
        barThickness: 50, // Adjust bar thickness as needed
        categoryPercentage: 0.7, // Adjust space between bars
        barPercentage: 0.8,
      },
    ],
  };

  // Effect to apply the gradient once the chart is rendered or theme changes
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

export default IpAddressDetectionFlagsChart;
