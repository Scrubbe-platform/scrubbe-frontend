"use client";

import React from "react";
import { FormProps, patch } from "./formTypes";
import {
  Collection, Explain, Notice, NumberField, RangeField, SelectField, Section, TagList, ToggleRow,
} from "./SettingsPrimitives";

export function AgentsForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Section title={`Registered agents (${d.list.length})`}>
        <Collection
          columns={[
            { key: "name", label: "Agent", type: "text", placeholder: "e.g. Diagnostician", width: "minmax(0,1.3fr)" },
            { key: "role", label: "Specialty", type: "select", options: ["Diagnostics", "Remediation", "Comms", "Forensics", "Custom"] },
            { key: "tier", label: "Autonomy", type: "select", options: ["Suggest", "Assisted", "Autonomous"] },
            { key: "on", label: "On", type: "toggle", width: "48px" },
          ]}
          rows={d.list} addLabel="Register agent"
          newRow={() => ({ name: "", role: "Diagnostics", tier: "Suggest", on: true })}
          onChange={(v) => patch(setDraft, { list: v })}
        />
      </Section>
      <Section title="Guardrails">
        <ToggleRow title="Require approval before remediation" desc="Agents may diagnose freely, but any fix waits for a human to approve it." checked={d.requireApprovalRemediation} onChange={(v) => patch(setDraft, { requireApprovalRemediation: v })} />
        <ToggleRow title="Block destructive actions" desc="Deletes, data drops and irreversible changes are never run automatically." checked={d.blockDestructive} onChange={(v) => patch(setDraft, { blockDestructive: v })} />
        <ToggleRow title="Sandbox mode" desc="Agents propose and simulate outcomes without touching live systems." checked={d.sandbox} onChange={(v) => patch(setDraft, { sandbox: v })} last />
        <div className="mt-3">
          <NumberField label="Max concurrent agents per incident" min={1} max={12} value={d.maxConcurrent} onChange={(v) => patch(setDraft, { maxConcurrent: v })} />
        </div>
      </Section>
      <Section title="Allowed action scopes">
        <TagList items={d.scopes} onChange={(v) => patch(setDraft, { scopes: v })} placeholder="Add an action scope…" />
      </Section>
      <Notice tone="lock">Autonomy is always capped by the ceiling in Operational rules &amp; policies. A guardrail here can only tighten it, never loosen it.</Notice>
    </>
  );
}

export function AiForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Section title="Ezra">
        <ToggleRow title="Ezra assistant" desc="Ezra joins incidents as a first-class participant — summarizing, proposing actions, and answering questions." checked={d.ezra} onChange={(v) => patch(setDraft, { ezra: v })} />
        <ToggleRow title="Auto-triage new incidents" desc="Ezra suggests a severity and owner the moment an incident is raised." checked={d.autoTriage} onChange={(v) => patch(setDraft, { autoTriage: v })} last />
      </Section>
      <Section title="Behavior">
        <SelectField label="Default automation stage" help="Capped by the ceiling set in Operational Policies." value={d.defaultStage} onChange={(v) => patch(setDraft, { defaultStage: v })} options={["Manual", "Suggest", "Assisted", "Autonomous"]} />
        <RangeField label="Confidence threshold" help="Ezra only proposes an action when it's at least this confident." value={d.confidence} onChange={(v) => patch(setDraft, { confidence: v })} />
      </Section>
    </>
  );
}

export function PlaybooksForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Section title={`Playbooks (${d.list.length})`}>
        <Collection
          columns={[
            { key: "name", label: "Playbook", type: "text", placeholder: "e.g. P0 war room", width: "minmax(0,1.4fr)" },
            { key: "trigger", label: "Trigger", type: "text", placeholder: "when it runs", width: "minmax(0,1.3fr)" },
            { key: "tier", label: "Autonomy", type: "select", options: ["Suggest", "Assisted", "Autonomous"] },
            { key: "on", label: "On", type: "toggle", width: "48px" },
          ]}
          rows={d.list} addLabel="Add playbook"
          newRow={() => ({ name: "", trigger: "", tier: "Suggest", on: true })}
          onChange={(v) => patch(setDraft, { list: v })}
        />
      </Section>
      <Section title="Default">
        <SelectField label="Playbook for uncategorized incidents" value={d.defaultPlaybook} onChange={(v) => patch(setDraft, { defaultPlaybook: v })} options={d.list.map((p: any) => p.name)} />
      </Section>
      <Notice tone="info">Playbooks give agents an ordered set of steps to follow. Disabled playbooks are kept but never run.</Notice>
    </>
  );
}

