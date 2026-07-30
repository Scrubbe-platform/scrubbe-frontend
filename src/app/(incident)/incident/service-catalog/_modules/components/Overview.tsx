"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, ReadinessRing, TierBadge } from "./ServiceCatalogPrimitives";
import {
  AUTOMATION_LEVELS,
  LEVEL,
  SERVICES,
  ServiceRecord,
  ealOf,
  readiness,
} from "./serviceCatalog.data";
import { ServicesFilterPreset } from "./ServicesTable";

export default function Overview({
  onOpenTopology,
  onOpenServices,
  onOpenServiceDetail,
}: {
  onOpenTopology: () => void;
  onOpenServices: (preset?: ServicesFilterPreset) => void;
  onOpenServiceDetail: (name: string) => void;
}) {
  const [violScope, setViolScope] = useState<"tier01" | "all">("tier01");
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!moreOpen) return;
    const close = () => setMoreOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [moreOpen]);

  const stats = useMemo(() => {
    const total = SERVICES.length;
    const healthy = SERVICES.filter((s) => s.health === "Healthy").length;
    const warning = SERVICES.filter((s) => s.health === "Warning").length;
    const critical = SERVICES.filter((s) => s.health === "Critical").length;
    const tier0 = SERVICES.filter((s) => s.tier === 0).length;
    const production = SERVICES.filter((s) => s.env === "Production").length;
    const orphaned = SERVICES.filter((s) => s.owner === "Unassigned");

    const rd = SERVICES.map(readiness);
    const ready = rd.filter((r) => r.band === "Ready").length;
    const conditional = rd.filter((r) => r.band === "Conditional").length;
    const notReady = rd.filter((r) => r.band === "Not ready").length;
    const avgReadiness = Math.round(rd.reduce((a, r) => a + r.score, 0) / total);

    const evals = SERVICES.map(ealOf);
    const blocked = evals.filter((e) => e.blocked).length;
    const levelCounts = [0, 1, 2, 3, 4].map((n) => evals.filter((e) => !e.blocked && e.level === n).length);
    const handsOff = levelCounts[3] + levelCounts[4];
    const band = avgReadiness >= 85 ? "Ready" : avgReadiness >= 60 ? "Conditional" : "Not ready";

    return { total, healthy, warning, critical, tier0, production, orphaned, ready, conditional, notReady, avgReadiness, blocked, levelCounts, handsOff, band };
  }, []);

  const violRows = useMemo(() => {
    const pool = SERVICES.filter((s) => (violScope === "all" ? true : s.tier <= 1));
    const rows: { s: ServiceRecord; label: string; why: string; weight: number; fix: string }[] = [];
    pool.forEach((s) => {
      readiness(s).failing.forEach((f) => rows.push({ s, label: f.label, why: f.why, weight: f.weight, fix: f.fix }));
    });
    rows.sort((a, b) => a.s.tier - b.s.tier || b.weight - a.weight || a.s.name.localeCompare(b.s.name));
    return rows;
  }, [violScope]);
  const shownViolations = violRows.slice(0, 12);

  return (
    <div className="mx-auto max-w-[1600px] p-4 font-ibm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-black dark:text-zinc-100">Operational Service Catalog</h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-black/60 dark:text-zinc-400">
            The register that decides how much Scrubbe is allowed to do on its own. Every service
            carries an automation readiness score, a stored automation level, and the working
            behind both.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            onClick={onOpenTopology}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            Architecture view
          </button>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMoreOpen((v) => !v);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <MoreVertical size={16} />
            </button>
            {moreOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-10 z-20 w-36 rounded-md border border-zinc-200 bg-white p-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900"
              >
                {[
                  ["Import", "Import is coming in a later update"],
                  ["Export", "Export is coming in a later update"],
                  ["Sync", "Sync started — Kubernetes, AWS, GitHub, Datadog"],
                ].map(([label, msg]) => (
                  <button
                    key={label}
                    onClick={() => {
                      setMoreOpen(false);
                      toast.info(msg);
                    }}
                    className="block w-full rounded px-2.5 py-1.5 text-left text-[12.5px] text-black hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => toast.info("Add service form is coming in a later update")}
            className="rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
          >
            + Add service
          </button>
        </div>
      </div>

      {/* posture hero */}
      <Card className="mb-4 grid grid-cols-1 items-center gap-6 sm:grid-cols-[132px_1fr]">
        <div className="text-center">
          <ReadinessRing score={stats.avgReadiness} band={stats.band} />
          <div className={cn("mt-1.5 font-ibm text-[10.5px] font-bold uppercase tracking-wide", stats.band === "Ready" ? "text-emerald-700" : stats.band === "Conditional" ? "text-amber-700" : "text-rose-700")}>
            Fleet readiness
          </div>
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-black dark:text-zinc-100">
            {stats.handsOff} of {stats.total} services can be remediated without a human in the loop
          </h2>
          <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-black/60 dark:text-zinc-400">
            {stats.blocked ? `${stats.blocked} service${stats.blocked === 1 ? " is" : "s are"} gate-blocked because blast radius cannot be computed. ` : ""}
            {stats.notReady} service{stats.notReady === 1 ? "" : "s"} fail enough readiness checks
            that Scrubbe will only observe or propose. Raising a service&apos;s level is a matter
            of closing the checks below, not changing a setting.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {AUTOMATION_LEVELS.map((lvl) => (
              <button
                key={lvl.n}
                onClick={() => onOpenServices({ eal: lvl.short })}
                className="rounded-md border border-zinc-200 bg-white p-2.5 text-left hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="text-[11px] text-black/50 dark:text-zinc-500">{lvl.name}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-ibm text-[11px] font-bold text-black dark:text-zinc-100">{lvl.short}</span>
                  <span className="font-ibm text-[15px] font-bold text-black dark:text-zinc-100">{stats.levelCounts[lvl.n]}</span>
                </div>
              </button>
            ))}
            <button
              onClick={() => onOpenServices({ eal: "Gate blocked" })}
              className={cn(
                "rounded-md border p-2.5 text-left",
                stats.blocked ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900" : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900",
              )}
            >
              <div className="text-[11px] text-black/50 dark:text-zinc-500">Gate blocked</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded border border-rose-300 bg-rose-50 px-1.5 py-0.5 font-ibm text-[9.5px] font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
                  BLOCKED
                </span>
                <span className="font-ibm text-[15px] font-bold text-black dark:text-zinc-100">{stats.blocked}</span>
              </div>
            </button>
          </div>
        </div>
      </Card>

      {/* stat row */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Automation ready" value={stats.ready} sub={`${Math.round((stats.ready / stats.total) * 100)}% of the fleet`} />
        <StatCard label="Held at observe or propose" value={stats.levelCounts[0] + stats.levelCounts[1]} sub="Cannot act unaided" />
        <StatCard label="Gate blocked" value={stats.blocked} sub="Blast radius unknown" />
        <StatCard label="Total services" value={stats.total} sub={`${stats.production} in production`} />
        <StatCard label="Tier 0" value={stats.tier0} sub="Business critical" />
      </div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => onOpenServices()}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          See all
        </button>
      </div>

      {/* health distribution + criticality */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-[15px] font-bold text-black dark:text-zinc-100">Service health distribution</h3>
          {[
            ["Healthy", stats.healthy, "bg-emerald-500"],
            ["Warning", stats.warning, "bg-amber-500"],
            ["Critical", stats.critical, "bg-rose-500"],
          ].map(([label, n, cls]) => {
            const max = Math.max(stats.healthy, stats.warning, stats.critical, 1);
            return (
              <div key={label as string} className="flex items-center gap-3 py-2">
                <span className="flex w-16 shrink-0 items-center gap-1.5 text-[13px] font-semibold text-black dark:text-zinc-200">
                  <span className={cn("h-2 w-2 rounded-full", cls as string)} />
                  {label}
                </span>
                <span className="h-[9px] flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <span className={cn("block h-full rounded-full", cls as string)} style={{ width: `${((n as number) / max) * 100}%` }} />
                </span>
                <span className="w-8 shrink-0 text-right font-ibm text-[13px] font-semibold text-black dark:text-zinc-100">{n}</span>
              </div>
            );
          })}
        </Card>
        <Card>
          <h3 className="mb-3 text-[15px] font-bold text-black dark:text-zinc-100">Business criticality</h3>
          {[0, 1, 2, 3].map((t) => (
            <TierGroup key={t} tier={t} onOpenServiceDetail={onOpenServiceDetail} />
          ))}
        </Card>
      </div>

      {/* violations */}
      <Card className="mb-10">
        <div className="mb-1 flex flex-wrap items-center gap-3">
          <h3 className="text-[15px] font-bold text-black dark:text-zinc-100">What is holding automation back</h3>
          <div className="ml-auto flex items-center gap-2">
            <div className="inline-flex rounded-md border border-zinc-300 dark:border-zinc-700">
              <button
                onClick={() => setViolScope("tier01")}
                className={cn(
                  "rounded-l-md px-3 py-1.5 text-[12px] font-semibold",
                  violScope === "tier01" ? "bg-zinc-900 text-white" : "bg-white text-black/60 dark:bg-zinc-900 dark:text-zinc-400",
                )}
              >
                Tier 0 and 1
              </button>
              <button
                onClick={() => setViolScope("all")}
                className={cn(
                  "rounded-r-md border-l border-zinc-300 px-3 py-1.5 text-[12px] font-semibold dark:border-zinc-700",
                  violScope === "all" ? "bg-zinc-900 text-white" : "bg-white text-black/60 dark:bg-zinc-900 dark:text-zinc-400",
                )}
              >
                Everything
              </button>
            </div>
            <button
              onClick={() => onOpenServices({ owner: "Unassigned" })}
              className="rounded-md px-3 py-1.5 text-[12px] font-semibold text-black/60 hover:bg-zinc-50 dark:text-zinc-400"
            >
              Unowned services
            </button>
          </div>
        </div>
        <p className="mb-3 text-[13px] text-black/60 dark:text-zinc-400">
          Each row is a readiness check a service is failing, and the reason it caps that
          service&apos;s automation level. Fixing one here re-evaluates the level immediately.
        </p>
        {shownViolations.length === 0 ? (
          <div className="rounded-md border border-zinc-200 bg-white py-10 text-center text-[13px] text-black/50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-500">
            Nothing outstanding — every service in this scope passes all seven readiness checks.
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
            {shownViolations.map((row, i) => (
              <div
                key={`${row.s.id}-${row.label}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  i !== shownViolations.length - 1 && "border-b border-zinc-100 dark:border-zinc-800",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-black dark:text-zinc-100">
                    {row.s.name} — {row.label.toLowerCase()}{" "}
                    <span className="font-normal text-black/40 dark:text-zinc-500">· Tier {row.s.tier}</span>
                  </div>
                  <div className="text-[12px] text-black/50 dark:text-zinc-500">{row.why}</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => onOpenServiceDetail(row.s.name)}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-[12px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => toast.info(`${row.fix} — coming in a later update for ${row.s.name}`)}
                    className="rounded-md bg-zinc-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-black dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    {row.fix}
                  </button>
                </div>
              </div>
            ))}
            {violRows.length > shownViolations.length && (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-[12.5px] text-black/50 dark:text-zinc-500">
                  {violRows.length - shownViolations.length} more outstanding checks in this scope.
                </span>
                <button
                  onClick={() => onOpenServices({ readiness: "Not ready" })}
                  className="ml-auto rounded-md px-3 py-1.5 text-[12px] font-semibold text-black/60 hover:bg-zinc-50 dark:text-zinc-400"
                >
                  See them in the table
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <Card>
      <div className="text-[12px] font-medium text-black/60 dark:text-zinc-400">{label}</div>
      <div className="mt-1.5 font-ibm text-[22px] font-bold text-black dark:text-zinc-100">{value}</div>
      <div className="mt-0.5 text-[11.5px] text-black/40 dark:text-zinc-500">{sub}</div>
    </Card>
  );
}

function TierGroup({
  tier,
  onOpenServiceDetail,
}: {
  tier: number;
  onOpenServiceDetail: (name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const list = SERVICES.filter((s) => s.tier === tier);
  const ready = list.filter((s) => readiness(s).band === "Ready").length;
  const shown = expanded ? list : list.slice(0, 6);
  return (
    <div className="mb-3.5 last:mb-0">
      <div className="mb-2 flex items-center gap-2">
        <TierBadge tier={tier} />
        <span className="ml-auto font-ibm text-[11px] text-black/40 dark:text-zinc-500">
          {ready}/{list.length} ready · ceiling {LEVEL(tier === 0 ? 2 : tier === 1 ? 3 : 4).short}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {shown.map((s) => (
          <button
            key={s.id}
            onClick={() => onOpenServiceDetail(s.name)}
            title={`Readiness ${readiness(s).score}/100`}
            className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[12px] text-black hover:border-emerald-400 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {s.name}
          </button>
        ))}
        {list.length > 6 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[12px] text-black/50 hover:text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
          >
            {expanded ? "Show less" : `+${list.length - 6} more`}
          </button>
        )}
      </div>
    </div>
  );
}
