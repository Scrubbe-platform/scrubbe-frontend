import React from 'react'

const PolicyDecision = () => {
    return (
        <div className='text-white space-y-4'>
            <div className='border border-neutral-500 rounded-xl p-4 grid grid-cols-3 gap-3'>
                <div className='border border-neutral-500 rounded-xl p-4'>
                    <p className='text-sm text-gray-300'>Auto-active</p>
                    <p className='text-base font-semibold'>No</p>
                </div>
                <div className='border border-neutral-500 rounded-xl p-4'>
                    <p className='text-sm text-gray-300'>Approval gate</p>
                    <p className='text-base font-semibold'>Required</p>
                </div>
                <div className='border border-neutral-500 rounded-xl p-4'>
                    <p className='text-sm text-gray-300'>Scope</p>
                    <p className='text-base font-semibold'>pr-only</p>
                </div>
            </div>

            <div className='border border-neutral-500 rounded-xl p-4'>
                <p className='text-sm text-gray-300 mb-2'>Reasons</p>
                <ul className='list-disc pl-4'>
                    <li className='text-sm'>Merge conflicts are correctness-sensitive → approval required.                </li>
                </ul>
            </div>
        </div>
    )
}

export default PolicyDecision