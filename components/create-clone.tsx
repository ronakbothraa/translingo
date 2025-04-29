'use client'

import React, { useRef, useState } from 'react'
import { Button } from './ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { generatePronunciation } from '@/lib/gemini'

import { SelectLanguage } from './language-selector'
import { Mic, Pause, Play, Square } from 'lucide-react'

const CreateCloneButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [audioData, setAudioData] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = React.useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const [inputLanguage, setInputLanguage] = useState('')
  const [outputLanguage, setOutputLanguage] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recordingTimeRef = useRef(0)

  const handlePronunciation = async () => {
    if (inputLanguage !== "" && outputLanguage != "") {
      const response = await generatePronunciation({
        inpLang: inputLanguage,
        outLang: outputLanguage
      })
      console.log(response)
    }
    setInputLanguage('')
    setOutputLanguage('')
    return ""
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav'
        })
        setAudioData(audioBlob)
        setAudioUrl(URL.createObjectURL(audioBlob))
      }

      // Start recording
      mediaRecorder.start(3000)
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
        recordingTimeRef.current += 1
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        // Resume recording
        mediaRecorderRef.current.resume()
        setIsPaused(false)

        // Restart timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        // Pause recording
        mediaRecorderRef.current.pause()
        setIsPaused(true)

        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
    }
  }

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Stop recording
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Stop all tracks on the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className='cursor-pointer bg-green-700 hover:bg-green-800'>
            create clone
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Create Clone</DialogTitle>
            <DialogDescription>
              <div className='flex items-center justify-between'>
                <span>Language you're fluent in: </span>
                <SelectLanguage onChange={setInputLanguage} />
              </div>
              <div className='mt-4 flex items-center justify-between'>
                <span>Language you want to clone: </span>
                <SelectLanguage onChange={setOutputLanguage} />
              </div>
            </DialogDescription>
          </DialogHeader>
          
          {inputLanguage && outputLanguage && handlePronunciation()}


          {audioData && audioUrl && (
            <div className='mt-4 w-full'>
              <h3 className='mb-2 text-sm font-medium'>Recorded Audio</h3>
              <audio className='w-full' controls>
                <source src={audioUrl} type={audioData.type} />
              </audio>
            </div>
          )}

          <DialogFooter>
            {!isRecording ? (
              <Button onClick={startRecording} size='icon' variant='default'>
                <Mic className='h-5 w-5' />
              </Button>
            ) : (
              <>
                <div className='flex w-full items-center justify-center'>
                  <div className='font-mono text-lg'>
                    {formatTime(recordingTime)}
                  </div>
                  {isRecording && !isPaused && (
                    <div className='ml-3 h-3 w-3 animate-pulse rounded-full bg-red-500' />
                  )}
                </div>
                <Button onClick={pauseRecording} size='icon' variant='outline'>
                  {isPaused ? (
                    <Play className='h-5 w-5' />
                  ) : (
                    <Pause className='h-5 w-5' />
                  )}
                </Button>

                <Button
                  onClick={stopRecording}
                  size='icon'
                  variant='destructive'
                >
                  <Square className='h-5 w-5' />
                </Button>
              </>
            )}

            <Button className='max-w-[70px] bg-green-700'>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateCloneButton
