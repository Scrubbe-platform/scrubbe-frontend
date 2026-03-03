import React, { ReactNode } from 'react'
import SettingWrapper from '../_module/setting-wrapper'
import { Book, Check, ChevronRight, Database, Minus } from 'lucide-react';
import CButton from '@/components/ui/Cbutton';

const page = () => {
  return (
    <div>
        <SettingWrapper title='CI/CD & PR Ingestion' description='Where delivery incidents come from' sub='Connect Git providers and CI to auto-raise incidents and generate safe PR-based remediation.'>
        <div className="grid grid-cols-2 gap-8 pt-5 items-start">
          
          {/* GIT PROVIDERS COLUMN */}
          <section className="bg-transparent border border-neutral-600 rounded-[24px] p-6 space-y-5">
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-white font-bold text-lg">Git providers</h3>
              <ChevronRight size={18} className="text-[#64748B]" />
            </div>

            <div className="space-y-4">
              {/* GITHUB - CONNECTED */}
              <div className="p-5 border border-neutral-600 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white text-[15px] font-bold">GitHub</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge label="Connected" icon={<Check size={14} />} />
                    <ActionButton label="Configure" />
                  </div>
                </div>
                <p className="text-[#64748B] text-xs leading-normal">Webhooks + app installation for PR/Checks events.</p>
              </div>

              <SimpleConnectCard title="GitLab" desc="Merge request hooks, pipelines, approvals." />
              <SimpleConnectCard title="Bitbucket" desc="PR status, pipelines, and merge gates." />
            </div>
          </section>

          {/* CI/CD SOURCES COLUMN */}
          <section className="bg-transparent border border-neutral-600 rounded-[24px] p-6 space-y-5">
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-white font-bold text-lg">CI/CD sources</h3>
              <ChevronRight size={18} className="text-[#64748B]" />
            </div>

            <div className="space-y-4">
              {/* GITHUB ACTIONS */}
              <div className="p-5 border border-neutral-600 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white text-[15px] font-bold">GitHub Actions</span>
                  <ActionButton label="Configure" />
                </div>
                <p className="text-[#64748B] text-xs leading-normal">Workflow run events + artifacts.</p>
              </div>

              {/* JENKINS */}
              <div className="p-5 border border-neutral-600 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white text-[15px] font-bold">Jenkins</span>
                  <ActionButton label="Connect" color="cyan" />
                </div>
                <p className="text-[#64748B] text-xs leading-normal">Build hooks + log ingestion.</p>
              </div>

              {/* ROUTING SUB-SECTION */}
              <div className="p-5 border border-neutral-600 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-white text-[15px] font-bold">Delivery incident routing</span>
                    <p className="text-[#64748B] text-xs leading-normal">Map repos/services to teams and default playbooks.</p>
                  </div>
                  <button className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">
                    Edit
                  </button>
                </div>
                
                {/* NESTED ROUTE ITEMS */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 border border-neutral-600 rounded-xl bg-[#0B1224]/50">
                    <Database size={14} className="text-[#FF7ED4]" />
                    <span className="text-[11px] text-[#D1D5DB]">payments-api <span className="mx-1 text-[#64748B]">→</span> Payments Platform</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 border border-neutral-600 rounded-xl bg-[#0B1224]/50">
                    <Book size={14} className="text-[#FDE047]" />
                    <span className="text-[11px] text-[#D1D5DB]">default: PR Checks Failure Triage</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SAVE BUTTON */}
        <div className="pt-6 flex justify-end">
          <CButton className='w-fit px-4'>
            Save
          </CButton>
        </div>

       
       </SettingWrapper>
    </div>
  )
}
 
 

/* --- ATOMIC COMPONENTS --- */

const StatusBadge = ({ label, icon }:{label:string, icon:ReactNode}) => (
  <div className="flex items-center gap-1.5 px-3 py-1 border border-[#00CAD8]/50 rounded-full bg-[#0B1224]">
    <span className="text-[#00CAD8]">{icon}</span>
    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{label}</span>
  </div>
);

const ActionButton = ({ label, color }:{label:string, color?:string}) => (
  <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
    color === 'cyan' 
    ? 'text-[#3EE9FF] border-[#3EE9FF] hover:bg-[#3EE9FF]/5' 
    : 'text-[#00CAD8] border-[#00CAD8] hover:bg-[#00CAD8]/5'
  }`}>
    {label}
  </button>
);

const SimpleConnectCard = ({ title, desc }:{title: string, desc:string}) => (
  <div className="p-5 border border-neutral-600 rounded-2xl space-y-3 group hover:border-[#00CAD8]/30 transition-colors">
    <div className="flex justify-between items-center">
      <span className="text-white text-[15px] font-bold">{title}</span>
      <ActionButton label="Connect" color="cyan" />
    </div>
    <p className="text-[#64748B] text-xs leading-normal">{desc}</p>
  </div>
);

  export default page