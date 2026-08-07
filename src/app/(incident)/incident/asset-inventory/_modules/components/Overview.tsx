"use client";

import React, { useMemo } from "react";
import {
  TriangleAlert, Activity, GitCompareArrows, ShieldAlert, KeyRound, UserRoundX, Tag, Lock,
  ChevronRight, Database, Boxes, Server,
} from "lucide-react";
import { Asset, RECENT_ACTIVITY, TableScope, ago } from "./assetInventory.data";
import { Card, ListRow, PanelHead } from "./AssetInventoryPrimitives";

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  k8s: <Boxes size={14} />,
  db: <Database size={14} />,
  cert: <Lock size={14} />,
  iam: <KeyRound size={14} />,
  s3: <Server size={14} />,
};

interface RiskRow {
  key: string;
  icon: React.ReactNode;
  tone: "red" | "amber" | "blue" | "green" | "neutral";
  nm: string;
  note: string;
  n: number;
  go: () => void;
}

export default function Overview({
  assets, onScopeTo, onOpenDetail, onNavCategory,
}: {
  assets: Asset[];
  onScopeTo: (scope: TableScope) => void;
  onOpenDetail: (id: string) => void;
  onNavCategory: (category: string) => void;
}) {
  const rows = useMemo<RiskRow[]>(() => {
    const certs = assets.filter((a) => a.category === "Certificates");
    const expiring = certs.filter((a) => (a.expiresInDays ?? 999) <= 30);
    const soonest = expiring.length ? Math.min(...expiring.map((a) => a.expiresInDays ?? 999)) : null;
    const critical = assets.filter((a) => a.health === "Critical");
    const degraded = assets.filter((a) => a.health === "Degraded");
    const violating = assets.filter((a) => a.compliance === "Violating");
    const prodDrift = assets.filter((a) => a.drift && a.env === "Prod");
    const untagged = assets.filter((a) => !a.tagged);
    const staleSecrets = assets.filter((a) => a.category === "Secrets" && a.drift);
    const unowned = assets.filter((a) => a.lifecycle === "Deprecated");

    const list: RiskRow[] = [
      {
        key: "certs", icon: <Lock size={15} />, tone: soonest !== null && soonest <= 7 ? "red" : "amber",
        nm: "Certificates expiring inside 30 days",
        note: expiring.length ? `Soonest renews in ${soonest} day${soonest === 1 ? "" : "s"} — renewal is one click on the Certificates page` : "Nothing expiring in the window",
        n: expiring.length, go: () => onNavCategory("certificates"),
      },
      {
        key: "critical", icon: <TriangleAlert size={15} />, tone: "red",
        nm: "Assets in critical health", note: "Failing readiness or saturation checks right now",
        n: critical.length, go: () => onScopeTo({ health: "Critical", label: "Critical" }),
      },
      {
        key: "proddrift", icon: <GitCompareArrows size={15} />, tone: "amber",
        nm: "Production assets drifted from declared state", note: "Running config no longer matches what was provisioned",
        n: prodDrift.length, go: () => onScopeTo({ pred: (a) => a.drift && a.env === "Prod", label: "Prod drift" }),
      },
      {
        key: "degraded", icon: <Activity size={15} />, tone: "amber",
        nm: "Assets degraded but still serving", note: "Elevated error rate, restarts, or replica lag",
        n: degraded.length, go: () => onScopeTo({ health: "Degraded", label: "Degraded" }),
      },
      {
        key: "violating", icon: <ShieldAlert size={15} />, tone: "amber",
        nm: "Open compliance violations", note: "Set against a named benchmark — resolvable from the asset",
        n: violating.length, go: () => onScopeTo({ compliance: "Violating", label: "Violating" }),
      },
      {
        key: "secrets", icon: <KeyRound size={15} />, tone: staleSecrets.length ? "amber" : "green",
        nm: "Secrets overdue for rotation", note: "Past their rotation window in Vault or Secrets Manager",
        n: staleSecrets.length, go: () => onScopeTo({ pred: (a) => a.category === "Secrets" && a.drift, label: "Rotation overdue" }),
      },
      {
        key: "unowned", icon: <UserRoundX size={15} />, tone: unowned.length ? "blue" : "green",
        nm: "Assets with no active owner", note: "Stuck in a deprecated state — nobody is on call for these",
        n: unowned.length, go: () => onScopeTo({ lifecycle: "Deprecated", label: "No active owner" }),
      },
      {
        key: "untagged", icon: <Tag size={15} />, tone: untagged.length ? "blue" : "green",
        nm: "Assets missing governance tags", note: "Cannot be attributed to a cost center or policy scope",
        n: untagged.length, go: () => onScopeTo({ pred: (a) => !a.tagged, label: "Untagged" }),
      },
    ];
    return list.sort((x, y) => (x.n > 0 ? 0 : 1) - (y.n > 0 ? 0 : 1));
  }, [assets, onScopeTo, onNavCategory]);

  return (
    <>
      <Card className="mb-4">
        <PanelHead
          title={
            <>
              Operational risks
              <span className="inline-flex items-center gap-1.5 font-ibm text-[10.5px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            </>
          }
          hint="What is currently exposed, and what to do about it. Every row opens the assets behind it."
        />
        <div>
          {rows.map((r) => (
            <ListRow
              key={r.key}
              onClick={r.go}
              icon={r.icon}
              tone={r.tone}
              title={r.nm}
              note={r.note}
              right={
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-ibm text-[16px] font-bold text-black dark:text-zinc-100">{r.n.toLocaleString()}</span>
                  <ChevronRight size={15} className="text-black/30 dark:text-zinc-600" />
                </div>
              }
            />
          ))}
        </div>
      </Card>

      <Card>
        <PanelHead title="Recent activity stream" hint="Live feed from discovery, drift scanning, and policy engines." />
        <div>
          {RECENT_ACTIVITY.map((a, i) => (
            <ListRow
              key={i}
              onClick={() => {
                if (a.jump.name) {
                  const asset = assets.find((x) => x.name === a.jump.name);
                  if (asset) onOpenDetail(asset.id);
                } else if (a.jump.category) {
                  onScopeTo({ category: a.jump.category, label: a.jump.category });
                }
              }}
              icon={ACTIVITY_ICON[a.icon]}
              title={a.text}
              right={<span className="shrink-0 font-ibm text-[11px] text-black/40 dark:text-zinc-500">{ago(a.mins)}</span>}
            />
          ))}
        </div>
      </Card>
    </>
  );
}
