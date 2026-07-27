"use client";
import React, { useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import {
  ANSWERS,
  EZRA,
  SUGGESTED_QUESTIONS,
  classifyQuestion,
} from "./incidentDelivery.data";
import { useSharedAI } from "@/hooks/useSharedAI";

interface ChatTurn {
  role: "user" | "ezra";
  content: string;
}

const EzraAssessment = ({ ticketId }: { ticketId?: string | null }) => {
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState<ChatTurn[]>([]);
  const [thinking, setThinking] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const { triggerAI, getResult, whoIsThinking } = useSharedAI(ticketId);
  const teamThinking = whoIsThinking();
  const suggestionResult = getResult("ai_suggestion");

  const ask = (override?: string) => {
    const q = (override ?? question).trim();
    if (!q || thinking) return;
    setThread((t) => [...t, { role: "user", content: q }]);
    setQuestion("");
    setThinking(true);
    requestAnimationFrame(() =>
      threadEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    );
    if (ticketId) {
      triggerAI("ai_suggestion");
      const poll = () => {
        const res = getResult("ai_suggestion");
        if (res) {
          const text =
            typeof res.result === "string"
              ? res.result
              : ((res.result as any)?.suggestion ??
                (res.result as any)?.content ??
                JSON.stringify(res.result, null, 2));
          setThread((t) => [
            ...t,
            {
              role: "ezra",
              content:
                text ?? ANSWERS[classifyQuestion(q)] ?? ANSWERS._fallback,
            },
          ]);
          setThinking(false);
          requestAnimationFrame(() =>
            threadEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          );
          return;
        }
        requestAnimationFrame(poll);
      };
      setTimeout(poll, 800);
    } else {
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
    }
  };

  return (
    <div className="rounded-2xl border border-[#DDDDDD] bg-white dark:bg-zinc-900/40 px-6 py-4 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-black dark:text-white">Ezra</h2>
        {teamThinking && !thinking ? (
          <p className="text-sm text-emerald-600 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {teamThinking.triggeredBy.name} is querying…
          </p>
        ) : (
          <p className="text-[13.5px] text-black/50 dark:text-zinc-500 mt-0.5">
            {EZRA.sub}
          </p>
        )}
      </div>

      {/* Confidence gauge */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[15px] font-bold text-black dark:text-white">
            Delivery assessment
          </span>
          <span className="text-[17px] font-bold text-black dark:text-white">
            {EZRA.pct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${EZRA.pct}%` }}
          />
        </div>
      </div>

      {/* Live AI suggestion result (replaces mock text when available) */}
      {suggestionResult ? (
        <p className="text-[13.5px] text-emerald-700 dark:text-emerald-400 leading-relaxed bg-emerald-50 dark:bg-emerald-500/10 rounded-lg px-3 py-2">
          {typeof suggestionResult.result === "string"
            ? suggestionResult.result
            : ((suggestionResult.result as any)?.suggestion ??
              (suggestionResult.result as any)?.content ??
              EZRA.finding)}
        </p>
      ) : (
        <p className="text-[13.5px] text-black/60 dark:text-zinc-300 leading-relaxed">
          {EZRA.findingParts.map((part, i) =>
            part.bold ? (
              <b key={i} className="font-bold text-black dark:text-white">
                {part.text}
              </b>
            ) : (
              <React.Fragment key={i}>{part.text}</React.Fragment>
            ),
          )}
        </p>
      )}

      {/* Thread */}
      {thread.length > 0 && (
        <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          {thread.map((m, i) => (
            <div
              key={i}
              className={`text-[12.5px] leading-relaxed rounded-lg px-3 py-2 ${
                m.role === "user"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-200 ml-6"
                  : "bg-emerald-50 dark:bg-emerald-500/10 text-black dark:text-zinc-200 mr-6"
              }`}
            >
              {m.content}
            </div>
          ))}
          {thinking && (
            <div className="mr-6 text-[12.5px] text-black/50 dark:text-zinc-500">
              Ezra is thinking…
            </div>
          )}
          <div ref={threadEndRef} />
        </div>
      )}

      {/* Suggested questions */}

      {/* Ask box */}
      <div className="flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 p-2 pl-4">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
          placeholder="Ask Ezra about this incident…"
          className="flex-1 bg-transparent text-[13.5px] text-black dark:text-zinc-200 placeholder:text-black/40 dark:placeholder:text-zinc-500 outline-none"
        />
        <button
          onClick={() => ask()}
          disabled={!question.trim() || thinking}
          className="w-9 h-9 shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 flex items-center justify-center transition-colors"
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
};

export default EzraAssessment;
