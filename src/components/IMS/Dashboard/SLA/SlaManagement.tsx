/* eslint-disable @typescript-eslint/no-explicit-any */
import BreachesByPriorityChart from "@/components/IMS/Dashboard/SLA/BreachesByPriorityChart";
import ByTeamChart from "@/components/IMS/Dashboard/SLA/ByTeamChart";
import OverallComplianceChart from "@/components/IMS/Dashboard/SLA/OverallComplianceChart";
import PerformanceTrendChart from "@/components/IMS/Dashboard/SLA/SlaPerformanceTrendChart";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  FaExclamationTriangle,
  FaArrowDown,
  FaArrowUp,
  FaCheckSquare,
  FaClock,
} from "react-icons/fa";
import { HiChartSquareBar } from "react-icons/hi";

// KPI Card Component
const KPICard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="flex items-center mt-1">
        <h3 className={`text-3xl font-bold`}>{value}</h3>
        {change && (
          <span
            className={`ml-3 text-sm font-semibold flex items-center ${
              change.startsWith("+")
                ? "text-green-600"
                : change.startsWith("-")
                  ? "text-red-600"
                  : "text-gray-500"
            }`}
          >
            {change.startsWith("+") ? (
              <FaArrowUp className="w-3 h-3 mr-0.5" />
            ) : change.startsWith("-") ? (
              <FaArrowDown className="w-3 h-3 mr-0.5" />
            ) : (
              <FaArrowUp className="w-3 h-3 mr-0.5 opacity-0" />
            )}
            {change}
          </span>
        )}
      </div>
    </div>
    <div
      className={`p-3 rounded-full ${
        color.includes("green")
          ? "bg-green-100"
          : color.includes("red")
          ? "bg-red-100"
          : "bg-gray-100"
      }`}
    >
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
  </div>
);

// Incident Risk Card Component
const IncidentRiskCard = ({ id, status, sla, tenant }: any) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-4">
    <h4 className="text-lg font-semibold text-gray-800 mb-2">Incident #{id}</h4>
    <div className="space-y-1 text-sm text-gray-600">
      <p>
        <span className="font-medium">Status:</span>{" "}
        <span
          className={`${
            status === "Resolved" ? "text-green-600" : "text-red-600"
          }`}
        >
          {status}
        </span>
      </p>
      <p>
        <span className="font-medium">SLA:</span> {sla}
      </p>
      <p>
        <span className="font-medium">Tenant:</span> {tenant}
      </p>
    </div>
  </div>
);

type SlaAnalytics = {
  kpis?: {
    complianceRate?: number;
    breachedSlaCount?: number;
    breachChange?: string;
    avgMttrLabel?: string;
    improvementTrend?: string;
  };
  overallCompliance?: number;
  byTeam?: {
    labels?: string[];
    data?: number[];
  };
  performanceTrend?: {
    labels?: string[];
    data?: number[];
  };
  breachesByPriority?: {
    labels?: string[];
    data?: number[];
  };
  incidentsAtRisk?: Array<{
    id: string;
    status: string;
    sla: string;
    tenant: string;
  }>;
};

const SLADashboard = () => {
  const { get } = useFetch();
  const { data: analytics } = useQuery<SlaAnalytics>({
    queryKey: ["sla-analytics"],
    queryFn: async () => {
      const res = await get(endpoint.sla_policies.analytics);
      if (res.success) {
        return (res.data?.data ?? res.data ?? {}) as SlaAnalytics;
      }
      return {} as SlaAnalytics;
    },
    refetchOnWindowFocus: false,
  });

  const kpis = analytics?.kpis ?? {};
  const incidentsAtRisk = analytics?.incidentsAtRisk ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="SLA Compliance"
            value={`${kpis.complianceRate ?? 0}%`}
            icon={FaCheckSquare}
            color="text-emerald-600"
          />
          <KPICard
            title="Breached SLAs"
            value={kpis.breachedSlaCount ?? 0}
            change={kpis.breachChange}
            icon={FaExclamationTriangle}
            color="text-red-600"
          />
          <KPICard
            title="Avg MTTR"
            value={kpis.avgMttrLabel ?? "0m"}
            icon={FaClock}
            color="text-emerald-600"
          />
          <KPICard
            title="Improvement Trend"
            value={kpis.improvementTrend ?? "0%"}
            icon={HiChartSquareBar}
            color="text-fuchsia-600"
          />
        </div>

        {/* 2. Compliance and Team Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
          {/* Overall Compliance (Gauge/Donut) */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Overall Compliance
            </h3>
            <OverallComplianceChart compliance={analytics?.overallCompliance} />
          </div>

          {/* By Team (Bar Chart) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <ByTeamChart
              labels={analytics?.byTeam?.labels}
              values={analytics?.byTeam?.data}
            />
          </div>
        </div>

        {/* 3. Trend and Priority Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trend (Line Chart) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Performance Trend
            </h3>
            <PerformanceTrendChart
              labels={analytics?.performanceTrend?.labels}
              values={analytics?.performanceTrend?.data}
            />
          </div>

          {/* Breaches by Priority (Pie Chart) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Breaches by Priority
            </h3>
            <BreachesByPriorityChart
              labels={analytics?.breachesByPriority?.labels}
              values={analytics?.breachesByPriority?.data}
            />
          </div>
        </div>

        {/* 4. Incidents at Risk Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Incidents at Risk of Breach
          </h3>
          {incidentsAtRisk.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {incidentsAtRisk.map((incident) => (
                <IncidentRiskCard
                  key={incident.id}
                  id={incident.id}
                  status={incident.status}
                  sla={incident.sla}
                  tenant={incident.tenant}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-sm text-gray-500">
              No active incidents are currently at risk of SLA breach.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SLADashboard;
