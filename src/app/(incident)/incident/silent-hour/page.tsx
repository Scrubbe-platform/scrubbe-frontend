'use client'
import Calendar from '@/components/IMS/Calender'
import CButton from '@/components/ui/Cbutton'
import { useFetch } from '@/hooks/useFetch'
import { endpoint } from '@/lib/api/endpoint'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { IoPaperPlaneOutline } from 'react-icons/io5'
import RelatedSection from './_module/component/RelatedSection'
import QuietRules, { QuietRule } from './_module/component/QuietRules'
import Status from './_module/component/Status'

const page = () => {
  const [pendingRules, setPendingRules] = useState<QuietRule[]>([])
  const { post } = useFetch()

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await post(endpoint.silent_hours.save, { rules: pendingRules })
      if (!res.success) throw new Error((res.data as string) ?? 'Failed to publish rules')
      return res.data
    },
    onSuccess: () => {
      toast.success('Quiet hour rules published')
      setPendingRules([])
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className='bg-dark space-y-8 p-6'>
        <div className='flex justify-between gap-4 '>
            <div className='text-white'>
                <p className='text-lg font-semibold'>Setting</p>
                <p className='text-lg font-medium'>Quiet Hours & Enterprise Suppression</p>
                <p className='text-base'>Team-specific, rotation-aware, regional quiet rules + suppression.</p>
                {pendingRules.length > 0 && (
                  <p className='text-sm text-cyan-400 mt-1'>{pendingRules.length} unsaved rule{pendingRules.length > 1 ? 's' : ''}</p>
                )}
            </div>
            <div>
                <CButton onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
                    <IoPaperPlaneOutline/>
                    {publishMutation.isPending ? 'Publishing...' : 'Publish'}
                </CButton>
            </div>
        </div>
        <div className='flex gap-5'>
            <div className='flex-[.4]'><RelatedSection/></div>
            <div className='flex-1'>
              <QuietRules onRuleAdded={(rule) => setPendingRules((prev) => [...prev, rule])}/>
            </div>
            <div className='flex-[.5]'><Status/></div>
        </div>
        <div className="rounded-md flex-1 max-w-5xl">
          <Calendar />
        </div>
    </div>
  )
}

export default page
