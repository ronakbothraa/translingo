import React, { useState, useEffect } from 'react'
import { SelectLanguage } from './language-selector'
import { Transcriber } from '@/lib/types'

interface Props {
  transcriber: Transcriber
}

function Translate({ transcriber }: Props) {
  const [translatedText, setTranslatedText] = useState<string | undefined>('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en')

  const sourceText = transcriber.output?.text

  console.log('Current translatedText state:', translatedText)
  
  async function changeSelectedLanguage(language: string): Promise<void> {
    setSelectedLanguage(language)
    const a = await fetch('http://localhost:5000/start', {
      method: 'POST',
      body: JSON.stringify({
        outputLanguage: language
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => console.log(res.json()))
  }

  useEffect(() => {
    const performTranslation = async (textToTranslate: string) => {
      setIsLoading(true)

      try {
        const res = await fetch('http://localhost:5000/translate', {
          method: 'POST',
          body: JSON.stringify({
            text: textToTranslate
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const data = await res.json()
        console.log('Translation response: ', data)
        setTranslatedText(data[0].translated_text)
      } catch (error) {
        console.error('Translation failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (sourceText && sourceText.trim() !== '') {
      performTranslation(sourceText)
    } else {
      setIsLoading(false)
    }
  }, [sourceText])

  return (
    <div className='w-full rounded-lg border p-6 shadow-md'>
      <section className='flex justify-between'>
        <h2 className='text-2xl font-bold'>Translation</h2>
        <SelectLanguage onChange={changeSelectedLanguage} />
      </section>
      <div className='mt-4 h-36 overflow-auto'>
        {translatedText ? (
          <pre className='whitespace-pre-wrap'>
            {translatedText}
            <div className='ml-3 h-3 w-3 animate-pulse rounded-full bg-gray-300' />
          </pre>
        ) : isLoading ? (
          <div
            className={`h-4 rounded bg-gray-200 ${isLoading && 'animate-pulse'}`}
          ></div>
        ) : (
          <p>Start Speaking</p>
        )}
      </div>
    </div>
  )
}

export default Translate
