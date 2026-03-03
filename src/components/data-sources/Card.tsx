"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useAppStore } from "@/store/StoreProvider";
import type { DataSourceId } from "@/store/slices/dataSourcesSlice";
import type { ModalType } from "@/store/slices/modalSlice";

export type StatusColor = "green" | "yellow" | "red" | "gray";
type TabName = "Overview" | "Configure" | "Logs" | "Metrics";

interface CardProps {
  logo: string | null;
  title: string;
  status: string;
  statusColor: StatusColor;
  buttonText: string;
  timestamp: string;
  processedData: string;
  dataSourceId?: DataSourceId;
  onTabClick?: (tab: TabName) => void;
  onButtonClick?: (buttonText: string, status: string) => void;
}

const Card: React.FC<CardProps> = ({
  logo,
  title,
  status,
  statusColor,
  buttonText,
  timestamp,
  processedData,
  dataSourceId,
  onTabClick = () => {},
  onButtonClick = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const { openModal } = useAppStore((state) => state);

  const tabs: TabName[] =
    title == "FingerPrint"
      ? ["Overview", "Configure"]
      : ["Overview", "Configure", "Logs", "Metrics"];

  const handleTabClick = (tab: TabName) => {
    setActiveTab(tab);
    onTabClick(tab);

    // Only open modal for non-Overview tabs
    if (tab !== "Overview") {
      const modalType = tab.toLowerCase() as ModalType;
      openModal({
        type: modalType,
        title: tab,
        dataSourceId: dataSourceId,
        dataSourceName: title,
      });
    }
  };

  const getStatusColor = (): string => {
    switch (statusColor) {
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className=" w-full min-w-[345px] h-[312px] dark:bg-dark bg-white  rounded-lg flex flex-col justify-between">
      {/* Header with logo and title */}
      <div className=" flex-1">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 ">
          {/* Only show logo if it exists */}
          {logo && (
            <div className="w-8 h-8 relative">
              <Image
                src={logo}
                alt={title}
                fill
                sizes="(min-width: 360px) 100vw"
                className="object-contain"
              />
            </div>
          )}
          <span className="text-gray-700 dark:text-white font-semibold text-sm ">
            {title}
          </span>
        </div>

        {/* Navigation tabs */}
        <div className="flex p-4 flex-wrap gap-3 ">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={` px-3 py-2 text-sm font-medium transition-colors rounded-md w-fit ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 bg-blue-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className=" p-4 flex flex-col gap-2 ">
        {/* Status indicator and button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
            <span className="text-sm text-gray-600 dark:text-white capitalize ">
              {status}
            </span>
          </div>
          <button
            onClick={() => onButtonClick(buttonText, status)}
            className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
              statusColor === "red"
                ? "border-blue-500 text-blue-600 hover:bg-blue-50"
                : statusColor === "yellow"
                ? "border-blue-500 text-blue-600 hover:bg-blue-50"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {buttonText}
          </button>
        </div>

        {/* Data info */}
        <div className="text-xs  space-y-1 font-medium">
          <div className="dark:text-white text-gray-600">
            Processed: {processedData}
          </div>
          <div className="dark:text-white text-gray-600">
            Last Update: {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
