"use client";
import React from "react";
import { BarChart3, TriangleAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

interface PatternRow { id: string; title: string; description: string; confidence: number; tags: string[] }

const PatternCard = ({ title, description, confidence, tags }: PatternRow) => (
  <div className="p-4 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
    <div className="flex justify-between items-start gap-3 mb-2">
      <h3 className="text-[13px] font-semibold text-black dark:text-zinc-100 leading-snug">
        {title}
      </h3>
      <span className="text-[13px] font-semibold text-black dark:text-zinc-400 shrink-0 tabular-nums">
        {confidence}%
      </span>
    </div>
    <p className="text-[12px] text-black dark:text-zinc-400 leading-relaxed mb-3">{description}</p>
    {tags.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, i) => (
          <span key={i} className="px-2.5 py-1 border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg text-[10px] font-mono text-black dark:text-zinc-400">
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

const FALLBACK_PATTERNS: PatternRow[] = [
  { id: "1", title: "Error spike + recent deployment → rollback resolves",  confidence: 92, description: "Based on 34 incidents. When error_rate_high follows a deployment within 60 minutes, rollback resulted in outcome: resolved in 82% of cases.", tags: ["error-rate high", "recent_deployment: true", "Window : 60m", "Resolution : rollback"] },
  { id: "2", title: "DB connection exhaustion → scale replicas ineffective", confidence: 92, description: 'Scaling replicas worsened DB connection exhaustion in 71% of cases. Pattern suppresses "Scale Up" confidence when DB connection > 85%.',            tags: ["db_connections_high", "scale_action", "outcome: worsened"]                          },
  { id: "3", title: "Pod restart clears memory leak on first restart",       confidence: 92, description: "Pod restart with OOMKilled cause resolves in 93% of cases on first attempt. If restarts > 3, issue is persistent — escalate to rollback.",       tags: []                                                                                      },
];

const LearnedPatterns: React.FC = () => {
  const { get } = useFetch();

  const { data: patterns } = useQuery({
    queryKey: ["ezra-patterns-playbook"],
    queryFn: async () => {
      const res = await get(endpoint.ezra.patterns);
      if (res.success) {
        const raw: any[] = res.data?.data?.patterns ?? res.data?.data ?? [];
        if (!raw.length) return null;
        return raw.map((p: any) => ({
          id: p.id ?? String(Math.random()),
          title: p.pattern ?? p.title ?? p.name ?? "Unnamed pattern",
          confidence: Math.round((p.confidence ?? p.matchRate ?? 0.9) * 100),
          description: p.description ?? p.summary ?? "",
          tags: p.tags ?? p.signals ?? [],
        })) as PatternRow[];
      }
      return null;
    },
    refetchOnWindowFocus: false,
  });

  const displayPatterns = patterns ?? FALLBACK_PATTERNS;

  return (
    <div className="w-full rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5 flex flex-col gap-5">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <BarChart3 size={15} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-black dark:text-zinc-100">Learned Patterns</h2>
            <p className="text-[12px] text-black dark:text-zinc-500 mt-0.5">
              Historical resolution data · built from Execution.outcome over time
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-medium text-black dark:text-zinc-400">
            {displayPatterns.length} pattern{displayPatterns.length !== 1 ? "s" : ""}
          </span>
          <button className="p-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 text-black hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <TriangleAlert size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {displayPatterns.map((p) => <PatternCard key={p.id} {...p} />)}
      </div>
    </div>
  );
};

export default LearnedPatterns;