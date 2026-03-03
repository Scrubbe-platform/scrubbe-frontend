"use client";
import { ArrowRight, Atom } from "lucide-react";
import React from "react";
import ProgressBar from "../../ezra/ProgressBar";

const SystemHealthMetrics = () => {
  return (
    <div className="p-4 dark:bg-dark bg-white rounded-lg space-y-5 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center text-colorScBlue">
          <Atom />
          <p className=" dark:text-white text-black font-medium">
            System Health Metrics
          </p>
        </div>
        <div className="flex items-start gap-2 text-colorScBlue  cursor-pointer">
          <p className=" text-sm font-medium">View Details</p>
          <ArrowRight size={17} />
        </div>
      </div>

      <div className=" space-y-3">
        <div className=" rounded-md p-2 dark:bg-subDark bg-gray-50 space-y-1">
          <div className="flex justify-between items-center">
            <p className="text-sm dark:text-white font-medium">System uptime</p>
            <p className="text-sm dark:text-green-400 text-green-500">99.98%</p>
          </div>
          <ProgressBar value={99.98} color="dark:bg-green-500 bg-green-600" />
          <p className="  dark:text-white text-xs">
            Historical : 30 days average
          </p>
        </div>
        <div className=" rounded-md p-2 dark:bg-subDark bg-gray-50 space-y-1">
          <div className="flex justify-between items-center">
            <p className="text-sm dark:text-white font-medium">Log ingestion</p>
            <p className="text-sm dark:text-green-400 text-green-500">
              14,543/s
            </p>
          </div>
          <ProgressBar value={46} color="dark:bg-green-500 bg-green-600" />
          <p className="  dark:text-white text-xs">Capacity:25,000/s</p>
        </div>
        <div className=" rounded-md p-2 dark:bg-subDark bg-gray-50 space-y-1">
          <div className="flex justify-between items-center">
            <p className="text-sm dark:text-white font-medium">API Response</p>
            <p className="text-sm dark:text-green-400 text-green-500">78ms</p>
          </div>
          <ProgressBar value={23} color="dark:bg-green-500 bg-green-600" />
          <p className="  dark:text-white text-xs">Target &lt; 300ms</p>
        </div>

        <div className=" rounded-md p-2 dark:bg-subDark bg-gray-50 grid grid-cols-2 gap-4">
          <div className=" space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-sm dark:text-white font-medium">CPU/Memory</p>
            </div>
            <ProgressBar value={50} color="dark:bg-orange-500 bg-orange-600" />
            <p className="  dark:text-white text-xs">Threshold: 80%</p>
          </div>
          <div className=" space-y-1">
            <div className="flex justify-end items-center">
              <p className="text-sm dark:text-orange-400 text-orange-500">
                65%
              </p>
              <p className="text-sm dark:text-green-400 text-green-500">/45</p>
            </div>
            <ProgressBar value={50} color="dark:bg-green-500 bg-green-600" />
          </div>
        </div>

        <div className=" rounded-md p-2 dark:bg-subDark bg-gray-50 space-y-1">
          <div className="flex justify-between items-center">
            <p className="text-sm dark:text-white font-medium">
              Storage Utilization
            </p>
            <p className="text-sm dark:text-green-400 text-green-500">78%</p>
          </div>
          <ProgressBar value={78} color="dark:bg-orange-500 bg-orange-600" />
          <p className="  dark:text-white text-xs">
            Forecast will reachn 90% in 23 days
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthMetrics;
