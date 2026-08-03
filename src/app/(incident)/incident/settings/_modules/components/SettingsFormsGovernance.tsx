"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button1";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { FormProps, patch } from "./formTypes";
import {
  Collection, Explain, MultiSelectPeople, Notice, NumberField, SelectField, Section, TagList, TextField, ToggleRow, userOptions,
} from "./SettingsPrimitives";
import { ago, downloadText } from "./settings.data";

export function SecurityForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Section title="Single sign-on">
        <ToggleRow title="SSO enabled" desc="Members sign in through your identity provider." checked={d.ssoOn} onChange={(v) => patch(setDraft, { ssoOn: v })} />
        <ToggleRow title="Enforce SSO for all sign-ins" desc="Block direct email/password sign-in once SSO is enabled." checked={d.ssoEnforced} onChange={(v) => patch(setDraft, { ssoEnforced: v })} last />
        <div className="mt-3">
          <SelectField label="Identity provider" value={d.ssoProvider} onChange={(v) => patch(setDraft, { ssoProvider: v })} options={["Okta", "Microsoft Entra ID", "Google Workspace", "OneLogin", "Custom SAML"]} />
        </div>
      </Section>
      <Section title="Access">
        <ToggleRow title="Enforce two-factor authentication" desc="Every member must set up 2FA before they can sign in." checked={d.enforce2fa} onChange={(v) => patch(setDraft, { enforce2fa: v })} last />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumberField label="Session timeout" unit="min" min={5} max={1440} value={d.sessionTimeout} onChange={(v) => patch(setDraft, { sessionTimeout: v })} />
          <SelectField label="Password policy" value={d.passwordPolicy} onChange={(v) => patch(setDraft, { passwordPolicy: v })} options={["Standard", "Strong", "Strict"]} />
        </div>
      </Section>
      <Section title="IP allowlist">
        <TagList items={d.allowlist} onChange={(v) => patch(setDraft, { allowlist: v })} placeholder="Add an IP or CIDR range…" />
      </Section>
    </>
  );
}

export function RetentionForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Section title="Retention windows (days)">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Incidents" min={30} max={3650} value={d.incidents} onChange={(v) => patch(setDraft, { incidents: v })} />
          <NumberField label="Telemetry" min={7} max={365} value={d.telemetry} onChange={(v) => patch(setDraft, { telemetry: v })} />
        </div>
        <NumberField label="Audit logs" min={90} max={3650} value={d.audit} onChange={(v) => patch(setDraft, { audit: v })} />
      </Section>
      <Notice tone="lock">Audit logs are append-only. They can be retained longer but are never edited or deleted before their window ends.</Notice>
      <div className="h-4" />
      <Section title="Lifecycle">
        <ToggleRow title="Archive before deletion" desc="Move expired records to cold storage instead of removing them." checked={d.autoArchive} onChange={(v) => patch(setDraft, { autoArchive: v })} />
        <ToggleRow title="Auto-clean expired records" desc="Permanently remove records once their retention window passes." checked={d.autoCleanup} onChange={(v) => patch(setDraft, { autoCleanup: v })} last />
      </Section>
    </>
  );
}

