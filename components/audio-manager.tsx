// audio-manager.tsx:
'use client'

import axios from 'axios'
import { Transcriber } from '@/lib/types' // Assuming Transcriber type includes necessary state/methods
import { useCallback, useEffect, useState, useRef } from 'react' // Added useRef

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
  buffer: AudioBuffer // Represents the *full* buffer when recording stops or URL is loaded
  url: string
  source: AudioSource
  mimeType: string
}

export default function AudioManager({
  transcriber
}: {
  transcriber: Transcriber // Ensure this object can handle chunked input and expose results
}) {

  const [audioData, setAudioData] = useState<AudioData | undefined>(undefined)
  const [url, setUrl] = useState<string | undefined>(undefined)
  // Use a ref for AudioContext to avoid recreating it constantly
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext once
  useEffect(() => {
      if (!audioContextRef.current) {
           // Use the sample rate expected by the transcriber
          audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      }
      // Cleanup context on unmount
      return () => {
          audioContextRef.current?.close().catch(console.error);
          audioContextRef.current = null;
      }
  }, []);


  const onUrlChange = (url: string) => {
    transcriber.onInputChange() // Reset transcriber state
    setAudioData(undefined)
    setUrl(url)
  }

  const resetAudio = () => {
    transcriber.onInputChange() // Reset transcriber state
    setAudioData(undefined)
    setUrl(undefined)
    // Potentially clear any displayed live transcript here too
  }

  // This function now primarily handles the *final* blob after recording stops
  const setAudioFromFinalRecording = async (data: Blob) => {
    // No need to call resetAudio() here, as that clears everything.
    // We might want to keep the live transcript visible.
    transcriber.onInputChange(); // Reset potential errors from live transcription

    const blobUrl = URL.createObjectURL(data)
    const fileReader = new FileReader()

    fileReader.onloadend = async () => {
       if (!audioContextRef.current) {
            console.error("AudioContext not initialized");
            return;
       }
       try {
            const arrayBuffer = fileReader.result as ArrayBuffer
            const decoded = await audioContextRef.current.decodeAudioData(arrayBuffer)

            setAudioData({
                buffer: decoded, // Store the full decoded buffer
                url: blobUrl,
                source: AudioSource.RECORDING,
                mimeType: data.type || 'audio/wav' // Use actual type or default
            })
            console.log('Full audio data set from recording:', audioData)
       } catch(error) {
            console.error("Error decoding final audio recording:", error);
            // Handle decoding error (e.g., show message to user)
       }
    }
    fileReader.onerror = (error) => {
        console.error("FileReader error on final recording:", error);
    }

    fileReader.readAsArrayBuffer(data)
  }

  // --- NEW: Handler for audio chunks during recording ---
  const handleChunkRecorded = async (chunkBlob: Blob) => {
    if (!transcriber || !audioContextRef.current) {
      console.log("Transcriber or AudioContext not ready.");
      return;
    }
    // Optional: Check if transcriber is busy if it processes sequentially
    if (transcriber.isProcessing) {
        console.log("Transcriber is busy, skipping chunk.");
        return;
    }

    try {
      const arrayBuffer = await chunkBlob.arrayBuffer();
      // Decode the small chunk
      const decodedChunk = await audioContextRef.current.decodeAudioData(arrayBuffer);

      // Call the transcriber's method with the chunk
      // Assuming transcriber.start() or a similar method can handle chunks
      // and update its internal state / trigger UI updates for the transcript.
      console.log(`Processing audio chunk of length: ${decodedChunk.length} samples`);
      await transcriber.start(decodedChunk); // Or e.g., transcriber.processChunk(decodedChunk)

      // NOTE: Displaying the transcript requires the `transcriber` object
      // to expose its state (e.g., `transcriber.currentTranscript`) and
      // this component (or a parent) to re-render based on that state.
      // Example: setLiveTranscript(transcriber.currentTranscript);

    } catch (error) {
      console.error("Error processing audio chunk:", error);
       // Maybe update UI to show an error occurred during live transcription
    }
  }
  // -----------------------------------------------------


  const downloadAudioFromUrl = useCallback(
    async (
      url: string | undefined,
      requestAbortController: AbortController
    ) => {
      if (url && audioContextRef.current) {
        try {
          setAudioData(undefined) // Clear previous data

          const { data, headers } = (await axios.get(url, {
            signal: requestAbortController.signal,
            responseType: 'arraybuffer'
          })) as {
            data: ArrayBuffer
            headers: { 'content-type': string }
          }

          let mimeType = headers['content-type']
          // Basic MIME type correction/defaulting
          if (!mimeType || mimeType === 'audio/wave') {
             mimeType = 'audio/wav'
          } else if (mimeType === 'audio/mpeg') {
             mimeType = 'audio/mp3';
          } // Add more as needed

          const blobUrl = URL.createObjectURL(
             // Use the fetched mimeType
            new Blob([data], { type: mimeType || 'audio/*' })
          )

          const decoded = await audioContextRef.current.decodeAudioData(data)

          setAudioData({
            buffer: decoded,
            url: blobUrl,
            source: AudioSource.URL,
            mimeType: mimeType
          })
        } catch (error) {
           if (axios.isCancel(error)) {
                console.log('Request aborted', error.message);
           } else {
               console.error('Request failed or error decoding audio from URL', error)
               // Handle error appropriately (e.g., show message to user)
           }
        }
      } else if (!audioContextRef.current) {
          console.error("AudioContext not available for downloading URL");
      }
    },
    [] // audioContextRef is stable via useRef, no need to include
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

  return (
    <section className='w-full max-w-2xl rounded-lg border p-6 shadow-md'>
      <div className='flex h-full flex-col items-start gap-6'>
        <div className='flex w-full justify-between gap-4'> {/* Added gap */}
          <div className='flex'>
            <UrlDialog onUrlChange={onUrlChange} />
          </div>
          <div className='flex'>
             {/* Pass both handlers to AudioRecorder */}
            <AudioRecorder
               onLoad={setAudioFromFinalRecording} // Handles the final blob on stop
               onChunkRecorded={handleChunkRecorded} // Handles chunks during recording
            />
          </div>
        </div>

        {/* Conditionally render based on full audio data being ready */}
        {audioData && (
          <>
            <AudioPlayer
              audioUrl={audioData.url}
              mimeType={audioData.mimeType}
            />

            <div className='mt-auto flex w-full items-center justify-between'>
              {/* This button now likely triggers transcription on the *entire* loaded/recorded audio */}
              <Button onClick={() => transcriber.start(audioData.buffer)} disabled={transcriber.isProcessing}>
                {transcriber.isModelLoading ? (
                  <>
                    <Loader className='mr-2 h-4 w-4 animate-spin' /> {/* Added margin */}
                    <span>Loading model...</span>
                  </>
                ) : transcriber.isProcessing ? (
                  <>
                    <Loader className='mr-2 h-4 w-4 animate-spin' />
                    <span>Processing...</span>
                  </>
                ) : (
                   // Clarify button action if live transcription also happens
                  <span>Transcribe Full Audio</span>
                )}
              </Button>

              <Button variant='outline' onClick={resetAudio}>
                Reset
              </Button>
            </div>
          </>
        )}

         {/* Placeholder for Live Transcript Display */}
         {/* This part needs implementation based on how `transcriber` exposes its results */}
         {/* Example:
         <div className="w-full mt-4 p-4 border rounded bg-gray-50 min-h-[100px]">
             <h3 className="font-semibold mb-2">Live Transcript:</h3>
             <p>{transcriber.currentTranscript || "Waiting for audio..."}</p>
         </div>
         */}
      </div>
    </section>
  )
}