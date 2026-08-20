import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translate } from '../lib/translate.js'
import { hasSpeech, watchJapaneseVoice } from '../lib/speech.js'
import SpeakButton from './SpeakButton.jsx'

// One box, shown on every page, sharing its state: what you typed survives
// navigation, so you can look a phrase up and then go read about it.
const TranslatorContext = createContext(null)

export function TranslatorProvider({ children }) {
  const [text, setText] = useState('')
  const [canSpeak, setCanSpeak] = useState(false)

  useEffect(() => watchJapaneseVoice(setCanSpeak), [])

  // A lookup over ~500 phrases is cheap enough to redo as you type.
  const result = useMemo(() => translate(text), [text])

  const value = useMemo(
    () => ({ text, setText, result, canSpeak }),
    [text, result, canSpeak]
  )
  return (
    <TranslatorContext.Provider value={value}>{children}</TranslatorContext.Provider>
  )
}

const HEADINGS = {
  exact: 'In the course phrasebook',
  close: 'Closest phrases in the course',
  gloss: 'Word by word',
}

function Entry({ entry, direction, canSpeak }) {
  // The answer is whichever side the input was not.
  const answerIsJp = direction === 'en-ja'
  return (
    <li className={'tr-entry' + (answerIsJp ? '' : ' flip')}>
      <div className="tr-entry-main">
        <div className="tr-jp-line">
          <span className="tr-jp">{entry.jp}</span>
          <SpeakButton jp={entry.jp} enabled={canSpeak} className="tr-speak" />
        </div>
        {entry.romaji && <div className="tr-romaji">{entry.romaji}</div>}
        <div className="tr-en">{entry.en}</div>
      </div>
      <div className="tr-source">{entry.source}</div>
    </li>
  )
}

function Gloss({ gloss, direction, canSpeak }) {
  return (
    <ol className="tr-gloss">
      {gloss.map((g, i) => (
        <li key={i} className={'tr-chip' + (g.entry ? '' : ' unknown')}>
          <span className="tr-chip-token">{g.token}</span>
          {g.entry ? (
            <>
              <span className="tr-chip-arrow" aria-hidden="true">→</span>
              <span className="tr-chip-answer">
                {direction === 'en-ja' ? (
                  <>
                    <span className="tr-chip-jp">{g.entry.jp}</span>
                    {g.entry.romaji && (
                      <span className="tr-chip-romaji">{g.entry.romaji}</span>
                    )}
                  </>
                ) : (
                  <span className="tr-chip-en">{g.entry.en}</span>
                )}
              </span>
              <SpeakButton jp={g.entry.jp} enabled={canSpeak} className="tr-speak-sm" />
            </>
          ) : (
            <span className="tr-chip-arrow" aria-hidden="true">· not covered</span>
          )}
        </li>
      ))}
    </ol>
  )
}

export default function Translator() {
  const ctx = useContext(TranslatorContext)
  // Rendered outside the provider (shouldn't happen) — fail quiet, not loud.
  if (!ctx) return null
  const { text, setText, result, canSpeak } = ctx
  const { status, direction, matches, gloss } = result

  const label =
    direction === 'ja-en' ? '日本語 → English' : direction === 'en-ja' ? 'English → 日本語' : ''

  return (
    <section className="translator" aria-label="Quick translate">
      <div className="tr-bar">
        <span className="tr-tag">Quick translate</span>
        <input
          className="tr-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type English, romaji or Japanese…"
          aria-label="Text to translate"
          spellCheck="false"
        />
        {text && (
          <button className="tr-clear" onClick={() => setText('')} aria-label="Clear">
            ×
          </button>
        )}
        {label && <span className="tr-dir">{label}</span>}
      </div>

      {status !== 'empty' && (
        <div className="tr-out">
          {status === 'none' ? (
            <p className="tr-miss">
              Nothing in the course covers that. Try a single word, or the romaji
              (<em>sumimasen</em>), or check the{' '}
              <strong>Common Words</strong> deck.
            </p>
          ) : (
            <>
              <div className="tr-status">{HEADINGS[status]}</div>
              {status === 'gloss' && (
                <Gloss gloss={gloss} direction={direction} canSpeak={canSpeak} />
              )}
              {matches.length > 0 && (
                <ul className="tr-list">
                  {status === 'gloss' && (
                    <li className="tr-sub">Whole phrases that come close</li>
                  )}
                  {matches.map((e, i) => (
                    <Entry key={i} entry={e} direction={direction} canSpeak={canSpeak} />
                  ))}
                </ul>
              )}
              {!hasSpeech() && <p className="tr-note">This browser has no speech synthesis, so there is no audio.</p>}
            </>
          )}
        </div>
      )}
    </section>
  )
}
