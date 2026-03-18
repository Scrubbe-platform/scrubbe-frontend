import React, { ReactNode } from 'react'

const SettingWrapper = ({title, description, sub, children}: {title:string, description:string, sub:string, children: ReactNode}) => {
  return (
    <div className='border rounded-xl border-IMSCyan/50 p-4 bg-[#030D25] space-y-1'>
        <p className='text-lg text-white font-bold'>{title}</p>
        <p className='text-sm text-white'>{description}</p>
        <p className='text-sm text-white'>{sub}</p>
        {children}
    </div>
  )
}

export default SettingWrapper