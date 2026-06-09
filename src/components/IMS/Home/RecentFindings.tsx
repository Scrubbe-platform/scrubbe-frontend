"use client";
import React from "react";

// ── Types ─────────────────────────────────────────────────────────

interface Finding {
  label: string; // "Recurring pattern" | "Elevated risk" | "Deployment anomaly"
  body: string;
}

interface FindingGroup {
  period: string; // "This Week" | "Last Week"
  findings: Finding[];
}

interface Props {
  groups?: FindingGroup[];
}

// ── Default data ──────────────────────────────────────────────────

const DEFAULT: FindingGroup[] = [
  {
    period: "This Week",
    findings: [
      {
        label: "Recurring pattern",
        body: "Three payments-api incidents in 14 days correlate with configuration changes introduced at deploy time.",
      },
      {
        label: "Elevated risk",
        body: "billing-worker risk score reached 91, driven by repeated incident correlation and dependency degradation.",
      },
      {
        label: "Deployment anomaly",
        body: "Rollback rate is up 18% week-over-week across delivery pipelines — concentrated in the checkout domain.",
      },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────

const RecentFindings: React.FC<Props> = ({ groups = DEFAULT }) => (
  <section className="bg-white">
    <div className=" grid grid-cols-[200px_1fr] gap-8 px-8 py-12 items-start max-w-5xl mx-auto">
      {/* Left label */}
      <div className="pt-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 ">
          Recent Findings
        </span>
      </div>

      {/* Right content */}
      <div>
        <h2 className="font-serif text-[36px] font-bold leading-[1.15] text-zinc-900  mb-5">
          Significant discoveries, surfaced as they emerge
        </h2>

        <p className="text-[16px] text-zinc-500  leading-relaxed mb-8 max-w-2xl">
          Review operational discoveries identified by Scrubbe — recurring
          incident patterns, elevated risk indicators, reliability trends,
          deployment anomalies, infrastructure instability, and emerging areas
          requiring attention.
        </p>

        {groups.map((group) => (
          <div key={group.period} className="mb-8">
            {/* Period heading */}
            <p className="text-[16px] font-bold text-zinc-900  mb-4">
              {group.period}
            </p>

            {/* Findings list */}
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {group.findings.map((f, i) => (
                <div key={i} className="py-5 first:pt-0">
                  <p className="text-[15px] font-semibold text-emerald-600  mb-1.5">
                    {f.label}
                  </p>
                  <p className="text-[16px] text-zinc-600  leading-relaxed">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Trailing divider after last finding */}
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default RecentFindings;
