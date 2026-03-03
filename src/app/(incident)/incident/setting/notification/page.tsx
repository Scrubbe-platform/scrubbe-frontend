import React from 'react'
import SettingWrapper from '../_module/setting-wrapper'
import { Edit3, Mail, BellRing, ChevronDown, GitBranch, CheckCircle } from 'lucide-react';
import Select from '@/components/ui/select';
import Input from '@/components/ui/input';
import CButton from '@/components/ui/Cbutton';

const page = () => {
  return (
    <div>
      <SettingWrapper title='Notifications' description='Where alerts and summaries are sent' sub='Route delivery incidents and approvals to the right places.'>
        <div className="grid grid-cols-2 gap-8 items-start pt-5">

          {/* ROUTING RULES */}
          <section className="bg-transparent border border-neutral-500 rounded-lg p-4 space-y-4">
            <h3 className="text-white font-bold text-lg px-1">Routing rules</h3>

            <div className="space-y-4">
              {/* DELIVERY INCIDENTS */}
              <div className="p-4 border border-neutral-500 rounded-2xl space-y-3 group hover:border-[#00CAD8]/30 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-xl bg-[#0B1224]/50">
                    <GitBranch size={16} className="text-[#F472B6]" />
                    <span className="text-xs font-bold text-white">Delivery incidents</span>
                  </div>
                  <button className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">
                    Edit
                  </button>
                </div>
                <p className="text-[#64748B] text-xs leading-normal">
                  Send to Slack channel + create approval thread when required.
                </p>
              </div>

              {/* APPROVALS */}
              <div className="p-4 border border-neutral-500 rounded-2xl space-y-3 group hover:border-[#00CAD8]/30 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-xl bg-[#0B1224]/50">
                    <CheckCircle size={16} className="text-[#4ADE80]" />
                    <span className="text-xs font-bold text-white">Approvals</span>
                  </div>
                  <button className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">
                    Edit
                  </button>
                </div>
                <p className="text-[#64748B] text-xs leading-normal">
                  Notify approvers and log decisions to the timeline.
                </p>
              </div>
            </div>
          </section>

          {/* EMAIL FALLBACK */}
          <section className="bg-transparent border border-neutral-500 rounded-lg p-4 space-y-4">
            <h3 className="text-white font-bold text-lg px-1">Email fallback</h3>

            <div className="space-y-6">
              {/* NOTIFICATION EMAIL DROPDOWN */}
              <div className="space-y-3">
                <label className="text-white text-sm font-medium ml-1">Notification email</label>
                <div className="relative">
                 <Input className='text-white'/>
                </div>
                <p className="text-[#64748B] text-xs leading-normal px-1">
                  Used when chat/paging integrations are unavailable.
                </p>
              </div>

              {/* RATE LIMIT CARD */}
              <div className="p-4 border border-neutral-500 rounded-2xl space-y-4">
                <div className="flex justify-between">
                  <span className="text-white text-sm font-medium">Rate limit notifications</span>
                  <Select className="text-white" options={[{value: "off", label: "Off"}, {value: " 10/minute", label: "10/minute"}, {value: " 20/minute", label: "20/minute"}]}/>
                   
                </div>
                <p className="text-[#64748B] text-xs leading-normal">
                  Prevent spam during flake storms.
                </p>
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


export default page