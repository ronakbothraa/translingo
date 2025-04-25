import React from 'react'
import { Combobox } from './language-selector'

const Translate = () => {
  return (
    <div className='w-full rounded-lg border p-6 shadow-md'>
      <section className='flex justify-between'>
        <h2 className='text-2xl font-bold'>Translation</h2>
        <Combobox />
      </section>
      <div className='mt-4 h-36 overflow-auto'>
        <div className=''>something</div>
      </div>
    </div>
  )
}

export default Translate
