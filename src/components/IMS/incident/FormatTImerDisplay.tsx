import React from "react";

const FormatTimerDisplay = ({ totalSeconds = 0 }: { totalSeconds: number }) => {
  // Extract hours, minutes, and seconds from the total seconds count
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Helper to ensure uniform double-digit output (e.g., "02")
  const formatDigit = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="">
      <div className="text-sm font-ibm font-medium text-black dark:text-zinc-500 mb-1.5">
        Time Worked
      </div>

      <div className="flex items-center gap-2 font-sans">
        {/* Hours Box */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-[40px] h-[30px] border dark:border-zinc-300 border-[#DDDDDD] rounded-lg flex items-center justify-center text-sm font-medium text-slate-800 bg-white">
            {formatDigit(hours)}
          </div>
          <span className="text-[7px] text-slate-400 uppercase">HH</span>
        </div>

        {/* Colon separator */}
        <div className="text-xl  text-slate-300 pb-[18px]">:</div>

        {/* Minutes Box */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-[40px] h-[30px] border dark:border-zinc-500 border-[#DDDDDD] rounded-lg flex items-center justify-center text-sm font-medium text-slate-800 bg-white">
            {formatDigit(minutes)}
          </div>
          <span className="text-[7px] text-slate-400 uppercase">MM</span>
        </div>

        {/* Colon separator */}
        <div className="text-xl  text-slate-300 pb-[18px]">:</div>

        {/* Seconds Box */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-[40px] h-[30px] border dark:border-zinc-300 border-[#DDDDDD] rounded-lg flex items-center justify-center text-sm font-medium text-slate-800 bg-white">
            {formatDigit(seconds)}
          </div>
          <span className="text-[7px] text-slate-400 uppercase">SS</span>
        </div>
      </div>
    </div>
  );
};

export default FormatTimerDisplay;
