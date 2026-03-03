import React, { useState } from "react";
import Modal from "../ui/Modal";
import CButton from "../ui/Cbutton";
import { EzraChatWidget } from "../ezra/EzraChatWidget";

const EzraAnalyst = () => {
  const [openEzra, setOpenEzra] = useState(false);
  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-6 border">
      <div className="mb-2">
        <div className="font-semibold text-lg">Ezra AI Security Analyst</div>
        <div className="text-gray-500 text-sm mb-4">
          Advanced ML Model Explainability & Fraud Intelligence
        </div>
        {/* Risk Analysis Card */}
        <div className="bg-black text-white rounded-lg p-5 mb-6">
          <div className="mb-2 font-medium">
            Risk Analysis for Session:{" "}
            <span className="text-gray-200">fp_789adcb_ent</span>
          </div>
          <div className="mb-4 text-sm">
            Based on my analysis of 847 behavioral and device features, this
            session shows a{" "}
            <span className="text-green-400">LOW risk profile (12/100)</span>.
            <br />
            Here&apos;s my reasoning:
          </div>
          <div className="mb-2">
            <span className="font-semibold">
              🗝️ Key Factors Contributing to LOW Risk:
            </span>
            <ul className="list-disc pl-6 text-sm mt-1">
              <li>
                Mouse movement patterns show natural human variance (234.7 px/s
                avg velocity)
              </li>
              <li>Keystroke dynamics exhibit consistent timing patterns</li>
              <li>Device fingerprint matches 47 previous trusted sessions</li>
              <li>No automation signatures detected</li>
            </ul>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-yellow-400">
              ⚠️ Minor Anomalies Detected:
            </span>
            <ul className="list-disc pl-6 text-sm mt-1">
              <li>Mouse velocity 18% above user average (67% confidence)</li>
              <li>
                Form completion 15% faster than historical average (72%
                confidence)
              </li>
            </ul>
          </div>
          <div className="mt-2">
            <span className="font-semibold text-pink-300">
              💕 Recommendation:
            </span>{" "}
            Allow transaction with standard monitoring. Risk of fraud: 2%
          </div>
        </div>
        <div className="flex justify-end my-6">
          <CButton
            onClick={() => setOpenEzra(true)}
            className="px-6 py-2 w-fit rounded bg-blue-600 text-white text-sm font-semibold border border-blue-600 hover:bg-blue-700"
          >
            Query Ezra about Fingerprint
          </CButton>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex-1 bg-white rounded-lg p-3 flex flex-col items-center border">
            <div className="text-2xl font-bold text-blue-600">98.7%</div>
            <div className="text-blue-600 text-sm ">Security Score</div>
            <div className="text-green-500 text-xs mt-1">
              ↗ 0.3% vs last week
            </div>
          </div>
          <div className="flex-1  bg-white rounded-lg p-3 flex flex-col items-center border">
            <div className="text-2xl font-bold text-blue-600">0.8%</div>
            <div className="text-blue-600 text-sm">False Positive rate</div>
            <div className="text-pink-500 text-xs mt-1">
              ↘ 0.2 % vs Last week
            </div>
          </div>
          <div className="flex-1 bg-white rounded-lg p-3 flex flex-col items-center border">
            <div className="text-2xl font-bold text-blue-500">1.2%</div>
            <div className="text-blue-600 text-sm ">False Negative rate</div>
            <div className="text-pink-500 text-xs mt-1">
              ↘ 0.1% vs last week
            </div>
          </div>
          <div className="flex-1 bg-white rounded-lg p-4 flex flex-col items-center border">
            <div className="text-2xl font-bold text-blue-500">
              4.2 <span className="text-base">ms</span>
            </div>
            <div className="text-blue-600 text-sm">Inference Time</div>
            <div className="text-green-500 text-xs mt-1">
              ↗ 0.1ms vs last week
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[260px] bg-white rounded-lg p-4 border">
            <div className="font-semibold text-gray-700 mb-2">
              A/B Testing Framework
            </div>
            <div className="flex justify-between text-xs mb-1 border-b pb-1">
              <span>Active Test</span>
              <span className="font-semibold">
                3 <span className="text-gray-500 font-normal">running</span>
              </span>
            </div>
            <div className="flex justify-between text-xs mb-1 border-b pb-1">
              <span>Model Challenger</span>
              <span className="font-semibold">v3.2.2 vs v3.2.1</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Performance Lift</span>
              <span className="font-semibold text-green-600">
                +2.3% accuracy
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-[260px] bg-white rounded-lg p-4 border">
            <div className="font-semibold text-gray-700 mb-2">
              Model Drift Detection
            </div>
            <div className="flex justify-between text-xs mb-1 border-b pb-1">
              <span>Feature Drift Score</span>
              <span className="font-semibold">
                0.023<span className="text-gray-500 font-normal">(low)</span>
              </span>
            </div>
            <div className="flex justify-between text-xs mb-1 border-b pb-1">
              <span>Prediction Drift</span>
              <span className="font-semibold">
                0.015
                <span className="text-gray-500 font-normal">(stable)</span>
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Next Retrain</span>
              <span className="font-semibold">14 days</span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openEzra}
        onClose={() => setOpenEzra(false)}
        className="!p-0"
      >
        <EzraChatWidget />
      </Modal>
    </div>
  );
};

export default EzraAnalyst;
