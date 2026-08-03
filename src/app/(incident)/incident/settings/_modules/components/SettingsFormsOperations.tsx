"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Select from "@/components/ui/select";
import { FormProps, patch, setPath } from "./formTypes";
import {
  Collection, Explain, MultiSelectPeople, Notice, NumberField, SelectField, Section, TagList, TextField, ToggleRow, userOptions,
} from "./SettingsPrimitives";
import { TIER_LABELS, TIER_TONE } from "./settings.data";

export function ServicesForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Section title={`Services (${d.list.length})`}>
        <Collection
          columns={[
            { key: "name", label: "Service", type: "text", placeholder: "service name", width: "minmax(0,1.5fr)" },
            { key: "tier", label: "Tier", type: "tier", width: "82px" },
            { key: "owner", label: "Owner", type: "text", placeholder: "team" },
          ]}
          rows={d.list} addLabel="Add service"
          newRow={() => ({ name: "", tier: 3, owner: "" })}
          onChange={(v) => patch(setDraft, { list: v })}
        />
      </Section>
      <Notice tone="lock">Tier sets incident severity defaults. P0 is the most critical; it drives auto-paging and war-room creation.</Notice>
    </>
  );
}

export function EnvironmentsForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Section title={`Environments (${d.list.length})`}>
        <Collection
          columns={[
            { key: "name", label: "Name", type: "text", width: "minmax(0,1.4fr)" },
            { key: "protected", label: "Protected", type: "toggle", width: "80px" },
            { key: "freeze", label: "Deploy freeze", type: "toggle", width: "100px" },
          ]}
          rows={d.list} addLabel="Add environment"
          newRow={() => ({ name: "", protected: false, freeze: false })}
          onChange={(v) => patch(setDraft, { list: v })}
        />
      </Section>
      <Notice tone="info">Protected environments require approval before automated actions run. A deploy freeze blocks all releases until lifted.</Notice>
    </>
  );
}

