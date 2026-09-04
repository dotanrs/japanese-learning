import { useEffect, useState } from 'react'
import { hasSpeech, watchJapaneseVoice } from '../lib/speech.js'
import { WordCard } from './WordCards.jsx'
import { useStarred } from './StarredProvider.jsx'

function makeCustomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `custom:${crypto.randomUUID()}`
  }
  return `custom:${Date.now()}:${Math.random().toString(36).slice(2)}`
}

export default function Starred() {
  const { cards, addCard } = useStarred()
  const [revealAll, setRevealAll] = useState(false)
  const [canSpeak, setCanSpeak] = useState(false)
  const [japanese, setJapanese] = useState('')
  const [translation, setTranslation] = useState('')
  const [explanation, setExplanation] = useState('')

  useEffect(() => watchJapaneseVoice(setCanSpeak), [])

  const addCustomCard = (event) => {
    event.preventDefault()
    const jp = japanese.trim()
    const en = translation.trim()
    const note = explanation.trim()
    if (!jp || !en || !note) return

    addCard({
      id: makeCustomId(),
      jp,
      en,
      note,
      source: 'Custom card',
      custom: true,
    })
    setJapanese('')
    setTranslation('')
    setExplanation('')
  }

  return (
    <div className="content lesson-content starred-page">
      <div className="breadcrumb">Study deck <span>／</span> Saved locally</div>
      <h1>Starred</h1>
      <p className="wc-intro">
        Keep useful words and phrases together on this device, or make your own cards.
      </p>

      <section className="custom-card-panel" aria-labelledby="custom-card-heading">
        <div>
          <span className="section-kicker">Make it yours</span>
          <h2 id="custom-card-heading">Add a custom flashcard</h2>
          <p>Give the phrase, its translation, and the explanation you want to remember.</p>
        </div>
        <form className="custom-card-form" onSubmit={addCustomCard}>
          <label>
            Japanese phrase
            <input
              value={japanese}
              onChange={(event) => setJapanese(event.target.value)}
              placeholder="例：お元気ですか"
              required
            />
          </label>
          <label>
            English translation
            <input
              value={translation}
              onChange={(event) => setTranslation(event.target.value)}
              placeholder="How are you?"
              required
            />
          </label>
          <label className="custom-card-explanation">
            English explanation / breakdown
            <textarea
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              placeholder="お元気 means well; ですか makes it a polite question."
              rows="3"
              required
            />
          </label>
          <button className="custom-card-submit" type="submit">Add to starred</button>
        </form>
      </section>

      <div className="starred-list-heading">
        <div>
          <span className="section-kicker">Your collection</span>
          <h2>{cards.length} starred {cards.length === 1 ? 'card' : 'cards'}</h2>
        </div>
        {cards.length > 0 && (
          <button className="wc-ctl" type="button" onClick={() => setRevealAll((value) => !value)}>
            {revealAll ? 'Hide all' : 'Reveal all'}
          </button>
        )}
      </div>

      {cards.length === 0 ? (
        <div className="starred-empty">
          <span aria-hidden="true">☆</span>
          <strong>No starred cards yet</strong>
          <p>Tap the star on any card in Common Words or Common Phrases to save it here.</p>
        </div>
      ) : (
        <div className="word-grid starred-grid">
          {cards.map((card) => (
            <div className="starred-card-wrap" key={card.id}>
              <WordCard
                word={card}
                showJapaneseFirst
                revealAll={revealAll}
                canSpeak={canSpeak}
                allowTwoStepReveal={false}
                starCard={card}
              />
              {card.source && <span className="starred-source">{card.source}</span>}
            </div>
          ))}
        </div>
      )}

      {hasSpeech() && !canSpeak && cards.length > 0 && (
        <p className="wc-audio-note">
          No Japanese voice is installed on this device, so audio buttons are hidden.
        </p>
      )}
    </div>
  )
}

