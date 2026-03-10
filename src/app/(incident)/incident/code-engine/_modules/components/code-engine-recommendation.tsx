"use client"
import React from 'react';
import { DiffEditor } from '@monaco-editor/react'; // Optimized for diff viewing
import { 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  ExternalLink, 
  MessageSquare, 
  Play, 
  Workflow, 
  Clock,
  Database,
  Terminal,
  AlertTriangle
} from 'lucide-react';

export default function CodeEngineRecommendation() {
  // Mock data representing the diff from your screenshot
  const originalCode = `production:
  adapter: postgresql
  encoding: unicode
  pool_size: 50
  timeout_ms: 2000
  reconnect: true
  checkout_timeout: 10`;

  const modifiedCode = `production:
  adapter: postgresql
  encoding: unicode
  pool_size: 150      # sized for peak QPS of 280/s (was 50)
  timeout_ms: 5000     # prevents gateway timeouts under load
  max_overflow: 50    # allows burst capacity during flash sales
  reconnect: true
  checkout_timeout: 10`;

  return (
    <div className="min-h-screen bg-dark rounded-xl border border-slate-500 text-slate-300 p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER: RECOMMENDED FIX */}
        <header className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Recommended</span>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Fix #1 • Increase DB connection pool (production-safe)
                </h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge label="Confidence 0.96" color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
                <Badge label="Config Change" color="bg-slate-800 text-slate-300 border-white/10" />
                <Badge label="Used in 9 past incidents • 0 regressions" color="bg-purple-500/10 text-purple-400 border-purple-500/20" />
              </div>
            </div>
            <Zap size={32} className="text-emerald-500/40" />
          </div>

          <div className="flex gap-4">
            <Meta icon={<Clock size={12}/>} text="Metrics: latency_p95, error_rate_5xx" />
            <Meta icon={<Database size={12}/>} text="Logs: db-core timeouts" />
            <Meta icon={<Workflow size={12}/>} text="Deploy: #311 on main" />
            <Meta icon={<Clock size={12}/>} text="Similar to: INC-231, INC-187" />
          </div>
        </header>

        {/* MONACO DIFF EDITOR */}
        <section className="rounded-2xl border border-white/10 bg-[#0d1425] overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center px-6 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex flex-col">
              <span className="text-xs font-mono text-slate-200">config/database.yml</span>
              <span className="text-[10px] text-slate-500 font-medium italic uppercase tracking-tighter">PR-ready patch generated from incident context</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#10b981] text-black rounded-lg text-xs font-black hover:bg-emerald-400 transition-all">
              <Workflow size={14} /> Apply Fix & Open PR
            </button>
          </div>
          
          <div className="h-[350px] w-full pt-2">
            <DiffEditor
              height="100%"
              original={originalCode}
              modified={modifiedCode}
              language="yaml"
              theme="vs-dark"
              options={{
                readOnly: true,
                renderSideBySide: true, // Side-by-side view as requested
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                diffWordWrap: 'on',
                automaticLayout: true,
                scrollbar: {
                   vertical: 'hidden',
                   horizontal: 'hidden'
                }
              }}
            />
          </div>
        </section>

        {/* EXPLANATION SECTION */}
        <section className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
          <div className="flex items-center gap-2 text-yellow-500">
            <Zap size={16} />
            <h2 className="text-sm font-bold uppercase tracking-widest">Why this works</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            The deploy at 14:32 UTC increased traffic by <b className="text-white">41%</b>. The previous pool of 50 connections was exhausted in 8 seconds, causing timeouts on db-core. 
            This configuration matches capacity used during Black Friday 2024 and resolved identical failures in <b className="text-white underline cursor-pointer">INC-231</b> and <b className="text-white underline cursor-pointer">INC-187</b>.
          </p>
        </section>

        {/* GUARDRAILS & WATCH GRID */}
        <div className="grid grid-cols-3 gap-6">
          <GuardrailCard 
            title="Pre-checks" 
            icon={<CheckCircle2 size={14} className="text-emerald-500" />}
            items={['Unit & integration tests will re-run in staging', 'Config validated against schema', 'No conflicting changes on main']} 
          />
          <GuardrailCard 
            title="Guardrails" 
            icon={<ShieldCheck size={14} className="text-yellow-500" />}
            items={['Auto-apply only in staging', 'PR + approval required for production', 'Full audit trail added to incident timeline']} 
            link="View guardrail matrix"
          />
          <GuardrailCard 
            title="Post-apply watch" 
            icon={<Eye size={14} className="text-blue-500" />}
            items={['Monitor latency_p95 & error_rate_5xx for 15 mins', 'Auto-open follow-up if metrics regress', 'Snapshot added to incident report']} 
            warning="Auto-open follow-up if metrics regress"
          />
        </div>

        {/* FOOTER ACTIONS */}
        <footer className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-[#10b981] text-black rounded-xl text-xs font-black hover:bg-emerald-400 transition-all">
              <Play size={14} /> Apply in Staging & Rerun Pipeline
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
              <MessageSquare size={14} /> Explain reasoning in Slack
            </button>
          </div>
          <div className="flex gap-6 items-center">
             <a href="#" className="text-emerald-500 text-xs font-bold flex items-center gap-1 hover:underline">
               Preview PR in GitHub <ExternalLink size={12}/>
             </a>
             <button className="text-slate-500 text-xs font-bold flex items-center gap-1 hover:text-white transition-colors">
               <Workflow size={14}/> View remediation workflow
             </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Sub-components for structure and type safety
const Badge = ({ label, color }: { label: string, color: string }) => (
  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${color}`}>
    {label}
  </span>
);

const Meta = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
    {icon} {text}
  </div>
);

const GuardrailCard = ({ title, icon, items, link, warning }: any) => (
  <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</span>
    </div>
    <ul className="space-y-2">
      {items.map((item: string, i: number) => (
        <li key={i} className={`text-[11px] flex items-start gap-2 ${item === warning ? 'text-yellow-500' : 'text-slate-500'}`}>
          {item === warning ? <AlertTriangle size={12} className="mt-0.5" /> : <div className="w-1 h-1 rounded-full bg-slate-700 mt-1.5" />}
          {item}
        </li>
      ))}
    </ul>
    {link && <button className="text-[10px] text-yellow-500 font-black uppercase flex items-center gap-1 hover:underline pt-2">
      <Database size={10}/> {link}
    </button>}
  </div>
);