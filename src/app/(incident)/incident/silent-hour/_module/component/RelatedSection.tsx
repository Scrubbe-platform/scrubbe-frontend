import React from 'react'
import { BsPeople } from 'react-icons/bs'
import { FaRegBuilding } from 'react-icons/fa'
import { IoNotificationsOffOutline } from 'react-icons/io5'

const RelatedSection = () => {
  return (
    <div className=' bg-[#030D25] p-4 rounded-xl text-white space-y-2 text-base'>
        <p className='opacity-60'>Related Sections</p>
        <div className='flex items-center gap-2 p-2'>
        <FaRegBuilding className='text-amber-400'/> <span>Global Mode</span>
        </div>
        <div className='flex items-center gap-2 p-2'>
        <IoNotificationsOffOutline className='text-fuchsia-400'/> <span>Suppression Profiles</span>
        </div>
        <div className='flex items-center gap-2 p-2'>
        <BsPeople className='text-indigo-400'/> <span>On-call Rotations</span>
        </div>
    </div>
  )
}

export default RelatedSection