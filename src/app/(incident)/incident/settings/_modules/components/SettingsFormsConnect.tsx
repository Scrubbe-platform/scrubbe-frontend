"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button1";
import Input from "@/components/ui/input";
import { FormProps, patch } from "./formTypes";
import {
  Card, SelectField, Section, TagList, TextAreaField, TextField, ToggleRow,
} from "./SettingsPrimitives";
import { ConnectorConsole } from "./ConnectorConsole";
import { fmtWindow } from "./settings.data";

export function IntegrationsForm({ draft, setDraft }: FormProps) {
  return <ConnectorConsole list={draft.list} onChange={(v) => patch(setDraft, { list: v })} />;
}

export function NotificationsForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Section title="Delivery targets">
        <TextField label="Alert email" placeholder="ops@yourcompany.com" help="Where incident alert emails are sent." value={d.alertEmail} onChange={(v) => patch(setDraft, { alertEmail: v })} />
        <TextField label="Slack channel" placeholder="#incidents" help="Channel incidents are posted to when Slack is on." value={d.slackChannel} onChange={(v) => patch(setDraft, { slackChannel: v })} />
      </Section>
      <Section title="Channels">
        <ToggleRow title="Email" desc="Delivered to each member's verified address." checked={d.email} onChange={(v) => patch(setDraft, { email: v })} />
        <ToggleRow title="SMS" desc="Text alerts for on-call responders." checked={d.sms} onChange={(v) => patch(setDraft, { sms: v })} />
        <ToggleRow title="Mobile push" desc="Push notifications via the Scrubbe app." checked={d.push} onChange={(v) => patch(setDraft, { push: v })} />
        <ToggleRow title="Slack" desc="Posted to your connected Slack channels." checked={d.slack} onChange={(v) => patch(setDraft, { slack: v })} />
        <ToggleRow title="Microsoft Teams" desc="Posted to your connected Teams channels." checked={d.teams} onChange={(v) => patch(setDraft, { teams: v })} />
        <ToggleRow title="Voice call" desc="Phone calls for critical (P0) pages that must not be missed." checked={d.voice} onChange={(v) => patch(setDraft, { voice: v })} />
        <ToggleRow title="Webhook" desc="Push events to an external endpoint for your own tooling." checked={d.webhook} onChange={(v) => patch(setDraft, { webhook: v })} last />
      </Section>
      <Section title="Delivery">
        <ToggleRow title="Notify on incident created" desc="Send an alert the moment a new incident is raised." checked={d.notifyOnCreate} onChange={(v) => patch(setDraft, { notifyOnCreate: v })} />
        <ToggleRow title="Notify on incident resolved" desc="Send an alert once an incident is marked resolved." checked={d.notifyOnResolve} onChange={(v) => patch(setDraft, { notifyOnResolve: v })} />
        <ToggleRow title="Escalation notifications" desc="Notify the next tier automatically when an incident escalates." checked={d.escalationNotify} onChange={(v) => patch(setDraft, { escalationNotify: v })} last />
        <div className="mt-3">
          <SelectField label="Digest frequency" value={d.digest} onChange={(v) => patch(setDraft, { digest: v })} options={["Real-time", "Hourly", "Daily"]} />
        </div>
        <ToggleRow title="Quiet hours" desc="Hold non-urgent notifications during set hours. P0 alerts always break through." checked={d.quietOn} onChange={(v) => patch(setDraft, { quietOn: v })} last />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <TextField label="Quiet hours start" type="time" value={d.quietStart} onChange={(v) => patch(setDraft, { quietStart: v })} />
          <TextField label="Quiet hours end" type="time" value={d.quietEnd} onChange={(v) => patch(setDraft, { quietEnd: v })} />
        </div>
      </Section>
    </>
  );
}

export function DeliveryForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Section title="Default channel">
        <SelectField label="Send incident alerts to" value={d.channel} onChange={(v) => patch(setDraft, { channel: v })} options={["Slack", "Microsoft Teams", "Email", "SMS", "PagerDuty"]} />
      </Section>
      <Section title="Message template">
        <TextField label="Subject line" value={d.subject} onChange={(v) => patch(setDraft, { subject: v })} />
        <TextAreaField label="Body" mono rows={5} help="Tokens like {{service}}, {{severity}}, {{id}} and {{status}} are filled in automatically." value={d.body} onChange={(v) => patch(setDraft, { body: v })} />
        <Button variant="outline-green" size="sm" onClick={() => toast.info(`Test alert sent to ${d.channel}`)}>
          Send a test alert
        </Button>
      </Section>
    </>
  );
}

