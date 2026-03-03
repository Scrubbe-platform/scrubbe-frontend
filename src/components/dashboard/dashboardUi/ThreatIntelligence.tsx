import clsx from "clsx";
import { ArrowRight, Atom } from "lucide-react";
import React from "react";

const SeverityTag = ({ value }: { value: "high" | "medium" }) => {
  return (
    <p
      className={clsx(
        " text-xs capitalize rounded-sm px-2 py-1",
        value == "high"
          ? "text-rose-500 dark:bg-rose-700/10 bg-rose-100"
          : "text-orange-500 dark:bg-orange-700/10 bg-orange-100"
      )}
    >
      {value}
    </p>
  );
};

const SeverityItemTag = ({
  text,
  value,
}: {
  text: string;
  value: "high" | "medium";
}) => {
  return (
    <div className="flex justify-between items-center">
      <p className=" text-xs dark:text-white">{text}</p>
      <SeverityTag value={value} />
    </div>
  );
};

const ThreatIntelligence = () => {
  return (
    <div className="p-4 dark:bg-dark bg-white rounded-lg space-y-5 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center text-colorScBlue">
          <Atom />
          <p className=" dark:text-white text-black font-medium">
            Threat Intelligence
          </p>
        </div>
        <div className="flex items-start gap-2 text-colorScBlue cursor-pointer">
          <p className=" text-sm font-medium">View Details</p>
          <ArrowRight size={17} />
        </div>
      </div>

      <div className="p-3 border dark:border-zinc-700 border-zinc-200 rounded-md space-y-1">
        <p className="dark:text-white font-medium text-sm">
          Active threat campaigns
        </p>
        <SeverityItemTag
          value="high"
          text=" Payment fraud indicators(Bin attacks , Card testing)"
        />
        <SeverityItemTag
          value="medium"
          text=" Abuse of financial APIs(Fake Transactions)"
        />
      </div>
      <div className="p-3 border dark:border-zinc-700 border-zinc-200 rounded-md space-y-1">
        <p className="dark:text-white font-medium text-sm">
          Global threat level
        </p>
        <SeverityItemTag value="high" text="Ransomware" />
        <SeverityItemTag value="medium" text="Phising" />
        <SeverityItemTag value="high" text="Dos" />
        <SeverityItemTag value="medium" text="Apt" />
      </div>

      <div className="p-3 border dark:border-zinc-700 border-zinc-200 rounded-md space-y-2">
        <p className="dark:text-white font-medium text-sm">Recent 10CS</p>
        <div className="flex justify-between items-center ">
          <p className="text-sm dark:text-white">192.168.14.55</p>
          <p className="text-sm dark:text-white">C2 server</p>
        </div>
      </div>
    </div>
  );
};

export default ThreatIntelligence;
