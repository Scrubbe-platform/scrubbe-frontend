"use client";

import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Building2, Users, KeyRound, Plug, Radar, Layers, UsersRound, TriangleAlert,
  SlidersHorizontal, Brain, Bell, Clock, Gauge, Flag, Shield, Lock, Database,
  Box, Link2, Fingerprint, Sparkles, Check, ChevronRight, ChevronDown, Plus,
  Upload, X, Info, Loader2, Trash2,
} from "lucide-react";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import TextArea from "@/components/ui/text-area";
import Button from "@/components/ui/Button1";
import SideModal from "@/components/ui/SideModal";
import { apiClient } from "@/lib/api/client";
import { endpoint } from "@/lib/api/endpoint";
import useGetConfig from "@/hooks/useConfig";
import useAuthStore from "@/lib/stores/auth.store";
import { cn } from "@/lib/utils";
import {
  type FieldDef, type DiscoveryCounts, type Invite, type CustomConnector,
  type Rotation, type Incident, type Recommendation,
  VENDOR, vendorStyle, CONN_FIELDS, INTEGRATIONS, REQ_CATS, IDP, GROUPS_DEFAULT,
  GROUPS_ALL, AGENTS, AGENT_MODES, CHANNELS, SEVERITIES, RESP_OPTS, RES_OPTS,
  PREFIXES, mins, ITEMS, DOMAINS, CHECKLIST_ITEMS, byId, DISCOVERY_STEPS,
  DISCOVERY_RESULTS, UNOWNED_SEED, DUPES, AUTO_PANEL, TZS, LANGS, CALS,
  INDUSTRIES, ROLES, PERMS, PERMS_LIST, ACCENTS, mapPermToRole, slugify,
  initials, isValidEmail, parseBulkRows, contrast, readableInk, shade,
} from "./welcomePageV2.data";

/* ─────────────────────────── small presentational bits ─────────────────────────── */

const ICONS: Record<string, React.ElementType> = {
  building: Building2, people: Users, key: KeyRound, plug: Plug, radar: Radar,
  layers: Layers, users: UsersRound, alert: TriangleAlert, sliders: SlidersHorizontal,
  brain: Brain, bell: Bell, clock: Clock, gauge: Gauge, flag: Flag, shield: Shield,
  lock: Lock, db: Database, cube: Box, link: Link2, fingerprint: Fingerprint, spark: Sparkles,
};
function Ic({ name, size = 15, className }: { name: string; size?: number; className?: string }) {
  const C = ICONS[name] || Box;
  return <C size={size} className={className} />;
}

function Badge({ tone = "neutral", children }: { tone?: "green" | "amber" | "red" | "blue" | "neutral"; children: ReactNode }) {
  const map = {
    green: "bg-IMSLightGreen/10 text-IMSLightGreen",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    neutral: "bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap", map[tone])}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

function Meter({ frac, size = "md" }: { frac: number; size?: "md" | "sm" | "xs" }) {
  const filled = Math.max(0, Math.min(1, frac)) * 10;
  const dims = size === "xs" ? "w-2 h-[5px] rounded-[1.5px]" : size === "sm" ? "w-[11px] h-[7px] rounded-[2px]" : "w-[26px] h-[14px] rounded-[3px]";
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${Math.round(frac * 100)} percent complete`}>
      {Array.from({ length: 10 }).map((_, i) => {
        const d = filled - i;
        const on = d >= 1;
        const part = !on && d > 0.15;
        return (
          <span
            key={i}
            className={cn(dims, "border transition-colors duration-300", on ? "bg-IMSLightGreen border-IMSLightGreen" : "bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10")}
            style={part ? { background: `linear-gradient(90deg, #28A745 ${Math.max(0, Math.min(1, d)) * 100}%, transparent ${Math.max(0, Math.min(1, d)) * 100}%)` } : undefined}
          />
        );
      })}
    </div>
  );
}

function Pips({ weight }: { weight: number }) {
  const label = weight >= 5 ? "Required" : weight >= 3 ? "Recommended" : "Optional";
  return <span className="hidden sm:inline font-mono text-[10.5px] font-semibold uppercase tracking-wide text-zinc-400">{label}</span>;
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative inline-flex h-[19px] w-[34px] shrink-0 items-center rounded-full border transition-colors",
        checked ? "bg-IMSLightGreen border-IMSLightGreen" : "bg-zinc-200 dark:bg-white/10 border-zinc-300 dark:border-white/15",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <span className={cn("inline-block h-[13px] w-[13px] transform rounded-full bg-white shadow transition-transform", checked ? "translate-x-[17px]" : "translate-x-[2px]")} />
    </button>
  );
}

function SwitchRow({ label, note, checked, onChange, disabled }: { label: string; note: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-zinc-200 dark:border-white/10 px-3.5 py-3">
      <span className="flex-1 min-w-0">
        <span className="block text-[13.5px] font-semibold text-black dark:text-white">{label}</span>
        <span className="block text-xs text-zinc-500 dark:text-zinc-400">{note}</span>
      </span>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function Sheet({ title, right, children, footer }: { title: string; right?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-zinc-200 dark:border-white/10 overflow-hidden bg-white dark:bg-grayscrubbe-900">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-zinc-50 dark:bg-white/[0.03] border-b border-zinc-200 dark:border-white/10">
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">{title}</span>
        {right && <span className="ml-auto">{right}</span>}
      </div>
      <div className="p-4">{children}</div>
      {footer && <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] flex items-center gap-2.5 flex-wrap">{footer}</div>}
    </div>
  );
}

function FieldGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>{children}</div>;
}

function VendorMark({ name, size = 26 }: { name: string; size?: number }) {
  const s = vendorStyle(name);
  return (
    <span className="rounded-[7px] flex items-center justify-center font-ibm font-extrabold shrink-0" style={{ background: s.bg, color: s.fg, width: size, height: size, fontSize: size * 0.4 }}>
      {s.mk}
    </span>
  );
}

function DynamicField({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  if (field.t === "textarea") {
    return (
      <div className="sm:col-span-2">
        <TextArea label={field.l} value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.ph} rows={4} className="font-mono text-[12.5px]" />
      </div>
    );
  }
  if (field.t === "select") {
    return <Select label={field.l} value={value || ""} options={(field.opts || []).map((o) => ({ value: o, label: o }))} onChange={(e) => onChange(String(e.target.value))} />;
  }
  return (
    <Input
      label={field.l}
      type={field.t === "password" ? "password" : field.t === "url" ? "url" : "text"}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.ph}
    />
  );
}

function missingFields(fields: FieldDef[], vals: Record<string, string>) {
  return fields.filter((f) => !/optional|self-hosted/i.test(f.l) && !(vals[f.k] || "").trim()).map((f) => f.l);
}

function copyText(text: string, msg = "Copied to clipboard") {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => toast.success(msg)).catch(() => toast.error("Couldn't copy — copy it manually"));
  } else {
    toast.error("Clipboard not available — copy it manually");
  }
}

/* ─────────────────────────────── main component ─────────────────────────────── */

