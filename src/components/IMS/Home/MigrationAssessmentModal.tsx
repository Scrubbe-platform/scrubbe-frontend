"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = [
  "PagerDuty",
  "incident.io",
  "Rootly",
  "FireHydrant",
  "ServiceNow",
  "Other",
];

const INTEGRATIONS = [
  "Slack / Microsoft Teams",
  "Jira",
  "Datadog",
  "New Relic",
  "Prometheus / Grafana",
  "AWS",
  "Azure",
  "Google Cloud",
  "Kubernetes",
  "GitHub / GitLab",
];

const GOALS = [
  "Faster incident investigation",
  "Automated remediation",
  "Reduced MTTR",
  "Better visibility",
  "Cost optimization",
  "Scalability",
  "Compliance / Governance",
  "Other",
];

const INDUSTRIES = [
  "Fintech",
  "E-Commerce",
  "Saas",
  "Healthcare",
  "Gaming",
  "Enterprise",
  "Other",
];

const TIMELINES = [
  "Immediately",
  "Within 1 month",
  "1-3 months",
  "3-6 months",
  "6+ months",
  "Just exploring",
];

const SCOPES = [
  "Single team / service",
  "Multiple teams",
  "Entire organization",
  "Not sure yet",
];

type FormState = {
  companyName: string;
  industry: string;
  yourName: string;
  workEmail: string;
  jobTitle: string;
  teamDepartment: string;
  primaryPlatform: string;
  platformOther: string;
  integrations: string[];
  integrationsOther: string;
  goals: string[];
  additionalGoals: string;
  migrationTimeline: string;
  migrationScope: string;
  scopeDetails: string;
  currentChallenges: string;
  anythingElse: string;
};

const EMPTY_FORM: FormState = {
  companyName: "",
  industry: "",
  yourName: "",
  workEmail: "",
  jobTitle: "",
  teamDepartment: "",
  primaryPlatform: "",
  platformOther: "",
  integrations: [],
  integrationsOther: "",
  goals: [],
  additionalGoals: "",
  migrationTimeline: "",
  migrationScope: "",
  scopeDetails: "",
  currentChallenges: "",
  anythingElse: "",
};

const ALL_SECTIONS_OPEN: Record<number, boolean> = {
  1: true,
  2: true,
  3: true,
  4: true,
  5: true,
  6: true,
};

const REQUIRED_FIELDS: (keyof FormState)[] = [
  "companyName",
  "industry",
  "yourName",
  "workEmail",
  "jobTitle",
  "primaryPlatform",
  "migrationTimeline",
  "migrationScope",
];

// Which collapsible section each field lives in — used to auto-expand a
// section when it contains a missing required field on submit.
const FIELD_SECTION: Partial<Record<keyof FormState, number>> = {
  companyName: 1,
  industry: 1,
  yourName: 1,
  workEmail: 1,
  jobTitle: 1,
  primaryPlatform: 2,
  migrationTimeline: 5,
  migrationScope: 5,
};

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13.5px] text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all bg-white";
const labelCls = "text-[13px] font-semibold text-gray-800 block mb-1.5";
const errorInputCls = "border-red-400 focus:ring-red-300";

function CheckboxPill({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
      />
      {label}
    </label>
  );
}

