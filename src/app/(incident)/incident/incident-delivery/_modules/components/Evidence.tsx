import React from 'react';
import { 
  Beaker, Hammer, GitPullRequest, GitMerge, 
  Rocket, Search, RefreshCcw, CheckCircle2, 
  ArrowRight, Terminal 
} from 'lucide-react';

const Evidence = () => {
  const evidencePayload = {
    provider: "github",
    org: "scrubbe-",
    repo: "scrubbe/payments-api",
    service: "payments-api",
    receivedAt: "2026-01-19T09:25:15.401Z",
    eventType: "pull_request",
    action: "synchronize",
    conclusion: "blocked",
    failureCategory: "merge_conflict",
    failing: [
      "src/policy/policyEngine.ts",
      "src/routes/incidents.routes.ts"
    ],
    pr: { number: 131, title: "Add new policy evaluator" },
    commit: { sha: "d00df00", author: "paschal" },
    artifacts: {
      diffUrl: "https://github.example/pr/131/files",
      runUrl: "https://github.example/pr/131"
    }
  };

  return (
    <div >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* SECTION 2: Evidence Payload Viewer */}
        <section className="bg-gradient-to-b text-white from-[#0074834D] to-[#004B571A] border border-IMSCyan/40 rounded-xl p-5 backdrop-blur-sm shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Evidence • event payload
              </h2>
              <p className="text-lg text-slate-300">Incoming CI/PR signal</p>
              <p className="text-base text-slate-500">Raw evidence from CI/CD provider + VCS.</p>
            </div>
            <span className="bg-black px-3 py-1 rounded-full text-xs font-mono border border-slate-800 text-slate-200">
              pull_request
            </span>
          </div>

          <div className="bg-black rounded-xl p-6 border border-slate-800 overflow-hidden relative group">
            <div className="absolute top-4 right-4 text-slate-700 group-hover:text-cyan-500 transition-colors">
              <Terminal size={18} />
            </div>
            <pre className="text-sm font-mono text-slate-300 leading-relaxed overflow-x-auto">
              <code>{JSON.stringify(evidencePayload, null, 2)}</code>
            </pre>
          </div>
        </section>
        
      </div>
    </div>
  );
};

const SignalBtn = ({ icon, color, label, darkText, className = "" }:any) => (
  <button className={`flex items-center gap-2 px-3 py-1.5 ${color} ${darkText ? 'text-black font-bold' : 'text-white'} rounded-md text-[11px] font-black uppercase tracking-tight hover:opacity-90 transition-opacity ${className}`}>
    {icon} {label}
  </button>
);

const TraceCard = ({ title, sub }:any) => (
  <div className="border border-cyan-900/40 bg-[#090e1a] rounded-lg p-3 hover:border-cyan-500/50 transition-colors group">
    <p className="text-sm font-bold text-slate-100 group-hover:text-cyan-400">{title}</p>
    <p className="text-[10px] text-slate-500 leading-tight mt-1">{sub}</p>
  </div>
);

export default Evidence;