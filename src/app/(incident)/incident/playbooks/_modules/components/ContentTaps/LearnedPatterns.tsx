"use client";
import React from "react";
import { BarChart3, TriangleAlert } from "lucide-react";

// --- Types ---

interface PatternRow {
  id: string;
  title: string;
  description: string;
  confidence: number;
  tags: string[];
}

// --- Sub-Components ---

const PatternCard = ({ title, description, confidence, tags }: PatternRow) => (
  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
        {title}
      </h3>
      <span className="text-xl font-black text-emerald-500">{confidence}%</span>
    </div>

    <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-4xl">
      {description}
    </p>

    <div className="flex flex-wrap gap-2">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="px-3 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-lg text-[11px] font-mono text-slate-400"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

// --- Main Component ---

const LearnedPatterns: React.FC = () => {
  const patterns: PatternRow[] = [
    {
      id: "1",
      title: "Error spike + recent deployment → rollback resolves",
      confidence: 92,
      description:
        'Based on 34 incidents. When error_rate_high follows a deployment within 60 minutes, rollback resulted in outcome: resolved in 82% of cases. Confidence boost applied to "Rollback Deployment" option.',
      tags: [
        "error-rate high",
        "recent_deployment: true",
        "Window : 60m",
        "Resolution : rollback",
      ],
    },
    {
      id: "2",
      title: "DB connection exhaustion → scale replicas ineffective",
      confidence: 92,
      description:
        'Scaling replicas worsened DB connection exhaustion in 71% of cases — more pods, more connections. Pattern suppresses "Scale Up" confidence when DB connection > 85%.',
      tags: ["db_connections_high", "scale_action", "outcome: worsened"],
    },
    {
      id: "3",
      title: "Pod restart clears memory leak on first restart",
      confidence: 92,
      description:
        "Pod restart with OOMKilled cause resolves in 93% of cases on first attempt. If restarts > 3, issue is persistent — escalate to rollback. Pattern feeds automationStage escalation for crash loops.",
      tags: [], // Third row in image shows no tags, but supports them
    },
  ];

  return (
    <div className="w-full max-w-6xl bg-dark border border-white/5 rounded-3xl p-3 flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-center">
            <BarChart3 size={20} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg leading-tight">
              Learned Patterns
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              learnedPatterns[] — historical resolution data · built from
              Execution.outcome over time
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 border border-emerald-500/40 bg-emerald-500/5 rounded text-emerald-500 text-xs font-bold uppercase tracking-widest">
            3 Patterns
          </div>
          <button className="p-2 border border-slate-700 rounded text-slate-400 hover:bg-white/5">
            <TriangleAlert size={18} />
          </button>
        </div>
      </div>

      {/* Pattern List */}
      <div className="flex flex-col gap-4">
        {patterns.map((pattern) => (
          <PatternCard key={pattern.id} {...pattern} />
        ))}
      </div>
    </div>
  );
};

export default LearnedPatterns;
