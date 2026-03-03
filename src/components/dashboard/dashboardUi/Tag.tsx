import clsx from "clsx";
import { Info } from "lucide-react";
import React from "react";

const Tags = ({
  label,
  value,
  severity,
  className,
}: {
  label: string;
  value: string;
  severity?: "critical" | "high" | "medium" | "low";
  className?: string;
}) => {
  return (
    <div
      className={clsx(
        "flex justify-between items-center p-2 border-l-4",
        className,
        {
          "border-rose-500 bg-rose-100 ": severity == "critical",
          "border-orange-500 bg-orange-100 ": severity == "high",
          "border-yellow-500 bg-yellow-100 ": severity == "medium",
          "border-blue-500 bg-blue-100 ": severity == "low",
        }
      )}
    >
      <div className="flex gap-2 items-center">
        <Info
          size={16}
          className={clsx({
            "text-rose-500  ": severity == "critical",
            "text-orange-500  ": severity == "high",
            "text-yellow-500  ": severity == "medium",
            "text-blue-500 ": severity == "low",
          })}
        />
        <p className=" text-sm">{label}</p>
      </div>
      <p className=" text-sm font-medium">{value}</p>
    </div>
  );
};

export default Tags;
