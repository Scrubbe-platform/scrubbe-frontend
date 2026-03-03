import React, { ReactNode } from 'react'
import SettingWrapper from '../_module/setting-wrapper'
import { CheckCircle2, ChevronDown, Circle, Dna, Hash, ShieldAlert, ShieldCheck, Sparkles, Star } from 'lucide-react';
import Select from '@/components/ui/select';
import { Switch } from '@heroui/react';

const page = () => {
  return (
    <div>
         <SettingWrapper title='Ezra' description='Narratives for analysts and executives' sub='Control who sees what, and where summaries are delivered.'>
         <div className="grid grid-cols-2 gap-8 items-start pt-4">
          
          {/* LEFT COLUMN: AUDIENCE & CHANNELS */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-4">
            <h3 className="text-white font-bold text-lg px-1">Audience outputs</h3>
            
            <div className="space-y-4">
              <ToggleRow 
                icon={<Dna size={16} className="text-[#F472B6]" />} 
                label="Analyst summary enabled" 
                active={true} 
              />
              <ToggleRow 
                icon={<CheckCircle2 size={16} className="text-[#EF4444]" />} 
                label="Executive summary enabled" 
                active={true} 
              />
              <ToggleRow 
                icon={<ShieldCheck size={16} className="text-[#4ADE80]" />} 
                label="Risk/Fraud lens enabled" 
                active={true} 
              />
            </div>

            {/* MAX SERVICES SELECT */}
            <div className="space-y-3 pt-2">
              <Select
              className='text-white' 
              labelClassName='text-white'
              label='Executive format' 
              options={[
                {value: "1 Paragragh + bullets + ETA", label: "1 Paragragh + bullets + ETA"},
                {value: "Board Style narrative", label: "Board Style narrative"},
                {value: "Short status update", label: "Short status update"},
              ]}/>
            </div>

            {/* DELIVERY CHANNEL */}
            <div className="p-5 border border-neutral-500 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white text-[15px] font-bold">Delivery summary channel</span>
                <button className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">
                  Change
                </button>
              </div>
              <p className="text-[#64748B] text-xs leading-normal">Where executive updates go.</p>
              <div className="flex items-center gap-3 p-2.5 border border-neutral-500 rounded-xl bg-[#0B1224]/50">
                <Hash size={14} className="text-[#FDE047]" />
                <span className="text-[11px] text-[#D1D5DB] font-mono">#eng-leadership</span>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: DATA EXPOSURE */}
          <section className="space-y-6">
            <div className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-6">
              <div className="space-y-1 px-1">
                <h3 className="text-white font-bold text-lg">Data exposure controls</h3>
                <p className="text-[#64748B] text-xs font-medium">Security defaults applied org-wide.</p>
              </div>

              <div className="p-4 border border-neutral-500 rounded-2xl space-y-5">
                <p className="text-[#D1D5DB] text-sm leading-relaxed">
                  Prevent sensitive content from appearing in executive summaries.
                </p>
                <div className="flex flex-wrap gap-2">
                  <MaskTag label="mask: secrets" />
                  <MaskTag label="mask: PII" />
                  <MaskTag label="hide: stack traces" />
                </div>
                <button className="text-[#00CAD8] border border-[#00CAD8] px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#00CAD8]/5 transition-all">
                  Edit
                </button>
              </div>
            </div>

            {/* FULL VIEW CARD */}
            <div className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Open Ezra full view</h3>
                <button className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">
                  Open Ezra
                </button>
              </div>
              <p className="text-[#64748B] text-xs leading-relaxed max-w-[200px]">
                Preview analyst/executive outputs and charts.
              </p>
            </div>
          </section>
        </div>

        {/* SAVE BUTTON */}
        <div className="mt-12 flex justify-end">
          <button className="bg-[#3EE9FF] text-black px-12 py-3.5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-[0_0_25px_rgba(62,233,255,0.4)] hover:brightness-110 active:scale-95 transition-all">
            Save
          </button>
        </div>
        
           </SettingWrapper>
    </div>
  )
}

const ToggleRow = ({ icon, label, active }:{icon:ReactNode, label:string, active:boolean}) => (
  <div className="flex justify-between items-center p-3.5 border border-neutral-500 rounded-2xl group hover:border-[#00CAD8]/30 transition-all">
    <div className="flex items-center gap-3">
      <div className="p-2 border border-neutral-500 rounded-xl bg-[#0B1224]/50">
        {icon}
      </div>
      <span className="text-white text-xs font-bold">{label}</span>
    </div>
    <Switch color="success" checked={active} size='sm' />
  </div>
);

const MaskTag = ({ label }:{label:string}) => (
  <span className="px-3 py-1.5 bg-[#0B1224] border border-neutral-500 rounded-lg text-[10px] font-bold text-[#D1D5DB] font-mono tracking-tight">
    {label}
  </span>
);
export default page