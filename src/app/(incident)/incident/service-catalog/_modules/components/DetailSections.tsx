"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CheckList,
  EalPill,
  HealthBadge,
  MiniStat,
  ReadinessRing,
  Section,
} from "./ServiceCatalogPrimitives";
import {
  DepEdge,
  LEVEL,
  ServiceRecord,
  attachedPlaybooks,
  depGraph,
  ealOf,
  playbookByName,
  readiness,
  serviceRules,
} from "./serviceCatalog.data";
import {
  CONNECTED_INTEGRATIONS,
  PRIORITIES,
  SIGNAL_SOURCES,
  SLA_BY_PRIORITY,
  aiOpsInsights,
  analyticsFor,
  auditLog,
  businessBlastRadius,
  businessCapabilities,
  environmentsFor,
  failurePatterns,
  incidentConfig,
  opActivity,
  opComms,
  opReadiness,
  operationalState,
  orchestrationStages,
  ownershipModel,
  recoveryStrategy,
  relatedModules,
  serviceIncidents,
  serviceObjectives,
  serviceRepos,
  serviceTimeline,
} from "./serviceDetail.data";

export const NAV_SECTIONS: [string, string][] = [
  ["state", "Current state"], ["impact", "Operational impact"], ["readiness", "Automation readiness"],
  ["overview", "Overview"], ["capabilities", "Business capabilities"], ["blast", "Blast radius"],
  ["opreadiness", "Operational readiness"], ["comms", "Operational communication"], ["health", "Service health"],
  ["orchestration", "Incident response orchestration"], ["ownership", "Operational ownership"],
  ["dependencies", "Dependencies"], ["recovery", "Recovery intelligence"], ["patterns", "Known failure patterns"],
  ["timeline", "Service timeline"], ["runtime", "Runtime & infrastructure"], ["repositories", "Repositories"],
  ["changes", "Operational activity"], ["environments", "Environments"], ["slo", "SLA & SLO"],
  ["incidents", "Incident history"], ["signals", "Signal graph"], ["ai", "AI operational insights"],
  ["rules", "Operational rules"], ["automation", "Playbooks & templates"], ["related", "Related across Scrubbe"],
  ["integrations", "Integrations"], ["analytics", "Analytics"], ["governance", "Governance"], ["audit", "Audit log"],
];

const TIER_COLOR = ["bg-rose-500", "bg-amber-500", "bg-blue-500", "bg-zinc-400"];

