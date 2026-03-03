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

const ApiEndpointsUserRoleChart = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";

  const labels = ["API 1", "API 2", "API 3", "API 4", "API 5"];

  // Data values carefully extracted from the screenshot, representing the height of each segment
  // The stacking order in the screenshot is: Analyst (bottom), Admin (middle), Guest (top)
  // Let's assume the Y-axis has an implicit scale that these values map to.
  // Visual inspection of the screenshot:
  // Total height seems to be consistently 20.
  // Analyst segment is around 5.
  // Admin segment (magenta) is around 10.
  // Guest segment (dark blue) is around 15.
  // Guest (light blue) segment is around 5.
  // So, Analyst is 0-5, Admin is 5-15, Guest (dark) is 15-30, Guest (light) is 30-35 (approx)
  // Let's use absolute values for simplicity and let Chart.js stack them
  // Analyst: ~5
  // Admin: ~5-6 (after Analyst)
  // Guest (dark blue): ~8-10 (after Admin)
  // Guest (light blue): ~3-4 (after Guest dark blue)
  // Total max Y is 20, with ticks at Guest(top:20), Admin(15), Guest(10), Analyst(5), 0
  // This looks like a reversed stack or different interpretation.

  // Let's re-interpret the Y-axis: The labels are user roles at specific Y-axis points.
  // 'Analyst' is at Y=~5
  // 'Admin' is at Y=~10
  // 'Guest' is at Y=~15 (dark blue section)
  // 'Admin' again at Y=~25 (magenta section again?) - No, this implies it's "Admin 1", "Admin 2" or something.
  // 'Guest' again at Y=~35 (light blue section again?) - No, same as above.

  // The Y-axis labels "Analyst", "Admin", "Guest" are repeated.
  // This implies the chart might be showing count of users per role per API, stacked.
  // Let's assume the Y-axis marks are indicative of the *total height* of the stacked segments.
  // Analyst: Green segment, typically 0-5.
  // Admin: Magenta segment, typically 5-10.
  // Guest: Dark Blue segment, typically 10-15.
  // Guest (top): Light Blue segment, typically 15-20.

  // For API 1: Analyst=5, Admin=5, Guest(dark)=5, Guest(light)=5 (Total 20)
  // For API 2: Analyst=5, Admin=5, Guest(dark)=5, Guest(light)=3 (Total 18) -- smaller light blue
  // For API 3: Analyst=5, Admin=5, Guest(dark)=5, Guest(light)=8 (Total 23) -- larger light blue (highest bar)
  // For API 4: Analyst=5, Admin=5, Guest(dark)=5, Guest(light)=5 (Total 20)
  // For API 5: Analyst=5, Admin=5, Guest(dark)=5, Guest(light)=3 (Total 18)

  // Recalculating base values for each segment to match the total visual height of each bar
  // Each bar has total height of ~20.
  // Analyst (Green): Roughly 5 units high.
  // Admin (Magenta): Roughly 5 units high (from 5 to 10 on Y-axis).
  // Guest (Dark Blue): Roughly 10 units high (from 10 to 20 on Y-axis).
  // Guest (Light Blue): Roughly 5 units high (from 20 to 25 on Y-axis). This doesn't match Y-axis max 20.

  // Let's reconsider the Y-axis labels. They seem to be positioned at specific total counts.
  // Analyst: The first band from 0.
  // Admin: Second band.
  // Guest: Third band.
  // Admin: Fourth band.
  // Guest: Fifth band.
  // The 'Guest' at the very top indicates the total height.
  // The Y-axis ticks are `Analyst` at ~5, `Admin` at ~10, `Guest` at ~15, `Admin` at ~20, `Guest` at ~25 (estimated based on spacing).
  // The final tick is `Guest` at `~25`. This implies the max Y value should be around 25-30.
  // The highest point of the tallest bar (API 3) is just below the top 'Guest' label.
  // The lowest 'Analyst' label is at 0, the next 'Admin' is at ~7.5, next 'Guest' at ~15, next 'Admin' at ~22.5, next 'Guest' at ~30.
  // Max Y is 30.

  // Let's refine the segment values to match the visual stack and total heights to a max of 30.
  // Analyst (Green) is consistent ~7.5 units for all APIs.
  // Admin (Magenta) is consistent ~7.5 units for all APIs.
  // Guest (Dark Blue) is consistent ~7.5 units for all APIs.
  // Guest (Light Blue) varies per API.

  const analystSegment = [7.5, 7.5, 7.5, 7.5, 7.5]; // Green segment
  const adminSegment = [7.5, 7.5, 7.5, 7.5, 7.5]; // Magenta segment
  const guestDarkSegment = [7.5, 7.5, 7.5, 7.5, 7.5]; // Dark Blue segment

  // The top light blue segment varies in height based on the screenshot
  const guestLightSegment = [
    7.5, // API 1 (Total approx 30)
    3, // API 2 (Total approx 25.5)
    8.5, // API 3 (Total approx 31) - highest bar
    5, // API 4 (Total approx 28)
    4.5, // API 5 (Total approx 27)
  ];

  // Colors extracted from screenshot and adapted for dark mode
  const greenColorLight = "rgba(92, 184, 92, 1)"; // Analyst (bottom) - more saturated green
  const greenColorDark = "#3E8C4D";

  const magentaColorLight = "rgba(232, 62, 140, 1)"; // Admin - vibrant magenta
  const magentaColorDark = "#A63D6B";

  const darkBlueColorLight = "rgba(28, 64, 138, 1)"; // Guest (middle) - deep blue
  const darkBlueColorDark = "#1D3B73";

  const lightBlueColorLight = "rgba(173, 216, 230, 1)"; // Guest (top) - very light blue
  const lightBlueColorDark = "#7AA4CC"; // Slightly darker for dark theme to stand out

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
            label: function (context: any) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              // For stacked charts, show the value of the current segment
              if (context.parsed.y !== null) {
                // To get the actual segment height: current_y - previous_stacked_y
                const currentY = context.parsed._stacks.y[context.datasetIndex];
                const prevY =
                  context.parsed._stacks.y[context.datasetIndex - 1] || 0;
                label += (currentY - prevY).toFixed(1); // Display segment value
              }
              return label;
            },
            title: function (context: any) {
              return `API: ${context[0].label}`;
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
          max: 30, // Max Y-axis value from careful analysis of screenshot
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            // Custom callback to match the exact Y-axis labels from the screenshot
            callback: function (value: any) {
              if (value === 0) return ""; // No label at 0
              if (value === 7.5) return "Analyst";
              if (value === 15) return "Admin";
              if (value === 22.5) return "Guest";
              if (value === 30) return "Guest"; // This represents the top 'Guest' label, slightly above the highest bar
              return "";
            },
            stepSize: 7.5, // Calculate step size based on the labels (0, 7.5, 15, 22.5, 30)
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
        label: "Analyst",
        data: analystSegment,
        backgroundColor: isDarkTheme ? greenColorDark : greenColorLight,
        borderColor: isDarkTheme ? greenColorDark : greenColorLight,
        borderWidth: 1,
        hoverBackgroundColor: isDarkTheme ? "#2F7C3F" : "#73C873",
      },
      {
        label: "Admin",
        data: adminSegment,
        backgroundColor: isDarkTheme ? magentaColorDark : magentaColorLight,
        borderColor: isDarkTheme ? magentaColorDark : magentaColorLight,
        borderWidth: 1,
        hoverBackgroundColor: isDarkTheme ? "#8A2D53" : "#E85B94",
      },
      {
        label: "Guest", // This is the dark blue guest segment
        data: guestDarkSegment,
        backgroundColor: isDarkTheme ? darkBlueColorDark : darkBlueColorLight,
        borderColor: isDarkTheme ? darkBlueColorDark : darkBlueColorLight,
        borderWidth: 1,
        hoverBackgroundColor: isDarkTheme ? "#152C58" : "#2D58A0",
      },
      {
        label: "Guest (Top)", // This is the light blue guest segment
        data: guestLightSegment,
        backgroundColor: isDarkTheme ? lightBlueColorDark : lightBlueColorLight,
        borderColor: isDarkTheme ? lightBlueColorDark : lightBlueColorLight,
        borderWidth: 1,
        hoverBackgroundColor: isDarkTheme ? "#5D8DB7" : "#94D2E5",
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

export default ApiEndpointsUserRoleChart;
