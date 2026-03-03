"use client";
import Integrations from "@/components/IncidentTicket/Integrations";
import Overview from "@/components/IncidentTicket/Overview";
import { motion } from "framer-motion";
import React, { useState } from "react";

const TABS = ["Overview", "Integrations", "Rules and Routing", "Error Logs"];
const Page = () => {
  const [tab, setTab] = useState(0);

  return (
    <div>
      <div className="p-6 mx-auto w-full">
        <div className="flex items-center gap-2 mb-2 cursor-pointer">
          <h1 className="text-2xl font-bold dark:text-white">
            Ingestion and Integrations
          </h1>
        </div>
        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-6">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`py-2 px-2 text-sm font-medium border-b-2 transition-colors ${
                tab === i
                  ? "border-green text-green"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-green"
              }`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Details Tab */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          key={tab}
        >
          {tab === 0 && <Overview />}

          {tab === 1 && <Integrations />}
          {tab === 2 && <div></div>}
          {tab === 3 && <div></div>}
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
