"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Switch from "@/components/ui/Switch";
import Select from "@/components/ui/select";
import { Card, CardHeader, KVRows } from "./DetailPrimitives";
import {
  CHANGE_FREEZES,
  ESCALATION_PATH,
  ROLE_PERMISSIONS,
  SLA_ESCALATION,
} from "./incidentTemplates.data";

const OWNER_OPTIONS = [
  { value: "Platform Engineering", label: "Platform Engineering" },
  { value: "Site Reliability Engineering", label: "Site Reliability Engineering" },
  { value: "Security Engineering", label: "Security Engineering" },
  { value: "Data Platform", label: "Data Platform" },
];

const FREEZE_STYLE: Record<string, string> = {
  active: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  upcoming: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  passed: "bg-zinc-100 text-black/50 dark:bg-zinc-800 dark:text-zinc-500",
};

export default function GovernanceTab() {
  const [owner, setOwner] = useState("Platform Engineering");
  const [maintainers, setMaintainers] = useState(["S. Chen", "M. Alavi", "R. Osei"]);
  const [maintainerInput, setMaintainerInput] = useState("");
  const [manageOpen, setManageOpen] = useState(false);
  const [respectFreezes, setRespectFreezes] = useState(true);

  function addMaintainer() {
    const val = maintainerInput.trim();
    if (!val) return;
    setMaintainers((prev) => [...prev, val]);
    setMaintainerInput("");
  }
  function removeMaintainer(i: number) {
    setMaintainers((prev) => prev.filter((_, idx) => idx !== i));
  }
  function saveAccess() {
    setManageOpen(false);
    toast.success(`Access updated — owner: ${owner}`);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Ownership & Access" />
          <KVRows
            rows={[
              ["Owner team", owner],
              ["Maintainers", maintainers.join(", ") || "---"],
              ["Approval chain", "Engineer → Eng. Manager → Director SRE"],
            ]}
          />

          <div className="mt-5">
            <h3 className="mb-2.5 text-[13px] font-bold text-black dark:text-zinc-100">
              Role Permissions
            </h3>
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-wide text-black/40 dark:text-zinc-500">
                  <th className="border-b border-zinc-100 py-2 font-semibold dark:border-zinc-800">Role</th>
                  <th className="border-b border-zinc-100 py-2 text-center font-semibold dark:border-zinc-800">Edit</th>
                  <th className="border-b border-zinc-100 py-2 text-center font-semibold dark:border-zinc-800">Approve</th>
                  <th className="border-b border-zinc-100 py-2 text-center font-semibold dark:border-zinc-800">Publish</th>
                </tr>
              </thead>
              <tbody>
                {ROLE_PERMISSIONS.map((r) => (
                  <tr key={r.role} className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800">
                    <td className="py-2 font-medium text-black dark:text-zinc-200">{r.role}</td>
                    <PermCell ok={r.edit} />
                    <PermCell ok={r.approve} />
                    <PermCell ok={r.publish} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setManageOpen((v) => !v)}
            className="mt-4 rounded-md border border-zinc-300 bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            Manage Access
          </button>

          {manageOpen && (
            <div className="mt-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <label className="mb-1.5 block text-[12px] font-semibold text-black/60 dark:text-zinc-400">
                Owner team
              </label>
              <Select
                value={owner}
                onChange={(e) => setOwner(String(e.target.value))}
                options={OWNER_OPTIONS}
              />
              <label className="mb-1.5 mt-2 block text-[12px] font-semibold text-black/60 dark:text-zinc-400">
                Maintainers
              </label>
              <div className="mb-2.5 flex flex-wrap gap-2">
                {maintainers.map((m, i) => (
                  <span
                    key={`${m}-${i}`}
                    className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[12px] text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    {m}
                    <button onClick={() => removeMaintainer(i)} className="text-black/30 hover:text-rose-600">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {maintainers.length === 0 && (
                  <span className="text-[12.5px] text-black/40 dark:text-zinc-500">No maintainers added.</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={maintainerInput}
                  onChange={(e) => setMaintainerInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMaintainer()}
                  placeholder="Add maintainer name…"
                  className="h-9 flex-1 rounded-full border border-zinc-200 px-3.5 text-[12.5px] focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
                <button
                  onClick={addMaintainer}
                  className="rounded-md border border-zinc-300 bg-white px-3.5 text-[12.5px] font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  Add
                </button>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={saveAccess}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setManageOpen(false)}
                  className="rounded-md px-4 py-2 text-[13px] font-semibold text-black/60 hover:bg-zinc-50 dark:text-zinc-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="SLA & Escalation" />
          <KVRows rows={SLA_ESCALATION} />
          <div className="mt-5">
            <h3 className="mb-2.5 text-[13px] font-bold text-black dark:text-zinc-100">Escalation Path</h3>
            <div className="relative pl-5">
              <div className="absolute bottom-1 left-[3px] top-1 w-px bg-zinc-200 dark:bg-zinc-700" />
              {ESCALATION_PATH.map((step, i) => (
                <div key={step} className="relative pb-4 last:pb-0">
                  <span className="absolute -left-5 top-1 h-[7px] w-[7px] rounded-full border-2 border-emerald-600 bg-white dark:bg-zinc-900" />
                  <span className="text-[13px] text-black dark:text-zinc-200">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Change Freeze & Blackout Windows"
          hint="autonomous actions pause during active freezes"
        />
        <div className="mb-4 flex items-center gap-3">
          <Switch checked={respectFreezes} onChange={setRespectFreezes} />
          <span className="text-[13px] text-black dark:text-zinc-200">
            Respect global change freezes
          </span>
        </div>
        <div>
          {CHANGE_FREEZES.map(([name, range, freezeStatus], i) => (
            <div
              key={name}
              className={cn(
                "flex items-center justify-between gap-3 py-3 text-[12.5px]",
                i !== CHANGE_FREEZES.length - 1 && "border-b border-zinc-100 dark:border-zinc-800",
              )}
            >
              <span className="text-black dark:text-zinc-200">
                {name} · <span className="text-black/40 dark:text-zinc-500">{range}</span>
              </span>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wide",
                  FREEZE_STYLE[freezeStatus],
                )}
              >
                {freezeStatus}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PermCell({ ok }: { ok: boolean }) {
  return (
    <td className="py-2 text-center">
      {ok ? (
        <Check size={14} className="inline text-emerald-600 dark:text-emerald-400" />
      ) : (
        <X size={14} className="inline text-black/25 dark:text-zinc-600" />
      )}
    </td>
  );
}
