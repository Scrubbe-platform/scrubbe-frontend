import React from "react";
import Hero from "./_module/component/Hero";
import DocSections from "./_module/component/DocSection";

const page = () => {
  return (
    <div>
      <Hero />
      <div className="bg-zinc-100 py-6 mx-auto px-10 text-center border-b border-zinc-300">
        <p className="font-mono tracking-tight text-sm">
          <span className="text-zinc-400">Platform invariant </span>
          No remediation is executable unless it is{" "}
          <span className="text-green">evidence-backed</span>,{" "}
          <span className="text-green">blast-radius-scored</span>, and{" "}
          <span className="text-green">policy-approved</span>.
        </p>
      </div>
      <DocSections />
    </div>
  );
};

export default page;
