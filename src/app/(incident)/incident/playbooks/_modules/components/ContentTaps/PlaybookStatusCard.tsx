import React from "react";
import { TriangleAlert, Copy, Play } from "lucide-react";

export default function PlaybookStatusCard() {
  return (
    <div className="flex bg-dark rounded-lg items-center justify-center">
      <div className="w-full max-w-[1180px] p-2 shadow-2xl">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Warning Icon Container */}
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
              <TriangleAlert className="w-3 h-3 text-amber-500" />
            </div>
            {/* Title and Metadata Tags */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Auth JWT Regression
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Tag variant="amber" border>
                  STAGE 3 · ASSISTED EXECUTION
                </Tag>
                <Tag variant="ghost" border>
                  v2.3.1
                </Tag>
                <Tag variant="amber" border>
                  payment-api
                </Tag>
                <Tag variant="red" border>
                  P1 ACTIVE
                </Tag>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end items-center gap-2">
            <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-white/5 hover:border-slate-500 transition-colors">
              <Copy className="w-3 h-3 text-slate-400" />
              <span className="text-sm font-medium">Clone</span>
            </button>
            <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-white/5 hover:border-slate-500 transition-colors">
              <Play className="w-3 h-3 text-slate-400" />
              <span className="text-sm font-medium">Dry Run</span>
            </button>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="rounded-xl border border-white/[0.06] bg-black/10 p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-medium text-slate-100">
              Effective Automation Level · CP Enforced
            </h3>
            <div className="space-y-1.5">
              <div className="text-sm font-medium text-white text-right">
                Automation Stages
              </div>
              <div className="flex gap-1">
                <div className="w-12 h-1 rounded-full bg-emerald-500" />
                <div className="w-12 h-1 rounded-full bg-lime-500" />
                <div className="w-12 h-1 rounded-full bg-slate-700" />
                <div className="w-12 h-1 rounded-full bg-slate-700" />
              </div>
            </div>
          </div>
          {/* Formula Line */}
          <div className="flex items-center gap-2.5 font-mono text-sm text-slate-500 tracking-tight">
            <span>min(</span>
            <span className="px-3 py-2 rounded-lg border border-amber-500/30 text-amber-500 font-medium">
              playbook: 3
            </span>
            <span>,</span>
            <span className="px-3 py-2 rounded-lg border border-purple-500/30 text-purple-500 font-medium">
              policy: 3
            </span>
            <span>,</span>
            <span className="px-3 py-2 rounded-lg border border-red-500/30 text-red-500 font-medium">
              risk: 2
            </span>
            <span>) =</span>
            <span className="px-3 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 font-medium">
              2 · PROPOSE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TagProps {
  children: React.ReactNode;
  variant: "amber" | "red" | "ghost";
  border?: boolean;
}

function Tag({ children, variant, border = false }: TagProps) {
  const baseClasses =
    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors";

  const variantClasses = {
    amber: "text-amber-500 bg-amber-500/5 hover:bg-amber-500/10",
    red: "text-red-500 bg-red-500/5 hover:bg-red-500/10",
    ghost: "text-slate-200 bg-slate-800/20 hover:bg-slate-800/30",
  };

  const borderClasses = {
    amber: "border border-amber-500/20",
    red: "border border-red-500/20",
    ghost: "border border-slate-700/50",
  };

  const finalBorder = border ? borderClasses[variant] : "";

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${finalBorder}`}>
      {children}
    </div>
  );
}
