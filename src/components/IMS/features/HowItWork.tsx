import React from "react";

const steps = [
  {
    title: "Monitor",
    description:
      "Continuously observe systems and integrations for proactive oversight.",
  },
  {
    title: "Defect",
    description: "Identify anomalies in real-time using AI and custom rules.",
  },
  {
    title: "Triage",
    description: "Prioritize and classify incidents for efficient response.",
  },
  {
    title: "Resolve",
    description: "Collaborate and apply fixes with guided analysis.",
  },
  {
    title: "Learn",
    description: "Analyze outcomes to prevent future disruptions.",
  },
];
const HowItWork = () => {
  return (
    <div className=" min-h-[600px] container mx-auto py-10 md:px-10 px-4">
      <p className="text-4xl sm:text-5xl text-center font-bigshotOne">
        How It Works
      </p>
      <div className="grid md:grid-cols-2 gap-8 mt-5">
        <div className=" h-[340px] md:h-[490px] py-10 px-4 md:px-16 bg-IMSDarkGreen rounded-2xl">
          <img
            src="/IMS/Dashboard.png"
            alt=""
            className=" w-full h-full object-cover"
          />
        </div>

        <div className=" space-y-5">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex gap-5">
              <div className=" size-16 min-w-16 rounded-full border border-zinc-500 flex justify-center items-center text-lg font-medium">
                {idx + 1}
              </div>
              <div>
                <p className=" font-semibold">{step.title}</p>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWork;
