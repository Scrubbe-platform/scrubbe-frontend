import React from 'react';
import { ShieldCheck, Lightbulb, Activity, LucideIcon } from 'lucide-react';

interface LogPayload {
  [key: string]: any;
}

interface LogEntryProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  time: string;
  payload?: LogPayload;
}

const DecisionLog: React.FC = () => {
  return (
    <div className=" p-5 border border-IMSCyan/40 rounded-xl text-slate-300 bg-gradient-to-b from-[#0074834D] to-[#004B571A] flex items-start justify-center">
      <div className="w-full ">
        
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Decision Log</h2>
          <p className="text-lg text-slate-300 font-medium">What happened and why (including human notes)</p>
          <p className="text-base text-slate-300">Timeline is derived from this log.</p>
        </div>

        {/* Entries Container */}
        <div className="bg-black border border-slate-400 rounded-2xl p-6 space-y-4 shadow-inner">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Recent entries</h3>
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-slate-400">
              14 events
            </span>
          </div>

          <LogEntry 
            icon={<ShieldCheck className="text-green" size={16} />}
            title="policy.evaluated"
            desc="Policy evaluated for incident."
            time="10:45:55 PM"
            payload={{
              autoActivate: false,
              humanGate: true,
              scope: "pr-only"
            }}
          />

          <LogEntry 
            icon={<ShieldCheck className="text-green" size={16} />}
            title="policy.mode"
            desc="Policy mode set to standard."
            time="10:45:55 PM"
          />

          <LogEntry 
            icon={<ShieldCheck className="text-green" size={16} />}
            title="hypotheses.generated"
            desc="Generated top 3 likely causes (not final RCA)."
            time="10:45:55 PM"
            payload={{
              top: [
                { title: "Competing refactors touching same module", conf: 0.72 },
                { title: "Policy/route changes diverged", conf: 0.7 },
                { title: "Backport/cherry-pick drift", conf: 0.62 }
              ]
            }}
          />

          <LogEntry 
            icon={<ShieldCheck className="text-green" size={16} />}
            title="Event"
            desc="Policy mode set to standard."
            time="10:45:55 PM"
          />
        </div>
      </div>
    </div>
  );
};

const LogEntry: React.FC<LogEntryProps> = ({ icon, title, desc, time, payload }) => (
  <div className="border border-slate-800 rounded-xl p-4 bg-black hover:border-slate-700 transition-colors group">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-start gap-3">
        <div className="mt-1">{icon}</div>
        <div>
          <h4 className="text-sm font-black text-slate-100 font-mono tracking-tight">{title}</h4>
          <p className="text-[13px] text-slate-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <span className="text-[11px] font-medium text-slate-600 font-mono">{time}</span>
    </div>

    {payload && (
      <div className="mt-4 bg-black/80 rounded-lg p-4 border border-slate-800 font-mono text-[12px] text-slate-300 leading-relaxed overflow-x-auto shadow-inner">
        <pre><code>{JSON.stringify(payload, null, 2)}</code></pre>
      </div>
    )}
  </div>
);

export default DecisionLog;