"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  Check,
  Clock3,
  Download,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/IMS/DashboardHeader";
import Button from "@/components/ui/Button1";
import { CatIcon } from "./settingsIcons";
import {
  CATMAP,
  CATS,
  DEFAULTS,
  GROUPS,
  LEDGER_KEY,
  LedgerEntry,
  NOTIFS_KEY,
  NOTIF_ICON,
  NOTIF_TINT,
  NotifItem,
  QUICK,
  SEED_NOTIFS,
  STORAGE_KEY,
  TINTS,
  ago,
  downloadText,
  fmtTs,
} from "./settings.data";
import { CategoryCard, GroupHeader, StatTile } from "./SettingsPrimitives";
import { SettingsDrawer } from "./SettingsDrawer";
import { FORM_RENDERERS } from "./SettingsForms";
import useGetConfig from "@/hooks/useConfig";
import { ImsConfig } from "@/types/ims-config.type";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

function safeGet<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
function safeSet(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* storage unavailable */
  }
}
function structuredCloneSafe<T>(v: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(v)
    : JSON.parse(JSON.stringify(v));
}

function summarize(catId: string, d: any): string {
  switch (catId) {
    case "organization":
      return `Profile updated · ${d.units.length} business units, ${d.locations.length} locations`;
    case "users": {
      const act = d.list.filter((m: any) => m.active).length;
      return `${d.list.length} members · ${act} active · default role ${d.defaultRole}`;
    }
    case "roles":
      return `${d.list.length} roles configured`;
    case "authentication":
      return `${d.providers.filter((p: any) => p.on).length} identity providers · MFA ${d.mfaPolicy.toLowerCase()}`;
    case "appearance":
      return `Branding updated · ${d.theme} theme`;
    case "services":
      return `${d.list.length} services defined`;
    case "environments":
      return `${d.list.length} environments`;
    case "workflows":
      return "Transition controls updated";
    case "orules":
      return `Ceiling ${d.maxAutomation} · ${d.list.filter((x: any) => x.on).length} of ${d.list.length} rules active`;
    case "sla":
      return `SLA targets updated · SLO ${d.sloTarget}%`;
    case "incidentpolicies":
      return `Numbering ${d.numberPrefix} · major at ${d.majorAtSeverity} · war room at ${d.warRoomAtSeverity}`;
    case "assets":
      return `${d.list.length} assets registered`;
    case "automation":
      return `${d.pauseAll ? "PAUSED · " : ""}${d.jobs.filter((j: any) => j.on).length} of ${d.jobs.length} jobs on`;
    case "quality":
      return `Min score ${d.minScore}% · ${d.checks.filter((c: any) => c.on).length} checks`;
    case "agents":
      return `${d.list.filter((a: any) => a.on).length} agents active · remediation ${d.requireApprovalRemediation ? "gated" : "auto"}`;
    case "ai":
      return `Ezra ${d.ezra ? "on" : "off"} · confidence ${d.confidence}%`;
    case "playbooks":
      return `${d.list.filter((p: any) => p.on).length} of ${d.list.length} playbooks enabled`;
    case "aimodels":
      return `Primary ${d.primary} · fallback ${d.fallback}`;
    case "causal":
      return `Correlation ${d.correlationWindow}m · depth ${d.maxSignalDepth}`;
    case "integrations":
      return `${d.list.filter((x: any) => x.on).length} connectors connected`;
    case "notifications":
      return `Channels: ${["email", "sms", "push", "slack"].filter((k) => d[k]).join(", ")}`;
    case "delivery":
      return `Delivery template updated · ${d.channel}`;
    case "status":
      return `${d.enabled ? "Status page live" : "Status page in maintenance"} · ${d.maintenance?.length || 0} maintenance windows`;
    case "security":
      return `SSO ${d.ssoOn ? "on" : "off"} · 2FA ${d.enforce2fa ? "enforced" : "optional"}`;
    case "retention":
      return `Retention: incidents ${d.incidents}d, audit ${d.audit}d`;
    case "audit":
      return `Audit retention ${d.retention} days`;
    case "apikeys":
      return `${d.list.length} active keys`;
    case "decisions":
      return `${d.chains.filter((c: any) => c.on).length} approval chains · ${d.requireApprovalToExecute ? "gated" : "open"}`;
    case "compliance":
      return `${d.frameworks.filter((f: any) => f.on).length} frameworks${d.legalHold ? " · legal hold ON" : ""}`;
    case "developer":
      return `${d.webhooks.filter((w: any) => w.on).length} webhooks · ${d.oauthApps.filter((a: any) => a.on).length} OAuth apps${d.mcpOn ? " · MCP on" : ""}`;
    case "system":
      return `v${d.version}${d.maintenanceMode ? " · maintenance mode" : ` · ${d.services.filter((s: any) => s.status === "Operational").length}/${d.services.length} healthy`}`;
    case "billing":
      return `${d.plan} plan · ${d.seats} seats`;
    default:
      return "Settings updated";
  }
}

