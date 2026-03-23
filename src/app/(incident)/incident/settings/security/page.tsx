/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import SettingWrapper from "../_module/setting-wrapper";
import {
  ShieldCheck,
  Mail,
  Globe,
  Key,
  Activity,
  Users,
  Lock,
} from "lucide-react";
import { Switch } from "@heroui/react";
import CButton from "@/components/ui/Cbutton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import useAuthStore from "@/lib/stores/auth.store";

type SecurityConfig = {
  ssoEnabled?: boolean;
  ssoProvider?: string;
  ssoDomain?: string;
  ssoEnforced?: boolean;
  auditLogging?: boolean;
  ipAllowlist?: string[];
  scimEnabled?: boolean;
  jitEnabled?: boolean;
};

const page = () => {
  const { get, put } = useFetch();
  const queryClient = useQueryClient();
  const [ssoEnforced, setSsoEnforced] = useState(false);
  const [auditLogging, setAuditLogging] = useState(true);

  const { data: config, isLoading } = useQuery<SecurityConfig>({
    queryKey: ["ims-security-config"],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_config);
      if (res.success) {
        const c = res.data?.data ?? res.data ?? {};
        setSsoEnforced(c.ssoEnforced ?? false);
        setAuditLogging(c.auditLogging ?? true);
        return c as SecurityConfig;
      }
      return {};
    },
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: saveConfig, isPending } = useMutation({
    mutationFn: async (data: Partial<SecurityConfig>) => {
      const res = await put(endpoint.auth.ims_config, data);
      if (!res.success) throw new Error(res.data?.message ?? "Failed to save");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Security settings saved");
      queryClient.invalidateQueries({ queryKey: ["ims-security-config"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSave = () => {
    saveConfig({ ssoEnforced, auditLogging });
  };

  const ssoStatus = config?.ssoEnabled ? "Configured" : "Not Configured";
  const ssoDomain = config?.ssoDomain ?? "—";

  return (
    <div>
      <SettingWrapper
        title="Security"
        description="Identity, SSO, provisioning, and network controls"
        sub="This section is critical for enterprise onboarding."
      >
        <div className="grid 2xl:grid-cols-2 gap-8 items-start mb-8 pt-4">
          {/* LEFT: SSO CONFIG */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-6 space-y-6">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-white font-bold text-[17px]">
                Single Sign-On (SSO)
              </h3>
              <button
                onClick={() =>
                  toast.info(
                    "SSO configuration requires contacting your workspace admin or setting up via your identity provider."
                  )
                }
                className="text-[#00CAD8] border border-[#00CAD8] px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#00CAD8]/5 transition-all"
              >
                Configure
              </button>
            </div>

            <p className="text-[#64748B] text-xs leading-relaxed px-1">
              SAML 2.0 or OIDC. Domain discovery via &quot;work email&quot;.
            </p>

            <div className="p-5 border border-neutral-500 rounded-2xl space-y-4">
              {/* STATUS ROW */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <ShieldCheck
                    size={14}
                    className={
                      config?.ssoEnabled ? "text-[#4ADE80]" : "text-gray-500"
                    }
                  />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    Status
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <div
                    className={`w-4 h-[2px] ${
                      config?.ssoEnabled ? "bg-[#4ADE80]" : "bg-[#64748B]"
                    }`}
                  />
                  <span className="text-[11px] font-bold text-[#D1D5DB]">
                    {isLoading ? "…" : ssoStatus}
                  </span>
                </div>
              </div>

              {/* DISCOVERY ROW */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <Mail size={14} className="text-[#A5B4FC]" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    Discovery domain
                  </span>
                </div>
                <div className="px-4 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50 text-[11px] font-mono text-[#D1D5DB]">
                  {isLoading ? "…" : ssoDomain}
                </div>
              </div>

              {/* ENFORCEMENT ROW */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <Lock size={14} className="text-[#4ADE80]" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    Enforce SSO
                  </span>
                </div>
                <Switch
                  isSelected={ssoEnforced}
                  onChange={() => setSsoEnforced((v) => !v)}
                  size="sm"
                  color="success"
                />
              </div>
            </div>

            <p className="text-[#64748B] text-[11px] leading-relaxed italic px-1">
              When enabled: non-SSO logins are blocked (except break-glass
              admins).
            </p>
          </section>

          {/* RIGHT: NETWORK & API */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-6 space-y-4">
            <h3 className="text-white font-bold text-[17px] px-1">
              Network & API keys
            </h3>

            {/* IP ALLOWLIST */}
            <div className="p-5 border border-neutral-500 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <Globe size={14} className="text-red-500" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    IP allowlist
                  </span>
                </div>
                <button
                  onClick={() =>
                    toast.info("IP allowlist configuration coming soon.")
                  }
                  className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-[#00CAD8]/5"
                >
                  Edit
                </button>
              </div>
              <p className="text-[#64748B] text-xs">
                Limit admin access and execution to corporate IP ranges.
              </p>
              {config?.ipAllowlist && config.ipAllowlist.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {config.ipAllowlist.map((ip, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 border border-white/10 rounded bg-white/5 text-gray-300"
                    >
                      {ip}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* API KEYS */}
            <div className="p-5 border border-neutral-500 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <Key size={14} className="text-[#A5B4FC]" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    API keys
                  </span>
                </div>
                <button
                  onClick={() =>
                    toast.info("Manage API keys in the Integrations section.")
                  }
                  className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-[#00CAD8]/5"
                >
                  Manage
                </button>
              </div>
              <p className="text-[#64748B] text-xs leading-normal">
                Used for webhooks, agents, and integration callbacks.
              </p>
            </div>

            {/* AUDIT LOGGING */}
            <div className="p-5 border border-neutral-500 rounded-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <Activity size={14} className="text-[#F472B6]" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    Audit logging
                  </span>
                </div>
              </div>
              <Switch
                isSelected={auditLogging}
                onChange={() => setAuditLogging((v) => !v)}
                size="sm"
                color="success"
              />
            </div>
            <p className="text-[#64748B] text-[10px] px-1">
              All changes in Settings and all execution decisions are logged.
            </p>
          </section>
        </div>

        {/* BOTTOM: PROVISIONING */}
        <section className="bg-transparent border border-neutral-500 rounded-[24px] p-6 space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-white font-bold text-[17px]">
              Provisioning (SCIM)
            </h3>
            <button
              onClick={() =>
                toast.info(
                  "SCIM provisioning configuration requires an enterprise plan. Contact support."
                )
              }
              className="text-[#00CAD8] border border-[#00CAD8] px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#00CAD8]/5 transition-all"
            >
              Configure
            </button>
          </div>
          <p className="text-[#64748B] text-xs px-1">
            Auto-provision users from Okta/AzureAD, deprovision on offboarding.
          </p>

          <div className="p-4 border border-neutral-500 rounded-2xl flex gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50 text-[11px] text-[#D1D5DB] font-bold uppercase tracking-widest">
              <div className="w-3 h-[2px] bg-[#64748B]" />
              SCIM: {config?.scimEnabled ? "Configured" : "Not configured"}
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50 text-[11px] text-[#D1D5DB] font-bold uppercase tracking-widest">
              <Users size={14} className="text-[#A5B4FC]" />
              JIT: {config?.jitEnabled !== false ? "Enabled" : "Disabled"}
            </div>
          </div>
        </section>

        {/* SAVE BUTTON */}
        <div className="pt-6 flex justify-end">
          <CButton
            className="w-fit px-4"
            onClick={handleSave}
            isLoading={isPending}
            disabled={isPending}
          >
            Save
          </CButton>
        </div>
      </SettingWrapper>
    </div>
  );
};

export default page;
