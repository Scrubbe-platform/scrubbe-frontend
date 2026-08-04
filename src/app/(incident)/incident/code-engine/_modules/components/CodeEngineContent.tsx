"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DiffEditor } from "@monaco-editor/react";
import { apiClient } from "@/lib/api/apiClient";
import { endpoint } from "@/lib/api/endpoint";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface CodeFix {
  filePath: string;
  language: string;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  fixType: string;
  confidence: number;
  prTitle: string;
  prDescription: string;
  prUrl: string | null;
  prNumber: number | null;
  prBranch: string | null;
  generatedAt: string;
}

interface AnalysisData {
  ticketId: string;
  incidentId: string;
  summary: string;
  severity: string;
  priority: string;
  status: string;
  environment: string | null;
  affectedSystem: string | null;
  serviceArea: string | null;
  category: string | null;
  techDescription: string | null;
  codeFix: CodeFix | null;
}

function confidenceColor(n: number): string {
  if (n >= 80) return "text-green-600 dark:text-emerald-300";
  if (n >= 60) return "text-yellow-500 dark:text-yellow-300";
  return "text-red-500 dark:text-red-400";
}

function confidenceBarColor(n: number): string {
  if (n >= 80) return "bg-green-500 dark:bg-emerald-400";
  if (n >= 60) return "bg-yellow-400";
  return "bg-red-500";
}

function severityBadgeDark(s: string): string {
  const upper = s.toUpperCase();
  if (upper === "CRITICAL" || upper === "P1") return "bg-red-900/60 text-red-400";
  if (upper === "HIGH" || upper === "P2") return "bg-orange-900/60 text-orange-400";
  if (upper === "MEDIUM" || upper === "P3") return "bg-yellow-900/60 text-yellow-300";
  return "bg-blue-900/60 text-blue-300";
}

function CodeEngineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const incidentParam = searchParams.get("id");
  const pathname = usePathname();

  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [generatingFix, setGeneratingFix] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);
  const [creatingPR, setCreatingPR] = useState(false);
  const [prError, setPrError] = useState<string | null>(null);
  const [repo, setRepo] = useState("");
  const [baseBranch, setBaseBranch] = useState("main");
  const [view, setView] = useState<"original" | "diff">("diff");
  const [sideBySide, setSideBySide] = useState(false);
  const [decision, setDecision] = useState<"accepted" | "rejected" | null>(
    null,
  );

  useEffect(() => {
    if (!incidentParam) {
      // Auto-select the first incident when navigated here without ?id=
      const fetchFirst = async () => {
        try {
          const res = await apiClient.get<{
            data: Array<{ id: string }> | { data?: Array<{ id: string }> };
          }>(endpoint.incident_ticket.get);
          const raw = res.data?.data;
          const list: Array<{ id: string }> = Array.isArray(raw)
            ? raw
            : Array.isArray((raw as { data?: Array<{ id: string }> })?.data)
              ? (raw as { data: Array<{ id: string }> }).data
              : [];
          if (list.length > 0) {
            router.replace(`/incident/code-engine?id=${list[0].id}`);
          } else {
            setFetchError(
              "No incidents found. Create an incident first to use Code Engine.",
            );
            setLoading(false);
          }
        } catch {
          setFetchError(
            "No incident ID provided. Navigate here from an incident (e.g. ?id=INC-1234).",
          );
          setLoading(false);
        }
      };
      void fetchFirst();
      return;
    }

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const res = await apiClient.get<{ data: AnalysisData }>(
          `${endpoint.code_engine.analysis}/${incidentParam}`,
        );
        setAnalysis(res.data.data);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to load incident data.";
        setFetchError(msg);
      } finally {
        setLoading(false);
      }
    };

    void fetchAnalysis();
  }, [incidentParam, router]);

  const handleGenerateFix = async () => {
    if (!analysis) return;
    setGeneratingFix(true);
    setFixError(null);
    try {
      const res = await apiClient.post<{ data: { codeFix: CodeFix } }>(
        `${endpoint.code_engine.generate_fix}/${analysis.incidentId}`,
      );
      const codeFix = res.data.data.codeFix;
      setAnalysis((prev) => (prev ? { ...prev, codeFix } : prev));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate fix.";
      setFixError(msg);
    } finally {
      setGeneratingFix(false);
    }
  };

  const handleCreatePR = async () => {
    if (!analysis || !repo.trim()) return;
    setCreatingPR(true);
    setPrError(null);
    try {
      const res = await apiClient.post<{
        data: { prUrl: string; prNumber: number; alreadyExists: boolean };
      }>(`${endpoint.code_engine.create_pr}/${analysis.incidentId}`, {
        repo: repo.trim(),
        baseBranch: baseBranch.trim() || "main",
      });
      const { prUrl, prNumber } = res.data.data;
      setAnalysis((prev) =>
        prev && prev.codeFix
          ? { ...prev, codeFix: { ...prev.codeFix, prUrl, prNumber } }
          : prev,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create PR.";
      setPrError(msg);
    } finally {
      setCreatingPR(false);
    }
  };

  const handleAccept = () => {
    setDecision("accepted");
    toast.success("Fix accepted");
  };

  const handleReject = () => {
    setDecision("rejected");
    toast.error("Fix rejected");
  };

  const fix = analysis?.codeFix ?? null;
  const filename = fix?.filePath ?? "";
  const language = fix?.language ?? "typescript";
  const originalCode = fix?.originalCode ?? "";
  const fixedCode = fix?.fixedCode ?? "";
  const confidence = fix?.confidence ?? 0;
  const originalContent = view === "diff" ? originalCode : originalCode;
  const modifiedContent = view === "diff" ? fixedCode : originalCode;

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-grayscrubbe-900 text-black dark:text-slate-200 font-ibm text-sm items-center justify-center gap-3">
        <span className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-neutral-500 text-xs">Loading incident data…</span>
      </div>
    );
  }

  if (fetchError || !analysis) {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-grayscrubbe-900 text-black dark:text-slate-200 font-ibm text-sm items-center justify-center gap-4 px-6">
        <span className="text-3xl">⚠</span>
        <p className="text-red-500 text-sm text-center max-w-md">
          {fetchError ?? "Incident not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-grayscrubbe-900 text-black dark:text-slate-200 font-ibm text-sm">
      {/* ── NO FIX YET: PRE-ANALYSIS STATE ── */}
      {!fix && (
        <div className="flex flex-col flex-1 items-center justify-center gap-6 px-6">
          <div className="max-w-lg w-full bg-white dark:bg-grayscrubbe-800 border border-gray-200 dark:border-neutral-700 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-xl"> </span>
              <span className="font-semibold text-base text-black dark:text-neutral-200">
                Scrubbe Code Engine
              </span>
            </div>

            <div className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              <p>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  Incident:
                </span>{" "}
                {analysis.ticketId}
              </p>
              {analysis.affectedSystem && (
                <p>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    System:
                  </span>{" "}
                  {analysis.affectedSystem}
                </p>
              )}
              {analysis.category && (
                <p>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Category:
                  </span>{" "}
                  {analysis.category}
                </p>
              )}
              {analysis.techDescription && (
                <p className="pt-1 leading-relaxed">
                  {analysis.techDescription.slice(0, 200)}
                  {analysis.techDescription.length > 200 ? "…" : ""}
                </p>
              )}
            </div>

            {fixError && (
              <p className="text-red-500 text-xs bg-red-50 dark:bg-red-950/30 rounded px-3 py-2">
                {fixError}
              </p>
            )}

            <button
              onClick={() => void handleGenerateFix()}
              disabled={generatingFix}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-green-500 hover:bg-green-400 disabled:opacity-60 text-black text-xs font-bold transition-colors"
            >
              {generatingFix ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Analyzing incident…
                </>
              ) : (
                <> Generate Code Fix</>
              )}
            </button>

            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center">
              Scrubbe will analyze the incident and propose a code fix you can
              review and push as a PR.
            </p>
          </div>
        </div>
      )}

      {/* ── FIX AVAILABLE: DARK CODE-REVIEW CONSOLE ── */}
      {fix && (
        <div className="flex-1 min-h-0 p-4 sm:p-6">
          <div
            className="flex h-full max-h-full flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800"
            style={{ background: "#0d1117" }}
          >
            {/* Nav bar */}
            <div
              className="flex shrink-0 items-center gap-3 border-b px-4 py-2.5"
              style={{ background: "#161b22", borderColor: "#30363d" }}
            >
              <span className="text-[12px] font-bold text-white">
                {analysis.ticketId}
              </span>
              {analysis.affectedSystem && (
                <span className="text-[11px] text-blue-400">
                  {analysis.affectedSystem}
                </span>
              )}
              {analysis.environment && (
                <span className="rounded bg-blue-900/60 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
                  {analysis.environment}
                </span>
              )}
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${severityBadgeDark(analysis.severity)}`}
              >
                {analysis.severity}
              </span>
            </div>

            {/* Tab bar */}
            <div
              className="flex shrink-0 items-center border-b"
              style={{ background: "#161b22", borderColor: "#30363d" }}
            >
              <button
                onClick={() => setView("original")}
                className="flex cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-2.5 text-[12px] font-semibold"
                style={{
                  color: view === "original" ? "#f87171" : "#6b7280",
                  borderBottom:
                    view === "original"
                      ? "2px solid #f87171"
                      : "2px solid transparent",
                }}
              >
                <span className="text-red-500">⊗</span>
                <span className="uppercase">Failed Code</span>
              </button>

              <button
                onClick={() => setView("diff")}
                className="flex cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-2.5 text-[12px] font-semibold"
                style={{
                  color: view === "diff" ? "#4ade80" : "#6b7280",
                  borderBottom:
                    view === "diff"
                      ? "2px solid #4ade80"
                      : "2px solid transparent",
                }}
              >
                <span className="uppercase">Ezra Fix</span>
                {fix.prUrl && (
                  <span className="rounded bg-green-900/40 px-1.5 py-0.5 text-[10px] font-bold text-green-400">
                    PR #{fix.prNumber}
                  </span>
                )}
              </button>

              <div className="ml-auto hidden items-center gap-2 pr-4 text-[11px] text-gray-500 md:flex">
                <Link
                  href={`${pathname}/analysis?id=${incidentParam}`}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:brightness-110"
                  style={{
                    background:
                      "linear-gradient(90deg, #1a2a1a 0%, #14532d 60%, #22c55e 100%)",
                  }}
                >
                  View Investigation Analysis
                  <ArrowRight size={13} />
                </Link>
                <span>·</span>
                <span className={confidenceColor(confidence)}>
                  conf: {confidence}%
                </span>
              </div>
            </div>

            {/* Status bar */}
            <div
              className="shrink-0 px-4 py-2 text-[11px]"
              style={
                view === "original"
                  ? { background: "#1c0a0a", borderLeft: "3px solid #ef4444" }
                  : { background: "#052e16", borderLeft: "3px solid #22c55e" }
              }
            >
              {view === "original" ? (
                <>
                  <p className="mb-1 font-bold text-red-400">
                    ROOT CAUSE · {analysis.category ?? analysis.status}
                  </p>
                  <p className="text-red-300/70">{analysis.summary}</p>
                </>
              ) : (
                <>
                  <p className="mb-1 font-bold text-green-400">
                    ✓ FIX GENERATED · {fix.fixType}
                  </p>
                  <p className="text-green-300/70">{fix.explanation}</p>
                </>
              )}
            </div>

            {/* File subbar (diff only) */}
            {view === "diff" && (
              <div
                className="hidden shrink-0 items-center justify-between border-b px-4 py-1.5 md:flex"
                style={{ background: "#161b22", borderColor: "#30363d" }}
              >
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="text-yellow-400"> </span>
                  <span>{filename} → Scrubbe fix</span>
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={sideBySide}
                    onChange={(e) => setSideBySide(e.target.checked)}
                    className="accent-green-500"
                  />
                  Side by side
                </label>
              </div>
            )}

            {/* Editor + Sidebar */}
            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_260px]">
              <div className="min-h-0">
                <DiffEditor
                  height="100%"
                  language={language}
                  original={originalContent}
                  modified={modifiedContent}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    renderSideBySide: view === "diff" ? sideBySide : false,
                    minimap: { enabled: false },
                    fontSize: 13,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>

              {/* Sidebar */}
              <div
                className="flex flex-col overflow-y-auto text-[12px]"
                style={{
                  background: "#161b22",
                  borderLeft: "1px solid #30363d",
                }}
              >
                {view === "original" ? (
                  <div className="p-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Root Cause Analysis
                    </p>
                    {analysis.techDescription && (
                      <p className="mb-4 text-[11px] leading-relaxed text-gray-400">
                        {analysis.techDescription}
                      </p>
                    )}
                    <div className="my-3 border-t border-[#30363d]" />
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Incident
                    </p>
                    {(
                      [
                        ["ID", analysis.ticketId, "#58a6ff"],
                        ["Service", analysis.affectedSystem ?? "—", "#d1d5db"],
                        ["Environment", analysis.environment ?? "—", "#d1d5db"],
                        ["Severity", analysis.severity, "#d1d5db"],
                        ["Status", analysis.status, "#d1d5db"],
                      ] as const
                    ).map(([k, v, c]) => (
                      <div key={k} className="mb-1.5 flex justify-between">
                        <span className="text-[11px] text-gray-500">{k}</span>
                        <span className="text-[11px]" style={{ color: c }}>
                          {v}
                        </span>
                      </div>
                    ))}
                    {(analysis.category || analysis.serviceArea) && (
                      <>
                        <div className="my-3 border-t border-[#30363d]" />
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          Classification
                        </p>
                        {analysis.category && (
                          <div className="mb-1.5 flex justify-between">
                            <span className="text-[11px] text-gray-500">
                              Category
                            </span>
                            <span className="text-[11px] text-gray-300">
                              {analysis.category}
                            </span>
                          </div>
                        )}
                        {analysis.serviceArea && (
                          <div className="mb-1.5 flex justify-between">
                            <span className="text-[11px] text-gray-500">
                              Service area
                            </span>
                            <span className="text-[11px] text-gray-300">
                              {analysis.serviceArea}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => setView("diff")}
                      className="mt-4 w-full cursor-pointer rounded border-none py-2.5 text-[12px] font-bold text-black hover:brightness-110"
                      style={{ background: "#f59e0b" }}
                    >
                      View Ezra&apos;s fix →
                    </button>
                    <p className="mt-2 text-center text-[10px] text-gray-600">
                      Root cause logged to audit trail
                    </p>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Confidence Score
                    </p>
                    <p
                      className={`mb-1 text-[32px] font-black leading-none ${confidenceColor(confidence)}`}
                    >
                      {confidence}%
                    </p>
                    <div className="mb-1 h-1 rounded bg-gray-700">
                      <div
                        className={`h-full rounded transition-all ${confidenceBarColor(confidence)}`}
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                    <p className="mb-3 text-[11px] text-gray-500">
                      {confidence >= 80
                        ? "High · auto-PR eligible"
                        : confidence >= 60
                          ? "Medium · review recommended"
                          : "Low · manual review"}
                    </p>
                    <div className="my-3 border-t border-[#30363d]" />
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Fix details
                    </p>
                    <div className="mb-1.5 flex justify-between">
                      <span className="text-[11px] text-gray-500">Type</span>
                      <span className="text-[11px] text-gray-300">
                        {fix.fixType}
                      </span>
                    </div>
                    <div className="mb-1.5 flex justify-between">
                      <span className="text-[11px] text-gray-500">File</span>
                      <span className="max-w-[130px] truncate text-right text-[11px] text-gray-300">
                        {filename}
                      </span>
                    </div>
                    {fix.generatedAt && (
                      <div className="mb-1.5 flex justify-between">
                        <span className="text-[11px] text-gray-500">
                          Generated
                        </span>
                        <span className="text-[11px] text-gray-300">
                          {new Date(fix.generatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    <div className="my-3 border-t border-[#30363d]" />
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Pull Request
                    </p>
                    {fix.prUrl ? (
                      <>
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="text-[18px] font-black text-white">
                            #{fix.prNumber}
                          </span>
                          <span className="rounded border border-green-800 bg-green-900/40 px-1.5 py-0.5 text-[10px] font-bold text-green-400">
                            open
                          </span>
                        </div>
                        {fix.prTitle && (
                          <p className="mb-3 text-[11px] text-gray-300">
                            {fix.prTitle}
                          </p>
                        )}
                        <a
                          href={fix.prUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full cursor-pointer rounded border-none bg-green-500 py-2.5 text-center text-[12px] font-bold text-black hover:brightness-110"
                        >
                          ↗ View PR
                        </a>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={repo}
                          onChange={(e) => setRepo(e.target.value)}
                          placeholder="owner/repo"
                          className="rounded border border-neutral-700 bg-[#0d1117] px-2 py-1.5 text-[11px] text-gray-200 placeholder:text-gray-600 focus:border-green-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={baseBranch}
                          onChange={(e) => setBaseBranch(e.target.value)}
                          placeholder="main"
                          className="rounded border border-neutral-700 bg-[#0d1117] px-2 py-1.5 text-[11px] text-gray-200 placeholder:text-gray-600 focus:border-green-500 focus:outline-none"
                        />
                        <button
                          onClick={() => void handleCreatePR()}
                          disabled={creatingPR || !repo.trim()}
                          className="flex w-full items-center justify-center gap-1.5 rounded border-none bg-green-500 py-2.5 text-[12px] font-bold text-black transition-colors hover:bg-green-400 disabled:opacity-50"
                        >
                          {creatingPR ? (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />
                          ) : (
                            "↑ Create PR"
                          )}
                        </button>
                        {prError && (
                          <p className="text-[11px] text-red-400">{prError}</p>
                        )}
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <button
                            onClick={handleAccept}
                            disabled={decision !== null}
                            className="flex items-center justify-center gap-1.5 rounded border-none bg-green-500 py-2 text-[11.5px] font-bold text-black transition-colors hover:bg-green-400 disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            onClick={handleReject}
                            disabled={decision !== null}
                            className="flex items-center justify-center gap-1.5 rounded border-none bg-red-500 py-2 text-[11.5px] font-bold text-white transition-colors hover:bg-red-400 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                        {decision && (
                          <p
                            className={`text-center text-[11px] font-semibold ${
                              decision === "accepted"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {decision === "accepted"
                              ? "✓ Fix accepted"
                              : "✕ Fix rejected"}
                          </p>
                        )}
                      </div>
                    )}
                    <p className="mt-3 text-center text-[10px] text-gray-600">
                      Every action linked to audit trail
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status footer */}
            <div
              className="flex shrink-0 items-center justify-between border-t px-4 py-1.5 text-[11px] text-gray-500"
              style={{ borderColor: "#30363d" }}
            >
              <div className="flex items-center gap-4">
                <span className="text-yellow-500"> Scrubbe Code Engine</span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                  FIX GENERATED
                </span>
              </div>
              <div className="hidden items-center gap-4 md:flex">
                <span>{filename}</span>
                <span className="capitalize">{language}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CodeEnginePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-white dark:bg-grayscrubbe-900">
          <span className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CodeEngineContent />
    </Suspense>
  );
}
