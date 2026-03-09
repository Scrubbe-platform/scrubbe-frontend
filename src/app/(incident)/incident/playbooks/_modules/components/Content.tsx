"use client"
import CButton from '@/components/ui/Cbutton'
import { Shield } from 'lucide-react'
import React, { useState } from 'react'
import { AiOutlineMenu } from 'react-icons/ai'
import { GrTest } from 'react-icons/gr'
import { RiGitBranchLine } from 'react-icons/ri'
import Playbook from './ContentTaps/Playbook'
import RoadMap from './ContentTaps/RoadMap'
import TrustSafety from './ContentTaps/TrustSafety'
import DataModal from './ContentTaps/DataModal'

const tabs = [
    {label: "Playbook", value: "playbook"},
    {label: "Road Map", value: "road_map"},
    {label: "Trust & Safety", value: "trust_safety"},
    {label: "Data Model", value: "data_model"},
]
const Content = () => {
    const [selectTabs, setSelectTabs] = useState<{label:string, value:string}>(tabs[0])
  return (
    <div className=' border bg-darkEzra border-IMSCyan/45 rounded-xl p-5 flex-1 min-h-[500px] text-white'>
        <div className='flex justify-between'>
            <div className='space-y-1'>
                <p className='text-sm font-medium'>Playbook</p>
                <p className='text-sm'>CI Test Failure Remediation</p>
                <p className='text-xs'>Diagnose failing tests, propose minimal patch, rerun CI, verify stability (PR-only safe defaults).</p>
            </div>

            <div className='flex gap-4'>
                <CButton className='border border-IMSCyan text-IMSCyan bg-transparent hover:bg-transparent w-fit'>
                    <AiOutlineMenu/>
                    View attachment rules
                </CButton>

                <CButton className='border border-IMSCyan text-IMSCyan bg-transparent hover:bg-transparent w-fit'>
                    <RiGitBranchLine/>
                    Versioning
                </CButton>

                <CButton className='border border-IMSCyan text-IMSCyan bg-transparent hover:bg-transparent w-fit'>
                    <GrTest/>
                    Test Match
                </CButton>
            </div>
        </div>

        <div className='flex border-b border-neutral-300 mt-4'>
            {
                tabs.map(({label, value}) => (
                    <div onClick={() => setSelectTabs({value, label})} className={`border-b-2 ${selectTabs.value !== value ? "border-transparent" : "border-IMSCyan"} py-3 flex-1 text-sm text-center`} key={value}>{label}</div>
                ))
            }
        </div>

        {
            selectTabs.value === "playbook" && 
            <Playbook/>
        }

        {
            selectTabs.value === "road_map" &&
            <RoadMap/>
        }
        {
            selectTabs.value === "trust_safety" &&
            <TrustSafety/>
        }
        {
            selectTabs.value === "data_model" &&
            <DataModal/>
        }
    </div>
  )
}

export default Content