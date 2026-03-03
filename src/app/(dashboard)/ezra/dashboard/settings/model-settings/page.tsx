"use client";
import React, { useState } from "react";
import Switch from "@/components/ui/Switch";
import Select from "@/components/ui/select";

const Page = () => {
  // AI Model Configuration
  const [sensitivity, setSensitivity] = useState("High");
  const [mlUpdates, setMlUpdates] = useState(true);
  const [falsePositive, setFalsePositive] = useState(true);
  // Performance Tuning
  const [processingPriority, setProcessingPriority] = useState("High");
  const [memory, setMemory] = useState("8 gb");

  return (
    <div className="mx-auto space-y-8">
      {/* AI Model Configuration Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          AI Model Configuration
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Analysis sensitivity */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Analysis sensitivity
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Adjust how sensitive Ezra is to potential threats
              </div>
            </div>
            <Select
              options={[
                { value: "Low", label: "Low" },
                { value: "Medium", label: "Medium" },
                { value: "High", label: "High" },
                { value: "Maximum", label: "Maximum" },
              ]}
              value={sensitivity}
              onChange={(e) => setSensitivity(e.target.value)}
              className="!w-28 border !border-blue-500 text-blue-600"
            />
          </div>
          {/* Machine Learning Updates */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Machine Learning Updates
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Automatically update AI models with latest security data
              </div>
            </div>
            <Switch checked={mlUpdates} onChange={setMlUpdates} />
          </div>
          {/* False Positive Learning */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                False Positive Learning
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Learn from user feedback to reduce false positives
              </div>
            </div>
            <Switch checked={falsePositive} onChange={setFalsePositive} />
          </div>
        </div>
      </div>
      {/* Performance Tuning Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Performance Tuning
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Processing Priority */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Processing Priority
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                CPU Priority for Ezra&apos;s analysis tasks
              </div>
            </div>
            <Select
              options={[
                { value: "Low", label: "Low" },
                { value: "Normal", label: "Normal" },
                { value: "High", label: "High" },
                { value: "Real-Time", label: "Real-Time" },
              ]}
              value={processingPriority}
              onChange={(e) => setProcessingPriority(e.target.value)}
              className="!w-28 border !border-blue-500 text-blue-600"
            />
          </div>
          {/* Memory Allocation */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Memory Allocation
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Maximum memory usage for analysis operations
              </div>
            </div>
            <Select
              options={[
                { value: "2 gb", label: "2 gb" },
                { value: "4 gb", label: "4 gb" },
                { value: "8 gb", label: "8 gb" },
                { value: "16 gb", label: "16 gb" },
              ]}
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              className="!w-28 border !border-blue-500 text-blue-600"
            />
          </div>
        </div>
      </div>
      {/* Danger Zone Card */}
      <div className="bg-red-100 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 text-red-700">Danger Zone</h2>
        <div className="divide-y divide-red-200">
          {/* Reset Ezra's Learning */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium text-red-700">
                Reset Ezra&apos;s Learning
              </div>
              <div className="text-red-600 text-sm">
                Clear all learned patterns and reset to default behaviour
              </div>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-7 py-2 rounded-lg text-base font-medium transition">
              Reset Learning
            </button>
          </div>
          {/* Factory Reset */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium text-red-700">Factory Reset</div>
              <div className="text-red-600 text-sm">
                Reset all settings to default values
              </div>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-7 py-2 rounded-lg text-base font-medium transition">
              Factory Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
