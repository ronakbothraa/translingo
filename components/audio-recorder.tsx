// audio-recorder.tsx:
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square, Play, Pause } from 'lucide-react'

// Define the timeslice duration in milliseconds (3 seconds)
const TIMESLICE_MS = 3000;

export function AudioRecorder({
  onLoad,
  onChunkRecorded // <-- Add new prop for handling chunks
}: {
  onLoad: (blob: Blob) => void
  onChunkRecorded?: (blob: Blob) => void // <-- Make it optional for flexibility
}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Start recording function
  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create media recorder
      // Try specifying a mimeType if WAV isn't default or causes issues
      // Example: const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = [] // Clear previous recording chunks

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          // Keep accumulating for the final blob if needed
          audioChunksRef.current.push(event.data);

          // --- NEW: Handle the chunk ---
          if (onChunkRecorded) {
            // Pass the individual chunk (Blob) to the handler
            onChunkRecorded(event.data);
          }
          // -----------------------------
        }
      }

      mediaRecorder.onstop = () => {
        // Combine *all* accumulated chunks for the final onLoad callback
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav' // Or use the mimeType detected/set if not forcing WAV
        })
        onLoad(audioBlob); // Original functionality: called when stopped

         // Clean up tracks and stream ref after stopping
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
         // Clear refs
        mediaRecorderRef.current = null;
      }

      // Start recording with a timeslice
      mediaRecorder.start(TIMESLICE_MS) // <-- Fire ondataavailable every 3 seconds
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)

      // Start timer for display
      timerRef.current = setInterval(() => {
        // Only increment time if not paused
        if (mediaRecorderRef.current?.state === 'recording') {
             setRecordingTime(prev => prev + 1)
        }
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone or starting recording:', error)
      // Reset state if failed
      setIsRecording(false);
      setIsPaused(false);
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
    }
  }

  // Pause recording function
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        // Timer continues based on state check inside setInterval
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        // Timer continues based on state check inside setInterval
    }
  }

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused') ) {
      // Stop recording - triggers the 'onstop' event handler
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      // Stream tracks are stopped in the `onstop` handler now
    }
  }

  // Format time function (no changes needed)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Cleanup on unmount (no changes needed here, stopRecording handles cleanup)
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      // Ensure cleanup if component unmounts while recording
      if (mediaRecorderRef.current?.state === 'recording' || mediaRecorderRef.current?.state === 'paused') {
          stopRecording();
      } else if (streamRef.current) { // Handle case where stream exists but recorder might not
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
    }
  }, [])


  // --- UI Rendering (Minor adjustments for clarity) ---
  return (
    <div className='flex w-full flex-col items-center space-y-2'>
      <div className='flex items-center space-x-4'> {/* Added items-center */}
        {!isRecording ? (
          <Button onClick={startRecording} size='icon' variant='default' title="Start Recording">
            <Mic className='h-5 w-5' />
          </Button>
        ) : (
          <>
            {/* Timer Display */}
            <div className='flex items-center justify-center'>
              <div className='font-mono text-lg min-w-[50px] text-right'> {/* Added min-width and text-right */}
                {formatTime(recordingTime)}
              </div>
              {/* Blinking Recording Indicator */}
              {isRecording && !isPaused && (
                <div className='ml-2 h-3 w-3 animate-pulse rounded-full bg-red-500' title="Recording"></div>
              )}
               {isRecording && isPaused && (
                <div className='ml-2 h-3 w-3 rounded-full bg-yellow-500' title="Paused"></div> // Added paused indicator
              )}
            </div>

            {/* Pause/Resume Button */}
            <Button onClick={pauseRecording} size='icon' variant='outline' title={isPaused ? "Resume Recording" : "Pause Recording"}>
              {isPaused ? (
                <Play className='h-5 w-5' />
              ) : (
                <Pause className='h-5 w-5' />
              )}
            </Button>

            {/* Stop Button */}
            <Button onClick={stopRecording} size='icon' variant='destructive' title="Stop Recording">
              <Square className='h-5 w-5' />
            </Button>
          </>
        )}
      </div>

       {/* Status Text */}
      {isRecording && (
        <div className='text-muted-foreground text-sm h-4'> {/* Added fixed height */}
          {isPaused ? 'Recording paused' : 'Recording...'}
        </div>
      )}
      {!isRecording && recordingTime > 0 && ( // Show message after stopping
           <div className='text-muted-foreground text-sm h-4'>Recording stopped. Ready for processing.</div>
      )}
       {!isRecording && recordingTime === 0 && ( // Placeholder height
           <div className='text-muted-foreground text-sm h-4'></div>
      )}
    </div>
  )
}