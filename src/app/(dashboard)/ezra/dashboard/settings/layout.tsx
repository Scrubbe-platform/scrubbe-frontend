"use client";
import CButton from "@/components/ui/Cbutton";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
const tabs = [
  {
    label: "Personalization",
    route: "/ezra/dashboard/settings",
  },
  { label: "Data Sources", route: "/ezra/dashboard/settings/data-sources" },
  {
    label: "Privacy & Security",
    route: "/ezra/dashboard/settings/privacy-security",
  },
  {
    label: "Interaction Preferences",
    route: "/ezra/dashboard/settings/interaction-preferences",
  },
  { label: "Notifications", route: "/ezra/dashboard/settings/notification" },
  { label: "Integrations", route: "/ezra/dashboard/settings/integrations" },
  { label: "Model Settings", route: "/ezra/dashboard/settings/model-settings" },
];

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-full h-full p-4">
      <p className="text-2xl font-bold dark:text-white ">Ezra Settings</p>
      <div className="w-full min-h-screen dark:bg-dark bg-white rounded-lg p-8 mt-4 space-y-4">
        <p className="text-lg font-bold dark:text-white">
          Ai Analyst Configuration
        </p>
        <CButton className=" border hover:border-green-600 hover:bg-green-500/10 border-green-600 bg-green-500/10 text-green-600 shadow-none w-fit h-[40px]">
          <div className="w-2 h-2 bg-green-600 rounded-full" />
          Active and monitoring
        </CButton>

        {/* Settings Tabs as navigation */}
        <div className="w-full flex justify-between border-b dark:border-gray-700 border-gray-200 bg-transparent rounded-none p-0 mb-4">
          {tabs.map((tab) => {
            const isActive = pathname === tab.route;
            return (
              <button
                key={tab.route}
                onClick={() => router.push(tab.route)}
                className={`flex-1 text-center py-2 text-sm font-medium transition-colors border-b-2
                  ${
                    isActive
                      ? "text-blue-700 border-blue-700"
                      : "text-gray-700 border-transparent hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-700"
                  }
                  focus:outline-none`}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          key={pathname}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsLayout;
