/* eslint-disable @typescript-eslint/no-explicit-any */
// components/SystemHealthCard.tsx
import React from "react";
import StatusPill from "./StatusPill";

type SystemStatus = { component: string; status: string; message: string }[];

type Props = {
  statuses: SystemStatus;
};

const SystemHealthCard: React.FC<Props> = ({ statuses }) => {
  const statusItems = statuses?.map(({ status, component }) => (
    <div
      key={component}
      className="flex items-center justify-between text-gray-900 dark:text-gray-100 flex-1 flex-grow"
    >
      <span className="text-sm">{component} :</span>
      <StatusPill status={status as any} />
    </div>
  ));

  return (
    <div className="flex flex-col p-6 bg-white rounded-lg shadow-sm h-full flex-1">
      <p className="text-gray-500 text-sm font-medium mb-4">System Health</p>
      <div className="grid grid-cols-3 gap-4">{statusItems}</div>
    </div>
  );
};

export default SystemHealthCard;
