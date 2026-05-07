"use client";
import React from "react";
import { Bolt, Info, Check, Plus, TriangleAlert } from "lucide-react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

type Operator = "eq" | "gt" | "in";

interface Condition {
  id: string;
  field: string;
  operator: Operator;
  value: string | number;
  weight: number;
  isMatched: boolean;
}

interface TriggerConditionsProps {
  incident: IncidentDetailRecord;
}

const ConditionRow: React.FC<Condition> = ({
  field,
  operator,
  value,
  weight,
  isMatched,
}) => (
  <div className="group mb-2 flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10">
    <div className="flex flex-1 items-center gap-6">
      <span className="w-32 text-sm font-medium text-blue-400">{field}</span>

      <div className="flex flex-1 items-center gap-4">
        <span className="rounded border border-slate-700 bg-slate-800/50 px-3 py-1 text-[11px] font-mono uppercase text-slate-400">
          {operator}
        </span>
        <span className="font-mono text-sm text-amber-500">
          {typeof value === "string" && !value.startsWith("[")
            ? `"${value}"`
            : value}
        </span>
      </div>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">
          Weight
        </span>
        <div className="flex h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
            style={{ width: `${weight * 100}%` }}
          />
        </div>
        <span className="w-8 font-mono text-sm text-slate-200">
          {weight.toFixed(2)}
        </span>
      </div>
      <Check
        size={16}
        className={isMatched ? "text-emerald-500" : "text-slate-700"}
      />
    </div>
  </div>
);

const isDeploymentAware = (incident: IncidentDetailRecord) =>
  /deploy|pipeline|ci\/cd|rollback|release/i.test(
    `${incident.sourceType ?? ""} ${incident.detection ?? ""} ${
      incident.title ?? ""
    }`
  );

const buildConditions = (incident: IncidentDetailRecord): Condition[] => [
  {
    id: "1",
    field: "signal_type",
    operator: "eq",
    value: incident.sourceType || incident.source || "manual_raise",
    weight: 0.5,
    isMatched: true,
  },
  {
    id: "2",
    field: "service",
    operator: "eq",
    value: incident.service || incident.affectedSystem || "unknown-service",
    weight: 0.5,
    isMatched: true,
  },
  {
    id: "3",
    field: "incident_status",
    operator: "eq",
    value: incident.status || "OPEN",
    weight: 0.5,
    isMatched: true,
  },
  {
    id: "4",
    field: "recent_deployment",
    operator: "eq",
    value: isDeploymentAware(incident) ? "true" : "unknown",
    weight: 0.5,
    isMatched: true,
  },
  {
    id: "5",
    field: "incident_severity",
    operator: "in",
    value: JSON.stringify([incident.severity || incident.priority || "P3"]),
    weight: 0.5,
    isMatched: true,
  },
];

const TriggerConditions: React.FC<TriggerConditionsProps> = ({ incident }) => {
  const conditions = buildConditions(incident);

  return (
    <div className="w-full max-w-5xl rounded-2xl border border-white/5 bg-dark p-3 shadow-2xl">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
            <Bolt size={20} className="fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Trigger Conditions
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Pattern match — MatchCondition[] with weighted confidence scoring
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-500">
            <Check size={14} /> Matched
          </button>
          <button className="rounded border border-slate-700 p-1.5 text-slate-400 hover:bg-white/5">
            <TriangleAlert size={16} />
          </button>
        </div>
      </div>

      <div className="mb-8 flex gap-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <Info size={20} className="shrink-0 text-blue-400" />
        <p className="text-sm leading-relaxed text-slate-300">
          All conditions are evaluated against the selected incident context.
          Weighted scores are summed to produce match confidence on the proposal,
          while alternatives stay visible for operator review.
        </p>
      </div>

      <div className="mb-6 space-y-1">
        {conditions.map((condition) => (
          <ConditionRow key={condition.id} {...condition} />
        ))}
      </div>

      <button className="flex items-center gap-2 rounded-lg border border-green-500/50 px-4 py-2 text-sm font-semibold text-green-400 transition-all hover:bg-green-500/5">
        <Plus size={18} />
        Add Condition
      </button>
    </div>
  );
};

export default TriggerConditions;
