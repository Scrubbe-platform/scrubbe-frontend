import React from 'react'
import Header from './_modules/components/Header'
import Sidebar from './_modules/components/Sidebar'
import Content from './_modules/components/Content'

const page = () => {
  return (
    <div className='bg-dark min-h-screen p-10 flex flex-col gap-6'>
      <Header/>
      <div className='flex items-start gap-5'>
        <Sidebar/>
        <Content/>
      </div>
    </div>
  )
}

export default page