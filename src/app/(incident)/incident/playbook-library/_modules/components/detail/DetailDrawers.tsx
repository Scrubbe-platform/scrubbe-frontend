import React from "react";
import SideModal from "@/components/ui/SideModal";
import { modById } from "../../data";
import { AgentDef, Playbook, RuleDef, StepDef } from "../../types";

/* ---------- execution-flow step drawer ---------- */

interface StepDrawerProps {
  step: StepDef | null;
  playbook: Playbook | null;
  onClose: () => void;
  onOpenModule: (id: string) => void;
}

export function StepDrawer({ step, playbook, onClose, onOpenModule }: StepDrawerProps): React.JSX.Element {
  const m = step?.mod ? modById(step.mod) : null;
  return (
    <SideModal
      isOpen={!!step}
      onClose={onClose}
      title={step ? `${String(step.n).padStart(2, "0")} · ${step.name}` : ""}
      subTitle={
        step?.kind === "gate"
          ? "Governance gate — execution pauses here"
          : step?.kind === "terminal"
            ? "Terminal step"
            : "Execution step"
      }
    >
      {step && playbook && (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm mb-2">What happens</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Details</h4>
            <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 text-sm dark:border-zinc-800 dark:divide-zinc-800">
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-36 shrink-0 dark:text-zinc-500">Performed by</span>
                <span className="font-medium">{step.agent}</span>
              </div>
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-36 shrink-0 dark:text-zinc-500">Backed by module</span>
                <span className="font-medium">{m ? `${m.name} · v${m.ver}` : "Platform pipeline"}</span>
              </div>
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-36 shrink-0 dark:text-zinc-500">Audit</span>
                <span className="font-medium">Append-only entry on completion</span>
              </div>
            </div>
          </div>
          {step.kind === "gate" && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Gate policy</h4>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {step.n === 7
                  ? `All ${playbook.rules.length} linked operational rules are evaluated. A failing rule pauses or blocks execution and records the reason in the audit trail.`
                  : `Approvers: ${playbook.approvers.join(" and ")}. Average approval time ${playbook.approvalTime}. Nothing executes in production without this gate.`}
              </p>
            </div>
          )}
          {m && (
            <button
              onClick={() => onOpenModule(m.id)}
              className="w-full border border-zinc-300 rounded-lg py-2.5 text-sm font-semibold hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Open {m.name}
            </button>
          )}
        </div>
      )}
    </SideModal>
  );
}

/* ---------- AI agent drawer ---------- */

export function AgentDrawer({
  agent,
  onClose,
}: {
  agent: AgentDef | null;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <SideModal
      isOpen={!!agent}
      onClose={onClose}
      title={agent?.name ?? ""}
      subTitle="Specialist agent · governed pipeline"
    >
      {agent && (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm mb-2">Purpose</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{agent.purpose}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Current profile</h4>
            <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 text-sm dark:border-zinc-800 dark:divide-zinc-800">
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-36 shrink-0 dark:text-zinc-500">Status</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {agent.status}
                </span>
              </div>
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-36 shrink-0 dark:text-zinc-500">Average runtime</span>
                <span className="font-mono font-medium">{agent.runtime}</span>
              </div>
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-36 shrink-0 dark:text-zinc-500">Confidence</span>
                <span className="font-mono font-medium">{agent.conf}</span>
              </div>
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-36 shrink-0 dark:text-zinc-500">Attribution</span>
                <span className="font-medium">Every finding attributed in audit</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </SideModal>
  );
}

/* ---------- operational rule drawer ---------- */

export function RuleDrawer({
  rule,
  onClose,
}: {
  rule: RuleDef | null;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <SideModal
      isOpen={!!rule}
      onClose={onClose}
      title={rule?.name ?? ""}
      subTitle={rule ? `${rule.id} · Operational rule` : ""}
    >
      {rule && (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm mb-2">What it does</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{rule.detail}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Details</h4>
            <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 text-sm dark:border-zinc-800 dark:divide-zinc-800">
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-32 shrink-0 dark:text-zinc-500">Status</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {rule.status}
                </span>
              </div>
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-32 shrink-0 dark:text-zinc-500">Purpose</span>
                <span className="font-medium">{rule.purpose}</span>
              </div>
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-32 shrink-0 dark:text-zinc-500">Layer</span>
                <span className="font-medium">Governance — evaluated before execution</span>
              </div>
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-32 shrink-0 dark:text-zinc-500">Binding</span>
                <span className="font-medium">Overrides playbook permissions</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </SideModal>
  );
}
