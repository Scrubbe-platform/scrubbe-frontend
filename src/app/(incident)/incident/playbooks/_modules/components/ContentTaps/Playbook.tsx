import CButton from '@/components/ui/Cbutton'
import SideModal from '@/components/ui/SideModal'
import TextArea from '@/components/ui/text-area'
import { Shield } from 'lucide-react'
import React, { useState } from 'react'
import { CiWarning } from 'react-icons/ci'
import { MdInsertLink } from 'react-icons/md'
import { RxLightningBolt } from 'react-icons/rx'

const actions = [
    {
        value: "Post PR Comment ?"
    },
    {
        value: "Propose patch (Code Engine) ?"
    },
    {
        value: "Rerun CI ?"
    }
]
const Playbook = () => {
    const [requiredInput, setRequiredInput] = useState([
        { value: "CI logs" },
        { value: "Failing test names" },
        { value: "Commit SHA" },
        { value: "PR context" },
        { value: "Artifacts URL" },
    ])

    const [openModal, setOpenModal] = useState(false)
    const [openConfigureAction, setOpenConfigureAction] = useState(false)
    const [allowedAction, setAllowedAction] = useState([])

    return (
        <div className='flex gap-5 mt-4'>
            <div className='p-4 rounded-xl border border-neutral-400 flex-1 flex flex-col gap-1'>
                <div className=' flex items-center justify-between'>
                    <p className='text-sm font-medium'>Steps</p>
                    <button className='px-4 py-1 border border-IMSCyan text-IMSCyan text-xs rounded-lg' onClick={() => setOpenModal(true)}>Edit</button>
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
                        <Shield className='size-4 text-orange-500' />
                        <p className='text-sm font-medium'>Verification requirements</p>
                    </div>
                    <ul className='list-disc pl-4 text-sm'>
                        <li>CI rerun passes on the same commit SHA.</li>
                        <li>No new failing jobs introduced.</li>
                        <li>Flake rate decreases or remains stable.</li>
                    </ul>
                </div>
            </div>
            <div className='p-4 rounded-xl border border-neutral-500 flex-1 flex flex-col gap-1 space-y-3'>
                <div className=' flex items-center justify-between'>
                    <p className='text-sm'>Allowed actions</p>
                    <button onClick={() => setOpenConfigureAction(true)} className='px-4 py-1 border border-IMSCyan text-IMSCyan text-xs rounded-lg'>Configure</button>
                </div>
                <p className='text-sm font-semibold'>What this playbook permits</p>
                <p className='text-sm'>These are the only actions the orchestration engine may consider for this playbook.</p>
                <div className='flex flex-wrap gap-3 items-center'>
                    {
                        actions.map((action) => (
                            <div key={action.value} className='text-sm border rounded-xl border-slate-300 flex items-center gap-2 p-1 px-2'>
                                <RxLightningBolt size={17} className='text-yellow-400' />  <span>{action.value}</span>
                            </div>
                        ))
                    }
                </div>

                <div className='border rounded-xl border-slate-400 text-sm p-3 space-y-2'>
                    <p className='flex items-center gap-2'>
                        <CiWarning className='text-green' size={18} /> <span>Risk / approval notes</span>
                    </p>
                    <p>PR-only by default. If patch touches /policy or /infra → approval required.</p>
                </div>

                <div className='border rounded-xl border-slate-400 text-sm p-3 space-y-2'>
                    <p className='flex items-center gap-2'>
                        <MdInsertLink className='text-IMSCyan' size={18} /> <span>Evidence inputs (required) ?</span>
                    </p>

                    <div className='flex flex-wrap gap-3 items-center'>
                        {
                            requiredInput.map((input) => (
                                <div key={input.value} className='text-sm border rounded-xl border-slate-300 flex items-center gap-2 p-1 px-2'>
                                    <MdInsertLink className='text-IMSCyan' size={17} />  <span>{input.value}</span>
                                </div>
                            ))
                        }
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
                                <TextArea rows={6} />
                            </div>

                            <div className='border border-slate-400 rounded-lg p-3 my-3 space-y-2'>
                                <p className='font-semibold text-base'>Verification requirements</p>
                                <p className='text-sm font-medium text-slate-300'>These must be recorded in the decision log when actions run.</p>
                                <TextArea rows={6} />
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

            {
                openConfigureAction && (
                    <SideModal title='' onClose={() => setOpenConfigureAction(false)} isOpen={openConfigureAction}>
                        <div className='flex flex-col gap-2'>
                            <p className='text-base font-medium'>Configure action</p>
                            <p className='font-semibold'>Allowed actions and safety notes</p>
                            <p className='text-sm'>Define what is permitted; policies will gate execution</p>

                            <div className='border border-slate-400 rounded-lg p-3 my-3 space-y-2'>
                                <p className='font-semibold text-base'>Allowed action</p>
                                <p className='text-sm font-medium text-slate-300'>Select actions that this playbook permits.</p>


                            </div>

                            <div className='border border-slate-400 rounded-lg p-3 my-3 space-y-2'>
                                <p className='font-semibold text-base'>Risk/approval notes</p>
                                <p className='text-sm font-medium text-slate-300'>PR-only by default. If patch touches /policy or /infra → approval required.</p>
                                <TextArea rows={6} />
                            </div>

                        </div>
                    </SideModal>
                )
            }
        </div>
    )
}

export default Playbook