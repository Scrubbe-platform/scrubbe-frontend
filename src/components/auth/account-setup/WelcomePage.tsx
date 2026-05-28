/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useMemo, ReactNode, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  ChevronDown,
  Info,
  Check,
  AlertCircle,
  Fingerprint,
  Database,
} from "lucide-react";
import { Switch } from "@heroui/react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { popularTimezones } from "@/lib/constant/index";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/text-area";
import { apiClient } from "@/lib/api/client";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import { AxiosError } from "axios";

function normalizeInviteRole(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("admin")) return "ADMIN";
  if (normalized.includes("commander")) return "MANAGER";
  if (normalized.includes("responder")) return "RESPONDER";
  if (normalized.includes("viewer")) return "VIEWER";
  return "ENGINEER";
}

const ScrubbeOnboarding = () => {
  const { register, handleSubmit, control, watch, setValue, reset, getValues } = useForm({
    defaultValues: {
      inviteEmails: "",
      inviteRole: "Admin-Full Control",
      welcomeNote: "Standard Welcome",
      customWelcomeNote: "",
      selfSignUp: true,
      newMemberRole: "Viewer - Safest Default",
      whoCanInvite: "Admin Only",
      selectedRole: "Responder",
      policies: {
        requireWorkEmail: true,
        enforceSSO: false,
        allowPDF: true,
        restrictExport: false,
        requireTwoApprovals: true,
        flagFraud: false,
      },
      ssoConfiguration: {
        ssoType: "SAML_2",
        provider: "OKTA",
        domain: "",
        client_secret: "",
        entity_id: "",
        idp_url: "",
        acs_url: `${
          process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
        }/auth/sso/saml/acs`,
        issuer_url: "",
        client_id: "",
        jitEnabled: true,
        autoRoleSync: false,
        groupMapping: '{ "scrubbe-admins": "ADMIN", "*": "RESPONDER" }',
      },
      workspaceName: "acme-payments",
      timezone: "UTC",
      integrations: {
        slack: true,
        email: true,
        cicd: false,
        fraud: false,
      },
      manualDone: { s1: false, s2: false, s3: false, s4: false },
    },
  });

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formValues = watch();

  const progress = useMemo(() => {
    const s1 =
      formValues.inviteEmails.trim().length > 5 || formValues.manualDone.s1;
    const s2 = !!formValues.selectedRole || formValues.manualDone.s2;
    const s3 = formValues.manualDone.s3;
    const s4 =
      formValues.workspaceName.trim().length > 0 || formValues.manualDone.s4;
    const steps = [s1, s2, s3, s4];
    const completed = steps.filter(Boolean).length;
    return { s1, s2, s3, s4, percentage: (completed / 4) * 100, completed };
  }, [formValues]);

  useEffect(() => {
    let isMounted = true;

    const loadExistingSetup = async () => {
      try {
        const [imsConfigResponse, ssoConfigResponse] = await Promise.allSettled([
          apiClient.get(endpoint.auth.ims_config),
          apiClient.get(endpoint.auth.ims_sso),
        ]);

        if (!isMounted) {
          return;
        }

        const imsConfig =
          imsConfigResponse.status === "fulfilled"
            ? imsConfigResponse.value.data?.data ?? imsConfigResponse.value.data ?? {}
            : {};
        const ssoConfig =
          ssoConfigResponse.status === "fulfilled"
            ? ssoConfigResponse.value.data?.data ?? ssoConfigResponse.value.data ?? {}
            : {};
        const currentValues = getValues();

        reset({
          ...currentValues,
          policies: {
            ...currentValues.policies,
            enforceSSO: Boolean(ssoConfig.ssoEnforced ?? imsConfig.ssoEnforced ?? false),
          },
          ssoConfiguration: {
            ...currentValues.ssoConfiguration,
            ssoType:
              ssoConfig.protocol === "OIDC" || ssoConfig.protocol === "SAML_2"
                ? ssoConfig.protocol
                : currentValues.ssoConfiguration.ssoType,
            provider:
              ssoConfig.provider ?? currentValues.ssoConfiguration.provider,
            domain:
              ssoConfig.ssoDomain ??
              imsConfig.primaryDomain ??
              currentValues.ssoConfiguration.domain,
            entity_id:
              ssoConfig.samlEntityId ?? currentValues.ssoConfiguration.entity_id,
            idp_url:
              ssoConfig.samlIdpMetadataUrl ??
              currentValues.ssoConfiguration.idp_url,
            acs_url:
              ssoConfig.samlAcsUrl ??
              currentValues.ssoConfiguration.acs_url,
            issuer_url:
              ssoConfig.oidcIssuer ?? currentValues.ssoConfiguration.issuer_url,
            client_id:
              ssoConfig.oidcClientId ?? currentValues.ssoConfiguration.client_id,
            client_secret: "",
            jitEnabled:
              ssoConfig.jitEnabled ?? currentValues.ssoConfiguration.jitEnabled,
            autoRoleSync:
              ssoConfig.scimEnabled ??
              currentValues.ssoConfiguration.autoRoleSync,
            groupMapping:
              ssoConfig.groupMapping && Object.keys(ssoConfig.groupMapping).length > 0
                ? JSON.stringify(ssoConfig.groupMapping, null, 2)
                : currentValues.ssoConfiguration.groupMapping,
          },
          workspaceName:
            imsConfig.orgName ?? imsConfig.companyName ?? currentValues.workspaceName,
          timezone: imsConfig.timezone ?? currentValues.timezone,
        });
      } catch (error) {
        console.error("Failed to preload workspace setup:", error);
      }
    };

    void loadExistingSetup();

    return () => {
      isMounted = false;
    };
  }, [getValues, reset]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      const inviteMembers = data.inviteEmails
        .split(/[\n,]+/)
        .map((value: string) => value.trim())
        .filter(Boolean)
        .map((inviteEmail: string) => ({
          inviteEmail,
          role: normalizeInviteRole(data.inviteRole),
        }));

      let parsedGroupMapping: Record<string, string> | undefined;
      if (data.ssoConfiguration?.groupMapping?.trim()) {
        try {
          parsedGroupMapping = JSON.parse(data.ssoConfiguration.groupMapping);
        } catch {
          throw new Error("Group mapping must be valid JSON");
        }
      }

      const payload = {
        orgName: data.workspaceName,
        companyName: data.workspaceName,
        primaryDomain: data.ssoConfiguration?.domain?.trim() || undefined,
        timezone: data.timezone,
        inviteMembers,
        policies: data.policies,
        ssoConfiguration: {
          ...data.ssoConfiguration,
          provider: data.ssoConfiguration?.provider?.trim() || "",
          domain: data.ssoConfiguration?.domain?.trim() || "",
          group_mapping: parsedGroupMapping,
          scimEnabled: Boolean(data.ssoConfiguration?.autoRoleSync),
        },
        jitEnabled: Boolean(data.ssoConfiguration?.jitEnabled),
        scimEnabled: Boolean(data.ssoConfiguration?.autoRoleSync),
        ssoEnforced: Boolean(data.policies?.enforceSSO),
        ssoProvider: data.ssoConfiguration?.provider?.trim() || undefined,
      };

      await apiClient.post(endpoint.auth.ims_setup, payload);

      const hasSsoDraft = Boolean(
        data.policies?.enforceSSO ||
          data.ssoConfiguration?.domain ||
          data.ssoConfiguration?.issuer_url ||
          data.ssoConfiguration?.client_id ||
          data.ssoConfiguration?.idp_url ||
          data.ssoConfiguration?.entity_id,
      );

      if (hasSsoDraft) {
        const testResponse = await apiClient.post(endpoint.auth.ims_sso_test);
        const testResult = testResponse.data?.data ?? testResponse.data;

        if (testResult?.outcome === "SUCCESS") {
          await apiClient.post(endpoint.auth.ims_sso_activate);
          toast.success("Workspace and SSO setup saved");
        } else {
          toast.info("Workspace saved, SSO kept in draft", {
            description:
              testResult?.message ??
              "Finish the remaining identity-provider requirements before activation.",
          });
        }
      } else {
        toast.success("Workspace setup saved");
      }

      router.push("/incident");
    } catch (error) {
      console.error("Workspace setup error:", error);
      toast.error("Unable to save workspace setup", {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Please review the SSO fields and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08132F] text-[#D1D5DB] font-sans p-10 selection:bg-IMSCyan selection:text-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-[1400px] mx-auto"
      >
        {/* HEADER SECTION */}
        <div className="flex justify-between items-start mb-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-white mb-3">
              Welcome to your Scrubbe Workspace
            </h1>
            <p className="text-[#9CA3AF] text-base leading-relaxed">
              You&apos;re the first administrator here. Take a few minutes to
              invite your team, choose roles and permissions, and set the basic
              guardrails for how incidents, fraud signals, and handovers work in
              acme-payments.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/incident")}
            className="px-4 py-1.5 border border-white rounded text-xs font-bold text-white hover:bg-transparent"
          >
            Skip for now
          </button>
        </div>

        <div className="flex gap-10">
          {/* LEFT COLUMN: THE STEPS */}
          <div className="flex-[2.8] space-y-8">
            {/* STEP 1: INVITE */}
            <StepWrapper
              subtitle="Bring SREs, fraud analysts, and managers into Scrubbe so incidents are never handled in isolation."
              title="Step 1 · Invite your team"
              desc="Bring SREs, fraud analysts, and managers into Scrubbe so incidents are never handled in isolation."
              isDone={progress.s1}
              onManualDone={() =>
                setValue("manualDone.s1", !formValues.manualDone.s1)
              }
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider">
                    Email addresses to Invite
                  </label>
                  <textarea
                    {...register("inviteEmails")}
                    className="w-full bg-[#08132F] border border-zinc-500 rounded-md p-4 h-28 text-sm outline-none focus:border-[#00CAD8]"
                    placeholder="jane@acme.com, jude@flutter.com"
                  />
                  <p className="text-sm">
                    Paste one or more emails separated by commas or line breaks.
                    Scrubbe will send each person an invite.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <Controller
                    name="inviteRole"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        label="Default role for these invites"
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          "Admin-Full Control",
                          "Commander",
                          "Responder",
                          "Viewer",
                        ]}
                      />
                    )}
                  />
                  <Controller
                    name="welcomeNote"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        label="Send Welcome Note"
                        value={field.value}
                        onChange={field.onChange}
                        options={["Custom Message", "Standard Welcome", "None"]}
                      />
                    )}
                  />
                </div>

                {watch("welcomeNote") === "Custom Message" && (
                  <Controller
                    name="customWelcomeNote"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        label="Send Welcome Note"
                        value={field.value}
                        onChange={field.onChange}
                        className="!bg-[#08132F]"
                      />
                    )}
                  />
                )}
                <Controller
                  name="selfSignUp"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch
                      label="Self Sign-Up"
                      sub="Allow anyone with @acme.com to join"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <div className="flex items-center justify-end pt-4 border-t border-[#1F2937]">
                  <div className="flex gap-4 items-center">
                    <button
                      type="button"
                      className="text-IMSCyan px-6 py-2 rounded-md text-sm font-bold border border-IMSCyan"
                    >
                      Skip for Now
                    </button>
                    <button
                      type="button"
                      className="bg-IMSCyan text-black px-6 py-2 rounded-md font-bold text-sm"
                    >
                      Send Invites
                    </button>
                  </div>
                </div>
              </div>
            </StepWrapper>

            {/* STEP 2: ROLES */}
            <StepWrapper
              subtitle="Decide who can do what in this workspace. You can refine this later in the full settings area."
              title="Step 2 · Roles & permissions"
              desc="Decide who can do what in this workspace. You can refine this later in settings."
              isDone={progress.s2}
              onManualDone={() =>
                setValue("manualDone.s2", !formValues.manualDone.s2)
              }
            >
              <div className="grid grid-cols-2 gap-6 mb-8">
                <Controller
                  name="newMemberRole"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      label="Default role for new members"
                      value={field.value}
                      onChange={field.onChange}
                      options={["Admin", "Commander", "Responder", "Viewer"]}
                    />
                  )}
                />
                <Controller
                  name="whoCanInvite"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      label="Who can invite others?"
                      value={field.value}
                      onChange={field.onChange}
                      options={["Admin Only", "Admin & Commanders"]}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    name: "Admin",
                    desc: "Full settings, billing, API keys, environment and policy changes.",
                  },
                  {
                    name: "Commander",
                    desc: "Leads incidents, assigns owners, approves production changes.",
                  },
                  {
                    name: "Responder",
                    desc: "Updates incidents, adds notes, runs playbooks.",
                  },
                  {
                    name: "Viewer",
                    desc: "Read-only access to incidents and handovers.",
                  },
                ].map((r) => (
                  <RoleCard
                    key={r.name}
                    title={r.name}
                    desc={r.desc}
                    active={watch("newMemberRole") === r.name}
                  />
                ))}
              </div>
            </StepWrapper>

            {/* STEP 3: POLICIES */}
            <StepWrapper
              subtitle="Set basic sign-in, export, and approval rules for this tenant. These apply to all teams inside this workspace."
              title="Step 3 · Tenant policies & safety rails"
              desc="Set basic sign-in, export, and approval rules for this tenant."
              isDone={progress.s3}
              onManualDone={() =>
                setValue("manualDone.s3", !formValues.manualDone.s3)
              }
            >
              <div className="space-y-8">
                <PolicyGroup title="Sign-in & access">
                  <Controller
                    name="policies.requireWorkEmail"
                    control={control}
                    render={({ field }) => (
                      <PolicyToggle
                        label="Require work email for login"
                        sub="Block sign-in from free email providers (e.g. Gmail, Yahoo) unless explicitly allowed."
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="policies.enforceSSO"
                    control={control}
                    render={({ field }) => (
                      <PolicyToggle
                        label="Enforce SSO when configured"
                        sub="Once SSO is connected, all users must log in via your identity provider."
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </PolicyGroup>

                <AnimatePresence>
                  {formValues.policies.enforceSSO === true && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="p-4 rounded-lg bg-dark">
                        <div className="grid grid-cols-2 gap-3">
                          <Controller
                            name="ssoConfiguration.ssoType"
                            control={control}
                            render={({ field }) => (
                              <Select
                                label="SSO Type"
                                options={[
                                  { label: "SAML 2.0", value: "SAML_2" },
                                  {
                                    label: "OIDC (OpenID Connect)",
                                    value: "OIDC",
                                  },
                                ]}
                                labelClassName=""
                                {...field}
                              />
                            )}
                          />
                          <Controller
                            name="ssoConfiguration.provider"
                            control={control}
                            render={({ field }) => (
                              <Select
                                label="Identity Provider"
                                options={[
                                  { label: "Okta", value: "OKTA" },
                                  { label: "OneLogin", value: "ONELOGIN" },
                                  { label: "Microsoft Entra ID", value: "AZURE" },
                                  { label: "Google Workspace", value: "GOOGLE" },
                                  { label: "GitHub", value: "GITHUB" },
                                  { label: "GitLab", value: "GITLAB" },
                                ]}
                                labelClassName=""
                                {...field}
                              />
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-3 mt-3">
                          <Controller
                            name="ssoConfiguration.domain"
                            control={control}
                            render={({ field }) => (
                              <Input
                                label="Discovery Domain"
                                placeholder="acme.com"
                                {...field}
                              />
                            )}
                          />
                        </div>

                        {/* 3. SAML/OIDC DYNAMIC DETAILS — Signal Ingestion */}
                        <div className="bg-panel/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
                            <Database className="size-4 text-accent" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                              {formValues.ssoConfiguration.ssoType === "SAML_2"
                                ? "SAML 2.0 Identity Details"
                                : "OIDC Client Configuration"}
                            </h3>
                          </div>

                          <div className="p-6 space-y-6">
                            {formValues.ssoConfiguration.ssoType ===
                            "SAML_2" ? (
                              <>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    IdP Metadata URL
                                  </label>
                                  <Controller
                                    name="ssoConfiguration.idp_url"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        placeholder="https://idp.example.com/app/metadata"
                                        className="!h-11 !bg-void/50"
                                        {...field}
                                      />
                                    )}
                                  />
                                  <p className="text-[9px] text-gray-500 font-mono italic">
                                    Required for Stage 6 Guardrail Check
                                    integration.{" "}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                      Entity ID
                                    </label>
                                    <Controller
                                      name="ssoConfiguration.entity_id"
                                      control={control}
                                      render={({ field }) => (
                                        <Input
                                          placeholder="urn:scrubbe:acme"
                                          className="!h-11 !bg-void/50"
                                          {...field}
                                        />
                                      )}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                      ACS URL
                                    </label>
                                    <Controller
                                      name="ssoConfiguration.acs_url"
                                      control={control}
                                    render={({ field }) => (
                                      <Input
                                          value={field.value}
                                          readOnly
                                          className="!h-11 !bg-void/20 text-gray-500"
                                        />
                                      )}
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="space-y-6">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Issuer URL
                                  </label>
                                  <Controller
                                    name="ssoConfiguration.issuer_url"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        placeholder="https://accounts.google.com"
                                        className="!h-11 !bg-void/50"
                                        {...field}
                                      />
                                    )}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                      Client ID
                                    </label>
                                    <Controller
                                      name="ssoConfiguration.client_id"
                                      control={control}
                                      render={({ field }) => (
                                        <Input
                                          placeholder="scrubbe-client-id"
                                          className="!h-11 !bg-void/50"
                                          {...field}
                                        />
                                      )}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                      Client Secret
                                    </label>
                                    <Controller
                                      name="ssoConfiguration.client_secret"
                                      control={control}
                                      render={({ field }) => (
                                        <Input
                                          type="password"
                                          placeholder="••••••••••••"
                                          className="!h-11 !bg-void/50"
                                          {...field}
                                        />
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 4. PROVISIONING — Trust Ladder Integration */}
                        <div className=" border border-IMSCyan/10 rounded-2xl p-6 space-y-6 mt-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Fingerprint className="size-5 text-IMSCyan" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                              Provisioning & Role Mapping
                            </h3>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-void/40 border border-white/5 rounded-xl">
                              <div className="flex items-center gap-3">
                                <Info className="size-4 text-gray-500" />
                                <span className="text-xs font-medium">
                                  JIT Provisioning
                                </span>
                              </div>
                              <Controller
                                name="ssoConfiguration.jitEnabled"
                                control={control}
                                render={({ field }) => (
                                  <Switch
                                    size="sm"
                                    color="success"
                                    isSelected={Boolean(field.value)}
                                    onChange={() => field.onChange(!field.value)}
                                  />
                                )}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-void/40 border border-white/5 rounded-xl">
                              <div className="flex items-center gap-3">
                                <AlertCircle className="size-4 text-gray-500" />
                                <span className="text-xs font-medium">
                                  Auto-Role Sync
                                </span>
                              </div>
                              <Controller
                                name="ssoConfiguration.autoRoleSync"
                                control={control}
                                render={({ field }) => (
                                  <Switch
                                    size="sm"
                                    color="success"
                                    isSelected={Boolean(field.value)}
                                    onChange={() => field.onChange(!field.value)}
                                  />
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                              Group → Scrubbe Role Mapping
                            </label>
                            <Controller
                              name="ssoConfiguration.groupMapping"
                              control={control}
                              render={({ field }) => (
                                <TextArea
                                  className="w-full bg-void/50 border border-white/10 rounded-xl p-4 h-32 text-xs font-mono outline-none focus:border-IMSCyan/50 transition-all"
                                  placeholder='{ "SRE_TEAM": "Commander", "DEVOPS": "Responder" }'
                                  rows={6}
                                  {...field}
                                />
                              )}
                            />
                            <p className="text-[10px] text-gray-500 italic">
                              Mapping is stored as JSONB data in policy-service.
                              [cite: 168]
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <PolicyGroup title="Data export & sharing">
                  <Controller
                    name="policies.allowPDF"
                    control={control}
                    render={({ field }) => (
                      <PolicyToggle
                        label="Allow handover export to PDF/Word"
                        sub="Lets teams share shift summaries with external stakeholders where needed."
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="policies.restrictExport"
                    control={control}
                    render={({ field }) => (
                      <PolicyToggle
                        label="Restrict exports to Admins & Commanders"
                        sub="Only senior roles can export incidents or handovers out of Scrubbe."
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </PolicyGroup>

                <PolicyGroup title="Approvals for high-risk changes">
                  <Controller
                    name="policies.requireTwoApprovals"
                    control={control}
                    render={({ field }) => (
                      <PolicyToggle
                        label="Allow handover export to PDF/Word"
                        sub="Require two approvals for production fixes"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="policies.flagFraud"
                    control={control}
                    render={({ field }) => (
                      <PolicyToggle
                        label="Flag high-impact fraud playbooks"
                        sub="Actions that block or refund many customers must be manually confirmed by a Commander."
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </PolicyGroup>
              </div>
            </StepWrapper>

            {/* STEP 4: INTEGRATIONS */}
            <StepWrapper
              subtitle="Give Scrubbe a few pointers so we know where to send alerts and which systems to listen to."
              title="Step 4 · Workspace basics & integrations"
              isDone={progress.s4}
              onManualDone={() =>
                setValue("manualDone.s4", !formValues.manualDone.s4)
              }
            >
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white uppercase">
                    Workspace Name
                  </label>
                  <input
                    {...register("workspaceName")}
                    className="w-full bg-[#08132F] border border-[#4B5563] rounded p-2 text-sm outline-none"
                  />
                  <p className="text-sm">
                    Used in emails, alerts and handover documents.
                  </p>
                </div>
                <Controller
                  name="timezone"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      label="Timezone"
                      value={field.value}
                      onChange={field.onChange}
                      options={popularTimezones.map((value) => value.label)}
                    />
                  )}
                />
              </div>
              <p className="text-white text-base pb-3">
                Key integrations to connect now
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    value: "slack",
                    name: "slack",
                    desc: "Send incidents & handovers into channels",
                  },
                  {
                    value: "email",
                    name: "email",
                    desc: "Handover emails for managers & execs",
                  },
                  {
                    value: "cicd",
                    name: "ci/cd",
                    desc: "Open incidents on failed deployments",
                  },
                  {
                    value: "fraud",
                    name: "fraud tools",
                    desc: "Stream fraud & risk alerts into Scrubbe",
                  },
                ].map(({ desc, name, value }) => (
                  <Controller
                    key={name}
                    name={`integrations.${value}` as any}
                    control={control}
                    render={({ field }) => (
                      <IntegrationCard
                        label={name.toUpperCase()}
                        active={field.value}
                        onChange={field.onChange}
                        desc={desc}
                        disable={value == "fraud"}
                      />
                    )}
                  />
                ))}
              </div>
              <div className=" space-y-3 py-3">
                <p className="text-base">
                  You can adjust and add more connectors later from the Settings
                  → Integrations page.
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-fit border-IMSCyan border text-IMSCyan py-3 px-3 text-base rounded-lg font-bold mt-8 hover:brightness-110"
                >
                  {isSubmitting ? "Saving..." : "Continue"}
                </button>
              </div>
            </StepWrapper>
          </div>

          {/* RIGHT COLUMN: SIDEBAR (EXACT UI) */}
          <aside className="flex-1 space-y-6 ">
            <div className="border-zinc-400 border bg-[#08132F] p-6 rounded-lg">
              <h3 className="text-base font-bold text-white mb-1">
                People in this workspace
              </h3>
              <p className="text-sm text-zinc-200 mb-4 tracking-tighter">
                A quick snapshot of who’s here and what they can do.{" "}
              </p>
              <div className="mb-4">
                <div className="flex justify-between items-center text-sm text-white ">
                  <span className="font-medium">You (workspace owner)</span>
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-xs ">Admins, SREs, fraud & business teams</p>
              </div>
              <div>
                <p className="text-sm text-white font-medium">
                  No invited members yet.
                </p>
                <p className="text-xs">
                  Use “Step 1 · Invite your team” to add SREs, fraud ops and
                  business stakeholders.
                </p>
              </div>
            </div>

            <div className="border-zinc-400 border bg-[#08132F] p-6 rounded-lg space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Info size={14} className="text-[#00CAD8]" /> Need help?
              </h3>
              <p className="text-sm">
                A few quick links if you want more detail while you set things
                up.
              </p>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-[#00CAD8] block underline">
                  Getting Started guide for Admins{" "}
                </a>
                <a href="#" className="text-[#00CAD8] block underline">
                  Best practices for roles & permissions{" "}
                </a>
                <a href="#" className="text-[#00CAD8] block underline">
                  How automated handovers work in Scrubbe{" "}
                </a>
                <a href="#" className="text-[#00CAD8] block underline">
                  Contact Scrubbe Support{" "}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
};

/* --- FULL UI COMPONENTS --- */

const StepWrapper = ({
  subtitle,
  title,
  children,
  isDone,
  onManualDone,
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={`bg-gradient-to-b from-[#0074834D] to-[#004B571A] border rounded-xl transition-all border-IMSCyan/40 overflow-clip mb-8`}
  >
    <div className="p-4 border-b border-[#1F2937] flex justify-between items-center ">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          {title}
        </h2>
        <p className="text-neutral-300 text-sm">{subtitle}</p>
      </div>
    </div>
    <div className="px-4 py-4">{children}</div>
  </motion.div>
);
const ToggleSwitch = ({ label, sub, value, onChange }: any) => (
  <div className="flex items-center justify-between gap-6">
    <div className="flex flex-col">
      <span className="text-base font-bold text-white">{label}</span>
      <span className="text-sm text-zinc-300">{sub}</span>
    </div>
    <Switch value={value} onChange={() => onChange(!value)} color="success" />
  </div>
);

const RoleCard = ({
  title,
  desc,
  active,
}: {
  title: string;
  desc: string;
  active: boolean;
}) => (
  <div
    className={`${
      active ? "opacity-100 scale-105" : "opacity-65 scale-100"
    } p-4 rounded-lg border cursor-pointer bg-[#111827] border-zinc-300 hover:border-[#4B5563] transition-all duration-250`}
  >
    <h4 className={`text-base font-bold mb-1 text-white`}>{title}</h4>
    <p className="text-sm text-zinc-300 leading-tight">{desc}</p>
  </div>
);

const CustomSelect = ({ label, value, options, onChange }: any) => {
  return (
    <div className="space-y-2 relative">
      <label className="text-[11px] font-bold text-white uppercase">
        {label}
      </label>
      <Select
        label={""}
        value={value}
        options={options.map((option: any) => ({
          value: option,
          label: option,
        }))}
        onChange={onChange}
        className="!bg-[#08132F] !h-10 border-zinc-500"
      />
    </div>
  );
};

const PolicyGroup = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="space-y-3">
    <h4 className="text-base font-bold text-white  uppercase tracking-widest">
      {title}
    </h4>
    <div className="space-y-5">{children}</div>
  </div>
);

const PolicyToggle = ({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub: string;
  value: any;
  onChange: (value: boolean) => void;
}) => (
  <div className="flex justify-between items-start">
    <div className="flex flex-col">
      <span className="text-sm font-bold text-white tracking-wide">
        {label}
      </span>
      <span className="text-sm text-zinc-200">{sub}</span>
    </div>

    <Switch value={value} onChange={() => onChange(!value)} color="success" />
  </div>
);

const IntegrationCard = ({
  label,
  active,
  onChange,
  desc,
  disable,
}: {
  disable: boolean;
  label: string;
  active: boolean;
  onChange: (value: any) => void;
  desc: string;
}) => (
  <motion.div
    animate={{ borderColor: active ? "#00CAD8" : "#4B5563" }}
    className={`p-4 rounded-lg border flex justify-between items-center cursor-pointer bg-[#0A1635] ${
      disable ? "opacity-70" : ""
    }`}
  >
    <div className="pr-4">
      <p className="text-xs font-bold text-white tracking-widest">{label}</p>
      <p className="text-[11px] text-zinc-400">{desc}</p>
    </div>
    <Switch
      isSelected={active}
      onValueChange={onChange}
      color="success"
      size="sm"
      disabled={disable}
    />
  </motion.div>
);

const SidebarStep = ({ label, subLabel, active }: any) => (
  <div className="flex items-center gap-3">
    <motion.div
      animate={{
        backgroundColor: active ? "#00CAD8" : "transparent",
        borderColor: active ? "#00CAD8" : "#1F2937",
      }}
      className="w-4 h-4 border rounded flex items-center justify-center"
    >
      {active && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <Check size={10} color="black" strokeWidth={4} />
        </motion.div>
      )}
    </motion.div>
    <div>
      <p
        className={`text-sm font-bold ${
          active ? "text-white" : "text-[#6B7280]"
        }`}
      >
        {label}
      </p>
      <p className="text-[11px] text-[#6B7280]">{subLabel}</p>
    </div>
  </div>
);

export default ScrubbeOnboarding;
