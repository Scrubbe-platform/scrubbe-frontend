"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SettingWrapper from "../_module/setting-wrapper";
import { ShieldCheck, Mail, Globe, Key, Activity, Users, Lock } from "lucide-react";
import { Switch } from "@heroui/react";
import CButton from "@/components/ui/Cbutton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
 
type SsoDomainRecord = { id: string; domain: string; verified: boolean; status: "VERIFIED" | "PENDING"; source: "LEGACY" | "MANUAL"; verificationToken: string | null; createdAt: string | null; verifiedAt: string | null; expiresAt: string | null };
type SsoTestReport = { outcome: "SUCCESS" | "FAILURE"; stage: string; message: string; remediation?: string };
type SecurityConfig = { available?: boolean; status?: string; protocol?: string | null; ssoEnabled?: boolean; provider?: string | null; providerSlug?: string | null; providerSupported?: boolean; providerSupportMessage?: string | null; ssoProvider?: string; ssoDomain?: string; ssoEnforced?: boolean; auditLogging?: boolean; ipAllowlist?: string[]; scimEnabled?: boolean; jitEnabled?: boolean; activeDomain?: SsoDomainRecord | null; domains?: SsoDomainRecord[]; domainVerificationRequired?: boolean; lastTestReport?: SsoTestReport | null; lastTestPassedAt?: string | null };
 
// Shared pill used throughout the section
const InfoPill = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 dark:border-neutral-500 rounded-full bg-zinc-50 dark:bg-[#0B1224]/50">
    {icon}
    <span className="text-[11px] font-bold text-zinc-700 dark:text-white uppercase tracking-wider">{label}</span>
  </div>
);
 
const ValuePill = ({ value }: { value: string }) => (
  <div className="px-4 py-1.5 border border-zinc-200 dark:border-neutral-500 rounded-full bg-zinc-50 dark:bg-[#0B1224]/50 text-[11px] font-mono text-zinc-600 dark:text-[#D1D5DB]">
    {value}
  </div>
);
 
