import CButton from '@/components/ui/Cbutton'
import TextArea from '@/components/ui/text-area'
import React from 'react'

const AnalystNote = () => {
  return (
    <div className='text-white space-y-4'>
      <div className='border border-neutral-500 rounded-xl p-4'>
        <TextArea label='Note' placeholder='Write what you observed , What you tried and What you will recommend'/>
        <p className='text-sm pb-3'>Timestamp is added automatically.</p>
        <div className='flex justify-end'>
          <CButton className='w-fit'>Save Default</CButton>
        </div>
      </div>
      <div className='border border-neutral-500 rounded-xl p-4'>
        <p>What happens when you save</p>
        <ul className='list-disc pl-4 text-sm space-y-1 mt-2'>
          <li>Note becomes an immutable human entry in the Decision Log.</li>
          <li>It appears under “Analyst notes”.</li>
          <li>It’s included in the incident evidence pack export.</li>
        </ul>
      </div>
    </div>
  )
}

export default AnalystNote