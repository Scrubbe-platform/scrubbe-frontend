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
import React from "react";

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

export interface LineChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  yAxisID?: string;
  pointBorderColor?: string;
  pointBackgroundColor?: string;
  pointRadius?: number;
  pointHoverRadius?: number;
  fill?: boolean;
}

export interface LineChartProps {
  labels: string[];
  datasets: LineChartDataset[];
  yAxes?: {
    id: string;
    position: "left" | "right";
    label: string;
    min?: number;
    max?: number;
    stepSize?: number;
  }[];
  height?: number | string;
  title?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  labels,
  datasets,
  yAxes,
  height = 350,
  title,
}) => {
  const chartData = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      fill: ds.fill ?? false,
      borderWidth: 2,
      tension: 0.4,
      pointBorderColor: ds.pointBorderColor ?? ds.borderColor ?? "#2563eb",
      pointBackgroundColor:
        ds.pointBackgroundColor ?? ds.borderColor ?? "#2563eb",
      pointRadius: ds.pointRadius ?? 4,
      pointHoverRadius: ds.pointHoverRadius ?? 6,
    })),
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
      },
      title: title
        ? {
            display: true,
            text: title,
            font: { size: 16, weight: "bold" },
          }
        : undefined,
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: { color: "#6B7280", font: { size: 12 } },
      },
      ...(yAxes || []).reduce((acc, axis) => {
        acc[axis.id] = {
          type: "linear",
          display: true,
          position: axis.position,
          min: axis.min,
          max: axis.max,
          title: { display: true, text: axis.label },
          grid: { color: "rgba(156, 163, 175, 0.1)" },
          ticks: {
            color: "#6B7280",
            font: { size: 12 },
            stepSize: axis.stepSize,
          },
        };
        return acc;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, {} as Record<string, any>),
    },
    interaction: { intersect: false, mode: "index" },
  };

  return (
    <div className="w-full" style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
