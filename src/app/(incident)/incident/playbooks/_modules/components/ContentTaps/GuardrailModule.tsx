"use client";
import React from "react";
import {
  Lock,
  Info,
  ShieldCheck,
  RotateCcw,
  Maximize,
  CheckCircle2,
  Bolt,
  TriangleAlert,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

type GuardrailStatus =
  | "APPROVAL REQUIRED"
  | "AUTO-EXECUTE"
  | "BLOCK AUTO"
  | "PASS";
interface PolicyRow {
  id: string;
  title: string;
  description: string;
  status: GuardrailStatus;
  icon: React.ReactNode;
}

// Status badge — keep minimal signal: blocked is red, pass is green, rest zinc
const StatusBadge = ({ status }: { status: GuardrailStatus }) => {
  const styles: Record<GuardrailStatus, string> = {
    "APPROVAL REQUIRED":
      "border-amber-200 dark:border-amber-500/25 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/8",
    "AUTO-EXECUTE":
      "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800",
    "BLOCK AUTO":
      "border-red-200 dark:border-red-500/25 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/8",
    PASS: "border-zinc-200 dark:border-zinc-700 text-black dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const iconForType = (type: string): React.ReactNode => {
  if (type?.includes("APPROVAL"))
    return (
      <ShieldCheck size={15} className="text-zinc-400 dark:text-zinc-500" />
    );
  if (type?.includes("ROLLBACK") || type?.includes("RESTART"))
    return <RotateCcw size={15} className="text-zinc-400 dark:text-zinc-500" />;
  if (type?.includes("BLAST") || type?.includes("RADIUS"))
    return <Maximize size={15} className="text-zinc-400 dark:text-zinc-500" />;
  if (type?.includes("HOURS") || type?.includes("ESCALATION"))
    return <Bolt size={15} className="text-zinc-400 dark:text-zinc-500" />;
  return (
    <CheckCircle2 size={15} className="text-zinc-400 dark:text-zinc-500" />
  );
};

const statusFromGuardrail = (g: any): GuardrailStatus => {
  if (!g.isActive) return "BLOCK AUTO";
  if (g.config?.requireApproval) return "APPROVAL REQUIRED";
  if (g.type === "BLAST_RADIUS_LIMIT") return "BLOCK AUTO";
  if (g.config?.autoExecute) return "AUTO-EXECUTE";
  return "PASS";
};

const FALLBACK_POLICIES: PolicyRow[] = [
  {
    id: "1",
    title: "Production Rollback Approval",
    description:
      "policy: prod.rollback.requires_approval = true · Applies to all P1/P2 incidents",
    status: "APPROVAL REQUIRED",
    icon: iconForType("APPROVAL"),
  },
  {
    id: "2",
    title: "Pod Restart Auto-Allowed",
    description:
      "policy: pod.restart.auto = true · reversible = true · blast_radius ≤ 1 service",
    status: "AUTO-EXECUTE",
    icon: iconForType("ROLLBACK"),
  },
  {
    id: "3",
    title: "Blast Radius Automation Limit",
    description:
      "policy: no automation if blast_radius > 3 services · Current: 3 — threshold met",
    status: "BLOCK AUTO",
    icon: iconForType("BLAST"),
  },
  {
    id: "4",
    title: "Reversibility Check",
    description:
      "policy: prefer reversible actions · Rollback: reversible ✓ · rollbackPlaybookId linked",
    status: "PASS",
    icon: iconForType(""),
  },
  {
    id: "5",
    title: "Business Hours Escalation",
    description:
      "policy: P1 outside 09:00–18:00 UTC requires on-call approval · Current: 00:15 UTC",
    status: "APPROVAL REQUIRED",
    icon: iconForType("ESCALATION"),
  },
];

const GuardrailModule: React.FC<{ incidentId?: string }> = ({ incidentId }) => {
  const { get } = useFetch();
  const { data: guardrails } = useQuery({
    queryKey: ["guardrails-playbook", incidentId],
    queryFn: async () => {
      const res = await get(endpoint.guardrails.list + "?activeOnly=true");
      return res.success
        ? ((res.data?.data?.guardrails ?? res.data?.data ?? []) as any[])
        : ([] as any[]);
    },
  });

  const policies: PolicyRow[] = guardrails?.length
    ? guardrails.map((g: any) => ({
        id: g.id,
        title: g.name,
        description: g.description ?? `policy: ${g.type ?? "CUSTOM"}`,
        status: statusFromGuardrail(g),
        icon: iconForType(g.type ?? g.name ?? ""),
      }))
    : FALLBACK_POLICIES;

  const approvalCount = policies.filter(
    (p) => p.status === "APPROVAL REQUIRED",
  ).length;

  return (
    <div className="w-full rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5 flex flex-col gap-5">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <Lock size={15} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-black dark:text-zinc-100">
              Guardrail Check
            </h2>
            <p className="text-[12px] text-black dark:text-zinc-500 mt-0.5">
              Policy engine — determines whether automation is permitted · CP
              enforced
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
            {approvalCount} approval{approvalCount !== 1 ? "s" : ""} required
          </span>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
        <Info
          size={15}
          className="text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5"
        />
        <p className="text-[12px] text-black dark:text-zinc-400 leading-relaxed">
          <span className="font-semibold text-black dark:text-zinc-300">
            CP Zone
          </span>{" "}
          — policies are strongly consistent. On partition or uncertainty,
          execution is blocked.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 border border-zinc-500 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 shrink-0">
                {policy.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-black dark:text-zinc-200 truncate">
                  {policy.title}
                </p>
                <p className="text-[11px] text-black dark:text-zinc-500 font-mono mt-0.5 truncate">
                  {policy.description}
                </p>
              </div>
            </div>
            <StatusBadge status={policy.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuardrailModule;
