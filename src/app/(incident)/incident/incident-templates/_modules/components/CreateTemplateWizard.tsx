"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Select from "@/components/ui/select";
import { CheckList, MiniStat } from "./DetailPrimitives";
import { CATEGORIES, TemplateRecord } from "./incidentTemplates.data";

const STEPS = [
  "Basic Info", "Triggers", "Agent", "Signal Priority", "Objectives",
  "Playbooks", "Rules and policy", "Verification", "Review & Publish",
];

const WIZARD_TRIGGERS = ["Signal Graph trigger", "Error rate spike", "Health checks failed", "Manual trigger", "Webhook trigger", "API trigger"];
const WIZARD_TRIGGER_DEFAULTS = new Set(["Signal Graph trigger", "Error rate spike", "Health checks failed"]);

const WIZARD_AGENTS = ["Logs Agent", "Signal Graph Agent", "Root Cause Agent", "Kubernetes Agent", "Infrastructure Agent", "Verification Agent"];
const WIZARD_AGENT_DEFAULTS = new Set(["Logs Agent", "Signal Graph Agent", "Root Cause Agent"]);

const WIZARD_OBJECTIVES = ["Identify root cause", "Determine blast radius", "Correlate dependent services", "Recommend safest remediation"];
const WIZARD_OBJECTIVE_DEFAULTS = new Set(["Identify root cause", "Determine blast radius"]);

const WIZARD_PLAYBOOKS = ["Restart Service", "Rollback Deployment", "Scale ReplicaSet", "Notify Stakeholders"];
const WIZARD_PLAYBOOK_DEFAULTS = new Set(["Restart Service", "Rollback Deployment"]);

const WIZARD_RULES = ["Human approval required", "Maintenance window required", "Allow infrastructure deletion", "Allow database schema changes"];
const WIZARD_RULE_DEFAULTS = new Set(["Human approval required", "Maintenance window required"]);

const WIZARD_VERIFICATION = ["Error rate normalized", "Synthetic tests passed", "Traffic stable", "Root cause documented"];
const WIZARD_VERIFICATION_DEFAULTS = new Set(["Error rate normalized", "Synthetic tests passed"]);

function toMap(items: string[], defaults: Set<string>): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  items.forEach((i) => {
    out[i] = defaults.has(i);
  });
  return out;
}

