import React from "react";

const ourDifference = [
  {
    text: "Monitor & Detect",
    sub_text: "Real-time signals from CI/CD, cloud, and infrastructure tools.",
  },
  {
    text: "Diagnose & Automate",
    sub_text: "AI root-cause analysis with context-aware suggestions",
  },
  {
    text: "Resolve & Learn",
    sub_text:
      "Guided playbooks and postmortems that make every outage a lesson.",
  },
  {
    text: "Collaborate",
    sub_text:
      " Seamless integrations with Zoom, Teams, and Slack for live incident war rooms.",
  },
  {
    text: "Resilience First",
    sub_text:
      "Chaos engineering to simulate, test, and strengthen systems before failure.",
  },
];
const WhoWeServe = () => {
  return (
    <div className="min-h-[600px]">
      <div className=" max-w-[1440px] h-full mx-auto flex flex-col items-center gap-y-6 relative z-10 px-4 md:px-6 lg:px-20 xl:px-20">
        <div className=" p-4 md:p-10 overflow-hidden w-full  bg-blend-saturation bg-[#162932] bg-cover bg-center bg-no-repeat  rounded-[20px] min-h-[400px] mt-14 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl text-white font-bold font-bigshotOne">
              What We Do
            </h2>
            <p className="font-bold text-white mt-2">
              AI meets SRE resilience.Scrubbe is not just an incident tracker —
              it’s an intelligent reliability companion.
            </p>
          </div>

          <div className="mt-8">
            <div className="grid g md:grid-cols-3 gap-3">
              {ourDifference.slice(0, 3).map((value) => (
                <div
                  key={value.text}
                  className="p-2 md:p-4 bg-[#DFFFE1] rounded-md space-y-2 "
                >
                  <p className=" font-semibold text-lg">{value.text}</p>
                  <p className=" text-sm ">{value.sub_text}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {ourDifference.slice(3, 5).map((value) => (
                <div
                  key={value.text}
                  className="p-2 md:p-4 bg-[#DFFFE1] rounded-md space-y-2 "
                >
                  <p className=" font-semibold text-lg">{value.text}</p>
                  <p className=" text-sm ">{value.sub_text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhoWeServe;