export function AuditForm({ draft, setDraft, ledger }: FormProps) {
  const d = draft;
  const recent = ledger.slice(0, 6);
  return (
    <>
      <Section title="Recent activity">
        <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
          <div className="grid grid-cols-[1fr_96px] gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-black/40 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-500">
            <div>Change</div><div>When</div>
          </div>
          {recent.length ? recent.map((e, i) => (
            <div key={i} className="grid grid-cols-[1fr_96px] items-center gap-2 border-b border-zinc-100 px-3 py-2 last:border-b-0 dark:border-zinc-800">
              <div className="min-w-0">
                <b className="block text-[12.5px] font-bold text-black dark:text-zinc-200">{e.catName}</b>
                <div className="truncate text-[11.5px] text-black/50 dark:text-zinc-500">{e.summary}</div>
              </div>
              <div className="font-ibm text-[11px] text-black/40 dark:text-zinc-500">{ago(e.ts)}</div>
            </div>
          )) : (
            <div className="p-5 text-center text-[13px] text-black/40 dark:text-zinc-500">No changes recorded yet. Edits you save will appear here.</div>
          )}
        </div>
        <Button
          variant="outline-green" size="sm" className="mt-2.5" leftIcon={<Download size={14} />}
          onClick={() => { downloadText(`scrubbe-audit-log-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(ledger, null, 2)); toast.success("Audit log exported"); }}
        >
          Export audit log
        </Button>
      </Section>
      <Section title="Settings">
        <NumberField label="Audit log retention" unit="days" min={90} max={3650} value={d.retention} onChange={(v) => patch(setDraft, { retention: v })} />
        <ToggleRow title="Allow exports" desc="Let admins download the audit log as a file." checked={d.exportEnabled} onChange={(v) => patch(setDraft, { exportEnabled: v })} last />
      </Section>
      <Notice tone="lock">The audit log is tamper-evident and append-only. Entries can be exported but never altered.</Notice>
    </>
  );
}

export function ApiKeysForm({ draft, setDraft }: FormProps) {
  const d = draft;
  const [label, setLabel] = useState("");
  const [scope, setScope] = useState("Read");

  function genKey() {
    if (!label.trim()) { toast.error("Name the key first"); return; }
    patch(setDraft, { list: [{ label: label.trim(), scope, created: new Date().toISOString().slice(0, 10), last: "just now" }, ...d.list] });
    const secret = "sk_live_" + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
    navigator.clipboard?.writeText(secret).catch(() => {});
    setLabel("");
    toast.success("Key created — secret copied to clipboard");
  }
  function revoke(i: number) {
    patch(setDraft, { list: d.list.filter((_: any, ix: number) => ix !== i) });
    toast.success("Key revoked");
  }

  return (
    <>
      <Section title="Base URL">
        <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-ibm text-[12px] text-black/70 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-400">
          <code className="flex-1">{d.baseUrl}</code>
        </div>
      </Section>
      <Section title={`Active keys (${d.list.length})`}>
        {d.list.length ? (
          <div className="mb-3 space-y-2">
            {d.list.map((k: any, i: number) => (
              <div key={i} className="flex items-center gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-black/40 dark:border-zinc-700 dark:text-zinc-500"><KeyRound size={14} /></span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-ibm text-[12.5px] font-semibold text-black dark:text-zinc-200">{k.label}</div>
                  <div className="text-[11px] text-black/50 dark:text-zinc-500">created {k.created} · last used {k.last}</div>
                </div>
                <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-bold", k.scope === "Admin" ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" : k.scope === "Write" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : "bg-IMSDarkGreen/10 text-IMSDarkGreen")}>{k.scope}</span>
                <button onClick={() => revoke(i)} className="h-7 w-7 shrink-0 rounded-md text-black/40 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500"><Trash2 size={14} className="mx-auto" /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-3 rounded-md border border-dashed border-zinc-200 py-6 text-center text-[13px] text-black/40 dark:border-zinc-700 dark:text-zinc-500">No keys yet. Generate one to start calling the API.</div>
        )}
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Key label — e.g. CI pipeline" />
          <Select
            value={scope} onChange={(e: any) => setScope(e.target.value)}
            options={["Read", "Write", "Admin"].map((o) => ({ value: o, label: o }))}
          />
          <Button variant="solid" size="sm" className="shrink-0" onClick={genKey}>Generate</Button>
        </div>
      </Section>
      <Notice tone="lock">A key&apos;s secret is shown once at creation. Store it somewhere safe — Scrubbe keeps only a hashed copy.</Notice>
    </>
  );
}

export function DecisionsForm({ draft, setDraft, state }: FormProps) {
  const d = draft;
  return (
    <>
      <Notice tone="info"><b>The execution gate.</b> Every action an agent proposes stops here for the right human sign-off before it runs. Define who approves what, and how risky an action can be before a second person is required.</Notice>
      <div className="h-4" />
      <Section title="Approval defaults">
        <ToggleRow title="Require approval before executing" desc="No proposed action runs until an approver signs off. Turning this off is not recommended." checked={d.requireApprovalToExecute} onChange={(v) => patch(setDraft, { requireApprovalToExecute: v })} />
        <ToggleRow title="Two-person rule for high-risk actions" desc="High-risk actions need a second, different approver." checked={d.twoPersonHighRisk} onChange={(v) => patch(setDraft, { twoPersonHighRisk: v })} last />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <SelectField label="“High-risk” starts at" value={d.riskThreshold} onChange={(v) => patch(setDraft, { riskThreshold: v })} options={["Low", "Medium", "High"]} />
          <NumberField label="Approval requests expire after" unit="hrs" min={1} max={72} value={d.autoExpireHours} onChange={(v) => patch(setDraft, { autoExpireHours: v })} />
        </div>
      </Section>
      <Section title="Approval chains">
        <Explain>For each action, set who approves it and who backs them up if they&apos;re unavailable.</Explain>
        <Collection
          columns={[
            { key: "action", label: "Action", type: "text", placeholder: "e.g. Roll back a deploy", width: "minmax(0,1.4fr)" },
            { key: "approver", label: "Approver", type: "select", options: ["Responder", "Manager", "Super Admin"] },
            { key: "backup", label: "Backup", type: "select", options: ["Responder", "Manager", "Super Admin"] },
            { key: "on", label: "On", type: "toggle", width: "48px" },
          ]}
          rows={d.chains} addLabel="Add approval chain"
          newRow={() => ({ action: "", approver: "Manager", backup: "Super Admin", on: true })}
          onChange={(v) => patch(setDraft, { chains: v })}
        />
      </Section>
      <Section title="Delegations">
        <label className="mb-1.5 block text-[13px] font-semibold text-black dark:text-zinc-200">Delegate approvals to</label>
        <MultiSelectPeople options={userOptions(state.users?.list || [])} selected={d.delegates || []} onChange={(v) => patch(setDraft, { delegates: v })} />
        <div className="mt-1.5 text-[12px] text-black/50 dark:text-zinc-500">These people may approve on an approver&apos;s behalf — useful for cover during on-call.</div>
      </Section>
    </>
  );
}

export function ComplianceForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Explain>Your compliance posture and the controls behind it: retention windows, legal hold, and one-click evidence export for auditors.</Explain>
      <Section title="Frameworks">
        <Collection
          columns={[
            { key: "name", label: "Framework", type: "text", placeholder: "e.g. SOC 2", width: "minmax(0,1.3fr)" },
            { key: "status", label: "Status", type: "select", options: ["Certified", "Compliant", "In progress", "Not in scope"] },
            { key: "owner", label: "Owner", type: "text", placeholder: "team" },
            { key: "on", label: "Tracked", type: "toggle", width: "70px" },
          ]}
          rows={d.frameworks} addLabel="Add framework"
          newRow={() => ({ name: "", status: "In progress", owner: "", on: true })}
          onChange={(v) => patch(setDraft, { frameworks: v })}
        />
      </Section>
      <Section title="Retention">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Incident data retention" unit="days" min={30} max={3650} value={d.dataRetentionDays} onChange={(v) => patch(setDraft, { dataRetentionDays: v })} />
          <NumberField label="Audit retention" unit="days" min={90} max={3650} value={d.auditRetentionDays} onChange={(v) => patch(setDraft, { auditRetentionDays: v })} />
        </div>
      </Section>
      <Section title="Holds & export">
        <ToggleRow title="Legal hold" desc="Freeze all deletion and cleanup so nothing can be removed while a hold is active." checked={d.legalHold} onChange={(v) => patch(setDraft, { legalHold: v })} />
        <ToggleRow title="Allow evidence export" desc="Let compliance owners export a signed evidence bundle for auditors." checked={d.evidenceExport} onChange={(v) => patch(setDraft, { evidenceExport: v })} last />
        <Button
          variant="outline-green" size="sm" className="mt-3" leftIcon={<Download size={14} />}
          onClick={() => {
            const text = `SCRUBBE — COMPLIANCE EVIDENCE BUNDLE\nGenerated: ${new Date().toISOString()}\nFrameworks: ${(d.frameworks || []).filter((f: any) => f.on).map((f: any) => `${f.name} (${f.status})`).join(", ") || "none"}\nAudit retention: ${d.auditRetentionDays ?? "—"} days\nLegal hold: ${d.legalHold ? "ACTIVE" : "none"}\n`;
            downloadText(`scrubbe-evidence-${new Date().toISOString().slice(0, 10)}.txt`, text);
            toast.success("Evidence bundle exported");
          }}
        >
          Export evidence bundle
        </Button>
      </Section>
    </>
  );
}
