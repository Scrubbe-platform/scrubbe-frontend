"use client";

import React from "react";
import Input from "@/components/ui/input";
import { FormProps, patch } from "./formTypes";
import {
  Collection, Explain, Notice, SelectField, Section, TagList, TextField, ToggleRow,
} from "./SettingsPrimitives";

const TIMEZONES = ["Europe/London", "Europe/Berlin", "America/New_York", "America/Los_Angeles", "Africa/Lagos", "Asia/Singapore", "Australia/Sydney"];
const INDUSTRIES = ["Software", "Financial Services", "Healthcare", "Retail", "Public Sector", "Other"];

export function OrganizationForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Section title="Profile">
        <TextField label="Organization name" value={d.orgName} onChange={(v) => patch(setDraft, { orgName: v })} />
        <TextField label="Legal entity" value={d.legalName} onChange={(v) => patch(setDraft, { legalName: v })} />
        <TextField label="Primary domain" help="Used for email verification and SSO matching." value={d.domain} onChange={(v) => patch(setDraft, { domain: v })} />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Industry" value={d.industry} onChange={(v) => patch(setDraft, { industry: v })} options={INDUSTRIES} />
          <SelectField label="Default timezone" value={d.timezone} onChange={(v) => patch(setDraft, { timezone: v })} options={TIMEZONES} />
        </div>
      </Section>
      <Section title="Business units">
        <TagList items={d.units} onChange={(v) => patch(setDraft, { units: v })} placeholder="Add a business unit…" />
      </Section>
      <Section title="Locations">
        <TagList items={d.locations} onChange={(v) => patch(setDraft, { locations: v })} placeholder="Add a location…" />
      </Section>
    </>
  );
}

export function UsersForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Section title={`Members (${d.list.length})`}>
        <Collection
          columns={[
            { key: "name", label: "Name", type: "text", placeholder: "Full name", width: "minmax(0,1.1fr)" },
            { key: "email", label: "Email", type: "text", placeholder: "name@scrubbe.com", width: "minmax(0,1.4fr)" },
            { key: "role", label: "Role", type: "select", options: ["Viewer", "Responder", "Manager", "Admin"] },
            { key: "active", label: "Active", type: "check", width: "62px" },
          ]}
          rows={d.list} dimColumn="active" addLabel="Invite member"
          newRow={() => ({ name: "", email: "", role: d.defaultRole || "Responder", active: true })}
          onChange={(v) => patch(setDraft, { list: v })}
        />
        <div className="mt-2 text-[12px] text-black/50 dark:text-zinc-500">
          Tick to activate an account or clear the box to deactivate it. Deactivated members keep their history but cannot sign in, be paged, or execute actions until reactivated.
        </div>
      </Section>
      <Section title="Defaults">
        <SelectField label="Default role for new invites" help="Applied automatically when a new member accepts their invite." value={d.defaultRole} onChange={(v) => patch(setDraft, { defaultRole: v })} options={["Viewer", "Responder", "Manager", "Admin"]} />
      </Section>
      <Section title="Teams">
        <TagList items={d.teams} onChange={(v) => patch(setDraft, { teams: v })} placeholder="Add a team…" />
      </Section>
    </>
  );
}

export function RolesForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Notice tone="info">Each role maps to one access level. Operate can act on incidents; Approve can release automated actions; Full admin manages settings.</Notice>
      <div className="h-4" />
      <Section title={`Roles (${d.list.length})`}>
        <Collection
          columns={[
            { key: "name", label: "Role name", type: "text", placeholder: "e.g. On-call Lead", width: "minmax(0,1.4fr)" },
            { key: "level", label: "Access level", type: "select", options: ["Read-only", "Operate", "Approve", "Full admin"] },
          ]}
          rows={d.list} addLabel="Add custom role"
          newRow={() => ({ name: "", level: "Operate" })}
          onChange={(v) => patch(setDraft, { list: v })}
        />
      </Section>
    </>
  );
}

