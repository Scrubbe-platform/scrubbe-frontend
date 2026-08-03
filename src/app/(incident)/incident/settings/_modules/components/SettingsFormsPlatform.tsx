"use client";

import React from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormProps, patch } from "./formTypes";
import {
  Collection, Explain, NumberField, SelectField, Section, TextField, ToggleRow,
} from "./SettingsPrimitives";
import { downloadText } from "./settings.data";

export function DeveloperForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Explain>Everything you need to build on Scrubbe: webhooks, OAuth apps, rate limits, a sandbox, and MCP for connecting AI tools. Raw API keys live in <b>API &amp; access keys</b>.</Explain>
      <Section title="Webhooks">
        <Collection
          columns={[
            { key: "name", label: "Name", type: "text", placeholder: "what it is", width: "minmax(0,1.1fr)" },
            { key: "url", label: "Endpoint URL", type: "text", placeholder: "https://…", width: "minmax(0,1.6fr)" },
            { key: "on", label: "On", type: "toggle", width: "48px" },
          ]}
          rows={d.webhooks} addLabel="Add webhook"
          newRow={() => ({ name: "", url: "", on: true })}
          onChange={(v) => patch(setDraft, { webhooks: v })}
        />
      </Section>
      <Section title="OAuth apps">
        <Collection
          columns={[
            { key: "name", label: "App", type: "text", placeholder: "app name", width: "minmax(0,1.3fr)" },
            { key: "scopes", label: "Scopes", type: "text", placeholder: "read, write", width: "minmax(0,1fr)" },
            { key: "on", label: "On", type: "toggle", width: "48px" },
          ]}
          rows={d.oauthApps} addLabel="Add OAuth app"
          newRow={() => ({ name: "", scopes: "read", on: true })}
          onChange={(v) => patch(setDraft, { oauthApps: v })}
        />
      </Section>
      <Section title="Limits & tooling">
        <NumberField label="Rate limit" unit="req/min" min={60} max={10000} value={d.rateLimit} onChange={(v) => patch(setDraft, { rateLimit: v })} />
        <ToggleRow title="Sandbox environment" desc="Give developers a safe, isolated copy of the API that never touches production." checked={d.sandboxOn} onChange={(v) => patch(setDraft, { sandboxOn: v })} last />
      </Section>
      <Section title="MCP (Model Context Protocol)">
        <ToggleRow title="Expose an MCP server" desc="Let approved AI tools connect to Scrubbe over MCP, within your governance rules." checked={d.mcpOn} onChange={(v) => patch(setDraft, { mcpOn: v })} last />
        <div className="mt-3">
          <TextField label="MCP endpoint" help="Share this with tools you authorise. Access is still bound by Operational rules." value={d.mcpEndpoint} onChange={(v) => patch(setDraft, { mcpEndpoint: v })} />
        </div>
      </Section>
    </>
  );
}

const SYS_DOT: Record<string, string> = { Operational: "bg-IMSDarkGreen", Degraded: "bg-amber-500", Down: "bg-rose-500" };

