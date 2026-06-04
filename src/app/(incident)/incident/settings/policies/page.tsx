"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle2, List } from "lucide-react";
import SettingWrapper from "../_module/setting-wrapper";
import Select from "@/components/ui/select";
import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
 
const PoliciesModule = () => {
  const { get, put } = useFetch();
  const queryClient = useQueryClient();
 
  const [autoActivate, setAutoActivate] = useState(true);
  const [requireApprovalMerges, setRequireApprovalMerges] = useState(true);
  const [productionApproval, setProductionApproval] = useState(true);
  const [threshold, setThreshold] = useState(100);
  const [maxServices, setMaxServices] = useState("");
  const [maxEnvScope, setMaxEnvScope] = useState("PR-only");
 
  const { data: config } = useQuery({
    queryKey: ["ims-policies-config"],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_config);
      if (res.success) return res.data?.data ?? res.data ?? {};
      return {};
    },
    refetchOnWindowFocus: false,
  });
 
  useEffect(() => {
    if (config) {
      setAutoActivate(config.autoActivatePlaybooks ?? true);
      setRequireApprovalMerges(config.requireApprovalMerges ?? true);
      setProductionApproval(config.productionActionsRequireApproval ?? true);
      setThreshold(config.confidenceThreshold ?? 100);
      setMaxServices(config.maxServicesPerExecution ?? "");
      setMaxEnvScope(config.maxEnvScope ?? "PR-only");
    }
  }, [config]);
 
  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async () => {
      const res = await put(endpoint.auth.ims_config, {
        autoActivatePlaybooks: autoActivate,
        requireApprovalMerges,
        productionActionsRequireApproval: productionApproval,
        confidenceThreshold: threshold,
        maxServicesPerExecution: maxServices,
        maxEnvScope,
      });
      if (!res.success) throw new Error(res.data?.message ?? "Failed to save");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Policies saved");
      queryClient.invalidateQueries({ queryKey: ["ims-policies-config"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
 
  return (
    <SettingWrapper
      title="Policies"
      description="When and how Scrubbe can act"
      sub="These settings are the governor of multi-agent orchestration."
    >
      <div className="grid 2xl:grid-cols-2 gap-8 items-start pt-4">
        {/* LEFT — Auto-activation */}
        <section className="bg-transparent border border-zinc-500 dark:border-neutral-500 rounded-[24px] p-4 space-y-6">
          <h3 className="text-black dark:text-white font-bold text-lg px-1">Auto-activation</h3>
 
          <div className="space-y-4">
            {/* Playbooks toggle */}
            <div className="p-5 border border-zinc-500 dark:border-neutral-500 rounded-2xl space-y-3 bg-white dark:bg-transparent">
              <div className="flex justify-between items-start">
                <span className="text-black dark:text-white text-[15px] font-bold leading-tight max-w-[180px]">
                  Auto-activate playbooks for delivery incidents
                </span>
                <Toggle active={autoActivate} onToggle={() => setAutoActivate((v) => !v)} />
              </div>
              <p className="text-zinc-400 dark:text-[#64748B] text-xs leading-normal">
                Creates a remediation plan immediately after incident creation.
              </p>
            </div>
 
            {/* Confidence slider */}
            <div className="p-5 border border-zinc-500 dark:border-neutral-500 rounded-2xl space-y-4 bg-white dark:bg-transparent">
              <span className="text-black dark:text-white text-[15px] font-bold block">
                Confidence threshold to auto-suggest code
              </span>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-100 dark:bg-[#0B1224] rounded-lg appearance-none cursor-pointer accent-[#3EE9FF] border border-zinc-500 dark:border-neutral-500"
                />
                <div className="flex justify-between text-[10px] text-black dark:text-[#64748B] mt-2 font-bold uppercase tracking-wider">
                  <span>0</span>
                  <span className="text-black dark:text-[#D1D5DB]">threshold: {threshold}%</span>
                  <span>100</span>
                </div>
              </div>
            </div>
 
            {/* Suppression rules */}
            <div className="p-5 border border-zinc-500 dark:border-neutral-500 rounded-2xl space-y-4 bg-white dark:bg-transparent">
              <div className="flex justify-between items-center">
                <span className="text-black dark:text-white text-[15px] font-bold">Suppression rules</span>
                <button className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">
                  Edit
                </button>
              </div>
              <p className="text-zinc-400 dark:text-[#64748B] text-xs">
                Reduce noise when flake storms or repeated failures happen.
              </p>
              <div className="flex items-center gap-3 p-2.5 border border-zinc-500 dark:border-neutral-500 rounded-xl bg-zinc-50 dark:bg-[#0B1224]/50">
                <List size={14} className="text-[#A5B4FC]" />
                <span className="text-[11px] text-zinc-600 dark:text-[#D1D5DB]">suppress after 5 repeats / 10 min</span>
              </div>
            </div>
          </div>
        </section>
 
        {/* RIGHT — Human gates */}
        <section className="bg-transparent border border-zinc-500 dark:border-neutral-500 rounded-[24px] p-6 space-y-6">
          <div className="space-y-1 px-1">
            <h3 className="text-black dark:text-white font-bold text-lg">Human gates + blast radius</h3>
            <p className="text-zinc-400 dark:text-[#64748B] text-xs">Security defaults applied org-wide.</p>
          </div>
 
          <div className="space-y-4">
            <GateToggle label="Require approval for merges" active={requireApprovalMerges} onToggle={() => setRequireApprovalMerges((v) => !v)} />
            <GateToggle label="Production actions require approval" active={productionApproval} onToggle={() => setProductionApproval((v) => !v)} />
 
            {/* Blast radius limits */}
            <div className="p-6 border border-zinc-500 dark:border-neutral-500 rounded-2xl space-y-5 bg-white dark:bg-transparent">
              <div className="flex justify-between items-center">
                <span className="text-black dark:text-white text-[15px] font-bold">Blast radius limits</span>
                <button className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">
                  Configure
                </button>
              </div>
              <p className="text-zinc-400 dark:text-[#64748B] text-xs">Prevent large-scale changes by default.</p>
 
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] text-black dark:text-[#64748B] font-bold uppercase tracking-wider">
                    Max services per execution
                  </label>
                  <Input
                    className="text-black dark:text-white"
                    value={maxServices}
                    onChange={(e: any) => setMaxServices(e.target.value)}
                    placeholder="e.g. 3"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-black dark:text-[#64748B] font-bold uppercase tracking-wider">
                    Max env scope
                  </label>
                  <Select
                    className="text-black dark:text-white"
                    value={maxEnvScope}
                    onChange={(e: any) => setMaxEnvScope(e.target.value)}
                    options={[
                      { value: "PR-only",              label: "PR-only"              },
                      { value: "Staging only",          label: "Staging only"         },
                      { value: "Production (gated)",    label: "Production (gated)"   },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
 
      <div className="pt-6 flex justify-end">
        <CButton className="w-fit px-4" onClick={() => save()} isLoading={isPending} disabled={isPending}>
          Save
        </CButton>
      </div>
    </SettingWrapper>
  );
};
 
const Toggle = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${active ? "bg-[#4ADE80]" : "bg-zinc-200 dark:bg-neutral-500"}`}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${active ? "left-7" : "left-1"}`} />
  </button>
);
 
const GateToggle = ({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) => (
  <div className="p-5 border border-zinc-500 dark:border-neutral-500 rounded-2xl space-y-3 bg-white dark:bg-transparent">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 px-3 py-1.5 border border-zinc-500 dark:border-neutral-500 rounded-xl bg-zinc-50 dark:bg-[#0B1224]/50">
        <CheckCircle2 size={16} className="text-red-500" />
        <span className="text-xs font-bold text-black dark:text-white">{label}</span>
      </div>
      <Toggle active={active} onToggle={onToggle} />
    </div>
    <p className="text-zinc-400 dark:text-[#64748B] text-xs leading-normal">
      {label === "Require approval for merges"
        ? "Even if a patch is safe, humans should approve merging to main."
        : "Block execute in production unless approver signs off."}
    </p>
  </div>
);
 
export default PoliciesModule;