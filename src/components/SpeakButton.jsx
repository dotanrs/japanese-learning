import { useState } from 'react'
import { speakJapanese } from '../lib/speech.js'

// The 🔊 control used by the word cards and the translate box. Renders nothing
// when the device has no Japanese voice — callers explain the absence once,
// rather than every button pretending it works.
export default function SpeakButton({ jp, enabled, className = '', onPlay }) {
  const [speaking, setSpeaking] = useState(false)
  // A voice can be listed and still fail to speak — several Android voices
  // synthesise over the network, so they go quiet when the phone is offline.
  // Say so on the button instead of doing nothing.
  const [failed, setFailed] = useState(false)

  if (!enabled || !jp) return null

  const label = failed
    ? 'Audio failed — this device\u2019s Japanese voice may need the network. ' +
      'Installing an offline Japanese voice fixes it.'
    : `Hear ${jp}`

  return (
    <button
      className={
        'speak-btn ' + className + (speaking ? ' speaking' : '') + (failed ? ' failed' : '')
      }
      title={label}
      aria-label={failed ? label : `Hear ${jp} spoken in Japanese`}
      onClick={(e) => {
        e.stopPropagation() // never flip the card / submit the form underneath
        // Speaking cancels the engine's queue, which would otherwise let a
        // running story advance to its next line. Let the caller stop it first.
        onPlay?.()
        setFailed(false) // a retry deserves a clean slate
        speakJapanese(jp, { onError: () => setFailed(true) })
        setSpeaking(true)
        setTimeout(() => setSpeaking(false), 900)
      }}
    >
      {failed ? '🔇' : '🔊'}
    </button>
  )
}