function CollapsibleSection({
  index,
  title,
  open,
  onToggle,
  children,
  divider = true,
}: {
  index: number;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div className={divider ? "pt-6 border-t border-gray-100" : undefined}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between bg-transparent border-none cursor-pointer p-0 mb-4"
      >
        <p className="text-[14px] font-bold text-IMSLightGreen">
          {index}. {title}
        </p>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MigrationAssessmentModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] =
    useState<Record<number, boolean>>(ALL_SECTIONS_OPEN);

  const toggleSection = (n: number) =>
    setOpenSections((s) => ({ ...s, [n]: !s[n] }));

  const set =
    (k: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleIn = (k: "integrations" | "goals", value: string) => {
    setForm((f) => {
      const list = f[k];
      return {
        ...f,
        [k]: list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = new Set(
      REQUIRED_FIELDS.filter((k) => !form[k].toString().trim()),
    );
    if (missing.size > 0) {
      setErrors(missing);
      const sectionsToOpen = Array.from(missing)
        .map((k) => FIELD_SECTION[k as keyof FormState])
        .filter((n): n is number => n !== undefined);
      if (sectionsToOpen.length) {
        setOpenSections((s) => {
          const next = { ...s };
          sectionsToOpen.forEach((n) => (next[n] = true));
          return next;
        });
      }
      toast.error("Please fill in all required fields.");
      return;
    }
    setErrors(new Set());
    toast.success(
      "Migration assessment submitted — we'll be in touch shortly.",
    );
    setForm(EMPTY_FORM);
    setOpenSections(ALL_SECTIONS_OPEN);
    onClose();
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setOpenSections(ALL_SECTIONS_OPEN);
    setErrors(new Set());
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={handleCancel}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-7 py-5 flex items-start justify-between z-10">
                <div>
                  <h2 className="text-[24px] font-bold text-black">
                    Migration Assessment
                  </h2>
                  <p className="text-[13px] text-gray-500 mt-1 max-w-md">
                    Help us understand your current environment and migration
                    goals so we can recommend the best path to Scrubbe.
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  aria-label="Close"
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 border-none cursor-pointer hover:bg-gray-200 transition-colors shrink-0"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-7 py-6 space-y-7">
                {/* 1. Organization Details */}
                <CollapsibleSection
                  index={1}
                  title="Organization Details"
                  open={openSections[1]}
                  onToggle={() => toggleSection(1)}
                  divider={false}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={`${inputCls} ${errors.has("companyName") ? errorInputCls : ""}`}
                        value={form.companyName}
                        onChange={set("companyName")}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Industry <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={`${inputCls} ${errors.has("industry") ? errorInputCls : ""} ${!form.industry ? "text-gray-400" : "text-black"}`}
                        value={form.industry}
                        onChange={set("industry")}
                      >
                        <option value="">Select...</option>
                        {INDUSTRIES.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={`${inputCls} ${errors.has("yourName") ? errorInputCls : ""}`}
                        value={form.yourName}
                        onChange={set("yourName")}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Work Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        className={`${inputCls} ${errors.has("workEmail") ? errorInputCls : ""}`}
                        value={form.workEmail}
                        onChange={set("workEmail")}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Job Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={`${inputCls} ${errors.has("jobTitle") ? errorInputCls : ""}`}
                        value={form.jobTitle}
                        onChange={set("jobTitle")}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Team / Department</label>
                      <input
                        className={inputCls}
                        value={form.teamDepartment}
                        onChange={set("teamDepartment")}
                      />
                    </div>
                  </div>
                </CollapsibleSection>

                {/* 2. Current Incident Management Platform */}
                <CollapsibleSection
                  index={2}
                  title="Current Incident Management Platform"
                  open={openSections[2]}
                  onToggle={() => toggleSection(2)}
                >
                  <label className={labelCls}>
                    Primary Platform <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3">
                    {PLATFORMS.map((p) => (
                      <CheckboxPill
                        key={p}
                        label={p}
                        checked={form.primaryPlatform === p}
                        onChange={() =>
                          setForm((f) => ({ ...f, primaryPlatform: p }))
                        }
                      />
                    ))}
                  </div>
                  {errors.has("primaryPlatform") && (
                    <p className="text-[12px] text-red-500 mb-2">
                      Please select a platform.
                    </p>
                  )}
                  {form.primaryPlatform === "Other" && (
                    <div>
                      <label className={labelCls}>Other (please specify)</label>
                      <input
                        className={inputCls}
                        value={form.platformOther}
                        onChange={set("platformOther")}
                      />
                    </div>
                  )}
                </CollapsibleSection>

                {/* 3. Environment & Integrations */}
                <CollapsibleSection
                  index={3}
                  title="Environment & Integrations"
                  open={openSections[3]}
                  onToggle={() => toggleSection(3)}
                >
                  <label className={labelCls}>
                    Please select the tools you currently use{" "}
                    <span className="text-gray-400 font-normal">
                      (select all that apply)
                    </span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mb-3">
                    {INTEGRATIONS.map((i) => (
                      <CheckboxPill
                        key={i}
                        label={i}
                        checked={form.integrations.includes(i)}
                        onChange={() => toggleIn("integrations", i)}
                      />
                    ))}
                  </div>
                  <label className={labelCls}>Other (please specify)</label>
                  <input
                    className={inputCls}
                    value={form.integrationsOther}
                    onChange={set("integrationsOther")}
                  />
                </CollapsibleSection>

                {/* 4. Migration Goals */}
                <CollapsibleSection
                  index={4}
                  title="Migration Goals"
                  open={openSections[4]}
                  onToggle={() => toggleSection(4)}
                >
                  <label className={labelCls}>
                    What are your primary goals for migrating to Scrubbe?{" "}
                    <span className="text-gray-400 font-normal">
                      (select all that apply)
                    </span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 mb-3">
                    {GOALS.map((g) => (
                      <CheckboxPill
                        key={g}
                        label={g}
                        checked={form.goals.includes(g)}
                        onChange={() => toggleIn("goals", g)}
                      />
                    ))}
                  </div>
                  <label className={labelCls}>
                    Additional goals or requirements
                  </label>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={2}
                    value={form.additionalGoals}
                    onChange={set("additionalGoals")}
                  />
                </CollapsibleSection>

                {/* 5. Migration Scope & Timeline */}
                <CollapsibleSection
                  index={5}
                  title="Migration Scope & Timeline"
                  open={openSections[5]}
                  onToggle={() => toggleSection(5)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>
                        Planned Migration Timeline{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={`${inputCls} ${errors.has("migrationTimeline") ? errorInputCls : ""} ${!form.migrationTimeline ? "text-gray-400" : "text-black"}`}
                        value={form.migrationTimeline}
                        onChange={set("migrationTimeline")}
                      >
                        <option value="">Select...</option>
                        {TIMELINES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>
                        Migration Scope <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={`${inputCls} ${errors.has("migrationScope") ? errorInputCls : ""} ${!form.migrationScope ? "text-gray-400" : "text-black"}`}
                        value={form.migrationScope}
                        onChange={set("migrationScope")}
                      >
                        <option value="">Select...</option>
                        {SCOPES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <label className={labelCls}>
                    Any specific services, teams, or environments in scope?
                  </label>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={2}
                    value={form.scopeDetails}
                    onChange={set("scopeDetails")}
                  />
                </CollapsibleSection>

                {/* 6. Additional Information */}
                <CollapsibleSection
                  index={6}
                  title="Additional Information"
                  open={openSections[6]}
                  onToggle={() => toggleSection(6)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Current Challenges</label>
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={3}
                        value={form.currentChallenges}
                        onChange={set("currentChallenges")}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Anything else we should know?
                      </label>
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={3}
                        value={form.anythingElse}
                        onChange={set("anythingElse")}
                      />
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-lg text-[13.5px] font-semibold text-gray-700 bg-white border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg text-[13.5px] font-semibold text-white bg-IMSLightGreen border-none cursor-pointer hover:brightness-110 transition-all"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
