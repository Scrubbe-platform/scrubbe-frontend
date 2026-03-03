"use client";
import React from "react";

function SecurityIntelligenceError({ error }: { error: string }) {
  const fingerprintItems = [
    { label: "VPN/Proxy Status", value: "Unknown" },
    { label: "Device Type", value: "Unknown" },
    { label: "Timestamp", value: "Unknown" },
    { label: "OS Model", value: "Unknown" },
    { label: "IP Address", value: "Unknown" },
    { label: "Country", value: "Unknown" },
    { label: "Region/City", value: "Unknown" },
    { label: "Browser Information", value: "Unknown" },
    { label: "ISP", value: "Unknown" },
    { label: "Device Trust Score", value: "0%" },
  ];

  return (
    <div className="w-full h-auto bg-[#EFF6FF]">
      <section className="w-full max-w-[1440px] mx-auto py-6 md:py-12 lg:py-16 px-4">
        {/* Error message */}
        <div className="max-w-4xl mx-auto mb-6 bg-red-100 rounded-lg p-4 text-red-600">
          <p>{error}</p>
        </div>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-800 mb-2">
            Security Intelligence in Action
          </h2>
          <div className="flex justify-center items-center mb-6">
            <div className="w-28 h-1 bg-emerald-400 mx-auto"></div>
          </div>
        </div>

        {/* Subheading */}
        <div className="text-center mb-12">
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
            Experience how Scrubbe collects and analyzes device and network data
            to enhance security monitoring.
          </p>
        </div>

        {/* Main Content - Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800">
                  Your Device FingerPrint
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Below is a sample of the type of data Scrubbe can collect and
                  analyse to identify Potentially Security Threats
                </p>
              </div>

              {/* Data Table */}
              <div className="border border-blue-100 rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <tbody>
                    {fingerprintItems.map((item, index) => (
                      <tr
                        key={item.label}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-6 border-b border-blue-100 border-r font-medium text-sm text-slate-700 bg-slate-50 w-1/3">
                          {item.label}
                        </td>
                        <td
                          className={`py-4 px-6 text-md ${
                            index < fingerprintItems.length - 1
                              ? "border-b border-blue-100"
                              : ""
                          } ${
                            item.label === "Device Trust Score"
                              ? "font-semibold text-red-600"
                              : ""
                          }`}
                        >
                          {item.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SecurityIntelligenceError;
