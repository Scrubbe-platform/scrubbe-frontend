import React from "react";

const details = [
  {
    title: "SIEM",
    description: "Scalable telemetry and event Visibility",
  },
  {
    title: "SOAR",
    description: "Automated Incident response",
  },
  {
    title: "Fraud Detection",
    description: "Behavior-based risk prevention",
  },
  {
    title: "NLRI",
    description:
      "Natural Language Rule Input - anyone can write detection logic",
  },
  {
    title: "Ezra AI",
    description: "Your embedded AI security analyst",
  },
  {
    title: "Fingerprint API",
    description: "Detects identity misuse and device anomalies",
  },
];
const WhatWeDo = () => {
  return (
    <div className=" bg-gradient-to-b from-[#111827] to-[#3D578D] min-h-[600px]">
      <div className=" max-w-[1440px] h-full mx-auto flex flex-col items-center gap-y-6 relative z-10 px-4 md:px-6 lg:px-20 xl:px-20 py-20">
        <div className="text-center mb-4">
          <h2 className="text-[20px] sm:text-[24px] md:text-[30px] lg:text-[36px] font-bold text-white mb-2">
            What We Do{" "}
          </h2>
          <div className="w-28 h-1 bg-emerald-400 mx-auto mb-4"></div>
          <p className="text-white text-sm sm:text-base md:max-w-2xl mx-auto">
            Scrubbe is a unified security platform that brings together:
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-white"></div>
          {details.map((item, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div
                key={index}
                className={`mb-10 flex w-full items-center ${
                  isLeft ? "flex-row justify-start" : " justify-end"
                }`}
              >
                <div className="w-1/2 p-4 text-right pr-12 md:pr-16">
                  {isLeft && (
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {item.title}
                      </h3>
                      <p className="text-white">{item.description}</p>
                    </div>
                  )}
                </div>

                {/* Timeline Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="h-4 w-4 rounded-full border-2 border-white bg-gray-600"></div>
                </div>

                <div className="w-1/2 p-4 text-left pl-12 md:pl-16">
                  {!isLeft && (
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {item.title}
                      </h3>
                      <p className="text-white">{item.description}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WhatWeDo;
