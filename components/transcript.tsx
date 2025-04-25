import { Transcriber } from '@/lib/types'
import { useState } from 'react'

interface Props {
  transcriber: Transcriber
}

export default function Transcript({ transcriber }: Props) {
  const [output, setOutput] = useState<string | undefined>('')

  const full_output = transcriber.output?.text
  const isProcessing = transcriber.isProcessing

  if (full_output && full_output !== output) {
    setOutput(full_output)
  }

  return (
    <section className='w-full rounded-lg border p-6 shadow-md'>
      <h2 className='text-2xl font-bold'>Transcription</h2>
      <div className='mt-4 h-36 overflow-auto'>
        {output ? (
          <>
            <pre className='whitespace-pre-wrap'>
              {output}
              <div className='ml-3 h-3 w-3 animate-pulse rounded-full bg-gray-300' />
            </pre>
          </>
        ) : isProcessing ? (
          <div
            className={`h-4 rounded bg-gray-200 ${isProcessing && 'animate-pulse'}`}
          ></div>
        ) : (
          <p>Start Speaking</p>
        )}
      </div>
    </section>
  )
}
