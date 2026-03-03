"use client"
import React from 'react'
import Header from './Header'
import DeliverySignal from './DeliverySignal'
import Evidence from './Evidence'
import LinksThatOpen from './LinksThatOpen'
import IncidentDetails from './IncidentDetails'
import PlaybookSection from './PlaybookSection'
import PolicySection from './PolicySection'
import DecisionLog from './DecisionLog'
import Remediation from './Remediation'
import AnalystNotes from './AnalystNotes'
import CButton from '@/components/ui/Cbutton'

const IncidentDelivery = () => {
  return (
    <div className="bg-dark min-h-screen p-10 text-gray-200 space-y-3">
        <Header/>
        <DeliverySignal/>   
        <div className="flex gap-5 pt-5">
        <div className="flex-1 space-y-5">
          <Evidence/>
          <IncidentDetails/>
          <DecisionLog/>
          <AnalystNotes/>
        </div>
        <div className="flex-1 space-y-5">
          <LinksThatOpen/>
          <PlaybookSection/>
          <PolicySection/>
          <Remediation/>
        </div>
      </div>    

      <div className='flex items-center justify-between max-w-4xl pt-10'>
        <p>Tip: start strict. You can loosen auto-create rules after you see real noise patterns.</p>
        <CButton className='w-fit' onClick={() => {}}>
          Save Draft
        </CButton>
        </div> 
    </div>
  )
}

export default IncidentDelivery