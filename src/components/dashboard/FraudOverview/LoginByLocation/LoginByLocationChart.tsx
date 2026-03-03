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

const LoginByLocationChart = () => {
  // Renamed component for clarity
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
  const dataPointsCount = timeLabels.length; // 41 data points for a 40-minute range

  // --- Start of Predictable Data Generation ---

  // Base data array, starting with a steady base and then slight increase
  const baseData = Array.from(
    { length: dataPointsCount },
    (_, i) => 20 + i * 0.5
  );

  // Layer 1: London - Consistent low activity, slight increase
  const londonData = baseData.map((val, i) =>
    Math.round(val * 0.2 + (i < 20 ? 0 : (i - 20) * 0.1))
  );

  // Layer 2: Nigeria - Starts low, increases significantly in the middle
  const nigeriaData = baseData.map((val, i) => {
    if (i < 10) return Math.round(val * 0.1);
    if (i < 30) return Math.round(val * 0.3 + (i - 10) * 0.8);
    return Math.round(val * 0.3 + (30 - 10) * 0.8 - (i - 30) * 0.5);
  });

  // Layer 3: Israel - Steady activity with a clear dip in the middle
  const israelData = baseData.map((val, i) => {
    if (i < 15) return Math.round(val * 0.15);
    if (i < 25) return Math.round(val * 0.05); // Dip
    return Math.round(val * 0.15 + (i - 25) * 0.2);
  });

  // Layer 4: Japan - Gradually increasing activity
  const japanData = baseData.map((val, i) => Math.round(val * 0.25 + i * 0.4));

  // Layer 5: America - Starts high, decreases then increases slightly
  const americaData = baseData.map((val, i) => {
    if (i < 15) return Math.round(val * 0.3 - i * 0.5);
    if (i < 30) return Math.round(val * 0.15);
    return Math.round(val * 0.2 + (i - 30) * 0.3);
  });

  // Ensure no negative values after rounding
  const safeData = (dataArray: number[]) =>
    dataArray.map((val) => Math.max(0, val));

  const finalLondonData = safeData(londonData);
  const finalNigeriaData = safeData(nigeriaData);
  const finalIsraelData = safeData(israelData);
  const finalJapanData = safeData(japanData);
  const finalAmericaData = safeData(americaData);

  // --- End of Predictable Data Generation ---

  // Define colors that are distinct and work well in both themes
  // Layer order: London (bottom), Nigeria, Israel, Japan, America (top)
  const colors = {
    london: {
      lightFill: "rgba(173, 216, 230, 0.6)", // Light blue for London
      darkFill: "rgba(70, 130, 180, 0.6)",
      lightBorder: "rgba(100, 149, 237, 1)",
      darkBorder: "rgba(100, 149, 237, 1)",
    },
    nigeria: {
      lightFill: "rgba(144, 238, 144, 0.6)", // Light green for Nigeria
      darkFill: "rgba(60, 179, 113, 0.6)",
      lightBorder: "rgba(50, 205, 50, 1)",
      darkBorder: "rgba(50, 205, 50, 1)",
    },
    israel: {
      lightFill: "rgba(255, 192, 203, 0.6)", // Pink for Israel
      darkFill: "rgba(199, 21, 133, 0.6)",
      lightBorder: "rgba(255, 99, 132, 1)",
      darkBorder: "rgba(255, 99, 132, 1)",
    },
    japan: {
      lightFill: "rgba(255, 255, 153, 0.6)", // Light yellow for Japan
      darkFill: "rgba(218, 165, 32, 0.6)",
      lightBorder: "rgba(255, 215, 0, 1)",
      darkBorder: "rgba(255, 215, 0, 1)",
    },
    america: {
      lightFill: "rgba(153, 102, 204, 0.6)", // Medium purple for America
      darkFill: "rgba(128, 0, 128, 0.6)",
      lightBorder: "rgba(75, 0, 130, 1)",
      darkBorder: "rgba(75, 0, 130, 1)",
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
          position: "bottom", // As seen in your screenshot
          labels: {
            color: textColor,
          },
        },
        title: {
          display: true, // Display a clear title
          color: textColor,
          font: {
            size: 16,
          },
        },
        tooltip: {
          mode: "index",
          intersect: false, // Show tooltip for all datasets at that index
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
                label += Math.round(currentY - prevY); // Show integer count of logins for the segment
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
              return `Total Logins: ${Math.round(sum)}`;
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
          max: 100, // Adjust max based on expected total login volume
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            stepSize: 10, // Example step size for number of logins
            callback: function (value: any) {
              return Math.round(value); // Ensure integer ticks for counts
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
        label: "London",
        data: finalLondonData,
        fill: "origin",
        backgroundColor: isDarkTheme
          ? colors.london.darkFill
          : colors.london.lightFill,
        borderColor: isDarkTheme
          ? colors.london.darkBorder
          : colors.london.lightBorder,
        pointBackgroundColor: isDarkTheme
          ? colors.london.darkBorder
          : colors.london.lightBorder,
        pointBorderColor: isDarkTheme
          ? colors.london.darkBorder
          : colors.london.lightBorder,
        showLine: true,
        pointRadius: 0,
      },
      {
        label: "Nigeria",
        data: finalNigeriaData,
        fill: "-1", // Stack on previous dataset
        backgroundColor: isDarkTheme
          ? colors.nigeria.darkFill
          : colors.nigeria.lightFill,
        borderColor: isDarkTheme
          ? colors.nigeria.darkBorder
          : colors.nigeria.lightBorder,
        pointBackgroundColor: isDarkTheme
          ? colors.nigeria.darkBorder
          : colors.nigeria.lightBorder,
        pointBorderColor: isDarkTheme
          ? colors.nigeria.darkBorder
          : colors.nigeria.lightBorder,
        showLine: true,
        pointRadius: 0,
      },
      {
        label: "Israel",
        data: finalIsraelData,
        fill: "-1",
        backgroundColor: isDarkTheme
          ? colors.israel.darkFill
          : colors.israel.lightFill,
        borderColor: isDarkTheme
          ? colors.israel.darkBorder
          : colors.israel.lightBorder,
        pointBackgroundColor: isDarkTheme
          ? colors.israel.darkBorder
          : colors.israel.lightBorder,
        pointBorderColor: isDarkTheme
          ? colors.israel.darkBorder
          : colors.israel.lightBorder,
        showLine: true,
        pointRadius: 0,
      },
      {
        label: "Japan",
        data: finalJapanData,
        fill: "-1",
        backgroundColor: isDarkTheme
          ? colors.japan.darkFill
          : colors.japan.lightFill,
        borderColor: isDarkTheme
          ? colors.japan.darkBorder
          : colors.japan.lightBorder,
        pointBackgroundColor: isDarkTheme
          ? colors.japan.darkBorder
          : colors.japan.lightBorder,
        pointBorderColor: isDarkTheme
          ? colors.japan.darkBorder
          : colors.japan.lightBorder,
        showLine: true,
        pointRadius: 0,
      },
      {
        label: "America",
        data: finalAmericaData,
        fill: "-1",
        backgroundColor: isDarkTheme
          ? colors.america.darkFill
          : colors.america.lightFill,
        borderColor: isDarkTheme
          ? colors.america.darkBorder
          : colors.america.lightBorder,
        pointBackgroundColor: isDarkTheme
          ? colors.america.darkBorder
          : colors.america.lightBorder,
        pointBorderColor: isDarkTheme
          ? colors.america.darkBorder
          : colors.america.lightBorder,
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

export default LoginByLocationChart;
