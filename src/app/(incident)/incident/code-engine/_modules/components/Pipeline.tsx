import React, { ReactNode, useState } from "react";
import {
  GitBranch,
  Terminal,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Workflow,
} from "lucide-react";

// --- Type Definitions ---
type StageStatus = "success" | "failed" | "skipped";

interface PipelineStageProps {
  title: string;
  status: StageStatus;
  duration?: string;
  history?: string;
  isLast?: boolean;
  children?: ReactNode;
}

// --- Sub-Components ---

const PipelineStage: React.FC<PipelineStageProps> = ({
  title,
  status,
  duration,
  history,
  isLast,
  children,
}) => {
  const statusConfig = {
    success: {
      color: "bg-emerald-500",
      icon: <CheckCircle2 size={14} className="text-emerald-500" />,
    },
    failed: {
      color: "bg-rose-500",
      icon: <XCircle size={14} className="text-rose-500" />,
    },
    skipped: {
      color: "bg-slate-700",
      icon: (
        <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-600" />
      ),
    },
  };

  return (
    <div className="relative flex gap-4 pb-6">
      {!isLast && (
        <div className="absolute left-[5px] top-4 bottom-0 w-[1px] bg-slate-800" />
      )}
      <div className="relative z-10 pt-1">
        <div
          className={`w-[11px] h-[11px] rounded-full ${statusConfig[status].color}`}
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
        {duration && (
          <p className="text-[11px] text-slate-500 font-medium">{duration}</p>
        )}
        {history && (
          <p
            className={`text-[11px] italic ${
              status === "failed" ? "text-red-400" : "text-slate-400"
            }`}
          >
            {history}
          </p>
        )}

        {children}
      </div>
    </div>
  );
};

// --- Main Component ---

export default function Pipeline() {
  const [hide, setHide] = useState(false);
  return (
    <div className="min-h-screen text-slate-300 space-y-4">
      {/* Header */}
      <header className="space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Pipeline
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-white tracking-tighter">
              #311 • checkout-service
            </h1>
            <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-black uppercase">
              Failed
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            GitHub Actions • main • 4f3a91c
          </p>
        </div>
      </header>

      <div className="h-px bg-white/5" />

      {/* Stages Section */}
      <section className="space-y-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Workflow size={14} className="text-cyan-400" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">
            Stages & historical behaviour
          </h2>
        </div>

        <div className="px-1">
          <PipelineStage
            title="Build"
            status="success"
            duration="Completed in 2m 14s"
            history="Last 30 runs: 30/30 success"
          />
          <PipelineStage
            title="Unit tests"
            status="success"
            duration="Completed in 1m 05s"
            history="Last 30 runs: 29/30 success • 1 flaky"
          />
          <PipelineStage
            title="Integration tests"
            status="failed"
            duration="Failed after 34s"
            history="Last 20 runs: 4 failures • 3 with db-core connection pool exhaustion."
          >
            <div className="bg-[#0d1425] border border-rose-500/30 rounded-xl overflow-hidden mb-6">
              <div className="p-4 space-y-2 border-b border-white/5">
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                  ERROR: Timeout while connecting to db-core (region=eu-west-1,
                  request_id=req_123)
                </p>
                <button
                  onClick={() => setHide((prev) => !prev)}
                  className="text-[11px] font-bold text-cyan-400 underline decoration-cyan-400/30 underline-offset-4"
                >
                  Hide logs
                </button>
              </div>
              {!hide && (
                <div className="p-4 font-mono text-[10px] space-y-1 text-slate-500 leading-relaxed">
                  <p>14:32:01 INFO checkout-service deployment started</p>
                  <p>14:32:08 INFO running integration tests suite</p>
                  <p className="text-yellow-500/80">
                    14:32:12 WARN high latency detected when connecting to
                    db-core
                  </p>
                  <p className="text-rose-400">
                    14:32:15 ERROR Timeout while connecting to db-core
                    (region=eu-west-1, request_id=req_123)
                  </p>
                  <p className="text-rose-400">
                    14:32:16 ERROR integration test suite failed (12 failures)
                  </p>
                  <p>14:32:20 INFO pipeline marked as FAILED</p>
                </div>
              )}
            </div>
          </PipelineStage>
          <PipelineStage
            title="Deploy to staging"
            status="skipped"
            duration="Skipped (dependency failed)"
            isLast
          />
        </div>
      </section>

      {/* Scrubbe Insight Box */}
      <section className="p-6 rounded-2xl border border-purple-500/40 bg-purple-500/5 space-y-4 mb-10">
        <h2 className="text-xs font-black text-white uppercase tracking-widest">
          Scrubbe Insight
        </h2>
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Failure at Integration tests is consistent with DB connection pool
            exhaustion in db-core after deploy #311.
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed italic">
            Signals used by Code Intelligence: integration logs, latency_p95,
            error_rate_5xx, past incidents INC-231 & INC-187.
          </p>
        </div>
      </section>

      {/* Action Buttons */}
      <footer className="space-y-3">
        <button className="w-full py-4 bg-cyan-400 text-black text-base font-medium rounded-xl hover:bg-cyan-300 transition-all">
          Review code intelligence Suggestion
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-4 border border-IMSCyan text-IMSCyan rounded-xl text-xs font-black hover:bg-white/5">
            Open in Github
          </button>
          <button className="flex items-center justify-center gap-2 py-4 border border-IMSCyan text-IMSCyan rounded-xl text-xs font-black hover:bg-white/5">
            Rerun in staging
          </button>
        </div>
      </footer>
    </div>
  );
}
