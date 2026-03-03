import React from "react";

const investigations = [
  {
    id: "INV-2025-001247",
    title:
      "Coordinated attack detected: 15 devices with identical behavioral patterns attempting account takeover",
    assigned: "Sarah Chen",
    riskScore: 94,
    estLoss: "$127,000",
    status: "Suspicious",
    statusColor: "bg-red-50 text-red-500 border border-red-100",
    time: "2 mins ago",
  },
  {
    id: "INV-2025-001247",
    title:
      "Synthetic identity fraud: Device fingerprint inconsistencies across multiple applications",
    assigned: "Marcus Johnson",
    riskScore: 87,
    estLoss: "$45,200",
    status: "High",
    statusColor: "bg-yellow-50 text-yellow-600 border border-yellow-100",
    time: "2 mins ago",
  },
  {
    id: "INV-2025-001245",
    title:
      "Unusual velocity pattern: User completing forms 300% faster than historical baseline",
    assigned: "Sarah Chen",
    riskScore: 94,
    estLoss: "$127,000",
    status: "Medium",
    statusColor: "bg-green-50 text-green-500 border border-green-100",
    time: "2 mins ago",
  },
];

const Investigations = () => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border mt-6">
      <div className="mb-2">
        <div className="font-semibold text-lg text-gray-800">
          Active Investigation Queue
        </div>
        <div className="text-gray-500 text-sm mb-4">
          Advanced ML Model Explainability & Fraud Intelligence
        </div>
        {/* Investigation List */}
        <div className="divide-y divide-gray-200 mb-8">
          {investigations.map((inv, i) => (
            <div key={i} className="py-4 flex flex-col gap-1 relative">
              <div className="flex items-center justify-between">
                <a
                  href="#"
                  className="font-semibold text-blue-600 hover:underline text-base"
                >
                  {inv.id}
                </a>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${inv.statusColor}`}
                >
                  {inv.status}
                </span>
              </div>
              <div className="font-medium text-gray-800 text-sm mb-1">
                {inv.title}
              </div>
              <div className="text-xs text-gray-500 flex flex-wrap gap-4 mb-1">
                <span>Assigned : {inv.assigned}</span>
                <span>Risk score : {inv.riskScore}/100</span>
                <span>Est loss : {inv.estLoss}</span>
              </div>
              <div className="text-xs text-gray-400 absolute right-0 bottom-2">
                {inv.time}
              </div>
            </div>
          ))}
        </div>
        {/* Summary Cards */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex-1 min-w-[240px] bg-white rounded-lg p-4 border">
            <div className="font-semibold text-gray-700 mb-2">
              Case Resolution
            </div>
            <div className="flex justify-between border-b border-zinc-200 pb-1 text-xs mb-1">
              <span>Avg Resolution Time</span>
              <span className="font-semibold">
                2.4 <span className="text-gray-500 font-normal">hours</span>
              </span>
            </div>
            <div className="flex justify-between text-xs mb-1  border-b border-zinc-200 pb-1">
              <span>Cases Closed Today</span>
              <span className="font-semibold">23</span>
            </div>
            <div className="flex justify-between text-xs  border-b border-zinc-200 pb-1">
              <span>SLA Compliance</span>
              <span className="font-semibold text-blue-600">97.8%</span>
            </div>
          </div>
          <div className="flex-1 min-w-[240px] bg-white rounded-lg p-4 border">
            <div className="font-semibold text-gray-700 mb-2">
              Model Drift Detection
            </div>
            <div className="flex justify-between text-xs mb-1  border-b border-zinc-200 pb-1">
              <span>Fraud Prevented (30d)</span>
              <span className="font-semibold">$2.4M</span>
            </div>
            <div className="flex justify-between text-xs mb-1  border-b border-zinc-200 pb-1">
              <span>Investigation ROI</span>
              <span className="font-semibold">847%</span>
            </div>
            <div className="flex justify-between text-xs  border-b border-zinc-200 pb-1">
              <span>Cost per Review</span>
              <span className="font-semibold">$23.40</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investigations;
