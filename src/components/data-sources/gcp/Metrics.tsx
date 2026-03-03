import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MetricsProps {
  data?: {
    labels: string[];
    values: number[];
  };
  title?: string;
}

const Metrics: React.FC<MetricsProps> = ({
  data,
  title = "Log ingestion volume",
}) => {
  const defaultData = {
    labels: Array.from({ length: 36 }, (_, i) => {
      // Only show major time labels at specific intervals
      const labelPositions = [0, 6, 12, 18, 24, 30, 34]; // Approximate positions for the 7 time labels
      const timeLabels = [
        "0:00",
        "4:00",
        "8:00",
        "12:00",
        "16:00",
        "20:00",
        "24:00",
      ];

      if (labelPositions.includes(i)) {
        return timeLabels[labelPositions.indexOf(i)];
      }
      return ""; // Empty string for intermediate points
    }),
    values: [
      260, 300, 270, 480, 360, 600, 530, 760, 760, 970, 830, 830, 1100, 670,
      670, 620, 710, 620, 1000, 970, 980, 670, 1000, 980, 1000, 880, 1000, 890,
      880, 260, 380, 400, 260, 260, 280, 370,
    ],
  };

  const chartData = data || defaultData;

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 12,
          },
          maxRotation: 0, // Prevents rotation
          minRotation: 0, // Ensures labels stay horizontal
          autoSkip: false, // Still automatically skips labels if needed
          padding: 8, // Adds some padding between labels and chart
          callback: (value, index) => {
            // Only return labels at your specified positions
            const labelPositions = [0, 6, 12, 18, 24, 30, 34];
            return labelPositions.includes(index)
              ? chartData.labels[index]
              : undefined;
          },
        },
        border: {
          display: false,
        },
        offset: true, // Adds padding on both ends of the axis
      },
      y: {
        display: true,
        min: 0,
        max: Math.ceil((Math.max(...chartData.values) * 1.1) / 200) * 200,
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 12,
          },
          stepSize: 200,
        },
        border: {
          display: false,
        },
      },
    },
    layout: {
      padding: {
        right: 20, // Add right padding to ensure last label is visible
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
        backgroundColor: "#3B82F6",
        borderColor: "#ffffff",
        borderWidth: 2,
      },
      line: {
        borderWidth: 2,
        tension: 0.4,
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  const chartDataConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Log Ingestion Volume",
        data: chartData.values,
        borderColor: "#3B82F6",
        backgroundColor: (context: {
          chart: {
            ctx: CanvasRenderingContext2D;
            chartArea: { top: number; bottom: number } | undefined;
          };
        }) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return "rgba(59, 130, 246, 0.1)";
          }

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.6)");
          gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.3)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)");

          return gradient;
        },
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="w-full h-auto bg-white">
      <div className="p-6">
        <h1 className="text-lg font-medium text-gray-900 mb-4">Metrics</h1>
        <h2 className="text-lg font-medium text-gray-900 mb-6">{title}</h2>
        <div className="relative h-[450px]">
          <Line data={chartDataConfig} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Metrics;
