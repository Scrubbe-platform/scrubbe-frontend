import CButton from '@/components/ui/Cbutton'
import { ChevronRight, Plus, ShieldCheck } from 'lucide-react'
import React from 'react'
import { BiPlanet } from 'react-icons/bi'
import { FaPlane } from 'react-icons/fa6'

const Sidebar = () => {

    const sidebarItem = ({title, subTitle, environment}: {title:string, subTitle: string, environment: "delivery" | "production"}) => {
        return (
            <div className='border rounded-xl p-3 border-gray-500 space-y-2 hover:border-white'>
                <div className='flex justify-between'>
                    <p className='text-sm font-medium max-w-[100px]'>{title}</p>
                    <div className='flex items-center gap-2'>
                    <span className={`text-sm ${environment === "delivery" ? "bg-IMSCyan": "bg-yellow-400"} text-black px-2 py-1 rounded-lg capitalize h-fit font-medium`}>{environment}</span>
                    <ChevronRight className='size-3'/>
                    </div>
                </div>
                <p className='text-xs'>{subTitle}</p>
            </div>
        )
    }
  return (
    <div className='w-[300px] min-h-[80vh] bg-darkEzra p-4 text-white flex flex-col gap-3'>
        <div className="flex flex-row justify-between">
            <p className='text-sm'>Playbook library</p>
            <CButton className='border border-IMSCyan w-fit gap-2 bg-transparent hover:bg-transparent text-IMSCyan'><Plus/> New</CButton>
        </div>

        <p className='text-sm'>Canonical playbooks</p>
        <p className='text-sm'>Canonical Delivery incidents and production incidents live here together. Policies choose which to activate.playbooks</p>

        <div className='mt-2 flex-1'>
            {sidebarItem({title: "CI Test Failure Remediation", subTitle:"Delivery • match: failureCategory=tests", environment: "delivery"})}
        </div>

        <div className='space-y-2'>
            <p className='flex text-sm justify-between gap-2'>
              <span>Add-ons</span>  
              <span>Required for enterprise trust</span>  
            </p>

            <div className='text-sm flex items-center gap-3 px-1'>
                <FaPlane size={16} className='text-yellow-400'/> <p>Road map (v1-v3)</p>
            </div>
            <div className='text-sm flex items-center gap-3 px-1'>
                <ShieldCheck size={16} className='text-fuchsia-500'/>
                <p>Trust Model</p> 
            </div>
            <div className='text-sm flex items-center gap-3 px-1'>
                <ShieldCheck size={16} className='text-fuchsia-500'/>
                <p>Data Model Appendix</p> 
            </div>
        </div>
    </div>
  )
}

export default Sidebar

