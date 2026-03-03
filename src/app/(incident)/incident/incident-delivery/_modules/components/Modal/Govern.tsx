import React from 'react'

const Govern = () => {
    return (
        <div className='text-white'>
            <div className='border border-neutral-500 rounded-xl p-4'>
                <p className='font-bold'>Governed = policies decide if/when execution is allowed</p>
                <ul className=' list-disc pl-4 text-base space-y-1'>
                    <li>Playbooks define allowed remediation patterns and verification steps.</li>
                    <li>Policies enforce confidence thresholds, environment constraints, and human gates.</li>
                    <li>Every decision is written to the Decision Log for audit and evidence export.</li>
                </ul>
            </div>
            <div className='border border-neutral-500 rounded-xl p-4 space-y-2 mt-4'>
                <p className='text-gray-300 text-sm'>Common scopes</p>
                <div className='border border-neutral-500 rounded-xl p-4 text-base'>
                    PR-only: suggest/comment/patch within PR; no production execution.
                </div>
                <div className='border border-neutral-500 rounded-xl p-4 text-base'>
                    Staging-only: safe actions can run in staging; production requires approvals.
                </div>
                <div className='border border-neutral-500 rounded-xl p-4 text-base'>
                    Approval required: human approval is mandatory before any execution.
                </div>
            </div>
        </div>
    )
}

export default Govern