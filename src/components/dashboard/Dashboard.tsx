import React from "react";
import SystemHealthMetrics from "./dashboardUi/SystemHealthMetrics";
import ThreatIntelligence from "./dashboardUi/ThreatIntelligence";
import SecuritySummary from "./dashboardUi/SecuritySummary";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <p className=" text-lg dark:text-white font-semibold">Global Overview</p>

      <div className="grid md:grid-cols-2 gap-5">
        <SystemHealthMetrics />
        <ThreatIntelligence />
      </div>

      <SecuritySummary />
    </div>
  );
};

export default Dashboard;
