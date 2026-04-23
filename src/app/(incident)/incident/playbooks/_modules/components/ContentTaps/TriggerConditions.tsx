"use client";
import React from "react";
import { Bolt, Info, Check, Plus, TriangleAlert } from "lucide-react";

// --- Types ---

type Operator = "eq" | "gt" | "in";

interface Condition {
  id: string;
  field: string;
  operator: Operator;
  value: string | number;
  weight: number;
  isMatched: boolean;
}

// --- Sub-Components ---

const ConditionRow: React.FC<Condition> = ({
  field,
  operator,
  value,
  weight,
  isMatched,
}) => (
  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg mb-2 group hover:border-white/10 transition-colors">
    <div className="flex items-center gap-6 flex-1">
      <span className="text-blue-400 text-sm font-medium w-32">{field}</span>

      <div className="flex items-center gap-4 flex-1">
        <span className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded text-[11px] font-mono text-slate-400 uppercase">
          {operator}
        </span>
        <span className="text-amber-500 font-mono text-sm">
          {typeof value === "string" && !value.startsWith("[")
            ? `"${value}"`
            : value}
        </span>
      </div>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-amber-500/80 tracking-widest uppercase">
          Weight
        </span>
        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
            style={{ width: `${weight * 100}%` }}
          />
        </div>
        <span className="text-sm font-mono text-slate-200 w-8">
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

// --- Main Component ---

const TriggerConditions: React.FC = () => {
  const conditions: Condition[] = [
    {
      id: "1",
      field: "signal_type",
      operator: "eq",
      value: "error_rate_high",
      weight: 0.5,
      isMatched: true,
    },
    {
      id: "2",
      field: "service",
      operator: "eq",
      value: "payments-api",
      weight: 0.5,
      isMatched: true,
    },
    {
      id: "3",
      field: "error_rate",
      operator: "gt",
      value: 5,
      weight: 0.5,
      isMatched: true,
    },
    {
      id: "4",
      field: "recent_deployment",
      operator: "eq",
      value: "true",
      weight: 0.5,
      isMatched: true,
    },
    {
      id: "5",
      field: "incident_severity",
      operator: "in",
      value: '["P1", "P2"]',
      weight: 0.5,
      isMatched: true,
    },
  ];

  return (
    <div className="w-full max-w-5xl bg-dark border border-white/5 rounded-2xl p-3 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center">
            <Bolt size={20} className="text-amber-500 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">
              Trigger Conditions
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Pattern match — MatchCondition[] with weighted confidence scoring
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-500 text-xs font-bold">
            <Check size={14} /> Matched
          </button>
          <button className="p-1.5 border border-slate-700 rounded text-slate-400 hover:bg-white/5">
            <TriangleAlert size={16} />
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="flex gap-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-8">
        <Info size={20} className="text-blue-400 shrink-0" />
        <p className="text-slate-300 text-sm leading-relaxed">
          All conditions are evaluated against live incident context. Weighted
          scores are summed to produce matchConfidence on the Proposal entity.
          Ranking returns the top playbook with alternatives surfaced.
        </p>
      </div>

      {/* Conditions List */}
      <div className="space-y-1 mb-6">
        {conditions.map((c) => (
          <ConditionRow key={c.id} {...c} />
        ))}
      </div>

      {/* Footer Action */}
      <button className="flex items-center gap-2 px-4 py-2 border border-green-500/50 rounded-lg text-green-400 text-sm font-semibold hover:bg-green-500/5 transition-all">
        <Plus size={18} />
        Add Condition
      </button>
    </div>
  );
};

export default TriggerConditions;
