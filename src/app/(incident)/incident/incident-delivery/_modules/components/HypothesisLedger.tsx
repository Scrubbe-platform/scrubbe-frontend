"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { HYPOTHESES } from "./incidentDelivery.data";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

const tierBar = (confidence: number) =>
  confidence >= 90
    ? "bg-emerald-500"
    : confidence >= 70
      ? "bg-blue-500"
      : "bg-amber-500";

const RefPills = ({
  runUrl,
  diffUrl,
}: {
  runUrl?: string;
  diffUrl?: string;
}) => (
  <div className="flex gap-2 shrink-0">
    <a
      href={runUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[12.5px] font-mono font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
    >
      runUrl
    </a>
    <a
      href={diffUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[12.5px] font-mono font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
    >
      diffUrl
    </a>
  </div>
);

const HypothesisLedger: React.FC<{ incidentId?: string }> = ({
  incidentId,
}) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [hypotheses, setHypotheses] = useState(HYPOTHESES);

  useEffect(() => {
    if (!incidentId) return;
    customAxios
      .get(`${endpoint.investigation_analysis.get}/${incidentId}`)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        const rootCauses: any[] = data?.rootCauses ?? data?.hypotheses ?? [];
        if (rootCauses.length > 0) {
          setHypotheses(
            rootCauses.map((rc: any, i: number) => ({
              id: rc.id ?? String(i),
              title: rc.cause ?? rc.title ?? rc.hypothesis ?? "Unknown cause",
              why: rc.description ?? rc.why ?? "",
              confidence: rc.confidence ?? rc.confidenceScore ?? 75,
              risk: rc.risk ?? "",
              ref: rc.ref ?? "",
              evidence: Array.isArray(rc.evidence) ? rc.evidence : [],
              top: i === 0,
              runUrl: rc.runUrl ?? undefined,
              diffUrl: rc.diffUrl ?? undefined,
            })),
          );
        }
      })
      .catch(() => {});
  }, [incidentId]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 font-mono">
            Root-cause Hypothesis Panel
          </p>
          <p className="text-lg font-bold text-black dark:text-zinc-100">
            Ranked by confidence
          </p>
          <p className="text-[13.5px] text-black/50 dark:text-zinc-500">
            Highest-confidence hypothesis leads. Each carries its evidence and a
            recommended action.
          </p>
        </div>
        <button
          onClick={() => setExpanded((x) => !x)}
          className="text-[12px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 hover:text-black dark:hover:text-zinc-200 transition-colors shrink-0"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {hypotheses.map((hyp, i) => {
          const showEvidence = expanded || hyp.top;
          const num = String(i + 1).padStart(2, "0");

          if (hyp.top) {
            return (
              <div
                key={hyp.id}
                className="rounded-2xl border-2 border-emerald-500 bg-white dark:bg-zinc-900/40 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[13px] font-mono text-black/30 dark:text-zinc-600">
                      {num}
                    </span>
                    <p className="text-lg font-bold text-black dark:text-zinc-100 leading-tight">
                      {hyp.title}
                    </p>
                  </div>
                  <RefPills runUrl={hyp.runUrl} diffUrl={hyp.diffUrl} />
                </div>

                {hyp.why && (
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500">
                      Why:
                    </span>
                    <span className="text-base text-black dark:text-zinc-200 mt-1">
                      {hyp.why}
                    </span>
                  </div>
                )}

                {showEvidence && hyp.evidence.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 mb-2">
                      Evidence:
                    </p>
                    <div className="space-y-1.5">
                      {hyp.evidence.map((e, ei) => (
                        <div key={ei} className="flex items-center gap-2">
                          <Check
                            size={15}
                            className="text-emerald-500 shrink-0"
                          />
                          <span className="text-base text-black dark:text-zinc-200">
                            {e}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-10 mt-5 flex-wrap">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 mb-1">
                      Confidence
                    </p>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-bold text-black dark:text-zinc-100">
                        {hyp.confidence}%
                      </span>
                      <div className="h-1.5 w-32 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${tierBar(hyp.confidence)}`}
                          style={{ width: `${hyp.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {hyp.risk && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500 mb-1">
                        Risk
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-black dark:text-zinc-100">
                          {hyp.risk}
                        </span>
                        <span className="text-[12px] font-mono text-black/40 dark:text-zinc-500">
                          {hyp.ref}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 mt-5">
                  <button
                    onClick={() =>
                      toast.success("Rollback started (simulated)", {
                        description: "Reverting to last-known-good release",
                      })
                    }
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-[13.5px] font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Apply remediation
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/incident/evidence-explorer?id=${incidentId}`,
                      )
                    }
                    className="px-5 py-2.5 rounded-lg border border-[#DDDDDD] dark:border-zinc-700 text-[13.5px] font-bold text-black dark:text-zinc-300 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors"
                  >
                    Investigate in Explorer
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={hyp.id}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-[12px] font-mono text-black/30 dark:text-zinc-600">
                    {num}
                  </span>
                  <p className="text-[16px] font-bold text-black dark:text-zinc-100 leading-tight">
                    {hyp.title}
                  </p>
                </div>
                <RefPills runUrl={hyp.runUrl} diffUrl={hyp.diffUrl} />
              </div>

              {hyp.why && (
                <p className="text-[13.5px] text-black dark:text-zinc-300 mt-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500">
                    Why:{" "}
                  </span>
                  <span className="font-semibold">{hyp.why}</span>
                </p>
              )}

              {showEvidence && hyp.evidence.length > 0 && (
                <div className="mt-3">
                  <div className="space-y-1.5">
                    {hyp.evidence.map((e, ei) => (
                      <div key={ei} className="flex items-center gap-2">
                        <Check
                          size={13}
                          className="text-emerald-500 shrink-0"
                        />
                        <span className="text-[13px] text-black dark:text-zinc-300">
                          {e}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6 mt-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500">
                    Confidence
                  </span>
                  <span className="text-[14px] font-bold text-black dark:text-zinc-100">
                    {hyp.confidence}%
                  </span>
                  <div className="h-1.5 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${tierBar(hyp.confidence)}`}
                      style={{ width: `${hyp.confidence}%` }}
                    />
                  </div>
                </div>
                {hyp.risk && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-black/40 dark:text-zinc-500">
                      Risk
                    </span>
                    <span className="text-[14px] font-bold text-black dark:text-zinc-100">
                      {hyp.risk}
                    </span>
                    <span className="text-[11px] font-mono text-black/40 dark:text-zinc-500">
                      {hyp.ref}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HypothesisLedger;
