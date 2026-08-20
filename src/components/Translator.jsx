import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { translate } from '../lib/translate.js'
import { hasJapanese } from '../lib/phrasebook.js'
import { browserTranslate, hasBrowserTranslator } from '../lib/browserTranslate.js'
import { hasSpeech, watchJapaneseVoice } from '../lib/speech.js'
import SpeakButton from './SpeakButton.jsx'

// One box, shown on every page, sharing its state: what you typed survives
// navigation, so you can look a phrase up and then go read about it.
const TranslatorContext = createContext(null)

// The browser's own translation of whatever you typed, shown above the course
// phrases. It answers anything — including sentences the course never teaches —
// while the phrasebook below it answers with what the course actually says.
function useDirectTranslation(text, direction) {
  const [state, setState] = useState({ status: 'idle' })
  const query = text.trim()
  // Romaji in: the browser translates script, not transliteration, and the
  // phrasebook has already read it as Japanese. Sending it as English would
  // only contradict the direction shown on the box.
  const skip = !query || (direction === 'ja-en' && !hasJapanese(query))

  useEffect(() => {
    if (skip) {
      setState({ status: 'idle' })
      return
    }
    if (!hasBrowserTranslator()) {
      setState({ status: 'unsupported' })
      return
    }
    const toJapanese = !hasJapanese(query)
    const to = toJapanese ? 'ja' : 'en'
    let live = true
    setState({ status: 'pending', lang: to })

    // Machine translation is far heavier than the phrasebook lookup, so it
    // waits for a pause in typing rather than running on every keystroke.
    const timer = setTimeout(() => {
      browserTranslate(query, {
        from: toJapanese ? 'en' : 'ja',
        to,
        onProgress: (progress) => {
          if (live) setState({ status: 'downloading', lang: to, progress })
        },
      })
        .then((out) => {
          if (live) setState({ status: 'done', lang: to, text: out })
        })
        .catch((err) => {
          if (live) setState({ status: 'error', code: err.code, message: err.message })
        })
    }, 350)

    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [query, skip])

  return state
}

export function TranslatorProvider({ children }) {
  const [text, setText] = useState('')
  const [canSpeak, setCanSpeak] = useState(false)

  useEffect(() => watchJapaneseVoice(setCanSpeak), [])

  // A lookup over ~500 phrases is cheap enough to redo as you type.
  const result = useMemo(() => translate(text), [text])
  const direct = useDirectTranslation(text, result.direction)

  const value = useMemo(
    () => ({ text, setText, result, direct, canSpeak }),
    [text, result, direct, canSpeak]
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

function Direct({ state, canSpeak }) {
  if (state.status === 'idle') return null

  const body = () => {
    switch (state.status) {
      case 'pending':
        return <span className="tr-direct-wait">Translating…</span>
      case 'downloading':
        return (
          <span className="tr-direct-wait">
            Downloading the browser’s language pack…{' '}
            {Math.round((state.progress || 0) * 100)}%
          </span>
        )
      case 'done':
        return state.lang === 'ja' ? (
          <span className="tr-jp-line">
            <span className="tr-jp">{state.text}</span>
            <SpeakButton jp={state.text} enabled={canSpeak} className="tr-speak" />
          </span>
        ) : (
          <span className="tr-direct-en">{state.text}</span>
        )
      case 'unsupported':
        return (
          <span className="tr-direct-wait">
            This browser has no built-in translator, so there is no direct
            translation — only the course phrases below.
          </span>
        )
      default:
        return <span className="tr-direct-wait">{state.message}</span>
    }
  }

  return (
    <div className="tr-direct">
      <div className="tr-status">
        Direct translation <span className="tr-by">by your browser</span>
      </div>
      <div className="tr-direct-body">{body()}</div>
    </div>
  )
}

// Where the phrase is taught. Almost every entry comes from a chapter page or a
// scenario in the word deck, so it doubles as a link to go and read it.
function Source({ entry }) {
  if (!entry.path) return <div className="tr-source">{entry.source}</div>
  return (
    <Link className="tr-source tr-source-link" to={entry.path}>
      {entry.source} <span aria-hidden="true">→</span>
    </Link>
  )
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
      <Source entry={entry} />
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
  const { text, setText, result, direct, canSpeak } = ctx
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
          <Direct state={direct} canSpeak={canSpeak} />
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
