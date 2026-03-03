import React, { ReactNode } from 'react'
import Header from './_modules/component/Header'
import Sidebar from './_modules/component/Sidebar'

const layout = ({children}:{children: ReactNode}) => {
  return (
    <div className='bg-dark min-h-screen p-6'>
        <Header/>
        <div className='grid grid-cols-[.4fr,1fr] mt-5 gap-4'>
            <div>
            <Sidebar/>
            </div>
            <div>{children}</div>
        </div>
    </div>
  )
}

export default layout