export function AuthenticationForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Explain>This is how people prove who they are before they can touch anything. Connect your identity provider, then set the password and multi-factor rules everyone must meet.</Explain>
      <Section title={`Identity providers (${d.providers.filter((p: any) => p.on).length} active)`}>
        <Collection
          columns={[
            { key: "name", label: "Provider", type: "text", placeholder: "e.g. Okta", width: "minmax(0,1.2fr)" },
            { key: "protocol", label: "Protocol", type: "select", options: ["SAML 2.0", "OpenID Connect", "OAuth 2.0", "LDAP"] },
            { key: "domain", label: "Domain / issuer", type: "text", placeholder: "company.okta.com", width: "minmax(0,1.3fr)" },
            { key: "on", label: "On", type: "toggle", width: "48px" },
          ]}
          rows={d.providers} addLabel="Add provider"
          newRow={() => ({ name: "", protocol: "SAML 2.0", domain: "", on: false })}
          onChange={(v) => patch(setDraft, { providers: v })}
        />
        <div className="h-3.5" />
        <ToggleRow title="Single sign-on required" desc="Members must sign in through an active provider above. Direct passwords are disabled." checked={d.ssoOn} onChange={(v) => patch(setDraft, { ssoOn: v })} last />
        <div className="mt-3">
          <SelectField label="Primary provider" value={d.primary} onChange={(v) => patch(setDraft, { primary: v })} options={d.providers.map((p: any) => p.name)} />
        </div>
      </Section>
      <Section title="Password policy">
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Strength" value={d.passwordPolicy} onChange={(v) => patch(setDraft, { passwordPolicy: v })} options={["Standard", "Strong", "Strict"]} />
          <TextField label="Minimum length" type="number" value={d.minLength} onChange={(v) => patch(setDraft, { minLength: +v || 0 })} />
        </div>
        <TextField label="Force rotation after" unit="days" type="number" value={d.rotateDays} onChange={(v) => patch(setDraft, { rotateDays: +v || 0 })} />
        <div className="-mt-3 mb-4 text-[12px] text-black/50 dark:text-zinc-500">Set to 0 to never force a reset.</div>
      </Section>
      <Section title="Multi-factor (MFA)">
        <SelectField label="MFA requirement" help="When required, members must enrol before they can sign in." value={d.mfaPolicy} onChange={(v) => patch(setDraft, { mfaPolicy: v })} options={["Optional", "Required for admins", "Required for all"]} />
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-black/40 dark:text-zinc-500">Allowed methods</div>
        <TagList items={d.mfaMethods} onChange={(v) => patch(setDraft, { mfaMethods: v })} placeholder="Add an MFA method…" />
      </Section>
    </>
  );
}

export function AppearanceForm({ draft, setDraft }: FormProps) {
  const d = draft;
  return (
    <>
      <Explain>Controls what your team and customers <b>see</b> — the console theme, your logo, and the branding on status pages and emails.</Explain>
      <Section title="Brand">
        <TextField label="Logo wordmark" help="Shown in the top bar and on the sign-in screen." value={d.logoText} onChange={(v) => patch(setDraft, { logoText: v })} />
        <div className="mb-4">
          <label className="mb-1.5 block text-[13px] font-semibold text-black dark:text-zinc-200">Brand colour</label>
          <div className="flex items-center gap-2.5">
            <input type="color" value={d.brandColor} onChange={(e) => patch(setDraft, { brandColor: e.target.value })} className="h-10 w-14 shrink-0 cursor-pointer rounded-md border border-zinc-300 bg-white p-1 dark:border-zinc-700" />
            <div className="w-36">
              <Input value={d.brandColor} onChange={(e) => patch(setDraft, { brandColor: e.target.value })} className="font-ibm" />
            </div>
          </div>
          <div className="mt-1.5 text-[12px] text-black/50 dark:text-zinc-500">Used for primary buttons, links and highlights.</div>
        </div>
        <SelectField label="Theme" value={d.theme} onChange={(v) => patch(setDraft, { theme: v })} options={["System", "Light", "Dark"]} />
      </Section>
      <Section title="Email branding">
        <ToggleRow title="Brand outbound emails" desc="Apply your logo and colour to notification emails." checked={d.emailBranding} onChange={(v) => patch(setDraft, { emailBranding: v })} last />
        <div className="mt-3">
          <TextField label="Email footer text" value={d.emailFooter} onChange={(v) => patch(setDraft, { emailFooter: v })} />
        </div>
      </Section>
      <Section title="Custom domain">
        <ToggleRow title="Use a custom domain" desc="Serve the console and status page from your own domain." checked={d.customDomainOn} onChange={(v) => patch(setDraft, { customDomainOn: v })} last />
        <div className="mt-3">
          <TextField label="Domain" help="Point a CNAME at scrubbe.com. We provision TLS automatically." value={d.customDomain} onChange={(v) => patch(setDraft, { customDomain: v })} />
        </div>
      </Section>
    </>
  );
}
