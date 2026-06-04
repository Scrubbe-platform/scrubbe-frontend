"use client";
import React, { useEffect, useState } from "react";
import SettingWrapper from "../_module/setting-wrapper";
import { Switch } from "@heroui/switch";
import CButton from "@/components/ui/Cbutton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
 
const page = () => {
  const { get, put } = useFetch();
  const queryClient = useQueryClient();
 
  const [flags, setFlags] = useState({
    autoMergeGated: true,
    rollbackPlaybooks: true,
    riskFraudLens: true,
  });
 
  const { data: config } = useQuery({
    queryKey: ["ims-feature-flags"],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_config);
      if (res.success) return res.data?.data ?? res.data ?? {};
      return {};
    },
    refetchOnWindowFocus: false,
  });
 
  useEffect(() => {
    if (config?.featureFlags) {
      setFlags((prev) => ({ ...prev, ...config.featureFlags }));
    }
  }, [config]);
 
  const toggle = (key: keyof typeof flags) =>
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
 
  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async () => {
      const res = await put(endpoint.auth.ims_config, { featureFlags: flags });
      if (!res.success) throw new Error(res.data?.message ?? "Failed to save");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Feature flags saved");
      queryClient.invalidateQueries({ queryKey: ["ims-feature-flags"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
 
  return (
    <div>
      <SettingWrapper
        title="Feature Flags"
        description="Roll out capabilities safely"
        sub="Enable features per tenant, environment, or group."
      >
        <div className="space-y-8 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard
              title="Auto-merge (gated)"
              description="Enable merge button flow after approvals + verification"
              active={flags.autoMergeGated}
              onToggle={() => toggle("autoMergeGated")}
            />
            <FeatureCard
              title="Rollback playbooks"
              description="Enable rollback execution engine (gated in production)."
              active={flags.rollbackPlaybooks}
              onToggle={() => toggle("rollbackPlaybooks")}
            />
          </div>
 
          <FeatureCard
            title="Risk/Fraud lens"
            description="Allow Ezra to produce risk-aware narratives."
            active={flags.riskFraudLens}
            onToggle={() => toggle("riskFraudLens")}
            fullWidth
          />
        </div>
 
        <div className="pt-6 flex justify-end">
          <CButton className="w-fit px-4" onClick={() => save()} isLoading={isPending} disabled={isPending}>
            Save
          </CButton>
        </div>
      </SettingWrapper>
    </div>
  );
};
 
const FeatureCard = ({
  title, description, active, onToggle, fullWidth = false,
}: {
  title: string; description: string; active: boolean;
  onToggle: () => void; fullWidth?: boolean;
}) => (
  <div className={`${fullWidth ? "w-full" : ""} bg-white dark:bg-transparent border border-zinc-500 dark:border-neutral-500 rounded-xl p-4 flex justify-between items-start transition-all hover:border-zinc-300 dark:hover:border-neutral-500/80`}>
    <div className="space-y-2 pr-4">
      <h3 className="text-black dark:text-white font-bold text-lg">{title}</h3>
      <p className="text-zinc-500 dark:text-[#94A3B8] text-sm leading-relaxed max-w-[280px]">{description}</p>
    </div>
    <Switch color="success" size="sm" isSelected={active} onChange={onToggle} />
  </div>
);
 
export default page;
 