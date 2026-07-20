import React from "react";
import { PERMISSIONS, ruleById } from "../../../data";
import { Playbook, PermissionState, RuleDef } from "../../../types";
import SectionShell from "../SectionShell";

const PERM_CLS: Record<PermissionState, string> = {
  Allowed: "bg-emerald-50 text-emerald-600",
  "Approval required": "bg-amber-50 text-amber-700",
  Blocked: "bg-red-50 text-red-600",
};

interface PermissionsRulesTypesSectionProps {
  playbook: Playbook;
  onOpenRule: (rule: RuleDef) => void;
}

export default function PermissionsRulesTypesSection({
  playbook,
  onOpenRule,
}: PermissionsRulesTypesSectionProps): React.JSX.Element {
  return (
    <>
      <SectionShell
        id="permissions"
        eyebrow="Bounded automation"
        title="Execution permissions"
        sub="Exactly what automation is permitted. Blocked actions cannot be enabled from within the playbook — only through operational rules."
      >
        <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100">
          {PERMISSIONS.map((x) => (
            <div key={x.name} className="flex items-center gap-3 px-4 py-3">
              <div>
                <div className="font-semibold text-[13.5px]">{x.name}</div>
                <div className="text-xs text-zinc-400">{x.note}</div>
              </div>
              <span
                className={`ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${PERM_CLS[x.state]}`}
              >
                {x.state}
              </span>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="rules"
        eyebrow="Governance layer"
        title="Linked operational rules"
        sub="These rules decide whether this playbook is allowed to act. Select a rule to inspect it."
      >
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                {["Rule", "Status", "Purpose"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 py-2.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {playbook.rules.map((id) => {
                const r = ruleById(id);
                if (!r) return null;
                return (
                  <tr
                    key={id}
                    onClick={() => onOpenRule(r)}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 cursor-pointer transition-colors"
                  >
                    <td className="px-3.5 py-2.5">
                      <div className="font-semibold text-zinc-800">{r.name}</div>
                      <div className="font-mono text-[10.5px] text-zinc-400">{r.id}</div>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {r.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-zinc-500">{r.purpose}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionShell>

      <SectionShell id="types" eyebrow="Scope" title="Supported incident types" sub="Incident classes this playbook may be routed to.">
        <div className="flex gap-2 flex-wrap">
          {playbook.incidentTypes.map((t) => (
            <span key={t} className="border border-zinc-200 bg-zinc-50 rounded-full px-3 py-1.5 text-sm text-zinc-700">
              {t}
            </span>
          ))}
        </div>
      </SectionShell>
    </>
  );
}
