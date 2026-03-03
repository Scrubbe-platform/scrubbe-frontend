import React from "react";

const targets = [
  {
    title: "Queries Handled by Ezra",
    sub: "30,000+ natural language questions answered",
  },
  {
    title: "Avg. Query Response Time",
    sub: "<1.5s average response time from Ezra",
  },
  {
    title: "Playbooks Executed",
    sub: "4,000+ actions triggered via automation",
  },
  {
    title: "Fingerprint Matches Scanned",
    sub: "200K+ sessions fingerprinted across users/devices",
  },
];

const AutomationNumber = () => {
  return (
    <div>
      <p className=" text-lg font-medium">Target Range</p>
      <div className=" grid-cols-2 grid gap-4 gap-y-6 mt-5">
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

export default AutomationNumber;
