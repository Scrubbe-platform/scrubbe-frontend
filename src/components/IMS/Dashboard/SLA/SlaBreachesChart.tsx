"use client";
import React, { useEffect, useState } from "react";
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
} from "chart.js";
import { Line } from "react-chartjs-2";
import { BsArrowRight } from "react-icons/bs";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

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

const DEFAULT_LABELS = ["Week 1", "Week 2", "Week 3", "Week 4"];

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 14 } },
    },
    y: {
      title: { display: true, text: "Breaches", color: "#4B5563", font: { size: 14 } },
      grid: { borderDash: [5, 5] as [number, number], color: "#E5E7EB" },
      min: 0,
      ticks: { stepSize: 5 },
    },
  },
};

const SlaBreachesChart = () => {
  const [labels, setLabels] = useState<string[]>(DEFAULT_LABELS);
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customAxios
      .get(endpoint.sla_policies.analytics)
      .then((res) => {
        const analytics = res.data?.data ?? res.data;
        const trend: { label: string; value: number }[] = analytics?.breachTrend ?? [];
        if (trend.length > 0) {
          setLabels(trend.map((t) => t.label));
          setDataPoints(trend.map((t) => t.value));
        }
      })
      .catch(() => {
        // Keep empty data — no breach data available
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = {
    labels,
    datasets: [
      {
        label: "SLA Breaches",
        data: dataPoints,
        borderColor: "#22D3EE",
        backgroundColor: "rgba(34, 211, 238, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: dataPoints.length > 0 ? 4 : 0,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black">
          SLA Breaches (last 30 days)
        </h2>
        <a
          href="/incident/settings"
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <span className="underline">See compliance details</span>
          <BsArrowRight className="ml-2" />
        </a>
      </div>
      <div style={{ height: "300px" }}>
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Loading breach data…
          </div>
        ) : dataPoints.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No SLA breach data available for this period.
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default SlaBreachesChart;
