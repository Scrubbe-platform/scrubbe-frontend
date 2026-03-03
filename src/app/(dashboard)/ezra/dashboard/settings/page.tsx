"use client";
import React, { useEffect, useState } from "react";
import Select from "@/components/ui/select";
import Switch from "@/components/ui/Switch";

const Page = () => {
  // State for settings
  const [displayName, setDisplayName] = useState("Security Admin");
  const [communicationStyle, setCommunicationStyle] = useState("Professional");
  const [expertiseLevel, setExpertiseLevel] = useState("Expert");
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setDisplayName(user.name);
  }, []);
  return (
    <div className=" mx-auto space-y-8">
      {/* Display Preference Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Display Preference
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Display Name */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">Display Name</div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                How Ezra should address you in conversations
              </div>
            </div>
            <button className="border border-blue-500 text-blue-600 px-5 py-2 rounded-lg text-sm  hover:bg-blue-50 transition">
              {displayName}
            </button>
          </div>
          {/* Communication Style */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Communication Style
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Adjust Ezra&apos;s tone and formality level
              </div>
            </div>
            <Select
              options={[
                { value: "Professional", label: "Professional" },
                { value: "Casual", label: "Casual" },
                { value: "Technical", label: "Technical" },
              ]}
              value={communicationStyle}
              onChange={(e) => setCommunicationStyle(e.target.value)}
              className="!w-40 border !border-blue-500 text-blue-600"
            />
          </div>
          {/* Expertise Level */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">Expertise Level</div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Set your security expertise level for tailored responses
              </div>
            </div>
            <Select
              options={[
                { value: "Beginner", label: "Beginner" },
                { value: "Intermediate", label: "Intermediate" },
                { value: "Expert", label: "Expert" },
              ]}
              value={expertiseLevel}
              onChange={(e) => setExpertiseLevel(e.target.value)}
              className="w-40 border !border-blue-500 text-blue-600"
            />
          </div>
        </div>
      </div>
      {/* Interface Customization Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Interface Customization
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Dark Mode */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">Dark Mode</div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Use dark theme for reduced eye strain
              </div>
            </div>
            <Switch checked={darkMode} onChange={setDarkMode} />
          </div>
          {/* Compact View */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">Compact View</div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Display more information in less space
              </div>
            </div>
            <Switch checked={compactView} onChange={setCompactView} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
