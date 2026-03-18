import React from 'react'
import SettingWrapper from '../_module/setting-wrapper'
import { ArrowRight, Check, ChevronRight, Minus } from 'lucide-react';
import CButton from '@/components/ui/Cbutton';

const page = () => {
  return (
    <div>
        <SettingWrapper title='Integrations' description='Connect the tools Scrubbe listens to and acts on' sub='Chat, alerting, ticketing, dashboards, and webhooks.'>        
        <div className="grid grid-cols-2 gap-8 items-start pt-5">
          
          {/* MESSAGING & PAGING */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-6">
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-white font-bold text-lg">Messaging & paging</h3>
              <ArrowRight size={18} className="text-[#64748B]" />
            </div>

            <div className="space-y-4">
              {/* SLACK */}
              <div className="p-5 border border-neutral-500 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white text-[15px] font-bold">Slack</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge type="success" label="Connected" icon={<Check size={14} />} />
                    <ActionButton label="Configure" />
                  </div>
                </div>
                <p className="text-[#64748B] text-xs">Notifications + approvals + Ezra summaries.</p>
              </div>

              {/* PAGERDUTY */}
              <div className="p-5 border border-neutral-500 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white text-[15px] font-bold">PagerDuty</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge type="neutral" label="Connected" icon={<Minus size={14} />} />
                    <ActionButton label="Connect" color="cyan" />
                  </div>
                </div>
                <p className="text-[#64748B] text-xs">Escalations and on-call mapping.</p>
              </div>
            </div>
          </section>

          {/* DASHBOARDS & ISSUE TRACKING */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-6">
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-white font-bold text-lg">Dashboards & issue tracking</h3>
              <ArrowRight size={18} className="text-[#64748B]" />
            </div>

            <div className="space-y-4">
              <SimpleIntegrationCard 
                title="Datadog / Grafana" 
                desc="Attach deep links to signals and dashboards" 
                btnLabel="Configure" 
              />
              <SimpleIntegrationCard 
                title="Jira / Linear" 
                desc="Optionally mirror follow-ups into existing systems" 
                btnLabel="Configure" 
              />
              <SimpleIntegrationCard 
                title="Outgoing Webhooks" 
                desc="Stream events to internal systems." 
                btnLabel="Manage" 
              />
            </div>
          </section>
        </div>

        {/* SAVE BUTTON */}
        <div className="pt-6 flex justify-end">
          <CButton className='w-fit px-10'>
            Save
          </CButton>
        </div>       
       </SettingWrapper>
    </div>
  )
}
 
const StatusBadge = ({ type, label, icon }:any) => (
  <div className={`flex items-center gap-1.5 px-3 py-1 border rounded-full bg-[#0B1224] ${type === 'success' ? 'border-[#00CAD8]/50' : 'border-[#64748B]/40'}`}>
    <span className={type === 'success' ? 'text-[#00CAD8]' : 'text-[#64748B]'}>{icon}</span>
    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{label}</span>
  </div>
);

const ActionButton = ({ label, color }:any) => (
  <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
    color === 'cyan' 
    ? 'text-[#3EE9FF] border-[#3EE9FF] hover:bg-[#3EE9FF]/5' 
    : 'text-[#00CAD8] border-[#00CAD8] hover:bg-[#00CAD8]/5'
  }`}>
    {label}
  </button>
);

const SimpleIntegrationCard = ({ title, desc, btnLabel }:any) => (
  <div className="p-5 border border-neutral-500 rounded-2xl space-y-3 group hover:border-[#00CAD8]/30 transition-colors">
    <div className="flex justify-between items-center">
      <span className="text-white text-[15px] font-bold">{title}</span>
      <ActionButton label={btnLabel} />
    </div>
    <p className="text-[#64748B] text-xs leading-normal max-w-[200px]">{desc}</p>
  </div>
);

 export default page
