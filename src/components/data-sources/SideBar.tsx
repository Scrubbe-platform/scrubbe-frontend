"use client";
import { useState } from "react";
import {
  FiSettings,
  FiHelpCircle,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";
import { useAppStore } from "@/store/StoreProvider";
import type { DataSourceId } from "@/store/slices/dataSourcesSlice";

type SectionKey =
  | "menu"
  | "dataSources"
  | "logsAnalytics"
  | "activities"
  | "settings"
  | "support";

const SideBar = () => {
  const [expandedSections, setExpandedSections] = useState<
    Record<SectionKey, boolean>
  >({
    menu: true,
    dataSources: true, // Default to expanded to show data sources
    logsAnalytics: false,
    activities: true,
    settings: false,
    support: false,
  });

  // Use Zustand store
  const { selectedDataSource, dataSourceItems, setSelectedDataSource } =
    useAppStore((state) => state);

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const selectDataSource = (source: DataSourceId) => {
    setSelectedDataSource(source);
  };

  // Add the FiPlus icon for "Add New Source" item
  const dataSourceItemsWithIcons = dataSourceItems.map((item) => ({
    ...item,
    // icon: item.id === "add-new" ? FiPlus : item.icon,
  }));

  return (
    <div className="w-72 max-w-[250px] dark:bg-dark dark:border-gray-500 border-r border-gray-200 flex flex-col text-base h-full">
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Menu Section */}
        <div className="p-4 border-b dark:border-gray-700 border-gray-100">
          <button
            onClick={() => toggleSection("menu")}
            className="flex items-center justify-between w-full text-left dark:text-gray-300 dark:hover:text-white text-gray-400 hover:text-gray-900"
          >
            <span>Menu</span>
            {expandedSections.menu ? (
              <FiChevronDown className="w-4 h-4" />
            ) : (
              <FiChevronRight className="w-4 h-4" />
            )}
          </button>

          {expandedSections.menu && (
            <div className="ml-4 mt-3 space-y-2">
              {/* Data Sources Section */}
              <div>
                <button
                  onClick={() => toggleSection("dataSources")}
                  className="flex items-center justify-between w-full text-left py-2 dark:text-gray-300 dark:hover:text-white  text-gray-700 hover:text-gray-900"
                >
                  <div className="flex items-center space-x-2">
                    {/* <GiOrganigram className="w-6 h-6" /> */}
                    <img src="/organogram.svg" className="w-6 h-6" alt="logo" />

                    <span>Data Sources</span>
                  </div>
                  {expandedSections.dataSources ? (
                    <FiChevronDown className="w-4 h-4" />
                  ) : (
                    <FiChevronRight className="w-4 h-4" />
                  )}
                </button>

                {expandedSections.dataSources && (
                  <div className="mt-2 space-y-1">
                    {/* Data Source Items */}
                    <div className="space-y-1">
                      {dataSourceItemsWithIcons.map((item) => {
                        const IconComponent = item.icon;
                        const isSelected = selectedDataSource === item.id;

                        return (
                          <button
                            key={item.id}
                            onClick={() => selectDataSource(item.id)}
                            className={`flex items-center space-x-2 w-full text-left px-5 py-2 rounded-md transition-colors ${
                              isSelected
                                ? "bg-blue-500 text-white font-medium"
                                : "dark:text-gray-300  text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            {IconComponent && (
                              <IconComponent className="w-4 h-4" />
                            )}
                            <span>{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Logs and Analytics Section */}
              <div>
                <button
                  onClick={() => toggleSection("logsAnalytics")}
                  className="flex items-center justify-between w-full text-left py-2 dark:text-gray-300 dark:hover:text-white  text-gray-700 hover:text-gray-900"
                >
                  <div className="flex items-center space-x-2">
                    {/* <LuRoute className="w-6 h-6" /> */}
                    <img src="/analysis.svg" className="w-6 h-6" alt="logo" />
                    <span>Logs and Analytics</span>
                  </div>
                  {expandedSections.logsAnalytics ? (
                    <FiChevronDown className="w-4 h-4" />
                  ) : (
                    <FiChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Activities Section */}
        <div className="px-4 py-2">
          <button
            onClick={() => toggleSection("activities")}
            className="flex items-center justify-between w-full text-left py-2  dark:text-gray-300 dark:hover:text-white text-gray-400 hover:text-gray-900"
          >
            <span>Activities</span>
            {expandedSections.activities ? (
              <FiChevronDown className="w-4 h-4" />
            ) : (
              <FiChevronRight className="w-4 h-4" />
            )}
          </button>

          {expandedSections.activities && (
            <div className="ml-6 mt-2 space-y-2">
              {/* Settings Section */}
              <div>
                <button
                  onClick={() => toggleSection("settings")}
                  className="flex items-center justify-between w-full text-left py-2 dark:text-gray-300 dark:hover:text-white  text-gray-700 hover:text-gray-900"
                >
                  <div className="flex items-center space-x-2">
                    <FiSettings className="w-6 h-6 text-gray-500" size={18} />
                    <span>Settings</span>
                  </div>
                  {expandedSections.settings ? (
                    <FiChevronDown className="w-4 h-4" />
                  ) : (
                    <FiChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Support Section */}
              <div>
                <button
                  onClick={() => toggleSection("support")}
                  className="flex items-center justify-between w-full text-left py-2 dark:text-gray-300 dark:hover:text-white text-gray-700 hover:text-gray-900"
                >
                  <div className="flex items-center space-x-2">
                    <FiHelpCircle className="w-6 h-6 text-gray-500" />
                    <span>Support</span>
                  </div>
                  {expandedSections.support ? (
                    <FiChevronDown className="w-4 h-4" />
                  ) : (
                    <FiChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Log out */}
      <div className="border-t border-gray-200 p-4">
        <button className="flex items-center justify-between w-full text-left py-2 dark:text-gray-300 dark:hover:text-white text-gray-600 hover:text-gray-900">
          <span>Log out</span>
          <FiLogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SideBar;
