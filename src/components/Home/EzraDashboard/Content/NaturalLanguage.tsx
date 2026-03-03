import { Button } from "@/components/ui/button";
import React from "react";

const NaturalLanguage = () => {
  return (
    <div className=" w-full h-full relative">
      <div className=" absolute top-0 flex justify-between items-center w-full z-10">
        <p className="text-white text-[90%] font-medium">
          Scrubbe Natural language Rule Input
        </p>
        <Button
          variant={"outline"}
          className=" bg-transparent border-colorScBlue border text-colorScBlue h-[40px]"
        >
          View Details
        </Button>
      </div>
      <img src="/natural_language_bg.png" className=" scale-105"  alt="natural_language_bg.png"/>
    </div>
  );
};

export default NaturalLanguage;
