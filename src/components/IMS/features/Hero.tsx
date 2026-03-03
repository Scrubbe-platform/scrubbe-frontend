"use client";
import CButton from "@/components/ui/Cbutton";
import { useRouter } from "next/navigation";
import React from "react";

const Hero = () => {
  const router = useRouter();
  return (
    <div className="h-screen relative z-10">
      <img
        src="/IMS/feature-bg.jpg"
        className=" w-full h-full object-cover brightness-50 absolute z-0"
        alt=""
      />
      <div className="flex flex-col justify-center items-center z-10 w-full h-full relative gap-5 p-10">
        <p className=" max-w-4xl text-white text-4xl sm:text-5xl md:text-6xl font-bigshotOne text-center">
          Features — Everything You Need for Incident Resilience
        </p>
        <p className=" md:text-lg text-white text-center">
          Comprehensive tools for incident detection, collaboration, and
          recovery — unified in a single enterprise platform.
        </p>
        <div className="flex sm:flex-row flex-col gap-3 mt-4 ">
          <CButton className="w-[300px]">View Demo</CButton>
          <CButton
            onClick={() => router.push("/auth/signin")}
            className="w-[300px] text-IMSLightGreen bg-white hover:text-white"
          >
            Explore Integrations
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default Hero;
