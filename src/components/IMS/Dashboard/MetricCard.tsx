// components/MetricCard.tsx
import React from "react";
import { BsArrowUp, BsArrowDown } from "react-icons/bs";

type Props = {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
  iconColor: string;
};

const MetricCard: React.FC<Props> = ({
  title,
  value,
  icon,
  trend,
  iconColor,
}) => {
  return (
    <div className="flex p-6 bg-white rounded-lg shadow-sm space-x-4">
      <div className="flex-grow">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <div className="flex items-center space-x-2 mt-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div
              className={`text-sm ${
                trend === "up" ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {trend === "up" ? <BsArrowUp /> : <BsArrowDown />}
            </div>
          )}
        </div>
      </div>
      <div
        className={` size-10 justify-center items-center flex rounded-full ${iconColor}`}
      >
        {icon}
      </div>
    </div>
  );
};

export default MetricCard;
