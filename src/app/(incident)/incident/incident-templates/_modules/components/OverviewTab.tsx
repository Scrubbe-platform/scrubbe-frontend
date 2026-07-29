"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CheckList, KVRows } from "./DetailPrimitives";
import {
  AT_A_GLANCE,
  RESOURCE_POOL,
  SUCCESS_CRITERIA,
  TemplateRecord,
  linkedIncidentsFor,
  scopeDefaultsFor,
} from "./incidentTemplates.data";

export default function OverviewTab({ template }: { template: TemplateRecord }) {
  const defaults = scopeDefaultsFor(template);
  const linked = linkedIncidentsFor(template);

  const [applyMode, setApplyMode] = useState<"Automatic" | "Manual">("Automatic");
  const [scopeRules, setScopeRules] = useState<string[]>(defaults.scopeRules);
  const [matchedResources, setMatchedResources] = useState<string[]>(defaults.matchedResources);
  const [editorOpen, setEditorOpen] = useState(false);
  const [ruleInput, setRuleInput] = useState("");
  const [scanning, setScanning] = useState(false);

  function addRule() {
    const val = ruleInput.trim();
    if (!val) return;
    setScopeRules((prev) => [...prev, val]);
    setRuleInput("");
    toast.success(`Rule "${val}" added`);
  }

  function removeRule(i: number) {
    setScopeRules((prev) => prev.filter((_, idx) => idx !== i));
  }

  function previewMatches() {
    setScanning(true);
    setTimeout(() => {
      const count = 3 + Math.floor(Math.random() * 6);
      const start = Math.floor(Math.random() * RESOURCE_POOL.length);
      setMatchedResources(
        Array.from({ length: count }, (_, i) => RESOURCE_POOL[(start + i) % RESOURCE_POOL.length]),
      );
      setScanning(false);
      toast.success(`Scan complete — ${count} resources match current rules`);
    }, 1100);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Success Criteria" />
          <CheckList items={SUCCESS_CRITERIA} />
        </Card>
        <Card>
          <CardHeader title="At a Glance" />
          <KVRows rows={AT_A_GLANCE} />
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-bold text-black dark:text-zinc-100">
            Where This Template Applies
          </h2>
          <div className="flex gap-2">
            <button
              onClick={previewMatches}
              disabled={scanning}
              className="rounded-md px-3.5 py-1.5 text-[12.5px] font-semibold text-black/60 hover:bg-zinc-50 disabled:opacity-50 dark:text-zinc-400"
            >
              {scanning ? "Scanning…" : "Preview Matches"}
            </button>
            <button
              onClick={() => setEditorOpen((v) => !v)}
              className="rounded-md border border-zinc-300 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              Edit Match Rules
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setApplyMode((m) => (m === "Automatic" ? "Manual" : "Automatic"))}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide",
              applyMode === "Automatic"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-amber-500 text-white",
            )}
          >
            {applyMode}
          </button>
          <span className="text-[12px] text-black/50 dark:text-zinc-500">
            — any resource matching the rules below is bound to this template as soon
            as it&apos;s created
          </span>
        </div>

        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
          Match Rules
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {scopeRules.length ? (
            scopeRules.map((r, i) => (
              <span
                key={`${r}-${i}`}
                className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 font-mono text-[12px] text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                {r}
                <button onClick={() => removeRule(i)} className="text-black/30 hover:text-rose-600">
                  <X size={11} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-[12.5px] text-black/40 dark:text-zinc-500">
              No match rules — template must be applied manually.
            </span>
          )}
        </div>

        {editorOpen && (
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              value={ruleInput}
              onChange={(e) => setRuleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRule()}
              placeholder="e.g. region:us-east-1"
              className="h-9 min-w-[200px] flex-1 rounded-full border border-zinc-200 px-3.5 text-[12.5px] focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            />
            <button
              onClick={addRule}
              className="rounded-md border border-zinc-300 bg-white px-3.5 text-[12.5px] font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              Add rule
            </button>
            <button
              onClick={() => {
                setEditorOpen(false);
                toast.success("Match rules saved");
              }}
              className="rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white hover:bg-emerald-700"
            >
              Done
            </button>
          </div>
        )}

        <div className="mb-1.5 mt-4 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
            Matched Resources
          </span>
          <span className="text-[12px] text-black/40 dark:text-zinc-500">
            {matchedResources.length} resources
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {matchedResources.map((r, i) => (
            <span
              key={`${r}-${i}`}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {r}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Linked Incidents" hint="most recent, this template" />
        <div>
          {linked.map((inc, i) => (
            <div
              key={inc.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 py-2.5 text-[12.5px]",
                i !== linked.length - 1 && "border-b border-zinc-100 dark:border-zinc-800",
              )}
            >
              <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                {inc.id}
              </span>
              <span className="flex-1 text-black dark:text-zinc-200">{inc.title}</span>
              <span className="text-black/40 dark:text-zinc-500">{inc.when}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{inc.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