export function WorkflowsForm({ draft, setDraft }: FormProps) {
  const d = draft;
  const STATES = ["Detected", "Triaged", "Acknowledged", "Investigating", "Identified", "Mitigating", "Monitoring", "Resolved", "Post-mortem"];
  const TPL = ["Lightweight", "Standard incident", "Full incident", "War room + exec brief", "Security incident", "Customer-facing outage"];
  const SEV: [string, number][] = [["P0", 1], ["P1", 2], ["P2", 3], ["P3", 4]];
  return (
    <>
      <Section title="Lifecycle states">
        <div className="-mt-1 mb-3 text-[12px] text-black/50 dark:text-zinc-500">The ordered path every incident moves through.</div>
        <div className="flex flex-wrap gap-1.5">
          {STATES.map((s, i) => (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-ibm text-[11px] font-semibold text-black/70 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400">
              <b className="text-IMSDarkGreen">{i + 1}</b>{s}
            </span>
          ))}
        </div>
      </Section>
      <Section title="Incident templates by severity">
        <div className="-mt-1 mb-3 text-[12px] text-black/50 dark:text-zinc-500">Choose the response template Scrubbe applies automatically when an incident opens at each severity.</div>
        <div className="flex flex-col gap-2">
          {SEV.map(([sev, tier]) => (
            <div key={sev} className="grid grid-cols-[64px_1fr] items-center gap-3">
              <span className={cn("rounded-md py-1.5 text-center font-ibm text-[12px] font-bold", TIER_TONE[tier], "bg-zinc-50 dark:bg-zinc-800/60")}>{sev}</span>
              <Select
                value={d.templates[sev]} onChange={(e: any) => setPath(setDraft, `templates.${sev}`, e.target.value)}
                options={TPL.map((t) => ({ value: t, label: t }))}
              />
            </div>
          ))}
        </div>
      </Section>
      <Section title="Transition controls">
        <ToggleRow title="Auto-transition Detected → Triaged" desc="Move new incidents straight into triage instead of waiting for a manual step." checked={d.autoTriage} onChange={(v) => patch(setDraft, { autoTriage: v })} />
        <ToggleRow title="Auto-acknowledge low severity" desc="Skip the manual acknowledge step for P2 and P3 incidents." checked={d.autoAck} onChange={(v) => patch(setDraft, { autoAck: v })} />
        <ToggleRow title="Require approval to deploy mitigation" desc="Mitigation actions are proposed and held until a human approves." checked={d.requireMitigationApproval} onChange={(v) => patch(setDraft, { requireMitigationApproval: v })} />
        <ToggleRow title="Two-person rule in Production" desc="Production mitigations need a second approver before they run." checked={d.twoPersonProd} onChange={(v) => patch(setDraft, { twoPersonProd: v })} />
        <ToggleRow title="Require approval to resolve" desc="An incident can only move to Resolved after a manager signs off." checked={d.requireResolveApproval} onChange={(v) => patch(setDraft, { requireResolveApproval: v })} />
        <ToggleRow title="Block resolve with open action items" desc="Prevent moving to Resolved while follow-up tasks are still open." checked={d.blockResolveOpenTasks} onChange={(v) => patch(setDraft, { blockResolveOpenTasks: v })} />
        <ToggleRow title="Require approval to close" desc="Closing an incident after resolution needs a final sign-off." checked={d.requireCloseApproval} onChange={(v) => patch(setDraft, { requireCloseApproval: v })} last />
      </Section>
      <Section title="Automation & roles">
        <ToggleRow title="Open a war room for every P0" desc="Automatically spin up a live war room when a P0 is detected." checked={d.autoWarRoomP0} onChange={(v) => patch(setDraft, { autoWarRoomP0: v })} />
        <ToggleRow title="Auto-page on-call at P0 / P1" desc="Page the on-call responder the moment a P0 or P1 is declared." checked={d.autoPageOncall} onChange={(v) => patch(setDraft, { autoPageOncall: v })} last />
        <div className="mt-3">
          <SelectField label="Who can move an incident to Resolved" value={d.resolveRole} onChange={(v) => patch(setDraft, { resolveRole: v })} options={["Responder", "Manager", "Super Admin"]} />
          <SelectField label="Require a post-mortem for" value={d.requirePostmortem} onChange={(v) => patch(setDraft, { requirePostmortem: v })} options={["P0 only", "P0 & P1", "All severities", "None"]} />
          <SelectField label="Allow re-open within (hours)" help="How long after resolution an incident can be re-opened without filing a new one." value={d.reopenWindow} onChange={(v) => patch(setDraft, { reopenWindow: v })} options={["24", "48", "72", "168"]} />
        </div>
      </Section>
    </>
  );
}

