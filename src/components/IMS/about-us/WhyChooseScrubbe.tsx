import React from "react";

const WhyChooseScrubbe = () => {
  const comparisonData = [
    {
      challenge: "Incident Detection",
      traditional: "Manual, slow alerts",
      scrubbeIms: "AI-driven anomaly detection",
    },
    {
      challenge: "Communication",
      traditional: "Scattered across tools",
      scrubbeIms: "Unified war room",
    },
    {
      challenge: "Root Cause",
      traditional: "Manual log digging",
      scrubbeIms: "Predictive AI correlation",
    },
    {
      challenge: "Reporting",
      traditional: "Delayed and static",
      scrubbeIms: "Real-time dashboards",
    },
    {
      challenge: "Resilience",
      traditional: "Reactive",
      scrubbeIms: "Chaos-informed prevention",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 font-sans">
      {/* Main Heading and Subheading */}
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="md:text-5xl text-4xl font-bigshotOne font-bold text-scrubbe-dark mb-4 leading-tight">
          Why Choose Scrubbe
        </h1>
        <p className="text-xl text-gray-700 font-medium">
          Because reliability isn&apos;t a feature, it&apos;s your business
          foundation.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="w-full bg-white container rounded-lg overflow-hidden border border-gray-200">
        <div className="grid grid-cols-3 bg-[#00464D] text-white font-bold text-lg">
          <div className="p-4 border-r border-gray-700">Challenge</div>
          <div className="p-4 border-r border-gray-700">Traditional Tools</div>
          <div className="p-4">Scrubbe IMS</div>
        </div>

        {comparisonData.map((item, index) => (
          <div
            key={index}
            className={`grid grid-cols-3 text-gray-800 ${
              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            } border-t border-gray-200`}
          >
            <div className="p-4 font-semibold border-r border-gray-200">
              {item.challenge}
            </div>
            <div className="p-4 border-r border-gray-200">
              {item.traditional}
            </div>
            <div className="p-4">{item.scrubbeIms}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyChooseScrubbe;
