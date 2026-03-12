import CButton from '@/components/ui/Cbutton'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import React, { useRef } from 'react'

export type QuietRule = {
  name: string;
  startTime: string;
  endTime: string;
  timezone: string;
  daysOfWeek: number[];
  teamScope?: string;
  isActive: boolean;
};

interface Props {
    onClose: () => void;
    onSave?: (rule: QuietRule) => void;
    editItem?: QuietRule;
}

const QuietRuleForm = ({onClose, onSave, editItem}: Props) => {
  const nameRef = useRef<HTMLInputElement>(null)
  const startRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLInputElement>(null)
  const tzRef = useRef<HTMLSelectElement>(null)
  const teamRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const name = nameRef.current?.value ?? ''
    const startTime = startRef.current?.value ?? ''
    const endTime = endRef.current?.value ?? ''
    if (!name || !startTime || !endTime) return
    onSave?.({ name, startTime, endTime, timezone: tzRef.current?.value ?? 'UTC', daysOfWeek: [1,2,3,4,5], teamScope: teamRef.current?.value, isActive: true })
    onClose()
  }

  return (
    <div>
        <Input labelClassName='text-white' className='text-white' label='Team / Service name' ref={nameRef as React.RefObject<HTMLInputElement>} defaultValue={editItem?.name}/>
        <div className='space-y-1'>
            <label className='text-sm text-white font-medium' htmlFor="">Quiet Window</label>
            <div className='grid grid-cols-2 items-center gap-3 w-full'>
                <Input labelClassName='text-white' className='text-white' label="Start" type="time" ref={startRef as React.RefObject<HTMLInputElement>} defaultValue={editItem?.startTime}/>
                <Input labelClassName='text-white' className='text-white' label="End" type="time" ref={endRef as React.RefObject<HTMLInputElement>} defaultValue={editItem?.endTime}/>
            </div>
        </div>
        <Select labelClassName='text-white' className='text-white' label='Timezone' ref={tzRef as React.RefObject<HTMLSelectElement>} options={[
            {value: 'UTC', label: 'UTC'},
            {value: 'America/New_York', label: 'America/New_York'},
            {value: 'America/Los_Angeles', label: 'America/Los_Angeles'},
            {value: 'Europe/London', label: 'Europe/London'},
            {value: 'Africa/Lagos', label: 'Africa/Lagos'},
        ]}/>
        <Input labelClassName='text-white' className='text-white' label='Team Scope (optional)' placeholder='e.g. payments-team' ref={teamRef as React.RefObject<HTMLInputElement>} defaultValue={editItem?.teamScope}/>

        <div className='flex justify-end gap-4'>
            <CButton onClick={onClose} className='border border-IMSCyan bg-transparent hover:bg-transparent text-IMSCyan w-fit'>Cancel</CButton>
            <CButton className='w-fit' onClick={handleSave}>Create Rule</CButton>
        </div>
    </div>
  )
}

export default QuietRuleForm
