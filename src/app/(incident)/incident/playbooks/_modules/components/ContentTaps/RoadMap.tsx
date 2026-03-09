import CButton from '@/components/ui/Cbutton'
import SideModal from '@/components/ui/SideModal'
import TextArea from '@/components/ui/text-area'
import React, { useState } from 'react'

const RoadMap = () => {
    const [openModal, setOpenModal] = useState(false)
    return (
        <div className='p-4 rounded-xl border border-slate-400 space-y-2 mt-3'>
            <div className=' flex items-center justify-between'>
                <p className='text-sm'>Roadmap</p>
                <button onClick={() => setOpenModal(true)} className='px-4 py-1 border border-IMSCyan text-IMSCyan text-xs rounded-lg'>Edit</button>
            </div>
            <p className='text-base font-semibold'>What ships in v1 vs v2 vs v3</p>
            <p className='text-sm'>This is the “scope clarity” section design partners ask for: what’s real now, what’s next, and what’s later.</p>

            <div className='grid grid-cols-3 gap-4'>
                <div className='border border-slate-400 p-4 rounded-lg space-y-3'>
                    <div className='flex justify-between items-center gap-2'>
                        <p className='font-medium text-base'>v1 — Delivery incidents foundation</p>
                        <span className='text-sm text-dark bg-green rounded-lg px-3 py-1'>Now</span>
                    </div>
                    <ul className='text-sm pl-3 list-disc space-y-2'>
                        <li>CI/PR webhook ingestion (GitHub/GitLab/CI)</li>
                        <li>Incident creation + dedup keys (repo+pr+run+sha)</li>
                        <li>Playbook selection (delivery + prod)</li>
                        <li>Policy gates (PR-only defaults)</li>
                        <li>Decision log + timeline reconstruction</li>
                        <li>Code suggestions + confidence + review flow</li>
                    </ul>
                </div>
                <div className='border border-slate-400 p-4 rounded-lg space-y-3'>
                    <div className='flex justify-between items-center gap-2'>
                        <p className='font-medium text-base'>v2 — Multi-repo + verification depth</p>
                        <span className='text-sm text-dark bg-yellow-500 rounded-lg px-3 py-1'>Next</span>
                    </div>
                    <ul className='text-sm pl-3 list-disc space-y-2'>
                        <li>Multi-repo correlation (shared libs, monorepos)</li>
                        <li>Better signal graph editor (edges + grouping)</li>
                        <li>Verification pipelines (re-run, canary, smoke)</li>
                        <li>Suppressions + noise controls (flake rules)</li>
                        <li>Risk scoring by touched paths (/policy,/infra)</li>
                    </ul>
                </div>
                <div className='border border-slate-400 p-4 rounded-lg space-y-3'>
                    <div className='flex justify-between items-center gap-2'>
                        <p className='font-medium text-base'>v3 — Learning + cross-incident intelligence</p>
                        <span className='text-sm text-dark bg-white rounded-lg px-3 py-1'>Now</span>
                    </div>
                    <ul className='text-sm pl-3 list-disc space-y-2'>
                        <li>Cross-incident similarity (playbook outcomes)</li>
                        <li>Auto playbook tuning suggestions (human-approved)</li>
                        <li>Evidence packs export (audit + compliance)</li>
                        <li>Role-specific dashboards (SRE/EngLead/Risk)</li>
                        <li>Decision log + timeline reconstruction</li>
                        <li>Optional production execution (policy-driven)</li>
                    </ul>
                </div>
            </div>


            {
                openModal && (
                    <SideModal title='' onClose={() => setOpenModal(false)} isOpen={openModal}>
                        <div className='flex flex-col gap-2'>
                        <p className='text-base font-medium'>Roadmap editor</p>
                        <p className='font-semibold'>Edit v1 / v2 / v3 scope</p>
                        <p className='text-sm'>Keep this short and honest; design partners will test it.</p>

                        <div className='border border-slate-400 rounded-lg p-3 my-3 space-y-2'>
                        <p className='font-semibold text-base'>v1 (now)</p>
                        <TextArea rows={6}/>
                        </div>

                        <div className='border border-slate-400 rounded-lg p-3 my-3 space-y-2'>
                        <p className='font-semibold text-base'>v2 (next)</p>
                        <TextArea rows={6}/>
                        </div>

                        <div className='border border-slate-400 rounded-lg p-3 my-3 space-y-2'>
                        <p className='font-semibold text-base'>v3 (later)</p>
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

export default RoadMap