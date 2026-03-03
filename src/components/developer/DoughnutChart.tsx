import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface DoughnutChartProps {
  labels: string[];
  data: number[];
  colors?: string[];
  legendPosition?: "top" | "bottom" | "left" | "right";
  height?: number | string;
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({
  labels,
  data,
  colors,
  legendPosition = "right",
  height = 300,
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors || [
          "#2563eb",
          "#0ea5e9",
          "#14b8a6",
          "#f59e42",
          "#e11d48",
          "#a21caf",
          "#facc15",
          "#22d3ee",
          "#22c55e",
          "#64748b",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: legendPosition,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 16 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw as number;
            return `${label}: ${value}`;
          },
        },
      },
    },
    cutout: "70%",
  };

  return (
    <div className="w-full flex items-center" style={{ height }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DoughnutChart;
