import React from 'react'

const Status = () => {
  return (
    <div className=" bg-[#030D25] p-5 text-slate-300 antialiased  border-cyan-400/40 rounded-lg text-base ">
      <p>Status</p>
      <p>Quiet inactive</p>
      <p className='text-sm'>Next quiet period starts in —</p>

      <div className='mt-5 space-y-1'>
        <p className='font-medium'>Summary</p>
        <div className='flex justify-between items-center text-sm'>
          <span>Team rules</span>
          <span className='text-IMSCyan'>2 active</span>
        </div>
        <div className='flex justify-between items-center text-sm'>
          <span>Exceptions</span>
          <span>0</span>
        </div>
        <div className='flex justify-between items-center text-sm'>
          <span>Team rules</span>
          <span>0</span>
        </div>
      </div>
    </div>
  )
}

export default Status