// Overlays the real IMS config onto the (mock-seeded) settings state, wherever
// a category has a confident, well-typed real-data equivalent. Fields that
// don't have a clean home yet (the richer SSO/SAML shape under
// `ssoConfiguration`, and the standalone `policies` flags) are deliberately
// left alone rather than force-mapped somewhere misleading.
function applyImsConfig(
  base: Record<string, any>,
  cfg: ImsConfig,
): Record<string, any> {
  const next = { ...base };

  next.organization = {
    ...next.organization,
    orgName: cfg.orgName || next.organization.orgName,
    legalName: cfg.companyName || next.organization.legalName,
    domain: cfg.primaryDomain || next.organization.domain,
    timezone: cfg.timezone || next.organization.timezone,
  };

  next.security = {
    ...next.security,
    ssoOn: cfg.ssoEnabled ?? next.security.ssoOn,
    ssoEnforced: cfg.ssoEnforced ?? next.security.ssoEnforced,
    ssoProvider: cfg.ssoProvider || next.security.ssoProvider,
  };

  next.notifications = {
    ...next.notifications,
    alertEmail: cfg.alertEmail || next.notifications.alertEmail,
    slackChannel: cfg.slackChannel || next.notifications.slackChannel,
    slack: cfg.slackChannel ? true : next.notifications.slack,
    notifyOnCreate: cfg.notifyOnCreate ?? next.notifications.notifyOnCreate,
    notifyOnResolve: cfg.notifyOnResolve ?? next.notifications.notifyOnResolve,
  };

  next.sla = {
    ...next.sla,
    enabled: cfg.slaEnabled ?? next.sla.enabled,
    autoEscalate: cfg.autoEscalate ?? next.sla.autoEscalate,
  };

  if (cfg.connectorConnections?.length) {
    const byType: Record<string, (typeof cfg.connectorConnections)[number]> =
      {};
    cfg.connectorConnections.forEach((c) => {
      byType[c.type.toLowerCase()] = c;
    });
    next.integrations = {
      ...next.integrations,
      list: next.integrations.list.map((rec: any) => {
        const real = byType[rec.id];
        // Only the connected/health status is universal across connectors —
        // each connector's config fields use different names for their base
        // URL (baseUrl, instanceUrl, site, workspace…), so that's left to the
        // per-connector detail view rather than guessed here.
        return real ? { ...rec, on: real.status === "HEALTHY" } : rec;
      }),
    };
  }

  return next;
}

