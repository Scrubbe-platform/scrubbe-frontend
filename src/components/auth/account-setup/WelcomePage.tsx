/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useMemo, ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { ChevronDown, Info, Check } from "lucide-react";
import { Switch } from "@heroui/react";

const ScrubbeOnboarding = () => {
  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: {
      inviteEmails: "",
      inviteRole: "Admin-Full Control",
      welcomeNote: "Use my own message later",
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
      workspaceName: "acme-payments",
      timezone: "UTC",
      integrations: {
        slack: true,
        email: true,
        cicd: false,
        fraud: true,
      },
      manualDone: { s1: false, s2: false, s3: false, s4: false },
    },
  });

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

  const onSubmit = (data: any) => console.log("Complete Payload:", data);

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
            <p className="text-[#9CA3AF] text-sm leading-relaxed">
              You&apos;re the first administrator here. Take a few minutes to
              invite your team, choose roles and permissions, and set the basic
              guardrails for how incidents, fraud signals, and handovers work in
              acme-payments.
            </p>
          </div>
          <button
            type="button"
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
                        options={[
                          "Use my own message later",
                          "Standard Welcome",
                          "None",
                        ]}
                      />
                    )}
                  />
                </div>
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
                      options={[
                        "Viewer - Safest Default",
                        "Responder",
                        "Commander",
                      ]}
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
                  <RoleCard key={r.name} title={r.name} desc={r.desc} />
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
                    className="w-full bg-[#0A1635] border border-[#4B5563] rounded p-2 text-sm outline-none"
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
                      options={["UTC", "PST", "EST"]}
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
                      />
                    )}
                  />
                ))}
              </div>
              <div className=" space-y-3 py-3">
                <p className="text-base">
                  You can adjust and add more integrations later from
                  the Settings → Integrations page.
                </p>
                <p className="text-base">What happens next?</p>
                <p className="text-base">
                  Once you’ve invited your team and connected at least one
                  channel, configure On-call & Handover so Scrubbe can
                  automatically assemble shift summaries for you.{" "}
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="w-fit border-IMSCyan border text-IMSCyan py-3 px-3 text-base rounded-lg font-bold mt-8 hover:brightness-110"
                >
                  Complete Setup & Go to Handover
                </button>
              </div>
            </StepWrapper>
          </div>

          {/* RIGHT COLUMN: SIDEBAR (EXACT UI) */}
          <aside className="flex-1 space-y-6 ">
            <div className=" border border-zinc-400 p-6 rounded-lg sticky top-8 bg-[#08132F]">
              <h3 className="text-base font-bold text-white mb-1">
                Setup progress
              </h3>
              <p className="text-[10px] text-[#6B7280] mb-4">
                Complete these steps so Scrubbe reflects how your team really
                works.{" "}
              </p>
              <div className="w-full bg-white h-1 rounded-full mb-6 overflow-hidden">
                <div
                  className="bg-[#00CAD8] h-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="space-y-4">
                <SidebarStep
                  label="Invite your team"
                  subLabel="Admins, SREs, fraud & business teams"
                  active={progress.s1}
                />
                <SidebarStep
                  label="Set roles & permissions"
                  subLabel="Decide who can lead incidents & export data"
                  active={progress.s2}
                />
                <SidebarStep
                  label="Tenant policies"
                  subLabel="Sign-in, exports & approvals"
                  active={progress.s3}
                />
                <SidebarStep
                  label="Connect integrations"
                  subLabel="Slack, email, CI/CD, fraud tools"
                  active={progress.s4}
                />
              </div>
            </div>

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
  <div
    className={`bg-gradient-to-b from-[#0074834D] to-[#004B571A] border rounded-xl transition-all border-IMSCyan/40 overflow-clip`}
  >
    <div className="p-4 border-b border-[#1F2937] flex justify-between items-center ">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          {title}
        </h2>
        <p className="text-neutral-300 text-sm">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onManualDone}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors"
      >
        <div
          className={`w-4 h-4 flex justify-center items-center rounded-sm border ${
            isDone ? "bg-[#00CAD8] border-[#00CAD8]" : "border-[#4B5563]"
          }`}
        >
          {isDone && <Check size={16} color="black" />}
        </div>
        <span className="text-[9px] font-bold text-white uppercase">
          Mark Step as done
        </span>
      </button>
    </div>
    <div className="px-4 py-4">{children}</div>
  </div>
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

const RoleCard = ({ title, desc }: any) => (
  <div
    className={`p-4 rounded-lg border cursor-pointer transition-all bg-[#111827] border-zinc-300 hover:border-[#4B5563]`}
  >
    <h4 className={`text-base font-bold mb-1 text-white`}>{title}</h4>
    <p className="text-sm text-zinc-300 leading-tight">{desc}</p>
  </div>
);

const CustomSelect = ({ label, value, options, onChange }: any) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2 relative">
      <label className="text-[11px] font-bold text-white uppercase">
        {label}
      </label>
      <div
        onClick={() => setOpen(!open)}
        className="bg-[#08132F] border border-zinc-500 rounded-md p-2.5 flex justify-between items-center cursor-pointer hover:border-[#4B5563]"
      >
        <span className="text-xs text-[#E5E7EB]">{value}</span>
        <ChevronDown size={14} className="text-[#4B5563]" />
      </div>
      {open && (
        <div className="absolute top-full w-full bg-[#08132F] border border-[#1F2937] z-50 rounded mt-1 shadow-2xl">
          {options.map((o: any) => (
            <div
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className="px-3 py-2 text-xs text-white hover:bg-[#00CAD8] hover:text-black cursor-pointer"
            >
              {o}
            </div>
          ))}
        </div>
      )}
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
}: {
  label: string;
  desc: string;
  active: any;
  onChange: (value: boolean) => void;
}) => (
  <div
    className={`p-4 rounded-lg border flex justify-between items-center cursor-pointer transition-all bg-[#111827] border-[#6D7280] `}
  >
    <div>
      <p className={`text-base font-bold text-white`}>{label}</p>
      <p className={`text-base text-white`}>{desc}</p>
    </div>
    <Switch value={active} onChange={() => onChange(!active)} color="success" />
  </div>
);

const SidebarStep = ({
  label,
  subLabel,
  active,
}: {
  label: string;
  subLabel: string;
  active: boolean;
}) => (
  <div className="flex items-center gap-3">
    <div
      className={`w-3.5 h-3.5 border rounded flex items-center justify-center ${
        active ? "bg-[#00CAD8] border-[#00CAD8]" : "border-[#1F2937]"
      }`}
    >
      {active && <Check size={10} color="black" strokeWidth={4} />}
    </div>
    <div>
      <p className={`text-base font-bold text-white`}>{label}</p>
      <p className="text-sm">{subLabel}</p>
    </div>
  </div>
);

export default ScrubbeOnboarding;
