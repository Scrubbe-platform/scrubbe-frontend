"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DiffEditor } from "@monaco-editor/react";
import { apiClient } from "@/lib/api/apiClient";
import { endpoint } from "@/lib/api/endpoint";

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

function severityBadgeStyle(s: string): string {
  const upper = s.toUpperCase();
  if (upper === "CRITICAL" || upper === "P1") return "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800";
  if (upper === "HIGH" || upper === "P2") return "bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-800";
  if (upper === "MEDIUM" || upper === "P3") return "bg-yellow-50 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800";
  return "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800";
}

function CodeEngineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const incidentParam = searchParams.get("id");

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

  useEffect(() => {
    if (!incidentParam) {
      // Auto-select the first incident when navigated here without ?id=
      const fetchFirst = async () => {
        try {
          const res = await apiClient.get<{ data: Array<{ id: string }> | { data?: Array<{ id: string }> } }>(
            endpoint.incident_ticket.get,
          );
          const raw = res.data?.data;
          const list: Array<{ id: string }> = Array.isArray(raw)
            ? raw
            : Array.isArray((raw as { data?: Array<{ id: string }> })?.data)
            ? (raw as { data: Array<{ id: string }> }).data
            : [];
          if (list.length > 0) {
            router.replace(`/incident/code-engine?id=${list[0].id}`);
          } else {
            setFetchError("No incidents found. Create an incident first to use Code Engine.");
            setLoading(false);
          }
        } catch {
          setFetchError("No incident ID provided. Navigate here from an incident (e.g. ?id=INC-1234).");
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
        const msg = err instanceof Error ? err.message : "Failed to load incident data.";
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
      const msg = err instanceof Error ? err.message : "Failed to generate fix.";
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
      const res = await apiClient.post<{ data: { prUrl: string; prNumber: number; alreadyExists: boolean } }>(
        `${endpoint.code_engine.create_pr}/${analysis.incidentId}`,
        { repo: repo.trim(), baseBranch: baseBranch.trim() || "main" },
      );
      const { prUrl, prNumber } = res.data.data;
      setAnalysis((prev) =>
        prev && prev.codeFix ? { ...prev, codeFix: { ...prev.codeFix, prUrl, prNumber } } : prev,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create PR.";
      setPrError(msg);
    } finally {
      setCreatingPR(false);
    }
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
      <div className="flex flex-col h-screen bg-white dark:bg-grayscrubbe-900 text-black dark:text-slate-200 font-sans text-sm items-center justify-center gap-3">
        <span className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-neutral-500 text-xs">Loading incident data…</span>
      </div>
    );
  }

  if (fetchError || !analysis) {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-grayscrubbe-900 text-black dark:text-slate-200 font-sans text-sm items-center justify-center gap-4 px-6">
        <span className="text-3xl">⚠</span>
        <p className="text-red-500 text-sm text-center max-w-md">
          {fetchError ?? "Incident not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-grayscrubbe-900 text-black dark:text-slate-200 font-sans text-sm">
      {/* ── TOP NAV ── */}
      <header className="flex items-center justify-between px-4 h-10 bg-white dark:bg-grayscrubbe-900 border-b border-gray-200 dark:border-neutral-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-700 text-red-600 bg-red-50 dark:bg-red-950/40 text-[11px] font-bold tracking-wider">
            INCIDENT
          </span>
          <span className="text-black dark:text-neutral-200 font-semibold">{analysis.ticketId}</span>
          {analysis.affectedSystem && (
            <span className="text-blue-600 dark:text-blue-300 text-xs md:block hidden">
              {analysis.affectedSystem}
            </span>
          )}
          {analysis.environment && (
            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 text-[11px] font-semibold md:block hidden">
              {analysis.environment}
            </span>
          )}
          {analysis.severity && (
            <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${severityBadgeStyle(analysis.severity)}`}>
              {analysis.severity}
            </span>
          )}
        </div>
        <div className="items-center gap-4 md:flex hidden">
          <span className="text-neutral-500 text-xs truncate max-w-xs">{analysis.summary}</span>
          <span className="flex items-center gap-1.5 text-yellow-500 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
            {analysis.status}
          </span>
        </div>
      </header>

      {/* ── NO FIX YET: PRE-ANALYSIS STATE ── */}
      {!fix && (
        <div className="flex flex-col flex-1 items-center justify-center gap-6 px-6">
          <div className="max-w-lg w-full bg-white dark:bg-grayscrubbe-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-xl">⚡</span>
              <span className="font-semibold text-base text-black dark:text-neutral-200">Scrubbe Code Engine</span>
            </div>

            <div className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              <p><span className="font-medium text-neutral-700 dark:text-neutral-300">Incident:</span> {analysis.ticketId}</p>
              {analysis.affectedSystem && (
                <p><span className="font-medium text-neutral-700 dark:text-neutral-300">System:</span> {analysis.affectedSystem}</p>
              )}
              {analysis.category && (
                <p><span className="font-medium text-neutral-700 dark:text-neutral-300">Category:</span> {analysis.category}</p>
              )}
              {analysis.techDescription && (
                <p className="pt-1 leading-relaxed">{analysis.techDescription.slice(0, 200)}{analysis.techDescription.length > 200 ? "…" : ""}</p>
              )}
            </div>

            {fixError && (
              <p className="text-red-500 text-xs bg-red-50 dark:bg-red-950/30 rounded px-3 py-2">{fixError}</p>
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
                <>⚡ Generate Code Fix</>
              )}
            </button>

            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center">
              Scrubbe will analyze the incident and propose a code fix you can review and push as a PR.
            </p>
          </div>
        </div>
      )}

      {/* ── FIX AVAILABLE: TABS + EDITOR + FOOTER ── */}
      {fix && (
        <>
          {/* Tabs */}
          <div className="flex items-stretch bg-white dark:bg-grayscrubbe-800 border-b border-gray-200 dark:border-neutral-800 shrink-0 pl-2">
            {(["original", "diff"] as const).map((t) => {
              const active = view === t;
              const label = t === "original" ? "FAILED CODE" : "EZRA FIX";
              return (
                <button
                  key={t}
                  onClick={() => setView(t)}
                  className={`flex items-center gap-2 px-4 h-[38px] text-xs font-semibold tracking-wide border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0
                    ${active
                      ? "border-green-500 text-black dark:text-neutral-200"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    }`}
                >
                  {t === "original" && <span className="text-red-600">○</span>}
                  {t === "diff" && <span className="text-yellow-400">⚡</span>}
                  <span className="uppercase">{label}</span>
                </button>
              );
            })}
            <div className="ml-auto items-center gap-2 pr-4 text-[11px] text-gray-600 dark:text-neutral-400 md:flex hidden">
              <span>{filename}</span>
              <span>·</span>
              <span>{analysis.ticketId}</span>
              <span>·</span>
              <span className={confidenceColor(confidence)}>conf: {confidence}%</span>
            </div>
          </div>

          {/* File subbar */}
          {view === "diff" && (
            <div className="md:flex hidden items-center justify-between px-4 py-1.5 bg-white dark:bg-grayscrubbe-800 border-b border-gray-200 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="text-yellow-400">⚡</span>
                <span>{filename} → Scrubbe fix</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded border border-green-900 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-emerald-300 text-[11px] font-bold`}>
                  {fix.fixType}
                </span>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-neutral-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sideBySide}
                    onChange={(e) => setSideBySide(e.target.checked)}
                    className="accent-green-500"
                  />
                  Side by side
                </label>
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
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

          {/* Footer */}
          <div className="shrink-0 bg-white dark:bg-grayscrubbe-800 border-t border-gray-200 dark:border-neutral-800">
            {/* Confidence + explanation row */}
            <div className="flex items-stretch divide-x divide-gray-200 dark:divide-neutral-800">
              {/* Confidence */}
              <div className="flex items-center gap-3 px-5 py-3 shrink-0">
                <span className={`text-2xl font-bold ${confidenceColor(confidence)}`}>
                  {confidence}%
                </span>
                <div>
                  <div className="w-24 h-1 bg-gray-200 dark:bg-neutral-800 rounded-full mb-1">
                    <div
                      className={`h-full rounded-full transition-all ${confidenceBarColor(confidence)}`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-neutral-500">
                    {confidence >= 80 ? "High · eligible" : confidence >= 60 ? "Medium · review" : "Low · manual review"}
                  </p>
                </div>
              </div>

              {/* Explanation */}
              <div className="flex items-center px-5 py-3 flex-1 min-w-0">
                <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-2">{fix.explanation}</p>
              </div>

              {/* PR section */}
              <div className="flex items-center gap-2 px-5 py-3 shrink-0">
                {fix.prUrl ? (
                  <a
                    href={fix.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-green-500 hover:bg-green-400 text-black text-xs font-bold transition-colors"
                  >
                    ↗ View PR #{fix.prNumber}
                  </a>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={repo}
                        onChange={(e) => setRepo(e.target.value)}
                        placeholder="owner/repo"
                        className="px-2 py-1 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-xs text-black dark:text-neutral-200 w-36 focus:outline-none focus:border-green-500"
                      />
                      <input
                        type="text"
                        value={baseBranch}
                        onChange={(e) => setBaseBranch(e.target.value)}
                        placeholder="main"
                        className="px-2 py-1 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-xs text-black dark:text-neutral-200 w-20 focus:outline-none focus:border-green-500"
                      />
                      <button
                        onClick={() => void handleCreatePR()}
                        disabled={creatingPR || !repo.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black text-xs font-bold transition-colors"
                      >
                        {creatingPR ? (
                          <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "↑ Create PR"
                        )}
                      </button>
                    </div>
                    {prError && (
                      <p className="text-red-500 text-[11px] max-w-xs">{prError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-5 py-1.5 border-t border-gray-200 dark:border-neutral-800 text-[11px] text-gray-600 dark:text-neutral-400">
              <div className="flex items-center gap-4">
                <span className="text-yellow-500">⚡ Scrubbe Code Engine</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-emerald-400 inline-block" />
                  FIX GENERATED
                </span>
                <span className="md:block hidden">⊙ Governed · Audited · Safe</span>
              </div>
              <div className="flex items-center gap-4 md:flex hidden">
                <span>{filename}</span>
                <span className="capitalize">{language}</span>
                {fix.generatedAt && (
                  <span>{new Date(fix.generatedAt).toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          </div>
        </>
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
