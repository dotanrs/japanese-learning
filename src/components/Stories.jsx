import { useEffect, useMemo, useRef, useState } from 'react'
import { hasSpeech, speakSequence, watchJapaneseVoice } from '../lib/speech.js'
import SpeakButton from './SpeakButton.jsx'
import Translator from './Translator.jsx'
import JapaneseMarkdown from './JapaneseMarkdown.jsx'

function Line({ line, revealed, speaking, onToggle, canSpeak, onStopStory }) {
  return (
    <li className={'story-line' + (speaking ? ' speaking' : '') + (revealed ? ' open' : '')}>
      <div className="sl-row">
        <div
          className="sl-jp-block"
          role="button"
          tabIndex={0}
          aria-expanded={revealed}
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
            {revealed && <span className="sl-en">{line.en}</span>}
          </span>
        </div>
        <SpeakButton
          jp={line.jp}
          enabled={canSpeak}
          className="sl-speak"
          onPlay={onStopStory}
        />
      </div>
    </li>
  )
}

export default function Stories({ deck }) {
  const [activeId, setActiveId] = useState(deck.stories[0].id)
  const [revealed, setRevealed] = useState(() => new Set())
  const [showCatch, setShowCatch] = useState(false)
  const [speakingLine, setSpeakingLine] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [canSpeak, setCanSpeak] = useState(false)
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
    stopRef.current = speakSequence(
      story.lines.map((l) => l.jp),
      {
        onLine: setSpeakingLine,
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
    setShowCatch(false)
  }

  const toggleLine = (i) =>
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  const allShown = revealed.size === story.lines.length
  const toggleAll = () =>
    setRevealed(allShown ? new Set() : new Set(story.lines.map((_, i) => i)))

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
            <button className="wc-ctl" onClick={toggleAll}>
              {allShown ? 'Hide English' : 'Show all English'}
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

        <ol className="story-lines">
          {story.lines.map((line, i) => (
            <Line
              key={i}
              line={line}
              revealed={revealed.has(i)}
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
