"use client"
import { Search } from 'lucide-react'
import React from 'react'
import { IoFilter } from 'react-icons/io5'
import { TbGitFork } from 'react-icons/tb'

const Header = () => {
  return (
    <div className='flex justify-between gap-5'>
        <div>
            <p className='font-semibold text-white text-base'>Scrubbe IMS Pipelines</p>
            <p className='text-white max-w-lg text-base'>Configure governance, integrations, delivery failure ingestion, Ezra, Code Engine, and security controls (including SSO).</p>
        </div>
        <div>
        <div className="flex items-center gap-1 border border-neutral-400 rounded-lg px-2 mt-3 max-w-sm w-full">
          <div>
            <Search className="text-white " size={14} />
          </div>
          <input placeholder="Search repo , service , run id , PR number" className="h-9 border-none outline-none bg-transparent text-sm flex-1" />
        </div>
        </div>
        <div className='flex items-center gap-2'>
            <div className='text-sm px-2 py-1 border rounded-lg text-white flex items-center gap-1 flex-nowrap'><TbGitFork/>Delivery config</div>
            <div className='text-sm px-2 py-1 border rounded-lg text-white flex items-center gap-1 float-none'><IoFilter/>Filters</div>
            <div onClick={() => {}} className='text-sm px-2 py-1 border border-IMSCyan text-IMSCyan rounded-lg'>Create Incident</div>
        </div>
    </div>
  )
}

export default Header