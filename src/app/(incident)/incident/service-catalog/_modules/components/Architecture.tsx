"use client";

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronRight, Minus, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICES, ServiceRecord, byName } from "./serviceCatalog.data";

interface TopoNode {
  id: string;
  label: string;
  kind: "external" | "gateway" | "app" | "data" | "infra";
  domain?: string;
  svc?: ServiceRecord | null;
  env: string;
}

const EXTERNAL: [string, string][] = [
  ["ext-idp", "Identity Provider (SSO)"], ["ext-pay", "Payment Processor"], ["ext-comm", "Email / SMS Gateway"],
  ["ext-observ", "Observability Vendor"], ["ext-analytics", "Analytics Vendor"], ["ext-cloud", "Cloud Provider APIs"],
];
const GATEWAY: [string, string][] = [
  ["gw-cdn", "CDN Edge"], ["gw-waf", "WAF"], ["gw-lb", "Load Balancer"], ["gw-api", "API Gateway"], ["gw-mesh", "Service Mesh Ingress"],
];
const DATA_LABELS = ["Data Warehouse", "Cache Layer", "Message Queue", "Search Index", "Object Storage"];
const INFRA: [string, string][] = [
  ["infra-k8s", "Kubernetes Control Plane"], ["infra-secrets", "Secrets Manager"], ["infra-config", "Config Service"],
  ["infra-observ", "Observability Pipeline"], ["infra-signal", "Signal Graph"],
];

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function buildTopology() {
  const byOwner = new Map<string, ServiceRecord[]>();
  SERVICES.forEach((s) => {
    if (s.owner === "Unassigned") return;
    if (!byOwner.has(s.owner)) byOwner.set(s.owner, []);
    byOwner.get(s.owner)!.push(s);
  });
  const domainNodes: { domain: string; nodes: TopoNode[] }[] = [];
  byOwner.forEach((list, domain) => {
    const picks = [...list].sort((a, b) => (b.tier === a.tier ? b.deps - a.deps : a.tier - b.tier)).slice(0, 4);
    domainNodes.push({
      domain,
      nodes: picks.map((s) => ({ id: "app-" + s.id, label: s.name, kind: "app" as const, domain, svc: s, env: s.env })),
    });
  });
  const appNodes = domainNodes.flatMap((d) => d.nodes);

  const externalNodes: TopoNode[] = EXTERNAL.map(([id, label]) => ({ id, label, kind: "external", env: "All" }));
  const gatewayNodes: TopoNode[] = GATEWAY.map(([id, label]) => ({ id, label, kind: "gateway", env: "All" }));
  const dataNodes: TopoNode[] = DATA_LABELS.map((label) => {
    const svc = byName(label) || null;
    return { id: "data-" + slug(label), label, kind: "data", svc, env: svc ? svc.env : "All" };
  });
  const infraNodes: TopoNode[] = INFRA.map(([id, label]) => ({ id, label, kind: "infra", env: "All" }));

  const edges: [string, string][] = [];
  externalNodes.forEach((e, i) => edges.push([e.id, gatewayNodes[i % gatewayNodes.length].id]));
  gatewayNodes.forEach((g) => appNodes.forEach((a, i) => { if ((i + g.id.length) % 3 === 0) edges.push([g.id, a.id]); }));
  appNodes.forEach((a, i) => edges.push([a.id, dataNodes[i % dataNodes.length].id]));
  dataNodes.forEach((d, i) => edges.push([d.id, infraNodes[i % infraNodes.length].id]));
  for (let i = 0; i < Math.min(14, appNodes.length - 1); i++) {
    edges.push([appNodes[i].id, appNodes[(i * 3 + 2) % appNodes.length].id]);
  }

  return { externalNodes, gatewayNodes, domainNodes, dataNodes, infraNodes, appNodes, edges };
}

const HEALTH_DOT: Record<string, string> = { Healthy: "#10b981", Warning: "#d97706", Critical: "#e11d48" };

