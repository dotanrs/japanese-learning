import { useState } from 'react'
import { speakJapanese } from '../lib/speech.js'

// The 🔊 control used by the word cards and the translate box. Renders nothing
// when the device has no Japanese voice — callers explain the absence once,
// rather than every button pretending it works.
export default function SpeakButton({ jp, enabled, className = '', onPlay }) {
  const [speaking, setSpeaking] = useState(false)
  if (!enabled || !jp) return null

  return (
    <button
      className={'speak-btn ' + className + (speaking ? ' speaking' : '')}
      title={`Hear ${jp}`}
      aria-label={`Hear ${jp} spoken in Japanese`}
      onClick={(e) => {
        e.stopPropagation() // never flip the card / submit the form underneath
        // Speaking cancels the engine's queue, which would otherwise let a
        // running story advance to its next line. Let the caller stop it first.
        onPlay?.()
        speakJapanese(jp)
        setSpeaking(true)
        setTimeout(() => setSpeaking(false), 900)
      }}
    >
      🔊
    </button>
  )
}
