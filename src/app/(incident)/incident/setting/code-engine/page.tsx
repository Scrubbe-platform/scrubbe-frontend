import React, { ReactNode } from 'react'
import SettingWrapper from '../_module/setting-wrapper'
import { ChevronDown, GitBranch, LayoutPanelLeft, ShieldCheck } from 'lucide-react';
import Select from '@/components/ui/select';
import { Switch } from '@heroui/react';
import CButton from '@/components/ui/Cbutton';

const page = () => {
  return (
    <div>
         <SettingWrapper title='Code Engine' description='Code suggestions, guarded execution, and merges' sub='Where Scrubbe proposes patches and drives PR-based remediation.'>
         <div className="grid grid-cols-2 gap-8 items-start pt-4">
          
          {/* LEFT COLUMN: MERGE BEHAVIOR */}
          <section className="space-y-6">
            <div className="bg-transparent border border-neutal-500 rounded-[24px] p-6 space-y-6">
              <h3 className="text-white font-bold text-lg px-1">Merge behavior</h3>

              {/* ALLOWED MERGE METHOD */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-white text-sm font-medium ml-1">Allowed merge method</label>
                  <p className="text-[#64748B] text-xs ml-1">Applies when an approval is granted.</p>
                </div>
                <Select className='text-white' options={[{label:"Squash", value: "Squash"},{label:"Merge Commit", value: "Merge Commit"}, {label:"Rebase", value: "Rebase"}]}/>
              </div>

              {/* PROTECTED PATHS */}
              <div className="p-5 bg-[#020817] border border-neutal-500 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <span className="text-white text-[15px] font-bold">Protected paths</span>
                  <p className="text-[#64748B] text-xs">Touching these requires stricter approvals.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PathTag label="/policy/**" />
                  <PathTag label="/infra/**" />
                  <PathTag label="/terraform/**" />
                </div>
                <button className="text-[#00CAD8] border border-[#00CAD8] px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#00CAD8]/5 transition-all">
                  Edit
                </button>
              </div>
            </div>

            {/* VERIFICATION REQUIREMENT */}
            <div className="bg-transparent border border-neutal-500 rounded-[24px] p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-white font-bold text-lg">Verification requirement</h3>
                <p className="text-white text-sm">Before merge: CI must be green for required checks.ls.</p>
              </div>
              <div className="w-full  border border-neutal-500 p-3.5 rounded-xl text-sm text-[#D1D5DB]">
                required checks:lint, typecheck, unit
              </div>
              <button className="text-[#00CAD8] border border-[#00CAD8] px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#00CAD8]/5 transition-all">
                Configure
              </button>
            </div>
          </section>

          {/* RIGHT COLUMN: SUGGESTION GENERATION */}
          <section className="bg-transparent border border-neutal-500 rounded-[24px] p-6 space-y-6">
            <h3 className="text-white font-bold text-lg px-1">Suggestion generation</h3>

            {/* MAX SUGGESTIONS DROPDOWN */}
            <div className="space-y-3">
              <label className="text-white text-sm font-medium ml-1">Max suggestions per incident</label>
              <Select options={[{value:"1", label: "1"},{value:"3", label: "3"},{value:"5", label: "5"}]} className='text-white'/>
            </div>

            {/* TOGGLE LIST */}
            <div className="space-y-4 pt-2">
              <IconToggleRow 
                icon={<GitBranch size={16} className="text-[#F472B6]" />} 
                label="Post suggestion as PR comment" 
                active={true} 
              />
              <IconToggleRow 
                icon={<LayoutPanelLeft size={16} className="text-[#FF7ED4]" />} 
                label="Create patch branch automatically" 
                active={true} 
              />
              <IconToggleRow 
                icon={<ShieldCheck size={16} className="text-[#FDE047]" />} 
                label="Require approval when confidence < threshold" 
                active={true} 
              />
            </div>

            {/* CODE ENGINE UI PROMO */}
            <div className="mt-8 p-6 bg-[#020817] border border-neutal-500 rounded-2xl space-y-4">
              <div className="space-y-1">
                <span className="text-white text-[15px] font-bold">Open Code Engine UI</span>
                <p className="text-[#64748B] text-xs leading-normal">
                  Shows diff, affected files, risk, approvals, merge action.
                </p>
              </div>
              <div className=" border border-neutal-500 p-3 rounded-xl text-[11px] text-[#D1D5DB] text-center">
                required checks:lint, typecheck, unit
              </div>
              <button className="w-full py-3 rounded-xl border border-[#00CAD8] text-[#00CAD8] font-bold text-sm hover:bg-[#00CAD8]/5 transition-all">
                Review in Code engine
              </button>
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

const PathTag = ({ label }:{label:string}) => (
  <span className="px-3 py-1.5  border border-neutal-500 rounded-lg text-xs text-[#D1D5DB] font-mono">
    {label}
  </span>
);

const IconToggleRow = ({ icon, label, active }: {icon:ReactNode, label:string, active:boolean}) => (
  <div className="flex justify-between items-center group">
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-white text-xs font-medium leading-tight max-w-[140px]">{label}</span>
    </div>
    <Switch color="success" size='sm'/>
  </div>
);

export default page