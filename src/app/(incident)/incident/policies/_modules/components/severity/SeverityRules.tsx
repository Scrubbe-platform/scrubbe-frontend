"use client"
import React, { useState } from 'react'
import FormWrapper from '../FormWrapper'
import { Table } from '@/components/ui/table'
import CButton from '@/components/ui/Cbutton'
import { CellContext } from '@tanstack/react-table'
import AiStarIcon from '@/components/icons/ai-star'
import { Switch } from '@heroui/react'
import Select from '@/components/ui/select'
import SideModal from '@/components/ui/SideModal'
import { BiInfoCircle } from 'react-icons/bi'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/ui/input'
import { error } from 'console'
import TextArea from '@/components/ui/text-area'

type TSeverityRule = {
    name: string,
    enabled: boolean,
    signal: string,
    threshold: string,
    environment: string,
    serviceScope: string,
    severity: string,
    isMajor: boolean,
    note: string,
}

const formScheme = z.object({
    name: z.string().nonempty(),
    enable: z.string(),
    signal: z.string().nonempty(),
    threshold: z.string().nonempty(),
    environment: z.string().default("production"),
    serviceScope: z.string().nonempty(),
    severity: z.string().nonempty().default("P1"),
    note: z.string().optional(),
    isMajor: z.boolean().default(true)
})

type TformScheme = z.infer<typeof formScheme>

