"use client";
import React, { ReactNode, useEffect, useState } from "react";
import SettingWrapper from "../_module/setting-wrapper";
import { CheckCircle2, Dna, Hash, ShieldCheck } from "lucide-react";
import Select from "@/components/ui/select";
import { Switch } from "@heroui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import Link from "next/link";
 
const EzraPage = () => {
  const { get, put } = useFetch();
  const queryClient = useQueryClient();
 
  const [analystEnabled, setAnalystEnabled] = useState(true);
  const [executiveEnabled, setExecutiveEnabled] = useState(true);
  const [riskLensEnabled, setRiskLensEnabled] = useState(true);
  const [execFormat, setExecFormat] = useState("1 Paragragh + bullets + ETA");
  const [deliveryChannel, setDeliveryChannel] = useState("#eng-leadership");
  const [editingChannel, setEditingChannel] = useState(false);
  const [maskingRules, setMaskingRules] = useState<string[]>([]);
  const [editingMasking, setEditingMasking] = useState(false);
  const [newMaskRule, setNewMaskRule] = useState("");

  const { data: config } = useQuery({
    queryKey: ["ims-ezra-config"],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_config);
      if (res.success) return res.data?.data ?? res.data ?? {};
      return {};
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (config) {
      setAnalystEnabled(config.ezraAnalystSummary ?? true);
      setExecutiveEnabled(config.ezraExecutiveSummary ?? true);
      setRiskLensEnabled(config.ezraRiskLens ?? true);
      setExecFormat(config.ezraExecutiveFormat ?? "1 Paragragh + bullets + ETA");
      setDeliveryChannel(config.ezraDeliveryChannel ?? "#eng-leadership");
      setMaskingRules(config.ezraMaskingRules ?? ["mask: secrets", "mask: PII", "hide: stack traces"]);
    }
  }, [config]);

  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async () => {
      const res = await put(endpoint.auth.ims_config, {
        ezraAnalystSummary: analystEnabled,
        ezraExecutiveSummary: executiveEnabled,
        ezraRiskLens: riskLensEnabled,
        ezraExecutiveFormat: execFormat,
        ezraDeliveryChannel: deliveryChannel,
        ezraMaskingRules: maskingRules,
      });
      if (!res.success) throw new Error(res.data?.message ?? "Failed to save");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Ezra settings saved");
      queryClient.invalidateQueries({ queryKey: ["ims-ezra-config"] });
      setEditingChannel(false);
      setEditingMasking(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
 
  return (
    <div>
      <SettingWrapper
        title="Ezra"
        description="Narratives for analysts and executives"
        sub="Control who sees what, and where summaries are delivered."
      >
        <div className="grid 2xl:grid-cols-2 gap-8 items-start pt-4">
          {/* LEFT — Audience outputs */}
          <section className="bg-transparent border border-zinc-500 dark:border-neutral-500 rounded-[24px] p-4 space-y-4">
            <h3 className="text-black dark:text-white font-bold text-lg px-1">Audience outputs</h3>
 
            <div className="space-y-4">
              <ToggleRow icon={<Dna size={16} className="text-[#F472B6]" />}          label="Analyst summary enabled"   active={analystEnabled}   onToggle={() => setAnalystEnabled((v) => !v)}   />
              <ToggleRow icon={<CheckCircle2 size={16} className="text-[#EF4444]" />} label="Executive summary enabled" active={executiveEnabled} onToggle={() => setExecutiveEnabled((v) => !v)} />
              <ToggleRow icon={<ShieldCheck size={16} className="text-[#4ADE80]" />}  label="Risk/Fraud lens enabled"   active={riskLensEnabled}  onToggle={() => setRiskLensEnabled((v) => !v)}  />
            </div>
 
            <div className="space-y-3 pt-2">
              <Select
                className="text-black dark:text-white"
                labelClassName="text-black dark:text-white"
                label="Executive format"
                value={execFormat}
                onChange={(e: any) => setExecFormat(e.target.value)}
                options={[
                  { value: "1 Paragragh + bullets + ETA", label: "1 Paragraph + bullets + ETA" },
                  { value: "Board Style narrative",        label: "Board Style narrative"        },
                  { value: "Short status update",          label: "Short status update"          },
                ]}
              />
            </div>
 
            <div className="p-5 border border-zinc-500 dark:border-neutral-500 rounded-2xl space-y-4 bg-white dark:bg-transparent">
              <div className="flex justify-between items-center">
                <span className="text-black dark:text-white text-[15px] font-bold">Delivery summary channel</span>
                <button
                  onClick={() => (editingChannel ? save() : setEditingChannel(true))}
                  disabled={isPending}
                  className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#00CAD8]/5 transition-all disabled:opacity-50"
                >
                  {editingChannel ? "Save" : "Change"}
                </button>
              </div>
              <p className="text-zinc-400 dark:text-[#64748B] text-xs leading-normal">Where executive updates go.</p>
              {editingChannel ? (
                <div className="flex items-center gap-2 p-2.5 border border-zinc-500 dark:border-neutral-500 rounded-xl bg-zinc-50 dark:bg-[#0B1224]/50">
                  <Hash size={14} className="text-[#FDE047] shrink-0" />
                  <input
                    value={deliveryChannel}
                    onChange={(e) => setDeliveryChannel(e.target.value)}
                    className="flex-1 bg-transparent text-[11px] text-zinc-600 dark:text-[#D1D5DB] font-mono outline-none"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-2.5 border border-zinc-500 dark:border-neutral-500 rounded-xl bg-zinc-50 dark:bg-[#0B1224]/50">
                  <Hash size={14} className="text-[#FDE047]" />
                  <span className="text-[11px] text-zinc-600 dark:text-[#D1D5DB] font-mono">{deliveryChannel}</span>
                </div>
              )}
            </div>
          </section>
 
          {/* RIGHT — Data exposure */}
          <section className="space-y-6">
            <div className="bg-transparent border border-zinc-500 dark:border-neutral-500 rounded-[24px] p-4 space-y-6">
              <div className="space-y-1 px-1">
                <h3 className="text-black dark:text-white font-bold text-lg">Data exposure controls</h3>
                <p className="text-zinc-400 dark:text-[#64748B] text-xs font-medium">Security defaults applied org-wide.</p>
              </div>
              <div className="p-4 border border-zinc-500 dark:border-neutral-500 rounded-2xl space-y-5">
                <p className="text-zinc-600 dark:text-[#D1D5DB] text-sm leading-relaxed">
                  Prevent sensitive content from appearing in executive summaries.
                </p>
                <div className="flex flex-wrap gap-2">
                  {maskingRules.map((rule) => (
                    <MaskTag
                      key={rule}
                      label={rule}
                      onRemove={editingMasking ? () => setMaskingRules((p) => p.filter((r) => r !== rule)) : undefined}
                    />
                  ))}
                </div>
                {editingMasking && (
                  <div className="flex gap-2">
                    <input
                      value={newMaskRule}
                      onChange={(e) => setNewMaskRule(e.target.value)}
                      placeholder="e.g. mask: tokens"
                      className="flex-1 border border-zinc-500 dark:border-neutral-500 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-transparent text-black dark:text-white"
                    />
                    <button
                      onClick={() => {
                        if (newMaskRule.trim()) {
                          setMaskingRules((p) => [...p, newMaskRule.trim()]);
                          setNewMaskRule("");
                        }
                      }}
                      className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                )}
                <button
                  onClick={() => (editingMasking ? save() : setEditingMasking(true))}
                  disabled={isPending}
                  className="text-[#00CAD8] border border-[#00CAD8] px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#00CAD8]/5 transition-all disabled:opacity-50"
                >
                  {editingMasking ? "Save" : "Edit"}
                </button>
              </div>
            </div>
 
            <div className="bg-transparent border border-zinc-500 dark:border-neutral-500 rounded-[24px] p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-black dark:text-white font-bold text-lg">Open Ezra full view</h3>
                <Link href="/incident/ezra" className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">
                  Open Ezra
                </Link>
              </div>
              <p className="text-zinc-400 dark:text-[#64748B] text-xs leading-relaxed max-w-[200px]">
                Preview analyst/executive outputs and charts.
              </p>
            </div>
          </section>
        </div>
 
        <div className="mt-12 flex justify-end">
          <button
            onClick={() => save()}
            disabled={isPending}
            className="bg-[#3EE9FF] text-black px-12 py-3.5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-[0_0_25px_rgba(62,233,255,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </SettingWrapper>
    </div>
  );
};
 
const ToggleRow = ({ icon, label, active, onToggle }: { icon: ReactNode; label: string; active: boolean; onToggle: () => void }) => (
  <div className="flex justify-between items-center p-3.5 border border-zinc-500 dark:border-neutral-500 rounded-2xl group hover:border-[#00CAD8]/30 transition-all bg-white dark:bg-transparent">
    <div className="flex items-center gap-3">
      <div className="p-2 border border-zinc-500 dark:border-neutral-500 rounded-xl bg-zinc-50 dark:bg-[#0B1224]/50">{icon}</div>
      <span className="text-black dark:text-white text-xs font-bold">{label}</span>
    </div>
    <Switch color="success" isSelected={active} onChange={onToggle} size="sm" />
  </div>
);
 
const MaskTag = ({ label, onRemove }: { label: string; onRemove?: () => void }) => (
  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-[#0B1224] border border-zinc-500 dark:border-neutral-500 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-[#D1D5DB] font-mono tracking-tight">
    {label}
    {onRemove && (
      <button onClick={onRemove} className="text-zinc-400 hover:text-red-400">
        ×
      </button>
    )}
  </span>
);
 
export default EzraPage;