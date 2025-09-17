/*
  Reusable speech-to-text hook using the Web Speech API (webkitSpeechRecognition).
  - Works in Chrome/Edge. Provides listening state, interim and final transcripts.
  - Optionally accepts callbacks for onStart/onEnd/onResult/onError.
  - For non-supported browsers, returns supported=false.
*/

import { useCallback, useEffect, useRef, useState } from 'react'

type UseSpeechOptions = {
  lang?: string
  interimResults?: boolean
  continuous?: boolean
  onStart?: () => void
  onEnd?: () => void
  onResult?: (finalTranscript: string) => void
  onError?: (err: string) => void
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const {
    lang = typeof navigator !== 'undefined' ? (navigator.language || 'en-IN') : 'en-IN',
    interimResults = true,
    continuous = true,
    onStart,
    onEnd,
    onResult,
    onError,
  } = options

  const recognitionRef = useRef<any | null>(null)
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const SR: any = (typeof window !== 'undefined') && ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)
    if (!SR) {
      setSupported(false)
      return
    }
    setSupported(true)
    const recognition = new SR()
    recognition.lang = lang
    recognition.interimResults = interimResults
    recognition.continuous = continuous

    recognition.onstart = () => {
      setListening(true)
      setError(null)
      onStart?.()
    }

    recognition.onerror = (event: any) => {
      const message = event?.error || 'speech_recognition_error'
      setError(message)
      onError?.(message)
    }

    recognition.onresult = (event: any) => {
      let interim = ''
      let finalText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        if (res.isFinal) {
          finalText += res[0].transcript
        } else {
          interim += res[0].transcript
        }
      }
      if (interim) setInterimTranscript(interim)
      else setInterimTranscript('')
      if (finalText) {
        setTranscript(prev => (prev ? prev + ' ' : '') + finalText.trim())
        onResult?.(finalText.trim())
      }
    }

    recognition.onend = () => {
      setListening(false)
      onEnd?.()
      // do not clear transcript automatically; caller can reset when needed
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch {}
      recognitionRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, interimResults, continuous])

  const start = useCallback(() => {
    if (!supported || !recognitionRef.current) return
    try {
      setTranscript('')
      setInterimTranscript('')
      recognitionRef.current.start()
    } catch (e) {
      // Calling start while already started can throw; try restart
      try { recognitionRef.current.stop(); recognitionRef.current.start() } catch {}
    }
  }, [supported])

  const stop = useCallback(() => {
    if (!supported || !recognitionRef.current) return
    try {
      recognitionRef.current.stop()
    } catch {}
  }, [supported])

  const reset = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  return {
    supported,
    listening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  }
}

export default useSpeech