/* ───────────────────── 1. Current state ───────────────────── */
export function CurrentStateSection({ service }: { service: ServiceRecord }) {
  const rows = operationalState(service);
  return (
    <Section id="s-state">
      <Card>
        <CardHeader title="Current operational state" hint="Live" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {rows.map((r) => (
            <MiniStat key={r.n} label={r.n} value={r.v} tone={r.cls} />
          ))}
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 2. Operational impact ───────────────────── */
export function OperationalImpactSection({ service }: { service: ServiceRecord }) {
  const b = businessBlastRadius(service);
  const incidents = serviceIncidents(service).filter((x) => x.open);
  return (
    <Section id="s-impact">
      <Card>
        <CardHeader title="Operational impact" />
        <div
          className={cn(
            "rounded-md p-4",
            service.health === "Critical" ? "bg-rose-50 dark:bg-rose-500/5" : service.health === "Warning" ? "bg-amber-50 dark:bg-amber-500/5" : "bg-emerald-50 dark:bg-emerald-500/5",
          )}
        >
          <div className="mb-1 flex items-center gap-2">
            <HealthBadge health={service.health} />
            <span className="text-[12px] text-black/50 dark:text-zinc-500">
              {service.health === "Healthy" ? "No impact right now" : "Partial operational impact"}
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-black dark:text-zinc-200">
            {service.health === "Healthy"
              ? "This service is healthy. The following services and business capabilities would be affected if it failed."
              : "This service is currently degraded. The following services and business capabilities are experiencing partial operational impact."}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <MiniStat label="Business impact" value={b.risk.label} tone={b.risk.cls} />
          <MiniStat label="Affected services" value={b.dependentCount} />
          <MiniStat label="Customers" value={service.tier === 0 ? "Enterprise + Retail" : service.tier === 1 ? "Retail" : "Internal + Partner"} />
          <MiniStat label="Active incident" value={incidents[0]?.id ?? "None"} tone={incidents.length ? "bad" : undefined} />
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 3. Automation readiness ───────────────────── */
export function AutomationReadinessSection({ service }: { service: ServiceRecord }) {
  const e = ealOf(service);
  const r = readiness(service);
  return (
    <Section id="s-readiness">
      <Card>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          What Scrubbe may do here
        </div>
        <CardHeader title="Automation readiness" />
        <p className="mb-4 text-[13px] leading-relaxed text-black/60 dark:text-zinc-400">
          The catalog does not just describe this service. It decides, before any incident, how far
          Scrubbe is permitted to act on it — and stores that decision so it cannot drift between
          evaluation and execution.
        </p>
        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[132px_1fr]">
          <div className="text-center">
            <ReadinessRing score={r.score} band={r.band} />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-black dark:text-zinc-100">
              {e.blocked ? "Execution gate is blocked" : `Level ${e.level} — ${LEVEL(e.level).name}`}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-black/60 dark:text-zinc-400">
              {e.blocked ? e.gate.why : `${r.failing.length ? r.failing.length + " readiness check" + (r.failing.length === 1 ? "" : "s") + " still outstanding." : "All seven readiness checks pass."}`}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {e.inputs.map((input) => (
                <div
                  key={input.src}
                  className={cn(
                    "rounded-md border p-3",
                    input.src === e.binding ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-700",
                  )}
                >
                  <div className="text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">{input.src}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <EalPill eal={{ ...e, level: input.level, blocked: false }} />
                    {input.src === e.binding && (
                      <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 font-ibm text-[9px] font-bold uppercase text-white dark:bg-zinc-100 dark:text-zinc-900">
                        binds
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] leading-snug text-black/50 dark:text-zinc-500">{input.why}</div>
                </div>
              ))}
              <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
                  Effective automation level
                </div>
                <div className="mt-1">
                  <EalPill eal={e} long />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-4 flex items-start gap-3 rounded-md border p-3.5",
            e.blocked ? "border-rose-300 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/5" : "border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/5",
          )}
        >
          <div className="flex-1">
            <div className={cn("text-[13px] font-bold", e.blocked ? "text-rose-800 dark:text-rose-300" : "text-emerald-800 dark:text-emerald-300")}>
              Execution gate — blast radius {e.gate.scope}
            </div>
            <div className="text-[12.5px] text-black/60 dark:text-zinc-400">
              {e.gate.why} Blast radius is always evaluated before the guardrail check, and an unknown
              radius blocks rather than defaults to low.
            </div>
          </div>
          <button
            onClick={() => toast.info(`Re-evaluating automation level for ${service.name}…`)}
            className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            Re-evaluate now
          </button>
        </div>

        <div className="mt-5">
          <CardHeader title="Readiness checks" hint={`${r.failing.length} outstanding`} />
          <CheckList items={r.results.map((c) => ({ label: c.label, ok: c.ok, note: c.why }))} />
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 4. Overview ───────────────────── */
export function OverviewSection({ service }: { service: ServiceRecord }) {
  const repos = serviceRepos(service);
  return (
    <Section id="s-overview">
      <Card>
        <CardHeader title="Overview" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <MiniStat label="Status" value={service.health} tone={service.health === "Healthy" ? "ok" : service.health === "Warning" ? "warn" : "bad"} />
          <MiniStat label="Business criticality" value={`Tier ${service.tier}`} />
          <MiniStat label="Environment" value={service.env} />
          <MiniStat label="Version" value={`v${service.version}`} />
          <MiniStat label="Owner team" value={service.owner} />
          <MiniStat label="Primary contact" value="Engineering manager" />
          <MiniStat label="Cloud / Region" value={`${service.cloud} · ${service.region}`} />
          <MiniStat label="Repositories" value={repos.length} />
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 5. Business capabilities ───────────────────── */
export function BusinessCapabilitiesSection({ service }: { service: ServiceRecord }) {
  const caps = businessCapabilities(service);
  const obj = serviceObjectives(service);
  return (
    <Section id="s-capabilities">
      <Card>
        <CardHeader title="Business capabilities & objectives" />
        <p className="mb-3 text-[13px] text-black/60 dark:text-zinc-400">
          {service.health === "Healthy"
            ? "These business capabilities depend on this service. They are all being served normally."
            : "These capabilities are being served with reduced quality while this service is degraded."}
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {caps.map((c) => (
            <span key={c} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12.5px] font-medium text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              {c}
            </span>
          ))}
        </div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Service objectives</div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          <MiniStat label="Availability" value={`${obj.availability}%`} />
          <MiniStat label="SLO target" value={`${obj.sloTarget}%`} />
          <MiniStat label="RTO" value={obj.rto} />
          <MiniStat label="RPO" value={obj.rpo} />
          <MiniStat label="Error budget" value={obj.budgetLabel} tone={obj.budgetLabel === "Exhausted" ? "bad" : obj.budgetLabel === "At risk" ? "warn" : "ok"} />
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 6. Blast radius ───────────────────── */
export function BlastRadiusSection({ service }: { service: ServiceRecord }) {
  const b = businessBlastRadius(service);
  return (
    <Section id="s-blast">
      <Card>
        <CardHeader title="Blast radius & business impact" hint={service.env} />
        <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-[120px_1fr]">
          <div className="text-center">
            <div className="text-[38px] font-bold leading-none text-black dark:text-zinc-100">{b.affectedTotal}</div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Services affected</div>
          </div>
          <p className="text-[13px] leading-relaxed text-black/70 dark:text-zinc-300">
            {service.health === "Healthy"
              ? `If ${service.name} were to fail, ${b.dependentCount} service${b.dependentCount === 1 ? "" : "s"} would degrade immediately and the rest of the affected set would follow within two hops.`
              : `${service.name} is degraded, so ${b.dependentCount} service${b.dependentCount === 1 ? " is" : "s are"} already absorbing partial impact, with the remainder of the ${b.affectedTotal}-service affected set reachable within two hops.`}{" "}
            {b.customerFacing ? "This service is customer-facing." : "This service is not directly customer-facing."}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          <MiniStat label="Criticality tier" value={`Tier ${service.tier}`} />
          <MiniStat label="Dependent services" value={b.dependentCount} />
          <MiniStat label="Users exposed" value={`${(b.impact.users / 1000).toFixed(1)}k`} />
          <MiniStat label="Revenue at risk" value={b.revenuePerMin ? `£${(b.revenuePerMin / 1000).toFixed(1)}k/min` : "—"} />
          <MiniStat label="Business risk" value={b.risk.label} tone={b.risk.cls} />
        </div>
        <div className="mt-3 flex h-6 overflow-hidden rounded-md">
          {b.impact.tiers.map((n, t) =>
            n > 0 ? (
              <div key={t} className={cn("flex items-center justify-center font-ibm text-[10px] font-bold text-white", TIER_COLOR[t])} style={{ flex: n }}>
                T{t} · {n}
              </div>
            ) : null,
          )}
        </div>
        <div className="mt-4">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Business capabilities supported</div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {b.caps.map(([name, desc]) => (
              <div key={name} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
                <div className="text-[13px] font-semibold text-black dark:text-zinc-100">{name}</div>
                <div className="mt-1 text-[12px] text-black/50 dark:text-zinc-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 7. Operational readiness ───────────────────── */
export function OperationalReadinessSection({ service }: { service: ServiceRecord }) {
  const rows = opReadiness(service);
  return (
    <Section id="s-opreadiness">
      <Card>
        <CardHeader title="Operational readiness" hint="Prepared, or not" />
        <CheckList items={rows.map((r) => ({ label: r.n, ok: r.ok, note: `${r.v} — ${r.d}` }))} />
      </Card>
    </Section>
  );
}

/* ───────────────────── 8. Operational communication ───────────────────── */
export function OperationalCommunicationSection({ service }: { service: ServiceRecord }) {
  const comms = opComms(service);
  return (
    <Section id="s-comms">
      <Card>
        <CardHeader title="Operational communication" hint="Where to go when this misbehaves" />
        <div>
          {comms.map((c, i) => (
            <div key={c.label} className={cn("flex items-center justify-between gap-3 py-2.5", i !== comms.length - 1 && "border-b border-zinc-100 dark:border-zinc-800")}>
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">{c.label}</div>
                <div className="text-[11.5px] text-black/50 dark:text-zinc-500">{c.note}</div>
              </div>
              <button
                onClick={() => toast.info(`Opening ${c.value}`)}
                className="shrink-0 text-[13px] font-semibold text-black hover:text-emerald-600 dark:text-zinc-100"
              >
                {c.value}
              </button>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 9. Service health ───────────────────── */
export function ServiceHealthSection({ service }: { service: ServiceRecord }) {
  const [metric, setMetric] = useState<"Availability" | "Latency" | "Errors" | "Traffic">("Availability");
  const data = healthSeries(service, metric);
  const last = data[data.length - 1];
  const unit = { Availability: "%", Latency: "ms", Errors: "%", Traffic: "k/min" }[metric];
  const W = 680, H = 130;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const X = (i: number) => (i / (data.length - 1)) * W;
  const Y = (v: number) => H - 10 - ((v - min) / span) * (H - 22);
  const line = data.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");

  return (
    <Section id="s-health">
      <Card>
        <CardHeader title="Service health" hint="Streaming" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <MiniStat label="Availability" value={`${service.availability}%`} />
          <MiniStat label="Latency" value={`${service.latency}ms`} />
          <MiniStat label="Errors" value={`${service.errorRate}%`} />
          <MiniStat label="Traffic" value={`${(service.traffic / 1000).toFixed(1)}k/min`} />
          <MiniStat label="CPU" value={`${service.cpu}%`} />
          <MiniStat label="Memory" value={`${service.mem}%`} />
        </div>
        <div className="mt-4">
          <CheckList
            items={[
              { label: "Deployment", ok: true, note: "Healthy" },
              { label: "Database", ok: true, note: "Healthy" },
              { label: "Queue", ok: true, note: "Healthy" },
              { label: "External providers", ok: service.health !== "Critical", note: service.health === "Critical" ? "Degraded" : "Healthy" },
              { label: "Pods", ok: true, note: `${service.pods}/${service.pods} healthy` },
            ]}
          />
        </div>
        <div className="mt-5">
          <div className="mb-2 flex flex-wrap gap-2">
            {(["Availability", "Latency", "Errors", "Traffic"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-semibold",
                  metric === m ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-200 text-black/60 dark:border-zinc-700 dark:text-zinc-400",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-ibm text-[18px] font-bold text-black dark:text-zinc-100">{last}{unit}</span>
              <span className="text-[12px] text-black/50 dark:text-zinc-500">{metric} today · 30-day window</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-[110px] w-full" preserveAspectRatio="none">
              <path d={line} fill="none" stroke={service.health === "Critical" ? "#e11d48" : service.health === "Warning" ? "#d97706" : "#059669"} strokeWidth={2} />
            </svg>
            <div className="flex justify-between font-ibm text-[10.5px] text-black/40 dark:text-zinc-500">
              <span>30 days ago</span>
              <span>today</span>
            </div>
          </div>
        </div>
      </Card>
    </Section>
  );
}
function healthSeries(s: ServiceRecord, metric: string): number[] {
  const base = { Availability: +s.availability, Latency: s.latency, Errors: +s.errorRate, Traffic: s.traffic / 1000 }[metric] ?? 0;
  const amp = { Availability: 0.06, Latency: 0.22, Errors: 0.55, Traffic: 0.18 }[metric] ?? 0.2;
  const out: number[] = [];
  for (let d = 0; d < 30; d++) {
    const x = Math.sin((s.name.length + d * 3 + 81) * 12.9898) * 43758.5453;
    const wobble = ((x - Math.floor(x)) - 0.5) * 2 * amp;
    let v = base * (1 + wobble);
    if (metric === "Availability") v = Math.min(100, Math.max(96, v));
    out.push(+v.toFixed(metric === "Availability" || metric === "Errors" ? 3 : 1));
  }
  out[29] = base;
  return out;
}

/* ───────────────────── 10. Incident response orchestration ───────────────────── */
export function IncidentOrchestrationSection({ service }: { service: ServiceRecord }) {
  const stages = orchestrationStages(service);
  const config = incidentConfig(service);
  return (
    <Section id="s-orchestration">
      <Card>
        <CardHeader title="Incident response orchestration" hint="How the sections above act together" />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {stages.map((st) => (
            <div key={st.key} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
              <div className="text-[12.5px] font-bold text-black dark:text-zinc-100">{st.title}</div>
              <div className="mt-1 text-[11.5px] leading-snug text-black/50 dark:text-zinc-500">{st.desc}</div>
              <span
                className={cn(
                  "mt-2 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
                  st.locked
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : st.automatic
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-zinc-100 text-black/60 dark:bg-zinc-800 dark:text-zinc-400",
                )}
              >
                {st.locked ? "Always enforced" : st.automatic ? "Automatic" : "Manual only"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
            Independent interaction rules — by incident priority
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-[12.5px]">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-wide text-black/40 dark:text-zinc-500">
                  <th className="border-b border-zinc-100 py-2 font-semibold dark:border-zinc-800">Priority</th>
                  <th className="border-b border-zinc-100 py-2 font-semibold dark:border-zinc-800">Auto-page</th>
                  <th className="border-b border-zinc-100 py-2 font-semibold dark:border-zinc-800">Approval</th>
                  <th className="border-b border-zinc-100 py-2 font-semibold dark:border-zinc-800">Playbook</th>
                  <th className="border-b border-zinc-100 py-2 font-semibold dark:border-zinc-800">Max actions</th>
                  <th className="border-b border-zinc-100 py-2 font-semibold dark:border-zinc-800">Escalation</th>
                </tr>
              </thead>
              <tbody>
                {PRIORITIES.map((p) => {
                  const c = config[p];
                  return (
                    <tr key={p} className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800">
                      <td className="py-2 font-ibm font-bold text-black dark:text-zinc-100">{p}</td>
                      <td className="py-2">{c.autopage ? "Yes" : "No"}</td>
                      <td className="py-2">{c.approval ? "Yes" : "No"}</td>
                      <td className="py-2">{c.playbook}</td>
                      <td className="py-2 font-ibm">{c.maxAuto}</td>
                      <td className="py-2 font-ibm">{c.escalation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => toast.success("Orchestration settings saved")}
            className="mt-3 rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
          >
            Save orchestration settings
          </button>
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 11. Ownership ───────────────────── */
export function OwnershipSection({ service }: { service: ServiceRecord }) {
  const owners = ownershipModel(service);
  return (
    <Section id="s-ownership">
      <Card>
        <CardHeader title="Operational ownership" hint="Accountability" />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {owners.map((o) => (
            <div key={o.role} className={cn("rounded-md border p-3", o.primary ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-700")}>
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">{o.role}</div>
              <div className="mt-1 text-[13px] font-bold text-black dark:text-zinc-100">{o.value}</div>
              <div className="text-[11.5px] text-black/50 dark:text-zinc-500">{o.note}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <MiniStat label="Escalation policy" value={service.tier === 0 ? "P1 immediate" : "P2 within 15 min"} />
          <MiniStat label="Secondary team" value="Infrastructure" />
          <MiniStat label="Pager rotation" value={`${service.owner} primary`} />
          <MiniStat label="Team members" value={6} />
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 12. Dependencies ───────────────────── */
export function DependenciesSection({ service, onOpenService }: { service: ServiceRecord; onOpenService: (name: string) => void }) {
  const g = depGraph(service);
  return (
    <Section id="s-dependencies">
      <Card>
        <CardHeader title="Dependencies" hint={`${g.band} confidence`} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
              Depends on · {g.downstream.length}
            </div>
            <EdgeList edges={g.downstream} onOpenService={onOpenService} />
          </div>
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
              Depended on by · {g.upstream.length}
            </div>
            {g.upstream.length ? (
              <EdgeList edges={g.upstream} onOpenService={onOpenService} />
            ) : (
              <div className="py-4 text-center text-[12.5px] text-black/40 dark:text-zinc-500">No consumers recorded.</div>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <MiniStat label="Overall confidence" value={`${g.confidence}%`} tone={g.confidence >= 85 ? "ok" : g.confidence >= 70 ? "warn" : "bad"} />
          <MiniStat label="Edges mapped" value={g.all.length} />
          <MiniStat label="Under-verified" value={g.unverified.length} tone={g.unverified.length ? "warn" : "ok"} />
        </div>
      </Card>
    </Section>
  );
}
function EdgeList({ edges, onOpenService }: { edges: DepEdge[]; onOpenService: (name: string) => void }) {
  return (
    <div>
      {edges.map((e, i) => (
        <button
          key={`${e.name}-${i}`}
          onClick={() => e.svc && onOpenService(e.name)}
          className={cn(
            "flex w-full items-center gap-3 py-2 text-left",
            i !== edges.length - 1 && "border-b border-zinc-100 dark:border-zinc-800",
            e.svc ? "cursor-pointer" : "cursor-default",
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-black dark:text-zinc-100">{e.name}</div>
            <div className="text-[11.5px] text-black/40 dark:text-zinc-500">{e.calls}k/min · {e.source.label}</div>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
              e.confidence >= 85
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : e.confidence >= 70
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
            )}
          >
            {e.confidence}%
          </span>
        </button>
      ))}
    </div>
  );
}

/* ───────────────────── 13. Recovery intelligence ───────────────────── */
export function RecoverySection({ service }: { service: ServiceRecord }) {
  const strategy = recoveryStrategy(service);
  return (
    <Section id="s-recovery">
      <Card>
        <CardHeader title="Recovery intelligence" />
        <div className="flex flex-wrap items-center gap-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-700">
          <div className="flex-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Preferred recovery strategy</div>
            <div className="mt-1 text-[16px] font-bold text-black dark:text-zinc-100">{strategy.preferred}</div>
            <div className="mt-0.5 text-[12px] text-black/50 dark:text-zinc-500">Fallback if that fails · {strategy.fallback}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <MiniStat label="Automation" value={strategy.automation} tone={strategy.automationOk ? "ok" : "warn"} />
            <MiniStat label="Approval required" value={strategy.approval} tone={strategy.approvalOk ? "ok" : "warn"} />
            <MiniStat label="Avg recovery" value={`${strategy.avg} min`} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <MiniStat label="Automated success rate" value={`${strategy.rec.successRate}%`} />
          <MiniStat label="Detection time" value={`${strategy.rec.detectionTime} min`} />
          <MiniStat label="Approval wait" value={strategy.rec.approvalWait === null ? "—" : `${strategy.rec.approvalWait} min`} />
          <MiniStat label="Last recovery" value={strategy.rec.lastRecovery ? strategy.rec.lastRecovery.when : "None"} />
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 14. Known failure patterns ───────────────────── */
export function FailurePatternsSection({ service }: { service: ServiceRecord }) {
  const patterns = failurePatterns(service);
  return (
    <Section id="s-patterns">
      <Card>
        <CardHeader title="Known failure patterns" hint="Learned from incident history" />
        <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
          {patterns.map((f, i) => (
            <div key={f.name} className={cn("flex items-center gap-3 px-3.5 py-3", i !== patterns.length - 1 && "border-b border-zinc-100 dark:border-zinc-800")}>
              <span className={cn("h-8 w-[3px] shrink-0 rounded-full", f.severity === "bad" ? "bg-rose-500" : f.severity === "warn" ? "bg-amber-500" : "bg-emerald-500")} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-black dark:text-zinc-100">
                  {f.name}
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-ibm text-[10.5px] font-bold text-black/50 dark:bg-zinc-800 dark:text-zinc-400">{f.occurrences}×</span>
                </div>
                <div className="text-[12px] text-black/50 dark:text-zinc-500">{f.why}</div>
              </div>
              <div className="shrink-0 text-right text-[11px] text-black/40 dark:text-zinc-500">
                Last seen
                <div className="font-semibold text-black/60 dark:text-zinc-400">{f.last}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 15. Service timeline ───────────────────── */
export function TimelineSection({ service }: { service: ServiceRecord }) {
  const timeline = serviceTimeline(service);
  return (
    <Section id="s-timeline">
      <Card>
        <CardHeader title="Service timeline" hint="How it got here" />
        <div className="relative pl-5">
          <div className="absolute bottom-1 left-[3px] top-1 w-px bg-zinc-200 dark:bg-zinc-700" />
          {timeline.map((t) => (
            <div key={t.t} className="relative pb-4 last:pb-0">
              <span className={cn("absolute -left-5 top-1 h-[7px] w-[7px] rounded-full border-2 bg-white dark:bg-zinc-900", t.w === "now" ? "border-emerald-600" : "border-zinc-300 dark:border-zinc-600")} />
              <div className="text-[13px] font-semibold text-black dark:text-zinc-100">{t.t}</div>
              <div className="text-[12px] text-black/50 dark:text-zinc-500">{t.d}</div>
              <div className="font-ibm text-[10.5px] text-black/35 dark:text-zinc-600">{t.w}</div>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 16. Runtime & infrastructure ───────────────────── */
export function RuntimeSection({ service }: { service: ServiceRecord }) {
  return (
    <Section id="s-runtime">
      <Card>
        <CardHeader title="Runtime & infrastructure" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px] sm:grid-cols-3">
          <Field k="Runs on" v={service.runtime} />
          <Field k="Cloud / Region" v={`${service.cloud} · ${service.region}`} />
          <Field k="Pods / containers" v={`${service.pods} / ${service.pods}`} />
          <Field k="Autoscaling" v={service.tier <= 1 ? "Enabled" : "Disabled"} />
          <Field k="Namespace" v={service.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")} mono />
          <Field k="Availability zones" v="3" mono />
        </div>
      </Card>
    </Section>
  );
}
function Field({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">{k}</div>
      <div className={cn("mt-0.5 font-semibold text-black dark:text-zinc-100", mono && "font-ibm")}>{v}</div>
    </div>
  );
}

/* ───────────────────── 17. Repositories ───────────────────── */
export function RepositoriesSection({ service }: { service: ServiceRecord }) {
  const repos = serviceRepos(service);
  return (
    <Section id="s-repositories">
      <Card>
        <CardHeader title="Repositories" hint={`${repos.length} connected`} />
        <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
          {repos.map((r, i) => (
            <div key={r} className={cn("flex items-center justify-between gap-3 px-3.5 py-2.5", i !== repos.length - 1 && "border-b border-zinc-100 dark:border-zinc-800")}>
              <span className="font-ibm text-[12.5px] font-semibold text-black dark:text-zinc-100">{r}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">CI passing</span>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 18. Operational activity ───────────────────── */
export function ActivitySection({ service }: { service: ServiceRecord }) {
  const activity = opActivity(service);
  return (
    <Section id="s-changes">
      <Card>
        <CardHeader title="Operational activity" hint="Recent changes" />
        <div>
          {activity.map((a, i) => (
            <div key={`${a.type}-${i}`} className={cn("flex items-start gap-3 py-2.5", i !== activity.length - 1 && "border-b border-zinc-100 dark:border-zinc-800")}>
              <span className="mt-0.5 shrink-0 rounded-full border border-zinc-200 px-2 py-0.5 font-ibm text-[9.5px] uppercase tracking-wide text-black/50 dark:border-zinc-700 dark:text-zinc-500">
                {a.type}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold text-black dark:text-zinc-100">{a.title}</div>
                <div className="text-[11.5px] text-black/50 dark:text-zinc-500">{a.sub}</div>
              </div>
              <span className="shrink-0 font-ibm text-[10.5px] text-black/40 dark:text-zinc-500">{a.when}</span>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 19. Environments ───────────────────── */
export function EnvironmentsSection({ service }: { service: ServiceRecord }) {
  const envs = environmentsFor(service);
  return (
    <Section id="s-environments">
      <Card>
        <CardHeader title="Environments" hint="Deployment surfaces" />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {envs.map((e) => (
            <div key={e.env} className={cn("rounded-md border p-3", e.isCurrent ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-700")}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[13px] font-bold text-black dark:text-zinc-100">{e.env}</span>
                <HealthBadge health={e.health} />
              </div>
              <KV label="Version" value={`v${e.version}`} />
              <KV label="SLO" value={`${e.slo}%`} />
              <KV label="Incidents" value={e.incidents} />
              <KV label="Traffic" value={e.traffic} />
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
}
function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-[12px]">
      <span className="text-black/50 dark:text-zinc-500">{label}</span>
      <span className="font-semibold text-black dark:text-zinc-100">{value}</span>
    </div>
  );
}

/* ───────────────────── 20. SLA & SLO ───────────────────── */
export function SlaSection({ service }: { service: ServiceRecord }) {
  const obj = serviceObjectives(service);
  return (
    <Section id="s-slo">
      <Card>
        <CardHeader title="SLA & SLO" hint="Reliability & customer contract" />
        <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <MiniStat label="Availability" value={`${obj.availability}%`} />
          <MiniStat label="Target" value={`${obj.sloTarget}%`} />
          <MiniStat label="Latency" value={`${service.latency}ms`} />
          <MiniStat label="Error budget" value={obj.budgetLabel} tone={obj.budgetLabel === "Exhausted" ? "bad" : obj.budgetLabel === "At risk" ? "warn" : "ok"} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-wide text-black/40 dark:text-zinc-500">
                <th className="border-b border-zinc-100 py-2 font-semibold dark:border-zinc-800">Priority</th>
                <th className="border-b border-zinc-100 py-2 font-semibold dark:border-zinc-800">Ack</th>
                <th className="border-b border-zinc-100 py-2 font-semibold dark:border-zinc-800">Resolution</th>
                <th className="border-b border-zinc-100 py-2 font-semibold dark:border-zinc-800">Uptime</th>
                <th className="border-b border-zinc-100 py-2 font-semibold dark:border-zinc-800">Credit on breach</th>
              </tr>
            </thead>
            <tbody>
              {PRIORITIES.map((p) => {
                const row = SLA_BY_PRIORITY[p];
                return (
                  <tr key={p} className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800">
                    <td className="py-2.5 font-ibm font-bold text-black dark:text-zinc-100">{p}</td>
                    <td className="py-2.5 font-ibm text-black/70 dark:text-zinc-400">{row.ack}</td>
                    <td className="py-2.5 font-ibm text-black/70 dark:text-zinc-400">{row.resolve}</td>
                    <td className="py-2.5 font-ibm text-black/70 dark:text-zinc-400">{row.uptime}</td>
                    <td className="py-2.5 text-black/70 dark:text-zinc-400">{row.credit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 21. Incident history ───────────────────── */
const PRI_STYLE: Record<string, string> = {
  P0: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  P1: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  P2: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  P3: "bg-zinc-100 text-black/60 dark:bg-zinc-800 dark:text-zinc-400",
};
export function IncidentHistorySection({ service }: { service: ServiceRecord }) {
  const incidents = serviceIncidents(service);
  const avgMttr = Math.round(incidents.reduce((a, x) => a + x.mttr, 0) / incidents.length);
  const auto = incidents.filter((x) => x.how.includes("automated")).length;
  return (
    <Section id="s-incidents">
      <Card>
        <CardHeader title="Incident history" />
        <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <MiniStat label="Total incidents" value={incidents.length} />
          <MiniStat label="Average MTTR" value={`${avgMttr} min`} />
          <MiniStat label="Resolved by automation" value={`${Math.round((auto / incidents.length) * 100)}%`} tone="ok" />
          <MiniStat label="Last incident" value={`${service.lastIncidentWeeksAgo} wk ago`} />
        </div>
        <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
          {incidents.slice(0, 6).map((inc, i) => (
            <div key={inc.id} className={cn("flex items-center gap-3 px-3.5 py-3", i !== Math.min(incidents.length, 6) - 1 && "border-b border-zinc-100 dark:border-zinc-800")}>
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold", PRI_STYLE[inc.pri])}>{inc.pri}</span>
              <div className="min-w-0 flex-1">
                <div className="font-ibm text-[12.5px] font-semibold text-black dark:text-zinc-100">{inc.id}</div>
                <div className="text-[11.5px] text-black/50 dark:text-zinc-500">{inc.cause} · {inc.when}</div>
              </div>
              <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", inc.open ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400")}>
                {inc.how}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 22. Signal graph ───────────────────── */
export function SignalGraphSection({ service }: { service: ServiceRecord }) {
  return (
    <Section id="s-signals">
      <Card>
        <CardHeader title="Signal graph" hint="Live correlation" />
        <p className="mb-3 text-[13px] text-black/60 dark:text-zinc-400">Connected signal sources feeding this service&apos;s investigations.</p>
        <div className="flex flex-wrap gap-2">
          {SIGNAL_SOURCES.map((c) => (
            <span key={c} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              {c}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => toast.info(`Tracing ${service.name}…`)} className="rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700">
            Trace this service
          </button>
          <button onClick={() => toast.info("Jumping to blast radius")} className="rounded-md border border-zinc-300 px-4 py-2 text-[13px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200">
            See blast radius
          </button>
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 23. AI operational insights ───────────────────── */
export function AiInsightsSection({ service }: { service: ServiceRecord }) {
  const ai = aiOpsInsights(service);
  const e = ealOf(service);
  return (
    <Section id="s-ai">
      <Card>
        <CardHeader title="AI operational insights" hint="Generated continuously" />
        <div className="rounded-md border-l-[3px] border-zinc-900 bg-zinc-50 p-4 dark:border-zinc-100 dark:bg-zinc-900/40">
          <div className="mb-2 font-ibm text-[10px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Ezra · reading this service now</div>
          <p className="text-[13px] leading-relaxed text-black dark:text-zinc-200">
            {e.blocked
              ? `I cannot compute a blast radius for ${service.name} right now, so I am holding the execution gate closed.`
              : `If ${service.name} pages tonight, I can go as far as L${e.level}. ${e.binding} is what holds me there: ${e.bindingWhy.toLowerCase()}`}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
            <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Historical failure patterns</div>
            <ul className="space-y-1">
              {ai.patterns.map((p) => (
                <li key={p} className="text-[12px] text-black/70 dark:text-zinc-400">{p}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
            <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Frequently affected dependencies</div>
            <ul className="space-y-1">
              {ai.freq.map((f) => (
                <li key={f.name} className="text-[12px] text-black/70 dark:text-zinc-400">
                  <b className="text-black dark:text-zinc-200">{f.name}</b> · {f.calls}k/min{f.critical ? " · critical" : ""}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
            <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Recommended responders</div>
            <ul className="space-y-1">
              {ai.responders.map((r) => (
                <li key={r} className="text-[12px] text-black/70 dark:text-zinc-400">{r}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <MiniStat label="Average MTTR" value={`${ai.mttr} min`} />
          <MiniStat label="Operational confidence" value={`${ai.confidence}%`} tone={ai.confidence >= 85 ? "ok" : ai.confidence >= 70 ? "warn" : "bad"} />
          <MiniStat label="Health score" value={service.healthScore} />
          <MiniStat label="Deployment confidence" value={`${service.deploymentConfidence}%`} />
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 24. Operational rules ───────────────────── */
const RULE_STATE_STYLE: Record<string, string> = {
  Allowed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "Approval required": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Forbidden: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  Mandatory: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
};
export function RulesSection({ service }: { service: ServiceRecord }) {
  const rules = serviceRules(service);
  return (
    <Section id="s-rules">
      <Card>
        <CardHeader title="Operational rules" hint="Whether automation may run at all" />
        <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
          {rules.map((r, i) => (
            <div key={r.ref} className={cn("flex items-center gap-3 px-3.5 py-3", i !== rules.length - 1 && "border-b border-zinc-100 dark:border-zinc-800")}>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-black dark:text-zinc-100">{r.name}</div>
                <div className="font-ibm text-[11px] text-black/40 dark:text-zinc-500">{r.ref} · caps automation at L{r.cap}</div>
              </div>
              <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold", RULE_STATE_STYLE[r.state])}>{r.state}</span>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 25. Playbooks & templates ───────────────────── */
export function PlaybooksSection({ service }: { service: ServiceRecord }) {
  const playbookNames = attachedPlaybooks(service);
  const playbooks = playbookNames.map(playbookByName).filter(Boolean) as NonNullable<ReturnType<typeof playbookByName>>[];
  return (
    <Section id="s-automation">
      <Card>
        <CardHeader title="Playbooks & templates" hint="How approved automation executes" />
        {playbooks.length ? (
          <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
            {playbooks.map((p, i) => (
              <div key={p.name} className={cn("flex items-center gap-3 px-3.5 py-3", i !== playbooks.length - 1 && "border-b border-zinc-100 dark:border-zinc-800")}>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-black dark:text-zinc-100">{p.name}</div>
                  <div className="text-[12px] text-black/50 dark:text-zinc-500">{p.note}</div>
                </div>
                <span className="shrink-0 rounded-md border border-zinc-200 px-2 py-0.5 font-ibm text-[11px] font-bold text-black dark:border-zinc-700 dark:text-zinc-200">
                  L{p.stage}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-[12.5px] text-black/40 dark:text-zinc-500">
            No playbook is bound, so there is no approved procedure to execute.
          </div>
        )}
      </Card>
    </Section>
  );
}

/* ───────────────────── 26. Related across Scrubbe ───────────────────── */
export function RelatedSection({ service }: { service: ServiceRecord }) {
  const related = relatedModules(service);
  return (
    <Section id="s-related">
      <Card>
        <CardHeader title="Related across Scrubbe" hint="One hop away" />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {related.map((m) => (
            <button
              key={m.name}
              onClick={() => toast.info(`Opening ${m.name} for ${service.name} — coming in a later update`)}
              className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3.5 py-2.5 text-left hover:border-emerald-400 dark:border-zinc-700"
            >
              <span className="text-[13px] font-semibold text-black dark:text-zinc-100">{m.name}</span>
              <span className="font-ibm text-[11px] text-black/40 dark:text-zinc-500">{m.count}</span>
            </button>
          ))}
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 27. Integrations ───────────────────── */
export function IntegrationsSection({ service }: { service: ServiceRecord }) {
  return (
    <Section id="s-integrations">
      <Card>
        <CardHeader title="Integrations" hint="Connected systems" />
        <div className="flex flex-wrap gap-2">
          {CONNECTED_INTEGRATIONS.map((i) => (
            <button
              key={i}
              onClick={() => toast.info(`${i} — connection details coming in a later update for ${service.name}`)}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-black hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {i}
            </button>
          ))}
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 28. Analytics ───────────────────── */
export function AnalyticsSection({ service }: { service: ServiceRecord }) {
  const rows = analyticsFor(service);
  return (
    <Section id="s-analytics">
      <Card>
        <CardHeader title="Analytics" hint="Trends" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {rows.map((r) => (
            <MiniStat key={r.k} label={r.k} value={r.v} />
          ))}
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 29. Governance ───────────────────── */
export function GovernanceSection({ service }: { service: ServiceRecord }) {
  const readinessRows = opReadiness(service);
  return (
    <Section id="s-governance">
      <Card>
        <CardHeader title="Governance" hint="Compliance posture" />
        <CheckList
          items={[
            { label: "Owner assigned", ok: service.owner !== "Unassigned" },
            { label: "Documentation", ok: true, note: "Complete" },
            { label: "Runbook linked", ok: true },
            { label: "Architecture reviewed", ok: true, note: "3 weeks ago" },
            { label: "Security review", ok: true, note: "Passed" },
            { label: "Compliance", ok: true, note: "SOC2" },
          ]}
        />
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <MiniStat label="Operational rules bound" value={serviceRules(service).length} />
          <MiniStat label="Playbooks attached" value={attachedPlaybooks(service).length} />
          <MiniStat label="Readiness checks passing" value={`${readinessRows.filter((r) => r.ok).length}/${readinessRows.length}`} />
        </div>
      </Card>
    </Section>
  );
}

/* ───────────────────── 30. Audit log ───────────────────── */
export function AuditLogSection({ service }: { service: ServiceRecord }) {
  const entries = auditLog(service);
  return (
    <Section id="s-audit">
      <Card>
        <CardHeader title="Audit log" hint="Append-only" />
        <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
          {entries.map((e, i) => (
            <div key={i} className={cn("flex items-start gap-3 px-3.5 py-3", i !== entries.length - 1 && "border-b border-zinc-100 dark:border-zinc-800")}>
              <span className="w-16 shrink-0 font-ibm text-[11px] text-black/40 dark:text-zinc-500">{e.when}</span>
              <span className="shrink-0 font-semibold text-black dark:text-zinc-100">{e.actor}</span>
              <span className="min-w-0 flex-1 text-black/70 dark:text-zinc-400">
                {e.action} — {e.detail}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
}