export function OrulesForm({ draft, setDraft, state }: FormProps) {
  const d = draft;
  const dim = !d.enabled ? "pointer-events-none opacity-50" : "";
  return (
    <>
      <Notice tone="info">
        <b>This is the gate.</b> Nothing runs on your systems unless it passes the rules below. Set the ceiling here; every agent, playbook and decision is capped by it and can only be made stricter downstream — never looser.
      </Notice>
      <div className="h-4" />
      <Section title="Status">
        <ToggleRow title="Operational rules enabled" desc="Turn all operational rules on or off in one place. When disabled, agents may suggest actions but nothing runs automatically." checked={d.enabled} onChange={(v) => patch(setDraft, { enabled: v })} last />
        {!d.enabled && (
          <div className="mt-3">
            <Notice tone="warn">Operational rules are disabled. Scrubbe will propose actions for review but won&apos;t execute anything automatically until you re-enable.</Notice>
          </div>
        )}
      </Section>
      <div className={dim}>
        <Section title="Rule administrators">
          <Explain>Only the people you pick here can change the ceiling, approvals and escalation. Everyone else sees these settings <b>read-only</b>. Pick one or more names.</Explain>
          <MultiSelectPeople options={userOptions(state.users?.list || [])} selected={d.admins || []} onChange={(v) => patch(setDraft, { admins: v })} />
        </Section>
        <Section title="Effective from">
          <Explain>Schedule the exact <b>date and time</b> this configuration goes live. Leave blank to apply immediately on save.</Explain>
          <TextField label="Rules take effect on" type="datetime-local" value={d.effectiveFrom || ""} onChange={(v) => patch(setDraft, { effectiveFrom: v })} />
          <div className="-mt-3 text-[12px] text-black/50 dark:text-zinc-500">Uses the organization timezone. Until this moment, the current rules stay in force.</div>
        </Section>
        <Section title="Automation ceiling">
          <SelectField label="Highest automation any rule or agent may reach" help="Manual = humans do everything. Suggest = Scrubbe recommends. Assisted = acts with approval. Autonomous = acts alone. This caps everything below it." value={d.maxAutomation} onChange={(v) => patch(setDraft, { maxAutomation: v })} options={["Manual", "Suggest", "Assisted", "Autonomous"]} />
          <SelectField label="Auto-approve actions below severity" help="Actions at or above this severity always require a human to approve. “None” means every action needs approval." value={d.autoApproveBelow} onChange={(v) => patch(setDraft, { autoApproveBelow: v })} options={["None", "P3", "P2", "P1"]} />
          <SelectField label="Risk tolerance" help="Conservative holds more actions for review; Aggressive lets low-risk actions run sooner." value={d.riskTolerance} onChange={(v) => patch(setDraft, { riskTolerance: v })} options={["Conservative", "Balanced", "Aggressive"]} />
        </Section>
        <Section title="Incident creation & closure">
          <ToggleRow title="Auto-create incidents from signals" desc="Open an incident automatically when a rule's conditions are met, instead of waiting for a human to raise one." checked={d.autoCreate} onChange={(v) => patch(setDraft, { autoCreate: v })} />
          <ToggleRow title="Auto-close resolved incidents" desc="Close incidents automatically once their resolution criteria are confirmed. Off means a human always closes." checked={d.autoClose} onChange={(v) => patch(setDraft, { autoClose: v })} last />
        </Section>
        <Section title="Approvals & escalation">
          <ToggleRow title="Require approval for cross-team actions" desc="Actions that touch another team's services are proposed, never executed silently." checked={d.requireApproval} onChange={(v) => patch(setDraft, { requireApproval: v })} last />
          <div className="mt-3">
            <SelectField label="Escalate unacknowledged incidents after" help="Minutes before escalating to the next on-call tier." value={d.escalateAfter} onChange={(v) => patch(setDraft, { escalateAfter: v })} options={["5", "10", "15", "30", "60"]} />
          </div>
        </Section>
        <Section title="Business-hours rules">
          <ToggleRow title="Restrict autonomous actions to business hours" desc="Outside these hours, autonomous actions are held for approval. P0 emergencies always break through." checked={d.businessHoursOnly} onChange={(v) => patch(setDraft, { businessHoursOnly: v })} last />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <TextField label="Business hours start" type="time" value={d.bizStart} onChange={(v) => patch(setDraft, { bizStart: v })} />
            <TextField label="Business hours end" type="time" value={d.bizEnd} onChange={(v) => patch(setDraft, { bizEnd: v })} />
          </div>
        </Section>
        <Section title="Emergency override (break-glass)">
          <ToggleRow title="Allow break-glass override" desc="In a declared emergency, a named role may bypass approval gates to execute immediately. Every override is logged to the audit trail." checked={d.emergencyOverride} onChange={(v) => patch(setDraft, { emergencyOverride: v })} last />
          <div className="mt-3">
            <SelectField label="Who may break glass" help="Only this role can trigger an emergency override." value={d.breakGlassRole} onChange={(v) => patch(setDraft, { breakGlassRole: v })} options={["Manager", "Super Admin"]} />
          </div>
        </Section>
        <Section title="Rules as code">
          <Explain>Each rule is a plain <b>When → Then</b> statement. Scrubbe evaluates them top to bottom; only enabled rules run, and all of them are still bound by the ceiling above.</Explain>
          <Collection
            columns={[
              { key: "when", label: "When (condition)", type: "text", placeholder: "e.g. Deploy fails in Production", width: "minmax(0,1.3fr)" },
              { key: "then", label: "Then (action)", type: "text", placeholder: "e.g. Roll back last release", width: "minmax(0,1.3fr)" },
              { key: "on", label: "On", type: "toggle", width: "48px" },
            ]}
            rows={d.list || []} addLabel="Add rule"
            newRow={() => ({ when: "", then: "", on: true })}
            onChange={(v) => patch(setDraft, { list: v })}
          />
        </Section>
      </div>
    </>
  );
}

