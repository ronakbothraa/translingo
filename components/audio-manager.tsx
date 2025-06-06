'use client'

import axios from 'axios'
import { Transcriber } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import AudioPlayer from '@/components/audio-player'
import { UrlDialog } from '@/components/url-dialog'

import { Loader } from 'lucide-react'
import { AudioRecorder } from './audio-recorder'

export enum AudioSource {
  URL = 'URL',
  FILE = 'FILE',
  RECORDING = 'RECORDING'
}

interface AudioData {
  buffer: AudioBuffer
  url: string
  source: AudioSource
  mimeType: string
}

export default function AudioManager({
  transcriber
}: {
  transcriber: Transcriber
}) {
  const [audioData, setAudioData] = useState<AudioData | undefined>(undefined)
  const [url, setUrl] = useState<string | undefined>(undefined)

  const onUrlChange = (url: string) => {
    transcriber.onInputChange()
    setAudioData(undefined)
    setUrl(url)
  }

  const resetAudio = () => {
    transcriber.onInputChange()
    setAudioData(undefined)
    setUrl(undefined)
  }

  const setAudioFromRecording = async (data: Blob) => {
    resetAudio()

    const blobUrl = URL.createObjectURL(data)
    const fileReader = new FileReader()

    fileReader.onloadend = async () => {
      const audioCTX = new AudioContext({ sampleRate: 16000 })
      const arrayBuffer = fileReader.result as ArrayBuffer
      const decoded = await audioCTX.decodeAudioData(arrayBuffer)

      setAudioData({
        buffer: decoded,
        url: blobUrl,
        source: AudioSource.RECORDING,
        mimeType: data.type
      })

    }

    fileReader.readAsArrayBuffer(data)
  }

  const voiceClone = async (audioUrl: string): Promise<string> => {
    const response = await fetch('http://localhost:5000/getTranslatedText')
    const responseData = await response.json()

    // Access properties from the object
    const translated_text = responseData.translated_text
    const language = responseData.language

    console.log('Translated text:', translated_text)
    console.log('Language:', language)
    console.log('Audio URL:', audioUrl)

    const audioResponse = await fetch(`http://127.0.0.1:5000/tts`, {
      method: 'POST',
      body: JSON.stringify({
        text: translated_text,
        audioUrl,
        language: language
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return ''
  }

  const downloadAudioFromUrl = useCallback(
    async (
      url: string | undefined,
      requestAbortController: AbortController
    ) => {
      if (url) {
        try {
          setAudioData(undefined)

          const { data, headers } = (await axios.get(url, {
            signal: requestAbortController.signal,
            responseType: 'arraybuffer'
          })) as {
            data: ArrayBuffer
            headers: { 'content-type': string }
          }

          let mimeType = headers['content-type']
          if (!mimeType || mimeType === 'audio/wave') {
            mimeType = 'audio/wav'
          }

          const audioCTX = new AudioContext({ sampleRate: 16000 })
          const blobUrl = URL.createObjectURL(
            new Blob([data], { type: 'audio/*' })
          )

          const decoded = await audioCTX.decodeAudioData(data)

          setAudioData({
            buffer: decoded,
            url: blobUrl,
            source: AudioSource.URL,
            mimeType: mimeType
          })
        } catch (error) {
          console.log('Request failed or aborted', error)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (url) {
      const requestAbortController = new AbortController()
      downloadAudioFromUrl(url, requestAbortController)
      return () => {
        requestAbortController.abort()
      }
    }
  }, [downloadAudioFromUrl, url])

  useEffect(() => {
    if (audioData) {
      transcriber.onInputChange()
      transcriber.start(audioData.buffer)
    }
  }, [audioData])

  return (
    <section className='w-full rounded-lg border p-6 shadow-md'>
      <div className='flex h-full flex-col items-start gap-6'>
        <div className='flex w-full justify-between'>
          <div className='flex'>
            <UrlDialog onUrlChange={onUrlChange} />
          </div>
          <div className='flex'>
            <AudioRecorder
              onLoad={data => {
                transcriber.onInputChange()
                setAudioFromRecording(data)
                voiceClone(URL.createObjectURL(data))
              }}
            />
          </div>
        </div>

        {url && (
          <>
            <AudioPlayer
              audioUrl={audioData?.url ?? ''}
              mimeType={audioData?.mimeType ?? ''}
            />

            <div className='mt-auto flex w-full items-center justify-between'>
              <Button onClick={() => transcriber.start(audioData?.buffer)}>
                {transcriber.isModelLoading ? (
                  <>
                    <Loader className='animate-spin' />
                    <span>Loading model</span>
                  </>
                ) : transcriber.isProcessing ? (
                  <>
                    <Loader className='animate-spin' />
                    <span>Transcribing</span>
                  </>
                ) : (
                  <span>Transcribe</span>
                )}
              </Button>
            </div>
          </>
        )}
        {/* <Button variant='outline' onClick={resetAudio}>
          Reset
        </Button> */}
      </div>
    </section>
  )
}