const STATUS_STYLE: Record<string, string> = {
  Scheduled: "bg-IMSDarkGreen/10 text-IMSDarkGreen",
  "In progress": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Completed: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};
const BAR_STYLE: Record<string, string> = { Scheduled: "bg-IMSDarkGreen", "In progress": "bg-amber-500", Completed: "bg-zinc-300 dark:bg-zinc-600" };

export function StatusForm({ draft, setDraft }: FormProps) {
  const d = draft;
  const [title, setTitle] = useState("");
  const [components, setComponents] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [message, setMessage] = useState("");

  function post() {
    if (!title.trim()) { toast.error("Add a title for the maintenance window"); return; }
    patch(setDraft, {
      maintenance: [{ title: title.trim(), components, start, end, status, message, notify: d.notifySubscribers }, ...(d.maintenance || [])],
    });
    setTitle(""); setComponents(""); setStart(""); setEnd(""); setStatus("Scheduled"); setMessage("");
    toast.success(d.notifySubscribers ? "Maintenance posted — subscribers notified" : "Maintenance window posted");
  }
  function remove(i: number) {
    patch(setDraft, { maintenance: (d.maintenance || []).filter((_: any, ix: number) => ix !== i) });
  }

  return (
    <>
      <Section title="Public page">
        <ToggleRow title="Status page is live" desc="When off, your public status page returns a maintenance notice." checked={d.enabled} onChange={(v) => patch(setDraft, { enabled: v })} last />
        <div className="mt-3">
          <TextField label="Custom domain" help="Point a CNAME at status.scrubbe.com to use your own domain." value={d.domain} onChange={(v) => patch(setDraft, { domain: v })} />
        </div>
        <ToggleRow title="Notify subscribers on incidents" desc="Email everyone subscribed when you publish an update." checked={d.notifySubscribers} onChange={(v) => patch(setDraft, { notifySubscribers: v })} last />
      </Section>
      <Section title="Displayed components">
        <TagList items={d.components} onChange={(v) => patch(setDraft, { components: v })} placeholder="Add a component…" />
      </Section>
      <Section title="Scheduled maintenance">
        <Card className="mb-3.5 border border-zinc-200 bg-zinc-50 p-4 shadow-none dark:border-zinc-700 dark:bg-zinc-800/40">
          <TextField label="Title" placeholder="e.g. Database failover drill" value={title} onChange={setTitle} />
          <TextField label="Affected components" placeholder="API, Ingestion" help="Comma-separated. These are highlighted on the page." value={components} onChange={setComponents} />
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-semibold text-black dark:text-zinc-200">Window</label>
            <div className="grid grid-cols-2 gap-3">
              <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} aria-label="Start" className="font-ibm text-[12.5px]" />
              <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} aria-label="End" className="font-ibm text-[12.5px]" />
            </div>
          </div>
          <SelectField label="State" value={status} onChange={setStatus} options={["Scheduled", "In progress", "Completed"]} />
          <TextAreaField label="Update for subscribers" rows={3} value={message} onChange={setMessage} />
          <Button variant="solid" size="sm" leftIcon={<CalendarClock size={15} />} onClick={post}>
            Post maintenance window
          </Button>
        </Card>
        {d.maintenance?.length ? (
          <div className="space-y-2.5">
            {d.maintenance.map((m: any, i: number) => (
              <div key={i} className="flex gap-3 rounded-md border border-zinc-200 p-3.5 dark:border-zinc-700">
                <span className={cn("w-1 shrink-0 rounded-full", BAR_STYLE[m.status])} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <b className="text-[13.5px] font-bold text-black dark:text-zinc-100">{m.title}</b>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold", STATUS_STYLE[m.status])}>{m.status}</span>
                  </div>
                  <div className="mt-0.5 font-ibm text-[11.5px] text-black/50 dark:text-zinc-500">{fmtWindow(m.start, m.end)}</div>
                  {m.message && <p className="mt-1.5 text-[12px] leading-relaxed text-black/70 dark:text-zinc-400">{m.message}</p>}
                  {m.components && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {m.components.split(",").map((c: string) => c.trim()).filter(Boolean).map((c: string) => (
                        <span key={c} className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-ibm text-[10.5px] text-black/60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => remove(i)} className="h-7 w-7 shrink-0 self-start rounded-md text-black/40 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500">
                  <Trash2 size={14} className="mx-auto" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-zinc-200 py-6 text-center text-[13px] text-black/40 dark:border-zinc-700 dark:text-zinc-500">
            No maintenance scheduled. Posted windows appear here and on your status page.
          </div>
        )}
      </Section>
    </>
  );
}
