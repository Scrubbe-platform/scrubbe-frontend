import React from 'react'

const Playbook = () => {
    return (
        <div className='text-white space-y-4'>
            <div className='border border-neutral-500 rounded-xl p-4'>
                <p className='text-base font-bold'>Merge Conflict Remediation</p>
                <p className='text-sm'>Resolve conflicts safely; propose resolution patch as PR.</p>
            </div>
            <div className='border border-neutral-500 rounded-xl p-4'>
                <p className='text-base'>Steps</p>
                <ul className='list-decimal pl-3 text-base mt-2'>
                    <li>Detect conflicted files and conflict blocks.                    </li>
                    <li>Infer intent from base/head diffs and recent commits.                    </li>
                    <li>Propose conflict resolution patch with explanation.                    </li>
                    <li>Run CI to verify.                    </li>
                    <li>Require approval for sensitive areas.                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Playbook