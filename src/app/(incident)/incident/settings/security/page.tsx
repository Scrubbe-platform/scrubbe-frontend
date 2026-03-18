import React from 'react'
import SettingWrapper from '../_module/setting-wrapper'
import { ShieldCheck, Mail, Globe, Key, Activity, Users, Lock } from 'lucide-react'
import { Switch } from '@heroui/react'
import CButton from '@/components/ui/Cbutton'

const page = () => {
  return (
    <div>
      <SettingWrapper title='Security' description='Identity, SSO, provisioning, and network controls' sub='This section is critical for enterprise onboarding.'>
        <div className="grid grid-cols-2 gap-8 items-start mb-8 pt-4">

          {/* LEFT: SSO CONFIG */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-6 space-y-6">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-white font-bold text-[17px]">Single Sign-On (SSO)</h3>
              <button className="text-[#00CAD8] border border-[#00CAD8] px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">
                Configure
              </button>
            </div>

            <p className="text-[#64748B] text-xs leading-relaxed px-1">
              SAML 2.0 or OIDC. Domain discovery via “work email”.
            </p>

            <div className="p-5  border border-neutral-500 rounded-2xl space-y-4">
              {/* STATUS ROW */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <ShieldCheck size={14} className="text-[#4ADE80]" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Status</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <div className="w-4 h-[2px] bg-[#64748B]" />
                  <span className="text-[11px] font-bold text-[#D1D5DB]">Not Configured</span>
                </div>
              </div>

              {/* DISCOVERY ROW */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <Mail size={14} className="text-[#A5B4FC]" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Discovery domain</span>
                </div>
                <div className="px-4 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50 text-[11px] font-mono text-[#D1D5DB]">
                  acme.com
                </div>
              </div>

              {/* ENFORCEMENT ROW */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <Lock size={14} className="text-[#4ADE80]" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Status</span>
                </div>
                <Switch checked={true} size='sm' color="success" />
              </div>
            </div>

            <p className="text-[#64748B] text-[11px] leading-relaxed italic px-1">
              When enabled: non-SSO logins are blocked (except break-glass admins).
            </p>
          </section>

          {/* RIGHT: NETWORK & API */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-6 space-y-4">
            <h3 className="text-white font-bold text-[17px] px-1">Network & API keys</h3>

            {/* IP ALLOWLIST */}
            <div className="p-5  border border-neutral-500 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <Globe size={14} className="text-red-500" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">IP allowlist</span>
                </div>
                <button className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-[#00CAD8]/5">
                  Edit
                </button>
              </div>
              <p className="text-[#64748B] text-xs">Limit admin access and execution to corporate IP ranges.</p>
            </div>

            {/* API KEYS */}
            <div className="p-5  border border-neutral-500 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <Key size={14} className="text-[#A5B4FC]" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">API keys</span>
                </div>
                <button className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-[#00CAD8]/5">
                  Manage
                </button>
              </div>
              <p className="text-[#64748B] text-xs leading-normal">Used for webhooks, agents, and integration callbacks.</p>
            </div>

            {/* AUDIT LOGGING */}
            <div className="p-5  border border-neutral-500 rounded-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50">
                  <Activity size={14} className="text-[#F472B6]" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Audit logging</span>
                </div>
              </div>
              <Switch checked={true} size='sm' color="success" />
            </div>
            <p className="text-[#64748B] text-[10px] px-1">All changes in Settings and all execution decisions are logged.</p>
          </section>
        </div>

        {/* BOTTOM: PROVISIONING */}
        <section className="bg-transparent border border-neutral-500 rounded-[24px] p-6 space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-white font-bold text-[17px]">Provisioning (SCIM)</h3>
            <button className="text-[#00CAD8] border border-[#00CAD8] px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#00CAD8]/5 transition-all">
              Configure
            </button>
          </div>
          <p className="text-[#64748B] text-xs px-1">Auto-provision users from Okta/AzureAD, deprovision on offboarding.</p>

          <div className="p-4  border border-neutral-500 rounded-2xl flex gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50 text-[11px] text-[#D1D5DB] font-bold uppercase tracking-widest">
              <div className="w-3 h-[2px] bg-[#64748B]" />
              SCIM: Not configured
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 border border-neutral-500 rounded-full bg-[#0B1224]/50 text-[11px] text-[#D1D5DB] font-bold uppercase tracking-widest">
              <Users size={14} className="text-[#A5B4FC]" />
              JIT: Enabled
            </div>
          </div>
        </section>

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