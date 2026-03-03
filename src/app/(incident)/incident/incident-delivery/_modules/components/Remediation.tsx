import React from 'react';
import { 
  Sparkles, Code, PlayCircle, Zap, 
  Info, PlusSquare, ExternalLink, Minus, 
  ChevronRight, ArrowUpRight, Link 
} from 'lucide-react';

/**
 * Interface definitions for strict type safety
 */
interface Hypothesis {
  id: string;
  title: string;
  confidence: number;
  runUrl: string;
  diffUrl: string;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
}

const Remediation: React.FC = () => {
  const hypotheses: Hypothesis[] = [
    { id: 'HYP-1', title: 'Competing refactors touching same module', confidence: 0.72, runUrl: '#', diffUrl: '#' },
    { id: 'HYP-2', title: 'Policy/route changes diverged', confidence: 0.72, runUrl: '#', diffUrl: '#' },
    { id: 'HYP-3', title: 'Backport/cherry-pick drift', confidence: 0.72, runUrl: '#', diffUrl: '#' },
  ];

  return (
    <div className=" p-5 border border-IMSCyan/40 rounded-xl text-slate-300 bg-gradient-to-b from-[#0074834D] to-[#004B571A] flex items-start justify-center">
      <div className="w-full">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white tracking-tight">Remediation</h2>
            <p className="text-lg text-slate-300 font-medium mt-4">Suggest → verify → summarize</p>
            <p className="text-base text-slate-500">Default is PR-safe. Verification is shown after execution.</p>
          </div>
          <button className="p-2 bg-slate-900/80 border border-slate-800 rounded-full">
            <Minus size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Action Button Row */}
        <div className="flex flex-wrap gap-2 mb-8">
          <ActionButton icon={<Sparkles size={14}/>} label="Generate Suggestion" color="bg-[#eab308]" />
          <ActionButton icon={<Code size={14}/>} label="Review in Code Engine" color="bg-[#d97706]" />
          <ActionButton icon={<PlayCircle size={14}/>} label="Execute safe action" color="bg-[#f43f5e]" />
          <ActionButton icon={<Zap size={14}/>} label="Generate Ezra" color="bg-[#f43f5e]" />
          <ActionButton icon={<Info size={14}/>} label="Suggestion Details" color="bg-[#06b6d4]" />
          <ActionButton icon={<PlusSquare size={14}/>} label="Create PR from Suggestion" color="bg-[#d946ef]" />
          <ActionButton icon={<Zap size={14}/>} label="Merge Suggested PR" color="bg-[#f43f5e]" />
          <ActionButton icon={<ArrowUpRight size={14}/>} label="Open Ezra Full View" color="bg-[#22c55e]" />
        </div>

        {/* Automated Remediation Card */}
        <div className="bg-black border border-slate-500 rounded-2xl p-6 mb-6">
          <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest mb-1">Automated remediation</h3>
          <p className="text-[11px] text-slate-500 mb-4">Based on the failure type, Scrubbe proposes the next best actions (code patch, PR, CI rerun) and tracks outcomes.</p>
          
          <div className="flex gap-2 mb-6">
            <StatusPill label="Confidence: —" />
            <StatusPill label="PR: —" />
            <StatusPill label="CI: —" />
            <StatusPill label="Merge gate: —" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SuggestionBox 
              title="Suggested action"
              boldText="Resolve merge conflict"
              desc="Generate a conflict resolution PR patch; merge requires approval."
            />
            <SuggestionBox 
              title="Suggested PR change"
              boldText="PR patch: Merge conflict detected — Add new policy evaluator"
              desc='Files touched + risk are shown below in "Diff provenance".'
            />
            <SuggestionBox 
              title="Suggested CI/CD action"
              boldText="Re-run CI checks for this PR/commit"
              desc="Verification results update automatically when actions run."
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <OutlineButton label="Auto-Suggest fix" />
            <OutlineButton label="Create PR" />
            <OutlineButton label="Run CI/CD" />
            <OutlineButton label="Merge(requires approval )" />
          </div>
        </div>

        {/* Lower Grid (Suggestion Preview & Verification) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-black border border-slate-500 rounded-2xl p-6">
             <h3 className="text-sm font-bold text-white mb-4">Suggestion (preview)</h3>
             <div className="flex gap-2 mb-4">
               <StatusPill label="id: —" />
               <StatusPill label="Confidence: —" />
             </div>
             <div className="h-40 bg-black/60 rounded-xl border border-slate-800 p-4">
               <span className="text-slate-600 font-mono">—</span>
             </div>
          </div>

          <div className="bg-black border border-slate-500 rounded-2xl p-6">
             <h3 className="text-sm font-bold text-white mb-4">3. Verification results</h3>
             <div className="grid grid-cols-3 gap-2 mb-4">
               <MetricBox label="CI rerun" />
               <MetricBox label="Flake rate" />
               <MetricBox label="Affected jobs" />
             </div>
             <p className="text-[11px] text-slate-500 mb-4">Execute a safe action to generate verification results.</p>
             <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Ezra Summaries</h4>
             <div className="space-y-4">
               <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase">Executive</p>
                 <p className="text-xs text-slate-400">—</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase">Analyst</p>
                 <p className="text-xs text-slate-400">—</p>
               </div>
             </div>
          </div>
        </div>

        {/* Root-cause hypothesis panel */}
        <div className="bg-black border border-slate-500 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white">2. Root-cause hypothesis panel</h3>
            <button className="px-4 py-1.5 border border-cyan-500 text-cyan-500 rounded-lg text-xs font-bold">Expand</button>
          </div>
          
          <div className="space-y-3">
            {hypotheses.map((hyp) => (
              <div key={hyp.id} className="flex justify-between items-center p-4 bg-black/60 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-100">{hyp.title}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-1">Confidence: {hyp.confidence}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex items-center gap-1.5 px-2 py-1  border border-slate-800 rounded-xl text-[10px] text-slate-200 font-mono">
                      <Link2Icon /> runUrl
                    </button>
                    <button className="flex items-center gap-1.5 px-2 py-1  border border-slate-800 rounded-xl text-[10px] text-slate-200 font-mono">
                      <Link2Icon /> diffUrl
                    </button>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-200 border border-slate-500 px-2 py-1 rounded-xl">{hyp.id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Sub-components for better organization --- */

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, color }) => (
  <button className={`flex items-center gap-2 px-3 py-1.5 ${color} text-black rounded-md text-[10px] font-black uppercase tracking-tight hover:opacity-90`}>
    {icon} {label}
  </button>
);

const SuggestionBox: React.FC<{ title: string; boldText: string; desc: string }> = ({ title, boldText, desc }) => (
  <div className="bg-black p-4 rounded-xl border border-slate-500 min-h-[140px]">
    <p className="text-sm font-black uppercase text-white mb-2">{title}</p>
    <p className="text-sm font-semibold text-slate-200 leading-tight">{boldText}</p>
    <p className="text-sm text-white mt-2 leading-relaxed">{desc}</p>
  </div>
);

const OutlineButton: React.FC<{ label: string }> = ({ label }) => (
  <button className="w-full py-2 border border-IMSCyan text-IMSCyan text-xs font-bold rounded-lg hover:bg-cyan-500/10 transition-colors">
    {label}
  </button>
);

const StatusPill: React.FC<{ label: string }> = ({ label }) => (
  <div className="px-3 py-1 bg-black border border-slate-800 rounded-full text-[10px] font-mono text-slate-400">
    {label}
  </div>
);

const MetricBox: React.FC<{ label: string }> = ({ label }) => (
  <div className="bg-black p-3 rounded-lg border border-slate-500">
    <p className="text-[9px] font-bold text-slate-200 uppercase mb-1">{label}</p>
    <p className="text-sm font-mono text-slate-400">—</p>
  </div>
);

const Link2Icon = () => (
    <Link size={10} className='text-IMSCyan'/>
);

export default Remediation;