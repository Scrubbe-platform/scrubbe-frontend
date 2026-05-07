"use client"
import { useState } from 'react'
import FormWrapper from '../FormWrapper'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import { Table } from '@/components/ui/table'
import { CellContext } from '@tanstack/react-table'
import CButton from '@/components/ui/Cbutton'
import { Switch } from '@heroui/react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import SideModal from '@/components/ui/SideModal'
import { BiInfoCircle } from 'react-icons/bi'
import TextArea from '@/components/ui/text-area'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFetch } from '@/hooks/useFetch'
import { endpoint } from '@/lib/api/endpoint'
import { toast } from 'sonner'

const formScheme = z.object({
  name: z.string().nonempty(),
  enable: z.boolean(),
  triggerSource: z.string().nonempty(),
  condition: z.string().nonempty(),
  state: z.string().nonempty(),
  environment: z.string().default("production"),
  deduplication: z.string().nonempty(),
  severity: z.string().nonempty().default("P1"),
  note: z.string().optional(),
})

type TformScheme = z.infer<typeof formScheme>

const AutoCreateIncident = () => {
  const { get, post, remove } = useFetch()
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)

  const { data: rules = [] } = useQuery({
    queryKey: ['guardrails', 'auto-create'],
    queryFn: async () => {
      const res = await get(endpoint.guardrails.list + '?ruleType=AUTO_CREATE')
      if (res.success) return (res.data?.data?.guardrails ?? res.data?.data ?? []) as any[]
      return [] as any[]
    },
    refetchOnWindowFocus: false,
  })

  const { mutateAsync: createRule, isPending: saving } = useMutation({
    mutationFn: async (data: TformScheme) => {
      const res = await post(endpoint.guardrails.create, {
        name: data.name,
        description: data.condition,
        ruleType: 'AUTO_CREATE',
        triggerSource: data.triggerSource,
        condition: data.condition,
        state: data.state,
        environment: data.environment,
        deduplication: data.deduplication,
        severity: data.severity,
        enable: data.enable,
        note: data.note,
      })
      if (!res.success) throw new Error(res.data?.message ?? 'Failed to save rule')
      return res.data
    },
    onSuccess: () => {
      toast.success('Auto-create rule saved')
      queryClient.invalidateQueries({ queryKey: ['guardrails', 'auto-create'] })
      setOpenModal(false)
      reset()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const { mutateAsync: deleteRule } = useMutation({
    mutationFn: async (id: string) => {
      const res = await remove(endpoint.guardrails.delete, id)
      if (!res.success) throw new Error('Failed to delete')
      return res.data
    },
    onSuccess: () => {
      toast.success('Rule deleted')
      queryClient.invalidateQueries({ queryKey: ['guardrails', 'auto-create'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const [codeEngineActions, setCodeEngineActions] = useState<{ label: string, value: boolean }[]>([
    { label: "Allow "suggest fix" on P1/P2", value: false },
    { label: "Auto-open PR (never merge)", value: false },
    { label: "Only in staging by default", value: false }
  ])

  const { control, handleSubmit, formState: { isValid, errors }, reset } = useForm<TformScheme>({
    resolver: zodResolver(formScheme),
    mode: "onChange",
    defaultValues: {
      enable: true,
      environment: "production",
      condition: "",
      deduplication: "",
      state: "",
      triggerSource: "",
      name: "",
      note: "",
      severity: "P1",
    }
  })

  const columns = [
    {
      accessorKey: "name",
      header: () => <span className="font-semibold">Trigger</span>,
      cell: (info: CellContext<Record<string, any>, unknown>) => info.getValue(),
    },
    {
      accessorKey: "config.condition",
      header: () => <span className="font-semibold">Condition</span>,
      cell: (info: CellContext<Record<string, any>, unknown>) => (
        <div className="truncate text-nowrap max-w-sm">{info.getValue() as string}</div>
      ),
    },
    {
      accessorKey: "config.state",
      header: () => <span className="font-semibold">Then</span>,
      cell: (info: CellContext<Record<string, any>, unknown>) => (
        <div className="truncate text-nowrap max-w-sm">{info.getValue() as string}</div>
      ),
    },
    {
      accessorKey: "config.deduplication",
      header: () => <span className="font-semibold">Dedup</span>,
      cell: (info: CellContext<Record<string, any>, unknown>) => info.getValue() as string,
    },
    {
      accessorKey: "Action",
      header: () => <span className="font-semibold">Action</span>,
      cell: (info: CellContext<Record<string, any>, unknown>) => (
        <div className="flex items-center gap-3">
          <CButton
            onClick={() => deleteRule((info.row.original as any).id)}
            className="border bg-transparent hover:bg-transparent border-rose-500 text-rose-500"
          >
            Delete
          </CButton>
        </div>
      ),
    },
  ]

  return (
    <div>
      <FormWrapper
        title='C. Auto-create incidents'
        subtitle='When should Scrubbe create an incident automatically?'
        label='Rules here connect the dots: pipeline failure → incident severity. This prevents "every red build" turning into noise.'
        actionText={"Add auto-create rule"}
        action={() => setOpenModal(true)}
      >
        <div className='space-y-3'>
          <Table columns={columns} data={rules} />

          <div className='border border-gray-400 p-3 rounded-lg space-y-3'>
            <div className='flex justify-between'>
              <div>
                <div className='flex items-center gap-2 text-sm'>
                  <p>Deduplication</p>
                </div>
                <p className='text-xs'>Avoid duplicate incidents for the same service & deploy.</p>
              </div>
            </div>

            <Select options={[
              { value: "Service + env ( default )", label: "Service + env ( default )" },
              { value: "Service + env + pipeline", label: "Service + env + pipeline" },
              { value: "Commit SHA", label: "Commit SHA" },
              { value: "Disabled", label: "Disabled" },
            ]} className='!bg-dark' />
          </div>

          <div className='border border-gray-400 p-3 rounded-lg space-y-3'>
            <div className='flex items-center gap-2 text-sm'>
              <p>Incident SLA defaults</p>
            </div>
            <p className='text-xs'>Sets the resolution countdown per severity.</p>
            <div className='grid grid-cols-2 gap-x-3'>
              <Input label='P1' labelClassName='text-white' defaultValue={"60m"} />
              <Input label='P2' labelClassName='text-white' defaultValue={"4h"} />
              <Input label='P3' labelClassName='text-white' defaultValue={"24h"} />
              <Input label='P4' labelClassName='text-white' defaultValue={"72h"} />
            </div>
          </div>

          <div className='border border-gray-400 p-3 rounded-lg space-y-3'>
            <p className='text-sm'>Code Engine actions</p>
            <p className='text-xs'>Policy for what remediation paths are allowed by default.</p>
            <div className='space-y-2'>
              {codeEngineActions.map((action) => (
                <div key={action.label} className='flex items-center justify-between'>
                  <p className='text-sm'>{action.label}</p>
                  <Switch
                    size='sm'
                    color="success"
                    isSelected={action.value}
                    onChange={() =>
                      setCodeEngineActions((prev) =>
                        prev.map((item) =>
                          item.label === action.label ? { ...item, value: !item.value } : item
                        )
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormWrapper>

      {openModal && (
        <SideModal isOpen={openModal} onClose={() => setOpenModal(false)} title='Add auto-create rule' subTitle='When should Scrubbe auto-raise an incident?'>
          <div>
            <div className='border border-gray-300 rounded-md p-2'>
              <div className='flex gap-2 items-center text-sm font-semibold'>
                <BiInfoCircle className='size-4' />
                <p>Rule type</p>
              </div>
              <p className='pt-2 text-sm'>Evaluates triggers (pipelines/alerts/risk) to auto-create incidents.</p>
            </div>

            <div className='mt-4'>
              <div className='grid grid-cols-2 gap-x-3'>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder='Pipeline fail in prod - P1' label='Name' labelClassName='text-white' error={errors.name?.message} />
                  )}
                />
                <Controller
                  name="enable"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={[
                        { value: "true", label: "Enable" },
                        { value: "false", label: "Disable" }
                      ]}
                      label='Enabled'
                      labelClassName='text-white'
                      value={field.value ? "true" : "false"}
                      onChange={(e: any) => field.onChange(e.target.value === "true")}
                      error={errors.enable?.message}
                    />
                  )}
                />
                <Controller
                  name="triggerSource"
                  control={control}
                  render={({ field }) => (
                    <Select {...field}
                      options={[
                        { value: "CI/CD pipeline", label: "CI/CD pipeline" },
                        { value: "Monitoring alert", label: "Monitoring alert" },
                        { value: "Fraud / risk engine", label: "Fraud / risk engine" },
                        { value: "Runtime anomaly", label: "Runtime anomaly" },
                      ]}
                      label='Trigger Source'
                      labelClassName='text-white'
                      error={errors.triggerSource?.message}
                    />
                  )}
                />
                <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder='e.g. >5% for 5m' label='Condition' labelClassName='text-white' error={errors.condition?.message} />
                  )}
                />
              </div>
              <div className='grid grid-cols-3 gap-x-3'>
                <Controller
                  name="severity"
                  control={control}
                  render={({ field }) => (
                    <Select {...field}
                      options={[
                        { value: "P1", label: "P1" },
                        { value: "P2", label: "P2" },
                        { value: "P3", label: "P3" },
                        { value: "P4", label: "P4" },
                      ]}
                      label='Create Severity'
                      labelClassName='text-white'
                      error={errors.severity?.message}
                    />
                  )}
                />
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} options={[
                      { value: "open", label: "Open" },
                      { value: "investigating", label: "Investigating" },
                    ]} label='Default state' labelClassName='text-white' error={errors.state?.message} />
                  )}
                />
                <Controller
                  name="deduplication"
                  control={control}
                  render={({ field }) => (
                    <Select {...field}
                      options={[
                        { value: "15 minutes", label: "15 minutes" },
                        { value: "30 minutes", label: "30 minutes" },
                        { value: "60 minutes", label: "60 minutes" },
                        { value: "4 hours", label: "4 hours" },
                      ]}
                      label="Dedup window"
                      labelClassName='text-white'
                      error={errors.deduplication?.message}
                    />
                  )}
                />
              </div>
              <div className='mt-3'>
                <Controller
                  name="note"
                  control={control}
                  render={({ field }) => (
                    <TextArea {...field} placeholder="Explain intent so future readers don't guess" label='Note (optional)' labelClassName='text-white' />
                  )}
                />
              </div>
              <div className='flex items-center gap-2 text-sm mt-2'>
                <BiInfoCircle className='size-4' />
                <p>Rules are evaluated in order. Put stricter rules above looser ones.</p>
              </div>

              <div className='flex justify-end gap-3 mt-3'>
                <CButton onClick={() => setOpenModal(false)} className="border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan w-fit">
                  Cancel
                </CButton>
                <CButton
                  disabled={!isValid || saving}
                  isLoading={saving}
                  onClick={handleSubmit((data) => createRule(data))}
                  className="hover:bg-IMSCyan bg-IMSCyan text-black w-fit"
                >
                  Save Rule
                </CButton>
              </div>
            </div>
          </div>
        </SideModal>
      )}
    </div>
  )
}

export default AutoCreateIncident
