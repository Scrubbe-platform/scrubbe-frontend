import React from "react";
import {
  ShieldAlert,
  Users,
  CheckSquare,
  Play,
  Activity,
  RotateCcw,
  Zap,
  BookOpen,
} from "lucide-react";

export const RightPanel = () => {
  return (
    <aside className="w-[300px] border-l border-blue-500/10 bg-darkEzra flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
      {/* 1. Blast Radius Section */}
      <div className="p-4 border-b border-blue-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-purple-400">
            <ShieldAlert size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Blast Radius
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            P1 LIVE
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">
            Affected Services
          </p>
          <ul className="space-y-2 text-xs font-medium">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Payment
              Service
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Checkout
              Service
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> API
              Gateway
            </li>
          </ul>
        </div>

        <div className="bg-[#0d1520] border border-blue-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Users size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Users Impacted
            </span>
          </div>
          <div className="text-3xl font-bold text-amber-500 mb-3">30%</div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 w-[30%]" />
          </div>
        </div>
      </div>

      {/* 2. Investigation Steps Section */}
      <div className="p-4 border-b border-blue-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-400">
            <CheckSquare size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Investigation Steps
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-500">
            1/5
          </span>
        </div>

        <div className="space-y-1.5">
          {[
            { text: "Review Recent Deployment", done: true },
            { text: "Check Database Logs", done: false },
            { text: "Analyze Latency Metrics", done: false },
            { text: "Correlate Redis Eviction Spike", done: false },
            { text: "Review Auth JWT Errors", done: false },
          ].map((step, i) => (
            <div
              key={i}
              className={`p-2.5 rounded border text-[11px] transition-colors cursor-pointer ${
                step.done
                  ? "bg-transparent border-white/5 text-slate-600 line-through"
                  : "bg-[#0d1520] border-white/5 text-slate-300 hover:border-blue-500/30"
              }`}
            >
              <span className="mr-2 opacity-50">{i + 1}.</span> {step.text}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Suggested Actions Section */}
      <div className="p-4 border-b border-blue-500/10">
        <div className="flex items-center gap-2 text-emerald-400 mb-4">
          <Play size={16} fill="currentColor" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Suggested Actions
          </h3>
        </div>

        <div className="space-y-1.5">
          {[
            {
              icon: <RotateCcw size={14} />,
              text: "Roll back Deployment",
              color: "text-rose-400",
            },
            {
              icon: <RotateCcw size={14} />,
              text: "Restart payment service",
              color: "text-rose-400",
            },
            {
              icon: <Zap size={14} />,
              text: "Scale Database",
              color: "text-amber-400",
            },
            {
              icon: <Zap size={14} />,
              text: "Flush Redis Cache",
              color: "text-amber-400",
            },
            {
              icon: <BookOpen size={14} />,
              text: "Open Runbook",
              color: "text-emerald-400",
            },
          ].map((action, i) => (
            <button
              key={i}
              className="w-full p-2.5 rounded border border-white/5 bg-[#0d1520] hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all flex items-center gap-3 text-[11px] font-medium text-slate-300 group"
            >
              <div
                className={`p-1 rounded bg-white/5 group-hover:bg-transparent ${action.color}`}
              >
                {action.icon}
              </div>
              {action.text}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Signal Feed Section */}
      <div className="p-4">
        <div className="flex items-center gap-2 text-blue-400 mb-4">
          <Activity size={16} />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Signal Feed
          </h3>
        </div>

        <div className="space-y-2">
          {[
            {
              time: "00:15 UTC",
              msg: "Payment Service error rate 12% — P1 threshold breached",
              type: "error",
            },
            {
              time: "00:13 UTC",
              msg: "Redis evictions 14k/min on prod-cache — OOM risk",
              type: "warn",
            },
            {
              time: "00:11 UTC",
              msg: "payment-worker-7 CrashLoopBackOff — restart #14",
              type: "error",
            },
            {
              time: "00:09 UTC",
              msg: "Auth Service p99 latency 420ms — 3x above baseline",
              type: "warn",
            },
            {
              time: "00:07 UTC",
              msg: "DB read replica failover initiated automatically",
              type: "info",
            },
          ].map((signal, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-white/5 bg-[#0d1520] hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="text-[9px] font-mono text-slate-500 mb-1">
                {signal.time}
              </div>
              <div className="text-[11px] font-medium leading-snug group-hover:text-white">
                {signal.msg}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
