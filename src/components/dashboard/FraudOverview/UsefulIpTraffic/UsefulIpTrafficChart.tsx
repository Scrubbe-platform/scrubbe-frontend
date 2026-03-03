/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useThemeStore } from "@/store/themeStore"; // Assuming you have a theme store

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const UsefulIpTrafficChart = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  // Generate dense time labels (e.g., every minute) for the X-axis
  const generateTimeLabels = () => {
    const labels = [];
    const startHour = 8;
    const startMinute = 30;
    const endHour = 9;
    const endMinute = 10;

    const currentTime = new Date();
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime <= endTime) {
      labels.push(
        currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      currentTime.setMinutes(currentTime.getMinutes() + 1); // Add 1 minute
    }
    return labels;
  };

  const timeLabels = generateTimeLabels();
  const dataPointsCount = timeLabels.length;

  // Simulate predictable network traffic data for different IP addresses (in Mbps)
  // These represent individual IPs that might correspond to the 10.0.0.x range.

  // IP 10.0.0.47 (Base/Background Traffic)
  const ip47Data = timeLabels.map((_, i) =>
    Math.max(0, 5 + Math.sin(i * 0.3) * 2 + (i / dataPointsCount) * 5)
  );

  // IP 10.0.0.48 (Steady Server Traffic)
  const ip48Data = timeLabels.map((_, i) =>
    Math.max(0, 10 + Math.cos(i * 0.2) * 3 + (i / dataPointsCount) * 3)
  );

  // IP 10.0.0.49 (Client with a noticeable data transfer spike)
  const ip49Data = timeLabels.map((_, i) => {
    if (i > 15 && i < 25) {
      // Spike between 8:45 and 8:55
      return Math.max(
        0,
        5 + Math.sin((i - 15) * 0.8) * 15 + (i / dataPointsCount) * 2
      );
    }
    return Math.max(0, 3 + Math.sin(i * 0.5) * 1.5 + (i / dataPointsCount) * 1);
  });

  // IP 10.0.0.50 (Another client, less active but with some burst)
  const ip50Data = timeLabels.map((_, i) => {
    if (i > 30 && i < 35) {
      // Small burst towards the end
      return Math.max(
        0,
        2 + Math.sin((i - 30) * 1) * 8 + (i / dataPointsCount) * 0.5
      );
    }
    return Math.max(0, 1 + Math.cos(i * 0.6) * 1 + (i / dataPointsCount) * 0.5);
  });

  // Ensure no negative values after rounding
  const safeData = (dataArray: number[]) =>
    dataArray.map((val) => Math.max(0, Math.round(val)));

  const finalIp47Data = safeData(ip47Data);
  const finalIp48Data = safeData(ip48Data);
  const finalIp49Data = safeData(ip49Data);
  const finalIp50Data = safeData(ip50Data);

  // Define colors that are distinct and work well in both themes
  // The layers are ordered from bottom to top on the chart.
  const colors = {
    ip47: {
      // Corresponds to the purple-ish layer
      lightFill: "rgba(200, 162, 200, 0.6)", // Light purple
      darkFill: "rgba(128, 0, 128, 0.6)", // Darker purple
      lightBorder: "rgba(148, 0, 211, 1)",
      darkBorder: "rgba(148, 0, 211, 1)",
    },
    ip48: {
      // Corresponds to the blue-green layer
      lightFill: "rgba(120, 200, 180, 0.6)", // Teal
      darkFill: "rgba(0, 128, 128, 0.6)", // Dark teal
      lightBorder: "rgba(0, 139, 139, 1)",
      darkBorder: "rgba(0, 139, 139, 1)",
    },
    ip49: {
      // Corresponds to the light blue layer
      lightFill: "rgba(173, 216, 230, 0.6)", // Light blue
      darkFill: "rgba(70, 130, 180, 0.6)", // Darker blue
      lightBorder: "rgba(100, 149, 237, 1)",
      darkBorder: "rgba(100, 149, 237, 1)",
    },
    ip50: {
      // Corresponds to the dark blue layer
      lightFill: "rgba(100, 149, 237, 0.6)", // Medium blue
      darkFill: "rgba(25, 25, 112, 0.6)", // Navy blue
      lightBorder: "rgba(65, 105, 225, 1)",
      darkBorder: "rgba(65, 105, 225, 1)",
    },
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
          position: "bottom",
          labels: {
            color: textColor,
          },
        },
        title: {
          display: true,
          color: textColor,
          font: {
            size: 16,
          },
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
              // For stacked area charts, display the value of the current segment
              if (context.parsed.y !== null) {
                const currentY = context.parsed._stacks.y[context.datasetIndex];
                const prevY =
                  context.parsed._stacks.y[context.datasetIndex - 1] || 0;
                label += `${Math.round(currentY - prevY)} Mbps`; // Show integer Mbps for the segment
              }
              return label;
            },
            title: function (context: any) {
              return `Time: ${context[0].label}`; // X-axis label is time
            },
            footer: function (context: any) {
              let sum = 0;
              context.forEach((item: any) => {
                sum += item.parsed.y;
              });
              return `Total Traffic: ${Math.round(sum)} Mbps`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true, // Crucial for stacked area
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
            // Custom callback to show only specific time labels (8:30, 8:40, etc.)
            callback: function (value: any, index: number) {
              const label = timeLabels[index];
              if (
                label === "08:30" ||
                label === "08:40" ||
                label === "08:50" ||
                label === "09:00" ||
                label === "09:10"
              ) {
                return label;
              }
              return "";
            },
          },
          border: {
            color: gridColor,
          },
        },
        y: {
          stacked: true, // Crucial for stacked area
          beginAtZero: true,
          min: 0,
          max: 50, // Max traffic volume in Mbps
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            stepSize: 10, // Example step size for Mbps
            callback: function (value: any) {
              return `${Math.round(value)} Mbps`; // Ensure integer ticks for counts
            },
          },
          border: {
            color: gridColor,
          },
        },
      },
      elements: {
        point: {
          radius: 0, // No explicit dots unless hovered
          hoverRadius: 5,
        },
        line: {
          tension: 0.2, // Smoothness of the line, adjust to match fluctuations
          borderWidth: 0, // No line border visible, only fill
        },
      },
      datasets: {
        line: {
          tension: 0.2, // Apply tension to all line datasets
        },
      },
    };
  };

  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: "IP: 10.0.0.47",
        data: finalIp47Data,
        fill: "origin",
        backgroundColor: isDarkTheme
          ? colors.ip47.darkFill
          : colors.ip47.lightFill,
        borderColor: isDarkTheme
          ? colors.ip47.darkBorder
          : colors.ip47.lightBorder,
        pointBackgroundColor: isDarkTheme
          ? colors.ip47.darkBorder
          : colors.ip47.lightBorder,
        pointBorderColor: isDarkTheme
          ? colors.ip47.darkBorder
          : colors.ip47.lightBorder,
        showLine: true,
        pointRadius: 0,
      },
      {
        label: "IP: 10.0.0.48",
        data: finalIp48Data,
        fill: "-1", // Stack on previous dataset
        backgroundColor: isDarkTheme
          ? colors.ip48.darkFill
          : colors.ip48.lightFill,
        borderColor: isDarkTheme
          ? colors.ip48.darkBorder
          : colors.ip48.lightBorder,
        pointBackgroundColor: isDarkTheme
          ? colors.ip48.darkBorder
          : colors.ip48.lightBorder,
        pointBorderColor: isDarkTheme
          ? colors.ip48.darkBorder
          : colors.ip48.lightBorder,
        showLine: true,
        pointRadius: 0,
      },
      {
        label: "IP: 10.0.0.49",
        data: finalIp49Data,
        fill: "-1",
        backgroundColor: isDarkTheme
          ? colors.ip49.darkFill
          : colors.ip49.lightFill,
        borderColor: isDarkTheme
          ? colors.ip49.darkBorder
          : colors.ip49.lightBorder,
        pointBackgroundColor: isDarkTheme
          ? colors.ip49.darkBorder
          : colors.ip49.lightBorder,
        pointBorderColor: isDarkTheme
          ? colors.ip49.darkBorder
          : colors.ip49.lightBorder,
        showLine: true,
        pointRadius: 0,
      },
      {
        label: "IP: 10.0.0.50",
        data: finalIp50Data,
        fill: "-1",
        backgroundColor: isDarkTheme
          ? colors.ip50.darkFill
          : colors.ip50.lightFill,
        borderColor: isDarkTheme
          ? colors.ip50.darkBorder
          : colors.ip50.lightBorder,
        pointBackgroundColor: isDarkTheme
          ? colors.ip50.darkBorder
          : colors.ip50.lightBorder,
        pointBorderColor: isDarkTheme
          ? colors.ip50.darkBorder
          : colors.ip50.lightBorder,
        showLine: true,
        pointRadius: 0,
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

export default UsefulIpTrafficChart;
