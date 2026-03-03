import React from 'react';
import { 
  BeakerIcon, 
  HammerIcon, 
  GitPullRequestIcon, 
  GitMergeIcon, 
  RocketIcon, 
  SearchIcon, 
  CheckCircle2,
  RefreshCcw,
  ArrowRight,
  Check
} from 'lucide-react'; // Using lucide-react for the icons

const DeliverySignal = () => {
  return (
    <div className="pt-5">
      <div className="w-full mx-auto bg-gradient-to-b text-white from-[#0074834D] to-[#004B571A] border rounded-xl transition-all border-IMSCyan/40 p-6 shadow-2xl">
        
        {/* Top Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Incoming delivery signals</h1>
            <p className="text-sm text-white">Ingest latest CI/CD and PR failure signals</p>
            <p className="text-[13px] text-white max-w-2xl leading-relaxed mt-2">
              In production, integrations deliver these automatically. Buttons below drive the UI so devs can understand the analyst workflow.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg text-[11px] font-bold uppercase tracking-wider">
              <span className="text-yellow-500">≡</span> Policy mode : Standard
            </div>
            <button className="px-4 py-1.5 bg-transparent border border-IMSCyan text-IMSCyan rounded-lg text-sm font-bold transition-colors">
              Toggle Stricter
            </button>
            <button className="px-3 py-1.5 border border-IMSCyan rounded-lg hover:bg-slate-800 transition-colors">
              <RefreshCcw className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Signal Simulation Buttons */}
        <div className="flex flex-wrap gap-3 mb-10">
          <SignalButton icon={<BeakerIcon size={14} />} color="bg-[#eab308]" label="CI failed (tests)" textColor="text-black" />
          <SignalButton icon={<HammerIcon size={14} />} color="bg-[#eab308]" label="CI failed (build)" textColor="text-black" />
          <SignalButton icon={<GitPullRequestIcon size={14} />} color="bg-[#f43f5e]" label="PR Checks failed" />
          <SignalButton icon={<GitMergeIcon size={14} />} color="bg-[#f43f5e]" label="Merge Conflicts" />
          <SignalButton icon={<RocketIcon size={14} />} color="bg-[#06b6d4]" label="Deployed Failed ( Staging )" />
          <SignalButton icon={<SearchIcon size={14} />} color="bg-[#d946ef]" label="Flaky tests detected" />
        </div>

        {/* Trace Section */}
        <div className="border border-slate-400 rounded-xl p-3 relative">
          <div className="flex justify-between items-center mb-6">
            <div className="">
              <h2 className="text-2xl font-medium text-white">Trace</h2>
              <p className="text-sm text-slate-300 font-medium">Stages update from decision log + incident state.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-[11px] text-green-400 font-bold">
              Incident raised <Check className='text-green' size={12} />
            </div>
          </div>

          {/* Trace Steps Flow */}
          <div className="flex flex-wrap gap-3 items-center">
            <TraceStep title="Event received" sub="Webhook/pipeline signal ingested" />
            <ArrowRight className="text-white" size={18} />
            
            <TraceStep title="Incident created/updated" sub="Correlation + dedup applied" />
            <ArrowRight className="text-white" size={18} />

            <TraceStep title="Signals bound" sub="Logs, jobs, PR, commit, artifacts" />
            <ArrowRight className="text-white" size={18} />

            <TraceStep title="Playbook selected" sub="Delivery-incident playbook" />
            <ArrowRight className="text-white" size={18} />

            <TraceStep title="Policy decision" sub="Auto-activate? Gate? Scope" />
            <ArrowRight className="text-white" size={18} />
          </div>
          
          <div className="mt-4">
             <TraceStep title="Remediation + verification" sub="Suggest → verify → summarize" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SignalButton = ({ icon, color, label, textColor = "text-white" }:any) => (
  <button className={`flex items-center gap-2 px-3 py-1.5 ${color} ${textColor} rounded-md text-[11px] font-black uppercase tracking-tight hover:opacity-90 transition-opacity`}>
    {icon} {label}
  </button>
);

const TraceStep = ({ title, sub }:any) => (
  <div className="w-[230px] border border-green rounded-lg p-3 group hover:border-cyan-500/50 transition-colors">
    <p className="text-sm font-bold text-white mb-1">{title}</p>
    <p className="text-xs text-white font-medium">{sub}</p>
  </div>
);

export default DeliverySignal