import React from "react";
import Cbutton from "./Cbutton";

const rawLogs = [
  "[2025-05-31 14:00:01] Failed Login Attempt from IP 192.168.1.10, User: admin",
  "[2025-05-31 14:00:05] Suspicious File Download Detected, Endpoint-123",
  "[2025-05-31 14:00:10] Anomalous Traffic, Port: 8080",
  "[2025-05-31 14:05:15] Malware Scan: Trojan Detected, File: report.exe",
];

const incidentSummaries = [
  "Incident: Failed Login Attempt; Priority: High; Action: Block IP, Notify Admin; Impact: Potential Credential Stuffing",
  "Incident: Suspicious File Download; Priority: Medium; Action: Quarantine File, Scan Endpoint; Impact: Possible Data Exfiltration",
  "Incident: Anomalous Traffic; Priority: Low; Action: Monitor Traffic, Update Firewall Rules; Impact: Potential Reconnaissance",
];

const RealTimeLogs = () => {
  return (
    <section className="w-full min-h-screen  py-16 px-2 sm:px-6 md:px-12  relative">
      <div className=" h-[400px] w-[400px] rounded-full  bg-colorScBlue/20 absolute top-0 left-0 z-0 blur-3xl" />
      <div className="max-w-7xl flex flex-col items-center mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-4">
          Real time log Analysis and Incident Handling
        </h2>
        <div className="w-48 h-1 bg-teal-400 mx-auto mb-12 rounded-full" />
        <div className=" relative w-full bg-subDarkEzra rounded-xl p-6 sm:p-10 flex flex-col lg:flex-row gap-8 mb-12 shadow-lg">
          {/* Raw Logs Summary */}
          <div className="flex-1 bg-darkEzra p-5 rounded-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Raw Logs Summary
            </h3>
            <div className="flex flex-col gap-4">
              {rawLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="bg-subDarkEzra text-zinc-200 rounded-sm px-4 py-3 text-sm sm:text-base log-entry"
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
          {/* Incident Summaries */}
          <div className="flex-1 bg-darkEzra p-5 rounded-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Incident Summaries
            </h3>
            <div className="flex flex-col gap-4">
              {incidentSummaries.map((incident, idx) => (
                <div
                  key={idx}
                  className="bg-subDarkEzra text-zinc-200 rounded-md px-4 py-3 text-sm sm:text-base summary-entry"
                >
                  {incident}
                </div>
              ))}
            </div>
          </div>
        </div>
        <Cbutton>Request a Live Demo</Cbutton>
        {/* <Cbutton className=" mt-6">Request a Live Demo</Cbutton> */}
      </div>
    </section>
  );
};

export default RealTimeLogs;
