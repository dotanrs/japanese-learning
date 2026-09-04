import { useEffect, useRef, useState } from 'react'
import { hasSpeech, watchJapaneseVoice } from '../lib/speech.js'
import { WordCard } from './WordCards.jsx'
import { useStarred } from './StarredProvider.jsx'

function makeCustomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `custom:${crypto.randomUUID()}`
  }
  return `custom:${Date.now()}:${Math.random().toString(36).slice(2)}`
}

function emptyExample() {
  return { jp: '', before: '', focus: '', after: '', en: '' }
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Fall back for browsers that expose the API but deny clipboard access.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Clipboard copy failed')
}

export default function Starred() {
  const { cards, addCard, updateCard, removeCard, importCards } = useStarred()
  const [revealAll, setRevealAll] = useState(false)
  const [canSpeak, setCanSpeak] = useState(false)
  const [japanese, setJapanese] = useState('')
  const [romaji, setRomaji] = useState('')
  const [translation, setTranslation] = useState('')
  const [explanation, setExplanation] = useState('')
  const [example, setExample] = useState(emptyExample)
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [importFeedback, setImportFeedback] = useState(null)
  const [transferStatus, setTransferStatus] = useState('')
  const importInputRef = useRef(null)
  const customPanelRef = useRef(null)
  const japaneseInputRef = useRef(null)

  useEffect(() => watchJapaneseVoice(setCanSpeak), [])

  useEffect(() => {
    if (!importOpen) return undefined
    importInputRef.current?.focus()
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setImportOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [importOpen])

  useEffect(() => {
    if (!deleteCandidate) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setDeleteCandidate(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [deleteCandidate])

  const exportCards = async () => {
    const json = JSON.stringify({ version: 1, cards }, null, 2)
    try {
      await copyToClipboard(json)
      setTransferStatus(`Copied ${cards.length} ${cards.length === 1 ? 'card' : 'cards'} as JSON.`)
    } catch {
      setTransferStatus('Could not copy the JSON. Try importing and copying from the text box instead.')
    }
  }

  const openImport = () => {
    setImportJson('')
    setImportFeedback(null)
    setTransferStatus('')
    setImportOpen(true)
  }

  const submitImport = (event) => {
    event.preventDefault()
    try {
      const parsed = JSON.parse(importJson)
      const incoming = Array.isArray(parsed) ? parsed : parsed?.cards
      if (!Array.isArray(incoming)) {
        throw new Error('Expected an exported object with a cards array.')
      }

      const result = importCards(incoming)
      const skipped = result.duplicates + result.invalid
      setImportFeedback({
        type: 'success',
        message:
          `Imported ${result.added} ${result.added === 1 ? 'card' : 'cards'}. ` +
          `Skipped ${skipped} (${result.duplicates} exact ${result.duplicates === 1 ? 'match' : 'matches'}, ` +
          `${result.invalid} invalid).`,
      })
    } catch (error) {
      setImportFeedback({
        type: 'error',
        message: error instanceof SyntaxError ? 'That is not valid JSON.' : error.message,
      })
    }
  }

  const resetCardForm = () => {
    setJapanese('')
    setRomaji('')
    setTranslation('')
    setExplanation('')
    setExample(emptyExample())
    setEditingId(null)
    setFormOpen(false)
  }

  const editCard = (card) => {
    setFormOpen(true)
    setEditingId(card.id)
    setJapanese(card.jp)
    setRomaji(card.romaji || '')
    setTranslation(card.en)
    setExplanation(card.note || '')
    setExample(card.example ? { ...card.example } : emptyExample())
    requestAnimationFrame(() => {
      customPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      japaneseInputRef.current?.focus()
    })
  }

  const deleteCard = (card) => {
    removeCard(card.id)
    setDeleteCandidate(null)
    resetCardForm()
  }

  const requestDelete = () => {
    const current = cards.find((card) => card.id === editingId)
    if (!current) return
    if (current.custom || current.edited) {
      setDeleteCandidate(current)
    } else {
      deleteCard(current)
    }
  }

  const saveCard = (event) => {
    event.preventDefault()
    const jp = japanese.trim()
    const savedRomaji = romaji.trim()
    const en = translation.trim()
    const note = explanation.trim()
    const hasExample = Object.values(example).some((value) => value.trim())
    const savedExample = hasExample
      ? {
          jp: example.jp.trim(),
          before: example.before,
          focus: example.focus.trim(),
          after: example.after,
          en: example.en.trim(),
        }
      : undefined
    if (!jp || !en || (!editingId && !note)) return

    if (editingId) {
      const current = cards.find((card) => card.id === editingId)
      if (current) {
        updateCard({
          ...current,
          jp,
          romaji: savedRomaji,
          en,
          note,
          example: savedExample,
          source:
            !current.custom && !current.source.endsWith('[edited]')
              ? `${current.source}${current.source ? ' ' : ''}[edited]`
              : current.source,
          edited: true,
        })
      }
    } else {
      addCard({
        id: makeCustomId(),
        jp,
        romaji: savedRomaji,
        en,
        note,
        example: savedExample,
        source: 'Custom card',
        custom: true,
        edited: false,
      })
    }
    resetCardForm()
  }

  return (
    <div className="content lesson-content starred-page">
      <div className="breadcrumb">Study deck <span>／</span> Saved locally</div>
      <h1>Starred</h1>
      <p className="wc-intro">
        Keep useful words and phrases together on this device, or make your own cards.
      </p>

      <div className="starred-transfer" aria-label="Import or export starred cards">
        <button className="wc-ctl" type="button" onClick={exportCards}>
          Export JSON
        </button>
        <button className="wc-ctl" type="button" onClick={openImport}>
          Import JSON
        </button>
        <span className="starred-transfer-status" role="status" aria-live="polite">
          {transferStatus}
        </span>
      </div>

      <section
        ref={customPanelRef}
        className={
          'custom-card-panel' +
          (editingId ? ' editing' : '') +
          (!formOpen ? ' minimized' : '')
        }
        aria-labelledby="custom-card-heading"
      >
        {!formOpen ? (
          <button
            className="custom-card-toggle"
            type="button"
            aria-expanded="false"
            onClick={() => setFormOpen(true)}
          >
            <span>
              <span className="section-kicker">Make it yours</span>
              <strong id="custom-card-heading">Add a custom flashcard</strong>
              <small>Japanese, translation, explanation, and optional examples</small>
            </span>
            <span className="custom-card-toggle-icon" aria-hidden="true">＋</span>
          </button>
        ) : (
          <div className="custom-card-panel-copy">
            <div>
              <span className="section-kicker">{editingId ? 'Editing saved card' : 'Make it yours'}</span>
              <h2 id="custom-card-heading">
                {editingId ? 'Edit flashcard' : 'Add a custom flashcard'}
              </h2>
              <p>
                {editingId
                  ? 'Saving will replace this card in your starred deck.'
                  : 'Give the phrase, its translation, and the explanation you want to remember.'}
              </p>
            </div>
            <button
              className="custom-card-minimize"
              type="button"
              aria-label="Minimize flashcard form"
              title="Minimize form"
              onClick={resetCardForm}
            >
              −
            </button>
          </div>
        )}
        {formOpen && <form className="custom-card-form" onSubmit={saveCard}>
          <label>
            Japanese phrase
            <input
              ref={japaneseInputRef}
              value={japanese}
              onChange={(event) => setJapanese(event.target.value)}
              placeholder="例：お元気ですか"
              required
            />
          </label>
          <label>
            Romaji
            <input
              value={romaji}
              onChange={(event) => setRomaji(event.target.value)}
              placeholder="o-genki desu ka"
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
              required={!editingId}
            />
          </label>
          <fieldset className="custom-card-example">
            <legend>Example sentence <span>(optional)</span></legend>
            <div className="custom-card-example-grid">
              <label className="example-japanese">
                Example Japanese
                <input
                  value={example.jp}
                  onChange={(event) => setExample((value) => ({ ...value, jp: event.target.value }))}
                  placeholder="お元気ですか。"
                />
              </label>
              <label className="example-english">
                Example English
                <input
                  value={example.en}
                  onChange={(event) => setExample((value) => ({ ...value, en: event.target.value }))}
                  placeholder="How are you?"
                />
              </label>
              <label>
                Romaji before focus
                <input
                  value={example.before}
                  onChange={(event) => setExample((value) => ({ ...value, before: event.target.value }))}
                  placeholder="O-"
                />
              </label>
              <label>
                Focused romaji
                <input
                  value={example.focus}
                  onChange={(event) => setExample((value) => ({ ...value, focus: event.target.value }))}
                  placeholder="genki"
                />
              </label>
              <label>
                Romaji after focus
                <input
                  value={example.after}
                  onChange={(event) => setExample((value) => ({ ...value, after: event.target.value }))}
                  placeholder=" desu ka."
                />
              </label>
            </div>
          </fieldset>
          <div className="custom-card-actions">
            {editingId && (
              <button className="delete-card-button" type="button" onClick={requestDelete}>
                Delete
              </button>
            )}
            <span className="custom-card-actions-spacer" />
            {editingId && (
              <button className="wc-ctl" type="button" onClick={resetCardForm}>Cancel editing</button>
            )}
            <button className="custom-card-submit" type="submit">
              {editingId ? 'Save changes' : 'Add to starred'}
            </button>
          </div>
        </form>}
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
                onEdit={() => editCard(card)}
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

      {importOpen && (
        <div
          className="import-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setImportOpen(false)
          }}
        >
          <section
            className="import-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-modal-title"
          >
            <div className="import-modal-head">
              <div>
                <span className="section-kicker">Restore or merge</span>
                <h2 id="import-modal-title">Import starred cards</h2>
              </div>
              <button
                className="import-modal-close"
                type="button"
                aria-label="Close import"
                onClick={() => setImportOpen(false)}
              >
                ×
              </button>
            </div>
            <p>Paste JSON exported from this page. Exact content matches will be skipped.</p>
            <form onSubmit={submitImport}>
              <label htmlFor="starred-import-json">Flashcard JSON</label>
              <textarea
                id="starred-import-json"
                ref={importInputRef}
                value={importJson}
                onChange={(event) => {
                  setImportJson(event.target.value)
                  setImportFeedback(null)
                }}
                placeholder={'{\n  "version": 1,\n  "cards": [ ... ]\n}'}
                rows="12"
                required
              />
              {importFeedback && (
                <p className={`import-feedback ${importFeedback.type}`} role="status">
                  {importFeedback.message}
                </p>
              )}
              <div className="import-modal-actions">
                <button className="wc-ctl" type="button" onClick={() => setImportOpen(false)}>
                  Close
                </button>
                {importFeedback?.type !== 'success' && (
                  <button className="custom-card-submit" type="submit">Import cards</button>
                )}
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteCandidate && (
        <div
          className="import-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDeleteCandidate(null)
          }}
        >
          <section
            className="delete-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-description"
          >
            <span className="section-kicker">Permanent action</span>
            <h2 id="delete-confirm-title">Delete this flashcard?</h2>
            <p id="delete-confirm-description">
              “{deleteCandidate.jp}” will be removed from your starred deck.
            </p>
            <div className="import-modal-actions">
              <button className="wc-ctl" type="button" onClick={() => setDeleteCandidate(null)}>
                Cancel
              </button>
              <button
                className="delete-card-button"
                type="button"
                onClick={() => deleteCard(deleteCandidate)}
              >
                Delete card
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
