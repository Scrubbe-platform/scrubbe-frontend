import AiStarIcon from '@/components/icons/ai-star';
import CButton from '@/components/ui/Cbutton';
import { Building, ShieldCheck } from 'lucide-react'
import React, { ReactNode } from 'react'
import { FaCodeBranch } from "react-icons/fa";
import Sidebar from './_module/sidebar';
import RightContent from './_module/right-content';

const layout = ({children}:{children:ReactNode}) => {
  return (
    <div className='bg-dark min-h-screen p-6'>
        <div className='flex justify-between items-center'>
            <p className='text-xl font-bold text-white'>Settings</p>

            <div className='flex items-center gap-5'>
                <div className='text-sm flex items-center gap-2 border rounded-lg px-2 py-1'>
                    <Building className='text-yellow-400 size-4'/>
                    <p className='text-white'>Company name</p>
                </div>

                <div className='text-sm flex items-center gap-2 border rounded-lg px-2 py-1'>
                    <ShieldCheck className='text-emerald-400 size-4'/>
                    <p className='text-white'>Security: Standard</p>
                </div>

                <div className='text-sm flex items-center gap-2 border rounded-lg px-2 py-1'>
                    <FaCodeBranch className='text-orange-400 size-4'/>
                    <p className='text-white'>Delivery: Connected</p>
                </div>

                <CButton className='w-fit border bg-transparent border-IMSCyan hover:bg-transparent'>
                    <AiStarIcon color='#06eefd'/>
                    <p className='text-IMSCyan'>What should i configure?</p>
                </CButton>
            </div>
        </div>
        <p className='text-base text-white'>
        Configure governance, integrations, delivery failure ingestion, Ezra, Code Engine, and security controls (including SSO).
        </p>

        <div className='flex mt-5 gap-5'>
            <div className=''>
                <Sidebar/>
            </div>
            <div className='flex-1'>{children}</div>
            <div className=''><RightContent/></div>
        </div>
    </div>
  )
}

export default layout