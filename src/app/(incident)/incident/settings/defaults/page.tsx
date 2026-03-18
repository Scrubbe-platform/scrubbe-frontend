import React from 'react'
import SettingWrapper from '../_module/setting-wrapper'
import { ChevronDown } from 'lucide-react';
import Select from '@/components/ui/select';
import Input from '@/components/ui/input';
import CButton from '@/components/ui/Cbutton';

const page = () => {
  return (
    <div>
        <SettingWrapper title='Defaults' description='Opinionated defaults for incident creation' sub='These shape what gets auto-filled when Scrubbe raises incidents.'>
        <div className="space-y-6 pt-5">
          
          {/* SEVERITY MAPPING */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-4">
            <h3 className="text-white font-bold text-lg">Severity mapping</h3>
            <div className="space-y-3">
              <label className="text-white text-sm font-medium ml-1">Delivery incidents default severity</label>
              <div className="relative">
                <Select className='bg-[#0B1224] text-white' options={[{value:"P4",label: "P4 - Low"},{value:"P3",label: "P3 - Medium"}, {value:"P2",label: "P2 - High"}]} />
              </div>
              <p className="text-[#64748B] text-xs leading-normal italic px-1">
                Suggestion: keep delivery incidents below P2 unless customer-impact signals are attached.
              </p>
            </div>
          </section>

          {/* DEDUPLICATION */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-6">
            <h3 className="text-white font-bold text-lg">Deduplication</h3>
            
            {/* CORRELATION KEY */}
            <div className="space-y-3">
              <label className="text-white text-sm font-medium ml-1">Correlation key</label>
              <Input className='bg-[#0B1224] text-white' placeholder='repo + pr + runId + sha'/>
                
              
              <p className="text-[#64748B] text-xs leading-normal px-1">
                Suggestion: keep delivery inControls “one incident vs spam.” incidents below P2 unless customer-impact signals are attached.
              </p>
            </div>

            {/* AUTO-CLOSE */}
            <div className="space-y-3 pt-2">
              <label className="text-white text-sm font-medium ml-1">Auto-close delivery incidents after</label>
              <Select className='bg-[#0B1224] text-white' options={[
                {value: "never", label: "Never"},
                {value: "24 hours stable", label: "24 hours stable"},
                {value: "7 days", label: "7 days"}
              ]}/>
              
            </div>
          </section>

          {/* EVIDENCE CAPTURE */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-6">
            <h3 className="text-white font-bold text-lg">Evidence capture</h3>
            <div className="space-y-4">
              <ToggleRow 
                title="Store build logs" 
                desc="Keep a cached copy for investigations." 
                defaultChecked={true} 
              />
              <ToggleRow 
                title="Store artifacts" 
                desc="Tests reports, coverage, SARIF when available." 
                defaultChecked={true} 
              />
            </div>
          </section>
        </div>

        {/* SAVE BUTTON */}
        <div className="pt-5 flex justify-end">
          <CButton className='w-fit px-4'>
            Save
          </CButton>
        </div>
        </SettingWrapper>
    </div>
  )
}
/* --- SUB-COMPONENT --- */

const ToggleRow = ({ title, desc, defaultChecked }: {title:string, desc:string, defaultChecked:boolean}) => (
  <div className="flex justify-between items-center p-5 border border-neutral-500 rounded-2xl">
    <div className="space-y-1">
      <span className="text-white text-[15px] font-bold">{title}</span>
      <p className="text-[#64748B] text-xs">{desc}</p>
    </div>
    <button className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${defaultChecked ? 'bg-[#4ADE80]' : 'bg-neutral-500'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${defaultChecked ? 'left-7' : 'left-1'}`} />
    </button>
  </div>
);


export default page