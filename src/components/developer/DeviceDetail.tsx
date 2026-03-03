import React, { ReactNode, useState } from "react";
import Modal from "../ui/Modal";
import CButton from "../ui/Cbutton";
import clsx from "clsx";
import EzraAnalyst from "./EzraAnalyst";
import Investigations from "./Investigations";
import Compliance from "./Compliance";
import { motion } from "framer-motion";

interface DeviceDetailProps {
  isOpen: boolean;
  onClose: () => void;
}

const schema = [
  {
    field: "sessionID",
    type: "string",
    required: "No",
    description: "Unique session identifier",
  },
  {
    field: "userID",
    type: "string (ISO 8601)",
    required: "Yes",
    description: "Session creation timestamp",
  },
  {
    field: "timestamp",
    type: "string",
    required: "Yes",
    description: "Associated user identifier",
  },
  {
    field: "riskScore",
    type: "integer (0-100)",
    required: "Yes",
    description: "Calculated risk score",
  },
  {
    field: "fraudProbability",
    type: "float (0-1)",
    required: "Yes",
    description: "ML fraud probability",
  },
  {
    field: "deviceFingerprint.hardware.cpuCores",
    type: "integer",
    required: "Yes",
    description: "Number of CPU cores",
  },
  {
    field: "deviceFingerprint.hardware.totalMemory",
    type: "integer",
    required: "Yes",
    description: "Total system memory in bytes",
  },
  {
    field: "deviceFingerprint.display.screenWidth",
    type: "integer",
    required: "No",
    description: "CPU architecture",
  },
  {
    field: "deviceFingerprint.display.pixelRatio",
    type: "integer",
    required: "No",
    description: "Screen width in pixels",
  },
  {
    field: "deviceFingerprint.display.pixelRatio",
    type: "integer",
    required: "No",
    description: "Screen width in pixels",
  },
];

type tabs =
  | "live-session"
  | "behavioural-analytics"
  | "threat-intelligence"
  | "ezra-analyst"
  | "compliance"
  | "investigations";
