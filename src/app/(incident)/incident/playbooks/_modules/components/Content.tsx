"use client"
import CButton from '@/components/ui/Cbutton'
import { Shield } from 'lucide-react'
import React, { useState } from 'react'
import { AiOutlineMenu } from 'react-icons/ai'
import { GrTest } from 'react-icons/gr'
import { RiGitBranchLine } from 'react-icons/ri'

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

        <div className='flex gap-5 mt-4'>
            <div className='p-4 rounded-xl border border-neutral-400 flex-1 flex flex-col gap-1'>
                <div className=' flex items-center justify-between'>
                    <p className='text-sm font-medium'>Steps</p>
                    <button className='px-4 py-1 border border-IMSCyan text-IMSCyan text-xs rounded-lg'>Edit</button>
                </div>
                <p className='text-sm font-semibold'>Operational steps + safe defaults</p>
                <p className='text-sm'>Playbooks define allowed actions and verification steps. Policies decide if execution is permitted.</p>
                <ul className=' list-decimal pl-3 space-y-1 text-sm'>
                    <li>Collect failing test names + stack traces from CI logs.</li>
                    <li>Map failures to recent changes (commit SHA, touched files)</li>
                    <li>Generate minimal patch suggestion with explanation and confidence score.</li>
                    <li>Rerun CI and compare results (pass/fail, flake rate).</li>
                    <li>Escalate to owners if repeated failures persist.</li>
                </ul>

                <div className='border border-gray-500 rounded-lg p-4 mt-3'>
                    <div className='flex items-center gap-2'>
                        <Shield className='size-4 text-orange-500'/>
                        <p className='text-sm font-medium'>Verification requirements</p>
                    </div>
                    <ul className='list-disc pl-4 text-sm'>
                        <li>CI rerun passes on the same commit SHA.</li>
                        <li>No new failing jobs introduced.</li>
                        <li>Flake rate decreases or remains stable.</li>
                    </ul>
                </div>
            </div>
            <div className='p-4 rounded-xl border border-neutral-500 flex-1 flex flex-col gap-1'>
                <div className=' flex items-center justify-between'>
                    <p className='text-sm'>Allowed actions</p>
                    <button className='px-4 py-1 border border-IMSCyan text-IMSCyan text-xs rounded-lg'>Configure</button>
                </div>
                <p className='text-sm font-semibold'>What this playbook permits</p>
                <p className='text-sm'>These are the only actions the orchestration engine may consider for this playbook.</p>
            </div>
        </div>
    </div>
  )
}

export default Content