import React, { useState } from "react";
import Input from "../ui/input";

const ProjectConfiguration = () => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="">
      <Input
        disabled
        label="Project Name"
        value={"Enterprise Sandbox Environment"}
      />

      <div className="relative">
        <Input value="scrubbe_ent_live_prod_ak47_xyz789" label="API Key" />

        <div
          onClick={() => handleCopy("scrubbe_ent_live_prod_ak47_xyz789")}
          className="absolute top-9 right-2 dark:bg-gray-700 bg-gray-200 hover:bg-gray-400 dark:text-white text-sm px-3 py-1 rounded dark:hover:bg-gray-700 transition"
          aria-label="Copy code"
        >
          {copied ? "Copied!" : "Copy"}
        </div>
      </div>

      <div className="relative">
        <Input value="Production Sandbox" label="Enterprise Status" />
        <div className="absolute top-9 flex items-center gap-2 right-2 bg-green-100 border border-green-500 text-green-500 text-sm px-3 py-1 rounded transition">
          <div className="h-2 w-2 rounded-full bg-green-400" /> active
        </div>
      </div>

      <div className=" space-y-3">
        <p className=" font-semibold text-lg dark:text-white">
          Security & Compliance
        </p>

        <div className=" bg-yellow-100 text-orange-500 p-4 rounded-lg border border-orange-500 space-y-1">
          <p>90 days, encrypted at rest, SOC2 compliant</p>
          <p>
            Real-time threat detection, advanced behavioral analytics, and
            ML-powered risk scoring are active in this environment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectConfiguration;