export function SlaForm({ draft, setDraft }: FormProps) {
  const d = draft;
  const rows: [string, string, number][] = [["p0", "P0", 1], ["p1", "P1", 2], ["p2", "P2", 3], ["p3", "P3", 4]];
  return (
    <>
      <Section title="Policy">
        <ToggleRow title="SLA policy enabled" desc="Track response and resolution targets against the matrix below." checked={d.enabled} onChange={(v) => patch(setDraft, { enabled: v })} />
        <ToggleRow title="Auto-escalate on breach" desc="Automatically escalate to the next tier when a target is missed." checked={d.autoEscalate} onChange={(v) => patch(setDraft, { autoEscalate: v })} last />
      </Section>
      <Section title="Response & resolution targets (minutes)">
        <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
          <div className="grid grid-cols-[60px_1fr_1fr] gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-black/40 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-500">
            <div>Sev</div><div>Respond</div><div>Resolve</div>
          </div>
          {rows.map(([key, label, tier]) => (
            <div key={key} className="grid grid-cols-[60px_1fr_1fr] items-center gap-2 border-b border-zinc-100 px-3 py-2 last:border-b-0 dark:border-zinc-800">
              <span className={cn("w-fit rounded-full px-2 py-0.5 font-ibm text-[11px] font-bold text-white", tier === 1 ? "bg-rose-500" : tier === 2 ? "bg-orange-500" : tier === 3 ? "bg-amber-500" : "bg-IMSDarkGreen")}>{label}</span>
              <input type="number" value={d[key].resp} onChange={(e) => setPath(setDraft, `${key}.resp`, +e.target.value || 0)} className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 font-ibm text-[13px] focus:border-IMSDarkGreen focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
              <input type="number" value={d[key].res} onChange={(e) => setPath(setDraft, `${key}.res`, +e.target.value || 0)} className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 font-ibm text-[13px] focus:border-IMSDarkGreen focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
            </div>
          ))}
        </div>
      </Section>
      <Section title="Reliability">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Error budget" unit="%" min={0} max={100} step={0.1} value={d.errorBudget} onChange={(v) => patch(setDraft, { errorBudget: v })} />
          <NumberField label="SLO target" unit="%" min={0} max={100} step={0.1} value={d.sloTarget} onChange={(v) => patch(setDraft, { sloTarget: v })} />
        </div>
      </Section>
    </>
  );
}

