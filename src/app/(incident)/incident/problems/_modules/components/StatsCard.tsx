import React from "react";

const StatsCard = ({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string | number;
  valueColor?: string;
}) => {
  return (
    <div
      className={`text-left p-4 border-r last:border-r-0 border-zinc-100 hover:bg-zinc-50/50 transition-colors relative`}
    >
      <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
        {label}
      </div>
      <div
        className={`text-2xl font-bold font-mono tracking-tight leading-none mt-2 ${valueColor}`}
      >
        {value}
      </div>
    </div>
  );
};

export default StatsCard;