export function AiModelsForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Explain>Which models power Ezra and the agents, and the guardrails around what they&apos;re allowed to conclude. Capped, as always, by the Operational-rules ceiling.</Explain>
      <Section title="Model selection">
        <Collection
          columns={[
            { key: "name", label: "Provider", type: "select", options: ["Anthropic", "OpenAI", "Google", "Azure OpenAI", "Self-hosted"] },
            { key: "model", label: "Model", type: "text", placeholder: "model name", width: "minmax(0,1.3fr)" },
            { key: "role", label: "Role", type: "select", options: ["Primary", "Fallback", "Disabled"] },
            { key: "on", label: "On", type: "toggle", width: "48px" },
          ]}
          rows={d.providers} addLabel="Add model"
          newRow={() => ({ name: "Anthropic", model: "", role: "Fallback", on: false })}
          onChange={(v) => patch(setDraft, { providers: v })}
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <SelectField label="Primary model" value={d.primary} onChange={(v) => patch(setDraft, { primary: v })} options={d.providers.map((p: any) => p.model)} />
          <SelectField label="Fallback model" value={d.fallback} onChange={(v) => patch(setDraft, { fallback: v })} options={d.providers.map((p: any) => p.model)} />
        </div>
      </Section>
      <Section title="Reasoning & scope">
        <SelectField label="Reasoning depth" help="Deeper reasoning is more thorough but slower and costlier." value={d.reasoningDepth} onChange={(v) => patch(setDraft, { reasoningDepth: v })} options={["Fast", "Balanced", "Deep"]} />
        <SelectField label="Maximum execution scope" help="The most an AI action may do. Never exceeds the Operational-rules ceiling." value={d.maxExecutionScope} onChange={(v) => patch(setDraft, { maxExecutionScope: v })} options={["Read-only", "Suggest", "Assisted", "Autonomous"]} />
        <RangeField label="Confidence floor" help="Models stay silent unless at least this confident." value={d.confidenceFloor} onChange={(v) => patch(setDraft, { confidenceFloor: v })} />
      </Section>
      <Section title="Safety">
        <ToggleRow title="Hallucination protection" desc="Cross-check model claims against real signals before acting on them." checked={d.hallucinationGuard} onChange={(v) => patch(setDraft, { hallucinationGuard: v })} />
        <ToggleRow title="Require cited evidence" desc="Every conclusion must point to the logs, metrics or events behind it." checked={d.citeEvidence} onChange={(v) => patch(setDraft, { citeEvidence: v })} />
        <ToggleRow title="Learn from resolved incidents" desc="Let models improve suggestions using your resolved incidents. Off keeps your data out of any tuning." checked={d.learningOn} onChange={(v) => patch(setDraft, { learningOn: v })} last />
      </Section>
    </>
  );
}

export function CausalForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Explain>Tunes how Scrubbe reconstructs <b>what caused what</b> — how far back it correlates signals, how deep it traces dependencies, and how much evidence it keeps.</Explain>
      <Section title="Correlation">
        <NumberField label="Correlation window" unit="minutes" min={1} max={120} value={d.correlationWindow} onChange={(v) => patch(setDraft, { correlationWindow: v })} help="Signals within this window of each other may be linked to the same root cause." />
        <NumberField label="Maximum signal depth" min={1} max={20} value={d.maxSignalDepth} onChange={(v) => patch(setDraft, { maxSignalDepth: v })} help="How many hops through dependencies to follow when tracing a cause." />
        <SelectField label="Dependency weighting" help="How strongly upstream dependencies count toward the likely cause." value={d.dependencyWeighting} onChange={(v) => patch(setDraft, { dependencyWeighting: v })} options={["Low", "Medium", "High"]} />
      </Section>
      <Section title="Confidence & noise">
        <NumberField label="Confidence threshold" unit="%" min={0} max={100} value={d.confidenceThreshold} onChange={(v) => patch(setDraft, { confidenceThreshold: v })} help="A cause is only surfaced above this confidence." />
        <ToggleRow title="Filter noisy signals" desc="Drop flapping or low-value signals before correlating." checked={d.noiseFiltering} onChange={(v) => patch(setDraft, { noiseFiltering: v })} />
        <ToggleRow title="Reconstruct the timeline" desc="Assemble an ordered timeline of contributing events for each incident." checked={d.timelineReconstruction} onChange={(v) => patch(setDraft, { timelineReconstruction: v })} last />
      </Section>
      <Section title="Evidence">
        <NumberField label="Retain evidence for" unit="days" min={7} max={730} value={d.evidenceRetention} onChange={(v) => patch(setDraft, { evidenceRetention: v })} />
        <div className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-black/40 dark:text-zinc-500">Signal sources</div>
        <TagList items={d.signalSources} onChange={(v) => patch(setDraft, { signalSources: v })} placeholder="Add a signal source…" />
      </Section>
    </>
  );
}