export default function CreateTemplateWizard({
  templates,
  editing,
  onCancel,
  onSubmit,
}: {
  templates: TemplateRecord[];
  editing?: TemplateRecord | null;
  onCancel: () => void;
  onSubmit: (record: TemplateRecord) => void;
}) {
  const [step, setStep] = useState(1);

  const [name, setName] = useState(editing?.name ?? "");
  const [category, setCategory] = useState(editing?.cat ?? CATEGORIES[1]?.name ?? "Deployment");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [version, setVersion] = useState("1.0");
  const [status, setStatus] = useState<string>(editing?.status ?? "Draft");
  const [environment, setEnvironment] = useState("Sandbox");

  const [triggers, setTriggers] = useState(() => toMap(WIZARD_TRIGGERS, WIZARD_TRIGGER_DEFAULTS));
  const [agents, setAgents] = useState(() => toMap(WIZARD_AGENTS, WIZARD_AGENT_DEFAULTS));
  const [executionOrder, setExecutionOrder] = useState("Parallel");
  const [priority, setPriority] = useState("Critical");

  const [signalPriority, setSignalPriority] = useState([
    "Deployment Metadata", "Application Logs", "Metrics", "Alerts",
  ]);

  const [objectives, setObjectives] = useState(() => toMap(WIZARD_OBJECTIVES, WIZARD_OBJECTIVE_DEFAULTS));

  const [playbooks, setPlaybooks] = useState(() => toMap(WIZARD_PLAYBOOKS, WIZARD_PLAYBOOK_DEFAULTS));
  const [fallbackPlaybook, setFallbackPlaybook] = useState("Notify Stakeholders");

  const [maxActions, setMaxActions] = useState("3");
  const [approvalLevel, setApprovalLevel] = useState("Engineering Manager");
  const [rules, setRules] = useState(() => toMap(WIZARD_RULES, WIZARD_RULE_DEFAULTS));

  const [verification, setVerification] = useState(() => toMap(WIZARD_VERIFICATION, WIZARD_VERIFICATION_DEFAULTS));

  const [validated, setValidated] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simDone, setSimDone] = useState(false);

  function toggle(setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, key: string) {
    setter((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function moveSignal(from: number, to: number) {
    if (to < 0 || to >= signalPriority.length) return;
    setSignalPriority((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }

  function validate() {
    setValidated(true);
    toast.warning("Configuration validated — 0 errors, 2 warnings");
  }

  function runSimulation() {
    setSimDone(false);
    setSimRunning(true);
    setSimProgress(0);
    requestAnimationFrame(() => setSimProgress(100));
    setTimeout(() => {
      setSimRunning(false);
      setSimDone(true);
    }, 1300);
  }

  function publish() {
    const finalName = name.trim() || "Untitled Template";
    const conflict = templates.some((t) => t.name === finalName && t.name !== editing?.name);
    if (conflict) {
      toast.error(`A template named "${finalName}" already exists`);
      return;
    }
    const record: TemplateRecord = {
      name: finalName,
      cat: category,
      agents: Object.values(agents).filter(Boolean).length || 1,
      playbooks: Object.values(playbooks).filter(Boolean).length || 1,
      rules: Object.values(rules).filter(Boolean).length + Object.values(verification).filter(Boolean).length,
      usage: editing?.usage ?? 0,
      status: status === "Active" ? "Active" : "Draft",
      updated: "just now",
    };
    onSubmit(record);
    toast.success(
      editing ? `Saved changes to "${finalName}"` : `"${finalName}" published to ${environment}`,
    );
  }

  function handleNext() {
    if (step < STEPS.length) {
      setStep((s) => s + 1);
      return;
    }
    publish();
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6">
      <div className="mb-2 flex items-center gap-1.5 text-[12.5px] text-black/40 dark:text-zinc-500">
        <button onClick={onCancel} className="hover:text-black dark:hover:text-zinc-200">
          Overview
        </button>
        <ChevronRight size={13} />
        <span className="font-semibold text-black dark:text-zinc-200">
          {editing ? "Edit Template" : "Create Template"}
        </span>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm shadow-light dark:bg-zinc-900/60 sm:p-7">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-black dark:text-zinc-100">
              {editing ? `Edit ${editing.name}` : "Create Incident Template"}
            </h1>
            <p className="mt-1 text-[13.5px] text-black/60 dark:text-zinc-400">
              {editing
                ? "Update how Scrubbe should detect, investigate, and remediate this incident type."
                : "Define how Scrubbe should detect, investigate, and remediate the next recurring incident type."}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-[13px] font-semibold text-black/50 hover:text-black dark:text-zinc-500 dark:hover:text-zinc-200"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const active = n === step;
              const done = n < step;
              return (
                <li key={label}>
                  <button
                    onClick={() => setStep(n)}
                    className={cn(
                      "flex w-full shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-left text-[13px] font-medium",
                      active
                        ? "bg-zinc-100 font-semibold text-black dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-black/45 hover:bg-zinc-50 dark:text-zinc-500 dark:hover:bg-zinc-800/50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold",
                        active
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : done
                            ? "bg-emerald-600 text-white"
                            : "border border-zinc-300 text-black/40 dark:border-zinc-600 dark:text-zinc-500",
                      )}
                    >
                      {done && !active ? <Check size={11} /> : n}
                    </span>
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-700 sm:p-6">
            {step === 1 && (
              <div>
                <h2 className="mb-5 text-[16px] font-bold text-black dark:text-zinc-100">
                  1 · Basic Information
                </h2>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                  <Field label="Template Name">
                    <TextInput value={name} onChange={setName} placeholder="e.g. Canary Rollout Failure" />
                  </Field>
                  <Field label="Category">
                    <Select
                      value={category}
                      onChange={(e) => setCategory(String(e.target.value))}
                      options={CATEGORIES.map((c) => ({ value: c.name, label: c.name }))}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Description">
                      <TextArea
                        value={description}
                        onChange={setDescription}
                        placeholder="What does this template investigate?"
                      />
                    </Field>
                  </div>
                  <Field label="Owner">
                    <TextInput value={owner} onChange={setOwner} placeholder="Team name" />
                  </Field>
                  <Field label="Version">
                    <TextInput value={version} onChange={setVersion} />
                  </Field>
                  <Field label="Status">
                    <Select
                      value={status}
                      onChange={(e) => setStatus(String(e.target.value))}
                      options={[
                        { value: "Draft", label: "Draft" },
                        { value: "Active", label: "Active" },
                      ]}
                    />
                  </Field>
                  <Field label="Environment">
                    <Select
                      value={environment}
                      onChange={(e) => setEnvironment(String(e.target.value))}
                      options={[
                        { value: "Sandbox", label: "Sandbox" },
                        { value: "Staging", label: "Staging" },
                        { value: "Production", label: "Production" },
                      ]}
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="mb-5 text-[16px] font-bold text-black dark:text-zinc-100">
                  2 · Trigger Conditions
                </h2>
                <CheckboxGrid items={WIZARD_TRIGGERS} values={triggers} onToggle={(k) => toggle(setTriggers, k)} />
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="mb-5 text-[16px] font-bold text-black dark:text-zinc-100">
                  3 · Agent Selection
                </h2>
                <CheckboxGrid items={WIZARD_AGENTS} values={agents} onToggle={(k) => toggle(setAgents, k)} />
                <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                  <Field label="Execution order">
                    <Select
                      value={executionOrder}
                      onChange={(e) => setExecutionOrder(String(e.target.value))}
                      options={[
                        { value: "Parallel", label: "Parallel" },
                        { value: "Sequential", label: "Sequential" },
                      ]}
                    />
                  </Field>
                  <Field label="Priority">
                    <Select
                      value={priority}
                      onChange={(e) => setPriority(String(e.target.value))}
                      options={[
                        { value: "Critical", label: "Critical" },
                        { value: "High", label: "High" },
                        { value: "Normal", label: "Normal" },
                      ]}
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="mb-2 text-[16px] font-bold text-black dark:text-zinc-100">
                  4 · Signal Prioritization
                </h2>
                <p className="mb-4 text-[13px] text-black/60 dark:text-zinc-400">
                  Reorder telemetry sources by investigative weight (top = highest priority).
                </p>
                <RankReorderList items={signalPriority} onMove={moveSignal} />
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="mb-5 text-[16px] font-bold text-black dark:text-zinc-100">
                  5 · Investigation Objectives
                </h2>
                <CheckboxGrid
                  items={WIZARD_OBJECTIVES}
                  values={objectives}
                  onToggle={(k) => toggle(setObjectives, k)}
                />
              </div>
            )}

            {step === 6 && (
              <div>
                <h2 className="mb-5 text-[16px] font-bold text-black dark:text-zinc-100">
                  6 · Playbooks
                </h2>
                <CheckboxGrid items={WIZARD_PLAYBOOKS} values={playbooks} onToggle={(k) => toggle(setPlaybooks, k)} />
                <div className="mt-5 max-w-xs">
                  <Field label="Fallback playbook">
                    <Select
                      value={fallbackPlaybook}
                      onChange={(e) => setFallbackPlaybook(String(e.target.value))}
                      options={[
                        { value: "Notify Stakeholders", label: "Notify Stakeholders" },
                        { value: "Pause Rollout", label: "Pause Rollout" },
                      ]}
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 7 && (
              <div>
                <h2 className="mb-5 text-[16px] font-bold text-black dark:text-zinc-100">
                  7 · Operational Rules &amp; Policies
                </h2>
                <div className="mb-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                  <Field label="Maximum autonomous actions">
                    <TextInput value={maxActions} onChange={setMaxActions} />
                  </Field>
                  <Field label="Approval level">
                    <Select
                      value={approvalLevel}
                      onChange={(e) => setApprovalLevel(String(e.target.value))}
                      options={[
                        { value: "Engineering Manager", label: "Engineering Manager" },
                        { value: "Team Lead", label: "Team Lead" },
                        { value: "None", label: "None" },
                      ]}
                    />
                  </Field>
                </div>
                <CheckboxGrid items={WIZARD_RULES} values={rules} onToggle={(k) => toggle(setRules, k)} />
              </div>
            )}

            {step === 8 && (
              <div>
                <h2 className="mb-5 text-[16px] font-bold text-black dark:text-zinc-100">
                  8 · Verification &amp; Closure
                </h2>
                <CheckboxGrid
                  items={WIZARD_VERIFICATION}
                  values={verification}
                  onToggle={(k) => toggle(setVerification, k)}
                />
              </div>
            )}

            {step === 9 && (
              <div>
                <h2 className="mb-2 text-[16px] font-bold text-black dark:text-zinc-100">
                  9 · Review &amp; Publish
                </h2>
                <p className="mb-4 text-[13px] text-black/60 dark:text-zinc-400">
                  Run a simulation against a historical incident before this template
                  goes live.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={validate}
                    className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    Validate Configuration
                  </button>
                  <button
                    onClick={runSimulation}
                    className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    Run Simulation
                  </button>
                </div>

                {validated && (
                  <div className="mt-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900/40">
                    <strong className="text-[13px] text-black dark:text-zinc-100">
                      Validation results
                    </strong>
                    <div className="mt-3">
                      <CheckList
                        items={[
                          "Trigger conditions resolve to at least one signal source",
                          "Selected agents are reachable",
                          "Policy engine approval chain is valid",
                        ]}
                      />
                    </div>
                    <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-[12px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                      ⚠ 2 warnings — no fallback playbook set for step 6, verification
                      list has only 2 of 8 recommended checks enabled.
                    </div>
                  </div>
                )}

                {simRunning && (
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-[1300ms] ease-out"
                      style={{ width: `${simProgress}%` }}
                    />
                  </div>
                )}

                {simDone && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <MiniStat label="Automation Score" value="88" tone="yes" />
                    <MiniStat label="Policy Violations" value="0" tone="yes" />
                    <MiniStat label="Est. MTTR" value="5m 10s" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            ← Back
          </button>
          <span className="text-[12.5px] text-black/40 dark:text-zinc-500">
            Step {step} of {STEPS.length}
          </span>
          <button
            onClick={handleNext}
            className="rounded-md bg-zinc-900 px-5 py-2 text-[13px] font-semibold text-white hover:bg-black dark:bg-zinc-100 dark:text-zinc-900"
          >
            {step === STEPS.length ? (editing ? "Save Changes" : "Publish Template →") : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-black/55 dark:text-zinc-400">
        {label}
      </div>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-[42px] w-full rounded-md border border-zinc-200 px-3.5 text-[13.5px] text-black placeholder:text-black/35 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      className="w-full resize-y rounded-md border border-zinc-200 px-3.5 py-3 text-[13.5px] text-black placeholder:text-black/35 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
    />
  );
}

function CheckboxGrid({
  items,
  values,
  onToggle,
}: {
  items: string[];
  values: Record<string, boolean>;
  onToggle: (item: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {items.map((item) => (
        <label
          key={item}
          className="flex items-center gap-2.5 rounded-md border border-zinc-200 px-3.5 py-2.5 text-[13px] text-black dark:border-zinc-700 dark:text-zinc-200"
        >
          <input
            type="checkbox"
            checked={values[item] ?? false}
            onChange={() => onToggle(item)}
            className="h-4 w-4 accent-emerald-600"
          />
          {item}
        </label>
      ))}
    </div>
  );
}

function RankReorderList({
  items,
  onMove,
}: {
  items: string[];
  onMove: (from: number, to: number) => void;
}) {
  return (
    <ol className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {items.map((s, i) => (
        <li key={s} className="flex items-center gap-3 py-2.5 text-[13px] text-black dark:text-zinc-200">
          <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-zinc-100 font-mono text-[11px] font-bold text-black/50 dark:bg-zinc-800 dark:text-zinc-400">
            {i + 1}
          </span>
          <span className="flex-1">{s}</span>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => onMove(i, i - 1)}
              className="rounded p-1 text-black/40 hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-500 dark:hover:bg-zinc-800"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              disabled={i === items.length - 1}
              onClick={() => onMove(i, i + 1)}
              className="rounded p-1 text-black/40 hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-500 dark:hover:bg-zinc-800"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}
