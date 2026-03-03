// components/StatusPill.tsx
import React from "react";

type Status = "healthy" | "warning" | "critical";

const statusColors = {
  healthy: "bg-emerald-100 text-emerald-700",
  warning: "bg-yellow-100 text-yellow-700",
  critical: "bg-red-100 text-red-700",
};

const StatusPill: React.FC<{ status: Status }> = ({ status }) => {
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-xs font-semibold ${statusColors[status]}`}
    >
      {status}
    </span>
  );
};

export default StatusPill;
