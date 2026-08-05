"use client";

import React, { useRef } from "react";
import { toast } from "sonner";
import { Fingerprint, KeyRound, Laptop, Smartphone, ShieldQuestion, Trash2, X } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/Button1";
import Select from "@/components/ui/select";
import {
  Card,
  Section,
  TextField,
  TextAreaField,
  SelectField,
  SegmentedField,
  ToggleRow,
  Notice,
  Collection,
} from "../SettingsPrimitives";
import { STATUSES, PAGES, deviceGlyph, fmtTime, initials } from "./userSettings.data";

export interface UserSectionProps {
  d: any;
  patch: (partial: Record<string, any>) => void;
  setPath: (path: string, val: any) => void;
}

/* ───────────────────── shared row-list for security ───────────────────── */

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-zinc-200 py-6 text-center text-[12.5px] text-black/40 dark:border-zinc-700 dark:text-zinc-500">
      {children}
    </div>
  );
}

function RowList({
  rows,
  onRemove,
  render,
  removable = true,
}: {
  rows: any[];
  onRemove: (i: number) => void;
  render: (row: any) => { icon: React.ReactNode; name: string; meta: string };
  removable?: boolean;
}) {
  if (!rows.length) return null;
  return (
    <div className="mb-3.5 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
      {rows.map((r, i) => {
        const { icon, name, meta } = render(r);
        return (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-zinc-100 px-3.5 py-3 last:border-b-0 dark:border-zinc-800"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-IMSDarkGreen/10 text-IMSDarkGreen">
              {icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-semibold text-black dark:text-zinc-200">
                {name}
              </div>
              <div className="truncate text-[12px] text-black/50 dark:text-zinc-500">
                {meta}
              </div>
            </div>
            {removable && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-black/40 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────── Profile ───────────────────── */

export function ProfileSection({ d, patch }: UserSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be smaller than 3MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      patch({ photo: reader.result as string });
      toast.success("Photo updated");
    };
    reader.onerror = () => toast.error("Couldn't read that file");
    reader.readAsDataURL(file);
  }

  return (
    <>
      <Card className="mb-4">
        <div className="mb-1 text-[14.5px] font-bold text-black dark:text-zinc-100">
          Photo
        </div>
        <div className="mb-4 text-[12.5px] text-black/50 dark:text-zinc-500">
          Shown on your comments, assignments and presence.
        </div>
        <div className="flex items-center gap-6">
          {d.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.photo}
              alt=""
              className="h-20 w-20 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-zinc-300 text-[22px] font-bold text-white dark:bg-zinc-700">
              {initials(d.fullName)}
            </div>
          )}
          <div className="flex gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline-dark"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload photo
            </Button>
            <Button
              variant="outline-dark"
              size="sm"
              disabled={!d.photo}
              onClick={() => {
                patch({ photo: null });
                toast.info("Photo removed");
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="mb-4 text-[14.5px] font-bold text-black dark:text-zinc-100">
          Identity
        </div>
        <TextField
          label="Full name"
          value={d.fullName}
          onChange={(v) => patch({ fullName: v })}
        />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <TextField
            label="Job title"
            value={d.jobTitle}
            onChange={(v) => patch({ jobTitle: v })}
          />
          <TextField
            label="Department"
            value={d.department}
            onChange={(v) => patch({ department: v })}
          />
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <TextField
            label="Team"
            value={d.team}
            onChange={(v) => patch({ team: v })}
          />
          <div className="mb-4 last:mb-0">
            <div className="mb-1.5 flex items-center gap-2">
              <label className="block text-[13px] font-semibold text-black dark:text-zinc-200">
                Email address
              </label>
              <span className="rounded-full bg-IMSDarkGreen/10 px-2 py-0.5 text-[10.5px] font-bold text-IMSDarkGreen">
                Verified
              </span>
            </div>
            <Input value={d.email} readOnly />
          </div>
        </div>
        <TextField
          label="Phone number"
          type="tel"
          value={d.phone}
          onChange={(v) => patch({ phone: v })}
        />
      </Card>

      <Card className="mb-4">
        <div className="mb-4 text-[14.5px] font-bold text-black dark:text-zinc-100">
          Locale &amp; availability
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <SelectField
            label="Time zone"
            value={d.timezone}
            onChange={(v) => patch({ timezone: v })}
            options={[
              "Africa/Lagos (GMT+1)",
              "Europe/London (GMT+1)",
              "America/New_York (GMT-4)",
              "America/Los_Angeles (GMT-7)",
              "Asia/Singapore (GMT+8)",
              "Australia/Sydney (GMT+10)",
            ]}
          />
          <SelectField
            label="Preferred language"
            value={d.language}
            onChange={(v) => patch({ language: v })}
            options={["English (UK)", "English (US)", "French", "German", "Spanish", "Portuguese"]}
          />
        </div>
        <SelectField
          label="Date & time format"
          value={d.dateFormat}
          onChange={(v) => patch({ dateFormat: v })}
          options={[
            "DD/MM/YYYY · 24-hour",
            "MM/DD/YYYY · 12-hour",
            "YYYY-MM-DD · 24-hour",
            "D MMM YYYY · 12-hour",
          ]}
        />
        <div className="mb-4 last:mb-0">
          <label className="mb-1.5 block text-[13px] font-semibold text-black dark:text-zinc-200">
            Working hours
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="time"
              value={d.workStart}
              onChange={(e) => patch({ workStart: e.target.value })}
              className="font-ibm"
            />
            <Input
              type="time"
              value={d.workEnd}
              onChange={(e) => patch({ workEnd: e.target.value })}
              className="font-ibm"
            />
          </div>
          <p className="mt-1.5 text-[12px] text-black/50 dark:text-zinc-500">
            Used to schedule digests and respect your off-hours.
          </p>
        </div>
        <SegmentedField
          label="Availability status"
          help="Reflected live on your avatar and to teammates."
          value={d.status}
          onChange={(v) => patch({ status: v })}
          options={Object.keys(STATUSES)}
        />
      </Card>

      <Card>
        <div className="mb-4 text-[14.5px] font-bold text-black dark:text-zinc-100">
          Bio
        </div>
        <TextAreaField
          label="About you"
          value={d.bio}
          onChange={(v) => patch({ bio: v })}
          rows={3}
        />
      </Card>
    </>
  );
}

/* ───────────────────── Security ───────────────────── */

export function SecuritySection({
  d,
  patch,
  onChangePassword,
  onRegenerateCodes,
  onLogoutAll,
}: UserSectionProps & {
  onChangePassword: () => void;
  onRegenerateCodes: () => void;
  onLogoutAll: () => void;
}) {
  return (
    <>
      <Card className="mb-4">
        <div className="mb-4 text-[14.5px] font-bold text-black dark:text-zinc-100">
          Authentication
        </div>
        <Button variant="outline-dark" size="sm" onClick={onChangePassword} className="mb-4">
          Change password
        </Button>
        <ToggleRow
          title="Multi-factor authentication"
          desc="Require a second factor every time you sign in."
          checked={d.mfa}
          onChange={(v) => patch({ mfa: v })}
          last
        />

        <div className="mt-4">
          <label className="mb-2 block text-[13px] font-semibold text-black dark:text-zinc-200">
            Passkeys
          </label>
          <RowList
            rows={d.passkeys}
            onRemove={(i) => patch({ passkeys: d.passkeys.filter((_: any, ix: number) => ix !== i) })}
            render={(p) => ({ icon: <Fingerprint size={16} />, name: p.name, meta: `Added ${p.added}` })}
          />
          {!d.passkeys.length && <EmptyRow>No passkeys registered yet.</EmptyRow>}
          <Button
            variant="outline-dark"
            size="sm"
            className="mt-2.5 w-full"
            onClick={() =>
              patch({
                passkeys: [...d.passkeys, { name: "New passkey", added: "Just now" }],
              })
            }
          >
            Add passkey
          </Button>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-[13px] font-semibold text-black dark:text-zinc-200">
            Security keys
          </label>
          <RowList
            rows={d.keys}
            onRemove={(i) => patch({ keys: d.keys.filter((_: any, ix: number) => ix !== i) })}
            render={(k) => ({ icon: <KeyRound size={16} />, name: k.name, meta: `Added ${k.added}` })}
          />
          {!d.keys.length && <EmptyRow>No security keys registered yet.</EmptyRow>}
          <Button
            variant="outline-dark"
            size="sm"
            className="mt-2.5 w-full"
            onClick={() =>
              patch({ keys: [...d.keys, { name: "New security key", added: "Just now" }] })
            }
          >
            Register security key
          </Button>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-[13px] font-semibold text-black dark:text-zinc-200">
            Recovery codes
          </label>
          <div className="flex items-center gap-3 rounded-md border border-zinc-200 p-3.5 dark:border-zinc-700">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <ShieldQuestion size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold text-black dark:text-zinc-200">
                {d.recoveryLeft} codes remaining
              </div>
              <div className="text-[12px] text-black/50 dark:text-zinc-500">
                Store these somewhere safe — each works once.
              </div>
            </div>
            <Button variant="outline-dark" size="sm" onClick={onRegenerateCodes}>
              Regenerate
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="mb-1 text-[14.5px] font-bold text-black dark:text-zinc-100">
          Active sessions
        </div>
        <div className="mb-4 text-[12.5px] text-black/50 dark:text-zinc-500">
          Devices currently signed in to your account.
        </div>
        <RowList
          rows={d.sessions}
          onRemove={(i) => patch({ sessions: d.sessions.filter((_: any, ix: number) => ix !== i) })}
          render={(s) => ({
            icon: deviceGlyph(s.device) === "mobile" ? <Smartphone size={16} /> : <Laptop size={16} />,
            name: s.device + (s.current ? " · This device" : ""),
            meta: `${s.browser} · ${s.last}`,
          })}
        />
        {!d.sessions.length && <EmptyRow>No other active sessions.</EmptyRow>}
        {d.sessions.length > 0 && (
          <Button variant="outline-dark" size="sm" className="mt-3.5" onClick={onLogoutAll}>
            Log out all other devices
          </Button>
        )}
      </Card>

      <Card>
        <div className="mb-4 text-[14.5px] font-bold text-black dark:text-zinc-100">
          Login history
        </div>
        {d.logins.length ? (
          <RowList
            rows={d.logins}
            onRemove={() => {}}
            removable={false}
            render={(l) => ({ icon: <ShieldQuestion size={16} />, name: l.place, meta: l.when })}
          />
        ) : (
          <EmptyRow>No recent login activity to show.</EmptyRow>
        )}
      </Card>
    </>
  );
}

/* ───────────────────── Notifications ───────────────────── */

export function NotificationsSection({ d, patch, setPath }: UserSectionProps) {
  const inc = d.incidents;
  const ch = d.channels;
  return (
    <>
      <Card className="mb-4">
        <Section title="Incident notifications">
          <ToggleRow title="Assigned to me" desc="An incident is assigned to you." checked={inc.assigned} onChange={(v) => setPath("incidents.assigned", v)} />
          <ToggleRow title="Mentioned" desc="Someone @mentions you." checked={inc.mentioned} onChange={(v) => setPath("incidents.mentioned", v)} />
          <ToggleRow title="SLA approaching" desc="An SLA is close to breaching." checked={inc.slaApproaching} onChange={(v) => setPath("incidents.slaApproaching", v)} />
          <ToggleRow title="P0 declared" desc="A P0 is declared anywhere." checked={inc.p0} onChange={(v) => setPath("incidents.p0", v)} />
          <ToggleRow title="War Room invitation" desc="You're pulled into a war room." checked={inc.warRoom} onChange={(v) => setPath("incidents.warRoom", v)} />
          <ToggleRow title="Incident resolved" checked={inc.resolved} onChange={(v) => setPath("incidents.resolved", v)} />
          <ToggleRow title="Incident reopened" checked={inc.reopened} onChange={(v) => setPath("incidents.reopened", v)} />
          <ToggleRow title="Investigation completed" checked={inc.investigation} onChange={(v) => setPath("incidents.investigation", v)} />
          <ToggleRow title="Playbook executed" checked={inc.playbook} onChange={(v) => setPath("incidents.playbook", v)} />
          <ToggleRow title="Action awaiting approval" desc="An action needs your sign-off." checked={inc.approval} onChange={(v) => setPath("incidents.approval", v)} last />
        </Section>
      </Card>

      <Card className="mb-4">
        <Section title="Delivery channels">
          <ToggleRow title="Email" checked={ch.email} onChange={(v) => setPath("channels.email", v)} />
          <ToggleRow title="Slack" checked={ch.slack} onChange={(v) => setPath("channels.slack", v)} />
          <ToggleRow title="Microsoft Teams" checked={ch.teams} onChange={(v) => setPath("channels.teams", v)} />
          <ToggleRow title="Mobile push" checked={ch.push} onChange={(v) => setPath("channels.push", v)} />
          <ToggleRow title="SMS" checked={ch.sms} onChange={(v) => setPath("channels.sms", v)} />
          <ToggleRow title="Browser notification" checked={ch.browser} onChange={(v) => setPath("channels.browser", v)} last />
        </Section>
      </Card>

      <Card className="mb-4">
        <SegmentedField
          label="Notification frequency"
          value={d.frequency}
          onChange={(v) => patch({ frequency: v })}
          options={["Instant", "Every 5 min", "Every 15 min", "Hourly digest", "Daily digest"]}
        />
      </Card>

      <Card>
        <div className="mb-1 text-[14.5px] font-bold text-black dark:text-zinc-100">
          Quiet hours
        </div>
        <div className="mb-4 text-[12.5px] text-black/50 dark:text-zinc-500">
          Pause non-urgent notifications overnight. P0s always break through.
        </div>
        <ToggleRow title="Enable quiet hours" checked={d.quietOn} onChange={(v) => patch({ quietOn: v })} last />
        <div className="mt-3.5">
          <label className="mb-1.5 block text-[13px] font-semibold text-black dark:text-zinc-200">
            Window
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input type="time" value={d.quietStart} onChange={(e) => patch({ quietStart: e.target.value })} className="font-ibm" />
            <Input type="time" value={d.quietEnd} onChange={(e) => patch({ quietEnd: e.target.value })} className="font-ibm" />
          </div>
          <p className="mt-1.5 text-[12px] text-black/50 dark:text-zinc-500">
            Currently {fmtTime(d.quietStart)} – {fmtTime(d.quietEnd)}.
          </p>
        </div>
      </Card>
    </>
  );
}

/* ───────────────────── Dashboard ───────────────────── */

function PinPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const avail = PAGES.filter((p) => !selected.includes(p));
  return (
    <div>
      {selected.length ? (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {selected.map((t, i) => (
            <span
              key={t + i}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-3 pr-1.5 text-[12.5px] font-medium text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {t}
              <button
                type="button"
                onClick={() => onChange(selected.filter((_, ix) => ix !== i))}
                className="rounded-full p-0.5 text-black/40 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mb-2.5 text-[12.5px] text-black/40 dark:text-zinc-500">Nothing pinned yet.</p>
      )}
      <Select
        value=""
        onChange={(e: any) => e.target.value && onChange([...selected, e.target.value])}
        placeholder={avail.length ? "Add a page…" : "All pages pinned"}
        disabled={!avail.length}
        options={avail.map((o) => ({ value: o, label: o }))}
      />
    </div>
  );
}

export function DashboardSection({ d, patch }: UserSectionProps) {
  return (
    <>
      <Card className="mb-4">
        <SelectField
          label="Default landing page"
          value={d.landing}
          onChange={(v) => patch({ landing: v })}
          options={PAGES}
        />
      </Card>

      <Card className="mb-4">
        <div className="mb-4 text-[14.5px] font-bold text-black dark:text-zinc-100">
          Default incident list
        </div>
        <SelectField
          label="Sort by"
          value={d.sortBy}
          onChange={(v) => patch({ sortBy: v })}
          options={["Priority", "Last Updated", "SLA", "Created"]}
        />
        <SegmentedField
          label="Page size"
          value={d.pageSize}
          onChange={(v) => patch({ pageSize: v })}
          options={["25", "50", "100"]}
        />
      </Card>

      <Card>
        <div className="mb-1 text-[14.5px] font-bold text-black dark:text-zinc-100">
          Pinned pages
        </div>
        <div className="mb-4 text-[12.5px] text-black/50 dark:text-zinc-500">
          Keep pages one click away in your sidebar.
        </div>
        <Section title="Favorite pages">
          <PinPicker selected={d.pinned} onChange={(v) => patch({ pinned: v })} />
        </Section>
        <Section title="Recently viewed">
          <PinPicker selected={d.recent} onChange={(v) => patch({ recent: v })} />
        </Section>
      </Card>
    </>
  );
}

/* ───────────────────── Incident workspace ───────────────────── */

export function WorkspaceSection({ d, patch, setPath }: UserSectionProps) {
  return (
    <>
      <Card className="mb-4">
        <SegmentedField
          label="Default timeline order"
          value={d.timelineOrder}
          onChange={(v) => patch({ timelineOrder: v })}
          options={["Newest first", "Oldest first"]}
        />
        <SegmentedField
          label="Auto-refresh"
          value={d.autoRefresh}
          onChange={(v) => patch({ autoRefresh: v })}
          options={["Off", "15 sec", "30 sec", "1 minute"]}
        />
      </Card>

      <Card className="mb-4">
        <Section title="Automatically expand">
          <ToggleRow title="Evidence" checked={d.expand.evidence} onChange={(v) => setPath("expand.evidence", v)} />
          <ToggleRow title="Timeline" checked={d.expand.timeline} onChange={(v) => setPath("expand.timeline", v)} />
          <ToggleRow title="Recommendations" checked={d.expand.recommendations} onChange={(v) => setPath("expand.recommendations", v)} />
          <ToggleRow title="AI summary" checked={d.expand.aiSummary} onChange={(v) => setPath("expand.aiSummary", v)} last />
        </Section>
      </Card>

      <Card>
        <Section title="Incident badge preferences">
          <ToggleRow title="SLA" checked={d.badges.sla} onChange={(v) => setPath("badges.sla", v)} />
          <ToggleRow title="SLO" checked={d.badges.slo} onChange={(v) => setPath("badges.slo", v)} />
          <ToggleRow title="Elapsed time" checked={d.badges.elapsed} onChange={(v) => setPath("badges.elapsed", v)} />
          <ToggleRow title="Confidence" checked={d.badges.confidence} onChange={(v) => setPath("badges.confidence", v)} />
          <ToggleRow title="Incident quality" checked={d.badges.quality} onChange={(v) => setPath("badges.quality", v)} />
          <ToggleRow title="Operational rule" checked={d.badges.operational} onChange={(v) => setPath("badges.operational", v)} last />
        </Section>
      </Card>
    </>
  );
}

/* ───────────────────── Shortcuts ───────────────────── */

export function ShortcutsSection({ d, patch }: UserSectionProps) {
  return (
    <Card>
      <div className="mb-1 text-[14.5px] font-bold text-black dark:text-zinc-100">
        Keyboard shortcuts
      </div>
      <div className="mb-4 text-[12.5px] text-black/50 dark:text-zinc-500">
        Click a shortcut to change it.
      </div>
      <Collection
        columns={[
          { key: "act", label: "Action", type: "static" },
          { key: "keys", label: "Shortcut", type: "text", width: "140px" },
        ]}
        rows={d.list}
        onChange={(rows) => patch({ list: rows })}
        addable={false}
      />
    </Card>
  );
}

/* ───────────────────── Accessibility ───────────────────── */

export function AccessibilitySection({ d, patch }: UserSectionProps) {
  return (
    <>
      <Card className="mb-4">
        <Section title="Vision & motion">
          <ToggleRow title="High contrast" desc="Stronger borders and text contrast." checked={d.highContrast} onChange={(v) => patch({ highContrast: v })} />
          <ToggleRow title="Large fonts" desc="Increase base text size across Scrubbe." checked={d.largeFonts} onChange={(v) => patch({ largeFonts: v })} />
          <ToggleRow title="Reduce motion" desc="Minimize animations and transitions." checked={d.reduceMotion} onChange={(v) => patch({ reduceMotion: v })} />
          <ToggleRow title="Screen reader mode" desc="Optimize markup and announcements." checked={d.screenReader} onChange={(v) => patch({ screenReader: v })} />
          <ToggleRow title="Keyboard navigation" desc="Always show focus outlines and skip links." checked={d.keyboardNav} onChange={(v) => patch({ keyboardNav: v })} last />
        </Section>
      </Card>
      <Card>
        <SelectField
          label="Color-blind palette"
          value={d.colorBlind}
          onChange={(v) => patch({ colorBlind: v })}
          options={["Off", "Deuteranopia", "Protanopia", "Tritanopia"]}
        />
      </Card>
    </>
  );
}

/* ───────────────────── Data & privacy ───────────────────── */

export function PrivacySection({ onDownload, onDeleteRequest }: {
  onDownload: (kind: string) => void;
  onDeleteRequest: () => void;
}) {
  return (
    <>
      <Card className="mb-4">
        <div className="mb-1 text-[14.5px] font-bold text-black dark:text-zinc-100">
          Download your data
        </div>
        <div className="mb-4 text-[12.5px] text-black/50 dark:text-zinc-500">
          Export a copy of your information.
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline-dark" size="sm" onClick={() => onDownload("profile")}>My profile</Button>
          <Button variant="outline-dark" size="sm" onClick={() => onDownload("settings")}>My settings</Button>
        </div>
      </Card>

      <Card>
        <div className="mb-4 text-[14.5px] font-bold text-black dark:text-zinc-100">
          Privacy
        </div>
        <Notice tone="warn">
          Deleting your account removes your profile, personal views and preferences. Incident records you contributed to are retained for audit.
        </Notice>
        <Button
          variant="outline-dark"
          size="sm"
          className="mt-4 !border-rose-300 !text-rose-600 hover:!bg-rose-50"
          onClick={onDeleteRequest}
        >
          Request account deletion
        </Button>
      </Card>
    </>
  );
}

/* ───────────────────── Appearance ───────────────────── */

export function AppearanceSection({
  d,
  patch,
  theme,
  setTheme,
}: UserSectionProps & { theme: string; setTheme: (t: "light" | "dark" | "system") => void }) {
  return (
    <>
      <Card className="mb-4">
        <SegmentedField
          label="Theme"
          help="Applies immediately."
          value={theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"}
          onChange={(v) => setTheme(v.toLowerCase() as "light" | "dark" | "system")}
          options={["Light", "Dark", "System"]}
        />
      </Card>
      <Card className="mb-4">
        <SegmentedField
          label="Interface density"
          value={d.density}
          onChange={(v) => patch({ density: v })}
          options={["Comfortable", "Compact"]}
        />
      </Card>
      <Card>
        <Section title="Motion">
          <ToggleRow
            title="Interface animations"
            desc="Transitions and micro-interactions."
            checked={d.animations}
            onChange={(v) => patch({ animations: v })}
            last
          />
        </Section>
      </Card>
    </>
  );
}

/* ───────────────────── About ───────────────────── */

export function AboutSection({
  onSupport,
  onFeedback,
  onReport,
}: {
  onSupport: () => void;
  onFeedback: () => void;
  onReport: () => void;
}) {
  return (
    <>
      <Card className="mb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-IMSDarkGreen text-white">
            <ShieldQuestion size={22} />
          </div>
          <div>
            <div className="font-ibm text-[15px] font-bold text-black dark:text-zinc-100">
              Scrubbe
            </div>
            <div className="text-[12.5px] text-black/50 dark:text-zinc-500">
              Governed multi-agent incident response
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div className="mb-4 text-[14.5px] font-bold text-black dark:text-zinc-100">
          Help
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline-dark" size="sm" onClick={onSupport}>Contact support</Button>
          <Button variant="outline-dark" size="sm" onClick={onFeedback}>Send feedback</Button>
          <Button variant="outline-dark" size="sm" onClick={onReport}>Report an issue</Button>
        </div>
      </Card>
    </>
  );
}
