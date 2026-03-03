import React from "react";

const Compliance = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-transparent p-4">
      {/* GDPR Compliance */}
      <div className="bg-white rounded-2xl border p-6 flex flex-col gap-2 min-w-[320px]">
        <div className="font-semibold  mb-2">GDPR Compliance</div>
        <div className="flex justify-between items-center py-2 border-b text-gray-700 text-xs">
          <span>Data Retention Policy</span>
          <span className="flex items-center px-3 py-1 rounded-lg border border-green-300 text-green-600 bg-green-50 text-xs font-medium">
            ● active
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b text-gray-700 text-xs">
          <span>Right to Delete Requests</span>
          <span className="font-semibold text-xs">
            4 <span className="font-normal text-gray-500">processed today</span>
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b text-gray-700 text-xs">
          <span>Consent Management</span>
          <span className="flex items-center px-3 py-1 rounded-lg border border-green-300 text-green-600 bg-green-50 text-xs font-medium">
            ● Compliant
          </span>
        </div>
        <div className="flex justify-between items-center py-2 text-gray-700 text-xs">
          <span>Data Breach SLA</span>
          <span className="font-semibold text-xs">&lt;72 hours</span>
        </div>
      </div>
      {/* SOC Type II */}
      <div className="bg-white rounded-2xl border p-6 flex flex-col gap-2 min-w-[320px]">
        <div className="font-semibold  mb-2">SOC Type II</div>
        <div className="flex justify-between items-center py-2 border-b text-gray-700 text-xs">
          <span>Security Controls</span>
          <span className="flex items-center px-3 py-1 rounded-lg border border-green-300 text-green-600 bg-green-50 text-xs font-medium">
            ● 98/98 passing
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b text-gray-700 text-xs">
          <span>Audit Status</span>
          <span className="font-semibold text-xs">Annual review - Q3</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b text-gray-700 text-xs">
          <span>Penetration Testing</span>
          <span className="font-semibold text-xs">Last: Jun 2025</span>
        </div>
        <div className="flex justify-between items-center py-2 text-gray-700 text-xs">
          <span>Vulnerability Scan</span>
          <span className="font-semibold text-xs">Weekly automated</span>
        </div>
      </div>
      {/* Audit Trail */}
      <div className="bg-white rounded-2xl border p-6 flex flex-col gap-2 min-w-[320px]">
        <div className="font-semibold  mb-2">Audit Trail</div>
        <div className="flex justify-between items-center py-2 border-b text-gray-700 text-xs">
          <span>Avg Resolution Time</span>
          <span className="font-semibold text-xs">847,293</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b text-gray-700 text-xs">
          <span>Storage Retention</span>
          <span className="font-semibold text-xs">7 years</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b text-gray-700 text-xs">
          <span>Integrity Verification</span>
          <span className="flex items-center px-3 py-1 rounded-lg border border-green-300 text-green-600 bg-green-50 text-xs font-medium">
            ● Verified
          </span>
        </div>
        <div className="flex justify-between items-center py-2 text-gray-700 text-xs">
          <span>Export Capability</span>
          <span className="flex items-center gap-1 font-semibold text-xs">
            <span className="text-green-500 text-lg">●</span> JSON, CSV, SIEM
          </span>
        </div>
      </div>
      {/* Data Lineage */}
      <div className="bg-white rounded-2xl border p-6 flex flex-col gap-2 min-w-[320px]">
        <div className="font-semibold  mb-2">Data Lineage</div>
        <div className="flex justify-between items-center py-2 border-b text-gray-700 text-xs">
          <span>PII Tracking</span>
          <span className="flex items-center px-3 py-1 rounded-lg border border-green-300 text-green-600 bg-green-50 text-xs font-medium">
            ● Verified
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b text-gray-700 text-xs">
          <span>Cross-border Transfers</span>
          <span className="font-semibold text-xs">EU-US: Compliant</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b text-gray-700 text-xs">
          <span>Data Classification</span>
          <span className="font-semibold text-xs">Automated tagging</span>
        </div>
        <div className="flex justify-between items-center py-2 text-gray-700 text-xs">
          <span>Anonymization</span>
          <span className="font-semibold text-xs">
            k=5 differential privacy
          </span>
        </div>
      </div>
    </div>
  );
};

export default Compliance;
