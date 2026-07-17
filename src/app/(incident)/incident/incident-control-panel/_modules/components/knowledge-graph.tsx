// components/ICP/KnowledgeGraph.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  Globe,
  Shield,
  CreditCard,
  ShoppingCart,
  Database,
  Layers,
  LucideIcon,
} from "lucide-react";
import { Panel, ChartCard, LinkAction } from "./shared";
import SideModal from "@/components/ui/SideModal";

// ── Graph data ───────────────────────────────────────────────────

const NODE_ICONS: Record<string, LucideIcon> = {
  globe: Globe,
  shield: Shield,
  card: CreditCard,
  cart: ShoppingCart,
  db: Database,
  stack: Layers,
};

interface KGNode {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
  big?: boolean;
  monitored: boolean;
  affected: boolean;
  impact?: string;
  layer: string;
  ic: string;
}

interface KGEdge {
  from: string;
  to: string;
  type: "dep" | "rel" | "impact";
}

const NODES: KGNode[] = [
  {
    id: "web",
    x: 0.5,
    y: 0.1,
    label: "Web Frontend",
    color: "#3B82F6",
    monitored: true,
    affected: true,
    impact: "Watch",
    layer: "Services",
    ic: "globe",
  },
  {
    id: "auth",
    x: 0.15,
    y: 0.32,
    label: "Auth Service",
    color: "#3B82F6",
    monitored: true,
    affected: false,
    layer: "Services",
    ic: "shield",
  },
  {
    id: "pay",
    x: 0.85,
    y: 0.32,
    label: "Payment Gateway",
    color: "#A855F7",
    monitored: true,
    affected: false,
    layer: "Dependencies",
    ic: "card",
  },
  {
    id: "checkout",
    x: 0.5,
    y: 0.46,
    label: "Checkout Service",
    color: "#EF4444",
    big: true,
    monitored: true,
    affected: true,
    impact: "Root",
    layer: "Services",
    ic: "cart",
  },
  {
    id: "userdb",
    x: 0.18,
    y: 0.68,
    label: "User DB",
    color: "#02DD82",
    monitored: true,
    affected: true,
    impact: "Cascade",
    layer: "Infrastructure",
    ic: "db",
  },
  {
    id: "redis",
    x: 0.45,
    y: 0.76,
    label: "Redis Cache",
    color: "#F59E0B",
    monitored: true,
    affected: true,
    impact: "Cascade",
    layer: "Infrastructure",
    ic: "db",
  },
  {
    id: "kafka",
    x: 0.8,
    y: 0.62,
    label: "Kafka Cluster",
    color: "#02DD82",
    monitored: true,
    affected: false,
    layer: "Infrastructure",
    ic: "stack",
  },
  {
    id: "analytics",
    x: 0.9,
    y: 0.84,
    label: "Analytics DB",
    color: "#02DD82",
    monitored: true,
    affected: false,
    layer: "Infrastructure",
    ic: "db",
  },
  {
    id: "email",
    x: 0.64,
    y: 0.9,
    label: "Email Service",
    color: "#94A3B8",
    monitored: false,
    affected: false,
    layer: "Dependencies",
    ic: "globe",
  },
];

const EDGES: KGEdge[] = [
  { from: "web", to: "auth", type: "dep" },
  { from: "web", to: "pay", type: "dep" },
  { from: "web", to: "checkout", type: "impact" },
  { from: "auth", to: "checkout", type: "rel" },
  { from: "pay", to: "checkout", type: "rel" },
  { from: "checkout", to: "userdb", type: "impact" },
  { from: "checkout", to: "redis", type: "impact" },
  { from: "checkout", to: "kafka", type: "rel" },
  { from: "auth", to: "userdb", type: "dep" },
  { from: "kafka", to: "redis", type: "dep" },
  { from: "userdb", to: "analytics", type: "dep" },
  { from: "checkout", to: "email", type: "rel" },
];

const EDGE_COLORS = { dep: "#94A3B8", rel: "#3B82F6", impact: "#EF4444" };

const FILTERS = [
  { key: "Services", color: "#3B82F6" },
  { key: "Infrastructure", color: "#02DD82" },
  { key: "Deployments", color: "#F59E0B" },
  { key: "Incidents", color: "#EF4444" },
  { key: "Dependencies", color: "#A855F7" },
];

const LEGEND = [
  { color: "#02DD82", label: "Healthy", type: "dot" },
  { color: "#F59E0B", label: "Warning", type: "dot" },
  { color: "#EF4444", label: "Critical", type: "dot" },
  { color: "#94A3B8", label: "Unknown", type: "dot" },
  { color: "none", label: "Unmonitored · no telemetry", type: "ring" },
  { color: "#EF4444", label: "In blast radius", type: "blast" },
];

