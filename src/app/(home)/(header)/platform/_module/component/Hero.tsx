import React from "react";

const Hero = () => {
  return (
    <div className=" bg-top bg-[url('/IMS/platform.jpg')] h-[600px] w-full relative overflow-hidden px-10 md:p-20 flex justify-center flex-col ">
      <div className=" max-w-4xl space-y-4">
        <h2 className="text-4xl md:text-6xl leading-tight tracking-tight text-slate-900">
          <span className="block font-serif text-slate-800">
            The orchestration engine at the{" "}
          </span>
          <span className="block font-serif italic text-zinc-500 -mt-2 md:-mt-4">
            center of every incident.{" "}
          </span>
        </h2>
        <p>
          Scrubbe's platform is the core orchestration engine that coordinates
          incident investigation, decision-making, and governed execution across
          the production stack. It is not a collection of disconnected agents.
        </p>
        <p>
          It is the control layer that turns production signals, system context,
          policy constraints, and execution pathways into one governed
          operational workflow — from first detection through verified recovery.
        </p>
      </div>
    </div>
  );
};

export default Hero;
