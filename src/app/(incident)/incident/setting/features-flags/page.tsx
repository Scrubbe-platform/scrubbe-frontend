import React from 'react'
import SettingWrapper from '../_module/setting-wrapper'
import { Switch } from '@heroui/switch';
import CButton from '@/components/ui/Cbutton';

const page = () => {
  return (
    <div>
         <SettingWrapper title='Feature Flags' description='Roll out capabilities safely' sub='Enable features per tenant, environment, or group.'>
         <div className="space-y-8 pt-4">
          {/* TOP ROW: TWO COLUMN CARDS */}
          <div className="grid grid-cols-2 gap-8">
            <FeatureCard 
              title="Auto-merge (gated)"
              description="Enable merge button flow after approvals + verification"
              active={true}
            />
            <FeatureCard 
              title="Rollback playbooks"
              description="Enable rollback execution engine (gated in production)."
              active={true}
            />
          </div>

          {/* BOTTOM ROW: FULL WIDTH CARD */}
          <FeatureCard 
            title="Risk/Fraud lens"
            description="Allow Ezra to produce risk-aware narratives."
            active={true}
            fullWidth={true}
          />
        </div>

        {/* SAVE BUTTON */}
        <div className="pt-6 flex justify-end">
          <CButton className="w-fit px-4">
            Save
          </CButton>
        </div>

        </SettingWrapper>
    </div>
  )
}

const FeatureCard = ({ title, description, active, fullWidth = false }: {title:string, description:string, active:boolean, fullWidth?:boolean}) => (
  <div className={`
    ${fullWidth ? 'w-full' : ''} 
    bg-transparent border border-neutral-500 rounded-xl p-4
    flex justify-between items-start transition-all hover:border-neutral-500/80
  `}>
    <div className="space-y-2 pr-4">
      <h3 className="text-white font-bold text-lg">{title}</h3>
      <p className="text-[#94A3B8] text-sm leading-relaxed max-w-[280px]">
        {description}
      </p>
    </div>
    <Switch color="success" size='sm'/>
  </div>
);

export default page