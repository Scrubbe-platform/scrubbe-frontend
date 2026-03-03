import { Activity, GitBranch, Trash2,Lock } from 'lucide-react';
import React, { ReactNode } from 'react'

const RightContent = () => {
  return (
    <div>
        <div className="w-[400px] p-6 overflow-y-auto bg-[#030D25]">
        <div className="w-full mx-auto space-y-8">
          
          {/* HEADER */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-base font-bold text-white">Admin status</h1>
              <p className="text-[#94A3B8] text-base">Health + audit of configuration changes.</p>
            </div>
            <button className="p-2 text-[#94A3B8] hover:text-red-400 transition-colors">
              <Trash2 size={20} />
            </button>
          </div>

          {/* STATUS CARDS SECTION */}
          <div className="border border-neutral-500 rounded-2xl p-3 space-y-2">
            <StatusRow icon={<Activity size={16} className='text-green'/>} label="Listener health" value="Ok" />
            <StatusRow icon={<GitBranch size={16} className='text-orange-400'/>} label="Delivery ingestion" value="Connected" />
            <StatusRow icon={<Lock size={16} className='text-lime-400'/>} label="SSO" value="Not configured" isWarning />
          </div>

          {/* RECENT SETTINGS CHANGES */}
          <section className="border border-neutral-500 rounded-2xl p-3 space-y-2">
            <h3 className="text-base font-bold text-white">Recent settings changes</h3>
            <p className="text-sm text-[#64748B]">Saved sections appear here.</p>
            <div className="py-4 text-[#94A3B8] italic text-sm">No changes yet.</div>
          </section>

          {/* ONBOARDING STEPS */}
          <section className="border border-neutral-500 rounded-2xl p-4 space-y-2">
            <h3 className="text-lg font-bold text-white">Next steps for enterprise onboarding</h3>
            <ul className="space-y-4">
              <OnboardingItem number="1" text="Configure Git provider + CI source (Delivery Ingestion)." />
              <OnboardingItem number="2" text="Set policies (auto-suggest threshold, merge approval)." />
              <OnboardingItem number="3" text="Configure SSO + SCIM (Security & SSO)." />
              <OnboardingItem number="4" text="Set notification routes (Slack + approvals)." />
              <OnboardingItem number="5" text="Validate in a sandbox repo before production." />
            </ul>
          </section>

        </div>
      </div>
    </div>
  )
}

const StatusRow = ({ icon, label, value, isWarning }: {icon:ReactNode, label:string, value: string, isWarning?: boolean}) => (
    <div className="flex justify-between items-center rounded-xl">
      <div className="flex items-center gap-3 px-3 py-1.5 border border-neutral-500 rounded-lg">
        <span className="text-[#00CAD8]">{icon}</span>
        <span className="text-sm font-bold text-white">{label}</span>
      </div>
      <div className={`px-4 py-1.5 rounded-lg border border-neutral-500 text-sm font-medium ${isWarning ? 'text-[#94A3B8]' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
  
  const OnboardingItem = ({ number, text }: {number:string, text:string}) => (
    <li className="flex gap-4 group">
      <span className="text-[#64748B] font-mono text-sm pt-0.5">{number}.</span>
      <p className="text-[#D1D5DB] text-base leading-relaxed group-hover:text-white transition-colors cursor-default">
        {text}
      </p>
    </li>
  );

export default RightContent