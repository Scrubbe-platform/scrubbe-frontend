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
import { IncidentDetailRecord } from '@/lib/incident/incident.types'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const IncidentDelivery = ({ incident }: { incident: IncidentDetailRecord }) => {
  const queryClient = useQueryClient()

  const handleSaveDraft = () => {
    queryClient.invalidateQueries({ queryKey: ['decisions-log', incident.id] })
    queryClient.invalidateQueries({ queryKey: ['playbook-match', incident.id] })
    queryClient.invalidateQueries({ queryKey: ['guardrails-incident', incident.id] })
    queryClient.invalidateQueries({ queryKey: ['ezra-analysis-delivery', incident.id] })
    toast.success('Delivery configuration refreshed')
  }

  return (
    <div className="bg-white dark:bg-grayscrubbe-900 min-h-screen p-10 text-gray-900 dark:text-gray-200 space-y-3">
        <Header incident={incident}/>
        <DeliverySignal/>
        <div className="flex gap-5 pt-5">
        <div className="flex-1 space-y-5">
          <Evidence incident={incident}/>
          <IncidentDetails incident={incident}/>
          <DecisionLog incidentId={incident.id}/>
          <AnalystNotes/>
        </div>
        <div className="flex-1 space-y-5">
          <LinksThatOpen incident={incident}/>
          <PlaybookSection incidentId={incident.id} category={incident.category}/>
          <PolicySection incidentId={incident.id}/>
          <Remediation incidentId={incident.id}/>
        </div>
      </div>

      <div className='flex items-center justify-between max-w-4xl pt-10'>
        <p>Tip: start strict. You can loosen auto-create rules after you see real noise patterns.</p>
        <CButton className='w-fit' onClick={handleSaveDraft}>
          Save Draft
        </CButton>
      </div>
    </div>
  )
}

export default IncidentDelivery
