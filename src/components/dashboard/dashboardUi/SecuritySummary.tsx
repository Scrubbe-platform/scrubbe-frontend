import { ArrowRight, Atom } from "lucide-react";
import React from "react";
import TotalAlert from "./TotalAlert";
import UnresolveIncident from "./UnresolveIncident";
import TopAlertCategory from "./TopAlertCategory";
import MeanTimeResolution from "./MeanTimeResolution";

const SecuritySummary = () => {
  return (
    <div className="p-4 dark:bg-dark bg-white rounded-lg space-y-5 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center text-colorScBlue">
          <Atom />
          <p className=" dark:text-white text-black font-medium">
            Security Summary
          </p>
        </div>
        <div className="flex items-start gap-2 text-colorScBlue cursor-pointer">
          <p className=" text-sm font-medium">View Details</p>
          <ArrowRight size={17} />
        </div>
      </div>

      <div className=" grid md:grid-cols-2 gap-4">
        <TotalAlert />
        <UnresolveIncident />
        <TopAlertCategory />
        <MeanTimeResolution />
      </div>
    </div>
  );
};

export default SecuritySummary;
