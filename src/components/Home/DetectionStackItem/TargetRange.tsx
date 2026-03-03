import React from "react";

const targets = [
  {
    title: "Data sources Supported",
    sub: "50+ Integrations and growing",
  },
  {
    title: "Log Events Ingested",
    sub: "2.1M+ events processed in early customer environments",
  },
  {
    title: "Detection Rules Built",
    sub: "1,400+ NLRI rules defined using natural language",
  },
  {
    title: "Incidents Automated",
    sub: "92% of alerts auto-triaged with AI-driven playbooks",
  },
  {
    title: "Response Time",
    sub: "< 90 seconds average time to resolution (pilot accounts)",
  },
];
const TargetRange = () => {
  return (
    <div>
      <p className=" text-lg font-medium">Target Range</p>
      <div className=" grid-cols-2 grid gap-4 mt-5">
        {targets.map((target) => (
          <div
            key={target.title}
            className=" border-l-3 border-blue-400 pl-2 space-y-2"
          >
            <p className=" font-medium text-xs sm:text-base">{target.title}</p>
            <p className="text-xs sm:text-base">{target.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TargetRange;