export function IncidentPoliciesForm({ draft, setDraft, state }: FormProps) {
  const d = draft;
  return (
    <>
      <Explain>Defines how incidents are <b>numbered, classified and staffed</b> the moment they open — before anyone touches them.</Explain>
      <Section title="Numbering">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Prefix" value={d.numberPrefix} onChange={(v) => patch(setDraft, { numberPrefix: v })} />
          <NumberField label="Digits" min={3} max={10} value={d.numberPad} onChange={(v) => patch(setDraft, { numberPad: v })} />
        </div>
        <Notice tone="lock">
          Next incident will be <b className="font-ibm">{d.numberPrefix}-{String(d.nextNumber).padStart(d.numberPad, "0")}</b>. Numbers are sequential and never reused.
        </Notice>
      </Section>
      <Section title="Priority matrix (impact × urgency)">
        <Explain>Priority is derived automatically from an incident&apos;s impact and urgency. Edit the mapping to match how your team triages.</Explain>
        <Collection
          columns={[
            { key: "impact", label: "Impact", type: "select", options: ["Widespread", "Localized", "Minimal"] },
            { key: "urgency", label: "Urgency", type: "select", options: ["High", "Medium", "Low"] },
            { key: "priority", label: "Priority", type: "tier", width: "82px" },
          ]}
          rows={d.matrix} addLabel="Add mapping"
          newRow={() => ({ impact: "Localized", urgency: "Low", priority: 3 })}
          onChange={(v) => patch(setDraft, { matrix: v })}
        />
      </Section>
      <Section title="Major incident & war room">
        <SelectField label="Declare a major incident at" help="At or above this severity, major-incident handling kicks in." value={d.majorAtSeverity} onChange={(v) => patch(setDraft, { majorAtSeverity: v })} options={["P0", "P1", "P2"]} />
        <SelectField label="Open a war room at" help="A live war room is created automatically at this severity." value={d.warRoomAtSeverity} onChange={(v) => patch(setDraft, { warRoomAtSeverity: v })} options={["P0", "P1", "P2"]} />
      </Section>
      <Section title="Assignment & required fields">
        <ToggleRow title="Auto-assign a responder" desc="Route new incidents to the on-call for the affected service." checked={d.autoAssign} onChange={(v) => patch(setDraft, { autoAssign: v })} last />
        <div className="mb-4 mt-3">
          <label className="mb-1.5 block text-[13px] font-semibold text-black dark:text-zinc-200">Default responders</label>
          <MultiSelectPeople options={userOptions(state.users?.list || [])} selected={d.defaultResponders || []} onChange={(v) => patch(setDraft, { defaultResponders: v })} />
          <div className="mt-1.5 text-[12px] text-black/50 dark:text-zinc-500">Added to every incident when no service owner is found.</div>
        </div>
        <ToggleRow title="Require an impact summary" desc="Responders must record customer impact before moving on." checked={d.requireImpact} onChange={(v) => patch(setDraft, { requireImpact: v })} />
        <ToggleRow title="Require a root cause to close" desc="An incident can't be closed until a root cause is recorded." checked={d.requireRootCauseOnClose} onChange={(v) => patch(setDraft, { requireRootCauseOnClose: v })} last />
        <div className="mt-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-black/40 dark:text-zinc-500">Mandatory fields</div>
          <TagList items={d.mandatoryFields} onChange={(v) => patch(setDraft, { mandatoryFields: v })} placeholder="Add a required field…" />
        </div>
      </Section>
    </>
  );
}

export function AssetsForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Explain>The registry of everything Scrubbe can see and act on. Agents only ever touch assets listed here, and only within their allowed scope.</Explain>
      <Section title={`Assets (${d.list.length})`}>
        <Collection
          columns={[
            { key: "name", label: "Asset", type: "text", placeholder: "resource name", width: "minmax(0,1.4fr)" },
            { key: "type", label: "Type", type: "select", options: ["Server", "Kubernetes cluster", "Database", "Cloud resource", "Application", "Container", "Virtual machine", "Network device"] },
            { key: "env", label: "Environment", type: "select", options: ["Production", "Staging", "Development"] },
            { key: "owner", label: "Owner", type: "text", placeholder: "team" },
            { key: "lifecycle", label: "Lifecycle", type: "select", options: ["Active", "Provisioning", "Decommissioning", "Retired"] },
          ]}
          rows={d.list} addLabel="Add asset"
          newRow={() => ({ name: "", type: "Server", env: "Production", owner: "", lifecycle: "Active" })}
          onChange={(v) => patch(setDraft, { list: v })}
        />
      </Section>
      <Section title="Discovery">
        <ToggleRow title="Auto-discover from cloud connectors" desc="Import new resources from AWS, Azure and GCP as they appear." checked={d.autoDiscover} onChange={(v) => patch(setDraft, { autoDiscover: v })} />
        <ToggleRow title="Require an owner" desc="New assets must have an owner before agents may act on them." checked={d.requireOwner} onChange={(v) => patch(setDraft, { requireOwner: v })} last />
      </Section>
    </>
  );
}

