import React from "react";
import { CHANGES, genSI } from "../../../data";
import { Playbook } from "../../../types";
import SectionShell from "../SectionShell";

const OUTCOMES = ["Resolved · automated", "Resolved · automated", "Resolved · approved rollback"];
const WHEN = ["2 hrs ago", "1 day ago", "3 days ago"];

interface IncidentsChangesSectionProps {
  playbook: Playbook;
}

export default function IncidentsChangesSection({
  playbook,
}: IncidentsChangesSectionProps): React.JSX.Element {
  return (
    <>
      <SectionShell
        id="incidents"
        eyebrow="Traceable to real executions"
        title="Linked incidents"
        sub="The most recent incidents this playbook was executed against."
      >
        <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 dark:border-zinc-800 dark:divide-zinc-800">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div>
                <div className="font-mono font-semibold text-[13.5px] dark:text-zinc-100">{genSI(playbook.id + i)}</div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  {playbook.name} · {WHEN[i]}
                </div>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 whitespace-nowrap dark:bg-emerald-500/10 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {OUTCOMES[i]}
              </span>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="changes"
        eyebrow="Complete audit trail"
        title="Change approval"
        sub="Every modification to this playbook required approval before taking effect."
      >
        <div className="border border-zinc-200 rounded-lg overflow-hidden dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800">
                {["Author", "Approved by", "Date", "Reason", "Risk"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 py-2.5 dark:text-zinc-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHANGES.map((c, i) => (
                <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                  <td className="px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200">{c.author}</td>
                  <td className="px-3.5 py-2.5 text-zinc-600 dark:text-zinc-300">{c.approver}</td>
                  <td className="px-3.5 py-2.5 font-mono text-xs text-zinc-500 whitespace-nowrap dark:text-zinc-400">{c.date}</td>
                  <td className="px-3.5 py-2.5 text-zinc-500 dark:text-zinc-400">{c.reason}</td>
                  <td className="px-3.5 py-2.5">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        c.risk === "Low" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      }`}
                    >
                      {c.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>
    </>
  );
}
