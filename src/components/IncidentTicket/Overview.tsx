import React from "react";
import MetricCard from "../IMS/Dashboard/MetricCard";
import { MdBookmark } from "react-icons/md";

const Overview = () => {
  return (
    <div className="grid grid-cols-3 gap-5">
      <MetricCard
        title="Connect Source"
        value="0"
        icon={<MdBookmark size={20} />}
        iconColor="bg-emerald-50 text-emerald-700"
      />
      <MetricCard
        title="Event Ingested(24hrs)"
        value="0"
        icon={<MdBookmark size={20} />}
        iconColor="bg-blue-50 text-blue-700"
      />
      <MetricCard
        title="Failed Ingestions"
        value="0"
        icon={<MdBookmark size={20} />}
        iconColor="bg-emerald-50 text-emerald-700"
      />
    </div>
  );
};

export default Overview;