export default function Settings() {
  const [state, setState] = useState<Record<string, any>>(() =>
    structuredCloneSafe(DEFAULTS),
  );
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [notifs, setNotifs] = useState<NotifItem[]>(SEED_NOTIFS);
  const [hydrated, setHydrated] = useState(false);

  const [search, setSearch] = useState("");
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { imsConfig } = useGetConfig();

  useEffect(() => {
    const savedState = safeGet<Record<string, any>>(STORAGE_KEY);
    if (savedState) {
      const merged: Record<string, any> = {};
      for (const c of CATS)
        merged[c.id] = {
          ...structuredCloneSafe(DEFAULTS[c.id]),
          ...(savedState[c.id] || {}),
        };
      setState(merged);
    }
    const savedLedger = safeGet<LedgerEntry[]>(LEDGER_KEY);
    if (savedLedger) setLedger(savedLedger);
    const savedNotifs = safeGet<NotifItem[]>(NOTIFS_KEY);
    if (savedNotifs) setNotifs(savedNotifs);
    setHydrated(true);
  }, []);

  // Overlays real backend config onto the (locally-seeded) state once it
  // arrives — after the localStorage hydration above so a saved local draft
  // isn't clobbered by a slower network response.
  useEffect(() => {
    if (!hydrated || !imsConfig) return;
    setState((prev) => applyImsConfig(prev, imsConfig));
  }, [imsConfig, hydrated]);

  useEffect(() => {
    if (hydrated) safeSet(NOTIFS_KEY, notifs);
  }, [notifs, hydrated]);

  useEffect(() => {
    if (!notifOpen) return;
    const close = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [notifOpen]);

  function openDrawer(catId: string) {
    setOpenCat(catId);
    setDraft(structuredCloneSafe(state[catId]));
  }
  function closeDrawer() {
    setOpenCat(null);
    setDraft(null);
  }
  async function saveDrawer() {
    if (!openCat) return;
    // Persist roles & permissions to API
    if (openCat === "roles" && draft?.list) {
      try {
        await customAxios.put(endpoint.role_permissions.matrix, { roles: draft.list });
      } catch {
        // Continue with localStorage save even if API call fails
      }
    }
    // Persist SSO config to API
    if (openCat === "authentication" && draft?.providers) {
      try {
        const primary = draft.providers.find((p: any) => p.name === draft.primary && p.on) ?? draft.providers[0];
        if (primary?.name) {
          await customAxios.put(endpoint.auth.ims_sso, {
            provider: primary.name,
            protocol: primary.protocol,
            domain: primary.domain,
            enabled: draft.ssoOn ?? primary.on,
            passwordPolicy: draft.passwordPolicy,
            minPasswordLength: draft.minLength,
            passwordRotationDays: draft.rotateDays,
            mfaRequired: draft.mfaPolicy !== "Optional",
            mfaPolicy: draft.mfaPolicy,
            mfaMethods: draft.mfaMethods,
          });
        }
      } catch {
        // Continue with localStorage save even if API call fails
      }
    }
    // Persist organization profile to API
    if (openCat === "organization") {
      try {
        await customAxios.patch("/business/settings/organization", {
          name: draft.orgName,
          industry: draft.industry,
          timezone: draft.timezone,
          domain: draft.domain,
          units: draft.units,
          locations: draft.locations,
        });
      } catch {
        // Continue with localStorage save even if API call fails
      }
    }
    // Sync member role / active changes to API
    if (openCat === "users" && Array.isArray(draft?.list)) {
      await Promise.allSettled(
        (draft.list as any[]).map(async (m: any) => {
          if (m.id) {
            await customAxios.patch(`/business/members/${m.id}/role`, { role: m.role }).catch(() => {});
            if (typeof m.active === "boolean") {
              await customAxios.patch(`/business/members/${m.id}/active`, { active: m.active }).catch(() => {});
            }
          } else if (m.email && String(m.email).includes("@")) {
            // New member — send invite
            await customAxios.post(endpoint.auth.invite_member, { email: m.email, role: m.role }).catch(() => {});
          }
        }),
      );
    }
    // TODO: case "sla" — POST /sla-policies when policy data is structured
    // TODO: case "notifications" — integrate with /integrations notification settings
    const summary = summarize(openCat, draft);
    const nextState = { ...state, [openCat]: draft };
    setState(nextState);
    safeSet(STORAGE_KEY, nextState);
    const entry: LedgerEntry = {
      cat: openCat,
      catName: CATMAP[openCat].name,
      summary,
      ts: Date.now(),
      actor: "Admin User",
    };
    const nextLedger = [entry, ...ledger].slice(0, 200);
    setLedger(nextLedger);
    safeSet(LEDGER_KEY, nextLedger);
    toast.success(`${CATMAP[openCat].name} saved`);
    closeDrawer();
  }

  const stats = useMemo(
    () => [
      {
        icon: "services",
        label: "Services",
        tint: TINTS.slate,
        value: state.services.list.length,
        delta: "+8 this month",
      },
      {
        icon: "integ",
        label: "Connectors",
        tint: TINTS.slate,
        value: state.integrations.list.filter((c: any) => c.on).length,
        delta: "+2 this month",
      },
      {
        icon: "agents",
        label: "Active agents",
        tint: TINTS.slate,
        value: state.agents.list.filter((a: any) => a.on).length,
        delta: "governed",
      },
      {
        icon: "rules",
        label: "Open incidents",
        tint: TINTS.slate,
        value: 7,
        delta: "3 from yesterday",
        down: true,
      },
    ],
    [state],
  );

  const filteredCats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATS;
    return CATS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
    );
  }, [search]);

  const unread = notifs.filter((n) => !n.read).length;
  const activeCat = openCat ? CATMAP[openCat] : null;
  const FormBody = openCat ? FORM_RENDERERS[openCat] : null;

  return (
    <div className="min-h-screen bg-zinc-50 font-ibm dark:bg-zinc-900/20">
      <Header title="Admin Settings" />

      <main className="mx-auto max-w-[1500px] p-4 pb-20 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mt-1 max-w-2xl text-[13.5px] text-black/60 dark:text-zinc-400">
              Configure Scrubbe to match how your organization runs incident
              response.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-zinc-500"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search settings…"
                className="h-[38px] w-full max-w-[260px] rounded-md border border-zinc-300 bg-white pl-9 pr-3 text-[13px] text-black placeholder:text-black/40 focus:border-IMSDarkGreen focus:outline-none focus:ring-2 focus:ring-IMSDarkGreen/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              />
            </div>
          </div>
        </div>

        {/* banner */}
        <div className="mb-5 rounded-xl  bg-white p-6 shadow-sm shadow-light dark:border-zinc-700 dark:bg-zinc-900/40">
          <h2 className="text-[19px] font-bold text-black dark:text-zinc-100">
            Admin Control Center
          </h2>
          <p className="mt-1 max-w-[520px] text-[13.5px] text-black/60 dark:text-zinc-400">
            Govern your agents, connect your tools and tune how Scrubbe responds
            to incidents.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {stats.map((s) => (
              <StatTile
                key={s.label}
                icon={<CatIcon name={s.icon} size={14} />}
                label={s.label}
                value={s.value}
                delta={s.delta}
                tint={s.tint}
                down={s.down}
              />
            ))}
          </div>
        </div>

        {/* category grid */}
        {filteredCats.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
            <b className="block text-[16px] font-bold text-black dark:text-zinc-100">
              No settings match “{search}”
            </b>
            <p className="mt-1 text-[13.5px] text-black/50 dark:text-zinc-500">
              Try a different term, or clear the search to browse everything.
            </p>
          </div>
        ) : (
          GROUPS.map((g) => {
            const items = filteredCats.filter((c) => c.group === g.id);
            if (!items.length) return null;
            return (
              <div key={g.id} className="mb-4">
                <GroupHeader
                  icon={<CatIcon name={g.icon} size={15} />}
                  tint={TINTS[g.tint]}
                  name={g.name}
                  count={items.length}
                />
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((c) => (
                    <CategoryCard
                      key={c.id}
                      icon={<CatIcon name={c.icon} size={21} />}
                      tint={TINTS[c.tint]}
                      name={c.name}
                      desc={c.desc}
                      cta={c.cta}
                      badge={c.badge}
                      onClick={() => openDrawer(c.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* quick actions */}
        <div className="mt-8 p-4 rounded-lg border border-zinc-200 bg-white p-4.5 dark:border-zinc-700 dark:bg-zinc-900/40">
          <div className="mb-3.5 flex items-center gap-2 text-[14px] font-bold text-black dark:text-zinc-100">
            <Sparkles size={15} className="text-IMSDarkGreen" /> Quick actions
          </div>
          <div className="flex flex-wrap gap-2.5">
            {QUICK.map((q) => (
              <Button
                key={q.label}
                variant="outline-dark"
                size="sm"
                className="flex-1"
                style={{ minWidth: 170 }}
                leftIcon={
                  <CatIcon
                    name={q.icon}
                    size={15}
                    className="text-IMSDarkGreen"
                  />
                }
                onClick={() => openDrawer(q.open)}
              >
                {q.label}
              </Button>
            ))}
          </div>
        </div>
      </main>

      {activeCat && FormBody && draft && (
        <SettingsDrawer
          open={!!openCat}
          onClose={closeDrawer}
          onSave={saveDrawer}
          icon={activeCat.icon}
          tint={activeCat.tint}
          title={activeCat.name}
          desc={activeCat.desc}
        >
          <FormBody
            draft={draft}
            setDraft={setDraft}
            state={state}
            ledger={ledger}
          />
        </SettingsDrawer>
      )}

      <SettingsDrawer
        open={ledgerOpen}
        onClose={() => setLedgerOpen(false)}
        icon="audit"
        tint="slate"
        title="Change history"
        desc="Every settings change, in order. Append-only."
      >
        {ledger.length ? (
          <div className="space-y-0">
            {ledger.map((e, i) => (
              <div
                key={i}
                className="flex gap-3 border-b border-zinc-100 py-3.5 last:border-b-0 dark:border-zinc-800"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-IMSDarkGreen/10 text-IMSDarkGreen">
                  <Check size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="text-[13.5px] font-bold text-black dark:text-zinc-200">
                    {e.catName}
                  </b>
                  <p className="mt-0.5 text-[12.5px] text-black/60 dark:text-zinc-400">
                    {e.summary}
                  </p>
                  <time className="mt-1 block font-ibm text-[11px] text-black/40 dark:text-zinc-500">
                    {fmtTs(e.ts)} · {e.actor}
                  </time>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-14 text-center text-black/40 dark:text-zinc-500">
            <ShieldCheck
              size={36}
              className="mx-auto mb-3 text-black/20 dark:text-zinc-700"
            />
            <div className="mb-1 text-[15px] font-bold text-black dark:text-zinc-200">
              No changes yet
            </div>
            Settings you save will be recorded here with a timestamp.
          </div>
        )}
        {ledger.length > 0 && (
          <Button
            variant="outline-dark"
            size="sm"
            className="mt-4"
            leftIcon={<Download size={14} />}
            onClick={() => {
              downloadText(
                `scrubbe-audit-log-${new Date().toISOString().slice(0, 10)}.json`,
                JSON.stringify(ledger, null, 2),
              );
              toast.success("Audit log exported");
            }}
          >
            Export
          </Button>
        )}
      </SettingsDrawer>
    </div>
  );
}
