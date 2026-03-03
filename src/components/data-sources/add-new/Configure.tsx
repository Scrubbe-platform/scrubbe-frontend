"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const Configure: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sourceTypes = ["AWS", "Azure", "GCP", "Postgres", "Custom API"];

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Selected source:", selectedSource);
    // Handle save logic here
  };

  return (
    <div className="w-full h-auto bg-white p-6">
      <h1 className="text-lg font-medium text-gray-900 mb-6">Add new source</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Source Type
          </label>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
            >
              <span
                className={selectedSource ? "text-gray-900" : "text-gray-400"}
              >
                {selectedSource || "Select a Source"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {sourceTypes.map((source, index) => (
                  <button
                    key={source}
                    onClick={() => {
                      setSelectedSource(source);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                      source === "Postgres"
                        ? "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700"
                        : "text-gray-900"
                    } ${index === 0 ? "rounded-t-md" : ""} ${
                      index === sourceTypes.length - 1 ? "rounded-b-md" : ""
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Configure;
