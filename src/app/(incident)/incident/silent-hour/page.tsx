'use client'
import Calendar from '@/components/IMS/Calender'
import CButton from '@/components/ui/Cbutton'
import React from 'react'
import { IoPaperPlaneOutline } from 'react-icons/io5'
import RelatedSection from './_module/component/RelatedSection'
import QuietRules from './_module/component/QuietRules'
import Status from './_module/component/Status'

const page = () => {
  return (
    <div className='bg-dark space-y-8 p-6'>
        <div className='flex justify-between gap-4 '>
            <div className='text-white'>
                <p className='text-lg font-semibold'>Setting</p>
                <p className='text-lg font-medium'>Quiet Hours & Enterprise Suppression</p>
                <p className='text-base'>Team-specific, rotation-aware, regional quiet rules + suppression.</p>
            </div>
            <div>
                <CButton >
                    <IoPaperPlaneOutline/>
                    Publish
                </CButton>
            </div>
        </div>
        <div className='flex gap-5'>
            <div className='flex-[.4]'><RelatedSection/></div>
            <div className='flex-1'><QuietRules/></div>
            <div className='flex-[.5]'><Status/></div>
        </div>
        <div className="rounded-md flex-1 max-w-5xl">
          <Calendar />
        </div>
    </div>
  )
}

export default page