import AdvanceFeature from "@/components/IMS/features/AdvanceFeature";
import CoreFeatures from "@/components/IMS/features/CoreFeatures";
import Hero from "@/components/IMS/features/Hero";
import HowItWork from "@/components/IMS/features/HowItWork";
import UseCase from "@/components/IMS/features/UseCase";
import React from "react";

const page = () => {
  return (
    <div>
      <Hero />
      <CoreFeatures />
      <AdvanceFeature />
      <HowItWork />
      <UseCase />
    </div>
  );
};

export default page;