export function AutomationForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Explain>Background work Scrubbe runs on a schedule, and the safety limits around it. The <b>Pause everything</b> switch is your global stop button.</Explain>
      <Section title="Master switch">
        <ToggleRow title="Pause all automation" desc="Emergency stop. Scheduled jobs and background tasks stop until you resume. In-flight incident actions still follow Operational rules." checked={d.pauseAll} onChange={(v) => patch(setDraft, { pauseAll: v })} last />
        {d.pauseAll && (
          <div className="mt-3">
            <Notice tone="warn">All automation is paused. Nothing scheduled will run until you turn this off.</Notice>
          </div>
        )}
      </Section>
      <Section title={`Scheduled jobs (${d.jobs.filter((j: any) => j.on).length} on)`}>
        <Collection
          columns={[
            { key: "name", label: "Job", type: "text", placeholder: "job name", width: "minmax(0,1.5fr)" },
            { key: "schedule", label: "Schedule", type: "text", placeholder: "e.g. Daily · 02:00", width: "minmax(0,1fr)" },
            { key: "on", label: "On", type: "toggle", width: "48px" },
          ]}
          rows={d.jobs} addLabel="Add job"
          newRow={() => ({ name: "", schedule: "", on: true })}
          onChange={(v) => patch(setDraft, { jobs: v })}
        />
      </Section>
      <Section title="Reliability limits">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Max retries" min={0} max={10} value={d.maxRetries} onChange={(v) => patch(setDraft, { maxRetries: v })} />
          <SelectField label="Backoff" value={d.retryBackoff} onChange={(v) => patch(setDraft, { retryBackoff: v })} options={["Fixed", "Linear", "Exponential"]} />
        </div>
        <ToggleRow title="Circuit breaker" desc="Stop retrying a failing target after too many errors, instead of hammering it." checked={d.circuitBreaker} onChange={(v) => patch(setDraft, { circuitBreaker: v })} last />
        <div className="mt-3">
          <NumberField label="Trip breaker after" unit="failures" min={1} max={50} value={d.breakerThreshold} onChange={(v) => patch(setDraft, { breakerThreshold: v })} />
        </div>
      </Section>
    </>
  );
}

export function QualityForm({ draft, setDraft }: FormProps) {
  const d = draft;
  const total = d.checks.reduce((a: number, c: any) => a + (c.on ? +c.weight || 0 : 0), 0);
  return (
    <>
      <Explain>Scores every incident against your best-practice checklist. Low-scoring incidents can be blocked from closing until they&apos;re brought up to standard.</Explain>
      <Section title="Scoring">
        <ToggleRow title="Quality scoring enabled" desc="Score each incident automatically as it progresses." checked={d.enabled} onChange={(v) => patch(setDraft, { enabled: v })} />
        <div className="my-3">
          <NumberField label="Minimum passing score" unit="%" min={0} max={100} value={d.minScore} onChange={(v) => patch(setDraft, { minScore: v })} />
        </div>
        <ToggleRow title="Block close below minimum" desc="Incidents scoring under the minimum can't be closed until fixed." checked={d.blockCloseBelowMin} onChange={(v) => patch(setDraft, { blockCloseBelowMin: v })} />
        <ToggleRow title="Incident Coach suggestions" desc="Show responders live suggestions to raise their score." checked={d.coachOn} onChange={(v) => patch(setDraft, { coachOn: v })} last />
      </Section>
      <Section title={`Checks (weights total ${total}%)`}>
        {total !== 100 && <div className="mb-2.5"><Notice tone="warn">Enabled weights add up to {total}%. Aim for 100% so scores are easy to read.</Notice></div>}
        <Collection
          columns={[
            { key: "check", label: "Best-practice check", type: "text", placeholder: "what good looks like", width: "minmax(0,1.6fr)" },
            { key: "weight", label: "Weight %", type: "text", width: "80px" },
            { key: "on", label: "On", type: "toggle", width: "48px" },
          ]}
          rows={d.checks} addLabel="Add check"
          newRow={() => ({ check: "", weight: 10, on: true })}
          onChange={(v) => patch(setDraft, { checks: v })}
        />
      </Section>
    </>
  );
}
