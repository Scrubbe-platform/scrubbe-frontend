import React from "react";
import Tags from "./Tag";

const UnresolveIncident = () => {
  return (
    <div className=" p-4 space-y-2 border rounded-lg dark:border-zinc-600 border-zinc-200">
      <p className="dark:text-white font-medium">Unresolved Incident (20)</p>
      <p className=" text-xs dark:text-white">By Age</p>

      <Tags
        value="12"
        label="0-4hrs"
        severity="low"
        className="!bg-zinc-100 "
      />
      <Tags
        value="4"
        label="4-24hrs"
        severity="high"
        className="!bg-zinc-100 "
      />
      <Tags
        value="60"
        label=">24hrs"
        severity="critical"
        className="!bg-zinc-100 "
      />
    </div>
  );
};

export default UnresolveIncident;
