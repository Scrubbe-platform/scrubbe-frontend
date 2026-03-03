"use client"
import React, { useState } from 'react'
import FormWrapper from '../FormWrapper'
import { z } from 'zod'
import Input from '@/components/ui/input'
import CButton from '@/components/ui/Cbutton'
import { Switch } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import SideModal from '@/components/ui/SideModal'
import { BiInfoCircle } from 'react-icons/bi'
import TextArea from '@/components/ui/text-area'
import Select from '@/components/ui/select'



const notifications = [
    { title: "Slack", value: "slack" },
    { title: "Microsoft Teams", value: "teams" },
    { title: "Email", value: "email" },
    { title: "SMS/Voice", value: "sms" }
]

const formScheme = z.object({
    name: z.string().nonempty(),
    enable: z.string(),
    note: z.string().optional(),
})

type TformScheme = z.infer<typeof formScheme>
const RoutingNotification = () => {
    const [openModal, setOpenModal] = useState(false)
    const [notification, setNotification] = useState<Record<string, boolean>>({
        slack: false,
        teams: false,
        email: false,
        sms: false
    })
    const { control, formState: { isValid, errors }, setValue, watch } = useForm({
        resolver: zodResolver(formScheme),
        mode: "onChange",
        defaultValues: {
            enable: "true",
            name: "",
            note: "",
        }
    })
    const handleTestNotication = () => { }
    return (
        <div>
            <FormWrapper
                title=' B. Routing & notifications'
                subtitle='Make sure the right humans hear about the right incidents.'
                label='Scrubbe can notify Slack/Teams/email now, and later integrate deeper paging tools if needed.'
                actionText={"Configure Routing"}
                action={() => setOpenModal(true)}
            >
                <div className='border border-gray-400 p-3 rounded-lg'>
                    <p className='text-sm'>On-call  routing (global default)</p>
                    <div className='grid grid-cols-2 gap-x-3 mt-3'>
                        <Select options={[
                            { value: "", label: "Select..." },
                            { value: "Primary SRE", label: "Primary SRE" },
                            { value: "Platform On-call", label: "Platform On-call" },
                            { value: "Payment On-call", label: "Payment On-call" },
                            { value: "Custom Rotation", label: "Custom Rotation" },
                        ]} className="!bg-dark" labelClassName='!text-white' label='P1 goes to' />
                        <Select options={[
                            { value: "", label: "Select..." },
                            { value: "Primary SRE", label: "Primary SRE" },
                            { value: "Platform On-call", label: "Platform On-call" },
                            { value: "Payment On-call", label: "Payment On-call" },
                            { value: "Custom Rotation", label: "Custom Rotation" },
                        ]} className="!bg-dark" labelClassName='!text-white' label='P2 goes to' />

                        <Select options={[
                            { value: "", label: "Select..." },
                            { value: "5 minutes", label: "5 minutes" },
                            { value: "10 minutes", label: "10 minutes" },
                            { value: "15 minutes", label: "15 minutes" },
                            { value: "30 minutes", label: "30 minutes" },
                        ]} className="!bg-dark" labelClassName='!text-white' label='Escalate if not acknowledge' />
                        <Select options={[
                            { value: "", label: "Select..." },
                            { value: "Team lead", label: "Team lead" },
                            { value: "Duty Manager", label: "Duty Manager" },
                            { value: "Exec Sponsor", label: "Exec Sponsor" },
                        ]} className="!bg-dark" labelClassName='!text-white' label='Escalate target' />
                    </div>
                    <p className='text-sm'>Routing is policy-only here. Actual on-call rotations can be synced after integrations.</p>
                    <div className='border border-gray-400 p-3 rounded-lg mt-3'>
                        <div className='flex justify-between'>
                            <p className='text-sm'>Notification channels</p>
                            <CButton onClick={handleTestNotication} className='border border-IMSCyan bg-transparent hover:bg-transparent text-IMSCyan w-fit h-8'>Test Notification</CButton>
                        </div>

                        <div className='space-y-2 mt-2'>
                            {
                                notifications.map((notificationItem) => (
                                    <div key={notificationItem.title} className='flex justify-between'>
                                        <p className='text-sm'>{notificationItem.title}</p>
                                        <Switch color="success" size="sm" checked={notification[notificationItem.value as string]} onChange={(e) => setNotification((prev) => ({ ...prev, [notificationItem.value]: !notification[notificationItem.value] }))} />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </FormWrapper>

            {
                openModal && <SideModal isOpen={openModal} onClose={() => setOpenModal(false)} title='Add severity rule' subTitle='Map signals to P1–P4 and optionally mark as major.'>
                    <div className='flex flex-col'>
                        <div className='border border-gray-300 rounded-md p-2'>
                            <div className='flex gap-2 items-center text-sm font-semibold'>
                                <BiInfoCircle className='size-4' />
                                <p>Rule type</p>
                            </div>
                            <p className='pt-2 text-sm'>Service-scoped overrides come later.</p>
                        </div>

                        <div className=' mt-4 flex-1'>
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
                                    )} />

                            </div>

                            <div className='border border-zinc-300 rounded-lg p-3 flex items-center justify-between'>
                                <div>
                                    <div>
                                        <p className='text-sm font-semibold'>Routing is configured on the main page.</p>
                                    </div>
                                    <p className='text-xs'>Use this drawer for future: service-scoped overrides.</p>
                                </div>
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
                </SideModal>
            }
        </div>
    )
}

export default RoutingNotification