export default function Architecture({ onBackToOverview }: { onBackToOverview: () => void }) {
  const topo = useMemo(buildTopology, []);
  const allNodes = useMemo(
    () => [...topo.externalNodes, ...topo.gatewayNodes, ...topo.appNodes, ...topo.dataNodes, ...topo.infraNodes],
    [topo],
  );
  const nodeMap = useMemo(() => new Map(allNodes.map((n) => [n.id, n])), [allNodes]);

  const [envFilter, setEnvFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [hops, setHops] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [graphUp, setGraphUp] = useState(true);
  const [origin, setOrigin] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const set = new Set<string>();
    allNodes.forEach((n) => {
      const matchesEnv =
        envFilter === "All" || n.env === "All" || n.env === envFilter || (envFilter === "Development" && ["Development", "QA", "Preview"].includes(n.env));
      const matchesSearch = !q || n.label.toLowerCase().includes(q);
      if (matchesEnv && matchesSearch) set.add(n.id);
    });
    return set;
  }, [allNodes, envFilter, search]);

  const visibleEdges = useMemo(
    () => topo.edges.filter(([a, b]) => visible.has(a) && visible.has(b)),
    [topo.edges, visible],
  );

  function reachWithin(nid: string, maxHops: number) {
    const dist = new Map<string, number>([[nid, 0]]);
    let frontier = [nid];
    for (let h = 1; h <= maxHops; h++) {
      const next: string[] = [];
      frontier.forEach((cur) => {
        visibleEdges.forEach(([a, b]) => {
          const other = a === cur ? b : b === cur ? a : null;
          if (other && !dist.has(other)) {
            dist.set(other, h);
            next.push(other);
          }
        });
      });
      frontier = next;
      if (!frontier.length) break;
    }
    return dist;
  }

  const blast = useMemo(() => {
    if (!origin || !graphUp) return null;
    return reachWithin(origin, hops);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, hops, graphUp, visibleEdges]);

  function defaultOrigin(): string | null {
    const degree = new Map<string, number>();
    visibleEdges.forEach(([a, b]) => {
      degree.set(a, (degree.get(a) ?? 0) + 1);
      degree.set(b, (degree.get(b) ?? 0) + 1);
    });
    let best: string | null = null, bestScore = -1;
    degree.forEach((score, nid) => {
      const n = nodeMap.get(nid);
      const boost = n?.svc ? (4 - n.svc.tier) * 2 : 0;
      const total = score + boost;
      if (total > bestScore) { bestScore = total; best = nid; }
    });
    return best ?? Array.from(visible)[0] ?? null;
  }

  function handleNodeClick(nid: string) {
    if (!graphUp) {
      toast.warning("Blast radius UNKNOWN — the graph service cannot answer, so the execution gate blocks rather than assume a low radius.");
      setOrigin(nid);
      return;
    }
    setOrigin(nid);
  }

  function handleHop(n: number) {
    setHops(n);
    if (!origin) {
      const def = defaultOrigin();
      if (!def) {
        toast.warning("No nodes are visible at this filter — clear the environment filter to measure a blast radius");
        return;
      }
      setOrigin(def);
      toast.info(`Measuring from ${nodeMap.get(def)?.label ?? def} — click any node to change the origin`);
    }
  }

  const blastLabel = useMemo(() => {
    if (!origin) return null;
    if (!graphUp) return "Blast radius UNKNOWN — the graph service cannot answer, so the execution gate blocks rather than assume a low radius.";
    if (!blast) return null;
    const hit = Array.from(blast.keys()).filter((k) => k !== origin);
    const direct = hit.filter((k) => blast.get(k) === 1).length;
    const name = nodeMap.get(origin)?.label ?? origin;
    return `Blast radius from "${name}" — ${direct} directly connected, ${hit.length} reachable within ${hops} hop${hops === 1 ? "" : "s"}.`;
  }, [origin, graphUp, blast, hops, nodeMap]);

  // ── edge drawing ──
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const [svgPaths, setSvgPaths] = useState<{ key: string; d: string; hot: boolean }[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const rect = container.getBoundingClientRect();
      const pos = new Map<string, { x: number; y: number }>();
      nodeRefs.current.forEach((el, id) => {
        if (!visible.has(id)) return;
        const r = el.getBoundingClientRect();
        pos.set(id, {
          x: (r.left - rect.left + r.width / 2) / zoom,
          y: (r.top - rect.top + r.height / 2) / zoom,
        });
      });
      const paths = visibleEdges
        .map(([from, to]) => {
          const a = pos.get(from), b = pos.get(to);
          if (!a || !b) return null;
          const midY = (a.y + b.y) / 2;
          const hot = !!blast && blast.has(from) && blast.has(to);
          return { key: `${from}|${to}`, d: `M${a.x},${a.y} C${a.x},${midY} ${b.x},${midY} ${b.x},${b.y}`, hot };
        })
        .filter(Boolean) as { key: string; d: string; hot: boolean }[];
      setSvgPaths(paths);
      setSvgSize({ w: container.scrollWidth / zoom, h: container.scrollHeight / zoom });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [visible, visibleEdges, zoom, blast]);

  return (
    <div className="mx-auto max-w-[1700px] p-4 font-ibm sm:p-6">
      <div className="mb-2 flex items-center gap-1.5 text-[12.5px] text-black/40 dark:text-zinc-500">
        <button onClick={onBackToOverview} className="hover:text-black dark:hover:text-zinc-200">
          Overview
        </button>
        <ChevronRight size={13} />
        <span className="font-semibold text-black dark:text-zinc-200">Architecture view</span>
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-black dark:text-zinc-100">Architecture view</h1>
          <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-black/60 dark:text-zinc-400">
            A live, layered system map — edge, gateway, application services, data &amp;
            messaging, and platform infrastructure — spanning every domain Scrubbe ingests
            incidents from, not just commerce. Select any node to trace blast radius or open its
            profile.
          </p>
        </div>
        <button
          onClick={onBackToOverview}
          className="shrink-0 text-[13px] font-semibold text-black/50 hover:text-black dark:text-zinc-500 dark:hover:text-zinc-200"
        >
          Back to overview
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-[240px]">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a node…"
            className="h-[38px] w-full rounded-md border border-zinc-300 bg-white pl-8 pr-3 text-[13px] text-black placeholder:text-black/40 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </div>
        {["All environments", "Production", "Staging", "Dev / QA"].map((label) => {
          const key = label === "All environments" ? "All" : label === "Dev / QA" ? "Development" : label;
          return (
            <button
              key={label}
              onClick={() => setEnvFilter(key)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold",
                envFilter === key ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white text-black/60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
              )}
            >
              {label}
            </button>
          );
        })}
        <div className="inline-flex rounded-md border border-zinc-300 dark:border-zinc-700">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => handleHop(n)}
              className={cn(
                "px-3.5 py-1.5 text-[12.5px] font-semibold",
                n !== 1 && "border-l border-zinc-300 dark:border-zinc-700",
                hops === n ? "bg-zinc-900 text-white" : "bg-white text-black/60 dark:bg-zinc-900 dark:text-zinc-400",
              )}
            >
              {n} hop{n > 1 ? "s" : ""}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setGraphUp((v) => !v);
            toast[graphUp ? "warning" : "success"](
              graphUp ? "Graph service unreachable — every execution gate is now blocked" : "Graph service restored — automation levels re-evaluated across the fleet",
            );
          }}
          className="rounded-md border border-zinc-300 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {graphUp ? "Simulate graph outage" : "Restore graph service"}
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))} className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200">
            <Minus size={14} />
          </button>
          <button onClick={() => setZoom(1)} className="flex h-8 w-14 items-center justify-center rounded-md border border-zinc-300 text-[11.5px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200">
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200">
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "mb-3 flex items-start gap-3 rounded-md border p-3.5",
          graphUp ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/5" : "border-rose-300 bg-rose-50/60 dark:border-rose-500/30 dark:bg-rose-500/5",
        )}
      >
        <div>
          <div className={cn("text-[13px] font-bold", graphUp ? "text-emerald-800 dark:text-emerald-300" : "text-rose-800 dark:text-rose-300")}>
            {graphUp ? "Graph service reachable" : "Graph service unreachable"}
          </div>
          <div className="text-[12.5px] text-black/60 dark:text-zinc-400">
            {graphUp
              ? "Blast radius is computable, so the execution gate evaluates normally."
              : "Blast radius is UNKNOWN for every service. The execution gate blocks across the fleet — it never falls back to assuming a low radius."}
          </div>
        </div>
      </div>

      {blastLabel && (
        <div className="mb-3 flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-[13px] text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
          <span className="flex-1">{blastLabel}</span>
          <button
            onClick={() => setOrigin(null)}
            className="shrink-0 font-semibold text-blue-800 hover:underline dark:text-blue-300"
          >
            Clear highlight
          </button>
        </div>
      )}

      <div className="overflow-auto rounded-lg border border-zinc-200 bg-[linear-gradient(#F7F8FA_1px,transparent_1px),linear-gradient(90deg,#F7F8FA_1px,transparent_1px)] bg-white [background-size:26px_26px] dark:border-zinc-800 dark:bg-zinc-900/20">
        <div
          ref={containerRef}
          className="relative min-w-[1180px] origin-top-left"
          style={{ transform: `scale(${zoom})` }}
        >
          <svg
            className="pointer-events-none absolute left-0 top-0"
            width={svgSize.w}
            height={svgSize.h}
            viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
          >
            {svgPaths.map((p) => (
              <path key={p.key} d={p.d} fill="none" stroke={p.hot ? "#2563eb" : "#D8DDE6"} strokeWidth={p.hot ? 2 : 1.4} />
            ))}
          </svg>

          <Layer label="External & third-party" count={topo.externalNodes.length}>
            <NodeRow nodes={topo.externalNodes} visible={visible} nodeRefs={nodeRefs} origin={origin} blast={blast} onClick={handleNodeClick} />
          </Layer>
          <Layer label="Edge & gateway" count={topo.gatewayNodes.length}>
            <NodeRow nodes={topo.gatewayNodes} visible={visible} nodeRefs={nodeRefs} origin={origin} blast={blast} onClick={handleNodeClick} />
          </Layer>
          <Layer label="Application services — by domain" count={topo.appNodes.length}>
            {topo.domainNodes.map((d) => (
              <div key={d.domain} className="mb-3">
                <div className="mb-1.5 text-[11px] font-semibold text-black/40 dark:text-zinc-500">{d.domain}</div>
                <NodeRow nodes={d.nodes} visible={visible} nodeRefs={nodeRefs} origin={origin} blast={blast} onClick={handleNodeClick} />
              </div>
            ))}
          </Layer>
          <Layer label="Data & messaging" count={topo.dataNodes.length}>
            <NodeRow nodes={topo.dataNodes} visible={visible} nodeRefs={nodeRefs} origin={origin} blast={blast} onClick={handleNodeClick} />
          </Layer>
          <Layer label="Platform & infrastructure" count={topo.infraNodes.length} last>
            <NodeRow nodes={topo.infraNodes} visible={visible} nodeRefs={nodeRefs} origin={origin} blast={blast} onClick={handleNodeClick} />
          </Layer>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-black/60 dark:text-zinc-400">
        <LegendItem color="#10b981" label="Healthy" />
        <LegendItem color="#d97706" label="Warning" />
        <LegendItem color="#e11d48" label="Critical — active incident" />
        <LegendItem outline="rose" label="Tier 0 · business critical" />
        <LegendItem outline="blue" label="Highlighted blast radius" />
        <LegendItem color="#18181b" label="Selected origin node" />
      </div>
    </div>
  );
}

