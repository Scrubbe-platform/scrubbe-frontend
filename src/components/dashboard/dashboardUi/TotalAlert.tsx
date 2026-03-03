import React from "react";
import Tags from "./Tag";

const TotalAlert = () => {
  return (
    <div className=" p-4 space-y-2 border rounded-lg dark:border-zinc-600 border-zinc-200">
      <p className="dark:text-white font-medium">Total Alerts (218)</p>
      <p className=" text-xs dark:text-white">By Severity</p>

      <Tags value="20" label="Critical" severity="critical" />
      <Tags value="4" label="High" severity="high" />
      <Tags value="15" label="Medium" severity="medium" />
      <Tags value="158" label="Low" severity="low" />
    </div>
  );
};

export default TotalAlert;
