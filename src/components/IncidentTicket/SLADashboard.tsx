import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import React from "react";
import ProgressBar from "../ezra/ProgressBar";

const SLADashboard = () => {
  return (
    <div className="w-full h-full space-y-3 p-4">
      <p className=" text-sm font-medium text-neutral-500">
        System performance and incident metrics
      </p>
      <div className="grid grid-cols-3 gap-3 w-full">
        <div className="p-2 flex flex-col  justify-between rounded-md border-l-4 border-l-rose-500 border border-neutral-200 h-[120px] w-full">
          <p className=" font-medium text-neutral-500 text-sm">
            Active Incident
          </p>
          <p className=" text-2xl font-bold dark:text-white">23</p>
          <p className=" text-neutral-500 text-xs">Currently open</p>
          <p className="flex items-center gap-1 text-green-600 text-xs">
            <ArrowDown size={12} />
            12% vs yesterday
          </p>
        </div>
        <div className="p-2 flex flex-col justify-between rounded-md border-l-4 border-l-amber-500 border border-zinc-200 h-[120px] w-full">
          <p className=" font-medium text-neutral-500 text-sm">MTTR</p>
          <p className=" text-2xl font-bold dark:text-white">4.2h</p>
          <p className=" text-neutral-500 text-xs">Mean time to resolution</p>
          <p className="flex items-center gap-1 text-red-600 text-xs">
            <ArrowUp size={12} />
            8% vs last week
          </p>
        </div>
        <div className="p-2 flex flex-col justify-between rounded-md border-l-4 border-l-green-500 border border-zinc-200 h-[120px] w-full">
          <p className=" font-medium text-neutral-500 text-sm">Response Time</p>
          <p className=" text-2xl font-bold dark:text-white">12m</p>
          <p className=" text-neutral-500 text-xs">Average first response</p>
          <p className="flex items-center gap-1 text-green-600 text-xs">
            <ArrowDown size={12} />
            15% improvement
          </p>
        </div>
        <div className="p-2 flex flex-col justify-between rounded-md border-l-4 border-l-rose-500 border border-zinc-200 h-[120px] w-full">
          <p className=" font-medium text-neutral-500 text-sm">SLA Branches</p>
          <p className=" text-2xl font-bold dark:text-white">3</p>
          <p className=" text-neutral-500 text-xs">This month</p>
          <p className="flex items-center gap-1 text-red-600 text-xs">
            <ArrowUp size={12} />
            2% new today
          </p>
        </div>
        <div className="p-2 flex flex-col justify-between rounded-md border-l-4 border-l-green-500 border border-zinc-200 h-[120px] w-full">
          <p className=" font-medium text-neutral-500 text-sm">
            Resolution rate
          </p>
          <p className=" text-2xl font-bold dark:text-white">94.8%</p>
          <p className=" text-neutral-500 text-xs">Within SLA targets</p>
          <p className="flex items-center gap-1 text-neutral-500 text-xs">
            <ArrowRight size={12} />
            Stable
          </p>
        </div>
        <div className="p-2 flex flex-col justify-between rounded-md border-l-4 border-l-green-500 border border-zinc-200 h-[120px] w-full">
          <p className=" font-medium text-neutral-500 text-sm">Escalations</p>
          <p className=" text-2xl font-bold dark:text-white">7</p>
          <p className=" text-neutral-500 text-xs">This week</p>
          <p className="flex items-center gap-1 text-green-600 text-xs">
            <ArrowDown size={12} />
            30% reduction
          </p>
        </div>
      </div>

      <div className=" border border-neutral-200 rounded-lg p-4 space-y-3">
        <p className=" font-semibold dark:text-white">SLA Compliance</p>

        <div className=" space-y-2">
          <div className="flex items-center justify-between text-sm">
            <p className=" dark:text-white">P1 Incidents (4h target)</p>
            <p className="text-amber-600 font-medium">87%</p>
          </div>
          <ProgressBar color="bg-amber-500" value={87} />
        </div>
        <div className=" space-y-2">
          <div className="flex items-center justify-between text-sm">
            <p className=" dark:text-white">P2 Incidents (8h target)</p>
            <p className="text-green-600 font-medium">95%</p>
          </div>
          <ProgressBar color="bg-green-500" value={95} />
        </div>
        <div className=" space-y-2">
          <div className="flex items-center justify-between text-sm">
            <p className=" dark:text-white">P3 Incidents (16h target)</p>
            <p className="text-green-600 font-medium">98%</p>
          </div>
          <ProgressBar color="bg-green-500" value={98} />
        </div>
      </div>

      <div className=" border border-neutral-200 rounded-lg p-4 space-y-3">
        <p className=" font-semibold dark:text-white">System Health</p>
        <div className="grid grid-cols-4 gap-3">
          <div className=" bg-green-50 border-green-600 border p-3 rounded-md flex flex-col items-center gap-2">
            <div className=" h-2 w-2 rounded-full bg-green-600" />
            <p className=" font-medium text-sm">Web Services</p>
            <p className="text-xs">Operational</p>
          </div>
          <div className=" bg-amber-50 border-amber-600 border p-3 rounded-md flex flex-col items-center gap-2">
            <div className=" h-2 w-2 rounded-full bg-amber-600" />
            <p className=" font-medium text-sm">Database</p>
            <p className="text-xs">Degraded</p>
          </div>
          <div className=" bg-green-50 border-green-600 border p-3 rounded-md flex flex-col items-center gap-2">
            <div className=" h-2 w-2 rounded-full bg-green-600" />
            <p className=" font-medium text-sm">API Gateway</p>
            <p className="text-xs">Operational</p>
          </div>
          <div className=" bg-green-50 border-green-600 border p-3 rounded-md flex flex-col items-center gap-2">
            <div className=" h-2 w-2 rounded-full bg-green-600" />
            <p className=" font-medium text-sm">CDN</p>
            <p className="text-xs">Operational</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLADashboard;
