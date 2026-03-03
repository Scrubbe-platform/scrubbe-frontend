import CButton from '@/components/ui/Cbutton'
import { FileCode, ShieldCheck } from 'lucide-react'
import React from 'react'
import { GiOpenBook } from 'react-icons/gi'
import { HiOutlineBookOpen } from 'react-icons/hi'

const Header = () => {
  return (
    <div className='flex justify-between'>
        <div className=' space-y-2 text-white'>
            <p className='text-base font-medium'>Scrubbe • Playbooks</p>
            <p className='text-base font-medium'>Playbook Control Surface + Roadmap Add-ons</p>
            <p className=' max-w-md text-sm'>This page extends the Playbook Editor with the “fundamental add-ons” you asked for: Roadmap (v1→v3), Trust/Safety philosophy, and a Data Model appendix.</p>
        </div>
        <div className=' flex-col flex items-end gap-3'>
            <div className='flex items-center gap-2 text-white'>
                <div className='text-sm flex items-center gap-2 border border-neutral-300 rounded-sm px-2 py-1'>
                <HiOutlineBookOpen className='size-4 text-yellow-400'/>
                Playbooks define what
                </div>

                <div className='text-sm flex items-center gap-2 border border-neutral-300 rounded-sm px-2 py-1'>
                    <ShieldCheck className='size-4 text-yellow-400'/>
                    Policies decide when/how
                </div>

                <div className='text-sm flex items-center gap-2 border border-neutral-300 rounded-sm px-2 py-1'>
                    <FileCode className='size-4 text-yellow-400'/>
                    Decision Log proves why
                </div>
            </div>
            <CButton className='w-fit'>
                Publish Playbook Version
            </CButton>
        </div>
    </div>
  )
}

export default Header