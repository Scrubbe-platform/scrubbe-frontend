import ProgressBar from "@/components/ezra/ProgressBar";
import CButton from "@/components/ui/Cbutton";
import { Checkbox } from "@heroui/react";
import React from "react";
import { BiCheck } from "react-icons/bi";

const AiSuggestion = () => {
  return (
    <div className="grid grid-cols-[1fr,.6fr] gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-xl font-bold dark:text-white text-black">
          Confidence Score: 89%
        </p>
        <div className=" rounded-lg bg-[#FEF2F2] p-3 space-y-2">
          <p className=" font-medium">Top Suggested Action</p>
          <p className="text-base font-medium">
            Re-route workloads to Region B
          </p>
          <p className="text-base">
            Detected rising CPU temperature correlated with external 41°C
            heatwave. The deployment logs and monitoring metrics show a spike in
            500 errors correlating with build ID #A29. Similar pattern detected
            in 12 prior incidents.
          </p>
        </div>

        <div className=" rounded-lg bg-[#F9FAFB] p-3 space-y-2">
          <p className=" font-medium">Probable Root Cause</p>
          <p className=" text-base">
            Power grid instability detected near Lagos Data Center.
          </p>
        </div>

        <div className=" rounded-lg bg-[#F9FAFB] p-3 space-y-2">
          <p className=" font-medium">Suggested Fix</p>
          <p className=" text-base">
            Activate backup power route and throttle non-critical workloads.
          </p>
          <p className="p-1 rounded-md bg-emerald-100 text-IMSGreen text-sm w-fit">
            4m 20s
          </p>
        </div>

        <div className=" rounded-lg bg-[#F9FAFB] p-3 space-y-2">
          <p className=" font-medium">Suggested Assignee</p>
          <p className=" text-base">
            Reassign to Sarah Lee (Senior DBA) for her expertise in query
            optimization.
          </p>
        </div>

        <div className=" rounded-lg bg-[#F9FAFB] p-3 space-y-2">
          <p className=" font-medium">Preventive Measure</p>
          <p className=" text-base">
            Implement automated scaling rules for CPU {">"} 80% and conduct
            pre-deploy performance tests on staging.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap ">
          <CButton onClick={() => {}} className="w-fit shadow-none">
            Apply Fix
          </CButton>
          <CButton
            onClick={() => {}}
            className="w-fit shadow-none bg-transparent border border-IMSLightGreen hover:text-white text-IMSLightGreen"
          >
            Add to Timeline
          </CButton>
          <CButton
            onClick={() => {}}
            className="w-fit shadow-none bg-transparent border border-IMSLightGreen hover:text-white text-IMSLightGreen"
          >
            Mark as implemented
          </CButton>
          <CButton
            onClick={() => {}}
            className="w-fit shadow-none bg-transparent border border-IMSLightGreen hover:text-white text-IMSLightGreen"
          >
            Ignore
          </CButton>
          <CButton
            onClick={() => {}}
            className="w-fit shadow-none bg-transparent border border-IMSLightGreen hover:text-white text-IMSLightGreen"
          >
            Save for review
          </CButton>
          <CButton
            onClick={() => {}}
            className="w-fit shadow-none bg-transparent border border-IMSLightGreen hover:text-white text-IMSLightGreen"
          >
            Copy Summary
          </CButton>
          <CButton
            onClick={() => {}}
            className="w-fit shadow-none bg-transparent border border-IMSLightGreen hover:text-white text-IMSLightGreen"
          >
            Share
          </CButton>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xl font-bold dark:text-white text-black">
          AI Suggestion
        </p>

        <div className="border p-3 rounded-lg flex flex-col gap-3">
          <p className="text-xl font-bold dark:text-white text-black ">
            89%  (Above Auto-Run Threshold)
          </p>
          <ProgressBar color="bg-[#28a745]" value={85} />
          <div className="flex items-center gap-1">
            <Checkbox />
            <p className=" text-sm">Auto-run if confidence ≥ 85%</p>
          </div>
        </div>

        <div className="border p-3 rounded-lg flex flex-col gap-3">
          <p className=" font-medium">Suggested Action:</p>
          <p className="text-base">
            Auto-run if confidence ≥ 8Rollback to previous stable version:
            v1.2.35%
          </p>
          <p className=" text-base">
            Reason: New deployment introduced a failed dependency on API
            gateway.
          </p>
        </div>

        <div className="border p-3 rounded-lg flex flex-col gap-3">
          <p className=" font-medium">AI Rationale</p>
          <p className="text-base">
            Detected rising CPU temperature correlated with external 41°C
            heatwave. The deployment logs and monitoring metrics show a spike in
            500 errors correlating with build ID #A29. Similar pattern detected
            in 12 prior incidents.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <CButton>Auto-run fix</CButton>
          <CButton>Approve & Execute</CButton>
          <CButton>Reject Suggestion</CButton>
        </div>

        <div className="border p-3 rounded-lg flex flex-col gap-3">
          <p className=" font-medium">Confidence Breakdown</p>
          <div className="grid grid-cols-3 pb-2 border-b border-gray-200 text-base">
            <p>Data Type</p>
            <p>Weight</p>
            <p>Correlation</p>
          </div>
          <div className="grid grid-cols-3 pb-2 border-b border-gray-200 text-base">
            <p>Log anomalies</p>
            <p>35%</p>
            <p>High</p>
          </div>
          <div className="grid grid-cols-3 pb-2 border-b border-gray-200 text-base">
            <p>CPU Metrics</p>
            <p>35%</p>
            <p>Medium</p>
          </div>
          <div className="grid grid-cols-3 pb-2 border-b border-gray-200 text-base">
            <p>CI/CD pipeline</p>
            <p>35%</p>
            <p>High</p>
          </div>
          <div className="grid grid-cols-3 pb-2 border-b border-gray-200 text-base">
            <p>Historical pattern</p>
            <p>35%</p>
            <p>Medium</p>
          </div>
        </div>

        <div className="border p-3 rounded-lg flex flex-col gap-3">
          <p className=" font-medium">Generated Playbook</p>
          <div className="flex items-center gap-2">
            <BiCheck className=" text-IMSLightGreen" />
            <p>Rollback Deployment</p>
          </div>
          <div className="flex items-center gap-2">
            <BiCheck className=" text-IMSLightGreen" />
            <p>Restart Affected Services</p>
          </div>
          <div className="flex items-center gap-2">
            <BiCheck className=" text-IMSLightGreen" />
            <p>Notify DevOps Slack Channel</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSuggestion;
