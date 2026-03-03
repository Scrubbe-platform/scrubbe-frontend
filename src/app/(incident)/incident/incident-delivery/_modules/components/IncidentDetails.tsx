import React from 'react';
import { 
  ShieldAlert, 
  Tag, 
  GitBranch, 
  Terminal, 
  Copy, 
  ExternalLink,
  Layers,
  Link2,
  XCircle
} from 'lucide-react';

const IncidentDetails = () => {
  const payloadData = {
    provider: "github",
    org: "scrubbe-",
    repo: "scrubbe/payments-api",
    service: "payments-api",
    receivedAt: "2026-01-19T09:25:15.401Z",
    eventType: "pull_request",
    action: "synchronize",
    conclusion: "blocked",
    failureCategory: "merge_conflict",
    failing: ["src/policy/policyEngine.ts", "src/routes/incidents.routes.ts"],
    pr: { number: 131, title: "Add new policy evaluator" },
    commit: { sha: "d00df00", author: "paschal" },
    artifacts: {
      diffUrl: "https://github.example/pr/131/files",
      runUrl: "https://github.example/pr/131"
    }
  };

  return (
    <div className="text-slate-300 bg-gradient-to-b from-[#0074834D] to-[#004B571A] border rounded-xl border-IMSCyan/40 p-5">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* SECTION: Incident Details (Screenshot 4) */}
        <section>
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">Incident</h1>
              <p className="text-lg text-slate-400 font-medium tracking-wide">Raised automatically (delivery incident)</p>
              <p className="text-base text-slate-500 italic">Dedup keeps one incident per correlated failure.</p>
            </div>
            <span className="bg-black px-4 py-1.5 rounded-full text-xs font-mono border border-slate-800 text-slate-400 tracking-widest">
              INC-ED51312B
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <InfoCard title="Incident ID" value="INC-ED51312B" />
            <InfoCard 
              title="Correlation key (dedup)" 
              value="scrubbe/payments-api::pr131::https://github.example/pr/131::d00df00" 
              sub="repo + pr + run + sha"
            />
            <div className="bg-black border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-black text-white tracking-widest">Type / subtype</h3>
              <div className="flex gap-3">
                <Badge icon={<Layers size={14} className='text-IMSCyan' />} label="delivery" />
                <Badge icon={<Tag size={14} className='text-IMSCyan'/>} label="merge - conflict" />
              </div>
            </div>
            <InfoCard 
              title="Repo / PR / Commit" 
              value="repo: scrubbe/payments-api" 
              list={["pr: #131", "sha: d00df00"]}
            />
          </div>
          <div className="bg-black border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-white tracking-widest mb-3">Incident title</h3>
            <p className="text-sm font-semibold text-slate-200">Merge conflict detected — Add new policy evaluator</p>
          </div>
        </section>      

      </div>
    </div>
  );
};

// Sub-components for cleaner structure
const InfoCard = ({ title, value, sub, list }:any) => (
  <div className="bg-black border border-slate-800 rounded-2xl p-6 flex flex-col gap-2 group hover:border-cyan-500/30 transition-colors">
    <h3 className="text-sm font-black text-white tracking-widest">{title}</h3>
    <p className="text-sm text-slate-100 break-all">{value}</p>
    {sub && <p className="text-sm text-white mt-1">{sub}</p>}
    {list && list.map((item:string, i:number) => (
      <p key={i} className="text-sm text-slate-400 font-medium">{item}</p>
    ))}
  </div>
);

const Badge = ({ icon, label }:any) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-900/50 text-[11px] font-bold text-slate-300">
    {icon} {label}
  </div>
);

export default IncidentDetails;