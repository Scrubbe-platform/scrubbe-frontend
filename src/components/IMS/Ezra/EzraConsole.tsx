import React from 'react';
import { Plus, Send, Terminal, BarChart3, ListTree, ShieldAlert, History, Code2, Gauge, ShieldCheck } from 'lucide-react';
import { CiClock2, CiGift } from "react-icons/ci";
import { GoGitBranch } from 'react-icons/go';
import { BsShieldExclamation } from 'react-icons/bs';
import { FiMessageSquare, FiShield } from 'react-icons/fi';
import { IoCodeSlashSharp } from 'react-icons/io5';
import { AiOutlineLineChart } from 'react-icons/ai';
import AiStarIcon from '@/components/icons/ai-star';

export default function EzraConsole() {
  return (
    <div className="min-h-screen text-slate-300 p-6 font-sans antialiased">
      {/* Top Header Navigation */}
      <header className="flex justify-between items-center mb-8">
        <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          Ezra <span className="text-slate-500 font-normal">• Incident Counsel</span>
        </h1>
        <p className='text-sm'>Ask Ezra about incidents, MTTR, risk, and fraud impact — it answers differently for leadership and for hands-on analysts.</p>
       
        </div>
         <div className="flex gap-3">
          <NavBadge icon={<GoGitBranch color='#FF8181' size={14} />} label="Code Engine" />
          <NavBadge icon={<CiClock2 size={14} color='#EABD08' />} label="MTTR & SLOs" />
          <NavBadge icon={<BsShieldExclamation color="#7599EC" size={14} />} label="Fraud & risk" />
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
        {/* Left Column: Sessions */}
        <aside className="col-span-3 border border-white/10 rounded-2xl bg-[#030a1c] p-5 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="uppercase text-sm text-slate-300">Sessions</h2>
            <button className="flex items-center gap-1 px-3 py-1 b text-IMSCyan border border-IMSCyan rounded-lg text-xs font-bold transition-all">
              <Plus size={14} /> New
            </button>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto">
            <SessionCard title="INC 311 . DB Pool to exhaustion" subtitle="Linked to Code Engine & pipeline 311" active />
            <SessionCard title="Org-Wide Reliability" subtitle="MTTR trend last 90 days" />
            <SessionCard title="Fraud Spike in Checkout" subtitle="Loss exposure & playbook" />
          </div>

          <div className="border-t border-white/5 pt-4 space-y-4">
             <div className="space-y-2">
               <h3 className="text-sm font-black text-slate-300">Quick prompts</h3>
               <p className="text-[11px] text-slate-200 flex gap-1 items-center"><FiMessageSquare/>Leadership view of INC-311</p>
               <p className="text-[11px] text-slate-200 flex gap-1 items-center"><IoCodeSlashSharp/>Analyst breakdown of SREs</p>
               <p className="text-[11px] text-slate-200 flex gap-1 items-center"><FiShield/>Fraud risk from this incident</p>
             </div>
          </div>
          <div className="border-t border-white/5 pt-4 space-y-4">
             <div className="space-y-2">
               <h3 className="text-sm font-black text-slate-300 ">Input behaviour</h3>
               <p className="text-[11px] text-slate-400">Enter = send <br/> Shift+Enter = new line</p>
             </div>
          </div>
        </aside>

        {/* Center Column: Chat Interface */}
        <section className="col-span-5 flex flex-col border border-cyan-500/20 rounded-2xl bg-[#030a1c] relative overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              
              <span className="text-xs"><span className='text-green'>ezra</span> @ <span className='text-IMSCyan'>scrubbe</span> / INC-311</span>
            </div>
            <div className="flex gap-2">
              <div className='flex items-center gap-2 border-green text-green rounded-md border text-sm px-2 py-0.5'>
               <CiGift size={18}/> Leadership
              </div>
               <span className="text-sm px-2 py-0.5 rounded border border-slate-700 text-slate-400 flex items-center gap-2 ">
               <AiOutlineLineChart size={18}/>
                Analyst View</span>
            </div>
          </div>

          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16  flex items-center justify-center mb-4">
             <img src="/IMS/icons/star.svg" alt="ezrastar1.svg"  className=" size-16" />
             </div>
             <p className="max-w-xs text-sm text-slate-500 leading-relaxed italic">
               Ezra is wired into incident metrics, logs, and fraud telemetry. Ask a question to start signal provenance.
             </p>
          </div>

          <div className="p-4 bg-gradient-to-t from-black/40 to-transparent">
            <div className="relative group">
              <input 
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-4 px-12 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                placeholder="Ask Ezra to summarise incidents for today"
              />
              <div>
                <img src="/IMS/icons/star.svg" alt="ezrastar1.svg"  className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 size-5" />
              </div>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400">
                <Send size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Context & Metrics */}
        <aside className="col-span-4 space-y-3 overflow-y-auto pr-2">
          <div className="border border-white/10 rounded-2xl bg-[#030a1c] p-5 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-white">Live incident context</h2>
              <span className="text-sm text-green-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> synced from Scrubbe
              </span>
            </div>

            <div className="space-y-3">
              <ContextRow label="Incident" value="INC-311" />
              <ContextRow label="Service" value="checkout-service" />
              <ContextRow label="Region" value="eu-west-1" />
              <ContextRow label="Status" value="Investigating" valueColor="text-yellow-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <MetricBox label="MTTR (target)" value="25 min" subValue="projected < 10 min with fix" subValueColor="text-green-500" />
               <MetricBox label="Customer impact" value="Moderate" subValue="checkout latency, no data loss" />
               <MetricBox label="Fraud exposure" value="Low" subValue="controls stayed intact" />
               <MetricBox label="Code Engine signal" value="0.96" subValue="confidence in config fix" subValueColor="text-green-500" />
            </div>
          </div>

          <div className="border border-white/10 rounded-2xl bg-[#030a1c] p-5">
            <div className='flex items-center justify-between'>
            <h3 className="text-sm font-bold text-white mb-4">Ezra output focus</h3>
            <div className='flex items-center gap-2 border-green text-green rounded-md border text-xs w-fit p-1'>
               <CiGift size={18}/> Leadership
            </div>
            </div>
            <div className='text-sm mt-2'>
                <p>Leadership framing: revenue, customer trust and time-to-stable are prioritised. Ezra will speak in impact and risk language.</p>    
                <ul className='pl-3 list-disc'>
                    <li>Clear view of impact, blast radius and exposure.</li>
                    <li>Simple narrative: what happened, are we in control, when are we stable.</li>
                    <li>Explicit next steps and owner for follow-up work.</li>
                </ul>
            </div>            
          </div>

          <div className="border border-white/10 rounded-2xl bg-[#030a1c] p-5">
            <h3 className="text-xs font-bold text-white mb-4">Quick prompts</h3>
            <div className="grid grid-cols-2 gap-2">
              <PromptButton icon={<ListTree size={14} />} label="CI/CD" />
              <PromptButton icon={<BarChart3 size={14} />} label="Metrics" />
              <PromptButton icon={<Terminal size={14} />} label="Logs" />
              <PromptButton icon={<ShieldAlert size={14} />} label="Fraud signals" />
              <PromptButton icon={<History size={14} />} label="Incident History" />
            </div>
          </div>

          <div className="border border-white/10 rounded-2xl bg-[#030a1c] p-5">
            <div className='flex items-center justify-between'>
            <h3 className="text-sm font-bold text-white mb-4">Ezra response behaviour</h3>
            
            </div>
            <div className='text-sm mt-2'>
                 Typical response 2–6s (includes Code Engine + telemetry fetch). Guardrails always apply before any fix.
            </div>            
          </div>

        </aside>
      </main>
    </div>
  );
}

