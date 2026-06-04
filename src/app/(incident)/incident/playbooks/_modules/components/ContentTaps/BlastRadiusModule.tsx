"use client";
import React from "react";
import { Info, Target, TriangleAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

type ImpactType = "Direct" | "Cascade" | "InDirect";
interface ServiceImpact { name: string; subtext: string; type: ImpactType }

const typeStyle: Record<ImpactType, string> = {
  Direct:   "border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800",
  Cascade:  "border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800",
  InDirect: "border-zinc-200 dark:border-zinc-700 text-black dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60",
};

// Dot color preserved — Direct/Cascade are red for real danger signal
const dotColor: Record<ImpactType, string> = {
  Direct:   "bg-red-400 dark:bg-red-500",
  Cascade:  "bg-amber-400 dark:bg-amber-500",
  InDirect: "bg-zinc-300 dark:bg-zinc-600",
};

const ImpactCard = ({ name, subtext, type }: ServiceImpact) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor[type]}`} />
      <div>
        <p className="text-[12px] font-semibold text-black dark:text-zinc-200">{name}</p>
        <p className="text-[11px] text-black dark:text-zinc-500">{subtext}</p>
      </div>
    </div>
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${typeStyle[type]}`}>
      {type}
    </span>
  </div>
);

const DataRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
    <span className="text-[12px] text-black dark:text-zinc-500">{label}</span>
    <span className="text-[12px] font-semibold text-black dark:text-zinc-200">{value}</span>
  </div>
);

const FALLBACK: ServiceImpact[] = [
  { name: "payments-apt",     subtext: "Root cause · All traffic",  type: "Direct"   },
  { name: "checkout-service", subtext: "Cascading · 29% abandon",   type: "Cascade"  },
  { name: "api-gateway",      subtext: "CB open · 2.1% error rate", type: "InDirect" },
  { name: "user-service",     subtext: "Healthy · Monitored",       type: "InDirect" },
];

const BlastRadiusModule: React.FC<{ incidentId?: string }> = ({ incidentId }) => {
  const { get } = useFetch();
  const { data: report } = useQuery({
    queryKey: ["blast-radius-incident", incidentId],
    queryFn: async () => {
      if (!incidentId) return null;
      const res = await get(`${endpoint.blast_radius.getForTrigger}/${incidentId}`);
      return res.success ? res.data?.data ?? null : null;
    },
    enabled: !!incidentId,
  });

  const services: ServiceImpact[] = report?.affectedServices?.length
    ? report.affectedServices.map((s: any) => ({ name: s.name ?? "Unknown", subtext: s.subtext ?? s.impact ?? "Affected", type: (s.type as ImpactType) ?? "InDirect" }))
    : FALLBACK;

  const riskLevel    = report?.riskLevel        ?? "MEDIUM";
  const userImpact   = report?.estimatedUserImpact ?? "30%";
  const userImpactPct = parseInt(String(userImpact)) || 30;

  return (
    <div className="w-full rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5 flex flex-col gap-5">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <Target size={15} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-black dark:text-zinc-100">Blast Radius Evaluation</h2>
            <p className="text-[12px] text-black dark:text-zinc-500 mt-0.5">Impact analysis — always runs before guardrail check · CP enforced</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
            {riskLevel.charAt(0) + riskLevel.slice(1).toLowerCase()} Risk
          </span>
          <button className="p-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 text-black hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <TriangleAlert size={14} />
          </button>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
        <Info size={15} className="text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" />
        <p className="text-[12px] text-black dark:text-zinc-400 leading-relaxed">
          <span className="font-semibold text-black dark:text-zinc-300">CP Zone</span> — blast radius must be calculated and consistent before any guardrail or execution decision. Uncertainty blocks execution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {services.map((svc) => <ImpactCard key={svc.name} {...svc} />)}
      </div>

      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
        <DataRow label="Services Affected"      value={report?.servicesAffected ?? "3 direct"}  />
        <DataRow label="Estimated User Impact"  value={userImpact}                               />
        <DataRow label="Revenue Impact / min"   value={report?.revenueImpactPerMin ?? "~$4,200"} />
        <DataRow label="Risk Classification"    value={riskLevel}                                />
        <DataRow label="riskClassifier.level"   value={report?.riskScore ?? 2}                   />
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">User Impact Meter</p>
        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-zinc-400 dark:bg-zinc-500 transition-all duration-700" style={{ width: `${userImpactPct}%` }} />
        </div>
      </div>
    </div>
  );
};

export default BlastRadiusModule;