export function SystemForm({ draft, setDraft }: FormProps) {
  const d = draft;
  const healthy = d.services.filter((s: any) => s.status === "Operational").length;
  return (
    <>
      <Explain>A live look at the platform running underneath you — service health, version, and feature flags. Flip <b>Maintenance mode</b> to pause new work during upgrades.</Explain>
      <Section title="Platform health">
        <div className="flex flex-col gap-1.5">
          {d.services.map((s: any) => (
            <div key={s.name} className="flex items-center gap-2.5 rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12.5px] dark:border-zinc-700 dark:bg-zinc-900">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", SYS_DOT[s.status])} />
              <span className="flex-1 font-semibold text-black dark:text-zinc-200">{s.name}</span>
              <span className="text-[11.5px] text-black/50 dark:text-zinc-500">{s.status}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Version & maintenance">
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-700 dark:bg-zinc-800/40">
            <div className="text-[11px] font-bold uppercase tracking-wide text-black/40 dark:text-zinc-500">Version</div>
            <div className="mt-1 font-ibm text-[20px] font-bold text-black dark:text-zinc-100">{d.version}</div>
            <div className="mt-0.5 text-[11px] text-black/40 dark:text-zinc-500">up to date</div>
          </div>
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-700 dark:bg-zinc-800/40">
            <div className="text-[11px] font-bold uppercase tracking-wide text-black/40 dark:text-zinc-500">Services</div>
            <div className="mt-1 font-ibm text-[20px] font-bold text-black dark:text-zinc-100">{healthy}/{d.services.length}</div>
            <div className="mt-0.5 text-[11px] text-black/40 dark:text-zinc-500">operational</div>
          </div>
        </div>
        <ToggleRow title="Maintenance mode" desc="Pause new incident automation and background jobs while you upgrade. Existing incidents stay open." checked={d.maintenanceMode} onChange={(v) => patch(setDraft, { maintenanceMode: v })} last />
      </Section>
      <Section title="Feature flags">
        <Collection
          columns={[
            { key: "flag", label: "Flag", type: "text", placeholder: "feature name", width: "minmax(0,1.6fr)" },
            { key: "on", label: "On", type: "toggle", width: "48px" },
          ]}
          rows={d.flags} addLabel="Add flag"
          newRow={() => ({ flag: "", on: false })}
          onChange={(v) => patch(setDraft, { flags: v })}
        />
      </Section>
    </>
  );
}

const INVOICES = [{ period: "May 2026", amount: "$28,400" }, { period: "Apr 2026", amount: "$28,400" }, { period: "Mar 2026", amount: "$26,900" }];

export function BillingForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Section title="Current plan">
        <div className="mb-3.5 flex items-center justify-between rounded-md border border-zinc-200 p-4 dark:border-zinc-700">
          <div>
            <div className="font-ibm text-[18px] font-bold text-black dark:text-zinc-100">{d.plan}</div>
            <div className="text-[12.5px] text-black/50 dark:text-zinc-500">{d.seats} seats · billed annually</div>
          </div>
          <span className="rounded-full bg-IMSDarkGreen/10 px-3 py-1 text-[12px] font-bold text-IMSDarkGreen">Active</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <SelectField
              label="Change plan" help="Plan changes take effect at your next renewal." value={d.plan}
              onChange={(v) => patch(setDraft, { plan: v })} options={["Starter", "Growth", "Enterprise"]}
            />
          </div>
          <NumberField label="Licensed seats" min={1} max={5000} value={d.seats} onChange={(v) => patch(setDraft, { seats: v })} />
        </div>
      </Section>
      <Section title="Usage this cycle">
        <UsageBar label="Incidents processed" value="18.2k / 50k" pct={36} />
        <UsageBar label="Active members" value={`${d.seats} / ${d.seats}`} pct={100} />
        <UsageBar label="Automation runs" value="4.1k / 20k" pct={21} />
      </Section>
      <Section title="Payment & invoices">
        <TextField label="Payment method" value={d.payment} onChange={(v) => patch(setDraft, { payment: v })} />
        <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
          {INVOICES.map((inv) => (
            <div key={inv.period} className="flex items-center gap-3 border-b border-zinc-100 px-3 py-2.5 last:border-b-0 dark:border-zinc-800">
              <span className="flex-1 text-[13px] font-semibold text-black dark:text-zinc-200">{inv.period}</span>
              <span className="font-ibm text-[13px] text-black/60 dark:text-zinc-400">{inv.amount}</span>
              <button
                onClick={() => {
                  const text = `SCRUBBE, INC. — INVOICE\nPeriod: ${inv.period}\nPlan: ${d.plan}\nSeats: ${d.seats}\nAmount due: ${inv.amount}\nStatus: Paid\n`;
                  downloadText(`scrubbe-invoice-${inv.period.replace(" ", "-").toLowerCase()}.txt`, text);
                  toast.success("Invoice downloaded");
                }}
                className="flex items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1 text-[11.5px] font-bold text-black hover:border-IMSDarkGreen hover:text-IMSDarkGreen dark:border-zinc-700 dark:text-zinc-300"
              >
                <Download size={12} /> PDF
              </button>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
function UsageBar({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1.5 flex justify-between text-[12px]"><b className="font-bold text-black dark:text-zinc-200">{label}</b><span className="text-black/50 dark:text-zinc-500">{value}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-IMSDarkGreen" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
