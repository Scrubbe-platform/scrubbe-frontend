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
  const columns = [
    {
      accessorKey: "trigger",
      header: () => <span className="font-semibold">Trigger</span>,
      cell: (info: CellContext<Record<string, any>, unknown>) => info.getValue(),
    },

    {
      accessorKey: "condition",
      header: () => <span className="font-semibold">Condition</span>,
      cell: (info: CellContext<Record<string, any>, unknown>) => (
        <div className=" truncate text-nowrap max-w-sm">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: "then",
      header: () => <span className="font-semibold">Then</span>,
      cell: (info: CellContext<Record<string, any>, unknown>) => (
        <div className=" truncate text-nowrap max-w-sm">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: "dedup",
      header: () => <span className="font-semibold">Dedup</span>,
      cell: (info: CellContext<Record<string, any>, unknown>) => (
        <div className="flex items-center gap-2">
          {/* {priorityColors((info.getValue() as string) ?? "low")} */}
        </div>
      ),
    },


    {
      accessorKey: "Action",
      header: () => <span className="font-semibold">Action</span>,
      cell: () => (
        <div className="flex items-center gap-3">
          <CButton className="border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan">
            {/* <AiStarIcon stroke="#06eefd"/> */}
            Edit
          </CButton>
          <CButton className="border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan">
            {/* <AiStarIcon stroke="#06eefd"/> */}
            Delete
          </CButton>
        </div>
      ),
    },
  ];
  const [openModal, setOpenModal] = useState(false)
  const [codeEngineActions, setCodeEngineActions] = useState<{ label: string, value: boolean }[]>([
    { label: "Allow “suggest fix” on P1/P2", value: false },
    { label: "Auto-open PR (never merge)", value: false },
    { label: "Only in staging by default", value: false }
  ])
  const { control, formState: { isValid, errors }, setValue, watch } = useForm({
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
      severity: "",
    }
  })
  return (
    <div>
      <FormWrapper
        title='C. Auto-create incidents'
        subtitle='When should Scrubbe create an incident automatically?'
        label='Rules here connect the dots: pipeline failure → incident severity. This prevents “every red build” turning into noise.'
        actionText={"Add auto-create rule"}
        action={() => setOpenModal(true)}
      >
        <div className='space-y-3'>
          <Table columns={columns} data={[]} />

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
              {
                codeEngineActions.map((actions) => (
                  <div key={actions.label} className='flex items-center justify-between'>
                    <p className='text-sm'>{actions.label}</p>
                    <Switch size='sm' color="success" checked={actions.value} onChange={(e) => setCodeEngineActions((prev) =>
                      prev.map((item) =>
                        item.label === actions.label
                          ? { ...item, value: !actions.value } // Update the matched item
                          : item // Keep others as they are
                      )
                    )} />
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </FormWrapper>

      {
        openModal && <SideModal isOpen={openModal} onClose={() => setOpenModal(false)} title='Add severity rule' subTitle='Map signals to P1–P4 and optionally mark as major.'>
          <div>
            <div className='border border-gray-300 rounded-md p-2'>
              <div className='flex gap-2 items-center text-sm font-semibold'>
                <BiInfoCircle className='size-4' />
                <p>Rule type</p>
              </div>
              <p className='pt-2 text-sm'>Evaluates triggers (pipelines/alerts/risk) to auto-create incidents.</p>
            </div>

            <div className=' mt-4'>
              <div className='grid grid-cols-2 gap-x-3'>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder='Pipeline fall in prod- P1' label='Name' labelClassName='text-white' error={errors.name?.message} />
                  )}
                />

                <Controller
                  name="enable"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={[
                        { value: "false", label: "Enable" },
                        { value: "true", label: "Disable" }
                      ]}
                      label='Enabled'
                      labelClassName='text-white'
                      error={errors.enable?.message} />
                  )} />
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
                      error={errors.triggerSource?.message} />
                  )}
                />
                <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder='eg >5% for 5m' label='Condition' labelClassName='text-white' error={errors.condition?.message} />
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
                      error={errors.severity?.message} />
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
                      error={errors.severity?.message} />
                  )}
                />
              </div>
              {/* <div className='border border-zinc-300 rounded-lg p-3 flex items-center justify-between'>
                                <div>
                                    <div>
                                        <p className='text-sm font-semibold'>Mark as Major Incident when matched</p>
                                    </div>
                                    <p className='text-xs'>Overrides major threshold if checked.</p>
                                </div>
                                <Switch checked={watch("isMajor")} onChange={(e) => setValue("isMajor", e.target.checked)} size="sm" color="success" />
                            </div> */}
              <div className='mt-3'>
                <Controller
                  name="note"
                  control={control}
                  render={({ field }) => (
                    <TextArea {...field} placeholder='Explain intent so future readers don’t guess' label='Note (optional)' labelClassName='text-white' />
                  )}
                />
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <BiInfoCircle className='size-4' />
                <p>Rules are evaluated in order. Put stricter rules above looser one</p>
              </div>

              <div className='flex justify-end gap-3 mt-3'>
                <CButton onClick={() => setOpenModal(false)} className="border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan w-fit">
                  Cancel
                </CButton>
                <CButton disabled={!isValid} className=" hover:bg-IMSCyan bg-IMSCyan text-black w-fit">
                  Save Rule
                </CButton>
              </div>
            </div>
          </div>
        </SideModal>
      }
    </div>
  )
}

export default AutoCreateIncident