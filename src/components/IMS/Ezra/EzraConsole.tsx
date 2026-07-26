/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Plus, Send, Terminal, BarChart3, ListTree,
  ShieldAlert, History,
} from "lucide-react";
import { CiClock2, CiGift } from "react-icons/ci";
import { GoGitBranch } from "react-icons/go";
import { BsShieldExclamation } from "react-icons/bs";
import { FiMessageSquare, FiShield } from "react-icons/fi";
import { IoCodeSlashSharp } from "react-icons/io5";
import { AiOutlineLineChart } from "react-icons/ai";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { useIncidentSelection } from "@/hooks/useIncidentSelection";
import { useIncidentDetail } from "@/hooks/useIncidentWorkspace";
import { useSharedAI } from "@/hooks/useSharedAI";
import { endpoint } from "@/lib/api/endpoint";
import moment from "moment";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────

type EzraAudience = "ENGINEER" | "LEADERSHIP";
type Analysis = {
  id: string; incidentId: string; createdAt: string;
  situation?: any; rootCause?: any; impact?: any; remediation?: any;
  reports?: Array<{ id: string; audience: EzraAudience; narrative: string; createdAt: string }>;
};
type ChatMessage = { role: "user" | "ezra"; content: string; timestamp: Date };

// ── Helpers ───────────────────────────────────────────────────────

const normalizeIncidentId = (value?: string | null) => (value ?? "").trim().toUpperCase();
const hasMatchingIncidentId = (id: string | null | undefined, candidates: string[]) => {
  const n = normalizeIncidentId(id);
  return Boolean(n) && candidates.includes(n);
};

// ── Main component ────────────────────────────────────────────────