type Status = 'Investigating' | 'Resolved' | 'Open';

interface IncidentContext {
  id: string;
  service: string;
  region: string;
  status: Status;
}

interface MetricCard {
  label: string;
  value: string;
  subValue?: string;
  subValueColor?: string;
}

const NavBadge = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-full bg-white/[0.03] text-xs hover:bg-white/[0.08] cursor-pointer transition-all">
      {icon} <span className="text-slate-400">{label}</span>
    </div>
  );
  
  const SessionCard = ({ title, subtitle, active = false }: { title: string, subtitle: string, active?: boolean }) => (
    <div className={`p-4 rounded-xl border transition-all cursor-pointer ${active ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/5 bg-transparent hover:bg-white/[0.02]'}`}>
      <h4 className="text-xs font-bold text-white mb-1">{title}</h4>
      <p className="text-sm text-slate-500 tracking-tight">{subtitle}</p>
    </div>
  );
  
  const ContextRow = ({ label, value, valueColor = "text-white" }: { label: string, value: string, valueColor?: string }) => (
    <div className="flex justify-between items-center">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-bold ${valueColor}`}>{value}</span>
    </div>
  );
  
  const MetricBox = ({ label, value, subValue, subValueColor = "text-slate-500" }: MetricCard) => (
    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
      <p className="text-sm text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
      {subValue && <p className={`text-[9px] leading-tight ${subValueColor}`}>{subValue}</p>}
    </div>
  );
  
  const PromptButton = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <button className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 border border-white/5 rounded-lg text-sm font-bold text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 transition-all">
      {icon} {label}
    </button>
  );