function Layer({ label, count, children, last }: { label: string; count: number; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn("px-1 py-4", !last && "mb-2 border-b border-dashed border-zinc-200 dark:border-zinc-800")}>
      <div className="mb-3 flex items-center gap-2 font-ibm text-[10.5px] font-bold uppercase tracking-wide text-black/40 dark:text-zinc-500">
        {label}
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-ibm text-[10px] font-semibold text-black/50 dark:bg-zinc-800 dark:text-zinc-400">{count}</span>
      </div>
      {children}
    </div>
  );
}

function LegendItem({ color, outline, label }: { color?: string; outline?: "rose" | "blue"; label: string }) {
  return (
    <span className="flex items-center gap-2">
      {outline ? (
        <span className={cn("h-2.5 w-2.5 rounded-sm border-2", outline === "rose" ? "border-rose-400" : "border-blue-400")} />
      ) : (
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      )}
      {label}
    </span>
  );
}

function NodeRow({
  nodes,
  visible,
  nodeRefs,
  origin,
  blast,
  onClick,
}: {
  nodes: TopoNode[];
  visible: Set<string>;
  nodeRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  origin: string | null;
  blast: Map<string, number> | null;
  onClick: (id: string) => void;
}) {
  return (
    <div className="relative z-[2] flex flex-wrap gap-2.5">
      {nodes.map((n) => {
        if (!visible.has(n.id)) return null;
        const isOrigin = origin === n.id;
        const dist = blast?.get(n.id);
        const isBlast = !isOrigin && dist !== undefined;
        const isDim = !!origin && !isOrigin && dist === undefined;
        const health = n.svc?.health;
        const dotColor = health ? HEALTH_DOT[health] : "#8B93A1";
        return (
          <div
            key={n.id}
            ref={(el) => {
              if (el) nodeRefs.current.set(n.id, el);
              else nodeRefs.current.delete(n.id);
            }}
            data-nid={n.id}
          >
            <button
              onClick={() => onClick(n.id)}
              style={isBlast && dist ? { opacity: 1 - (dist - 1) * 0.22 } : undefined}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-md border bg-white px-3 py-2 text-[12px] font-semibold text-black shadow-sm transition-opacity hover:shadow-md dark:bg-zinc-900 dark:text-zinc-100",
                isOrigin
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : isBlast
                    ? "border-blue-400 ring-2 ring-blue-100 dark:ring-blue-500/20"
                    : n.svc?.tier === 0
                      ? "border-2 border-rose-400"
                      : n.svc?.tier === 1
                        ? "border-amber-400"
                        : "border-zinc-200 dark:border-zinc-700",
                isDim && "opacity-20",
              )}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: isOrigin ? "#fff" : dotColor }} />
              {n.label}
              {!!n.svc?.incidents && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 font-ibm text-[9px] font-bold text-white">{n.svc.incidents}</span>
              )}
              {!n.svc && n.kind !== "app" && (
                <span className="font-ibm text-[9px] text-black/35 dark:text-zinc-600">{n.kind}</span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
