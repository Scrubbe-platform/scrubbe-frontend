import React from 'react';
import { 
  Link2, 
  XCircle, 
  Minus, 
  ExternalLink, 
  GitBranch, 
  FileCode2, 
  Hash 
} from 'lucide-react';

const LinksThatOpen = () => {
  return (
    <div className="border rounded-xl border-IMSCyan/40 p-5 text-slate-300 bg-gradient-to-b from-[#0074834D] to-[#004B571A] flex items-center justify-center">
      <div className="w-full">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">5) Links that open</h2>
            <p className="text-lg text-slate-300 font-medium mt-4">Signals & artifacts (clickable)</p>
            <p className="text-base text-slate-500">URLs are clickable for faster investigation</p>
          </div>
          <button className="p-2 bg-slate-900/80 border border-slate-800 rounded-full hover:bg-slate-800 transition-colors">
            <Minus size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          
          {/* Artifacts Card */}
          <div className="bg-black rounded-2xl p-6 border border-slate-800 flex flex-col gap-6">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Artifacts</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <a href="https://github.example/pr/131" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-bold hover:bg-cyan-500/10 transition-colors">
                  <Link2 size={14} /> runUrl
                </a>
                <p className="text-xs text-slate-500 font-mono pl-1">https://github.example/pr/131</p>
              </div>

              <div className="space-y-2">
                <a href="https://github.example/pr/131/files" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-bold hover:bg-cyan-500/10 transition-colors">
                  <Link2 size={14} /> diffUrl
                </a>
                <p className="text-xs text-slate-500 font-mono pl-1">https://github.example/pr/131/files</p>
              </div>
            </div>
          </div>

          {/* Failing Units Card */}
          <div className="bg-black rounded-2xl p-6 border border-slate-800 flex flex-col gap-4">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Failing Units</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-slate-300 text-xs font-mono group cursor-pointer hover:border-yellow-500/50 transition-colors">
                <XCircle size={14} className="text-yellow-500" />
                src/policy/policyEngine.ts
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-slate-300 text-xs font-mono group cursor-pointer hover:border-yellow-500/50 transition-colors">
                <XCircle size={14} className="text-yellow-500" />
                src/routes/incidents.routes.ts
              </div>
            </div>
          </div>
        </div>

        {/* Signal List Footer Card */}
        <div className="bg-black rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-4">Signal list</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-700 bg-slate-900/50 text-xs font-medium text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              repo : scrubbe/payments-api
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-700 bg-slate-900/50 text-xs font-medium text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              Pr: #131
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-700 bg-slate-900/50 text-xs font-medium text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              sha: d00df00
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LinksThatOpen;