const EDGE_LEGEND = [
  { label: "Dependency", color: "#94A3B8", dashed: false },
  { label: "Related To", color: "#3B82F6", dashed: false },
  { label: "Incident Impact", color: "#EF4444", dashed: true },
];

// ── Graph SVG renderer ───────────────────────────────────────────

function KnowledgeGraphSVG({
  width = 320,
  height = 270,
  coverageMode,
  activeFilter,
}: {
  width?: number;
  height?: number;
  coverageMode: boolean;
  activeFilter: string;
}) {
  const nodeMap = useMemo(() => {
    const map: Record<string, { px: number; py: number } & KGNode> = {};
    NODES.forEach((n) => {
      map[n.id] = { ...n, px: n.x * width, py: n.y * height };
    });
    return map;
  }, [width, height]);

  const scale = width > 400 ? 1.7 : 1;
  const isHighlighted = (n: KGNode) =>
    activeFilter === "Services" || n.layer === activeFilter;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ maxHeight: height }}
    >
      {/* Edges */}
      {EDGES.map((e, i) => {
        const a = nodeMap[e.from];
        const b = nodeMap[e.to];
        if (!a || !b) return null;
        const unmon = !a.monitored || !b.monitored;
        const dimmed =
          !isHighlighted(a) && !isHighlighted(b) && activeFilter !== "Services";
        return (
          <line
            key={i}
            x1={a.px}
            y1={a.py}
            x2={b.px}
            y2={b.py}
            stroke={unmon ? "#CBD5E1" : EDGE_COLORS[e.type]}
            strokeWidth={e.type === "impact" ? 1.6 * scale : 1.2 * scale}
            strokeOpacity={
              dimmed ? 0.15 : unmon ? 0.45 : e.type === "dep" ? 0.9 : 0.7
            }
            strokeDasharray={
              e.type === "impact"
                ? `${3 * scale} ${3 * scale}`
                : unmon
                  ? `${2 * scale} ${3 * scale}`
                  : undefined
            }
          />
        );
      })}

      {/* Nodes */}
      {Object.values(nodeMap).map((n) => {
        const R = (n.big ? 22 : 16) * scale;
        const dimCoverage = coverageMode && n.monitored ? 0.35 : 1;
        const dimFilter =
          !isHighlighted(n) && activeFilter !== "Services" ? 0.25 : 1;
        const dim = Math.min(dimCoverage, dimFilter);
        const emphUnmon = coverageMode && !n.monitored;

        return (
          <g key={n.id}>
            {/* Blast radius halo */}
            {n.affected && n.monitored && !coverageMode && (
              <circle
                cx={n.px}
                cy={n.py}
                r={R + 8 * scale}
                fill="none"
                stroke="#EF4444"
                strokeWidth={1.4 * scale}
                strokeOpacity={0.5 * dim}
                strokeDasharray={`${2.5 * scale} ${2.5 * scale}`}
              />
            )}

            {/* Unmonitored ring */}
            {!n.monitored && (
              <circle
                cx={n.px}
                cy={n.py}
                r={R + (emphUnmon ? 7 : 4) * scale}
                fill="none"
                stroke={emphUnmon ? "#F59E0B" : "#94A3B8"}
                strokeWidth={(emphUnmon ? 2 : 1.6) * scale}
                strokeDasharray={`${3 * scale} ${3 * scale}`}
              />
            )}

            {/* Node circle */}
            {n.monitored ? (
              <>
                <circle
                  cx={n.px}
                  cy={n.py}
                  r={R + 5 * scale}
                  fill={n.color}
                  fillOpacity={0.12 * dim}
                />
                <circle
                  cx={n.px}
                  cy={n.py}
                  r={R}
                  fill={n.color}
                  fillOpacity={(n.big ? 0.95 : 0.85) * dim}
                  stroke={n.color}
                  strokeWidth={1.5}
                  strokeOpacity={dim}
                />
              </>
            ) : (
              <circle
                cx={n.px}
                cy={n.py}
                r={R}
                fill="#E2E8F0"
                fillOpacity={0.9}
                stroke="#94A3B8"
                strokeWidth={1.2 * scale}
              />
            )}

            {/* Node icon */}
            {(() => {
              const Icon = NODE_ICONS[n.ic];
              const iconSize = (n.big ? 16 : 13) * scale;
              return Icon ? (
                <foreignObject
                  x={n.px - iconSize / 2}
                  y={n.py - iconSize / 2}
                  width={iconSize}
                  height={iconSize}
                  opacity={dim}
                >
                  <div
                    style={{
                      width: iconSize,
                      height: iconSize,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: n.monitored ? "#fff" : "#64748B",
                    }}
                  >
                    <Icon size={iconSize * 0.8} />
                  </div>
                </foreignObject>
              ) : null;
            })()}

            {/* Label */}
            <text
              x={n.px}
              y={n.py + R + 12 * scale}
              textAnchor="middle"
              fill={n.monitored ? "#334155" : "#94A3B8"}
              fontSize={9 * scale}
              fontWeight={600}
              fontFamily="'IBM Plex Sans', system-ui, sans-serif"
              opacity={dim}
            >
              {n.label}
            </text>

            {/* "no telemetry" tag for unmonitored */}
            {!n.monitored && (
              <text
                x={n.px}
                y={n.py + R + 21 * scale}
                textAnchor="middle"
                fill="#B45309"
                fontSize={7.2 * scale}
                fontFamily="'IBM Plex Mono', monospace"
              >
                no telemetry
              </text>
            )}

            {/* Impact label */}
            {n.impact && !coverageMode && (
              <text
                x={n.px}
                y={n.py - R - 4 * scale}
                textAnchor="middle"
                fill={
                  n.impact === "Root"
                    ? "#EF4444"
                    : n.impact === "Cascade"
                      ? "#F59E0B"
                      : "#3B82F6"
                }
                fontSize={7 * scale}
                fontWeight={700}
                fontFamily="'IBM Plex Mono', monospace"
                opacity={dim}
              >
                {n.impact}
              </text>
            )}
          </g>
        );
      })}

      {/* Edge type legend (bottom right) */}
      <g
        transform={`translate(${width - 110 * scale}, ${height - 38 * scale})`}
      >
        {EDGE_LEGEND.map((e, i) => (
          <g key={e.label}>
            <line
              x1={0}
              y1={i * 12 * scale}
              x2={14 * scale}
              y2={i * 12 * scale}
              stroke={e.color}
              strokeWidth={1.6 * scale}
              strokeDasharray={
                e.dashed ? `${3 * scale} ${3 * scale}` : undefined
              }
            />
            <text
              x={18 * scale}
              y={i * 12 * scale + 3 * scale}
              fill="#94A3B8"
              fontSize={8 * scale}
              fontFamily="'IBM Plex Sans', system-ui, sans-serif"
            >
              {e.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── Main component ───────────────────────────────────────────────

interface Props {
  onChartClick: (key: string) => void;
}

export default function KnowledgeGraph({ onChartClick }: Props) {
  const [filter, setFilter] = useState("Services");
  const [coverageMode, setCoverageMode] = useState(false);
  const [showFullGraph, setShowFullGraph] = useState(false);

  const monitoredCount = NODES.filter((n) => n.monitored).length;
  const unmonitoredCount = NODES.length - monitoredCount;
  const affectedCount = NODES.filter((n) => n.affected).length;

  return (
    <Panel number="4." title="Operational Knowledge Graph">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 items-center mb-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md transition-colors ${
              filter === f.key
                ? "bg-zinc-200 text-zinc-800 font-semibold"
                : "text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: f.color }}
            />
            {f.key}
          </button>
        ))}

        {/* Coverage toggle */}
        <button
          type="button"
          onClick={() => setCoverageMode((v) => !v)}
          className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md transition-colors ${
            coverageMode
              ? "bg-emerald-50 text-emerald-700 font-semibold"
              : "text-zinc-500 hover:bg-zinc-100"
          }`}
          title="Highlight services with no active telemetry"
        >
          <span
            className="w-2 h-2 rounded-full border-[1.5px] border-dashed border-zinc-400"
            style={{ background: "transparent" }}
          />
          Coverage
        </button>

        {/* Filters button */}
        <button
          type="button"
          className="ml-auto flex items-center gap-1.5 text-[11px] text-zinc-500 border border-zinc-200 px-2.5 py-1 rounded-md hover:bg-zinc-50 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filters
        </button>
      </div>

      {/* Graph */}
      <ChartCard chartKey="cluster" onClick={onChartClick}>
        <KnowledgeGraphSVG coverageMode={coverageMode} activeFilter={filter} />
      </ChartCard>

      {/* Node legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {LEGEND.map((l) => (
          <span
            key={l.label}
            className="flex items-center gap-1.5 text-[11px] text-zinc-500"
          >
            {l.type === "dot" && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: l.color }}
              />
            )}
            {l.type === "ring" && (
              <span className="w-2 h-2 rounded-full border-[1.5px] border-dashed border-zinc-400" />
            )}
            {l.type === "blast" && (
              <span
                className="w-2.5 h-2.5 rounded-full bg-white border-[1.5px] border-red-500"
                style={{
                  boxShadow: "0 0 0 2.5px rgba(239,68,68,.18)",
                }}
              />
            )}
            {l.label}
          </span>
        ))}
      </div>

      {/* Coverage summary bar */}
      <div className="flex items-center gap-3 flex-wrap mt-2.5 px-3 py-2.5 bg-zinc-50 border border-zinc-100 rounded-lg text-[11px] text-zinc-500">
        <span className="flex items-center gap-1.5">
          Monitoring coverage
          <span className="font-mono font-bold text-zinc-800">
            {monitoredCount}/{NODES.length}
          </span>
        </span>
        <span className="w-px h-3.5 bg-zinc-200" />
        <span className="flex items-center gap-1.5">
          No telemetry
          <span className="font-mono font-bold text-amber-600">
            {unmonitoredCount}
          </span>
        </span>
        <span className="w-px h-3.5 bg-zinc-200" />
        <span className="flex items-center gap-1.5">
          In current blast radius
          <span className="font-mono font-bold text-red-600">
            {affectedCount}
          </span>
        </span>
      </div>

      <div className="text-center mt-3">
        <button type="button" onClick={() => setShowFullGraph(true)}>
          <LinkAction>Explore full graph →</LinkAction>
        </button>
      </div>

      {/* Full graph side modal */}
      {showFullGraph && (
        <SideModal
          isOpen={showFullGraph}
          onClose={() => setShowFullGraph(false)}
          title="Operational Knowledge Graph"
          subTitle="Full interactive graph with all service dependencies and blast radius"
        >
          <div className="space-y-4">
            {/* Large graph */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4">
              <KnowledgeGraphSVG
                width={540}
                height={380}
                coverageMode={coverageMode}
                activeFilter={filter}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {LEGEND.map((l) => (
                <span
                  key={l.label}
                  className="flex items-center gap-1.5 text-[11px] text-zinc-500"
                >
                  {l.type === "dot" && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: l.color }}
                    />
                  )}
                  {l.type === "ring" && (
                    <span className="w-2 h-2 rounded-full border-[1.5px] border-dashed border-zinc-400" />
                  )}
                  {l.type === "blast" && (
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-white border-[1.5px] border-red-500"
                      style={{ boxShadow: "0 0 0 2.5px rgba(239,68,68,.18)" }}
                    />
                  )}
                  {l.label}
                </span>
              ))}
            </div>

            {/* Node details table */}
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                All Nodes
              </h3>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-200">
                    <th className="text-left pb-2">Node</th>
                    <th className="text-left pb-2">Layer</th>
                    <th className="text-left pb-2">Status</th>
                    <th className="text-left pb-2">Blast</th>
                  </tr>
                </thead>
                <tbody>
                  {NODES.map((n) => (
                    <tr key={n.id} className="border-t border-zinc-100">
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: n.color }}
                          />
                          <span className="font-semibold text-zinc-800">
                            {n.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 pr-2 text-zinc-500">{n.layer}</td>
                      <td className="py-2 pr-2">
                        {n.monitored ? (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                            Monitored
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                            No telemetry
                          </span>
                        )}
                      </td>
                      <td className="py-2">
                        {n.affected ? (
                          <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                            {n.impact || "Affected"}
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Coverage summary */}
            <div className="flex items-center gap-3 flex-wrap px-3 py-2.5 bg-zinc-50 border border-zinc-100 rounded-lg text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                Monitoring coverage
                <span className="font-mono font-bold text-zinc-800">
                  {monitoredCount}/{NODES.length}
                </span>
              </span>
              <span className="w-px h-3.5 bg-zinc-200" />
              <span className="flex items-center gap-1.5">
                No telemetry
                <span className="font-mono font-bold text-amber-600">
                  {unmonitoredCount}
                </span>
              </span>
              <span className="w-px h-3.5 bg-zinc-200" />
              <span className="flex items-center gap-1.5">
                In blast radius
                <span className="font-mono font-bold text-red-600">
                  {affectedCount}
                </span>
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Unmonitored nodes force blast radius → Unknown, holding
              auto-execution until telemetry is established.
            </p>
          </div>
        </SideModal>
      )}
    </Panel>
  );
}
