"use client";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Check, Send } from "lucide-react";
import { ANSWERS, CAUSES, FINDINGS, SUGGEST, TIMELINE, classify } from "./evidenceExplorer.data";
import { displayFont, monoFont } from "./fonts";
import { useSharedAI } from "@/hooks/useSharedAI";

interface ChatTurn { role: "user" | "ezra"; content: string }

export interface EzraPanelHandle { ask: (q: string) => void }

const EzraPanel = forwardRef<EzraPanelHandle, { confidence: number; onOpenRemediation: () => void; ticketId?: string | null }>(({ confidence, onOpenRemediation, ticketId }, ref) => {
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState<ChatTurn[]>([
    { role: "ezra", content: "I've correlated 18 findings across 24 sources. Current read: a deployment-induced retry storm saturating the database. Ask me anything, or open <b>Review remediation</b> for the rollback plan." },
  ]);
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { triggerAI, getResult, isThinking, whoIsThinking } = useSharedAI(ticketId);
  const teamThinking = whoIsThinking();
  const liveResult = getResult("investigation");

  useImperativeHandle(ref, () => ({ ask: (q: string) => ask(q) }));

  const ask = (override?: string) => {
    const q = (override ?? question).trim();
    if (!q || thinking) return;
    setThread((t) => [...t, { role: "user", content: q.replace(/</g, "&lt;") }]);
    setQuestion("");
    if (ticketId) {
      triggerAI("investigation");
      setThinking(true);
      const waitForResult = () => {
        const result = getResult("investigation");
        if (result) {
          const text = typeof result.result === "string"
            ? result.result
            : (result.result as any)?.summary ?? (result.result as any)?.analysis ?? JSON.stringify(result.result, null, 2);
          setThread((t) => [...t, { role: "ezra", content: text ?? ANSWERS[classify(q)] ?? ANSWERS._fallback }]);
          setThinking(false);
          requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
          return;
        }
        requestAnimationFrame(waitForResult);
      };
      setTimeout(waitForResult, 800);
    } else {
      setThinking(true);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
      setTimeout(() => {
        setThread((t) => [...t, { role: "ezra", content: ANSWERS[classify(q)] ?? ANSWERS._fallback }]);
        setThinking(false);
        requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
      }, 560);
    }
  };

  return (
    <aside className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden flex flex-col">
      <div className="px-5 pt-5 pb-1">
        <b className={`${displayFont.className} text-[20px] font-bold block text-black dark:text-zinc-100`}>Ezra</b>
        {teamThinking && !thinking ? (
          <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {teamThinking.triggeredBy.name} is querying…
          </span>
        ) : (
          <span className="mt-0.5 block text-[13px] text-black/50 dark:text-zinc-500">Investigating · SI-7A42K91</span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-6">
        {/* Assessment */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-black/50 dark:text-zinc-500">Current Assessment</span>
            <span className={`${monoFont.className} text-[28px] font-bold text-black dark:text-zinc-100`}>{confidence}%</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-600 transition-all duration-1000" style={{ width: `${confidence}%` }} />
          </div>
          <p className="mt-3 text-[13px] text-black/50 dark:text-zinc-500 leading-relaxed">
            Confidence reflects corroboration across timing, correlation, and agent findings.
          </p>
        </div>

        {/* Causes */}
        <div>
          <SectionTitle label="Likely Root Causes" />
          <div className="flex flex-col gap-3">
            {CAUSES.map(([title], i) => (
              <div key={title} className="flex items-baseline gap-2.5">
                <span className={`${monoFont.className} text-[13px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0`}>{i + 1}</span>
                <span className="text-[14px] font-semibold text-black dark:text-zinc-100">{title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Findings */}
        <div>
          <SectionTitle label="Active Findings" />
          <div className="flex flex-col gap-2.5">
            {FINDINGS.map((f, i) => (
              <div key={i} className="flex gap-2.5 text-[13.5px] items-start text-black/70 dark:text-zinc-300">
                <Check size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <SectionTitle label="Investigative Timeline" />
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-zinc-200 dark:bg-zinc-800" />
            {TIMELINE.map(([time, desc, hot], i) => (
              <div key={i} className="relative pb-5 last:pb-0">
                <span
                  className={`absolute -left-6 top-0.5 w-[14px] h-[14px] rounded-full bg-white dark:bg-zinc-900 ${hot ? "bg-zinc-900 border-2 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100" : "border-2 border-zinc-300 dark:border-zinc-700"}`}
                />
                <div className={`${monoFont.className} text-[12.5px] text-black/45 dark:text-zinc-500`}>{time}</div>
                <div className={`text-[14.5px] font-semibold mt-0.5 ${hot ? "text-zinc-900 dark:text-zinc-100" : "text-black dark:text-zinc-100"}`}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div>
          <SectionTitle label="Recommended Action" />
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-4">
            {liveResult ? (
              <div className="text-[13.5px] text-black dark:text-zinc-100 leading-relaxed mb-3 whitespace-pre-wrap">
                {typeof liveResult.result === "string"
                  ? liveResult.result
                  : (liveResult.result as any)?.summary ?? (liveResult.result as any)?.analysis ?? "Analysis complete."}
              </div>
            ) : (
              <>
                <h4 className={`${displayFont.className} font-bold text-[17px] text-black dark:text-zinc-100 mb-3`}>Roll back deployment</h4>
                <div className="flex justify-between text-[13.5px] py-1.5">
                  <span className="text-black/50 dark:text-zinc-500">Expected outcome</span>
                  <span className={`${monoFont.className} font-bold text-black dark:text-zinc-100`}>−80% failures</span>
                </div>
                <div className="flex justify-between text-[13.5px] py-1.5">
                  <span className="text-black/50 dark:text-zinc-500">Confidence</span>
                  <span className={`${monoFont.className} font-bold text-black dark:text-zinc-100`}>84%</span>
                </div>
              </>
            )}
            <button
              onClick={onOpenRemediation}
              className="w-full mt-3 h-11 rounded-lg bg-emerald-600 text-white text-[14px] font-bold hover:bg-emerald-700 transition-colors"
            >
              Review remediation
            </button>
          </div>
        </div>

        {/* Impact analysis */}
        <div>
          <SectionTitle label="Impact Analysis" />
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3.5 py-3">
              <div className="text-[11px] tracking-wide uppercase text-black/45 dark:text-zinc-500">Users Impacted</div>
              <div className={`${monoFont.className} text-[19px] font-bold text-black dark:text-zinc-100 mt-1`}>14,293</div>
            </div>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3.5 py-3">
              <div className="text-[11px] tracking-wide uppercase text-black/45 dark:text-zinc-500">Affected Services</div>
              <div className={`${monoFont.className} text-[19px] font-bold text-black dark:text-zinc-100 mt-1`}>3</div>
            </div>
            <div className="col-span-2 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3.5 py-3 flex items-center justify-between">
              <div className="text-[11px] tracking-wide uppercase text-black/45 dark:text-zinc-500">Revenue Risk</div>
              <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400">High</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2.5">
            {["payments-api", "checkout-service", "customer-portal"].map((s) => (
              <span key={s} className={`${monoFont.className} text-[12px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1 text-black dark:text-zinc-100`}>{s}</span>
            ))}
          </div>
        </div>

        {/* Ask Ezra */}
        <div>
          <SectionTitle label="Ask Ezra" />
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-4">
            <div className="flex flex-col gap-3 mb-3">
              {thread.map((m, i) =>
                m.role === "ezra" ? (
                  <div key={i} className="text-[13.5px] leading-relaxed text-black dark:text-zinc-100">
                    <b className="block font-bold mb-1">Ezra</b>
                    <span className="[&_b]:text-blue-600 dark:[&_b]:text-blue-400 [&_b]:font-semibold" dangerouslySetInnerHTML={{ __html: m.content }} />
                  </div>
                ) : (
                  <div key={i} className="self-end ml-auto max-w-[85%] bg-emerald-600 text-white text-[13.5px] leading-relaxed rounded-lg rounded-br-sm px-3 py-2">
                    {m.content}
                  </div>
                ),
              )}
              {thinking && <div className="text-[13px] text-black/50 dark:text-zinc-500">Ezra is thinking…</div>}
              <div ref={endRef} />
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGEST.map(([q]) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="text-[12.5px] text-left border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-3 py-1.5 text-black/70 dark:text-zinc-300 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <textarea
                rows={1}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); }
                }}
                placeholder="Ask about this incident…"
                className="flex-1 resize-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-[13px] text-black dark:text-zinc-100 outline-none focus:border-emerald-400 dark:focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)] transition-colors min-h-[40px] max-h-[100px]"
              />
              <button
                onClick={() => ask()}
                disabled={!question.trim() || thinking}
                className="w-10 h-10 shrink-0 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
});
EzraPanel.displayName = "EzraPanel";

const SectionTitle = ({ label }: { label: string }) => (
  <h3 className={`${displayFont.className} text-[15px] font-bold text-black dark:text-zinc-100 mb-3`}>{label}</h3>
);

export default EzraPanel;
