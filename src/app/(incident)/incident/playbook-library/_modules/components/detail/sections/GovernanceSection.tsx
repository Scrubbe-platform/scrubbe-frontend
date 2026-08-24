import React, { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { OWNERS } from "../../../data";
import { Playbook } from "../../../types";
import SectionShell, { IllustrativeBadge } from "../SectionShell";

interface GovernanceSectionProps {
  playbook: Playbook;
  onJumpToRules: () => void;
  onUpdate: (patch: Partial<Playbook>) => void;
}

function Cell({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="border border-zinc-200 rounded-lg bg-zinc-50 px-3.5 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="text-xs text-zinc-500 mb-1.5 dark:text-zinc-400">{label}</div>
      <div className="font-semibold text-[13.5px] flex items-center gap-1.5 flex-wrap dark:text-zinc-100">
        {children}
      </div>
    </div>
  );
}

export default function GovernanceSection({
  playbook,
  onJumpToRules,
  onUpdate,
}: GovernanceSectionProps): React.JSX.Element {
  const [showAccess, setShowAccess] = useState(false);
  const [draftOwner, setDraftOwner] = useState(playbook.owner);
  const [maintainerInput, setMaintainerInput] = useState("");
  const maintainers = playbook.maintainers ?? [];
  const sla = playbook.sla;
  const freezeRule = playbook.rules.includes("OR-005");

  return (
    <SectionShell
      id="governance"
      eyebrow="Governance · decided by operational rules"
      title="Whether this playbook may act"
      sub="Everything below is enforced by the governance engine before and during execution. The playbook cannot exceed it."
      emphasize
    >
      <div className="grid gap-3 grid-cols-4">
        <Cell label="Execution mode">
          <span className="text-base">{playbook.mode}</span>
        </Cell>
        <Cell label="Allowed environments">{playbook.env.join(" · ")}</Cell>
        <Cell label="Operational rules linked">
          <span className="font-mono text-base">{playbook.rules.length}</span>
          <button
            onClick={onJumpToRules}
            className="text-IMSLightGreen underline text-[13px] font-semibold"
          >
            View all
          </button>
        </Cell>
        <Cell label="Approval policy">{playbook.approvers.join(" + ")}</Cell>
        <Cell label="Maximum autonomous actions">
          <span className="font-mono text-base">{playbook.maxAuto}</span>
          <span className="text-zinc-500 text-xs font-medium dark:text-zinc-400">
            per execution
          </span>
        </Cell>
        <Cell label="Rollback supported">
          {playbook.rollback ? (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs dark:bg-emerald-500/10 dark:text-emerald-400">
              Yes
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 text-xs dark:bg-zinc-800 dark:text-zinc-400">
              No
            </span>
          )}
        </Cell>
        <Cell label="Owner & maintainers">
          {playbook.owner}
          <button
            onClick={() => setShowAccess((s) => !s)}
            className="text-IMSLightGreen underline text-xs font-semibold"
          >
            Manage access
          </button>
        </Cell>
        <Cell
          label={
            <span className="flex items-center gap-1.5">
              SLA · ack / first action / resolution
              <IllustrativeBadge />
            </span>
          }
        >
          {sla ? `${sla.ack} / ${sla.firstAction} / ${sla.resolution}` : "—"}
        </Cell>
        <Cell label="Change-freeze awareness">
          {freezeRule ? (
            <span className="text-base">Enforced · OR-005</span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 text-xs dark:bg-zinc-800 dark:text-zinc-400">
              Not linked
            </span>
          )}
        </Cell>
      </div>

      {showAccess && (
        <div className="mt-4 border border-dashed border-zinc-300 rounded-xl p-4 dark:border-zinc-700">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 dark:text-zinc-300">
              Owner team
            </label>
            <select
              value={draftOwner}
              onChange={(e) => setDraftOwner(e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {OWNERS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 mb-2 dark:text-zinc-300">
            Maintainers
            <IllustrativeBadge />
          </label>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {maintainers.length === 0 && (
              <span className="text-xs text-zinc-400 italic dark:text-zinc-500">
                No maintainers added.
              </span>
            )}
            {maintainers.map((m, i) => (
              <span
                key={`${m}-${i}`}
                className="inline-flex items-center gap-1.5 border border-zinc-200 bg-white rounded-full pl-3 pr-1.5 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                {m}
                <button
                  onClick={() =>
                    onUpdate({
                      maintainers: maintainers.filter((_, ix) => ix !== i),
                    })
                  }
                  className="w-4 h-4 rounded-full bg-zinc-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center dark:bg-zinc-800 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={maintainerInput}
              onChange={(e) => setMaintainerInput(e.target.value)}
              placeholder="Add maintainer name…"
              className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            />
            <button
              onClick={() => {
                if (!maintainerInput.trim()) return;
                onUpdate({
                  maintainers: [...maintainers, maintainerInput.trim()],
                });
                setMaintainerInput("");
              }}
              className="px-3.5 py-2 text-sm font-semibold border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Add
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                onUpdate({ owner: draftOwner });
                setShowAccess(false);
                toast.success(`Access updated — owner: ${draftOwner}`);
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
            >
              Save changes
            </button>
            <button
              onClick={() => {
                setDraftOwner(playbook.owner);
                setShowAccess(false);
              }}
              className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </SectionShell>
  );
}
