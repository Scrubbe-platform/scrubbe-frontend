import React from "react";
import Cbutton from "./Cbutton";
import { Button } from "../ui/button";

const Hero = () => {
  const tools = [
    "PostgreSQL",
    "AWS",
    "Azura",
    "GCP",
    "Crowdstrike",
    "Cisco Umbrella",
    "Okta",
    "Splunk",
    "Service Now",
    "50+",
  ];
  return (
    <section className="relative top-0 h-[84vh] min-h-[400px] w-full bg-cover bg-[url('/hero.png')] bg-no-repeat bg-center flex items-center justify-center ">
      <div className="bg-black/60 w-full h-full flex flex-col items-center justify-center gap-6 sm:gap-8 py-8 sm:py-12 md:py-16 px-2 sm:px-4 md:px-8">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold text-center leading-tight">
          Understand the who, what, when, and <br className="hidden xl:block" />{" "}
          why behind every alert with Ezra AI
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white text-center max-w-2xl">
          Empower your SOC with AI-driven automation, detailed log analysis, and
          integrations with:
        </p>
        <div className="flex gap-2 sm:gap-4 max-w-xs sm:max-w-2xl flex-wrap justify-center px-2 sm:px-5">
          {tools.map((tool) => (
            <div
              key={tool}
              className="bg-gradient-to-b from-zinc-600 to-zinc-900 h-9 sm:h-[41px] flex justify-center items-center px-3 sm:px-[10px] text-xs sm:text-base text-white border rounded-md mb-2"
            >
              {tool}
            </div>
          ))}
        </div>

        <div className="flex flex-row gap-3 sm:gap-5 w-full max-w-xs sm:max-w-none items-center justify-center">
          <Cbutton className="w-full sm:w-auto p-4 sm:p-6">Get Started</Cbutton>
          <Button className="w-full sm:w-auto border p-4 sm:p-6">
            Request Demo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
