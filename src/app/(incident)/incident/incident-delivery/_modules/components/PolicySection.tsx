import SideModal from '@/components/ui/SideModal';
import React, { useState } from 'react';
import PolicyDecision from './Modal/PolicyDecision';

const PolicySection = () => {
  const [isPolicy, setIsPolicy] = useState(false)
  return (
    <div className="text-white border border-IMSCyan/40 rounded-xl p-5 bg-gradient-to-b from-[#0074834D] to-[#004B571A] flex items-start justify-center">
      <div className='w-full'>
        
        {/* Header Area */}
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white tracking-tight">Policy</h2>
            <div className="space-y-2">
              <p className="text-xl text-slate-300 font-medium">When and how execution is allowed</p>
              <p className="text-lg text-slate-400 font-medium">Auto-activation, gates, scope, and reasons.</p>
            </div>
          </div>
          
          <button onClick={() => setIsPolicy(true)} className="px-6 py-2 border border-cyan-400 text-cyan-400 rounded-xl text-lg font-bold hover:bg-cyan-400/10 transition-all duration-200 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
            Details
          </button>
        </div>

        {/* Policy Configuration Grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <PolicyCard title="Auto-activate?" value="No" />
          <PolicyCard title="Approval gate?" value="Required" />
          <PolicyCard title="Execution scope" value="pr-only" />
        </div>

        {/* Reasons Summary Card */}
        <div className="bg-black border border-slate-800 rounded-2xl p-6 shadow-inner">
          <h3 className="text-base font-black text-white uppercase tracking-widest mb-4">Reasons (summary)</h3>
          <div className="flex items-start gap-3">
             <span className="text-slate-500 mt-1.5 text-xs">•</span>
             <p className="text-sm text-slate-300 font-medium">
               Merge conflicts are correctness-sensitive → approval required.
             </p>
          </div>
        </div>
        
      </div>
      {isPolicy &&
        <SideModal isOpen={isPolicy} onClose={() => setIsPolicy(false)} title={'Policy decision'} subTitle='Why actions are allowed or blocked'>
          <PolicyDecision />
        </SideModal>
      }
    </div>
  );
};

// Internal sub-component for policy metrics
const PolicyCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-black border border-slate-800 rounded-2xl p-6 flex flex-col gap-2 group hover:border-cyan-500/30 transition-all duration-300">
    <h3 className="text-base font-black text-slate-100 uppercase tracking-tight">{title}</h3>
    <p className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">{value}</p>
  </div>
);

export default PolicySection;