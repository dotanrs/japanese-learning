import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { hasSpeech, watchJapaneseVoice } from '../lib/speech.js'
import SpeakButton from './SpeakButton.jsx'
import Translator from './Translator.jsx'

function WordCard({ word, showJapaneseFirst, revealAll, canSpeak }) {
  const [flipped, setFlipped] = useState(false)
  const shown = flipped || revealAll

  const prompt = showJapaneseFirst ? (
    <>
      <span className="wc-jp">{word.jp}</span>
      <span className="wc-romaji">{word.romaji}</span>
    </>
  ) : (
    <span className="wc-en-prompt">{word.en}</span>
  )

  const answer = showJapaneseFirst ? (
    <span className="wc-en">{word.en}</span>
  ) : (
    <>
      <span className="wc-jp">{word.jp}</span>
      <span className="wc-romaji">{word.romaji}</span>
    </>
  )

  return (
    <div
      className={'word-card' + (shown ? ' open' : '')}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      aria-expanded={shown}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setFlipped((f) => !f)
        }
      }}
    >
      <div className="wc-head">
        <div className="wc-prompt">{prompt}</div>
        <SpeakButton jp={word.jp} enabled={canSpeak} />
      </div>
      {shown ? (
        <div className="wc-answer">
          {answer}
          {word.note && <span className="wc-note">{word.note}</span>}
        </div>
      ) : (
        <div className="wc-hint">Tap to reveal ▾</div>
      )}
    </div>
  )
}

export default function WordCards({ deck }) {
  // The open tab lives in the URL (`#/words?s=restaurant`), so the translate
  // box and any other link can point at one scenario.
  const [params, setParams] = useSearchParams()
  const [showJapaneseFirst, setShowJapaneseFirst] = useState(true)
  const [revealAll, setRevealAll] = useState(false)
  const [canSpeak, setCanSpeak] = useState(false)

  useEffect(() => watchJapaneseVoice(setCanSpeak), [])

  const activeId = params.get('s')
  const active = useMemo(
    () => deck.scenarios.find((s) => s.id === activeId) || deck.scenarios[0],
    [deck, activeId]
  )

  // A fresh scenario always starts face-down, whatever the last tab was showing.
  useEffect(() => setRevealAll(false), [active.id])

  // Replace rather than push: switching tabs shouldn't fill up the back button.
  const pickScenario = (id) => setParams({ s: id }, { replace: true })

  return (
    <div className="content lesson-content">
      <div className="breadcrumb">
        Vocabulary <span>／</span> By scenario
      </div>
      <h1>{deck.title}</h1>
      <Translator />
      <p className="wc-intro">{deck.intro}</p>

      <div className="tabs" role="tablist" aria-label="Scenario">
        {deck.scenarios.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={s.id === active.id}
            className={'tab' + (s.id === active.id ? ' active' : '')}
            onClick={() => pickScenario(s.id)}
          >
            <span className="tab-icon" aria-hidden="true">{s.icon}</span>
            {s.title}
            <span className="tab-count">{s.words.length}</span>
          </button>
        ))}
      </div>

      <div className="wc-toolbar">
        <span className="wc-blurb">{active.blurb}</span>
        <div className="wc-controls">
          <button
            className="wc-ctl"
            onClick={() => setShowJapaneseFirst((v) => !v)}
            title="Swap which side of the card you see first"
          >
            {showJapaneseFirst ? '日本語 → English' : 'English → 日本語'}
          </button>
          <button className="wc-ctl" onClick={() => setRevealAll((v) => !v)}>
            {revealAll ? 'Hide all' : 'Reveal all'}
          </button>
        </div>
      </div>

      {!hasSpeech() && (
        <p className="wc-audio-note">
          Audio needs a browser with speech synthesis — this one has none, so the
          🔊 buttons are hidden.
        </p>
      )}
      {hasSpeech() && !canSpeak && (
        <p className="wc-audio-note">
          No Japanese voice is installed on this device, so the 🔊 buttons are
          hidden. Adding a Japanese system voice enables them.
        </p>
      )}

      <div className="word-grid" key={active.id}>
        {active.words.map((w) => (
          <WordCard
            key={w.jp + w.romaji}
            word={w}
            showJapaneseFirst={showJapaneseFirst}
            revealAll={revealAll}
            canSpeak={canSpeak}
          />
        ))}
      </div>
    </div>
  )
}
