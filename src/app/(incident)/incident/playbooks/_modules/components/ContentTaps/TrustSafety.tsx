import CButton from '@/components/ui/Cbutton'
import SideModal from '@/components/ui/SideModal'
import TextArea from '@/components/ui/text-area'
import React, { useState } from 'react'
import { BiMessageRoundedCheck } from 'react-icons/bi'
import { FiLock } from 'react-icons/fi'
import { TbHandStop } from 'react-icons/tb'

const TrustSafety = () => {
    const [openModal, setOpenModal] = useState(false)
    return (
        <div className='p-4 rounded-xl border border-slate-400 space-y-2 mt-3'>
            <div className=' flex items-center justify-between'>
                <p className='text-sm'>Trust & Safety</p>
                <button onClick={() => setOpenModal(true)} className='px-4 py-1 border border-IMSCyan text-IMSCyan text-xs rounded-lg'>Edit</button>
            </div>
            <p className='text-base font-semibold'>Why Scrubbe is safe to run in real orgs</p>
            <p className='text-sm'>This section makes governance explicit: what the system will do, what it will never do, and what must be approved.</p>

            <div className='grid grid-cols-2 gap-4'>
                <div className='p-4 border border-slate-400 rounded-lg space-y-2'>
                    <div className='flex items-center gap-2 text-base font-semibold'>
                        <TbHandStop className='text-yellow-500' size={18} />
                        <span>Non-negotiable</span>
                    </div>
                    <ul className='text-sm pl-3 list-disc space-y-2'>
                        <li>AI proposes; policy decides. No ungoverned execution.</li>
                        <li>Delivery incidents default to PR-only actions. No prod changes by default.</li>
                        <li>Every decision is logged. Evidence is exportable.</li>
                        <li>Blast-radius limits. Scope must match environment constraints.</li>
                    </ul>
                </div>

                <div className='p-4 border border-slate-400 rounded-lg space-y-2'>
                    <div className='flex items-center gap-2 text-base font-semibold'>
                        <BiMessageRoundedCheck className='text-green' size={18} />
                        <span>Confidence thresholds</span>
                    </div>
                    <ul className='text-sm pl-3 list-disc space-y-2'>
                        <li>Confidence is required for autopilot-style actions. Below threshold means “suggest only + require approval”.</li>
                    </ul>

                    <div className='grid grid-cols-3 gap-2'>
                        <div className='border border-slate-400 rounded-lg p-3 text-sm space-y-1 h-fit'>
                            <p>Suggest</p>
                            <p>≥ <span className='font-semibold'>0.55</span></p>
                            <p>Allowed by playbook</p>
                        </div>
                        <div className='border border-slate-400 rounded-lg p-3 text-sm space-y-1 h-fit'>
                            <p>Execute safe action</p>
                            <p>≥ <span className='font-semibold'>0.75</span></p>
                            <p>Policy + scope checks</p>
                        </div>
                        <div className='border border-slate-400 rounded-lg p-3 text-sm space-y-1 h-fit'>
                            <p>Production actions</p>
                            <p>≥ <span className='font-semibold'>0.90</span></p>
                            <p>Approval always required</p>
                        </div>

                    </div>
                </div>
            </div>

            <div>
                <div className='p-4 border border-slate-400 rounded-lg space-y-2'>
                    <div className='flex items-center gap-2 text-base font-semibold'>
                        <FiLock className='text-green' size={18} />
                        <span>Approval gates (human-required)</span>
                    </div>

                    <div className='grid grid-cols-3 gap-3 text-sm'>
                        <div className='p-4 border border-slate-400 rounded-lg space-y-2'>
                            <p>Triggers</p>
                            <ul className='text-sm pl-3 list-disc space-y-1'>
                                <li>Touched /policy or /infra</li>                               
                                <li>Suppression/quarantine change</li>
                                <li>Deploy/rollback of any kind</li>
                            </ul>
                        </div>
                        <div className='p-4 border border-slate-400 rounded-lg space-y-2'>
                            <p>Approvers</p>
                            <ul className='text-sm pl-3 list-disc space-y-1'>
                               <li>Repo owner or on-call</li>
                               <li>Platform owner (infra)</li>
                               <li>Risk/compliance (where applicable)</li>
                            </ul>
                        </div>
                        <div className='p-4 border border-slate-400 rounded-lg space-y-2'>
                            <p>Evidence required</p>
                            <ul className='text-sm pl-3 list-disc space-y-1'>
                               <li>Diff provenance</li>
                               <li>Verification plan</li>
                               <li>Confidence + blast radius</li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
            
            {
                openModal && (
                    <SideModal title='' onClose={() => setOpenModal(false)} isOpen={openModal}>
                        <div className='flex flex-col gap-2'>
                        <p className='text-base font-medium'>Edit steps</p>
                        <p className='font-semibold'>Steps and verification</p>
                        <p className='text-sm'>Keep steps short, and make verification explicit</p>

                        <div className='border border-slate-400 rounded-lg p-3 my-3 space-y-2'>
                        <p className='font-semibold text-base'>Steps</p>
                        <p className='text-sm font-medium text-slate-300'>One line per step. These define the operational flow</p>
                        <TextArea rows={6}/>
                        </div>

                        <div className='border border-slate-400 rounded-lg p-3 my-3 space-y-2'>
                        <p className='font-semibold text-base'>Verification requirements</p>
                        <p className='text-sm font-medium text-slate-300'>These must be recorded in the decision log when actions run.</p>
                        <TextArea rows={6}/>
                        </div>

                        <div className='flex justify-end gap-3 items-center'>
                            <CButton onClick={() => setOpenModal(false)} className='px-6 w-fit bg-transparent text-IMSCyan border border-IMSCyan hover:bg-transparent'>
                                Cancel
                            </CButton>
                            <CButton className='px-6 w-fit'>
                                Save
                            </CButton>
                        </div>
                        </div>
                    </SideModal>
                )
            }
        </div>
    )
}

export default TrustSafety