"use client";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
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
    <aside className="rounded-[10px] border border-[#DDDDDD] bg-white overflow-hidden flex flex-col">
      <div className="sticky top-0 z-[5] bg-white px-4 py-3.5 border-b border-[#F0EFEA] flex items-center gap-2.5">
        <div className="relative w-[30px] h-[30px] rounded-[9px] shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#2540F2,#5b6bff)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.9} className="w-4 h-4">
            <circle cx="12" cy="12" r="2.4" />
            <path d="M12 4v3.5M12 16.5V20M4 12h3.5M16.5 12H20M6.4 6.4l2 2M15.6 15.6l2 2M17.6 6.4l-2 2M8.4 15.6l-2 2" />
          </svg>
        </div>
        <div>
          <b className={`${displayFont.className} text-[15px] font-semibold block`}>Ezra</b>
          {teamThinking && !thinking ? (
            <span className="text-[11px] text-[#2540F2] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2540F2] animate-pulse" />
              {teamThinking.triggeredBy.name} is querying…
            </span>
          ) : (
            <span className="text-[11px] text-[#8A8A93]">Investigating · SI-7A42K91</span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-[18px]">
        {/* Assessment */}
        <div className="rounded-[10px] border border-[#E7E6E0] p-[13px] bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] tracking-wide uppercase text-[#8A8A93] font-semibold">Current assessment</span>
            <span className={`${monoFont.className} text-[22px] font-semibold tracking-tight`}>{confidence}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#F1F0EB] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${confidence}%`, background: "linear-gradient(90deg,#2540F2,#5b6bff)" }} />
          </div>
        </div>

        {/* Causes */}
        <div>
          <SectionTitle label="Likely root causes" />
          <div className="flex flex-col gap-[9px]">
            {CAUSES.map(([title, pct], i) => (
              <div key={title} className="grid grid-cols-[18px_1fr] gap-[9px] items-start">
                <span className={`${monoFont.className} text-[12px] text-[#1B30C4] font-semibold pt-px`}>{i + 1}</span>
                <div>
                  <div className="text-[12.5px] font-medium mb-1">{title}</div>
                  <div className="h-1 bg-[#F1F0EB] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#2540F2] transition-all duration-1000" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Findings */}
        <div>
          <SectionTitle label="Active findings" />
          <div className="flex flex-col gap-2">
            {FINDINGS.map((f, i) => (
              <div key={i} className="flex gap-2.5 text-[12.5px] items-start">
                <span className="w-4 h-4 rounded-full bg-[#E5F6F0] text-[#0a7a5e] flex items-center justify-center shrink-0 mt-px">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-2.5 h-2.5"><path d="M5 12l5 5 9-11" /></svg>
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Impact analysis */}
        <div>
          <SectionTitle label="Impact analysis" />
          <div className="grid grid-cols-2 gap-[9px]">
            <div className="rounded-[8px] border border-[#E7E6E0] bg-white px-[11px] py-2.5">
              <div className="text-[10px] tracking-wide uppercase text-[#8A8A93]">Users impacted</div>
              <div className={`${monoFont.className} text-[17px] font-semibold mt-0.5`}>14,293</div>
            </div>
            <div className="rounded-[8px] border border-[#E7E6E0] bg-white px-[11px] py-2.5">
              <div className="text-[10px] tracking-wide uppercase text-[#8A8A93]">Affected services</div>
              <div className={`${monoFont.className} text-[17px] font-semibold mt-0.5`}>3</div>
            </div>
            <div className="col-span-2 rounded-[8px] border border-[#E7E6E0] bg-white px-[11px] py-2.5 flex items-center justify-between">
              <div className="text-[10px] tracking-wide uppercase text-[#8A8A93]">Revenue risk</div>
              <span className="text-[11px] font-bold px-2.5 py-[3px] rounded-full bg-[#FDECEC] text-[#B42A30]">High</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {["payments-api", "checkout-service", "customer-portal"].map((s) => (
              <span key={s} className={`${monoFont.className} text-[11px] bg-white border border-[#E7E6E0] rounded-[6px] px-2 py-[3px]`}>{s}</span>
            ))}
          </div>
        </div>

        {/* Timeline spine */}
        <div>
          <SectionTitle label="Investigation timeline" />
          <div className="relative pl-[22px]">
            <div className="absolute left-[5px] top-1 bottom-1 w-0.5 bg-[#E7E6E0]" />
            {TIMELINE.map(([time, desc, hot], i) => (
              <div key={i} className="relative pb-3.5 last:pb-0">
                <span
                  className={`absolute -left-[21px] top-[3px] w-[10px] h-[10px] rounded-full bg-white ${hot ? "border-2 border-[#2540F2] shadow-[0_0_0_4px_#EEF0FF]" : "border-2 border-[#B5B5BC]"}`}
                />
                <div className={`${monoFont.className} text-[11px] text-[#8A8A93]`}>{time}</div>
                <div className={`text-[12.5px] ${hot ? "text-[#1B30C4] font-medium" : ""}`}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div>
          <SectionTitle label="Recommended action" />
          <div className="rounded-[10px] border border-[#DCE0FF] bg-[#EEF0FF] p-[13px]">
            {liveResult ? (
              <div className="text-[12.5px] text-[#1B30C4] leading-relaxed mb-2 whitespace-pre-wrap">
                {typeof liveResult.result === "string"
                  ? liveResult.result
                  : (liveResult.result as any)?.summary ?? (liveResult.result as any)?.analysis ?? "Analysis complete."}
              </div>
            ) : (
              <>
                <span className="text-[9.5px] font-bold uppercase tracking-wide text-[#1B30C4] bg-white border border-[#DCE0FF] px-2 py-0.5 rounded-full inline-block mb-2">Priority 1</span>
                <h4 className={`${displayFont.className} font-semibold text-[14px] mb-2`}>Roll back deployment</h4>
                <div className="flex justify-between text-[12px] py-[3px]">
                  <span className="text-[#52525B]">Expected outcome</span>
                  <span className={`${monoFont.className} font-semibold`}>−80% failures</span>
                </div>
                <div className="flex justify-between text-[12px] py-[3px]">
                  <span className="text-[#52525B]">Confidence</span>
                  <span className={`${monoFont.className} font-semibold`}>84%</span>
                </div>
              </>
            )}
            <button
              onClick={onOpenRemediation}
              className="w-full mt-2.5 flex items-center justify-center gap-1.5 h-9 rounded-[8px] bg-[#2540F2] text-white text-[12px] font-semibold hover:bg-[#1B30C4] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="w-3.5 h-3.5"><path d="M9 11l3 3 8-8M21 12a9 9 0 11-6-8.5" /></svg>
              Review remediation
            </button>
          </div>
        </div>

        {/* Ask Ezra */}
        <div className="border-t border-[#F0EFEA] pt-4">
          <SectionTitle label="Ask Ezra" />
          <div className="flex flex-col gap-2.5 mb-2.5">
            {thread.map((m, i) => (
              <div
                key={i}
                className={`max-w-[90%] text-[12.5px] leading-relaxed px-[11px] py-2 rounded-[11px] ${
                  m.role === "user" ? "self-end ml-auto bg-[#2540F2] text-white rounded-br-[3px]" : "self-start bg-[#F6F6F3] border border-[#F0EFEA] rounded-bl-[3px] [&_b]:text-[#1B30C4]"
                }`}
                dangerouslySetInnerHTML={m.role === "ezra" ? { __html: `<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px"><span style="width:6px;height:6px;border-radius:50%;background:#2540F2"></span><small style="font-family:inherit;font-weight:600;font-size:11px">Ezra</small></div>${m.content}` } : { __html: m.content }}
              />
            ))}
            {thinking && <div className="text-[12px] text-[#8A8A93]">Ezra is thinking…</div>}
            <div ref={endRef} />
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {SUGGEST.map(([q, key]) => (
              <button
                key={q}
                onClick={() => ask(q)}
                className="text-[11.5px] text-left border border-[#E7E6E0] bg-white rounded-[8px] px-2.5 py-1.5 text-[#52525B] hover:border-[#2540F2] hover:text-[#1B30C4] hover:bg-[#EEF0FF] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex gap-[7px] items-end">
            <textarea
              rows={1}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); }
              }}
              placeholder="Ask about this incident…"
              className="flex-1 resize-none rounded-[9px] border border-[#E7E6E0] bg-white px-[11px] py-2.5 text-[12.5px] outline-none focus:border-[#2540F2] focus:shadow-[0_0_0_3px_#EEF0FF] transition-colors min-h-[38px] max-h-[100px]"
            />
            <button
              onClick={() => ask()}
              disabled={!question.trim() || thinking}
              className="w-[38px] h-[38px] shrink-0 rounded-[9px] bg-[#2540F2] text-white flex items-center justify-center hover:bg-[#1B30C4] disabled:opacity-40 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="w-4 h-4"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
});
EzraPanel.displayName = "EzraPanel";

const SectionTitle = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 mb-2">
    <span className={`${displayFont.className} text-[10.5px] font-semibold tracking-[.14em] uppercase text-[#8A8A93]`}>{label}</span>
    <span className="flex-1 h-px bg-[#F0EFEA]" />
  </div>
);

export default EzraPanel;