export default function EzraConsole() {
  const { get, post } = useFetch();
  const { incidentId: routeIncidentId } = useIncidentSelection();
  const { data: selectedIncident } = useIncidentDetail(routeIncidentId);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [audience, setAudience]   = useState<EzraAudience>("LEADERSHIP");
  const [input, setInput]         = useState("");
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const messagesEndRef            = useRef<HTMLDivElement>(null);
  const autoAnalysisKeyRef        = useRef<string | null>(null);

  const { whoIsThinking } = useSharedAI(selectedIncident?.id ?? null);
  const teamThinking = whoIsThinking();

  const { data: analysesData, isLoading: loadingAnalyses, refetch: refetchAnalyses } = useQuery({
    queryKey: ["ezra-analyses"],
    queryFn: async () => {
      const res = await get(endpoint.ezra.analyses);
      return res.success ? (res.data?.data?.analyses ?? res.data?.data ?? []) as Analysis[] : [] as Analysis[];
    },
    refetchOnWindowFocus: false,
  });

  const analyses = analysesData ?? [];
  const preferredIncidentId = selectedIncident?.ticketId ?? selectedIncident?.id ?? routeIncidentId ?? null;
  const incidentCandidates = [routeIncidentId, selectedIncident?.id, selectedIncident?.ticketId].map(normalizeIncidentId).filter(Boolean);

  const { mutateAsync: runAnalyse, isPending: analysing } = useMutation({
    mutationFn: async (incidentId: string) => {
      const res = await post(endpoint.ezra.analyse, { incidentId });
      if (!res.success) throw new Error(res.data?.message ?? "Analysis failed");
      return (res.data?.data ?? res.data) as Analysis;
    },
  });

  const { mutateAsync: generateReport, isPending: generatingReport } = useMutation({
    mutationFn: async ({ analysisId, aud }: { analysisId: string; aud: EzraAudience }) => {
      const res = await post(endpoint.ezra.report, { analysisId, audience: aud });
      if (!res.success) throw new Error(res.data?.message ?? "Report failed");
      return res.data?.data ?? res.data;
    },
  });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const addMessage         = (role: "user" | "ezra", content: string) => setMessages((p) => [...p, { role, content, timestamp: new Date() }]);
  const replaceLastMessage = (content: string) => setMessages((p) => { if (!p.length) return [{ role: "ezra", content, timestamp: new Date() }]; const u = [...p]; u[u.length - 1] = { role: "ezra", content, timestamp: new Date() }; return u; });

  const analyseIncident = async (incidentId: string, options?: { replaceLastMessage?: boolean }) => {
    try {
      const analysis = await runAnalyse(incidentId.trim());
      setSelectedAnalysis(analysis);
      await refetchAnalyses();
      if (!analysis.id) return;
      const report = await generateReport({ analysisId: analysis.id, aud: audience });
      const narrative = report?.narrative ?? report?.content ?? JSON.stringify(analysis.situation ?? {}, null, 2);
      options?.replaceLastMessage ? replaceLastMessage(narrative) : addMessage("ezra", narrative);
    } catch (err: any) {
      const msg = err?.message ?? "Analysis failed. Check the incident ID and try again.";
      options?.replaceLastMessage ? replaceLastMessage(msg) : addMessage("ezra", msg);
    }
  };

  const handleSend = async () => {
    const query = input.trim();
    if (!query) return;
    setInput("");
    addMessage("user", query);
    const match = query.match(/INC[-–]?[A-Z0-9]+/i);
    const incidentId = match ? match[0].replace(/–/g, "-").toUpperCase() : selectedAnalysis?.incidentId ?? preferredIncidentId;
    if (!incidentId) { addMessage("ezra", "Please specify an incident ID (e.g. INC-311) or select a session from the left panel."); return; }
    addMessage("ezra", `Analysing ${incidentId}...`);
    await analyseIncident(incidentId, { replaceLastMessage: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleSelectAnalysis = async (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setMessages([]);
    const existing = analysis.reports?.find((r) => r.audience === audience);
    if (existing) addMessage("ezra", existing.narrative);
    else if (analysis.id) addMessage("ezra", `Loaded analysis for ${analysis.incidentId}. Switch audience view or ask a question to generate a report.`);
  };

  const handleAudienceSwitch = async (aud: EzraAudience) => {
    setAudience(aud);
    if (!selectedAnalysis?.id) return;
    try {
      const existing = selectedAnalysis.reports?.find((r) => r.audience === aud);
      if (existing) { addMessage("ezra", existing.narrative); return; }
      addMessage("ezra", `Generating ${aud === "LEADERSHIP" ? "Leadership" : "Analyst"} report…`);
      const report = await generateReport({ analysisId: selectedAnalysis.id, aud });
      const narrative = report?.narrative ?? report?.content ?? "Report generated.";
      setMessages((p) => { const u = [...p]; u[u.length - 1] = { role: "ezra", content: narrative, timestamp: new Date() }; return u; });
    } catch { /* silent */ }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!incidentCandidates.length) { autoAnalysisKeyRef.current = null; return; }
    const matching = analyses.find((a) => hasMatchingIncidentId(a.incidentId, incidentCandidates));
    if (matching) {
      autoAnalysisKeyRef.current = normalizeIncidentId(matching.incidentId);
      if (selectedAnalysis?.id !== matching.id) void handleSelectAnalysis(matching);
      return;
    }
    const n = normalizeIncidentId(preferredIncidentId);
    if (!n || autoAnalysisKeyRef.current === n || analysing || generatingReport) return;
    autoAnalysisKeyRef.current = n;
    setMessages([{ role: "ezra", content: `Analysing ${preferredIncidentId}...`, timestamp: new Date() }]);
    void analyseIncident(preferredIncidentId as string, { replaceLastMessage: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyses, analysing, generatingReport, incidentCandidates, preferredIncidentId, selectedAnalysis?.id]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-zinc-200 p-6 font-sans antialiased">

      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-[16px] font-bold text-black dark:text-zinc-100 flex items-center gap-2">
            Ezra
            <span className="text-zinc-400 dark:text-zinc-500 font-normal text-[14px]">· Incident Counsel</span>
          </h1>
          <p className="text-[12px] text-black dark:text-zinc-400 max-w-lg leading-relaxed">
            Ask Ezra about incidents, MTTR, risk, and fraud impact — it answers differently for leadership and for hands-on analysts.
            {selectedIncident ? ` Focused on ${selectedIncident.ticketId}.` : ""}
          </p>
          {teamThinking && (
            <p className="text-[11px] text-indigo-500 flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              {teamThinking.triggeredBy.name} is running an AI analysis…
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <NavBadge icon={<GoGitBranch size={13} />}        label="Code Engine" route="/incident/code-engine" />
          <NavBadge icon={<CiClock2 size={13} />}           label="MTTR & SLOs" route=""                     />
          <NavBadge icon={<BsShieldExclamation size={13} />}label="Fraud & risk" route=""                    />
        </div>
      </header>

      <main className="grid grid-cols-12 gap-5 h-[calc(100vh-120px)]">

        {/* Left — Sessions */}
        <aside className="col-span-3 border border-zinc-500 dark:border-zinc-700/60 rounded-xl bg-white dark:bg-zinc-900/40 p-4 flex flex-col gap-5 overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">Sessions</p>
            <button
              onClick={() => { setSelectedAnalysis(null); setMessages([]); }}
              className="flex items-center gap-1 px-2.5 py-1 border border-zinc-500 dark:border-zinc-700 rounded-lg text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Plus size={12} /> New
            </button>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {loadingAnalyses && [1,2,3].map((i) => (
              <div key={i} className="h-14 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 animate-pulse" />
            ))}
            {!loadingAnalyses && analyses.length === 0 && (
              <p className="text-[11px] text-black dark:text-zinc-500 text-center pt-4">
                No sessions yet. Ask Ezra about an incident to start.
              </p>
            )}
            {analyses.map((a) => (
              <SessionCard
                key={a.id}
                title={a.incidentId}
                subtitle={moment(a.createdAt).fromNow()}
                active={selectedAnalysis?.id === a.id}
                onClick={() => handleSelectAnalysis(a)}
              />
            ))}
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">Quick prompts</p>
            {[
              { icon: <FiMessageSquare size={12} />, label: "Leadership view",    prompt: "Summarise the leadership impact of this incident"  },
              { icon: <IoCodeSlashSharp size={12} />, label: "Analyst breakdown", prompt: "Give me an analyst breakdown of this incident"      },
              { icon: <FiShield size={12} />,         label: "Fraud risk",        prompt: "What is the fraud risk from this incident?"         },
            ].map(({ icon, label, prompt }) => (
              <button
                key={label}
                onClick={() => setInput(prompt)}
                className="w-full flex items-center gap-2 text-[11px] text-black dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 transition-colors"
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-1.5">Input behaviour</p>
            <p className="text-[11px] text-black dark:text-zinc-500">Enter = send · Shift+Enter = new line</p>
          </div>
        </aside>

        {/* Center — Chat */}
        <section className="col-span-5 flex flex-col border border-zinc-500 dark:border-zinc-700/60 rounded-xl bg-white dark:bg-zinc-900/40 overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-[12px] font-mono text-black dark:text-zinc-400">
              <span className="text-emerald-600 dark:text-emerald-400">ezra</span>
              {" / "}
              <span className="text-sky-600 dark:text-sky-400">scrubbe</span>
              {(selectedAnalysis?.incidentId || preferredIncidentId) && ` / ${selectedAnalysis?.incidentId ?? preferredIncidentId}`}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleAudienceSwitch("LEADERSHIP")}
                disabled={generatingReport}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                  audience === "LEADERSHIP"
                    ? "border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/8"
                    : "border-zinc-200 dark:border-zinc-700 text-black hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <CiGift size={14} /> Leadership
              </button>
              <button
                onClick={() => handleAudienceSwitch("ENGINEER")}
                disabled={generatingReport}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                  audience === "ENGINEER"
                    ? "border-sky-300 dark:border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/8"
                    : "border-zinc-200 dark:border-zinc-700 text-black hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <AiOutlineLineChart size={14} /> Analyst
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <img src="/IMS/icons/star.svg" alt="" className="size-12 opacity-40" />
                <p className="max-w-xs text-[12px] text-black dark:text-zinc-500 leading-relaxed">
                  Ezra is wired into incident metrics, logs, and fraud telemetry. Ask a question to start signal provenance.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-500/20"
                    : "bg-zinc-50 dark:bg-zinc-800/60 text-black dark:text-zinc-200 border border-zinc-100 dark:border-zinc-800"
                }`}>
                  {msg.content}
                  <p className="text-[9px] text-black dark:text-zinc-500 mt-1">{moment(msg.timestamp).fromNow()}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="relative">
              <img src="/IMS/icons/star.svg" alt="" className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 opacity-50" />
              <input
                className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-500 dark:border-zinc-700 rounded-xl py-3 pl-10 pr-12 text-[13px] text-black dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500/50 transition-colors"
                placeholder="Ask Ezra — e.g. 'Analyse INC-311' or 'What caused the checkout failure?'"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={analysing || generatingReport}
              />
              <button
                onClick={handleSend}
                disabled={analysing || generatingReport || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Right — Context */}
        <aside className="col-span-4 space-y-3 overflow-y-auto pr-1">

          {/* Live context */}
          <div className="border border-zinc-500 dark:border-zinc-700/60 rounded-xl bg-white dark:bg-zinc-900/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-black dark:text-zinc-100">Live incident context</p>
              {selectedAnalysis ? (
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> synced
                </span>
              ) : selectedIncident ? (
                <span className="text-[11px] text-sky-500">selected</span>
              ) : (
                <span className="text-[11px] text-black dark:text-zinc-500">none</span>
              )}
            </div>

            {selectedAnalysis || selectedIncident ? (
              <div className="space-y-2.5">
                {[
                  { label: "Incident", value: selectedAnalysis?.incidentId ?? selectedIncident?.ticketId ?? selectedIncident?.id ?? "—" },
                  { label: "Service",  value: selectedAnalysis?.situation?.affectedServices?.[0]?.name ?? selectedIncident?.service ?? "—" },
                  { label: "Region",   value: selectedAnalysis?.situation?.environment ?? selectedIncident?.environment ?? "—" },
                  { label: "Status",   value: selectedAnalysis?.situation?.currentState ?? selectedIncident?.status ?? "Selected", valueClass: "text-amber-600 dark:text-amber-400" },
                  { label: "Analysed", value: selectedAnalysis?.createdAt ? moment(selectedAnalysis.createdAt).fromNow() : "Awaiting" },
                ].map(({ label, value, valueClass }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-[11px] text-black dark:text-zinc-500">{label}</span>
                    <span className={`text-[11px] font-semibold ${valueClass ?? "text-black dark:text-zinc-200"}`}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-black dark:text-zinc-500">Select a session or analyse an incident to see context here.</p>
            )}

            {selectedAnalysis && (
              <div className="grid grid-cols-2 gap-2.5">
                <MetricBox label="Risk score"   value={selectedAnalysis.impact?.riskScore != null ? `${selectedAnalysis.impact.riskScore}/100` : "—"} sub={selectedAnalysis.impact?.severity ?? ""} subClass={selectedAnalysis.impact?.riskScore >= 70 ? "text-rose-500" : "text-amber-500"} />
                <MetricBox label="Blast radius" value={selectedAnalysis.impact?.blastRadius?.scope ?? "—"} sub={`${selectedAnalysis.impact?.affectedUsers ?? 0} users`} />
                <MetricBox label="MTTR target"  value={selectedAnalysis.remediation?.options?.[0]?.estimatedMTTR ? `${selectedAnalysis.remediation.options[0].estimatedMTTR} min` : "—"} sub={selectedAnalysis.remediation?.options?.[0]?.title ?? ""} />
                <MetricBox label="Confidence"   value={selectedAnalysis.rootCause?.confidence != null ? `${Math.round(selectedAnalysis.rootCause.confidence * 100)}%` : "—"} sub="root cause signal" subClass="text-emerald-500 dark:text-emerald-400" />
              </div>
            )}
          </div>

          {/* Output focus */}
          <div className="border border-zinc-500 dark:border-zinc-700/60 rounded-xl bg-white dark:bg-zinc-900/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-black dark:text-zinc-100">Ezra output focus</p>
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-semibold ${
                audience === "LEADERSHIP"
                  ? "border-emerald-200 dark:border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                  : "border-sky-200 dark:border-sky-500/25 text-sky-600 dark:text-sky-400"
              }`}>
                <CiGift size={12} /> {audience === "LEADERSHIP" ? "Leadership" : "Engineer"}
              </span>
            </div>
            <div className="text-[12px] text-zinc-600 dark:text-zinc-300 space-y-2">
              {audience === "LEADERSHIP" ? (
                <>
                  <p>Leadership framing: revenue, customer trust and time-to-stable are prioritised.</p>
                  <ul className="pl-3 list-disc space-y-1 text-[11px] text-black dark:text-zinc-500">
                    <li>Clear view of impact, blast radius and exposure.</li>
                    <li>Simple narrative: what happened, are we in control, when are we stable.</li>
                    <li>Explicit next steps and owner for follow-up work.</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>Analyst framing: root cause, signals, and actionable remediation steps.</p>
                  <ul className="pl-3 list-disc space-y-1 text-[11px] text-black dark:text-zinc-500">
                    <li>Detailed root cause hypothesis and confidence.</li>
                    <li>Signal trace: what changed, when, and in which service.</li>
                    <li>Ranked remediation options with risk assessment.</li>
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Quick prompts */}
          <div className="border border-zinc-500 dark:border-zinc-700/60 rounded-xl bg-white dark:bg-zinc-900/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-3">Quick prompts</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <ListTree size={13} />,   label: "CI/CD",           prompt: "Analyse the CI/CD pipeline signals for this incident"  },
                { icon: <BarChart3 size={13} />,  label: "Metrics",         prompt: "What metrics triggered this incident?"                 },
                { icon: <Terminal size={13} />,   label: "Logs",            prompt: "Summarise the error logs from this incident"           },
                { icon: <ShieldAlert size={13} />,label: "Fraud signals",   prompt: "What fraud signals are associated with this incident?" },
                { icon: <History size={13} />,    label: "Past incidents",  prompt: "Show similar past incidents and patterns"              },
              ].map(({ icon, label, prompt }) => (
                <button
                  key={label}
                  onClick={() => setInput(prompt)}
                  className="flex items-center gap-2 px-3 py-2 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg text-[11px] font-medium text-black dark:text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-700 hover:text-black dark:hover:text-zinc-200 transition-colors"
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Response behaviour */}
          <div className="border border-zinc-500 dark:border-zinc-700/60 rounded-xl bg-white dark:bg-zinc-900/40 p-4">
            <p className="text-[13px] font-semibold text-black dark:text-zinc-100 mb-1.5">Ezra response behaviour</p>
            <p className="text-[12px] text-black dark:text-zinc-500 leading-relaxed">
              Typical response 2–6s (includes Code Engine + telemetry fetch). Guardrails always apply before any fix.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────

const NavBadge = ({ icon, label, route }: { icon: React.ReactNode; label: string; route: string }) => (
  <Link
    href={route || ""}
    className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-500 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-900/40 text-[11px] font-medium text-black dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
  >
    <span className="text-zinc-400 dark:text-zinc-500">{icon}</span>
    {label}
  </Link>
);

const SessionCard = ({ title, subtitle, active = false, onClick }: { title: string; subtitle: string; active?: boolean; onClick?: () => void }) => (
  <div
    onClick={onClick}
    className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
      active
        ? "border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/8"
        : "border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
    }`}
  >
    <p className="text-[12px] font-semibold text-black dark:text-zinc-100 mb-0.5">{title}</p>
    <p className="text-[11px] text-black dark:text-zinc-500">{subtitle}</p>
  </div>
);

const MetricBox = ({ label, value, sub, subClass = "text-zinc-400 dark:text-zinc-500" }: { label: string; value: string; sub?: string; subClass?: string }) => (
  <div className="p-3 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl space-y-1">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-black dark:text-zinc-500">{label}</p>
    <p className="text-[13px] font-semibold text-black dark:text-zinc-100">{value}</p>
    {sub && <p className={`text-[9px] leading-tight ${subClass}`}>{sub}</p>}
  </div>
);