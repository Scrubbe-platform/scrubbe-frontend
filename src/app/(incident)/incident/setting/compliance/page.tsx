import React from 'react'
import SettingWrapper from '../_module/setting-wrapper'
import { ChevronDown } from 'lucide-react'
import Select from '@/components/ui/select'
import CButton from '@/components/ui/Cbutton'

const page = () => {
  return (
    <div>
          <SettingWrapper title='Compliance' description='Retention, exports, and evidence packs' sub='Enable evidence export for audits and regulated teams.'>
          <div className="grid grid-cols-2 gap-4 items-start mb-16 pt-4">
          
          {/* LEFT COLUMN: RETENTION */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-4">
            <h3 className="text-white font-bold text-[17px] px-1">Retention</h3>

            {/* DECISION LOG RETENTION */}
            <div className="space-y-3">
              <label className="text-[#94A3B8] text-sm font-medium ml-1">Decision log retention</label>
              <div className="relative group">
                <Select options={[
                  {value: "30 days", label: "30 days"},
                  {value: "90 days", label: "90 days"},
                  {value: "365 days", label: "365 days"},
                  {value: "7 years", label: "7 years"},
                ]} className='text-white'/>
              </div>
            </div>

            {/* ARTIFACT RETENTION */}
            <div className="space-y-3">
              <label className="text-[#94A3B8] text-sm font-medium ml-1">Artifact retention</label>
              <div className="relative group">
              <Select options={[
                  {value: "off", label: "off"},
                  {value: "30 days", label: "30 days"},
                  {value: "90 days", label: "90 days"},
                ]} className='text-white'/>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: EVIDENCE PACKS */}
          <section className="space-y-6">
            <div className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-6">
              <div className="space-y-1 px-1">
                <h3 className="text-white font-bold text-[17px]">Evidence packs</h3>
                <p className="text-[#64748B] text-sm font-medium">Security defaults applied org-wide.</p>
              </div>

              {/* ONE-CLICK EXPORT CARD */}
              <div className="p-6 border border-neutral-500 rounded-[24px] space-y-5">
                <p className="text-[#D1D5DB] text-sm leading-relaxed">
                  One-click export: incident timeline, approvals, diffs, verification results.
                </p>
                <button className="w-full py-2.5 rounded-xl border border-[#00CAD8] text-[#00CAD8] font-bold text-sm hover:bg-[#00CAD8]/10 transition-all tracking-tight">
                  Configure export destination
                </button>
              </div>

              {/* PII REDACTION TOGGLE */}
              <div className="p-6 border border-neutral-500 rounded-[24px] flex justify-between items-center group hover:border-[#4ADE80]/30 transition-all">
                <div className="space-y-1">
                  <span className="text-white text-[15px] font-bold">PII redaction on export</span>
                  <p className="text-[#64748B] text-sm font-medium">Recommended.</p>
                </div>
                <div className="w-12 h-6 bg-[#4ADE80] rounded-full relative shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                  <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full transition-all" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-4">
          <CButton className='px-4 w-fit'>
            Save
          </CButton>
        </div>
        </SettingWrapper>
    </div>
  )
}

export default page