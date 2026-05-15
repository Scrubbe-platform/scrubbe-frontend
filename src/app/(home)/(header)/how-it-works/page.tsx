import React from "react";
import Hero from "./_module/component/Hero";
import DecisionLoopLayout from "./_module/component/DecisionLoopLayout";
import DecisionLoopHero from "./_module/component/DecisionLoopHero";
import ScrubbeClosing from "./_module/component/ScrubbeClosing";
import ArchitectureCTA from "./_module/component/Architecture";

const page = () => {
  return (
    <div>
      <Hero />
      <DecisionLoopLayout />
      <DecisionLoopHero />
      <ScrubbeClosing />
      <ArchitectureCTA />
    </div>
  );
};

export default page;
