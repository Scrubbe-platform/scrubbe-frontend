import React, { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { RESOURCE_POOL } from "../../../data";
import { Playbook } from "../../../types";
import SectionShell from "../SectionShell";

interface ScopeSectionProps {
  playbook: Playbook;
  onUpdate: (patch: Partial<Playbook>) => void;
}

export default function ScopeSection({ playbook, onUpdate }: ScopeSectionProps): React.JSX.Element {
  const [ruleInput, setRuleInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const scopeRules = playbook.scopeRules ?? [];
  const matched = playbook.matchedResources ?? [];
  const applyMode = playbook.applyMode ?? "Automatic";

  return (
    <SectionShell
      id="scope"
      eyebrow="Binding · not just a definition"
      title="Where this playbook applies"
      sub="A playbook only runs where it's bound. This defines which real services it is allowed to act on."
      illustrative
    >
      <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(215px,1fr))" }}>
        <div className="border border-zinc-200 rounded-lg bg-zinc-50 px-3.5 py-3 dark:border-zinc-800 dark:bg-zinc-800/60">
          <div className="text-xs text-zinc-500 mb-1.5 dark:text-zinc-400">Apply mode</div>
          <button
            onClick={() => {
              const next = applyMode === "Automatic" ? "Manual" : "Automatic";
              onUpdate({ applyMode: next });
              toast.success(`Apply mode set to ${next}`);
            }}
            className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors ${
              applyMode === "Manual"
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                : "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
            }`}
          >
            {applyMode}
          </button>
        </div>
        <div className="border border-zinc-200 rounded-lg bg-zinc-50 px-3.5 py-3 sm:col-span-2 dark:border-zinc-800 dark:bg-zinc-800/60">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {applyMode === "Automatic"
              ? "Any matching resource is bound automatically"
              : "Resources must be added to this playbook manually"}
          </div>
        </div>
      </div>

      <label className="block text-xs font-semibold text-zinc-600 mb-2 dark:text-zinc-300">Match rules</label>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {scopeRules.length === 0 && (
          <span className="text-xs text-zinc-400 italic dark:text-zinc-500">
            No match rules — this playbook must be applied manually.
          </span>
        )}
        {scopeRules.map((r, i) => (
          <span
            key={`${r}-${i}`}
            className="inline-flex items-center gap-1.5 border border-zinc-300 bg-white rounded-full pl-3 pr-1.5 py-1 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-200"
          >
            {r}
            <button
              onClick={() => {
                onUpdate({ scopeRules: scopeRules.filter((_, ix) => ix !== i) });
                toast.success("Match rule removed");
              }}
              className="w-4 h-4 rounded-full bg-zinc-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center dark:bg-zinc-800 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={ruleInput}
          onChange={(e) => setRuleInput(e.target.value)}
          placeholder="e.g. region:us-east-1"
          className="flex-1 min-w-[180px] border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        />
        <button
          onClick={() => {
            if (!ruleInput.trim()) return;
            onUpdate({ scopeRules: [...scopeRules, ruleInput.trim()] });
            toast.success(`Rule "${ruleInput.trim()}" added`);
            setRuleInput("");
          }}
          className="px-3.5 py-2 text-sm font-semibold border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Add rule
        </button>
      </div>

      <label className="block text-xs font-semibold text-zinc-600 mt-5 mb-2 dark:text-zinc-300">
        Matched resources <span className="text-zinc-400 font-normal dark:text-zinc-500">({matched.length})</span>
      </label>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {matched.map((r) => (
          <span key={r} className="border border-zinc-200 bg-zinc-50 rounded-full px-3 py-1 text-xs dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300">
            {r}
          </span>
        ))}
      </div>
      <button
        disabled={scanning}
        onClick={() => {
          setScanning(true);
          setTimeout(() => {
            const count = 2 + Math.floor(Math.random() * 5);
            const start = Math.floor(Math.random() * RESOURCE_POOL.length);
            const next = Array.from(
              { length: count },
              (_, i) => RESOURCE_POOL[(start + i) % RESOURCE_POOL.length],
            );
            onUpdate({ matchedResources: next });
            setScanning(false);
            toast.success(`Scan complete — ${count} resources match current rules`);
          }, 900);
        }}
        className="px-3.5 py-2 text-sm font-semibold border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 transition-colors dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {scanning ? "Scanning…" : "Preview matches"}
      </button>
    </SectionShell>
  );
}
