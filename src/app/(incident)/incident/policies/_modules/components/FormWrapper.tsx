import CButton from '@/components/ui/Cbutton';
import React, { ReactNode } from 'react'

const FormWrapper = ({
    subtitle,
    title,
    label,
    children,
    actionText,
    action
  }: {
    subtitle: string;
    label: string;
    children: ReactNode;
    title: string;
    actionText?: ReactNode;
    action?:() => void
  }) => (
    <div
      className={`bg-gradient-to-b from-[#0074834D] to-[#004B571A] border rounded-xl transition-all border-IMSCyan/40 overflow-clip`}
    >
      <div className="p-4 border-b border-[#1F2937] flex justify-between ">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {title}
          </h2>
          <p className="text-white font-medium text-sm max-w-lg">{subtitle}</p>
          <p className="text-neutral-300 text-sm max-w-lg">{label}</p>
          
        </div>
        {actionText && <CButton onClick={action} className='border border-IMSCyan bg-transparent hover:bg-transparent text-IMSCyan w-fit h-8'>{actionText}</CButton>}
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );

export default FormWrapper

  