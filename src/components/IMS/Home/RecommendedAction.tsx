"use client";
import React from "react";

// ── Types ─────────────────────────────────────────────────────────

interface Recommendation {
  id: string; // incident ID e.g. "SI-7842"
  label: string; // "Recommended" | "High priority" etc.
  action: string; // plain text prefix e.g. "Roll back"
  target: string; // bolded entity e.g. "payments-api"
  suffix: string; // plain text suffix e.g. "to build 2.13.7"
  evidence: string; // evidence line
  confidence: number; // 0-100
}

interface Props {
  recommendations?: Recommendation[];
}

// ── Default data ──────────────────────────────────────────────────

const DEFAULT: Recommendation[] = [
  {
    id: "SI-7842",
    label: "Recommended",
    action: "Roll back",
    target: "payments-api",
    suffix: "to build 2.13.7",
    evidence:
      "Error onset +8 min after deploy · matches incident SI-7829 remediation · approval gate required",
    confidence: 92,
  },
];

// ── Confidence color ──────────────────────────────────────────────

const confidenceColor = (n: number): string => {
  if (n >= 85) return "text-emerald-700 dark:text-emerald-400";
  if (n >= 65) return "text-amber-700  dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

// ── Component ─────────────────────────────────────────────────────

const RecommendedActions: React.FC<Props> = ({ recommendations = DEFAULT }) => (
  <section className="bg-white">
    <div className="grid grid-cols-[200px_1fr] gap-8 px-8 py-12 items-start max-w-[1100px] mx-auto ">
      {/* Left label */}
      <div className="pt-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
          Recommended Actions
        </span>
      </div>

      {/* Right content */}
      <div>
        <h2 className="font-serif text-[36px] font-bold leading-[1.15] text-zinc-900 dark:text-zinc-100 mb-5">
          Evidence-backed actions, not guesses.
        </h2>

        <p className="text-[16px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-7 max-w-2xl">
          Review actions proposed by Scrubbe agents. Recommendations are
          generated from deployments, infrastructure telemetry, observability
          systems, historical incidents, operational playbooks, and
          organizational knowledge.
        </p>

        {recommendations.map((rec) => (
          <div key={rec.id} className="mb-6">
            {/* Section label */}
            <p className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              Top recommendation · {rec.id}
            </p>

            {/* Card */}
            <div className="border-l-[3px] border-emerald-600 dark:border-emerald-500 rounded-r-xl bg-emerald-50 dark:bg-emerald-950/30 px-5 py-4">
              {/* Top row */}
              <div className="flex items-start justify-between gap-4 mb-1.5">
                <span className="text-[12px] text-zinc-500 dark:text-zinc-400">
                  {rec.label}
                </span>
                <span
                  className={`text-[13px] font-semibold whitespace-nowrap ${confidenceColor(rec.confidence)}`}
                >
                  {rec.confidence}% confidence
                </span>
              </div>

              {/* Action */}
              <p className="text-[18px] text-zinc-900 dark:text-zinc-100 leading-snug mb-2">
                {rec.action}{" "}
                <strong className="font-semibold">{rec.target}</strong>{" "}
                {rec.suffix}
              </p>

              {/* Evidence */}
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Evidence — {rec.evidence}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default RecommendedActions;
