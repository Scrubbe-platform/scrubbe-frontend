import clsx from "clsx";
import { Check, Copy } from "lucide-react";
import React, { useState } from "react";
import { RiNpmjsFill } from "react-icons/ri";
import { SiPnpm } from "react-icons/si";
import { TbBrandYarn } from "react-icons/tb";

const packageType = [
  {
    value: "npm",
    Icon: <RiNpmjsFill size={23} className=" text-red-500" />,
    install:
      "npm install @scrubbe/analytics @scrubbe/device-fingerprint @scrubbe/location-tracker @scrubbe/network-info @scrubbe/user-tracker",
  },
  {
    value: "Yarn",
    Icon: <TbBrandYarn size={23} className="text-blue-500" />,
    install:
      "yarn add @scrubbe/analytics @scrubbe/device-fingerprint @scrubbe/location-tracker @scrubbe/network-info @scrubbe/user-tracker",
  },
  {
    value: "pnpm",
    Icon: <SiPnpm size={18} className=" text-yellow-500" />,
    install:
      "pnpm install @scrubbe/analytics @scrubbe/device-fingerprint @scrubbe/location-tracker @scrubbe/network-info @scrubbe/user-tracker",
  },
];

const AllModules = () => {
  const [type, setType] = useState(packageType[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(type.install).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div>
      <div className="flex border-b border-zinc-300">
        {packageType.map((value) => (
          <div
            onClick={() => setType(value)}
            key={value.value}
            className={clsx(
              "px-4 py-3 flex items-center gap-2 cursor-pointer",
              type.value == value.value && " border-b-2 border-colorScPurple"
            )}
          >
            {value.Icon}
            <span className="">{value.value}</span>
          </div>
        ))}
      </div>

      <div className="p-6 relative group">
        <span className="text-colorScPurple opacity-70 pr-2">$</span>
        <span className=" font-medium text-blue-800">{type.install}</span>

        <button
          onClick={handleCopy}
          className="absolute group-hover:visible invisible flex items-center gap-2 top-2 right-2 bg-gray-800 text-white text-sm px-3 py-1 rounded hover:bg-gray-700 transition"
          aria-label="Copy code"
        >
          {copied ? "Copied!" : "Copy"}
          {copied ? (
            <Check className=" text-green-400" size={16} />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>
    </div>
  );
};

export default AllModules;
