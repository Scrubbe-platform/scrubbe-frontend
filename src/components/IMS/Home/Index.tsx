import React from "react";
import Hero from "./Hero";
import Features from "./Features";
import Impacts from "./Impacts";
import Contact from "./Contact";
import HowItWorks from "./HowItWorks";
import ApiReference from "./ApiReference";

const Index = () => {
  return (
    <div className=" overflow-x-hidden bg-[#060709]">
      <Hero />
      <Features />
      <HowItWorks />
      <ApiReference />
      {/* <VideoSection /> */}
      {/* <UseCase /> */}
      {/* <FeatureComparisonTable /> */}
      <Impacts />
      <Contact />
    </div>
  );
};

export default Index;
