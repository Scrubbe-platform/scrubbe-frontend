"use client";
import SLADashboard from "@/components/IMS/Dashboard/SLA/SlaManagement";
import SlaPolicyBuilder from "@/components/IMS/Dashboard/SLA/SlaPolicyBuilder";
import SlaReports from "@/components/IMS/Dashboard/SLA/SlaReports";
import { motion } from "framer-motion";
import React, { useState } from "react";

const TABS = ["Dashboard Overview", "Policy Builder", "Reports"];
const Page = () => {
  const [tab, setTab] = useState(0);

  return (
    <div className="p-4 space-y-4">
      <p className=" text-2xl font-bold">SLA Management</p>
      <div className=" bg-white p-3 rounded-md">
        <div className="grid grid-cols-3 gap-8 border-b border-gray-200 mb-6">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`p-4 text-sm font-medium border-b-2 transition-colors ${
                tab === i
                  ? "border-IMSLightGreen text-IMSLightGreen"
                  : "border-transparent text-gray-500  dark:text-gray-400 hover:text-green"
              }`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          key={tab}
        >
          {tab === 0 && <SLADashboard />}
          {tab === 1 && <SlaPolicyBuilder />}
          {tab === 2 && <SlaReports />}

          {/* Collaboration Tab */}
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
