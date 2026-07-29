"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Select from "@/components/ui/select";
import { Card, CardHeader, KVRows, MiniStat } from "./DetailPrimitives";
import {
  ANALYTICS_30D,
  COST_ROI,
  HISTORICAL_INCIDENTS,
  OUTCOME_COMPARISON,
  SIM_EXECUTION_TIMELINE,
  SIM_REPLAY_TIMELINE,
} from "./incidentTemplates.data";

export default function SimulationAnalyticsTab() {
  const [incident, setIncident] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timelineMode, setTimelineMode] = useState<"run" | "replay">("run");
  const [showCompare, setShowCompare] = useState(false);

  function flashState(msg: string) {
    setNote(msg);
    setTimeout(() => setNote(null), 3500);
  }

  function runSimulation(mode: "run" | "replay" = "run") {
    setTimelineMode(mode);
    setShowResult(false);
    setRunning(true);
    setProgress(0);
    requestAnimationFrame(() => setProgress(100));
    setTimeout(() => {
      setRunning(false);
      setShowResult(true);
    }, 1500);
  }

  const timeline = timelineMode === "run" ? SIM_EXECUTION_TIMELINE : SIM_REPLAY_TIMELINE;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Run Simulation" hint="safe, no production actions" />

        <div className="mb-3 flex flex-wrap gap-2.5">
          <div className="min-w-[220px] flex-1">
            <Select
              value={incident}
              onChange={(e) => setIncident(String(e.target.value))}
              options={HISTORICAL_INCIDENTS}
              placeholder="Select a historical incident…"
            />
          </div>
          <button
            onClick={() => {
              flashState(
                `Mock signals generated${incident ? ` for ${incident}` : ""} — 214 events synthesized across 6 sources.`,
              );
              toast.success("Mock signals ready");
            }}
            className="rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            Generate Mock Signals
          </button>
          <button
            onClick={() => {
              flashState("Failure injected: simulated deployment health-check failure at T+12s.");
              toast.warning("Failure injected into simulation");
            }}
            className="rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            Inject Failure
          </button>
        </div>

        {note && (
          <div className="mb-3 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            {note}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => runSimulation("run")}
            className="rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
          >
            ▶ Run Simulation
          </button>
          <button
            onClick={() => runSimulation("replay")}
            className="rounded-md px-3.5 py-2 text-[12.5px] font-semibold text-black/60 hover:bg-zinc-50 dark:text-zinc-400"
          >
            Replay Incident
          </button>
          <button
            onClick={() => setShowCompare((v) => !v)}
            className="rounded-md px-3.5 py-2 text-[12.5px] font-semibold text-black/60 hover:bg-zinc-50 dark:text-zinc-400"
          >
            Compare Outcomes
          </button>
        </div>

        {running && (
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-[1400ms] ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {showResult && (
          <div className="rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
            <strong className="text-[13px] text-black dark:text-zinc-100">
              {timelineMode === "run" ? "Execution Timeline" : "Replay Timeline"}
            </strong>
            <div className="relative mt-3 pl-5">
              <div className="absolute bottom-1 left-[3px] top-1 w-px bg-zinc-200 dark:bg-zinc-700" />
              {timeline.map((step) => (
                <div key={step} className="relative pb-3 last:pb-0">
                  <span className="absolute -left-5 top-1 h-[7px] w-[7px] rounded-full border-2 border-emerald-600 bg-white dark:bg-zinc-900" />
                  <span className="text-[12.5px] text-black dark:text-zinc-200">{step}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <MiniStat label="Automation Score" value="94" tone="yes" />
              <MiniStat label="Policy Violations" value="0" tone="yes" />
              <MiniStat label="Est. MTTR" value="3m 40s" />
            </div>
          </div>
        )}

        {showCompare && (
          <div className="mt-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900/40">
            <strong className="text-[13px] text-black dark:text-zinc-100">
              Automated vs. Manual Outcome
            </strong>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 bg-white p-3.5 dark:border-zinc-700 dark:bg-zinc-900">
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-black/50 dark:text-zinc-500">
                  Scrubbe Automated
                </h4>
                {OUTCOME_COMPARISON.automated.map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 text-[12.5px]">
                    <span className="text-black/60 dark:text-zinc-400">{k}</span>
                    <strong className="text-black dark:text-zinc-100">{v}</strong>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3.5 dark:border-zinc-700 dark:bg-zinc-900">
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-black/50 dark:text-zinc-500">
                  Manual Response (historical avg.)
                </h4>
                {OUTCOME_COMPARISON.manual.map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 text-[12.5px]">
                    <span className="text-black/60 dark:text-zinc-400">{k}</span>
                    <strong className="text-black dark:text-zinc-100">{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Analytics" hint="last 30 days" />
        <KVRows rows={ANALYTICS_30D} />
        <h3 className="mb-2.5 mt-5 text-[13px] font-bold text-black dark:text-zinc-100">
          Cost &amp; ROI
        </h3>
        <KVRows rows={COST_ROI} />
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-mono text-[26px] font-bold text-emerald-600 dark:text-emerald-400">11×</span>
          <span className="text-[12px] text-black/60 dark:text-zinc-400">
            return on automation investment
          </span>
        </div>
      </Card>
    </div>
  );
}