const DeviceDetail: React.FC<DeviceDetailProps> = ({ isOpen, onClose }) => {
  const [dataTab, setDataTab] = useState<"json" | "schema">("json");
  const [deviceDetailTab, setDeviceDetailTab] = useState<tabs>();

  let content: ReactNode;
  switch (deviceDetailTab) {
    case "ezra-analyst":
      content = <EzraAnalyst />;
      break;
    case "investigations":
      content = <Investigations />;
      break;
    case "compliance":
      content = <Compliance />;
      break;
    default:
      content = <></>;
      break;
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="dark:text-white font-medium">
        Device Details{" "}
        <span className=" text-primary-500">(ID : fp_789adcb_ent)</span>
      </div>

      {/* Tabs */}

      {/* Session Analysis Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="font-medium text-gray-700 dark:text-white">
          Session Analysis :{" "}
          <span className="text-primary">fp_789adcb_ent</span>
        </div>
        <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200">
          Export Result
        </button>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Device Hardware */}
        <div className="bg-gray-50 rounded p-4 text-xs space-y-1 border">
          <div className="font-semibold text-sm mb-1">Device Hardware</div>
          <div>
            Operating System : <span className="font-medium">macOS 14.2.1</span>
          </div>
          <div>
            Browser : <span className="font-medium">Chrome 120.0.6099.234</span>
          </div>
          <div>
            Screen Resolution :{" "}
            <span className="font-medium">1440x900 (Retina)</span>
          </div>
          <div>
            Hardware Concurrency : <span className="font-medium">8 cores</span>
          </div>
          <div>
            Memory (RAM) : <span className="font-medium">16 GB</span>
          </div>
          <div>
            WebGL Renderer :{" "}
            <span className="font-medium">AMD Radeon Pro 5500M</span>
          </div>
          <div>
            Canvas Fingerprint :{" "}
            <span className="font-medium">z735qv4f8d9...</span>
          </div>
        </div>
        {/* Behavioral Analytics */}
        <div className="bg-gray-50 rounded p-4 text-xs space-y-1 border">
          <div className="font-semibold text-sm mb-1">Behavioral Analytics</div>
          <div>
            Mouse Clicks : <span className="font-medium">147 clicks</span>
          </div>
          <div>
            Avg. Mouse Velocity :{" "}
            <span className="font-medium">234.7 px/s</span>
          </div>
          <div>
            Typing Speed : <span className="font-medium">68 WPM</span>
          </div>
          <div>
            Keystroke Dynamics : <span className="font-medium">Consistent</span>
          </div>
          <div>
            Scroll Patterns : <span className="font-medium">Human-like</span>
          </div>
          <div>
            Focus Events : <span className="font-medium">12 tab switches</span>
          </div>
          <div>
            Form Interaction :{" "}
            <span className="font-medium">Natural progression</span>
          </div>
        </div>
        {/* Geolocation & Network */}
        <div className="bg-gray-50 rounded p-4 text-xs space-y-1 border">
          <div className="font-semibold text-sm mb-1">
            Geolocation & Network
          </div>
          <div>
            IP Address : <span className="font-medium">197.210.45.12</span>
          </div>
          <div>
            ISP : <span className="font-medium">MTN Nigeria</span>
          </div>
          <div>
            Proxy/VPN Status :{" "}
            <span className="font-medium">None detected</span>
          </div>
          <div>
            Timezone : <span className="font-medium">Africa/Lagos (UTC+1)</span>
          </div>
          <div>
            Language Preference : <span className="font-medium">en-GB</span>
          </div>
          <div>
            RTT Latency : <span className="font-medium">156ms</span>
          </div>
        </div>
        {/* Advanced Fingerprinting */}
        <div className="bg-gray-50 rounded p-4 text-xs space-y-1 border">
          <div className="font-semibold text-sm mb-1">
            Advanced Fingerprinting
          </div>
          <div>
            Audio Context : <span className="font-medium">7fq9b21d...</span>
          </div>
          <div>
            WebRTC Fingerprint :{" "}
            <span className="font-medium">unique_ice_candidate</span>
          </div>
          <div>
            Installed Fonts :{" "}
            <span className="font-medium">247 fonts detected</span>
          </div>
          <div>
            Browser Plugins :{" "}
            <span className="font-medium">12 active plugins</span>
          </div>
          <div>
            Media Devices :{" "}
            <span className="font-medium">2 cameras, 1 microphone</span>
          </div>
          <div>
            CPU Architecture : <span className="font-medium">x86_64</span>
          </div>
          <div>
            Device Memory : <span className="font-medium">8 GB available</span>
          </div>
        </div>
        {/* Risk Assessment */}
        <div className="bg-gray-50 rounded p-4 text-xs space-y-1 border">
          <div className="font-semibold text-sm mb-1">Risk Assessment</div>
          <div>
            Overall Risk Score :{" "}
            <span className="font-medium">12/100 (LOW)</span>
          </div>
          <div>
            Fraud Probability : <span className="font-medium">2.3%</span>
          </div>
          <div>
            Device Reputation : <span className="font-medium">Excellent</span>
          </div>
          <div>
            User Behavior Score : <span className="font-medium">95/100</span>
          </div>
          <div>
            Historical Trust :{" "}
            <span className="font-medium">47 previous sessions</span>
          </div>
          <div>
            Anomaly Detection :{" "}
            <span className="font-medium">2 minor flags</span>
          </div>
          <div>
            ML Confidence : <span className="font-medium">98.7%</span>
          </div>
        </div>
        {/* Device Hardware (right) */}
        <div className="bg-gray-50 rounded p-4 text-xs space-y-1 border">
          <div className="font-semibold text-sm mb-1">Device Hardware</div>
          <div>
            Session Start : <span className="font-medium">14:23:45 UTC</span>
          </div>
          <div>
            Session Duration : <span className="font-medium">24m 31s</span>
          </div>
          <div>
            Page Views : <span className="font-medium">17 pages</span>
          </div>
          <div>
            User Agent : <span className="font-medium">Chrome/120.0 macOS</span>
          </div>
          <div>
            Referral : <span className="font-medium">Direct traffic</span>
          </div>
          <div>
            SDK Version : <span className="font-medium">v3.2.1 Enterprise</span>
          </div>
          <div>
            Data Quality : <span className="font-medium">Complete (100%)</span>
          </div>
        </div>
      </div>

      {/* Behavioral Anomalies Alert */}
      <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-xs mb-4">
        <div className="font-semibold mb-1 flex items-center gap-1">
          <span>⚠️</span> Behavioural Anomalies Detected
        </div>
        <ul className="list-disc pl-5">
          <li>
            Slightly elevated mouse movement speed (234.7 px/s vs avg 198.3
            px/s)
          </li>
          <li>
            Form completion time 15% faster than user&apos;s historical average
          </li>
        </ul>
      </div>

      {/* Raw Fingerprint Data */}
      <div className="bg-gray-50 rounded p-4 border">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-sm">Raw Fingerprint Data</div>
          <div className="flex gap-2">
            <CButton
              className={`px-4 py-1 rounded text-xs font-medium border hover:text-white ${
                dataTab === "json"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-700 border-blue-600"
              }`}
              onClick={() => setDataTab("json")}
            >
              JSON Data
            </CButton>
            <CButton
              className={`px-4 py-1 rounded text-xs font-medium border hover:text-white ${
                dataTab === "schema"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-700 border-blue-600"
              }`}
              onClick={() => setDataTab("schema")}
            >
              Schema
            </CButton>
            <CButton className="px-2 py-1 rounded text-xs font-medium border bg-white text-blue-700 border-blue-600 hover:text-white">
              Copy JSON
            </CButton>
          </div>
        </div>
        {dataTab === "json" ? (
          <pre className="bg-black text-green-400 rounded p-2 text-xs overflow-x-auto max-h-100 mt-2">
            {`{
  "sessionId": "fp_789adcb_ent",
  "timestamp": "2025-07-09T14:23:45.132Z",
  "userId": "user_01@enterprise.com",
  "riskScore": 12,
  "fraudProbability": 0.023,
  "deviceFingerprint": {
    "cpuCores": 8,
    "totalMemory": 17179869184,
    "availableMemory": 8589934592,
    "architecture": "x86",
    "platform": "macOS",
    "hardwareConcurrency": 8,
    "deviceMemory": 8,
    "maxTouchPoints": 0
  },
  "display": {
    "width": 1440,
    "screenHeight": 900,
    "availWidth": 1440,
    "availHeight": 877,
    "colorDepth": 24,
    "pixelDepth": 24,
    "orientation": "landscape-primary"
  }
}`}
          </pre>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-xs border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-100 text-blue-700">
                  <th className="px-4 py-2 text-left font-semibold">Field</th>
                  <th className="px-4 py-2 text-left font-semibold">Type</th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Required
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {schema.map((row, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {row.field}
                    </td>
                    <td className="px-4 py-2 text-orange-500 whitespace-nowrap">
                      {row.type}
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {row.required}
                    </td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {row.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4 mt-4">
        <CButton
          onClick={() => setDeviceDetailTab("live-session")}
          className={clsx(
            "px-3 py-1 w-fit rounded  text-xs font-medium",
            deviceDetailTab == "live-session"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-primary-500 border border-primary-500"
          )}
        >
          Live Sessions
        </CButton>
        <CButton
          onClick={() => setDeviceDetailTab("behavioural-analytics")}
          className={clsx(
            "px-3 py-1 w-fit rounded  text-xs font-medium",
            deviceDetailTab == "behavioural-analytics"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-primary-500 border border-primary-500"
          )}
        >
          Behavioral Analytics
        </CButton>
        <CButton
          onClick={() => setDeviceDetailTab("threat-intelligence")}
          className={clsx(
            "px-3 py-1 w-fit rounded  text-xs font-medium",
            deviceDetailTab == "threat-intelligence"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-primary-500 border border-primary-500"
          )}
        >
          Threat Intelligence
        </CButton>
        <CButton
          onClick={() => setDeviceDetailTab("ezra-analyst")}
          className={clsx(
            "px-3 py-1 w-fit rounded  text-xs font-medium",
            deviceDetailTab == "ezra-analyst"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-primary-500 border border-primary-500"
          )}
        >
          Ezra AI Analyst
        </CButton>
        <CButton
          onClick={() => setDeviceDetailTab("compliance")}
          className={clsx(
            "px-3 py-1 w-fit rounded  text-xs font-medium",
            deviceDetailTab == "compliance"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-primary-500 border border-primary-500"
          )}
        >
          Compliance
        </CButton>
        <CButton
          onClick={() => setDeviceDetailTab("investigations")}
          className={clsx(
            "px-3 py-1 w-fit rounded  text-xs font-medium",
            deviceDetailTab == "investigations"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-primary-500 border border-primary-500"
          )}
        >
          Investigations
        </CButton>
      </div>

      <motion.div
        key={deviceDetailTab}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          type: "spring",
          damping: 8,
          stiffness: 70,
        }}
      >
        {content}
      </motion.div>
    </Modal>
  );
};

export default DeviceDetail;
