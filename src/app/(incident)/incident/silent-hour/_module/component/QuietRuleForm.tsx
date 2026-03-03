import CButton from '@/components/ui/Cbutton'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import React from 'react'

interface Props {
    onClose: () => void;
    editItem?:any
}
const QuietRuleForm = ({onClose, editItem}:Props) => {
  return (
    <div>
        <Input labelClassName='text-white' className='text-white' label='Team / Service name'/>
        <div className='space-y-1'>
        <label className='text-sm text-white font-medium' htmlFor="">Quiet Window</label>
        <div className='grid grid-cols-2 items-center gap-3 w-full'>
        <Input labelClassName='text-white' className='text-white ' label="" type="time"/>
        <Input labelClassName='text-white' className='text-white ' label="" type="time"/>
        </div>
        </div>
        <Select labelClassName='text-white' className='text-white' label='Suppression behaviour' options={[
            {value: "P2 & below silenced at night", label: "P2 & below silenced at night"},
            {value: "Only P3+ suppressed", label: "Only P3+ suppressed"},
            {value: "Full quiet after 22:00", label: "Full quiet after 22:00"},
            {value: "Custom severity tiers", label: "Custom severity tiers"},
        ]}/>

        <div className='flex justify-end gap-4'>
            <CButton onClick={onClose} className='border border-IMSCyan bg-transparent hover:bg-transparent text-IMSCyan w-fit'>Cancel</CButton>
            <CButton className='w-fit'>Create Rule</CButton>
        </div>
    </div>
  )
}

export default QuietRuleForm