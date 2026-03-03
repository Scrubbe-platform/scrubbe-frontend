/* eslint-disable @typescript-eslint/no-explicit-any */
import BreachesByPriorityChart from "@/components/IMS/Dashboard/SLA/BreachesByPriorityChart";
import ByTeamChart from "@/components/IMS/Dashboard/SLA/ByTeamChart";
import OverallComplianceChart from "@/components/IMS/Dashboard/SLA/OverallComplianceChart";
import PerformanceTrendChart from "@/components/IMS/Dashboard/SLA/SlaPerformanceTrendChart";
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
              change.startsWith("+") ? "text-green-600" : "text-red-600"
            }`}
          >
            {change.startsWith("+") ? (
              <FaArrowUp className="w-3 h-3 mr-0.5" />
            ) : (
              <FaArrowDown className="w-3 h-3 mr-0.5" />
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

const SLADashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="SLA Compliance"
            value="94%"
            icon={FaCheckSquare}
            color="text-emerald-600"
          />
          <KPICard
            title="Breached SLAs"
            value="6"
            change="12%"
            icon={FaExclamationTriangle}
            color="text-red-600"
          />
          <KPICard
            title="Avg MTTR"
            value="1.4h"
            icon={FaClock}
            color="text-emerald-600"
          />
          <KPICard
            title="Improvement Trend"
            value="+2.3%"
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
            <OverallComplianceChart />
          </div>

          {/* By Team (Bar Chart) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <ByTeamChart />
          </div>
        </div>

        {/* 3. Trend and Priority Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trend (Line Chart) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Performance Trend
            </h3>
            <PerformanceTrendChart />
          </div>

          {/* Breaches by Priority (Pie Chart) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Breaches by Priority
            </h3>
            <BreachesByPriorityChart />
          </div>
        </div>

        {/* 4. Incidents at Risk Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Incidents at Risk of Breach
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <IncidentRiskCard
              id="1045"
              status="Resolved"
              sla="Met (45m / 1h)"
              tenant="Acme Corp"
            />
            <IncidentRiskCard
              id="1045"
              status="Resolved"
              sla="Met (45m / 1h)"
              tenant="Delta Enterprises"
            />
            {/* Add more cards as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLADashboard;