const SeverityRules = () => {
    const columns = [
        {
            accessorKey: "name",
            header: () => <span className="font-semibold">Title</span>,
            cell: (info: CellContext<TSeverityRule, unknown>) => info.getValue(),
        },

        {
            accessorKey: "serviceScope",
            header: () => <span className="font-semibold">Service</span>,
            cell: (info: CellContext<TSeverityRule, unknown>) => (
                <div className=" truncate text-nowrap max-w-sm">
                    {info.getValue() as string}
                </div>
            ),
        },
        {
            accessorKey: "severity",
            header: () => <span className="font-semibold">Priority</span>,
            cell: (info: CellContext<TSeverityRule, unknown>) => (
                <div className=" truncate text-nowrap max-w-sm">
                    {info.getValue() as string}
                </div>
            ),
        },
        {
            accessorKey: "major",
            header: () => <span className="font-semibold">Major</span>,
            cell: (info: CellContext<TSeverityRule, unknown>) => (
                <div className="flex items-center gap-2">
                    {/* {priorityColors((info.getValue() as string) ?? "low")} */}
                </div>
            ),
        },
        {
            accessorKey: "state",
            header: () => <span className="font-semibold">State</span>,
            cell: (info: CellContext<TSeverityRule, unknown>) => (
                <div className="flex items-center gap-2">
                    {/* {statusColors(info.getValue() as string)} */}
                </div>
            ),
        },
        {
            accessorKey: "sourceType",
            header: () => <span className="font-semibold">Type</span>,
            cell: (info: CellContext<TSeverityRule, unknown>) =>
                info.getValue() as string,
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
    const { control, formState: { isValid, errors }, setValue, watch } = useForm({
        resolver: zodResolver(formScheme),
        mode: "onChange",
        defaultValues: {
            enable: "true",
            environment: "production",
            isMajor: true,
            name: "",
            note: "",
            serviceScope: "",
            severity: "",
            signal: "",
            threshold: ""
        }
    })

    return (
        <div>
            <FormWrapper
                title=' A. Severity rules'
                subtitle='Turn signals into P1–P4 consistently.'
                label='These rules drive incident priority, paging, and how Ezra writes summaries for leadership vs analysts.'
                actionText={"Add rule"}
                action={() => setOpenModal(true)}
            >
                <div className='space-y-3'>
                    <Table columns={columns} data={[]} />
                    <div className='border border-gray-400 p-3 rounded-lg'>
                        <div className='flex justify-between'>
                            <div>
                                <div className='flex items-center gap-2 text-sm'>
                                    <AiStarIcon />
                                    <p>Major incident mode</p>
                                </div>
                                <p className='text-xs'>When enabled, Scrubbe escalates comms, creates an incident room, and prompts Ezra to write exec updates.</p>
                            </div>
                            <Switch size="sm" color="success" checked />
                        </div>
                        <div className='grid grid-cols-2 gap-4 mt-2'>
                            <Select options={[{ value: "p1 only", label: "P1 only" },
                            { value: "p1 + p2", label: "P1 + P2" },
                            { value: "p1 - p2", label: "P1 - P2" },
                            ]}
                                label='Major threshold'
                                labelClassName=' text-white' />
                            <Select options={[
                                { value: "Every 15 minutes", label: "Every 15 minutes" },
                                { value: "Every 30 minutes", label: "Every 30 minutes" },
                                { value: "Every 60 minutes", label: "Every 60 minutes" },
                            ]} label='Status update cadence' labelClassName=' text-white' />
                        </div>
                    </div>
                    <div className='border border-gray-400 p-3 rounded-lg space-y-3'>
                        <div className='flex justify-between'>
                            <div>
                                <div className='flex items-center gap-2 text-sm'>
                                    <AiStarIcon />
                                    <p>Ezra summary policy</p>
                                </div>
                                <p className='text-xs'>Decide what Ezra emphasizes by default. Analysts can override per incident.</p>
                            </div>
                        </div>

                        <TextArea placeholder='Optional : house styles , terms to avoid , how to talk about customers , etc' className='!bg-dark' />
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
                            <p className='pt-2 text-sm'>Evaluates signals (metrics, alerts, fraud spikes, pipeline failures) into severities.</p>
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
                                        <Select {...field}
                                            options={[
                                                { value: "true", label: "Enable" },
                                                { value: "false", label: "Disable" }
                                            ]}
                                            label='Enabled'
                                            labelClassName='text-white'
                                            error={errors.enable?.message} />
                                    )}
                                />
                                <Controller
                                    name="signal"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field}
                                            options={[
                                                { value: "pipeline_failure", label: "Pipeline Failure" },
                                                { value: "error_rate_5xx", label: "Error Rate 5xx" },
                                                { value: "availability", label: "Availability" },
                                                { value: "fraud_spike", label: "Fraud Spike" },
                                            ]}
                                            label='Signal'
                                            labelClassName='text-white'
                                            error={errors.signal?.message} />
                                    )}
                                />
                                <Controller
                                    name="threshold"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} placeholder='eg >5% for 5m' label='Threshold' labelClassName='text-white' error={errors.threshold?.message} />
                                    )}
                                />
                            </div>
                            <div className='grid grid-cols-3 gap-x-3'>
                                <Controller
                                    name="environment"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field}
                                            options={[
                                                { value: "production", label: "Production" },
                                                { value: "staging", label: "Staging" },
                                                { value: "any", label: "any" },
                                            ]}
                                            label='Environment'
                                            labelClassName='text-white'
                                            error={errors.environment?.message} />
                                    )}
                                />
                                <Controller
                                    name="serviceScope"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} placeholder='' label='Service Scope' labelClassName='text-white' error={errors.serviceScope?.message} />
                                    )}
                                />
                                <Controller
                                    name="severity"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field}
                                            options={[
                                                { value: "p1", label: "P1" },
                                                { value: "p2", label: "P2" },
                                                { value: "p3", label: "P3" },
                                                { value: "p4", label: "P4" },
                                            ]}
                                            label="Severity"
                                            labelClassName='text-white'
                                            error={errors.severity?.message} />
                                    )}
                                />
                            </div>
                            <div className='border border-zinc-300 rounded-lg p-3 flex items-center justify-between'>
                                <div>
                                    <div>
                                        <p className='text-sm font-semibold'>Mark as Major Incident when matched</p>
                                    </div>
                                    <p className='text-xs'>Overrides major threshold if checked.</p>
                                </div>
                                <Switch checked={watch("isMajor")} onChange={(e) => setValue("isMajor", e.target.checked)} size="sm" color="success" />
                            </div>
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

export default SeverityRules