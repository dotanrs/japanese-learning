// Japanese text-to-speech via the browser's built-in Web Speech API.
// No dependency, no network, no API key — but voice availability differs per
// browser/OS, so every caller must cope with `false`.

const isJa = (voice) => voice.lang && voice.lang.toLowerCase().replace('_', '-').startsWith('ja')

export function hasSpeech() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// Chrome populates the voice list asynchronously and returns [] on the first
// call, so subscribe and re-check until a Japanese voice shows up (or doesn't).
export function watchJapaneseVoice(onResult) {
  if (!hasSpeech()) {
    onResult(false)
    return () => {}
  }
  const synth = window.speechSynthesis
  let cancelled = false

  const check = () => {
    if (cancelled) return
    const voices = synth.getVoices()
    // An empty list means "not loaded yet", not "no Japanese voice".
    if (voices.length > 0) onResult(voices.some(isJa))
  }

  synth.addEventListener('voiceschanged', check)
  check()
  // Safari never fires voiceschanged when the list is already warm; one late
  // poll covers the case where it also returned [] on the first call.
  const timer = setTimeout(check, 1000)

  return () => {
    cancelled = true
    clearTimeout(timer)
    synth.removeEventListener('voiceschanged', check)
  }
}

export function speakJapanese(text) {
  if (!hasSpeech()) return false
  const synth = window.speechSynthesis
  synth.cancel() // drop whatever the previous card queued
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ja-JP'
  utterance.rate = 0.85 // learner pace; mora length is meaning-bearing here
  const voice = synth.getVoices().find(isJa)
  try {
    if (voice) utterance.voice = voice
  } catch {
    // Some engines reject the assignment; the ja-JP lang hint alone still works.
  }
  synth.speak(utterance)
  return true
}
