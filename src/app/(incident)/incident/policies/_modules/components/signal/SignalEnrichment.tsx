"use client"
import React, { useEffect, useState } from 'react'
import FormWrapper from '../FormWrapper'
import { Switch } from '@heroui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useFetch } from '@/hooks/useFetch'
import { endpoint } from '@/lib/api/endpoint'
import { toast } from 'sonner'
import CButton from '@/components/ui/Cbutton'

const SOURCE_LABELS = [
  { key: "monitoring", label: "Monitoring (Datadog/Prometheus/CloudWatch)" },
  { key: "logs", label: "Logs (ELK / OpenSearch)" },
  { key: "runtime", label: "Runtime (Kubernetes / containers)" },
  { key: "databases", label: "Databases & warehouses" },
  { key: "fraud", label: "Fraud metrics & signals" },
]

const SignalEnrichment = () => {
  const { get, put } = useFetch()
  const queryClient = useQueryClient()

  const [sources, setSources] = useState<Record<string, boolean>>({
    monitoring: false,
    logs: false,
    runtime: false,
    databases: false,
    fraud: false,
  })

  const { data: config } = useQuery({
    queryKey: ['ims-signal-enrichment'],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_config)
      if (res.success) return res.data?.data ?? res.data ?? {}
      return {}
    },
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (config?.enrichmentSources) {
      setSources((prev) => ({ ...prev, ...config.enrichmentSources }))
    }
  }, [config])

  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async () => {
      const res = await put(endpoint.auth.ims_config, { enrichmentSources: sources })
      if (!res.success) throw new Error(res.data?.message ?? 'Failed to save')
      return res.data
    },
    onSuccess: () => {
      toast.success('Signal enrichment settings saved')
      queryClient.invalidateQueries({ queryKey: ['ims-signal-enrichment'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const toggle = (key: string) =>
    setSources((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      <FormWrapper
        title='D. Signal enrichment (optional)'
        subtitle='Make incidents signal-rich and fraud-aware by default.'
        label='These are defaults. Users still configure integrations on the next step.'
      >
        <div className='border border-gray-400 p-3 rounded-lg space-y-3'>
          <p className='text-sm font-semibold'>Default enrichment sources</p>
          <div className='space-y-2'>
            {SOURCE_LABELS.map((source) => (
              <div key={source.key} className='flex items-center justify-between'>
                <p className='text-sm'>{source.label}</p>
                <Switch
                  size='sm'
                  color="success"
                  isSelected={sources[source.key]}
                  onChange={() => toggle(source.key)}
                />
              </div>
            ))}
          </div>
          <div className='flex justify-end pt-2'>
            <CButton
              onClick={() => save()}
              isLoading={isPending}
              disabled={isPending}
              className='w-fit border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan'
            >
              Save enrichment settings
            </CButton>
          </div>
        </div>
      </FormWrapper>
    </div>
  )
}

export default SignalEnrichment
