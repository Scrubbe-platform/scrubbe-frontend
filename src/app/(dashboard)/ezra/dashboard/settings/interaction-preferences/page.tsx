"use client";
import React, { useState } from "react";
import Switch from "@/components/ui/Switch";
import Select from "@/components/ui/select";

const Page = () => {
  const [responseDetail, setResponseDetail] = useState("Detailed");
  const [remediationSteps, setRemediationSteps] = useState(true);
  const [riskScoring, setRiskScoring] = useState(true);
  const [threatPredictions, setThreatPredictions] = useState(true);
  const [autoInvestigation, setAutoInvestigation] = useState(true);

  return (
    <div className="mx-auto space-y-8">
      {/* Response Preferences Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Response Preferences
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Response Detail level */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Response Detail level
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                How detailed Ezra&apos;s security analysis should be
              </div>
            </div>
            <Select
              options={[
                { value: "Brief", label: "Brief" },
                { value: "Detailed", label: "Detailed" },
                { value: "Comprehensive", label: "Comprehensive" },
              ]}
              value={responseDetail}
              onChange={(e) => setResponseDetail(e.target.value)}
              className="!w-32 border !border-blue-500 text-blue-600"
            />
          </div>
          {/* Include remediation Steps */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Include remediation Steps
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Automatically provide fix recommendations
              </div>
            </div>
            <Switch checked={remediationSteps} onChange={setRemediationSteps} />
          </div>
          {/* Risk Scoring */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">Risk Scoring</div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Show numerical risk scores for threats
              </div>
            </div>
            <Switch checked={riskScoring} onChange={setRiskScoring} />
          </div>
        </div>
      </div>
      {/* Proactive Assistance Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Proactive Assistance
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Threat predictions */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Threat predictions
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Ezra suggests potential future threats
              </div>
            </div>
            <Switch
              checked={threatPredictions}
              onChange={setThreatPredictions}
            />
          </div>
          {/* Auto-Investigation */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Auto-Investigation
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Automatically investigate detected anomalies
              </div>
            </div>
            <Switch
              checked={autoInvestigation}
              onChange={setAutoInvestigation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
