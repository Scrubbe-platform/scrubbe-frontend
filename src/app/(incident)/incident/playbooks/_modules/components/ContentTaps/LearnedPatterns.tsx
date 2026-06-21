"use client";
import React from "react";
import { BarChart3, TriangleAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

interface PatternRow {
  id: string;
  title: string;
  description: string;
  confidence: number;
  tags: string[];
}

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
    <p className="text-[12px] text-black dark:text-zinc-400 leading-relaxed mb-3">
      {description}
    </p>
    {tags.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="px-2.5 py-1 border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg text-[10px] font-mono text-black dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

const LearnedPatterns: React.FC = () => {
  const { get } = useFetch();

  const { data: patterns, isLoading } = useQuery({
    queryKey: ["ezra-patterns-playbook"],
    queryFn: async () => {
      const res = await get(endpoint.ezra.patterns);
      if (res.success) {
        const raw: any[] = res.data?.data?.patterns ?? res.data?.data ?? [];
        return raw.map((p: any) => ({
          id: p.id ?? String(Math.random()),
          title: p.pattern ?? p.title ?? p.name ?? "Unnamed pattern",
          confidence: Math.round((p.confidence ?? p.matchRate ?? 0.9) * 100),
          description: p.description ?? p.summary ?? "",
          tags: p.tags ?? p.signals ?? [],
        })) as PatternRow[];
      }
      return [];
    },
    refetchOnWindowFocus: false,
  });

  const displayPatterns = patterns ?? [];

  return (
    <div className="w-full rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5 flex flex-col gap-5">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
            <BarChart3 size={15} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-black dark:text-zinc-100">
              Learned Patterns
            </h2>
            <p className="text-[12px] text-black dark:text-zinc-500 mt-0.5">
              Historical resolution data · built from Execution.outcome over
              time
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-medium text-black dark:text-zinc-400">
            {displayPatterns.length} pattern
            {displayPatterns.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {isLoading ? (
          <p className="text-[12px] text-black dark:text-zinc-500">Loading learned patterns…</p>
        ) : displayPatterns.length === 0 ? (
          <p className="text-[12px] text-black dark:text-zinc-500">
            No learned patterns yet — patterns build up as playbook executions complete.
          </p>
        ) : (
          displayPatterns.map((p) => <PatternCard key={p.id} {...p} />)
        )}
      </div>
    </div>
  );
};

export default LearnedPatterns;
