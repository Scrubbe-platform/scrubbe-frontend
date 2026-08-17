import React from "react";
import toast from "react-hot-toast";
import { RELATED } from "../../../data";
import { Playbook } from "../../../types";
import SectionShell from "../SectionShell";

interface RelatedHealthSectionProps {
  playbook: Playbook;
  onRequestReview: () => void;
}

export default function RelatedHealthSection({
  playbook,
  onRequestReview,
}: RelatedHealthSectionProps): React.JSX.Element {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - playbook.success / 100);

  return (
    <>
      <SectionShell
        id="related"
        eyebrow="Linked automatically"
        title="Related knowledge"
        sub="Everything Scrubbe has linked to this playbook across the platform."
      >
        <div
          className="grid gap-2.5"
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(215px,1fr))" }}
        >
          {RELATED.map((rel) => (
            <button
              key={rel.name}
              onClick={() => toast(`${rel.name} opens in its console`)}
              className="flex items-center gap-2.5 border border-zinc-200 rounded-lg px-3.5 py-3 text-sm font-semibold hover:border-zinc-900 transition-colors text-left text-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-500"
            >
              {rel.name}
              <span className="ml-auto font-mono text-xs text-zinc-400 dark:text-zinc-500">
                {rel.cnt}
              </span>
            </button>
          ))}
        </div>
      </SectionShell>

      <div
        id="s-health"
        className="border border-zinc-200 rounded-xl bg-white p-6 flex flex-wrap items-center gap-6 scroll-mt-32 dark:border-zinc-800 dark:bg-zinc-900/40"
      >
        <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="#E7EAF0"
            strokeWidth="7"
          />
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="#00C896"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 36 36)"
          />
          <text
            x="36"
            y="41"
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="15"
            fontWeight="600"
            fill="#04724F"
          >
            {playbook.success}%
          </text>
        </svg>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Playbook health
          </div>
          <h3 className="font-bold text-[15.5px] text-zinc-900 mt-0.5 dark:text-zinc-100">
            Operational readiness
          </h3>
          <p className="text-sm text-zinc-500 mt-0.5 max-w-md dark:text-zinc-400">
            All {playbook.rules.length} linked operational rules valid. No
            conflicting execution permissions detected.
          </p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-zinc-400 dark:text-zinc-500">Last governance review</div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">3 days ago</div>
          <button
            onClick={onRequestReview}
            className="mt-2 px-3.5 py-1.5 text-xs font-semibold border border-zinc-300 rounded-lg hover:bg-white transition-colors dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Request review
          </button>
        </div>
      </div>
    </>
  );
}