const SecurityPage = () => {
  const { get, put, post } = useFetch();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [ssoEnforced, setSsoEnforced] = useState(false);
  const [auditLogging, setAuditLogging] = useState(true);
 
  const { data: config, isLoading } = useQuery<SecurityConfig>({
    queryKey: ["ims-sso-config"],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_sso);
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
      const res = await put(endpoint.auth.ims_sso, data);
      if (!res.success) throw new Error(res.data?.message ?? "Failed to save");
      return res.data;
    },
    onSuccess: () => { toast.success("Security settings saved"); queryClient.invalidateQueries({ queryKey: ["ims-sso-config"] }); },
    onError: (err: Error) => toast.error(err.message),
  });
 
  const { mutateAsync: runSsoTest, isPending: isTesting } = useMutation({
    mutationFn: async () => { const res = await post(endpoint.auth.ims_sso_test); if (!res.success) throw new Error(res.data ?? "Failed to test SSO"); return res.data?.data ?? res.data; },
    onSuccess: (result) => { const o = result?.outcome ?? "SUCCESS"; toast[o === "SUCCESS" ? "success" : "error"](o === "SUCCESS" ? "SSO test passed" : "SSO test failed", { description: result?.message }); queryClient.invalidateQueries({ queryKey: ["ims-sso-config"] }); },
    onError: (err: Error) => toast.error(err.message),
  });
 
  const { mutateAsync: activateSso, isPending: isActivating } = useMutation({
    mutationFn: async () => { const res = await post(endpoint.auth.ims_sso_activate); if (!res.success) throw new Error(res.data ?? "Failed to activate SSO"); return res.data; },
    onSuccess: () => { toast.success("SSO activated"); queryClient.invalidateQueries({ queryKey: ["ims-sso-config"] }); },
    onError: (err: Error) => toast.error(err.message),
  });
 
  const { mutateAsync: disableSso, isPending: isDisabling } = useMutation({
    mutationFn: async () => { const res = await post(endpoint.auth.ims_sso_disable); if (!res.success) throw new Error(res.data ?? "Failed to disable SSO"); return res.data; },
    onSuccess: () => { toast.success("SSO disabled"); queryClient.invalidateQueries({ queryKey: ["ims-sso-config"] }); },
    onError: (err: Error) => toast.error(err.message),
  });
 
  const { mutateAsync: verifyDomain, isPending: isVerifyingDomain } = useMutation({
    mutationFn: async () => {
      const domain = config?.activeDomain?.domain ?? config?.ssoDomain;
      if (!domain) throw new Error("No discovery domain is configured");
      const res = await post(endpoint.auth.ims_sso_verify_domain, { domain, verificationToken: config?.activeDomain?.verificationToken ?? undefined });
      if (!res.success) throw new Error(res.data ?? "Failed to verify domain");
      return res.data;
    },
    onSuccess: () => { toast.success("SSO domain verified"); queryClient.invalidateQueries({ queryKey: ["ims-sso-config"] }); },
    onError: (err: Error) => toast.error(err.message),
  });
 
  const ssoStatus = config?.status?.replace(/_/g, " ").toUpperCase() ?? (config?.available ? "CONFIGURED" : "NOT CONFIGURED");
  const ssoDomain = config?.ssoDomain ?? "-";
  const providerLabel = config?.provider ?? config?.ssoProvider ?? "-";
  const protocolLabel = config?.protocol ?? "-";
  const activeDomainStatus = config?.activeDomain ? (config.activeDomain.verified ? "Verified" : "Pending") : "Not configured";
  const lastTestLabel = config?.lastTestReport ? `${config.lastTestReport.outcome} - ${config.lastTestReport.stage}` : "Not run";
  const lastTestPassedLabel = config?.lastTestPassedAt ? new Date(config.lastTestPassedAt).toLocaleString() : null;
  const verificationToken = config?.activeDomain?.verificationToken ?? null;
  const canActivate = Boolean(config?.available) && !Boolean(config?.domainVerificationRequired) && Boolean(config?.lastTestPassedAt) && config?.providerSupported !== false;
 
  return (
    <div>
      <SettingWrapper title="Security" description="Identity, SSO, provisioning, and network controls" sub="This section is critical for enterprise onboarding.">
        <div className="grid 2xl:grid-cols-2 gap-8 items-start mb-8 pt-4">
          {/* LEFT — SSO */}
          <section className="bg-transparent border border-zinc-200 dark:border-neutral-500 rounded-[24px] p-6 space-y-6">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-zinc-800 dark:text-white font-bold text-[17px]">Single Sign-On (SSO)</h3>
              <button onClick={() => router.push("/auth/account-setup")} className="text-[#00CAD8] border border-[#00CAD8] px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">Configure</button>
            </div>
            <p className="text-zinc-400 dark:text-[#64748B] text-xs leading-relaxed px-1">SAML 2.0 or OIDC. Domain discovery via &quot;work email&quot;.</p>
 
            <div className="p-5 border border-zinc-200 dark:border-neutral-500 rounded-2xl space-y-4 bg-white dark:bg-transparent">
              {[
                { icon: <ShieldCheck size={14} className={config?.available ? "text-[#4ADE80]" : "text-zinc-400 dark:text-gray-500"} />, label: "Status",             value: isLoading ? "..." : ssoStatus                           },
                { icon: <Mail size={14} className="text-IMSLightGreen" />,                                                                    label: "Discovery domain",  value: isLoading ? "..." : ssoDomain                           },
                { icon: <ShieldCheck size={14} className="text-IMSLightGreen" />,                                                             label: "Domain status",     value: isLoading ? "..." : activeDomainStatus                  },
                { icon: <ShieldCheck size={14} className="text-IMSLightGreen" />,                                                             label: "Protocol/provider", value: isLoading ? "..." : `${protocolLabel} / ${providerLabel}` },
                { icon: <Activity size={14} className="text-IMSLightGreen" />,                                                                label: "Last test",         value: isLoading ? "..." : lastTestLabel                       },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center">
                  <InfoPill icon={row.icon} label={row.label} />
                  <ValuePill value={row.value} />
                </div>
              ))}
 
              {lastTestPassedLabel && (
                <div className="rounded-2xl border border-[#4ADE80]/20 bg-[#4ADE80]/5 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4ADE80]">Last passing test</p>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-[#D1D5DB]">{lastTestPassedLabel}</p>
                </div>
              )}
 
              {config?.providerSupported === false && config?.providerSupportMessage && (
                <div className="rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#FCD34D]">Provider bridge required</p>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-[#D1D5DB]">{config.providerSupportMessage}</p>
                </div>
              )}
 
              {config?.activeDomain && config.domainVerificationRequired && (
                <div className="rounded-2xl border border-[#F59E0B]/30 bg-zinc-50 dark:bg-[#0B1224]/70 px-4 py-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#FCD34D]">Verify {config.activeDomain.domain}</p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-[#D1D5DB]">This domain must be verified before SSO can be activated.</p>
                    </div>
                    <button onClick={() => verifyDomain()} disabled={isVerifyingDomain} className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1.5 rounded-xl text-[11px] font-bold hover:bg-[#00CAD8]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      {isVerifyingDomain ? "Verifying..." : "Verify domain"}
                    </button>
                  </div>
                  {verificationToken && (
                    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-[#64748B]">Verification token</p>
                      <p className="mt-1 break-all font-mono text-[11px] text-zinc-600 dark:text-[#D1D5DB]">{verificationToken}</p>
                    </div>
                  )}
                </div>
              )}
 
              <div className="flex justify-between items-center pt-2">
                <InfoPill icon={<Lock size={14} className="text-[#4ADE80]" />} label="Enforce SSO" />
                <Switch isSelected={ssoEnforced} onChange={() => setSsoEnforced((v) => !v)} size="sm" color="success" />
              </div>
            </div>
 
            <p className="text-zinc-400 dark:text-[#64748B] text-[11px] leading-relaxed italic px-1">When enabled: non-SSO logins are blocked (except break-glass admins).</p>
 
            <div className="flex flex-wrap gap-3 px-1">
              <button onClick={() => runSsoTest()} disabled={isTesting} className="text-zinc-700 dark:text-white border border-zinc-200 dark:border-white/15 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {isTesting ? "Running test..." : "Run test"}
              </button>
              <button onClick={() => activateSso()} disabled={isActivating || !canActivate} className="text-[#4ADE80] border border-[#4ADE80]/40 px-4 py-2 rounded-xl text-xs font-bold bg-[#4ADE80]/5 hover:bg-[#4ADE80]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {isActivating ? "Activating..." : "Activate SSO"}
              </button>
              <button onClick={() => disableSso()} disabled={isDisabling || config?.status === "NOT_CONFIGURED"} className="text-[#F87171] border border-[#F87171]/40 px-4 py-2 rounded-xl text-xs font-bold bg-[#F87171]/5 hover:bg-[#F87171]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {isDisabling ? "Disabling..." : "Disable SSO"}
              </button>
            </div>
 
            {!canActivate && config?.available && (
              <p className="text-zinc-400 dark:text-[#64748B] text-[11px] leading-relaxed px-1">Activation is unlocked after the domain is verified and a test has passed in the last 24 hours.</p>
            )}
          </section>
 
          {/* RIGHT — Network & API */}
          <section className="bg-transparent border border-zinc-200 dark:border-neutral-500 rounded-[24px] p-6 space-y-4">
            <h3 className="text-zinc-800 dark:text-white font-bold text-[17px] px-1">Network & API keys</h3>
 
            {[
              { icon: <Globe size={14} className="text-red-500" />,        label: "IP allowlist",    desc: "Limit admin access and execution to corporate IP ranges.", action: () => toast.info("IP allowlist configuration coming soon."),        actionLabel: "Edit"   },
              { icon: <Key size={14} className="text-[#A5B4FC]" />,        label: "API keys",        desc: "Used for webhooks, agents, and integration callbacks.",   action: () => toast.info("Manage API keys in the Integrations section."), actionLabel: "Manage" },
            ].map((item) => (
              <div key={item.label} className="p-5 border border-zinc-200 dark:border-neutral-500 rounded-2xl space-y-3 bg-white dark:bg-transparent">
                <div className="flex justify-between items-center">
                  <InfoPill icon={item.icon} label={item.label} />
                  <button onClick={item.action} className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-[#00CAD8]/5">{item.actionLabel}</button>
                </div>
                <p className="text-zinc-400 dark:text-[#64748B] text-xs leading-normal">{item.desc}</p>
                {item.label === "IP allowlist" && config?.ipAllowlist && config.ipAllowlist.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {config.ipAllowlist.map((ip, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 border border-zinc-200 dark:border-white/10 rounded bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-gray-300">{ip}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
 
            <div className="p-5 border border-zinc-200 dark:border-neutral-500 rounded-2xl flex justify-between items-center bg-white dark:bg-transparent">
              <InfoPill icon={<Activity size={14} className="text-[#F472B6]" />} label="Audit logging" />
              <Switch isSelected={auditLogging} onChange={() => setAuditLogging((v) => !v)} size="sm" color="success" />
            </div>
            <p className="text-zinc-400 dark:text-[#64748B] text-[10px] px-1">All changes in Settings and all execution decisions are logged.</p>
          </section>
        </div>
 
        {/* BOTTOM — Provisioning */}
        <section className="bg-transparent border border-zinc-200 dark:border-neutral-500 rounded-[24px] p-6 space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-zinc-800 dark:text-white font-bold text-[17px]">Provisioning (SCIM)</h3>
            <button onClick={() => toast.info("SCIM provisioning configuration requires an enterprise plan. Contact support.")} className="text-[#00CAD8] border border-[#00CAD8] px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">Configure</button>
          </div>
          <p className="text-zinc-400 dark:text-[#64748B] text-xs px-1">Auto-provision users from Okta/AzureAD, deprovision on offboarding.</p>
          <div className="p-4 border border-zinc-200 dark:border-neutral-500 rounded-2xl flex gap-4">
            {[
              { label: `SCIM: ${config?.scimEnabled ? "Configured" : "Not configured"}`, icon: <div className="w-3 h-[2px] bg-zinc-400 dark:bg-[#64748B]" /> },
              { label: `JIT: ${config?.jitEnabled !== false ? "Enabled" : "Disabled"}`,   icon: <Users size={14} className="text-[#A5B4FC]" />              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-4 py-1.5 border border-zinc-200 dark:border-neutral-500 rounded-full bg-zinc-50 dark:bg-[#0B1224]/50 text-[11px] text-zinc-600 dark:text-[#D1D5DB] font-bold uppercase tracking-widest">
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>
        </section>
 
        <div className="pt-6 flex justify-end">
          <CButton className="w-fit px-4" onClick={() => saveConfig({ ssoEnforced, auditLogging })} isLoading={isPending} disabled={isPending}>
            Save
          </CButton>
        </div>
      </SettingWrapper>
    </div>
  );
};
 
export default SecurityPage;
