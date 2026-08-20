import { useEffect, useMemo, useRef, useState } from 'react'
import { hasSpeech, speakSequence, watchJapaneseVoice } from '../lib/speech.js'
import SpeakButton from './SpeakButton.jsx'
import Translator from './Translator.jsx'
import JapaneseMarkdown from './JapaneseMarkdown.jsx'

function Breakdown({ parts }) {
  return (
    <div className="sl-parts">
      <div className="sl-parts-tag">Word by word</div>
      <ol className="sl-parts-list">
        {parts.map((part, i) => (
          <li key={i} className="sl-part">
            <div className="sl-part-jp">{part.jp}</div>
            <div className="sl-part-romaji">{part.romaji}</div>
            <div className="sl-part-en">{part.en}</div>
            <div className="sl-part-role">{part.role}</div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Line({ line, showEn, showParts, speaking, onToggle, canSpeak, onStopStory }) {
  const open = showEn || showParts
  return (
    <li className={'story-line' + (speaking ? ' speaking' : '') + (open ? ' open' : '')}>
      <div className="sl-row">
        <div
          className="sl-jp-block"
          role="button"
          tabIndex={0}
          aria-expanded={open}
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onToggle()
            }
          }}
        >
          {line.speaker ? (
            <span className="sl-speaker">{line.speaker}</span>
          ) : (
            <span className="sl-speaker narration">—</span>
          )}
          <span className="sl-text">
            <span className="sl-jp">{line.jp}</span>
            <span className="sl-romaji">{line.romaji}</span>
            {showEn && <span className="sl-en">{line.en}</span>}
          </span>
        </div>
        <SpeakButton
          jp={line.jp}
          enabled={canSpeak}
          className="sl-speak"
          onPlay={onStopStory}
        />
      </div>
      {showParts && <Breakdown parts={line.parts} />}
    </li>
  )
}

export default function Stories({ deck }) {
  const [activeId, setActiveId] = useState(deck.stories[0].id)
  const [revealed, setRevealed] = useState(() => new Set())
  const [showAllEn, setShowAllEn] = useState(false)
  const [showCatch, setShowCatch] = useState(false)
  const [speakingLine, setSpeakingLine] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [canSpeak, setCanSpeak] = useState(false)
  const [audioFailed, setAudioFailed] = useState(false)
  const stopRef = useRef(null)

  useEffect(() => watchJapaneseVoice(setCanSpeak), [])

  const story = useMemo(
    () => deck.stories.find((s) => s.id === activeId) || deck.stories[0],
    [deck, activeId]
  )

  const stopStory = () => {
    stopRef.current?.()
    stopRef.current = null
  }

  // Never leave a voice running after the reader navigates away.
  useEffect(() => stopStory, [])

  const playStory = () => {
    stopStory()
    setPlaying(true)
    setAudioFailed(false)
    stopRef.current = speakSequence(
      story.lines.map((l) => l.jp),
      {
        onLine: setSpeakingLine,
        onError: () => setAudioFailed(true),
        onDone: () => {
          setPlaying(false)
          setSpeakingLine(null)
          stopRef.current = null
        },
      }
    )
  }

  const pickStory = (id) => {
    stopStory()
    setActiveId(id)
    setRevealed(new Set())
    setShowAllEn(false)
    setShowCatch(false)
    setAudioFailed(false)
  }

  const toggleLine = (i) =>
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  // Two levels on purpose: the whole story's English is worth skimming, but
  // seven breakdowns at once is a wall, so those stay per-line.
  const toggleAll = () => {
    setShowAllEn((on) => !on)
    if (showAllEn) setRevealed(new Set())
  }

  return (
    <div className="content lesson-content">
      <div className="breadcrumb">
        Reading <span>／</span> Dialogue stories
      </div>
      <h1>{deck.title}</h1>
      <Translator />
      <p className="wc-intro">{deck.intro}</p>

      <div className="tabs" role="tablist" aria-label="Story">
        {deck.stories.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={s.id === story.id}
            className={'tab' + (s.id === story.id ? ' active' : '')}
            onClick={() => pickStory(s.id)}
          >
            <span className="tab-icon" aria-hidden="true">{s.icon}</span>
            {s.title}
            <span className="tab-count">{s.lines.length}</span>
          </button>
        ))}
      </div>

      <div className="story" key={story.id}>
        <div className="story-head">
          <div>
            <div className="story-jp-title">{story.jpTitle}</div>
            <p className="story-blurb">{story.blurb}</p>
            <div className="story-cast">{story.cast}</div>
          </div>
          <div className="story-controls">
            {canSpeak && (
              <button
                className={'wc-ctl' + (playing ? ' active' : '')}
                onClick={playing ? stopStory : playStory}
              >
                {playing ? '■ Stop' : '▶ Play story'}
              </button>
            )}
            <button className={'wc-ctl' + (showAllEn ? ' active' : '')} onClick={toggleAll}>
              {showAllEn ? 'Hide English' : 'Show all English'}
            </button>
          </div>
        </div>

        {!canSpeak && (
          <p className="wc-audio-note">
            {hasSpeech()
              ? 'No Japanese voice is installed on this device, so the story cannot be read aloud.'
              : 'This browser has no speech synthesis, so the story cannot be read aloud.'}
          </p>
        )}

        {canSpeak && audioFailed && (
          <p className="wc-audio-note">
            The Japanese voice on this device failed to speak. Some voices
            synthesise over the network, so they go silent offline — installing an
            offline Japanese voice in your system settings fixes it.
          </p>
        )}

        <ol className="story-lines">
          {story.lines.map((line, i) => (
            <Line
              key={i}
              line={line}
              showEn={showAllEn || revealed.has(i)}
              showParts={revealed.has(i)}
              speaking={speakingLine === i}
              onToggle={() => toggleLine(i)}
              canSpeak={canSpeak}
              onStopStory={stopStory}
            />
          ))}
        </ol>

        <div className="story-catch">
          {showCatch ? (
            <>
              <div className="sc-tag">The catch</div>
              <JapaneseMarkdown>{story.catch}</JapaneseMarkdown>
            </>
          ) : (
            <button className="reveal-btn" onClick={() => setShowCatch(true)}>
              Show the catch ▾
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
