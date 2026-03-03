import React from 'react'
import SettingWrapper from './setting-wrapper'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import { popularTimezones } from '@/lib/constant/index'
import { FaCodeBranch } from 'react-icons/fa'
import { Switch } from '@heroui/react'
import CButton from '@/components/ui/Cbutton'

function Settings() {
  return (
    <div>
      <SettingWrapper title='Organization' description='Tenant identity and operating profile' sub='Names, domains, environments, and basic org controls used across Scrubbe.'>
        <div className='grid grid-cols-2 pt-5 gap-5'>
          <div className='border rounded-xl border-neutral-500 p-4 space-y-3'>
            <p className='text-base text-white'>Profile</p>
            <Input label='Organization name' labelClassName='text-white' className='text-white' />
            <Input label='Primary domain' labelClassName='text-white' className='text-white' />
            <Input label='Allowed email domain' labelClassName='text-white' className='text-white' />
            <Select label='Default timezone' labelClassName='text-white' options={popularTimezones} className='text-white'
            />
          </div>
          <div className='border rounded-xl border-neutral-500 p-4 space-y-3'>
            <p className='text-base text-white'>Environment</p>
            <Input label='Production env name' labelClassName='text-white' className='text-white' />
            <Input label='Staging env name' labelClassName='text-white' className='text-white' />
            <Select label='Default region' labelClassName='text-white' options={popularTimezones} className='text-white'/>
            <Input label='Environment tags' labelClassName='text-white' className='text-white' />
            <div className='border border-neutral-500 rounded-xl p-3'>
              <div className='flex justify-between'>
                <div className='flex items-center gap-2'>
                  <FaCodeBranch className=' text-orange-500'/>
                  <p className='text-sm text-white'>Enable multi-env routing</p>
                </div>
                <Switch size="sm" color="success"/>
              </div>
              <p className='text-gray-200 text-sm'>Allow policies/playbooks to scope actions per environment.</p>
            </div>
          </div>           
           </div>
           <div className='flex justify-end py-4'>
           <CButton className='w-fit '>
            Save
           </CButton>
           </div>
      </SettingWrapper>
    </div>
  )
}

export default Settings