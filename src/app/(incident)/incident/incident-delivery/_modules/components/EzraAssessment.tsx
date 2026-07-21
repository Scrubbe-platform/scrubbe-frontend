"use client";
import React, { useRef, useState } from "react";
import { Sparkles, Send } from "lucide-react";
import {
  ANSWERS,
  EZRA,
  SUGGESTED_QUESTIONS,
  classifyQuestion,
} from "./incidentDelivery.data";

interface ChatTurn {
  role: "user" | "ezra";
  content: string;
}

const EzraAssessment = () => {
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState<ChatTurn[]>([]);
  const [thinking, setThinking] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const ask = (override?: string) => {
    const q = (override ?? question).trim();
    if (!q || thinking) return;
    setThread((t) => [...t, { role: "user", content: q }]);
    setQuestion("");
    setThinking(true);
    requestAnimationFrame(() =>
      threadEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    );
    setTimeout(() => {
      const key = classifyQuestion(q);
      setThread((t) => [
        ...t,
        { role: "ezra", content: ANSWERS[key] ?? ANSWERS._fallback },
      ]);
      setThinking(false);
      requestAnimationFrame(() =>
        threadEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      );
    }, 550);
  };

  return (
    <div className="rounded-xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-black dark:text-white">
            Ezra
          </p>
          <p className="text-[11px] text-black dark:text-zinc-500">
            {EZRA.sub}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Confidence gauge */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
              Delivery assessment
            </span>
            <span className="text-[19px] font-mono font-semibold text-black dark:text-white">
              {EZRA.pct}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
              style={{ width: `${EZRA.pct}%` }}
            />
          </div>
        </div>

        <p className="text-[12.5px] text-black dark:text-zinc-300 leading-relaxed">
          {EZRA.finding}
        </p>

        {/* Thread */}
        {thread.length > 0 && (
          <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            {thread.map((m, i) => (
              <div
                key={i}
                className={`text-[12px] leading-relaxed rounded-lg px-3 py-2 ${
                  m.role === "user"
                    ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-200 ml-6"
                    : "bg-indigo-50 dark:bg-indigo-500/10 text-black dark:text-zinc-200 mr-6"
                }`}
              >
                {m.content}
              </div>
            ))}
            {thinking && (
              <div className="mr-6 text-[12px] text-black dark:text-zinc-500">
                Ezra is thinking…
              </div>
            )}
            <div ref={threadEndRef} />
          </div>
        )}

        {/* Suggested questions */}
        {thread.length === 0 && (
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map(({ q, key }) => (
              <button
                key={q}
                type="button"
                onClick={() => ask(q)}
                className="text-[11.5px] text-left rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 px-2.5 py-1.5 text-black dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Ask box */}
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask();
            }}
            placeholder="Ask Ezra about this incident…"
            className="flex-1 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 px-3 py-2 text-[12.5px] outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={() => ask()}
            disabled={!question.trim() || thinking}
            className="px-3 rounded-lg bg-black dark:bg-white text-white dark:text-black disabled:opacity-40 flex items-center justify-center"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EzraAssessment;
