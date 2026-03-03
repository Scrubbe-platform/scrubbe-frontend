"use client"
import React, { useState } from 'react'
import SettingWrapper from '../_module/setting-wrapper'
import { CheckCircle, ChevronDown, List, Settings2, Shield } from 'lucide-react';
 import CButton from '@/components/ui/Cbutton';

const Page = () => {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionDuration, setSessionDuration] = useState("24 hrs");

  const durations = [
    { label: "8 hrs", value: "8h" },
    { label: "12 hrs", value: "12h" },
    { label: "24 hrs", value: "24h" },
    { label: "7 days", value: "7d" }
  ];

  return (
    <div>
      <SettingWrapper title='Users & Roles' description='Access model for analysts, approvers, and admins' sub='Role-based access that powers approvals, merges, and governance.' >
        
        {/* HEADER */}
      

        <div className="grid grid-cols-2 gap-8 pt-5">
          
          {/* LEFT COLUMN: ROLE TEMPLATES */}
          <div className="border border-[#1F2937] rounded-2xl p-4 space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-white font-bold text-lg">Role templates</h3>
                <p className="text-[#64748B] text-sm">You can customize these later.</p>
              </div>
              <Settings2 size={20} className="text-[#64748B]" />
            </div>

            <div className="space-y-4">
              <RoleCard 
                title="Admin" 
                badge="full control" 
                icon={<Shield size={14} className='text-emerald-400' />} 
                desc="Manage settings, integrations, security, policies, billing."
              />
              <RoleCard 
                title="Approver" 
                badge="gates execution" 
                icon={<CheckCircle size={14} />} 
                desc="Approve merges, rollbacks, and production actions."
              />
              <RoleCard 
                title="Analyst" 
                badge="investigate" 
                icon={<List size={14} />} 
                desc="Investigate delivery incidents, request approvals, generate summaries."
              />
            </div>
          </div>

          {/* RIGHT COLUMN: SESSION CONTROLS */}
          <div className="border border-[#1F2937] rounded-2xl p-4 space-y-6">
            <div className="space-y-1">
              <h3 className="text-white font-bold text-lg">Session controls</h3>
              <p className="text-[#64748B] text-sm">Security defaults applied org-wide.</p>
            </div>

            <div className="space-y-4">
              {/* MFA TOGGLE */}
              <div className="p-5 border border-[#1F2937] rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm font-medium pr-4 leading-tight">
                    Require MFA for non-SSO users
                  </span>
                  <button 
                    onClick={() => setMfaEnabled(!mfaEnabled)}
                    className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${mfaEnabled ? 'bg-[#4ADE80]' : 'bg-[#1F2937]'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${mfaEnabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <p className="text-[#64748B] text-xs leading-normal">
                  Useful during rollout before enforcing SSO.
                </p>
              </div>

              {/* SESSION DURATION DROPDOWN */}
              <div className="p-5 border border-[#1F2937] rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm font-medium">Session duration</span>
                  <div className="relative group">
                    <button className="flex items-center gap-3 bg-[#0B1224] border border-[#94A3B8]/40 px-3 py-1.5 rounded-lg text-sm text-[#D1D5DB] hover:border-[#00CAD8] transition-colors">
                      {sessionDuration}
                      <ChevronDown size={16} className="text-[#64748B]" />
                    </button>
                  </div>
                </div>
                <p className="text-[#64748B] text-xs">How long a login stays valid.</p>
              </div>

              {/* ANALYST CONFIG */}
              <div className="p-5 border border-[#1F2937] rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-white text-sm font-medium">Analyst</span>
                    <p className="text-[#64748B] text-xs leading-normal">
                      Investigate delivery incidents, request approvals, generate summaries.
                    </p>
                  </div>
                  <button className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="pt-5 flex justify-end">
          <CButton className='w-fit'>
            Save
          </CButton>
        </div>
      </SettingWrapper>
    </div>
  );
}

export default Page


const RoleCard = ({ title, badge, icon, desc }:any) => (
  <div className="p-4 border border-[#1F2937] rounded-xl space-y-3 hover:border-[#00CAD8]/40 transition-colors group">
    <div className="flex justify-between items-center">
      <span className="text-white text-sm font-bold group-hover:text-[#00CAD8] transition-colors">{title}</span>
      <div className="flex items-center gap-2 px-3 py-1 border border-[#00CAD8]/50 rounded-full bg-[#0B1224]">
        <span className="text-lime-400">{icon}</span>
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{badge}</span>
      </div>
    </div>
    <p className="text-[#64748B] text-xs leading-normal">
      {desc}
    </p>
  </div>
);

