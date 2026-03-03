// components/SlaCard.tsx
import ProgressBar from "@/components/ezra/ProgressBar";
import React from "react";

type Props = {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
  compliance: number;
};

const SlaCard: React.FC<Props> = ({
  title,
  value,
  icon,
  iconColor,
  compliance,
}) => {
  return (
    <div className="flex flex-col p-6 bg-white rounded-lg shadow-sm gap-2">
      <div className="flex space-x-4">
        <div className="flex-grow">
          <p className="text-2xl font-bold">{title}</p>
          <p className="text-gray-500  font-medium text-sm mt-1">{value}</p>
        </div>
        <div
          className={` size-10 flex justify-center items-center rounded-full ${iconColor}`}
        >
          {icon}
        </div>
      </div>
      <ProgressBar color=" bg-emerald-500" value={compliance} />
    </div>
  );
};

export default SlaCard;
