"use client";
import ProgressBar from "@/components/ezra/ProgressBar";
import React from "react";
import { IoMdCheckboxOutline } from "react-icons/io";

const MeanTimeResolution = () => {
  return (
    <div className=" p-4 space-y-2 border rounded-lg dark:border-zinc-600 border-zinc-200 flex-col flex justify-between">
      <div className="flex justify-between items-center">
        <p className="dark:text-white font-medium">Mean time to Resolution</p>
        <div className="flex items-center gap-1 text-green-500">
          <IoMdCheckboxOutline />
          <p className=" text-xs">Under target</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center px-2 pb-1 mb-2  border-b border-gray-200 dark:border-gray-700 ">
          <p className=" text-sm font-thin dark:text-white">Current</p>
          <p className=" text-sm font-medium dark:text-white">3h 45m</p>
        </div>
        <div className="flex justify-between items-center px-2 pb-1 border-b border-gray-200 dark:border-gray-700 ">
          <p className=" text-sm font-thin dark:text-white">Target</p>
          <p className=" text-sm font-medium dark:text-white">5h 35m</p>
        </div>
      </div>

      <div className=" rounded-md p-2 space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm dark:text-white font-medium">
            Threat Level Indicator
          </p>
          <p className="text-sm dark:text-orange-400 text-orange-500 ">
            Elevated
          </p>
        </div>
        <ProgressBar
          value={100}
          color=" bg-gradient-to-r from-green-600 via-orange-600 to-rose-600"
        />
        <div className="flex justify-between items-center">
          <p className=" font-thin dark:text-white text-xs">Low</p>
          <p className=" font-thin dark:text-white text-xs">Elevated</p>
          <p className=" font-thin dark:text-white text-xs">Critical</p>
        </div>
      </div>
    </div>
  );
};

export default MeanTimeResolution;