export default function WelcomePageV2() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { imsConfig } = useGetConfig();

  /* brand + org */
  const [brand, setBrand] = useState<{ accent: string; logo: string | null }>({ accent: "#28A745", logo: null });
  const [org, setOrg] = useState({ name: "", tz: "Europe/London", lang: "English (UK)", hoursFrom: "09:00", hoursTo: "17:30", calendar: "Follow the sun", industry: "Financial services", saved: false });
  const [orgSaving, setOrgSaving] = useState(false);

  useEffect(() => {
    if (!imsConfig) return;
    setOrg((o) => ({
      ...o,
      name: o.name || imsConfig.orgName || imsConfig.companyName || "",
      tz: imsConfig.timezone || o.tz,
      saved: o.saved || Boolean(imsConfig.orgName),
    }));
  }, [imsConfig]);

  /* team invites */
  const [draftRows, setDraftRows] = useState([{ email: "", role: "Engineer", perm: "Responder" }]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [sendingInvites, setSendingInvites] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const csvInputRef = useRef<HTMLInputElement>(null);

  /* auth / SSO */
  const [auth, setAuth] = useState<{ idp: string | null; password: boolean; ssoOnly: boolean; jit: boolean; params: Record<string, Record<string, string>> }>({ idp: null, password: true, ssoOnly: false, jit: false, params: {} });
  const [openIdp, setOpenIdp] = useState<string | null>(null);
  const [idpDraft, setIdpDraft] = useState<Record<string, string>>({});
  const [idpTesting, setIdpTesting] = useState(false);
  useEffect(() => { setIdpDraft(openIdp ? auth.params[openIdp] || {} : {}); }, [openIdp]); // eslint-disable-line react-hooks/exhaustive-deps

  /* engineering stack */
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [creds, setCreds] = useState<Record<string, Record<string, string>>>({});
  const [custom, setCustom] = useState<CustomConnector[]>([]);
  const [openConn, setOpenConn] = useState<string | null>(null);
  const [connDraft, setConnDraft] = useState<Record<string, string>>({});
  const [connTesting, setConnTesting] = useState<string | null>(null);
  const [connSaving, setConnSaving] = useState<string | null>(null);
  const emptyCustomDraft: CustomConnector = { name: "", url: "", method: "Scrubbe pulls from this endpoint", auth: "Bearer token", secret: "", events: "" };
  const [customDraft, setCustomDraft] = useState<CustomConnector>(emptyCustomDraft);
  const [customTesting, setCustomTesting] = useState(false);
  useEffect(() => {
    if (openConn && openConn !== "__custom__") setConnDraft(creds[openConn] || {});
    if (openConn === "__custom__") setCustomDraft(emptyCustomDraft);
  }, [openConn]); // eslint-disable-line react-hooks/exhaustive-deps

  /* discovery */
  const [discovery, setDiscovery] = useState<{ run: boolean; running: boolean; at: string | null; counts: DiscoveryCounts | null }>({ run: false, running: false, at: null, counts: null });
  const [discoverStepIdx, setDiscoverStepIdx] = useState(0);
  const [discoverExplainOpen, setDiscoverExplainOpen] = useState(false);

  /* catalog */
  const [catalogOwners, setCatalogOwners] = useState<Record<string, string>>({});
  const [catalogMerged, setCatalogMerged] = useState(false);

  /* groups */
  const [groups, setGroups] = useState<string[]>(GROUPS_DEFAULT);
  const [newGroup, setNewGroup] = useState("");

  /* incident policies */
  const [policies, setPolicies] = useState({
    resp: { P0: 5, P1: 15, P2: 60, P3: 240 } as Record<string, number>,
    res: { P0: 60, P1: 240, P2: 1440, P3: 4320 } as Record<string, number>,
    escalate: true, hours: "Organization business hours", prefix: "INC", pad: 6, responders: "SRE", saved: false,
  });

  /* operational rules */
  const [rules, setRules] = useState({ rollback: true, approvals: true, confidence: 85, emergency: false, executor: "On-call engineer", windows: false, saved: false });

  /* AI */
  const [ai, setAi] = useState<{ ezra: boolean; agents: Record<string, string | false>; threshold: number; limit: number; saved: boolean }>({ ezra: false, agents: {}, threshold: 90, limit: 12, saved: false });

  /* notifications */
  const [channels, setChannels] = useState({ email: true, slack: false, teams: false, webhook: false, sms: false, webhookUrl: "" });

  /* on-call */
  const [oncall, setOncall] = useState<{ provider: string | null; rotations: Rotation[]; escalation: number; fallback: string; saved: boolean }>({ provider: null, rotations: [], escalation: 2, fallback: "SRE", saved: false });
  const [rotDraft, setRotDraft] = useState({ nm: "", group: groups[0] || "SRE", pattern: "Weekly hand-off" });

  /* readiness check */
  const [check, setCheck] = useState<{ run: boolean; running: boolean; score: number; recs: Recommendation[]; at: string | null }>({ run: false, running: false, score: 0, recs: [], at: null });

  /* incidents + drawer */
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [drawer, setDrawer] = useState<null | "incident" | "studio" | "explore" | "account">(null);
  const [incidentDraft, setIncidentDraft] = useState({ title: "", sev: "P2", service: "", group: "" });

  /* accordion open state + scroll */
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(["stack"]));
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  useEffect(() => {
    if (!scrollTarget) return;
    const el = document.getElementById(`item-${scrollTarget}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setScrollTarget(null);
  }, [scrollTarget, openItems]);

  function toggleItem(id: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function openItem(id: string, scroll?: boolean) {
    setOpenItems((prev) => new Set(prev).add(id));
    if (scroll) setScrollTarget(id);
  }
  /* ─────────────────────── derived readiness math ─────────────────────── */

  const catCovered = (cat: string) => {
    const g = INTEGRATIONS.find((x) => x.cat === cat);
    return !!(g && g.items.some((n) => connected[n]));
  };
  function progressOf(id: string): number {
    switch (id) {
      case "org": return org.saved ? 1 : 0;
      case "team": return invites.length ? 1 : 0;
      case "auth": return auth.idp ? 1 : 0;
      case "stack": return REQ_CATS.filter(catCovered).length / REQ_CATS.length;
      case "discover": return discovery.run ? 1 : 0;
      case "catalog": {
        const targets = discovery.counts?.unowned ?? [];
        if (!targets.length) return 0;
        return targets.filter((t) => catalogOwners[t.nm]).length / targets.length;
      }
      case "groups": return Math.min(1, groups.length / 3);
      case "policies": return policies.saved ? 1 : 0;
      case "rules": return rules.saved ? 1 : 0;
      case "ai": return ai.saved && ai.ezra ? 1 : ai.ezra ? 0.5 : 0;
      case "notify": return CHANNELS.some((c) => (channels as Record<string, boolean | string>)[c.id]) ? 1 : 0;
      case "oncall": return oncall.saved ? 1 : 0;
      default: return 0;
    }
  }
  function statusOf(id: string): "done" | "part" | "todo" {
    const p = progressOf(id);
    return p >= 1 ? "done" : p > 0 ? "part" : "todo";
  }
  function domainScore(dom: string): number {
    const items = ITEMS.filter((i) => i.dom === dom);
    const w = items.reduce((a, i) => a + i.weight, 0);
    if (!w) return 0;
    return items.reduce((a, i) => a + i.weight * progressOf(i.id), 0) / w;
  }
  function overallScore(): number {
    const items = ITEMS.filter((i) => i.weight > 0);
    const w = items.reduce((a, i) => a + i.weight, 0);
    return items.reduce((a, i) => a + i.weight * progressOf(i.id), 0) / w;
  }
  const overall = overallScore();

  const CHECK_AREAS = [
    { nm: "Integrations", val: progressOf("stack") },
    { nm: "Services", val: progressOf("catalog") },
    { nm: "Assets", val: progressOf("discover") },
    { nm: "AI", val: progressOf("ai") },
    { nm: "Policies", val: progressOf("policies") },
    { nm: "Authentication", val: progressOf("auth") },
    { nm: "Notifications", val: progressOf("notify") },
    { nm: "Assignment groups", val: progressOf("groups") },
    { nm: "Dependencies", val: discovery.run ? 1 : 0 },
  ];
  function buildRecommendations(): Recommendation[] {
    const recs: Recommendation[] = [];
    if (!connected["Slack"] && !connected["Microsoft Teams"]) recs.push({ t: "Connect Slack or Microsoft Teams", why: "Incidents currently have no chat channel to land in.", go: "stack" });
    if (discovery.counts) {
      const left = discovery.counts.unowned.filter((x) => !catalogOwners[x.nm]).length;
      if (left) recs.push({ t: `Assign ${left} service${left === 1 ? "" : "s"} to an owner`, why: "Unowned services cannot be routed or escalated.", go: "catalog" });
    } else {
      recs.push({ t: "Run discovery", why: "Nothing below can be verified until Scrubbe can see your estate.", go: "discover" });
    }
    if (!ai.agents["infra"]) recs.push({ t: "Enable the Infrastructure Agent", why: "It is the agent that catches saturation before it becomes an incident.", go: "ai" });
    if (!rules.saved) recs.push({ t: "Verify your production approval policy", why: "Until these are saved, no agent may act in production.", go: "rules" });
    if (!auth.idp) recs.push({ t: "Turn on single sign-on", why: "Password-only access will not pass most security reviews.", go: "auth" });
    if (!oncall.saved) recs.push({ t: "Finish on-call setup", why: "An unacknowledged P1 has nowhere to escalate to.", go: "oncall" });
    if (invites.length < 2) recs.push({ t: "Invite the rest of your team", why: "One person cannot hold a rotation.", go: "team" });
    return recs;
  }
  function runCheck() {
    if (check.running) return;
    setCheck((c) => ({ ...c, running: true }));
    toast("Running readiness check…");
    setTimeout(() => {
      const score = Math.round((CHECK_AREAS.reduce((s, a) => s + a.val, 0) / CHECK_AREAS.length) * 100);
      setCheck({ run: true, running: false, score, recs: buildRecommendations(), at: "just now" });
      if (score >= 70) toast.success(`Readiness check complete — ${score}%`);
      else toast.warning(`Readiness check complete — ${score}%`);
    }, 1300);
  }

  /* ─────────────────────────── org / brand handlers ─────────────────────────── */

  const logoInputRef = useRef<HTMLInputElement>(null);
  function applyAccent(hex: string) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) { toast.warning("Enter a six-digit hex value, for example #2456D6"); return; }
    setBrand((b) => ({ ...b, accent: hex }));
    toast.success("Accent colour applied across the tenant");
  }
  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) { toast.warning("Keep the logo under 512 KB"); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { setBrand((b) => ({ ...b, logo: reader.result as string })); toast.success(`${file.name} set as your organization logo`); };
    reader.readAsDataURL(file);
    e.target.value = "";
  }
  async function saveOrgProfile() {
    if (!org.name.trim()) { toast.warning("Give the organization a name to continue"); return; }
    setOrgSaving(true);
    try {
      await apiClient.post(endpoint.auth.ims_setup, {
        orgName: org.name.trim(),
        companyName: org.name.trim(),
        primaryDomain: imsConfig?.primaryDomain || undefined,
        timezone: org.tz,
        policies: imsConfig?.policies,
        ssoConfiguration: imsConfig?.ssoConfiguration,
        jitEnabled: imsConfig?.jitEnabled,
        scimEnabled: imsConfig?.scimEnabled,
        ssoEnforced: imsConfig?.ssoEnforced,
        ssoProvider: imsConfig?.ssoProvider ?? undefined,
      });
      setOrg((o) => ({ ...o, saved: true }));
      toast.success("Organization profile saved");
    } catch (error) {
      toast.error("Unable to save organization profile", { description: error instanceof AxiosError ? error.response?.data?.message : "Please try again." });
    } finally {
      setOrgSaving(false);
    }
  }

  /* ─────────────────────────── team invite handlers ─────────────────────────── */

  function updateDraftRow(i: number, patch: Partial<{ email: string; role: string; perm: string }>) {
    setDraftRows((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addDraftRow() { setDraftRows((rows) => [...rows, { email: "", role: "Engineer", perm: "Responder" }]); }
  function removeDraftRow(i: number) {
    setDraftRows((rows) => { const next = rows.filter((_, idx) => idx !== i); return next.length ? next : [{ email: "", role: "Engineer", perm: "Responder" }]; });
  }
  function bulkApplyPerm(perm: string) {
    if (!perm) return;
    setDraftRows((rows) => rows.map((r) => ({ ...r, perm })));
    toast.success(`Every row set to ${perm}`);
  }
  function applyPasteRows() {
    const rows = parseBulkRows(pasteText);
    if (rows.length) {
      setDraftRows((prev) => { const merged = [...prev.filter((r) => r.email.trim()), ...rows]; return merged.length ? merged : prev; });
      toast.success(`${rows.length} row${rows.length === 1 ? "" : "s"} added to the list`);
    } else {
      toast.warning("No valid addresses found in that list");
    }
    setPasteText("");
  }
  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseBulkRows(String(reader.result || ""));
      if (rows.length) {
        setDraftRows((prev) => { const merged = [...prev.filter((r) => r.email.trim()), ...rows]; return merged.length ? merged : prev; });
        toast.success(`${rows.length} row${rows.length === 1 ? "" : "s"} loaded from ${file.name} — review, then send`);
      } else {
        toast.warning(`No valid addresses in ${file.name}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }
  async function sendInvites() {
    const rows = draftRows.filter((r) => r.email.trim());
    if (!rows.length) { toast.warning("Add at least one email address"); return; }
    const bad = rows.find((r) => !isValidEmail(r.email));
    if (bad) { toast.warning(`${bad.email} is not a valid address`); return; }
    setSendingInvites(true);
    let sent = 0, failed = 0, dupe = 0;
    const added: Invite[] = [];
    for (const row of rows) {
      if (invites.some((i) => i.email.toLowerCase() === row.email.trim().toLowerCase())) { dupe++; continue; }
      try {
        await apiClient.post(endpoint.auth.invite_member, { inviteEmail: row.email.trim(), role: mapPermToRole(row.perm) });
        added.push({ email: row.email.trim(), role: row.role, perm: row.perm, when: "just now" });
        sent++;
      } catch {
        failed++;
      }
    }
    setSendingInvites(false);
    if (added.length) setInvites((prev) => [...prev, ...added]);
    setDraftRows([{ email: "", role: "Engineer", perm: "Responder" }]);
    if (sent > 0 && failed === 0) toast.success(`${sent} invitation${sent > 1 ? "s" : ""} sent${dupe ? `, ${dupe} already invited` : ""}`);
    else if (sent > 0) toast.warning(`${sent} sent, ${failed} failed`);
    else if (dupe && !failed) toast.warning("Everyone on that list was already invited");
    else toast.error("Failed to send invites. Please try again.");
  }
  function updateInvitePerm(i: number, perm: string) {
    setInvites((list) => list.map((inv, idx) => (idx === i ? { ...inv, perm } : inv)));
    toast.success(`${invites[i].email} set to ${perm}`);
  }
  function removeInvite(i: number) {
    const gone = invites[i];
    setInvites((list) => list.filter((_, idx) => idx !== i));
    toast.warning(`Invitation to ${gone.email} withdrawn`);
  }

  /* ─────────────────────────── auth / SSO handlers ─────────────────────────── */

  function testIdp() {
    const idp = IDP.find((x) => x.id === openIdp);
    if (!idp) return;
    const miss = missingFields(idp.fields, idpDraft);
    if (miss.length) { toast.warning(`Fill in ${miss[0]} before testing`); return; }
    setIdpTesting(true);
    setTimeout(() => { setIdpTesting(false); toast.success(`Handshake with ${idp.nm} succeeded — metadata and claims verified`); }, 1100);
  }
  function saveIdp() {
    const idp = IDP.find((x) => x.id === openIdp);
    if (!idp) return;
    const miss = missingFields(idp.fields, idpDraft);
    if (miss.length) { toast.warning(`${miss[0]} is required`); return; }
    setAuth((a) => ({ ...a, idp: idp.id, params: { ...a.params, [idp.id]: idpDraft } }));
    toast.success(`${idp.nm} is now your identity provider`);
  }

  /* ─────────────────────────── stack / connector handlers ─────────────────────────── */

  function testConnection() {
    const name = openConn;
    if (!name || name === "__custom__") return;
    const fields = CONN_FIELDS[name] || [];
    const miss = missingFields(fields, connDraft);
    if (miss.length) { toast.warning(`${miss[0]} is required before testing`); return; }
    setConnTesting(name);
    setTimeout(() => { setConnTesting(null); toast.success(`Reached ${name} — credentials accepted`); }, 950);
  }
  function saveConnection() {
    const name = openConn;
    if (!name || name === "__custom__") return;
    const fields = CONN_FIELDS[name] || [];
    const miss = missingFields(fields, connDraft);
    if (miss.length) { toast.warning(`${miss[0]} is required`); return; }
    setConnSaving(name);
    setTimeout(() => {
      setCreds((c) => ({ ...c, [name]: connDraft }));
      setConnected((c) => ({ ...c, [name]: true }));
      setConnSaving(null);
      setOpenConn(null);
      toast.success(`${name} connected`);
    }, 700);
  }
  function disconnectConnection() {
    const name = openConn;
    if (!name || name === "__custom__") return;
    setConnected((c) => { const n = { ...c }; delete n[name]; return n; });
    setCreds((c) => { const n = { ...c }; delete n[name]; return n; });
    setOpenConn(null);
    toast.warning(`${name} disconnected`);
  }
  function testCustomConnector() {
    if (!/^https?:\/\//.test(customDraft.url || "")) { toast.warning("Enter a valid https endpoint first"); return; }
    setCustomTesting(true);
    setTimeout(() => { setCustomTesting(false); toast.success("Verification request delivered — 200 OK"); }, 950);
  }
  function createCustomConnector() {
    if (!customDraft.name.trim()) { toast.warning("Name the connector"); return; }
    if (!/^https?:\/\//.test(customDraft.url || "")) { toast.warning("Enter a valid https endpoint"); return; }
    if (customDraft.auth !== "None" && !customDraft.secret) { toast.warning("Add the token or secret for the auth method you chose"); return; }
    setCustom((c) => [...c, customDraft]);
    setOpenConn(null);
    toast.success(`${customDraft.name} created — Scrubbe will begin polling within a minute`);
  }
  function deleteCustomConnector(i: number) {
    const gone = custom[i];
    setCustom((c) => c.filter((_, idx) => idx !== i));
    toast.warning(`${gone.name} deleted`);
  }

  /* ─────────────────────────── discovery handlers ─────────────────────────── */

  function runDiscovery() {
    if (discovery.running) return;
    setDiscovery((d) => ({ ...d, running: true }));
    setDiscoverStepIdx(0);
    let i = 0;
    const tick = () => {
      if (i >= DISCOVERY_STEPS.length) {
        setDiscovery({ run: true, running: false, at: "just now", counts: { ...DISCOVERY_RESULTS, unowned: UNOWNED_SEED.slice() } });
        toast.success(`Discovery complete — ${DISCOVERY_RESULTS.services} services and ${DISCOVERY_RESULTS.assets} assets found`);
        return;
      }
      i++;
      setDiscoverStepIdx(i);
      setTimeout(tick, 380);
    };
    setTimeout(tick, 260);
  }
  function rerunDiscovery() {
    setDiscovery({ run: false, running: false, at: null, counts: null });
    openItem("discover");
    setTimeout(runDiscovery, 150);
  }

  /* ─────────────────────────── catalog handlers ─────────────────────────── */

  function assignOwner(nm: string, group: string) {
    if (!group) return;
    setCatalogOwners((o) => ({ ...o, [nm]: group }));
    toast.success(`${nm} assigned to ${group}`);
  }
  function clearOwner(nm: string) {
    setCatalogOwners((o) => { const n = { ...o }; delete n[nm]; return n; });
    toast.warning(`Owner cleared for ${nm}`);
  }
  function mergeDuplicates() {
    setCatalogMerged(true);
    setDiscovery((d) => (d.counts ? { ...d, counts: { ...d.counts, services: d.counts.services - DUPES.length } } : d));
    toast.success(`${DUPES.length} duplicates merged`);
  }

  /* ─────────────────────────── groups handlers ─────────────────────────── */

  function toggleGroup(g: string) {
    if (groups.includes(g)) {
      const used = Object.values(catalogOwners).includes(g);
      if (used) { toast.warning(`${g} owns services in the catalog — reassign those first`); return; }
      setGroups((gs) => gs.filter((x) => x !== g));
      toast.warning(`${g} removed`);
    } else {
      setGroups((gs) => [...gs, g]);
      toast.success(`${g} added`);
    }
  }
  function addCustomGroup() {
    const v = newGroup.trim();
    if (!v) { toast.warning("Name the group first"); return; }
    if (groups.includes(v)) { toast.warning(`${v} already exists`); return; }
    setGroups((gs) => [...gs, v]);
    setNewGroup("");
    toast.success(`${v} added`);
  }

  /* ─────────────────────────── policies handlers ─────────────────────────── */

  function setSeverityMinutes(id: string, key: "resp" | "res", val: number) {
    setPolicies((p) => {
      const next = { ...p, [key]: { ...p[key], [id]: val }, saved: false };
      if (next.res[id] <= next.resp[id]) { toast.warning(`${id} resolution must be longer than its response target`); return p; }
      return next;
    });
  }
  function resetPolicyDefaults() {
    setPolicies((p) => ({ ...p, resp: { P0: 5, P1: 15, P2: 60, P3: 240 }, res: { P0: 60, P1: 240, P2: 1440, P3: 4320 } }));
    toast.success("Response and resolution targets restored to the Scrubbe defaults");
  }
  const policiesChanged = SEVERITIES.some((sv) => policies.resp[sv.id] !== sv.resp || policies.res[sv.id] !== sv.res);
  function savePolicies() {
    setPolicies((p) => ({ ...p, saved: true }));
    toast.success(`Incident policies saved — next incident is ${policies.prefix}-${"0".repeat(Math.max(0, policies.pad - 1))}1`);
  }

  /* ─────────────────────────── rules / AI / notify / oncall handlers ─────────────────────────── */

  function saveRules() {
    setRules((r) => ({ ...r, saved: true }));
    if (ai.saved && ai.threshold < rules.confidence) setAi((a) => ({ ...a, threshold: rules.confidence }));
    toast.success("Operational rules saved — agents now work inside them");
  }
  function toggleAgent(id: string, checked: boolean) {
    setAi((a) => ({ ...a, agents: { ...a.agents, [id]: checked ? (a.agents[id] || "Suggest only") : false }, saved: false }));
    toast(`${AGENTS.find((g) => g.id === id)?.nm} ${checked ? "enabled" : "disabled"}`);
  }
  function setAgentMode(id: string, mode: string) {
    setAi((a) => {
      if (!a.agents[id]) return a;
      if (mode === "Execute autonomously" && !rules.saved) toast.warning("Set your operational rules in step 09 before granting autonomy");
      return { ...a, agents: { ...a.agents, [id]: mode } };
    });
  }
  function saveAi(thresholdInput: number, limitInput: number) {
    const floor = rules.saved ? rules.confidence : 50;
    if (!Object.values(ai.agents).some(Boolean)) { toast.warning("Turn on at least one agent before saving"); return; }
    const t = Math.max(floor, Math.min(100, thresholdInput || floor));
    const l = Math.max(1, limitInput || 12);
    setAi((a) => ({ ...a, threshold: t, limit: l, saved: true }));
    toast.success(`AI configured — ${Object.values(ai.agents).filter(Boolean).length} agents live at ${t}% threshold`);
  }
  function saveOncall() {
    if (!oncall.provider) { toast.warning("Choose where on-call comes from"); return; }
    if (!oncall.rotations.length) { toast.warning("Add at least one rotation"); return; }
    setOncall((o) => ({ ...o, saved: true }));
    toast.success("On-call saved — escalation has somewhere to land");
  }
  function addRotation() {
    if (!rotDraft.nm.trim()) { toast.warning("Name the rotation first"); return; }
    setOncall((o) => ({ ...o, rotations: [...o.rotations, { ...rotDraft, nm: rotDraft.nm.trim() }], saved: false }));
    toast.success(`${rotDraft.nm.trim()} rotation added`);
    setRotDraft({ nm: "", group: groups[0] || "SRE", pattern: "Weekly hand-off" });
  }
  function removeRotation(i: number) {
    const gone = oncall.rotations[i];
    setOncall((o) => ({ ...o, rotations: o.rotations.filter((_, idx) => idx !== i) }));
    toast.warning(`${gone.nm} removed`);
  }

  /* ─────────────────────────── finale + drawers ─────────────────────────── */

  const ready = check.run && check.score >= 70;
  useEffect(() => {
    if (drawer === "incident") {
      setIncidentDraft({
        title: "", sev: "P2",
        service: discovery.counts?.unowned[0]?.nm || "payments-api",
        group: groups.includes(policies.responders) ? policies.responders : groups[0] || "",
      });
    }
  }, [drawer]); // eslint-disable-line react-hooks/exhaustive-deps

  function submitIncident() {
    if (!incidentDraft.title.trim()) { toast.warning("Give the incident a summary"); return; }
    const n = String(incidents.length + 1).padStart(policies.pad, "0");
    const inc: Incident = { id: `${policies.prefix}-${n}`, title: incidentDraft.title.trim(), sev: incidentDraft.sev, service: incidentDraft.service, group: incidentDraft.group };
    setIncidents((list) => [inc, ...list]);
    setDrawer(null);
    toast.success(`${inc.id} raised — routed to ${inc.group}`);
    setTimeout(() => document.getElementById("finale-mount")?.scrollIntoView({ behavior: "smooth" }), 50);
  }
  function copySetupSummary() {
    const lines = [`${org.name || "Your organization"} — Scrubbe operational readiness ${Math.round(overall * 100)}%`, ""];
    DOMAINS.forEach((d) => lines.push(`${d}: ${Math.round(domainScore(d) * 100)}%`));
    lines.push("", `Integrations: ${Object.keys(connected).filter((k) => connected[k]).join(", ") || "none"}`);
    lines.push(`Agents: ${AGENTS.filter((a) => ai.agents[a.id]).map((a) => a.nm).join(", ") || "none"}`);
    copyText(lines.join("\n"), "Setup summary copied");
  }

  const activeAgents = AGENTS.filter((a) => ai.agents[a.id]);
  const liveChannelCount = CHANNELS.filter((c) => (channels as Record<string, boolean | string>)[c.id]).length;

  /* ─────────────────────────────────── body renderers ─────────────────────────────────── */

  function renderOrgBody() {
    const ratio = contrast(brand.accent, readableInk(brand.accent));
    return (
      <>
        <Sheet title="Brand & appearance" right={<span className="text-[11px] text-zinc-400 hidden sm:inline">Applies across the whole tenant, instantly</span>}>
          <div className="flex flex-wrap gap-6">
            <div>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Organization logo</span>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className={cn("mt-2 flex h-[88px] w-[88px] flex-col items-center justify-center gap-1 rounded-2xl border-[1.5px] border-dashed text-zinc-400 overflow-hidden", brand.logo ? "border-solid border-zinc-200 dark:border-white/15 bg-white dark:bg-grayscrubbe-900 p-2" : "border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-white/[0.03] hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white")}
              >
                {brand.logo ? (
                  <img src={brand.logo} alt="Current logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black font-ibm font-black text-2xl">{initials(org.name)}</span>
                )}
              </button>
              <div className="mt-2 flex gap-1.5">
                <button type="button" onClick={() => logoInputRef.current?.click()} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Upload</button>
                {brand.logo && <button type="button" onClick={() => { setBrand((b) => ({ ...b, logo: null })); toast.warning("Logo removed — back to initials"); }} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Remove</button>}
              </div>
              <input ref={logoInputRef} type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" className="hidden" onChange={handleLogoFile} />
              <p className="mt-1.5 max-w-[170px] text-[11px] text-zinc-400">SVG or PNG, square, at least 128px. Falls back to your initials.</p>
            </div>
            <div className="flex-1 min-w-[230px]">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Accent colour</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ACCENTS.map((c) => (
                  <button key={c} type="button" aria-label={`Accent ${c}`} onClick={() => applyAccent(c)} style={{ background: c }} className={cn("h-7 w-7 rounded-lg border-2 transition-transform hover:scale-105", brand.accent.toLowerCase() === c.toLowerCase() ? "border-black dark:border-white" : "border-transparent")} />
                ))}
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <input type="color" value={brand.accent} onChange={(e) => setBrand((b) => ({ ...b, accent: e.target.value }))} className="h-[34px] w-[34px] cursor-pointer rounded-lg border border-zinc-200 dark:border-white/15 bg-transparent p-0" aria-label="Custom accent colour" />
                <input type="text" value={brand.accent.toUpperCase()} maxLength={7} onChange={(e) => setBrand((b) => ({ ...b, accent: e.target.value }))} className="w-[104px] rounded-lg border border-zinc-200 dark:border-white/15 bg-transparent px-2.5 py-2 font-mono text-[12.5px]" aria-label="Accent hex value" />
                <button type="button" onClick={() => applyAccent(brand.accent)} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1.5 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Apply</button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] p-3">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-zinc-400">Preview</span>
                <button type="button" onClick={() => toast.success("That is how a primary action will look to your team")} style={{ background: brand.accent, color: readableInk(brand.accent) }} className="rounded-lg px-3 py-1.5 text-[12.5px] font-bold">Primary action</button>
                <Badge tone="green">Configured</Badge>
                <Meter frac={0.6} size="sm" />
                <span className="ml-auto" />
                <Badge tone={ratio >= 4.5 ? "green" : ratio >= 3 ? "amber" : "red"}>{ratio.toFixed(1)}:1 {ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA large only" : "below AA"}</Badge>
              </div>
              <p className="mt-2 text-[11px] text-zinc-400">Label colour on the accent is chosen automatically for the higher contrast ratio, and checked against WCAG AA as you pick.</p>
            </div>
          </div>
        </Sheet>

        <Sheet
          title="Organization details"
          footer={<>
            <button type="button" onClick={saveOrgProfile} disabled={orgSaving} className="inline-flex items-center gap-1.5 rounded-lg bg-IMSLightGreen px-3.5 py-1.5 text-[12.5px] font-bold text-white disabled:opacity-60">
              {orgSaving && <Loader2 size={13} className="animate-spin" />} Save profile
            </button>
            <span className="text-[12px] text-zinc-500">{org.saved ? "Saved · applied across the tenant" : "Not saved yet"}</span>
          </>}
        >
          <FieldGrid>
            <Input label="Organization name" value={org.name} onChange={(e) => setOrg((o) => ({ ...o, name: e.target.value }))} />
            <Select label="Time zone" value={org.tz} options={TZS.map((t) => ({ value: t, label: t }))} onChange={(e) => setOrg((o) => ({ ...o, tz: String(e.target.value) }))} />
            <Select label="Default language" value={org.lang} options={LANGS.map((t) => ({ value: t, label: t }))} onChange={(e) => setOrg((o) => ({ ...o, lang: String(e.target.value) }))} />
            <Select label="Industry" value={org.industry} options={INDUSTRIES.map((t) => ({ value: t, label: t }))} onChange={(e) => setOrg((o) => ({ ...o, industry: String(e.target.value) }))} />
            <Input label="Business hours start" type="time" value={org.hoursFrom} onChange={(e) => setOrg((o) => ({ ...o, hoursFrom: e.target.value }))} />
            <Input label="Business hours end" type="time" value={org.hoursTo} onChange={(e) => setOrg((o) => ({ ...o, hoursTo: e.target.value }))} />
            <Select label="Operational calendar" value={org.calendar} options={CALS.map((t) => ({ value: t, label: t }))} onChange={(e) => setOrg((o) => ({ ...o, calendar: String(e.target.value) }))} />
            <Input label="Tenant address" readOnly value={`${slugify(org.name)}.scrubbe.com`} className="font-mono text-[12.5px] bg-zinc-50 dark:bg-white/[0.03]" />
          </FieldGrid>
        </Sheet>
      </>
    );
  }

  function renderTeamBody() {
    const draftCount = draftRows.filter((d) => d.email.trim()).length;
    return (
      <>
        <Sheet
          title="Add people"
          right={<span className="flex gap-1.5">
            <button type="button" onClick={() => setPasteOpen((v) => !v)} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Paste a list</button>
            <button type="button" onClick={() => csvInputRef.current?.click()} className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5"><Upload size={11} /> CSV</button>
            <input ref={csvInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvFile} />
          </span>}
          footer={<>
            <button type="button" onClick={sendInvites} disabled={sendingInvites} className="inline-flex items-center gap-1.5 rounded-lg bg-IMSLightGreen px-3.5 py-1.5 text-[12.5px] font-bold text-white disabled:opacity-60">
              {sendingInvites && <Loader2 size={13} className="animate-spin" />} Send {draftCount || ""} invitation{draftCount === 1 ? "" : "s"}
            </button>
            <span className="text-[12px] text-zinc-500">SCIM provisioning turns on by itself once SSO is live, and takes over from this list.</span>
          </>}
        >
          <div className="hidden sm:grid grid-cols-[1.7fr_1fr_1fr_auto] gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400 pb-1.5">
            <span>Email address</span><span>Team role</span><span>Permission</span><span />
          </div>
          <div className="flex flex-col gap-2">
            {draftRows.map((row, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[1.7fr_1fr_1fr_auto] gap-2 items-center">
                <input type="email" value={row.email} onChange={(e) => updateDraftRow(i, { email: e.target.value })} placeholder={`name@${slugify(org.name)}.com`} className="h-[34px] rounded-md border border-zinc-200 dark:border-white/15 bg-transparent px-2.5 text-[13px]" />
                <Select value={row.role} options={ROLES.map((r) => ({ value: r, label: r }))} onChange={(e) => updateDraftRow(i, { role: String(e.target.value) })} />
                <Select value={row.perm} options={PERMS.map((p) => ({ value: p.v, label: p.v }))} onChange={(e) => updateDraftRow(i, { perm: String(e.target.value) })} />
                <button type="button" onClick={() => removeDraftRow(i)} disabled={draftRows.length === 1} className="h-8 w-8 shrink-0 flex items-center justify-center rounded-md border border-zinc-200 dark:border-white/15 text-zinc-400 hover:text-red-500 hover:border-red-200 disabled:opacity-40"><X size={13} /></button>
              </div>
            ))}
          </div>
          {pasteOpen && (
            <div className="mt-3">
              <TextArea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={4} className="font-mono text-[12.5px]" placeholder={"sarah@northwind.com, SRE, Operator\npaschal@northwind.com, Manager, Approver\ndev@northwind.com"} />
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <button type="button" onClick={applyPasteRows} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Add these to the list</button>
                <span className="text-[11.5px] text-zinc-400">One per line. Role and permission are optional — anything missing falls back to Engineer / Responder.</span>
              </div>
            </div>
          )}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <button type="button" onClick={addDraftRow} className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5"><Plus size={12} /> Add another row</button>
            <span className="ml-auto flex items-center gap-2 text-[12px]">
              <span className="text-zinc-500">Apply one permission to all</span>
              <Select value="" placeholder="Choose…" options={PERMS.map((p) => ({ value: p.v, label: p.v }))} onChange={(e) => bulkApplyPerm(String(e.target.value))} />
            </span>
          </div>
        </Sheet>

        {invites.length ? (
          <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-white/10">
            <table className="w-full text-[13px]">
              <thead><tr className="bg-zinc-50 dark:bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                <th className="px-3 py-2">Member</th><th className="px-3 py-2">Team role</th><th className="px-3 py-2">Permission</th><th className="px-3 py-2">Status</th><th className="px-3 py-2" />
              </tr></thead>
              <tbody>
                {invites.map((inv, i) => (
                  <tr key={i} className="border-t border-zinc-200 dark:border-white/10">
                    <td className="px-3 py-2 font-semibold">{inv.email}</td>
                    <td className="px-3 py-2">{inv.role}</td>
                    <td className="px-3 py-2"><Select value={inv.perm} options={PERMS.map((p) => ({ value: p.v, label: p.v }))} onChange={(e) => updateInvitePerm(i, String(e.target.value))} /></td>
                    <td className="px-3 py-2"><Badge tone="blue">Invited {inv.when}</Badge></td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button type="button" onClick={() => toast.success(`Invitation re-sent to ${inv.email}`)} className="rounded-md border border-zinc-200 dark:border-white/15 px-2 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5 mr-1.5">Resend</button>
                      <button type="button" onClick={() => removeInvite(i)} className="rounded-md border border-zinc-200 dark:border-white/15 px-2 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-zinc-50 dark:bg-white/[0.03] px-4 py-3.5 text-[12.5px] text-zinc-500">No invitations yet. Fill in one row and send — you can add the rest in bulk later.</div>
        )}
      </>
    );
  }

  function renderAuthBody() {
    const chosen = openIdp ? IDP.find((x) => x.id === openIdp) : null;
    const callbackUrl = `https://auth.scrubbe.com/sso/${slugify(org.name)}/callback`;
    const entityUrl = `https://auth.scrubbe.com/sso/${slugify(org.name)}/metadata`;
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {IDP.map((pv) => (
            <button key={pv.id} type="button" onClick={() => setOpenIdp(openIdp === pv.id ? null : pv.id)} className={cn("flex items-center gap-2.5 rounded-lg border p-3 text-left", openIdp === pv.id || auth.idp === pv.id ? "border-black dark:border-white bg-zinc-50 dark:bg-white/5" : "border-zinc-200 dark:border-white/10 hover:border-zinc-400")}>
              <span className="h-[26px] w-[26px] rounded-[7px] flex items-center justify-center font-ibm font-extrabold text-[11px] text-white shrink-0" style={{ background: pv.c }}>{pv.mk}</span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold">{pv.nm}</span>
                <span className="block text-[11px] text-zinc-400">{auth.idp === pv.id ? "Configured" : pv.sub}</span>
              </span>
            </button>
          ))}
        </div>

        {chosen && (
          <div className="mt-4 rounded-lg border border-black dark:border-white overflow-hidden">
            <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-white/[0.03] px-3.5 py-2.5 border-b border-zinc-200 dark:border-white/10">
              <span className="h-[28px] w-[28px] rounded-lg flex items-center justify-center font-ibm font-extrabold text-xs text-white" style={{ background: chosen.c }}>{chosen.mk}</span>
              <span className="font-semibold text-[13.5px]">{chosen.nm}</span>
              <span className="ml-auto flex items-center gap-2">
                {auth.idp === chosen.id ? <Badge tone="green">Active</Badge> : <Badge tone="neutral">Not saved</Badge>}
                <button type="button" onClick={() => setOpenIdp(null)} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Close</button>
              </span>
            </div>
            <div className="p-4">
              <div className="rounded-lg border border-zinc-200 dark:border-white/10 overflow-hidden">
                <div className="bg-zinc-50 dark:bg-white/[0.03] px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-white/10">Give these to Scrubbe</div>
                <div className="p-3.5"><FieldGrid>{chosen.fields.map((f) => <DynamicField key={f.k} field={f} value={idpDraft[f.k]} onChange={(v) => setIdpDraft((d) => ({ ...d, [f.k]: v }))} />)}</FieldGrid></div>
              </div>
              <div className="mt-3 rounded-lg border border-zinc-200 dark:border-white/10 overflow-hidden">
                <div className="bg-zinc-50 dark:bg-white/[0.03] px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-white/10">Give these to your identity provider</div>
                <div className="divide-y divide-zinc-200 dark:divide-white/10">
                  {[["Assertion consumer / callback URL", callbackUrl], ["Service provider entity ID", entityUrl], ["Required claims", "email · given_name · family_name · groups"]].map(([label, val]) => (
                    <div key={label} className="flex items-center gap-3 px-3.5 py-2.5">
                      <span className="min-w-0"><span className="block text-[12.5px] font-semibold">{label}</span><span className="block font-mono text-[11.5px] text-zinc-500 break-all">{val}</span></span>
                      {label !== "Required claims" && <button type="button" onClick={() => copyText(val)} className="ml-auto shrink-0 rounded-md border border-zinc-200 dark:border-white/15 px-2 py-1 text-[11px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Copy</button>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button type="button" onClick={testIdp} disabled={idpTesting} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1.5 text-[12px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-60">{idpTesting && <Loader2 size={12} className="animate-spin" />}{idpTesting ? "Testing…" : "Test connection"}</button>
                <button type="button" onClick={saveIdp} className="rounded-md bg-IMSLightGreen px-2.5 py-1.5 text-[12px] font-bold text-white">{auth.idp === chosen.id ? "Update" : "Save and activate"}</button>
                <span className="ml-auto text-[11px] text-zinc-400">Secrets are encrypted at rest and never shown again after saving.</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          <SwitchRow label="Allow password login" note="Keep this on until every member has signed in through your provider at least once." checked={auth.password} disabled={auth.ssoOnly} onChange={(v) => { setAuth((a) => ({ ...a, password: v })); toast(v ? "Password login allowed" : "Password login switched off"); }} />
          <SwitchRow label="SSO only" note="Blocks every other route in. Turning this on switches password login off." checked={auth.ssoOnly} disabled={!auth.idp} onChange={(v) => { setAuth((a) => ({ ...a, ssoOnly: v, password: v ? false : a.password })); toast(v ? "SSO is now the only way in" : "SSO-only lifted"); }} />
          <SwitchRow label="Just-in-time provisioning" note="Create the account on first successful sign-in instead of waiting for an invitation." checked={auth.jit} disabled={!auth.idp} onChange={(v) => { setAuth((a) => ({ ...a, jit: v })); toast(v ? "Just-in-time provisioning on" : "Just-in-time provisioning off"); }} />
        </div>
        {!auth.idp && <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-white/[0.03] px-4 py-3 text-[12.5px] text-zinc-500">Pick a provider above and its parameters will appear. Anything SAML 2.0 or OIDC compliant works, including providers not listed.</div>}
      </>
    );
  }

  function renderStackBody() {
    const liveCount = Object.values(connected).filter(Boolean).length + custom.length;
    return (
      <>
        {INTEGRATIONS.map((g) => (
          <div key={g.cat} className="mt-4 first:mt-0">
            <h5 className="flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400">
              {g.cat} {g.req && <Badge tone="neutral">needed for discovery</Badge>}
            </h5>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {g.items.map((n) => {
                const on = !!connected[n];
                return (
                  <button key={n} type="button" onClick={() => setOpenConn(openConn === n ? null : n)} className={cn("flex items-center gap-2.5 rounded-lg border p-2.5 text-left", openConn === n ? "border-black dark:border-white" : "border-zinc-200 dark:border-white/10 hover:border-zinc-400")}>
                    <VendorMark name={n} />
                    <span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] font-semibold">{n}</span><span className="block font-mono text-[10px] uppercase tracking-wide text-zinc-400">{on ? "Connected" : "Not connected"}</span></span>
                    {on && <Check size={14} className="text-IMSLightGreen shrink-0" />}
                  </button>
                );
              })}
            </div>
            {g.items.includes(openConn || "") && renderConnPanel(openConn as string)}
          </div>
        ))}

        {custom.length > 0 && (
          <div className="mt-4">
            <h5 className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400">Your own connectors</h5>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {custom.map((c, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg border border-zinc-200 dark:border-white/10 p-2.5">
                  <span className="h-[26px] w-[26px] rounded-[7px] bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-ibm font-extrabold text-[11px] shrink-0">{(c.name || "CX").slice(0, 2).toUpperCase()}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] font-semibold">{c.name}</span><span className="block font-mono text-[10px] uppercase tracking-wide text-zinc-400">{c.auth}</span></span>
                  <button type="button" onClick={() => deleteCustomConnector(i)} className="shrink-0 text-zinc-400 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {openConn === "__custom__" && (
          <div className="mt-4 rounded-lg border border-black dark:border-white overflow-hidden">
            <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-white/[0.03] px-3.5 py-2.5 border-b border-zinc-200 dark:border-white/10">
              <Plug size={14} /><span className="font-semibold text-[13.5px]">New custom connector</span>
              <button type="button" onClick={() => setOpenConn(null)} className="ml-auto rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Close</button>
            </div>
            <div className="p-4">
              <FieldGrid>
                <Input label="Connector name" value={customDraft.name} onChange={(e) => setCustomDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Internal CMDB" />
                <Input label="Endpoint URL" type="url" value={customDraft.url} onChange={(e) => setCustomDraft((d) => ({ ...d, url: e.target.value }))} placeholder="https://api.northwind.com/v1/assets" />
                <Select label="Direction" value={customDraft.method} options={["Scrubbe pulls from this endpoint", "This endpoint pushes to Scrubbe", "Both directions"].map((o) => ({ value: o, label: o }))} onChange={(e) => setCustomDraft((d) => ({ ...d, method: String(e.target.value) }))} />
                <Select label="Authentication" value={customDraft.auth} options={["Bearer token", "Basic auth", "API key header", "HMAC signature", "None"].map((o) => ({ value: o, label: o }))} onChange={(e) => setCustomDraft((d) => ({ ...d, auth: String(e.target.value) }))} />
                <Input label="Token, key, or secret" type="password" value={customDraft.secret} onChange={(e) => setCustomDraft((d) => ({ ...d, secret: e.target.value }))} />
                <Input label="Events to exchange" value={customDraft.events} onChange={(e) => setCustomDraft((d) => ({ ...d, events: e.target.value }))} placeholder="asset.created, asset.updated, incident.raised" />
              </FieldGrid>
              <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-white/[0.03] px-3.5 py-2.5 text-[12px] text-zinc-500">Inbound calls must be signed and are rate limited to 600 requests a minute. Scrubbe will send a verification request to the endpoint before saving.</div>
              <div className="mt-3 flex items-center gap-2">
                <button type="button" onClick={testCustomConnector} disabled={customTesting} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1.5 text-[12px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-60">{customTesting && <Loader2 size={12} className="animate-spin" />}{customTesting ? "Sending…" : "Send verification request"}</button>
                <button type="button" onClick={createCustomConnector} className="rounded-md bg-IMSLightGreen px-2.5 py-1.5 text-[12px] font-bold text-white">Create connector</button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button type="button" onClick={() => setOpenConn(openConn === "__custom__" ? null : "__custom__")} className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5"><Plus size={12} /> Add custom connector or webhook</button>
          <span className="text-[12px] text-zinc-400">Anything with an HTTP API can feed the inventory.</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 rounded-lg border border-dashed border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-white/[0.03] p-3">
          <span className="w-full text-[12px] font-semibold text-zinc-600 dark:text-zinc-300">To finish this step, connect at least one of each:</span>
          {REQ_CATS.map((c) => (
            <span key={c} className={cn("inline-flex items-center gap-1.5 text-[12px]", catCovered(c) ? "text-IMSLightGreen font-semibold" : "text-zinc-400")}>{catCovered(c) ? <Check size={12} /> : <ChevronRight size={11} />} {c}</span>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-zinc-500">{liveCount} connection{liveCount === 1 ? "" : "s"} live. Add the rest whenever you like — each one widens what discovery can see.</p>
      </>
    );
  }

  function renderConnPanel(name: string) {
    const on = !!connected[name];
    const fields = CONN_FIELDS[name] || [];
    return (
      <div className="mt-2.5 rounded-lg border border-black dark:border-white overflow-hidden">
        <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-white/[0.03] px-3.5 py-2.5 border-b border-zinc-200 dark:border-white/10">
          <VendorMark name={name} size={30} /><span className="font-semibold text-[13.5px]">{name}</span>
          <span className="ml-auto flex items-center gap-2">
            {on ? <Badge tone="green">Connected</Badge> : <Badge tone="neutral">Not connected</Badge>}
            <button type="button" onClick={() => setOpenConn(null)} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Close</button>
          </span>
        </div>
        <div className="p-4">
          <FieldGrid>{fields.map((f) => <DynamicField key={f.k} field={f} value={connDraft[f.k]} onChange={(v) => setConnDraft((d) => ({ ...d, [f.k]: v }))} />)}</FieldGrid>
          <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-white/[0.03] px-3.5 py-2.5 text-[12px] text-zinc-500">Scrubbe requests read-only scopes. Nothing in {name} is written to unless you grant an agent execute rights in step 09.</div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button type="button" onClick={testConnection} disabled={connTesting === name} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1.5 text-[12px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-60">{connTesting === name && <Loader2 size={12} className="animate-spin" />}{connTesting === name ? "Testing…" : "Test connection"}</button>
            <button type="button" onClick={saveConnection} disabled={connSaving === name} className="inline-flex items-center gap-1.5 rounded-md bg-IMSLightGreen px-2.5 py-1.5 text-[12px] font-bold text-white disabled:opacity-70">{connSaving === name && <Loader2 size={12} className="animate-spin" />}{connSaving === name ? "Connecting…" : on ? "Update credentials" : `Connect ${name}`}</button>
            {on && <button type="button" onClick={disconnectConnection} className="ml-auto rounded-md border border-red-200 dark:border-red-500/30 px-2.5 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">Disconnect</button>}
          </div>
        </div>
      </div>
    );
  }

  function discoveryCallout() {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-white/10 border-l-[3px] border-l-black dark:border-l-white bg-zinc-50 dark:bg-white/[0.03] p-4">
        <h5 className="flex items-center gap-2 font-ibm font-extrabold text-[13.5px]"><Radar size={15} /> How discovery actually works</h5>
        <p className="mt-2 text-[13px] text-zinc-600 dark:text-zinc-300">You do not draw a map of your estate, and you do not install anything on your servers. Scrubbe reads what your existing tools already know, through the read-only connections you made in step 04, and assembles the picture itself.</p>
        <ul className="mt-2.5 flex flex-col gap-2">
          {[
            ["Assets come from your cloud and cluster APIs.", "Scrubbe lists what exists in the accounts, subscriptions, projects, and clusters you connected — instances, functions, buckets, load balancers, databases, certificates, secrets."],
            ["Services come from your code and your deployments.", "Repository manifests, Helm charts, and pipeline definitions say what is meant to be running. Your observability tool says what is actually running."],
            ["Dependencies come from real traffic, not from a diagram.", "Scrubbe reads the traces and service maps your observability stack already collects, and records a dependency only where one service genuinely calls another."],
            ["Everything is fingerprinted.", "Each asset gets a stable identity that survives restarts, redeployments, and changes of IP address."],
          ].map(([b, rest]) => (
            <li key={b} className="flex gap-2.5 text-[12.5px] text-zinc-600 dark:text-zinc-300"><Check size={13} className="mt-0.5 shrink-0 text-IMSLightGreen" /><span><b className="font-semibold text-black dark:text-white">{b}</b> {rest}</span></li>
          ))}
        </ul>
        <div className="my-3.5 h-px bg-zinc-200 dark:bg-white/10" />
        <ul className="flex flex-col gap-2">
          {[
            [Lock, "It is read-only.", "Discovery creates, modifies, and deletes nothing. Write access is a separate decision you make in step 09."],
            [Clock, "It does not stop when it finishes.", "The first pass takes a few seconds. After that Scrubbe keeps watching for anything new."],
            [Users, "One thing it cannot work out is ownership.", "No system can reliably infer who to wake at 3am for a given service. That is step 06."],
          ].map(([IconC, b, rest]: any) => (
            <li key={b} className="flex gap-2.5 text-[12.5px] text-zinc-600 dark:text-zinc-300"><IconC size={13} className="mt-0.5 shrink-0 text-zinc-400" /><span><b className="font-semibold text-black dark:text-white">{b}</b> {rest}</span></li>
          ))}
        </ul>
      </div>
    );
  }

  function renderDiscoverBody() {
    const ready = catCovered("Cloud");
    if (discovery.counts) {
      const left = discovery.counts.unowned.filter((u) => !catalogOwners[u.nm]).length;
      return (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-200 dark:bg-white/10 overflow-hidden">
            {DISCOVERY_STEPS.map(([nm, k]) => (
              <div key={k} className="bg-white dark:bg-grayscrubbe-900 p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">{nm}</div>
                <div className="mt-1 font-mono text-[19px] font-bold">{discovery.counts![k].toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-white/[0.03] px-4 py-3 text-[12.5px] text-zinc-500">Discovery ran {discovery.at} and is still running — new resources appear within about a minute of being created. {left} service{left === 1 ? "" : "s"} still need{left === 1 ? "s" : ""} an owner, which is step 06.</div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button type="button" onClick={rerunDiscovery} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1.5 text-[12px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Run a full re-scan</button>
            <button type="button" onClick={() => openItem("catalog", true)} className="rounded-md bg-IMSLightGreen px-2.5 py-1.5 text-[12px] font-bold text-white">Review the catalog</button>
            <button type="button" onClick={() => setDiscoverExplainOpen((v) => !v)} className="ml-auto text-[12px] font-semibold text-zinc-500 hover:text-black dark:hover:text-white">How this works</button>
          </div>
          {discoverExplainOpen && <div className="mt-3">{discoveryCallout()}</div>}
        </>
      );
    }
    return (
      <>
        {discoveryCallout()}
        <div className="mt-4 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] p-4">
          {DISCOVERY_STEPS.map(([nm, k], i) => {
            const on = i < discoverStepIdx;
            return (
              <div key={k} className="flex items-center gap-2.5 py-1 text-[13px]">
                <span className={cn("w-4 flex", on ? "text-IMSLightGreen" : "text-zinc-400")}>{on ? <Check size={13} /> : <ChevronRight size={12} />}</span>
                <span>{nm}</span>
                <span className="ml-auto font-mono text-[13px] font-bold">{on ? DISCOVERY_RESULTS[k].toLocaleString() : "—"}</span>
              </div>
            );
          })}
          <div className="mt-3 h-[5px] rounded-full bg-zinc-200 dark:bg-white/10 overflow-hidden">
            <div className="h-full bg-IMSLightGreen transition-[width] duration-500" style={{ width: `${Math.round((discoverStepIdx / DISCOVERY_STEPS.length) * 100)}%` }} />
          </div>
        </div>
        {!ready && <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-white/[0.03] px-4 py-3 text-[12.5px] text-zinc-500">Connect a cloud provider in step 04 first — discovery reads your accounts through that connection.</div>}
        <div className="mt-3 flex items-center gap-2.5">
          <button type="button" onClick={runDiscovery} disabled={!ready || discovery.running} className="inline-flex items-center gap-1.5 rounded-md bg-IMSLightGreen px-3 py-1.5 text-[12.5px] font-bold text-white disabled:opacity-50">
            {discovery.running ? <Loader2 size={13} className="animate-spin" /> : <Radar size={13} />} {discovery.running ? "Scanning…" : "Run discovery"}
          </button>
          {ready && <span className="text-[12px] text-zinc-400">Read-only. Nothing in your accounts is changed.</span>}
        </div>
      </>
    );
  }

  function renderCatalogBody() {
    if (!discovery.counts) {
      return (
        <>
          <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.03] px-4 py-3 text-[12.5px] text-zinc-500">Run discovery in step 05 and the catalog fills itself in. There is nothing to review until then.</div>
          <button type="button" onClick={() => openItem("discover", true)} className="mt-3 rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1.5 text-[12px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Go to discovery</button>
        </>
      );
    }
    const targets = discovery.counts.unowned;
    const left = targets.filter((t) => !catalogOwners[t.nm]).length;
    const opts = groups.length ? groups : GROUPS_ALL.slice(0, 3);
    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-200 dark:bg-white/10 overflow-hidden">
          {[["Services", discovery.counts.services], ["Assets", discovery.counts.assets], ["Awaiting owner", left], ["Possible duplicates", catalogMerged ? 0 : DUPES.length]].map(([k, v]) => (
            <div key={k as string} className="bg-white dark:bg-grayscrubbe-900 p-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">{k}</div>
              <div className={cn("mt-1 font-mono text-[19px] font-bold", k === "Awaiting owner" && (v ? "text-amber-600 dark:text-amber-400" : "text-IMSLightGreen"), k === "Possible duplicates" && (v ? "text-amber-600 dark:text-amber-400" : "text-IMSLightGreen"))}>{v as number}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-zinc-200 dark:border-white/10 divide-y divide-zinc-200 dark:divide-white/10 overflow-hidden">
          {targets.map((t) => {
            const owner = catalogOwners[t.nm];
            return (
              <div key={t.nm} className={cn("flex items-center gap-3 px-3.5 py-2.5", owner && "bg-IMSLightGreen/[0.04]")}>
                <span className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", owner ? "bg-IMSLightGreen/10 text-IMSLightGreen" : "bg-zinc-100 dark:bg-white/5 text-zinc-400")}>{owner ? <Check size={14} /> : <Layers size={14} />}</span>
                <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{t.nm}</span><span className="block text-[11px] text-zinc-400">{t.hint}</span></span>
                <Badge tone={t.tier === "Tier 0" ? "red" : t.tier === "Tier 1" ? "amber" : "neutral"}>{t.tier}</Badge>
                {owner ? (
                  <span className="flex items-center gap-1.5"><Badge tone="green">{owner}</Badge><button type="button" onClick={() => clearOwner(t.nm)} className="rounded-md border border-zinc-200 dark:border-white/15 px-2 py-1 text-[11px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Change</button></span>
                ) : (
                  <Select value="" placeholder="Assign owner…" options={opts.map((g) => ({ value: g, label: g }))} onChange={(e) => assignOwner(t.nm, String(e.target.value))} />
                )}
              </div>
            );
          })}
        </div>
        {!catalogMerged && (
          <div className="mt-3 flex items-center gap-3 flex-wrap rounded-lg bg-zinc-50 dark:bg-white/[0.03] px-4 py-3 text-[12.5px] text-zinc-500">
            <span>Discovery found {DUPES.length} likely duplicates: {DUPES.map(([a, b]) => `${a} / ${b}`).join(", ")}.</span>
            <button type="button" onClick={mergeDuplicates} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Merge all {DUPES.length}</button>
          </div>
        )}
        <p className="mt-3 text-[12px] text-zinc-500">{left ? `${left} service${left === 1 ? "" : "s"} still need${left === 1 ? "s" : ""} an owner.` : "Every discovered service has an owner."}</p>
      </>
    );
  }

  function renderGroupsBody() {
    return (
      <>
        <div className="flex flex-wrap gap-1.5">
          {Array.from(new Set([...GROUPS_ALL, ...groups])).map((g) => {
            const on = groups.includes(g);
            return (
              <button key={g} type="button" onClick={() => toggleGroup(g)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px]", on ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "border-zinc-200 dark:border-white/15 hover:border-black dark:hover:border-white")}>
                {on ? <Check size={11} /> : <Plus size={11} />} {g}
              </button>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 items-end">
          <Input label="Add your own group" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="e.g. Data Platform" />
          <button type="button" onClick={addCustomGroup} className="h-[34px] inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-white/15 px-3 text-[12.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5"><Plus size={12} /> Add group</button>
        </div>
        <p className="mt-3 text-[12px] text-zinc-500">{groups.length} group{groups.length === 1 ? "" : "s"} active. Three or more is enough to route incidents sensibly.</p>
      </>
    );
  }

  function renderPoliciesBody() {
    const preview = `${policies.prefix}-${"0".repeat(Math.max(0, policies.pad - 1))}1`;
    return (
      <>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-white/10">
          <table className="w-full text-[13px] min-w-[560px]">
            <thead><tr className="bg-zinc-50 dark:bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              <th className="px-3 py-2 w-[190px]">Severity</th><th className="px-3 py-2">Definition</th><th className="px-3 py-2 w-[160px]">Respond within</th><th className="px-3 py-2 w-[160px]">Resolve within</th>
            </tr></thead>
            <tbody>
              {SEVERITIES.map((sv) => (
                <tr key={sv.id} className="border-t border-zinc-200 dark:border-white/10">
                  <td className="px-3 py-2"><span className="flex items-center gap-2 font-bold"><i className="block h-2.5 w-2.5 rounded-sm" style={{ background: sv.colour }} /><span className="font-mono">{sv.id}</span> {sv.nm}</span></td>
                  <td className="px-3 py-2 text-zinc-500">{sv.note}</td>
                  <td className="px-3 py-2"><Select value={String(policies.resp[sv.id])} options={RESP_OPTS.map((m) => ({ value: m, label: mins(m) }))} onChange={(e) => setSeverityMinutes(sv.id, "resp", Number(e.target.value))} /></td>
                  <td className="px-3 py-2"><Select value={String(policies.res[sv.id])} options={RES_OPTS.map((m) => ({ value: m, label: mins(m) }))} onChange={(e) => setSeverityMinutes(sv.id, "res", Number(e.target.value))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <span className="text-[12px] text-zinc-500">{policiesChanged ? "Edited from the Scrubbe defaults." : "These are the Scrubbe defaults. Most organizations keep them."}</span>
          {policiesChanged && <button type="button" onClick={resetPolicyDefaults} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Restore defaults</button>}
        </div>

        <Sheet title="Incident numbering">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PREFIXES.map((x) => (
              <button key={x.v} type="button" onClick={() => setPolicies((p) => ({ ...p, prefix: x.v, saved: false }))} className={cn("rounded-lg border p-3 text-left", policies.prefix === x.v ? "border-black dark:border-white bg-zinc-50 dark:bg-white/5" : "border-zinc-200 dark:border-white/10 hover:border-zinc-400")}>
                <span className="font-mono text-[11px] font-bold text-zinc-400">{x.v}</span>
                <span className="block mt-0.5 font-semibold text-[13px]">{x.v}-000001</span>
                <span className="block mt-1 text-[11.5px] leading-snug text-zinc-500">{x.note}</span>
              </button>
            ))}
          </div>
          <FieldGrid className="mt-4">
            <Select label="Digits" value={String(policies.pad)} options={[4, 5, 6, 7].map((n) => ({ value: n, label: `${n} digits` }))} onChange={(e) => setPolicies((p) => ({ ...p, pad: Number(e.target.value), saved: false }))} />
            <div>
              <span className="block mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">Next incident will be</span>
              <div className="font-mono text-lg font-bold pt-1">{preview}</div>
            </div>
          </FieldGrid>
        </Sheet>

        <Sheet
          title="Routing & escalation"
          footer={<>
            <button type="button" onClick={savePolicies} className="rounded-lg bg-IMSLightGreen px-3.5 py-1.5 text-[12.5px] font-bold text-white">Save policies</button>
            <span className="text-[12px] text-zinc-500">{policies.saved ? "Saved · applied to every new incident" : "Unsaved changes"}</span>
          </>}
        >
          <FieldGrid>
            <div>
              <Select label="Escalation clock follows" value={policies.hours} options={["Organization business hours", "24/7 regardless of hours"].map((h) => ({ value: h, label: h }))} onChange={(e) => setPolicies((p) => ({ ...p, hours: String(e.target.value), saved: false }))} />
              <p className="mt-1.5 text-[11px] text-zinc-400">P0 always runs on a 24/7 clock regardless of this setting.</p>
            </div>
            <Select label="Default responders" value={policies.responders} options={(groups.length ? groups : GROUPS_ALL).map((g) => ({ value: g, label: g }))} onChange={(e) => setPolicies((p) => ({ ...p, responders: String(e.target.value), saved: false }))} />
          </FieldGrid>
          <div className="mt-4">
            <SwitchRow label="Auto-escalate on a missed response target" note="If nobody acknowledges inside the response target above, the incident moves to the next on-call level by itself." checked={policies.escalate} onChange={(v) => setPolicies((p) => ({ ...p, escalate: v, saved: false }))} />
          </div>
        </Sheet>
      </>
    );
  }

  function renderRulesBody() {
    const rows: [keyof typeof rules, string, string][] = [
      ["rollback", "Allow automated rollback", "An agent may return a service to its last verified release without waiting for a human."],
      ["approvals", "Require approval for production changes", "Every production action pauses for a named approver."],
      ["emergency", "Allow emergency approvals", "During a P1, a single on-call engineer can approve alone. Every use is recorded."],
      ["windows", "Restrict deployments to change windows", "Blocks production deploys outside your declared windows."],
    ];
    return (
      <>
        <div className="flex flex-col gap-2">
          {rows.map(([k, nm, note]) => (
            <SwitchRow key={k} label={nm} note={note} checked={Boolean(rules[k])} onChange={(v) => setRules((r) => ({ ...r, [k]: v, saved: false }))} />
          ))}
        </div>
        <div className="mt-3">
          <Select label="Who can execute production changes" value={rules.executor} options={["On-call engineer", "Service owner only", "Named approvers only", "Platform Engineering"].map((o) => ({ value: o, label: o }))} onChange={(e) => setRules((r) => ({ ...r, executor: String(e.target.value), saved: false }))} />
        </div>
        <div className="mt-4">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Minimum AI confidence before an agent may act</span>
          <div className="mt-2 flex items-center gap-3.5">
            <input type="range" min={50} max={100} step={5} value={rules.confidence} onChange={(e) => setRules((r) => ({ ...r, confidence: Number(e.target.value), saved: false }))} className="flex-1 accent-IMSLightGreen" />
            <span className="w-14 text-right font-mono text-[15px] font-bold">{rules.confidence}%</span>
          </div>
          <p className="mt-1.5 text-[11.5px] text-zinc-400">Below this line an agent recommends but never executes. Most organizations start at 90% and lower it as trust builds.</p>
        </div>
        <div className="mt-4 flex items-center gap-2.5">
          <button type="button" onClick={saveRules} className="rounded-lg bg-IMSLightGreen px-3.5 py-1.5 text-[12.5px] font-bold text-white">Save operational rules</button>
          <span className="text-[12px] text-zinc-500">{rules.saved ? "Saved · agents inherit these immediately" : "Not saved yet"}</span>
        </div>
      </>
    );
  }

  function renderAiBody() {
    const [thresholdStr, setThresholdStr] = [String(ai.threshold), (v: string) => setAi((a) => ({ ...a, threshold: Number(v) || a.threshold }))];
    return (
      <>
        <div className={cn("flex items-center gap-3.5 rounded-lg border p-3.5", ai.ezra ? "border-IMSLightGreen bg-IMSLightGreen/[0.06]" : "border-zinc-200 dark:border-white/10")}>
          <span className={cn("h-[30px] w-[30px] rounded-lg flex items-center justify-center shrink-0", ai.ezra ? "bg-IMSLightGreen text-white" : "bg-zinc-100 dark:bg-white/5 text-zinc-400")}><Sparkles size={15} /></span>
          <span className="flex-1 min-w-0"><span className="block text-[13.5px] font-semibold">Enable Ezra</span><span className="block text-xs text-zinc-500 dark:text-zinc-400">The operator your team talks to. Ezra coordinates the agents below and never acts outside your operational rules.</span></span>
          <Toggle checked={ai.ezra} onChange={(v) => { setAi((a) => ({ ...a, ezra: v, saved: v ? a.saved : false })); toast(v ? "Ezra enabled" : "Ezra switched off — agents are idle"); }} />
        </div>
        <div className={cn("mt-3 flex flex-col gap-2", !ai.ezra && "opacity-50 pointer-events-none")}>
          {AGENTS.map((g) => (
            <div key={g.id} className="flex items-center gap-3.5 rounded-lg border border-zinc-200 dark:border-white/10 px-3.5 py-3">
              <span className="flex-1 min-w-0"><span className="block text-[13.5px] font-semibold">{g.nm}</span><span className="block text-xs text-zinc-500 dark:text-zinc-400">{g.note}</span></span>
              <Select value={(ai.agents[g.id] as string) || "Suggest only"} options={AGENT_MODES.map((m) => ({ value: m, label: m }))} onChange={(e) => setAgentMode(g.id, String(e.target.value))} />
              <Toggle checked={Boolean(ai.agents[g.id])} onChange={(v) => toggleAgent(g.id, v)} />
            </div>
          ))}
        </div>
        <FieldGrid className="mt-4">
          <div>
            <Input label="Approval threshold" type="number" min={rules.saved ? rules.confidence : 50} max={100} defaultValue={thresholdStr} onChange={(e) => setThresholdStr(e.target.value)} />
            <p className="mt-1.5 text-[11px] text-zinc-400">Cannot fall below the {rules.saved ? rules.confidence : 50}% floor set in your operational rules.</p>
          </div>
          <Input label="Execution limit" type="number" min={1} max={200} defaultValue={String(ai.limit)} onChange={(e) => setAi((a) => ({ ...a, limit: Number(e.target.value) || a.limit }))} />
        </FieldGrid>
        <div className="mt-3 flex items-center gap-2.5">
          <button type="button" disabled={!ai.ezra} onClick={() => saveAi(ai.threshold, ai.limit)} className="rounded-lg bg-IMSLightGreen px-3.5 py-1.5 text-[12.5px] font-bold text-white disabled:opacity-50">Save AI configuration</button>
          <span className="text-[12px] text-zinc-500">{ai.ezra ? (ai.saved ? `Saved · ${activeAgents.length} agent${activeAgents.length === 1 ? "" : "s"} live` : "Turn on the agents you want, then save") : "Enable Ezra to configure agents"}</span>
        </div>
      </>
    );
  }

  function renderNotifyBody() {
    return (
      <>
        <div className="flex flex-col gap-2">
          {CHANNELS.map((ch) => {
            const blocked = ch.needs && !connected[ch.needs];
            return (
              <SwitchRow key={ch.id} label={ch.nm} note={blocked ? `Connect ${ch.needs} in step 04 first.` : ch.note} checked={Boolean((channels as Record<string, boolean | string>)[ch.id])} disabled={Boolean(blocked)}
                onChange={(v) => { setChannels((c) => ({ ...c, [ch.id]: v })); toast(`${ch.nm} ${v ? "enabled" : "disabled"}`); }} />
            );
          })}
        </div>
        {channels.webhook && (
          <div className="mt-3">
            <Input label="Webhook endpoint" type="url" value={channels.webhookUrl} onChange={(e) => setChannels((c) => ({ ...c, webhookUrl: e.target.value }))} placeholder="https://hooks.your-company.com/scrubbe" />
            <button type="button" onClick={() => {
              if (!/^https?:\/\//.test(channels.webhookUrl || "")) { toast.warning("Enter a valid https endpoint first"); return; }
              toast("Test event queued…");
              setTimeout(() => toast.success("Test event delivered — 200 OK"), 900);
            }} className="mt-1.5 rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Send test event</button>
          </div>
        )}
        <p className="mt-3 text-[12px] text-zinc-500">{liveChannelCount} channel{liveChannelCount === 1 ? "" : "s"} on. Notifications respect the escalation clock from step 08.</p>
      </>
    );
  }

  function renderOncallBody() {
    const providers = ["PagerDuty", "Opsgenie", "Scrubbe schedules"];
    const groupOpts = groups.length ? groups : GROUPS_ALL;
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {providers.map((pv) => {
            const blocked = (pv === "PagerDuty" || pv === "Opsgenie") && !connected[pv];
            return (
              <button key={pv} type="button" onClick={() => { if (blocked) { toast.warning(`Connect ${pv} in step 04 first`); return; } setOncall((o) => ({ ...o, provider: o.provider === pv ? null : pv, saved: false })); if (oncall.provider !== pv) toast.success(`${pv} selected as the on-call source`); }}
                className={cn("flex items-center gap-2.5 rounded-lg border p-3 text-left", oncall.provider === pv ? "border-black dark:border-white bg-zinc-50 dark:bg-white/5" : "border-zinc-200 dark:border-white/10 hover:border-zinc-400")}>
                <Clock size={15} className="shrink-0" />
                <span className="min-w-0"><span className="block text-[13px] font-semibold">{pv}</span><span className="block text-[11px] text-zinc-400">{blocked ? "Connect it in step 04" : pv === "Scrubbe schedules" ? "Built in, no integration needed" : "Schedules sync automatically"}</span></span>
              </button>
            );
          })}
        </div>
        {oncall.rotations.length > 0 && (
          <div className="mt-3 rounded-lg border border-zinc-200 dark:border-white/10 divide-y divide-zinc-200 dark:divide-white/10 overflow-hidden">
            {oncall.rotations.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-3.5 py-2.5">
                <Clock size={14} className="text-zinc-400 shrink-0" />
                <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{r.nm}</span><span className="block text-[11px] text-zinc-400">{r.group} · {r.pattern}</span></span>
                <button type="button" onClick={() => removeRotation(i)} className="rounded-md border border-zinc-200 dark:border-white/15 px-2 py-1 text-[11px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Remove</button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr_auto] gap-2 items-end">
          <Input label="Rotation name" value={rotDraft.nm} onChange={(e) => setRotDraft((d) => ({ ...d, nm: e.target.value }))} placeholder="e.g. Payments primary" />
          <Select label="Group" value={rotDraft.group} options={groupOpts.map((g) => ({ value: g, label: g }))} onChange={(e) => setRotDraft((d) => ({ ...d, group: String(e.target.value) }))} />
          <Select label="Pattern" value={rotDraft.pattern} options={["Weekly hand-off", "Daily hand-off", "Follow the sun"].map((p) => ({ value: p, label: p }))} onChange={(e) => setRotDraft((d) => ({ ...d, pattern: String(e.target.value) }))} />
          <button type="button" onClick={addRotation} className="h-[34px] inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-white/15 px-3 text-[12.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5"><Plus size={12} /> Add</button>
        </div>
        <FieldGrid className="mt-4">
          <Select label="Escalation levels" value={String(oncall.escalation)} options={[1, 2, 3, 4].map((n) => ({ value: n, label: `${n} level${n === 1 ? "" : "s"}` }))} onChange={(e) => setOncall((o) => ({ ...o, escalation: Number(e.target.value), saved: false }))} />
          <div>
            <Select label="Fallback group" value={oncall.fallback} options={groupOpts.map((g) => ({ value: g, label: g }))} onChange={(e) => setOncall((o) => ({ ...o, fallback: String(e.target.value), saved: false }))} />
            <p className="mt-1.5 text-[11px] text-zinc-400">Catches anything nobody acknowledges. This is the step that stops a P1 going nowhere.</p>
          </div>
        </FieldGrid>
        <div className="mt-3 flex items-center gap-2.5">
          <button type="button" onClick={saveOncall} className="rounded-lg bg-IMSLightGreen px-3.5 py-1.5 text-[12.5px] font-bold text-white">Save on-call setup</button>
          <span className="text-[12px] text-zinc-500">{oncall.saved ? `Saved · ${oncall.rotations.length} rotation(s) live` : "Pick a source and add at least one rotation"}</span>
        </div>
      </>
    );
  }

  function renderReadinessBody() {
    if (!check.run) {
      return (
        <>
          <div className="rounded-lg border border-zinc-200 dark:border-white/10 divide-y divide-zinc-200 dark:divide-white/10 overflow-hidden">
            {CHECK_AREAS.map((a) => (
              <div key={a.nm} className="flex items-center gap-3 px-3.5 py-2.5"><ChevronRight size={13} className="text-zinc-400" /><span className="flex-1 text-[13px] font-semibold">{a.nm}</span><Badge tone="neutral">Not checked</Badge></div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <button type="button" onClick={runCheck} disabled={check.running} className="inline-flex items-center gap-1.5 rounded-lg bg-IMSLightGreen px-3.5 py-1.5 text-[12.5px] font-bold text-white disabled:opacity-70">{check.running ? <Loader2 size={13} className="animate-spin" /> : <Gauge size={13} />} {check.running ? "Checking…" : "Run readiness check"}</button>
            <span className="text-[12px] text-zinc-500">Reads your live configuration. Takes a few seconds.</span>
          </div>
        </>
      );
    }
    return (
      <>
        <div className="flex flex-wrap items-center gap-5">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">Operational readiness</div>
            <div className={cn("font-mono font-bold text-[38px] leading-tight", check.score >= 90 ? "text-IMSLightGreen" : check.score >= 70 ? "" : "text-amber-600 dark:text-amber-400")}>{check.score}%</div>
          </div>
          <div><Meter frac={check.score / 100} /><div className="mt-2 text-[12px] text-zinc-400">Checked {check.at}</div></div>
        </div>
        <div className="mt-3 rounded-lg border border-zinc-200 dark:border-white/10 divide-y divide-zinc-200 dark:divide-white/10 overflow-hidden">
          {CHECK_AREAS.map((a) => (
            <div key={a.nm} className={cn("flex items-center gap-3 px-3.5 py-2.5", a.val >= 1 && "bg-IMSLightGreen/[0.04]")}>
              {a.val >= 1 ? <Check size={14} className="text-IMSLightGreen" /> : <TriangleAlert size={14} className="text-amber-500" />}
              <span className="flex-1 text-[13px] font-semibold">{a.nm}</span>
              <Badge tone={a.val >= 1 ? "green" : a.val > 0 ? "amber" : "red"}>{a.val >= 1 ? "Ready" : `${Math.round(a.val * 100)}%`}</Badge>
            </div>
          ))}
        </div>
        {check.recs.length ? (
          <>
            <h5 className="mt-5 font-ibm font-extrabold text-[13.5px]">Recommendations</h5>
            <div className="mt-2.5 rounded-lg border border-zinc-200 dark:border-white/10 divide-y divide-zinc-200 dark:divide-white/10 overflow-hidden">
              {check.recs.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-3.5 py-2.5">
                  <ChevronRight size={13} className="text-zinc-400" />
                  <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{r.t}</span><span className="block text-[11.5px] text-zinc-400">{r.why}</span></span>
                  <button type="button" onClick={() => openItem(r.go, true)} className="shrink-0 rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Fix now</button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-white/[0.03] px-4 py-3 text-[12.5px] text-zinc-500">No recommendations. Every area checked out.</div>
        )}
        <div className="mt-3 flex items-center gap-2.5">
          <button type="button" onClick={runCheck} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1.5 text-[12px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Run the check again</button>
          {check.score >= 70 && <button type="button" onClick={() => document.getElementById("finale-mount")?.scrollIntoView({ behavior: "smooth" })} className="rounded-md bg-IMSLightGreen px-2.5 py-1.5 text-[12px] font-bold text-white">Go to the last step</button>}
        </div>
      </>
    );
  }

  const BODY: Record<string, () => ReactNode> = {
    org: renderOrgBody, team: renderTeamBody, auth: renderAuthBody, stack: renderStackBody,
    discover: renderDiscoverBody, catalog: renderCatalogBody, groups: renderGroupsBody,
    policies: renderPoliciesBody, rules: renderRulesBody, ai: renderAiBody,
    notify: renderNotifyBody, oncall: renderOncallBody, readiness: renderReadinessBody,
  };

  /* ─────────────────────────────────── drawer content ─────────────────────────────────── */

  function drawerContent() {
    if (drawer === "account") {
      const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Account owner";
      return {
        title: fullName, sub: `Tenant administrator · ${org.name || "your organization"}`,
        body: (
          <div className="rounded-lg border border-zinc-200 dark:border-white/10 divide-y divide-zinc-200 dark:divide-white/10 overflow-hidden">
            <div className="px-3.5 py-2.5"><span className="block text-[13px] font-semibold">Role</span><span className="block text-[11.5px] text-zinc-400">Administrator — full configuration rights</span></div>
            <div className="px-3.5 py-2.5"><span className="block text-[13px] font-semibold">Tenant</span><span className="block font-mono text-[11.5px] text-zinc-400">{slugify(org.name)}.scrubbe.com</span></div>
            <div className="px-3.5 py-2.5"><span className="block text-[13px] font-semibold">Readiness</span><span className="block text-[11.5px] text-zinc-400">{Math.round(overall * 100)}% across {DOMAINS.length} areas</span></div>
            <div className="px-3.5 py-2.5"><span className="block text-[13px] font-semibold">Team</span><span className="block text-[11.5px] text-zinc-400">{invites.length} invitation{invites.length === 1 ? "" : "s"} sent</span></div>
          </div>
        ),
        foot: (
          <div className="mt-5 flex justify-end gap-2 border-t border-zinc-200 dark:border-white/10 pt-4">
            <button type="button" onClick={() => { setDrawer(null); openItem("team", true); }} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1.5 text-[12px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Invite someone</button>
            <button type="button" onClick={() => setDrawer(null)} className="rounded-md bg-IMSLightGreen px-2.5 py-1.5 text-[12px] font-bold text-white">Close</button>
          </div>
        ),
      };
    }
    if (drawer === "incident") {
      const services = discovery.counts ? discovery.counts.unowned.map((u) => u.nm) : ["payments-api"];
      return {
        title: "Raise an incident", sub: "This creates a real record and routes it using your configuration",
        body: (
          <div className="flex flex-col gap-3.5">
            <Input label="Summary" value={incidentDraft.title} onChange={(e) => setIncidentDraft((d) => ({ ...d, title: e.target.value }))} placeholder="e.g. Checkout latency above target" />
            <Select label="Severity" value={incidentDraft.sev} options={SEVERITIES.map((s) => ({ value: s.id, label: `${s.id} ${s.nm} — respond ${mins(policies.resp[s.id])}, resolve ${mins(policies.res[s.id])}` }))} onChange={(e) => setIncidentDraft((d) => ({ ...d, sev: String(e.target.value) }))} />
            <Select label="Affected service" value={incidentDraft.service} options={services.map((s) => ({ value: s, label: s }))} onChange={(e) => setIncidentDraft((d) => ({ ...d, service: String(e.target.value) }))} />
            <Select label="Assign to" value={incidentDraft.group} options={groups.map((g) => ({ value: g, label: g }))} onChange={(e) => setIncidentDraft((d) => ({ ...d, group: String(e.target.value) }))} />
            <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.03] px-3.5 py-2.5 text-[12px] text-zinc-500">Notifications will go to {CHANNELS.filter((c) => (channels as Record<string, boolean | string>)[c.id]).map((c) => c.nm).join(", ") || "no channel yet"}. {activeAgents.length} agent{activeAgents.length === 1 ? "" : "s"} will attach automatically.</div>
          </div>
        ),
        foot: (
          <div className="mt-5 flex justify-end gap-2 border-t border-zinc-200 dark:border-white/10 pt-4">
            <button type="button" onClick={() => setDrawer(null)} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1.5 text-[12px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Cancel</button>
            <button type="button" onClick={submitIncident} className="rounded-md bg-IMSLightGreen px-2.5 py-1.5 text-[12px] font-bold text-white">Raise incident</button>
          </div>
        ),
      };
    }
    if (drawer === "studio") {
      return {
        title: "Command Studio", sub: "What your agents are cleared to do right now",
        body: (
          <div className="flex flex-col gap-3.5">
            <div className="rounded-lg border border-zinc-200 dark:border-white/10 divide-y divide-zinc-200 dark:divide-white/10 overflow-hidden">
              {activeAgents.length ? activeAgents.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-3.5 py-2.5 bg-IMSLightGreen/[0.04]"><Sparkles size={14} className="text-IMSLightGreen shrink-0" /><span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{a.nm}</span><span className="block text-[11.5px] text-zinc-400">{a.note}</span></span><Badge tone="blue">{ai.agents[a.id] as string}</Badge></div>
              )) : <div className="px-3.5 py-2.5"><span className="block text-[13px] font-semibold">No agents enabled</span><span className="block text-[11.5px] text-zinc-400">Turn some on in step 10.</span></div>}
            </div>
            <div className="rounded-lg border border-zinc-200 dark:border-white/10 divide-y divide-zinc-200 dark:divide-white/10 overflow-hidden">
              <div className="flex items-center gap-3 px-3.5 py-2.5"><span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">Confidence floor</span><span className="block text-[11.5px] text-zinc-400">Below this an agent recommends but never acts</span></span><span className="font-mono font-bold text-[13px]">{ai.threshold}%</span></div>
              <div className="flex items-center gap-3 px-3.5 py-2.5"><span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">Execution limit</span><span className="block text-[11.5px] text-zinc-400">Agent actions per hour, tenant-wide</span></span><span className="font-mono font-bold text-[13px]">{ai.limit}</span></div>
              <div className="flex items-center gap-3 px-3.5 py-2.5"><span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">Approval required</span><span className="block text-[11.5px] text-zinc-400">From your operational rules</span></span><Badge tone={rules.approvals ? "green" : "amber"}>{rules.approvals ? "Yes" : "No"}</Badge></div>
              <div className="flex items-center gap-3 px-3.5 py-2.5"><span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">Automated rollback</span><span className="block text-[11.5px] text-zinc-400">From your operational rules</span></span><Badge tone={rules.rollback ? "green" : "neutral"}>{rules.rollback ? "Allowed" : "Blocked"}</Badge></div>
            </div>
          </div>
        ),
        foot: (
          <div className="mt-5 flex justify-end gap-2 border-t border-zinc-200 dark:border-white/10 pt-4">
            <button type="button" onClick={() => { setDrawer(null); openItem("rules", true); }} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1.5 text-[12px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Change these rules</button>
            <button type="button" onClick={() => setDrawer(null)} className="rounded-md bg-IMSLightGreen px-2.5 py-1.5 text-[12px] font-bold text-white">Close</button>
          </div>
        ),
      };
    }
    if (drawer === "explore") {
      const mods: [string, string, string][] = [
        ["Asset Inventory", "cube", discovery.counts ? `${discovery.counts.assets} assets synchronized` : "Waiting on discovery"],
        ["Service Catalog", "layers", discovery.counts ? `${discovery.counts.services} services, ${discovery.counts.deps} dependencies` : "Waiting on discovery"],
        ["Incident Management", "alert", `${groups.length} groups routing · ${policies.prefix}-${"0".repeat(Math.max(0, policies.pad - 1))}1 next`],
        ["Change Intelligence", "sliders", connected["GitHub"] || connected["GitLab"] ? "Reading your source control" : "Connect source control to enable"],
        ["Command Studio", "spark", `${activeAgents.length} agent${activeAgents.length === 1 ? "" : "s"} live`],
        ["Governance", "shield", rules.saved ? "Operational rules enforced" : "Rules not saved yet"],
      ];
      return {
        title: "What is now unlocked", sub: `${org.name || "Your organization"} · ${Math.round(overall * 100)}% configured`,
        body: (
          <>
            <div className="rounded-lg border border-zinc-200 dark:border-white/10 divide-y divide-zinc-200 dark:divide-white/10 overflow-hidden">
              {mods.map(([nm, ic, note]) => (
                <div key={nm} className="flex items-center gap-3 px-3.5 py-2.5"><Ic name={ic} size={14} className="text-zinc-400 shrink-0" /><span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{nm}</span><span className="block text-[11.5px] text-zinc-400">{note}</span></span></div>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-white/[0.03] px-3.5 py-2.5 text-[12px] text-zinc-500">Each of these reads the configuration you just completed. Nothing here needs setting up separately.</div>
          </>
        ),
        foot: (
          <div className="mt-5 flex justify-end gap-2 border-t border-zinc-200 dark:border-white/10 pt-4">
            <button type="button" onClick={copySetupSummary} className="rounded-md border border-zinc-200 dark:border-white/15 px-2.5 py-1.5 text-[12px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5">Copy setup summary</button>
            <button type="button" onClick={() => setDrawer(null)} className="rounded-md bg-IMSLightGreen px-2.5 py-1.5 text-[12px] font-bold text-white">Close</button>
          </div>
        ),
      };
    }
    return null;
  }
  const dc = drawerContent();

  /* ─────────────────────────────────── render ─────────────────────────────────── */

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-ibm [&_.mb-4]:!mb-0">
      <header className="sticky top-0 z-[70] flex h-[60px] items-center gap-6 border-b border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 px-5">
        <div className="flex items-center gap-2 shrink-0">
          <img src="/IMS/blacklogo.png" alt="Scrubbe" className="h-6 object-contain block dark:hidden" />
          <img src="/IMS/whitelogo.png" alt="Scrubbe" className="h-6 object-contain hidden dark:block" />
        </div>
        <div className="ml-auto flex items-center gap-3.5">
          <button type="button" onClick={() => setDrawer("account")} aria-label="Account" className="h-[30px] w-[30px] rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-ibm font-extrabold text-xs">
            {initials(`${user?.firstName || ""} ${user?.lastName || ""}`)}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-[1320px] px-6 pt-8">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-100 to-sky-100 dark:from-emerald-500/10 dark:to-sky-500/10 px-7 py-9 sm:px-10 sm:py-11">
          <h1 className="font-ibm text-[30px] sm:text-[36px] font-black leading-[1.1] tracking-tight text-balance text-black dark:text-white">Welcome to Scrubbe</h1>
          <p className="mt-3.5 max-w-[640px] text-[14.5px] leading-relaxed text-zinc-700 dark:text-zinc-300">Complete the items below to enable incident detection, AI collaboration, governance, and production automation. Nothing here is sequential — work in any order, and come back whenever you like.</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button type="button" onClick={() => openItem("readiness", true)} className="rounded-lg border border-zinc-300 dark:border-white/20 bg-white dark:bg-grayscrubbe-900 px-4 py-2.5 text-[13px] font-bold text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5">Run Readiness Check</button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1320px] px-6 py-8 grid grid-cols-1 lg:grid-cols-[262px_1fr] gap-8 items-start">
        <aside className="lg:sticky lg:top-[76px] flex flex-col gap-3 lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto">
          <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 p-4">
            <h4 className="flex items-center gap-2 font-ibm font-extrabold text-[13.5px]"><Gauge size={15} /> Readiness dashboard</h4>
            <p className="mt-0.5 text-[11.5px] text-zinc-400">Live scores by area. Come back to this at any time.</p>
            <div className="mt-2.5 flex flex-col gap-1">
              {DOMAINS.map((d) => {
                const sc = domainScore(d);
                return (
                  <button key={d} type="button" onClick={() => { const first = ITEMS.find((i) => i.dom === d && statusOf(i.id) !== "done") || ITEMS.find((i) => i.dom === d); if (first) openItem(first.id, true); }} className="w-full text-left rounded-lg px-1.5 py-1.5 hover:bg-zinc-50 dark:hover:bg-white/5">
                    <div className="flex items-center gap-2"><span className="flex-1 truncate text-[12.5px] font-semibold">{d}</span><span className={cn("font-mono text-[11.5px] font-bold", sc >= 1 ? "text-IMSLightGreen" : "text-zinc-500")}>{sc >= 1 ? "Ready" : `${Math.round(sc * 100)}%`}</span></div>
                    <div className="mt-1"><Meter frac={sc} size="xs" /></div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-white/10 flex items-baseline justify-between"><span className="text-xs font-semibold">Overall</span><span className="font-mono font-bold text-[19px]">{Math.round(overall * 100)}%</span></div>
          </div>
          <div className="hidden lg:block rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 p-4">
            <h4 className="font-ibm font-extrabold text-[13.5px]">Checklist</h4>
            <p className="mt-0.5 text-[11.5px] text-zinc-400">14 items · jump to any of them</p>
            <div className="mt-2 flex flex-col">
              {ITEMS.map((i) => {
                const done = i.weight ? statusOf(i.id) === "done" : i.id === "readiness" ? check.run : incidents.length > 0;
                return (
                  <button key={i.id} type="button" onClick={() => openItem(i.id, true)} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-zinc-50 dark:hover:bg-white/5">
                    <span className="w-4 font-mono text-[10.5px] text-zinc-400">{String(i.n).padStart(2, "0")}</span>
                    <span className={cn("flex-1 min-w-0 truncate text-[12.5px]", done ? "text-black dark:text-white font-medium" : "text-zinc-500")}>{i.title}</span>
                    <span className={cn("h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0", done ? "bg-IMSLightGreen border-IMSLightGreen text-white" : "border-zinc-300 dark:border-white/15")}>{done && <Check size={9} />}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main>
          <div className="flex flex-col gap-3">
            {CHECKLIST_ITEMS.map((item) => {
              const st = item.weight ? statusOf(item.id) : "todo";
              const p = item.weight ? progressOf(item.id) : 0;
              const open = openItems.has(item.id);
              return (
                <section key={item.id} id={`item-${item.id}`} className={cn(
                  "scroll-mt-20 rounded-xl border bg-white dark:bg-grayscrubbe-900 transition-colors border-l-2",
                  st === "done" ? "border-l-IMSLightGreen" : st === "part" ? "border-l-amber-500" : "border-l-transparent",
                  open ? "border-zinc-300 dark:border-white/20 shadow-sm" : "border-zinc-200 dark:border-white/10",
                )}>
                  <button type="button" onClick={() => toggleItem(item.id)} aria-expanded={open} className="w-full flex items-start gap-3.5 px-4 sm:px-5 py-4 text-left">
                    <span className="hidden sm:block font-mono text-[11.5px] font-bold text-zinc-400 w-5 pt-0.5">{String(item.n).padStart(2, "0")}</span>
                    <span className={cn("w-[22px] h-[22px] rounded-full border flex items-center justify-center shrink-0 mt-px", st === "done" ? "bg-IMSLightGreen border-IMSLightGreen text-white" : st === "part" ? "border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-500/10" : "border-zinc-300 dark:border-white/15 text-transparent")}>
                      {st === "part" ? <ChevronRight size={11} /> : <Check size={12} />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2 flex-wrap font-ibm font-extrabold text-[15px] sm:text-[15.5px]">
                        {item.title}
                        {st === "done" && <Badge tone="green">Configured</Badge>}
                        {st === "part" && <Badge tone="amber">{Math.round(p * 100)}%</Badge>}
                        {st === "todo" && <Badge tone="neutral">Not configured</Badge>}
                      </span>
                      <span className="block mt-0.5 text-[12.5px] sm:text-[13px] text-zinc-500 dark:text-zinc-400">{item.blurb}</span>
                    </span>
                    <span className="flex items-center gap-3 pt-0.5 shrink-0">
                      {item.weight > 0 && <Pips weight={item.weight} />}
                      <ChevronDown size={15} className={cn("text-zinc-400 transition-transform", open && "rotate-180")} />
                    </span>
                  </button>
                  {open && (
                    <div className="px-4 sm:px-5 pb-5 sm:pl-[68px] border-t border-zinc-100 dark:border-white/5">
                      {item.why && <p className="max-w-[640px] pt-4 pb-1 text-[13px] text-zinc-500 dark:text-zinc-400">{item.why}</p>}
                      {BODY[item.id]?.()}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <div className="relative mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-grayscrubbe-900 p-5 sm:p-6">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-IMSLightGreen" />
            <h3 className="flex items-center gap-2.5 flex-wrap font-ibm font-extrabold text-[16px]">You won&apos;t be asked to configure these</h3>
            <p className="mt-1 max-w-[640px] text-[12.5px] text-zinc-400">Scrubbe derives them from the systems you connect. Hand-maintaining this kind of model is how CMDBs go stale, so we don&apos;t ask you to.</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {AUTO_PANEL.map((a) => (
                <div key={a.nm} className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] p-3.5">
                  <div className="flex items-center gap-2 text-[13px] font-bold"><Ic name={a.ic} size={14} /> {a.nm}</div>
                  <div className="mt-1.5 text-[12px] text-zinc-500 dark:text-zinc-400">{a.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div id="finale-mount" className="mt-6 scroll-mt-20">
            <div className={cn("rounded-xl p-7 sm:p-8", ready ? "bg-black text-white" : "border border-dashed border-zinc-300 dark:border-white/15 bg-white dark:bg-grayscrubbe-900")}>
              <span className={cn("font-mono text-[11px] font-semibold uppercase tracking-[0.09em]", ready ? "text-white/60" : "text-zinc-400")}>14 · Start your first incident</span>
              <h3 className="mt-2 font-ibm text-2xl font-black tracking-tight">{ready ? (incidents.length ? "Your organization is operational." : "Everything is in place.") : "One check away"}</h3>
              <p className={cn("mt-2 max-w-[620px] text-sm", ready ? "text-white/70" : "text-zinc-500")}>
                {ready
                  ? incidents.length
                    ? `You raised ${incidents.length} incident${incidents.length === 1 ? "" : "s"} from this page. ${org.name || "Your organization"} is running on Scrubbe — ${activeAgents.length} agent${activeAgents.length === 1 ? "" : "s"} watching, ${groups.length} groups routing, ${discovery.counts?.services ?? 0} services in the catalog.`
                    : `${org.name || "Your organization"} is configured and ready. Raise a first incident to see the whole thing move — detection, routing, agents, and approvals in one run.`
                  : "Run the operational readiness check in step 13. It needs to clear 70% before the platform hands over."}
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <button type="button" disabled={!ready} onClick={() => setDrawer("incident")} className={cn("inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold disabled:opacity-40", ready ? "bg-IMSLightGreen text-white" : "bg-zinc-100 dark:bg-white/5")}><TriangleAlert size={14} /> Raise incident</button>
                <button type="button" disabled={!ready} onClick={() => setDrawer("studio")} className={cn("inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-bold disabled:opacity-40", ready ? "border-white/25 hover:bg-white/10" : "border-zinc-200 dark:border-white/15")}><Sparkles size={14} /> Open Command Studio</button>
                <button type="button" disabled={!ready} onClick={() => setDrawer("explore")} className={cn("inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-bold disabled:opacity-40", ready ? "border-white/25 hover:bg-white/10" : "border-zinc-200 dark:border-white/15")}><Layers size={14} /> Explore platform</button>
                {!ready && <button type="button" onClick={() => openItem("readiness", true)} className="rounded-lg bg-IMSLightGreen px-4 py-2.5 text-[13px] font-bold text-white">Go to the readiness check</button>}
              </div>
              {incidents.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/15 flex flex-col gap-1">
                  {incidents.map((i) => (
                    <div key={i.id} className="flex items-center gap-3 py-1.5 text-[13px]">
                      <span className="font-mono font-bold">{i.id}</span><span className="flex-1">{i.title}</span>
                      <Badge tone={i.sev === "P0" ? "red" : i.sev === "P1" ? "amber" : "blue"}>{i.sev}</Badge>
                      <span className="text-[12px] opacity-60">routed to {i.group}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => router.push("/incident")} className="text-[12.5px] font-semibold text-zinc-400 hover:text-black dark:hover:text-white">Skip for now — go to dashboard</button>
          </div>
        </main>
      </div>

      <SideModal isOpen={!!drawer} onClose={() => setDrawer(null)} title={dc?.title || ""} subTitle={dc?.sub}>
        {dc?.body}
        {dc?.foot}
      </SideModal>
    </div>
  );
}
