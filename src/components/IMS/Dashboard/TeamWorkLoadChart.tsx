"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
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
import useMember from "@/hooks/useMember";
import EmptyState from "@/components/ui/EmptyState";

// Register the necessary components from Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Sample data for the chart
type Props = {
  workLoad: {
    teamMember: string;
    incidentCount: number;
    assignedIncidents: number;
  }[];
};
const TeamWorkloadChart = ({ workLoad }: Props) => {
  console.log({ workLoad });
  const { data } = useMember();
  const teamData = useMemo(() => {
    return {
      labels: workLoad?.map((value) => value.teamMember),
      datasets: [
        {
          label: "Team / Members",
          data: workLoad?.map((value) => value.assignedIncidents),
          // data: [31, 28, 22, 34],
          backgroundColor: (context: any) => {
            // Create a gradient for the bars
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) {
              return null;
            }
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, "#D9E4FD"); // Tailwind's blue-400
            gradient.addColorStop(1, "#2664EA"); // Tailwind's blue-100
            return gradient;
          },
          borderRadius: 1, // Rounded top corners
          borderSkipped: false,
        },
      ],
    };
  }, [data]);

  // Configuration options for the chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          boxHeight: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            ` ${context.dataset.label}: ${context.raw} Incidents`,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Incident",
          color: "#4B5563", // Tailwind's gray-600
          font: {
            size: 14,
          },
        },
        grid: {
          borderDash: [5, 5],
          color: "#E5E7EB", // Tailwind's gray-200
        },
        min: 0,
        max: 40,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };
  return (
    <div className="bg-white p-6 rounded-lg ">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Team workload chart
      </h2>
      {data && data.length > 0 ? (
        <div style={{ height: "300px" }}>
          <Bar data={teamData} options={options as any} />
        </div>
      ) : (
        <EmptyState
          title="No Team Member"
          description="You have no team member on this workspace yet!"
        />
      )}
    </div>
  );
};

export default TeamWorkloadChart;
