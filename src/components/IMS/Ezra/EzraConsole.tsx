/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Send,
  Terminal,
  BarChart3,
  ListTree,
  ShieldAlert,
  History,
  Layout,
} from "lucide-react";
import { CiClock2, CiGift } from "react-icons/ci";
import { GoGitBranch } from "react-icons/go";
import { BsShieldExclamation } from "react-icons/bs";
import { FiMessageSquare, FiShield } from "react-icons/fi";
import { IoCodeSlashSharp } from "react-icons/io5";
import { AiOutlineLineChart } from "react-icons/ai";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import moment from "moment";
import Link from "next/link";

type EzraAudience = "ENGINEER" | "LEADERSHIP";

type Analysis = {
  id: string;
  incidentId: string;
  createdAt: string;
  situation?: any;
  rootCause?: any;
  impact?: any;
  remediation?: any;
  reports?: Array<{
    id: string;
    audience: EzraAudience;
    narrative: string;
    createdAt: string;
  }>;
};

type ChatMessage = {
  role: "user" | "ezra";
  content: string;
  timestamp: Date;
};

export default function EzraConsole() {
  const { get, post } = useFetch();
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(
    null
  );
  const [audience, setAudience] = useState<EzraAudience>("LEADERSHIP");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: analysesData,
    isLoading: loadingAnalyses,
    refetch: refetchAnalyses,
  } = useQuery({
    queryKey: ["ezra-analyses"],
    queryFn: async () => {
      const res = await get(endpoint.ezra.analyses);
      if (res.success)
        return (res.data?.data?.analyses ?? res.data?.data ?? []) as Analysis[];
      return [] as Analysis[];
    },
    refetchOnWindowFocus: false,
  });

  const analyses = analysesData ?? [];

  const { mutateAsync: runAnalyse, isPending: analysing } = useMutation({
    mutationFn: async (incidentId: string) => {
      const res = await post(endpoint.ezra.analyse, { incidentId });
      if (!res.success) throw new Error(res.data?.message ?? "Analysis failed");
      return (res.data?.data ?? res.data) as Analysis;
    },
  });

  const { mutateAsync: generateReport, isPending: generatingReport } =
    useMutation({
      mutationFn: async ({
        analysisId,
        aud,
      }: {
        analysisId: string;
        aud: EzraAudience;
      }) => {
        const res = await post(endpoint.ezra.report, {
          analysisId,
          audience: aud,
        });
        if (!res.success) throw new Error(res.data?.message ?? "Report failed");
        return res.data?.data ?? res.data;
      },
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: "user" | "ezra", content: string) => {
    setMessages((prev) => [...prev, { role, content, timestamp: new Date() }]);
  };

  const handleSend = async () => {
    const query = input.trim();
    if (!query) return;
    setInput("");
    addMessage("user", query);

    // Try to extract an incident ID from the query
    const incidentMatch = query.match(/INC[-–]?\d+/i);
    const incidentId = incidentMatch
      ? incidentMatch[0].replace(/–/, "-").toUpperCase()
      : selectedAnalysis?.incidentId ?? null;

    if (!incidentId) {
      addMessage(
        "ezra",
        "Please specify an incident ID (e.g. INC-311) or select a session from the left panel."
      );
      return;
    }

    try {
      addMessage("ezra", `Analysing ${incidentId}…`);
      const analysis = await runAnalyse(incidentId);
      setSelectedAnalysis(analysis);
      refetchAnalyses();

      // Generate narrated report for current audience
      if (analysis.id) {
        const report = await generateReport({
          analysisId: analysis.id,
          aud: audience,
        });
        const narrative =
          report?.narrative ??
          report?.content ??
          JSON.stringify(analysis.situation ?? {}, null, 2);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "ezra",
            content: narrative,
            timestamp: new Date(),
          };
          return updated;
        });
      }
    } catch (err: any) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ezra",
          content:
            err?.message ??
            "Analysis failed. Check the incident ID and try again.",
          timestamp: new Date(),
        };
        return updated;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectAnalysis = async (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setMessages([]);
    // If it already has a report for current audience, display it
    const existing = analysis.reports?.find((r) => r.audience === audience);
    if (existing) {
      addMessage("ezra", existing.narrative);
    } else if (analysis.id) {
      addMessage(
        "ezra",
        `Loaded analysis for ${analysis.incidentId}. Switch audience view or ask a question to generate a report.`
      );
    }
  };

  const handleAudienceSwitch = async (aud: EzraAudience) => {
    setAudience(aud);
    if (!selectedAnalysis?.id) return;
    try {
      const existing = selectedAnalysis.reports?.find(
        (r) => r.audience === aud
      );
      if (existing) {
        addMessage("ezra", existing.narrative);
        return;
      }
      addMessage(
        "ezra",
        `Generating ${aud === "LEADERSHIP" ? "Leadership" : "Analyst"} report…`
      );
      const report = await generateReport({
        analysisId: selectedAnalysis.id,
        aud,
      });
      const narrative =
        report?.narrative ?? report?.content ?? "Report generated.";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ezra",
          content: narrative,
          timestamp: new Date(),
        };
        return updated;
      });
    } catch {
      // silently fail
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  return (
    <div className="min-h-screen text-slate-300 p-6 font-sans antialiased">
      {/* Top Header Navigation */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            Ezra{" "}
            <span className="text-slate-500 font-normal">
              • Incident Counsel
            </span>
          </h1>
          <p className="text-sm max-w-lg">
            Ask Ezra about incidents, MTTR, risk, and fraud impact — it answers
            differently for leadership and for hands-on analysts.
          </p>
        </div>
        <div className="flex gap-3">
          <NavBadge
            icon={<GoGitBranch color="#FF8181" size={14} />}
            label="Code Engine"
            route="/incident/code-engine"
          />
          <NavBadge
            icon={<CiClock2 size={14} color="#EABD08" />}
            label="MTTR & SLOs"
            route=""
          />
          <NavBadge
            icon={<BsShieldExclamation color="#7599EC" size={14} />}
            label="Fraud & risk"
            route=""
          />
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
        {/* Left Column: Sessions */}
        <aside className="col-span-3 border border-white/10 rounded-2xl bg-[#030a1c] p-5 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="uppercase text-sm text-slate-300">Sessions</h2>
            <button
              onClick={() => {
                setSelectedAnalysis(null);
                setMessages([]);
              }}
              className="flex items-center gap-1 px-3 py-1 text-IMSCyan border border-IMSCyan rounded-lg text-xs font-bold transition-all"
            >
              <Plus size={14} /> New
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {loadingAnalyses && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            )}
            {!loadingAnalyses && analyses.length === 0 && (
              <p className="text-xs text-slate-500 text-center pt-4">
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

          <div className="border-t border-white/5 pt-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-300">
                Quick prompts
              </h3>
              <p
                className="text-[11px] text-slate-200 flex gap-1 items-center cursor-pointer hover:text-IMSCyan"
                onClick={() =>
                  handleQuickPrompt(
                    "Summarise the leadership impact of this incident"
                  )
                }
              >
                <FiMessageSquare /> Leadership view
              </p>
              <p
                className="text-[11px] text-slate-200 flex gap-1 items-center cursor-pointer hover:text-IMSCyan"
                onClick={() =>
                  handleQuickPrompt(
                    "Give me an analyst breakdown of this incident"
                  )
                }
              >
                <IoCodeSlashSharp /> Analyst breakdown
              </p>
              <p
                className="text-[11px] text-slate-200 flex gap-1 items-center cursor-pointer hover:text-IMSCyan"
                onClick={() =>
                  handleQuickPrompt(
                    "What is the fraud risk from this incident?"
                  )
                }
              >
                <FiShield /> Fraud risk
              </p>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-300">
                Input behaviour
              </h3>
              <p className="text-[11px] text-slate-400">
                Enter = send <br /> Shift+Enter = new line
              </p>
            </div>
          </div>
        </aside>

        {/* Center Column: Chat Interface */}
        <section className="col-span-5 flex flex-col border border-cyan-500/20 rounded-2xl bg-[#030a1c] relative overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs">
                <span className="text-green">ezra</span> @{" "}
                <span className="text-IMSCyan">scrubbe</span>
                {selectedAnalysis && ` / ${selectedAnalysis.incidentId}`}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAudienceSwitch("LEADERSHIP")}
                disabled={generatingReport}
                className={`flex items-center gap-2 rounded-md border text-xs px-2 py-0.5 transition-colors ${
                  audience === "LEADERSHIP"
                    ? "border-green text-green"
                    : "border-slate-600 text-slate-400 hover:border-green hover:text-green"
                }`}
              >
                <CiGift size={16} /> Leadership
              </button>
              <button
                onClick={() => handleAudienceSwitch("ENGINEER")}
                disabled={generatingReport}
                className={`px-2 py-0.5 rounded border text-xs flex items-center gap-2 transition-colors ${
                  audience === "ENGINEER"
                    ? "border-IMSCyan text-IMSCyan"
                    : "border-slate-700 text-slate-400 hover:border-IMSCyan hover:text-IMSCyan"
                }`}
              >
                <AiOutlineLineChart size={16} /> Analyst View
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                  <img
                    src="/IMS/icons/star.svg"
                    alt="ezrastar.svg"
                    className="size-16"
                  />
                </div>
                <p className="max-w-xs text-sm text-slate-500 leading-relaxed italic">
                  Ezra is wired into incident metrics, logs, and fraud
                  telemetry. Ask a question to start signal provenance.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-cyan-500/20 text-white"
                      : "bg-white/5 text-slate-300"
                  }`}
                >
                  {msg.content}
                  <div className="text-[9px] text-slate-500 mt-1">
                    {moment(msg.timestamp).fromNow()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-gradient-to-t from-black/40 to-transparent">
            <div className="relative group">
              <input
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-4 px-12 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                placeholder="Ask Ezra — e.g. 'Analyse INC-311' or 'What caused the checkout failure?'"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={analysing || generatingReport}
              />
              <div>
                <img
                  src="/IMS/icons/star.svg"
                  alt="ezrastar.svg"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 size-5"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={analysing || generatingReport || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Context & Metrics */}
        <aside className="col-span-4 space-y-3 overflow-y-auto pr-2">
          <div className="border border-white/10 rounded-2xl bg-[#030a1c] p-5 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-white">
                Live incident context
              </h2>
              {selectedAnalysis ? (
                <span className="text-sm text-green-500 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
                  synced from Scrubbe
                </span>
              ) : (
                <span className="text-sm text-slate-500">
                  No incident selected
                </span>
              )}
            </div>

            {selectedAnalysis ? (
              <div className="space-y-3">
                <ContextRow
                  label="Incident"
                  value={selectedAnalysis.incidentId}
                />
                <ContextRow
                  label="Service"
                  value={
                    selectedAnalysis.situation?.affectedServices?.[0]?.name ??
                    "—"
                  }
                />
                <ContextRow
                  label="Region"
                  value={selectedAnalysis.situation?.environment ?? "—"}
                />
                <ContextRow
                  label="Status"
                  value={selectedAnalysis.situation?.currentState ?? "Analysed"}
                  valueColor="text-yellow-500"
                />
                <ContextRow
                  label="Analysed"
                  value={moment(selectedAnalysis.createdAt).fromNow()}
                />
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Select a session or analyse an incident to see context here.
              </p>
            )}

            {selectedAnalysis && (
              <div className="grid grid-cols-2 gap-4">
                <MetricBox
                  label="Risk score"
                  value={
                    selectedAnalysis.impact?.riskScore != null
                      ? `${selectedAnalysis.impact.riskScore}/100`
                      : "—"
                  }
                  subValue={selectedAnalysis.impact?.severity ?? ""}
                  subValueColor={
                    selectedAnalysis.impact?.riskScore >= 70
                      ? "text-rose-500"
                      : "text-yellow-500"
                  }
                />
                <MetricBox
                  label="Blast radius"
                  value={selectedAnalysis.impact?.blastRadius?.scope ?? "—"}
                  subValue={`${
                    selectedAnalysis.impact?.affectedUsers ?? 0
                  } users affected`}
                />
                <MetricBox
                  label="MTTR target"
                  value={
                    selectedAnalysis.remediation?.options?.[0]?.estimatedMTTR
                      ? `${selectedAnalysis.remediation.options[0].estimatedMTTR} min`
                      : "—"
                  }
                  subValue={
                    selectedAnalysis.remediation?.options?.[0]?.title ?? ""
                  }
                />
                <MetricBox
                  label="Confidence"
                  value={
                    selectedAnalysis.rootCause?.confidence != null
                      ? `${Math.round(
                          selectedAnalysis.rootCause.confidence * 100
                        )}%`
                      : "—"
                  }
                  subValue="root cause signal"
                  subValueColor="text-green-500"
                />
              </div>
            )}
          </div>

          <div className="border border-white/10 rounded-2xl bg-[#030a1c] p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white mb-4">
                Ezra output focus
              </h3>
              <div
                className={`flex items-center gap-2 rounded-md border text-xs w-fit p-1 ${
                  audience === "LEADERSHIP"
                    ? "border-green text-green"
                    : "border-IMSCyan text-IMSCyan"
                }`}
              >
                <CiGift size={18} />{" "}
                {audience === "LEADERSHIP" ? "Leadership" : "Engineer"}
              </div>
            </div>
            <div className="text-sm mt-2">
              {audience === "LEADERSHIP" ? (
                <>
                  <p>
                    Leadership framing: revenue, customer trust and
                    time-to-stable are prioritised.
                  </p>
                  <ul className="pl-3 list-disc mt-2 space-y-1 text-slate-400 text-xs">
                    <li>Clear view of impact, blast radius and exposure.</li>
                    <li>
                      Simple narrative: what happened, are we in control, when
                      are we stable.
                    </li>
                    <li>Explicit next steps and owner for follow-up work.</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>
                    Analyst framing: root cause, signals, and actionable
                    remediation steps.
                  </p>
                  <ul className="pl-3 list-disc mt-2 space-y-1 text-slate-400 text-xs">
                    <li>Detailed root cause hypothesis and confidence.</li>
                    <li>
                      Signal trace: what changed, when, and in which service.
                    </li>
                    <li>Ranked remediation options with risk assessment.</li>
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className="border border-white/10 rounded-2xl bg-[#030a1c] p-5">
            <h3 className="text-xs font-bold text-white mb-4">Quick prompts</h3>
            <div className="grid grid-cols-2 gap-2">
              <PromptButton
                icon={<ListTree size={14} />}
                label="CI/CD"
                onClick={() =>
                  handleQuickPrompt(
                    "Analyse the CI/CD pipeline signals for this incident"
                  )
                }
              />
              <PromptButton
                icon={<BarChart3 size={14} />}
                label="Metrics"
                onClick={() =>
                  handleQuickPrompt("What metrics triggered this incident?")
                }
              />
              <PromptButton
                icon={<Terminal size={14} />}
                label="Logs"
                onClick={() =>
                  handleQuickPrompt(
                    "Summarise the error logs from this incident"
                  )
                }
              />
              <PromptButton
                icon={<ShieldAlert size={14} />}
                label="Fraud signals"
                onClick={() =>
                  handleQuickPrompt(
                    "What fraud signals are associated with this incident?"
                  )
                }
              />
              <PromptButton
                icon={<History size={14} />}
                label="Incident History"
                onClick={() =>
                  handleQuickPrompt("Show similar past incidents and patterns")
                }
              />
            </div>
          </div>

          <div className="border border-white/10 rounded-2xl bg-[#030a1c] p-5">
            <h3 className="text-sm font-bold text-white mb-2">
              Ezra response behaviour
            </h3>
            <div className="text-sm text-slate-400">
              Typical response 2–6s (includes Code Engine + telemetry fetch).
              Guardrails always apply before any fix.
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

const NavBadge = ({
  icon,
  label,
  route,
}: {
  icon: React.ReactNode;
  label: string;
  route: string;
}) => (
  <Link
    href={route || ""}
    className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-full bg-white/[0.03] text-xs hover:bg-white/[0.08] cursor-pointer transition-all"
  >
    {icon} <span className="text-slate-400">{label}</span>
  </Link>
);

const SessionCard = ({
  title,
  subtitle,
  active = false,
  onClick,
}: {
  title: string;
  subtitle: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-xl border transition-all cursor-pointer ${
      active
        ? "border-cyan-500/50 bg-cyan-500/5"
        : "border-white/5 bg-transparent hover:bg-white/[0.02]"
    }`}
  >
    <h4 className="text-xs font-bold text-white mb-1">{title}</h4>
    <p className="text-sm text-slate-500 tracking-tight">{subtitle}</p>
  </div>
);

const ContextRow = ({
  label,
  value,
  valueColor = "text-white",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <div className="flex justify-between items-center">
    <span className="text-xs text-slate-500">{label}</span>
    <span className={`text-xs font-bold ${valueColor}`}>{value}</span>
  </div>
);

interface MetricCard {
  label: string;
  value: string;
  subValue?: string;
  subValueColor?: string;
}

const MetricBox = ({
  label,
  value,
  subValue,
  subValueColor = "text-slate-500",
}: MetricCard) => (
  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
    <p className="text-sm text-slate-500 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-bold text-white">{value}</p>
    {subValue && (
      <p className={`text-[9px] leading-tight ${subValueColor}`}>{subValue}</p>
    )}
  </div>
);

const PromptButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 border border-white/5 rounded-lg text-sm font-bold text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
  >
    {icon} {label}
  </button>
);
