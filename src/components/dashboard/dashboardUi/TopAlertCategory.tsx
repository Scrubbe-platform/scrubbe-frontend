"use client";
import ProgressBar from "@/components/ezra/ProgressBar";
import React from "react";

const TopAlertCategory = () => {
  return (
    <div className=" p-4 space-y-2 border rounded-lg dark:border-zinc-600 border-zinc-200">
      <p className="dark:text-white font-medium">Total alert categories</p>

      <div className=" rounded-md p-2 dark:bg-subDark bg-gray-50 space-y-1">
        <div className="flex justify-between items-center">
          <p className="text-sm dark:text-white font-medium">
            Brute Force Attempts
          </p>
          <p className="text-sm dark:text-green-400 text-green-500">38%</p>
        </div>
        <ProgressBar value={38} color="dark:bg-rose-500 bg-rose-600" />
      </div>
      <div className=" rounded-md p-2 dark:bg-subDark bg-gray-50 space-y-1">
        <div className="flex justify-between items-center">
          <p className="text-sm dark:text-white font-medium">
            Malware Detection
          </p>
          <p className="text-sm dark:text-green-400 text-green-500">25%</p>
        </div>
        <ProgressBar value={25} color="dark:bg-rose-500 bg-rose-600" />
      </div>
      <div className=" rounded-md p-2 dark:bg-subDark bg-gray-50 space-y-1">
        <div className="flex justify-between items-center">
          <p className="text-sm dark:text-white font-medium">
            Data Exfiltration
          </p>
          <p className="text-sm dark:text-green-400 text-green-500">25%</p>
        </div>
        <ProgressBar value={25} color="dark:bg-rose-500 bg-rose-600" />
      </div>
    </div>
  );
};

export default TopAlertCategory;
