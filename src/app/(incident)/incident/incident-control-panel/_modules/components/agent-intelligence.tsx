// components/ICP/AgentIntelligence.tsx
"use client";

import React, { useState } from "react";
import { AGENTS } from "../libs/data";
import { Panel, SubH, ChartCard, LinkAction } from "./shared";
import { AgentAccuracyChart, SuccessDonut, Sparkline } from "./charts";
import SideModal from "@/components/ui/SideModal";

interface Props {
  onChartClick: (key: string) => void;
  onExpand: () => void;
}

export default function AgentIntelligence({ onChartClick, onExpand }: Props) {
  const [showAllAgents, setShowAllAgents] = useState(false);
  const [showAgentHealth, setShowAgentHealth] = useState(false);

  return (
    <>
      <Panel number="7." title="Agent Intelligence" onExpand={onExpand}>
        <div className="grid grid-cols-1 sm:grid-cols-[1.05fr_1.25fr_0.7fr] xl:grid-cols-2 gap-4">
          {/* Agent table with sparkline trends */}
          <div>
            <SubH>Agent Performance Overview</SubH>
            <table className="w-full text-[11.5px]">
              <thead>
                <tr className="text-zinc-400 font-semibold text-[10.5px]">
                  <th className="text-left pb-2">Agent</th>
                  <th className="text-left pb-2">Acc.</th>
                  <th className="text-left pb-2">Tasks</th>
                  <th className="text-left pb-2 w-[60px]">Trend</th>
                </tr>
              </thead>
              <tbody>
                {AGENTS.map((a) => (
                  <tr key={a.name} className="border-t border-zinc-100">
                    <td className="py-2 font-medium text-zinc-700 truncate max-w-[120px]">
                      {a.name}
                    </td>
                    <td className="py-2 font-mono text-emerald-600 font-semibold">
                      {a.accuracy}%
                    </td>
                    <td className="py-2 font-mono text-zinc-500">{a.tasks}</td>
                    <td className="py-2 max-w-[60px]">
                      <Sparkline data={a.trend} color={a.color} height={20} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3">
              <button type="button" onClick={() => setShowAllAgents(true)}>
                <LinkAction>View all agents →</LinkAction>
              </button>
            </div>
          </div>

          {/* Accuracy chart */}
          <ChartCard chartKey="agentAcc" onClick={onChartClick}>
            <SubH>Accuracy Over Time</SubH>
            <div className="h-[140px]">
              <AgentAccuracyChart />
            </div>
          </ChartCard>

          {/* Health donut */}
          <ChartCard
            chartKey="agentHealth"
            onClick={onChartClick}
            className="flex flex-col items-center gap-2"
          >
            <SubH>Agent Health</SubH>
            <div className="w-[90px]">
              <SuccessDonut rate={90.4} />
            </div>
            <span className="text-[11px] font-mono font-semibold text-emerald-600">
              ↑ 4.2%
            </span>
            <div className="mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAgentHealth(true);
                }}
              >
                <LinkAction>View agent health →</LinkAction>
              </button>
            </div>
          </ChartCard>
        </div>
      </Panel>

      {/* ── View all agents side modal ── */}
      {showAllAgents && (
        <SideModal
          isOpen={showAllAgents}
          onClose={() => setShowAllAgents(false)}
          title="Agent Roster"
          subTitle="Per-agent accuracy, throughput, latency and drift."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-200">
                  <th className="text-left pb-2 pr-2">Agent</th>
                  <th className="text-left pb-2 pr-2">Accuracy</th>
                  <th className="text-left pb-2 pr-2">Tasks</th>
                  <th className="text-left pb-2 pr-2">Avg latency</th>
                  <th className="text-left pb-2">30d drift</th>
                </tr>
              </thead>
              <tbody>
                {AGENTS.map((a) => (
                  <tr key={a.name} className="border-t border-zinc-100">
                    <td className="py-2.5 pr-2 font-semibold text-zinc-800">
                      {a.name}
                    </td>
                    <td className="py-2.5 pr-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          a.accuracy >= 90
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {a.accuracy}%
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 font-mono text-zinc-500">
                      {a.tasks}
                    </td>
                    <td className="py-2.5 pr-2 font-mono text-zinc-500">
                      {a.latency}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={
                          a.drift.startsWith("-")
                            ? "text-red-600"
                            : "text-emerald-600"
                        }
                      >
                        {a.drift}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SideModal>
      )}

      {/* ── Agent health side modal ── */}
      {showAgentHealth && (
        <SideModal
          isOpen={showAgentHealth}
          onClose={() => setShowAgentHealth(false)}
          title="Agent Health Monitor"
          subTitle="Live health, accuracy and drift across all intelligence agents."
        >
          <div className="space-y-5">
            {/* Fleet health donut */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-5 flex flex-col items-center">
              <div className="w-[160px]">
                <SuccessDonut rate={90.4} big />
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full mt-3">
                ↑ 4.2% · 6 of 6 agents healthy
              </span>
            </div>

            {/* Per-agent status table */}
            <div className="overflow-x-auto">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2.5">
                Per-agent status
              </h3>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-200">
                    <th className="text-left pb-2 pr-2">Agent</th>
                    <th className="text-left pb-2 pr-2">Accuracy</th>
                    <th className="text-left pb-2 pr-2">30d drift</th>
                    <th className="text-left pb-2 pr-2">Latency</th>
                    <th className="text-left pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {AGENTS.map((a) => (
                    <tr key={a.name} className="border-t border-zinc-100">
                      <td className="py-2.5 pr-2 font-semibold text-zinc-800">
                        {a.name}
                      </td>
                      <td className="py-2.5 pr-2 font-mono text-zinc-700">
                        {a.accuracy}%
                      </td>
                      <td className="py-2.5 pr-2">
                        <span
                          className={
                            a.drift.startsWith("-")
                              ? "text-red-600"
                              : "text-emerald-600"
                          }
                        >
                          {a.drift}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 font-mono text-zinc-500">
                        {a.latency}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            a.accuracy >= 90
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {a.accuracy >= 90 ? "Healthy" : "Monitor"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SideModal>
      )}
    </>
  );
}
