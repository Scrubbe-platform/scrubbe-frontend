"use client"
import React, { useState } from 'react';
import { CheckCircle2, List, ChevronDown } from 'lucide-react';
import SettingWrapper from '../_module/setting-wrapper';
import Select from '@/components/ui/select';
import CButton from '@/components/ui/Cbutton';
import Input from '@/components/ui/input';

const PoliciesModule = () => {
  const [threshold, setThreshold] = useState(100);

  return (
      <SettingWrapper title='Policies' description='When and how Scrubbe can act' sub='These settings are the “governor” of multi-agent orchestration.'>

        {/* HEADER */}
       

        <div className="grid grid-cols-2 gap-8 items-start pt-4">
          
          {/* LEFT COLUMN: AUTO-ACTIVATION */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-6">
            <h3 className="text-white font-bold text-lg px-1">Auto-activation</h3>

            <div className="space-y-4">
              {/* PLAYBOOKS TOGGLE */}
              <div className="p-5  border border-neutral-500 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-white text-[15px] font-bold leading-tight max-w-[180px]">
                    Auto-activate playbooks for delivery incidents
                  </span>
                  <Toggle active={true} />
                </div>
                <p className="text-[#64748B] text-xs leading-normal">
                  Creates a remediation plan immediately after incident creation.
                </p>
              </div>

              {/* CONFIDENCE SLIDER */}
              <div className="p-5  border border-neutral-500 rounded-2xl space-y-4">
                <span className="text-white text-[15px] font-bold block">
                  Confidence threshold to auto-suggest code
                </span>
                <div className="px-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-[#0B1224] rounded-lg appearance-none cursor-pointer accent-[#3EE9FF] border border-neutral-500"
                  />
                  <div className="flex justify-between text-[10px] text-[#64748B] mt-2 font-bold uppercase tracking-wider">
                    <span>0</span>
                    <span className="text-[#D1D5DB]">threshold: {threshold}%</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* SUPPRESSION RULES */}
              <div className="p-5  border border-neutral-500 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white text-[15px] font-bold">Suppression rules</span>
                  <button className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">
                    Edit
                  </button>
                </div>
                <p className="text-[#64748B] text-xs">Reduce noise when flake storms or repeated failures happen.</p>
                <div className="flex items-center gap-3 p-2.5 border border-neutral-500 rounded-xl bg-[#0B1224]/50">
                  <List size={14} className="text-[#A5B4FC]" />
                  <span className="text-[11px] text-[#D1D5DB]">suppress after 5 repeats / 10 min</span>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: HUMAN GATES */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-6 space-y-6">
            <div className="space-y-1 px-1">
              <h3 className="text-white font-bold text-lg">Human gates + blast radius</h3>
              <p className="text-[#64748B] text-xs">Security defaults applied org-wide.</p>
            </div>

            <div className="space-y-4">
              <GateToggle label="Require approval for merges" active={true} />
              <GateToggle label="Production actions require approval" active={true} />

              {/* BLAST RADIUS LIMITS */}
              <div className="p-6  border border-neutral-500 rounded-2xl space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-white text-[15px] font-bold">Blast radius limits</span>
                  <button className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">
                    Configure
                  </button>
                </div>
                <p className="text-[#64748B] text-xs">Prevent large-scale changes by default.</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">Max services per execution</label>
                    <Input className='text-white'/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">Max env scope</label>
                    <Select className='text-white' options={[{value: "PR-only", label: "PR-only"}, {value: "Staging only", label: "Staging only"}, {value: "Production (gated)", label: "Production (gated)"}]} />
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
  );
};

/* --- COMPONENTS --- */

const Toggle = ({ active }:{active:boolean}) => (
  <button className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${active ? 'bg-[#4ADE80]' : 'bg-neutral-500'}`}>
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${active ? 'left-7' : 'left-1'}`} />
  </button>
);

const GateToggle = ({ label, active }:{label:string, active:boolean}) => (
  <div className="p-5  border border-neutral-500 rounded-2xl space-y-3">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-xl bg-[#0B1224]/50">
        <CheckCircle2 size={16} className="text-red-500" />
        <span className="text-xs font-bold text-white">{label}</span>
      </div>
      <Toggle active={active} />
    </div>
    <p className="text-[#64748B] text-xs leading-normal">
      {label === "Require approval for merges" 
        ? "Even if a patch is safe, humans should approve merging to main."
        : "Block “execute” in production unless approver signs off."}
    </p>
  </div>
);


export default PoliciesModule;