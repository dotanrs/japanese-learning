import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Translator from './Translator.jsx'

const STORAGE_KEY = 'sentence-builder-progress-v1'

function correctPrefixFor(puzzle, order) {
  const accepted = puzzle.acceptedAnswers || [puzzle.answer]
  const prefixFor = (answer) => {
    let length = 0
    while (length < order.length && order[length] === answer[length]) length += 1
    return length
  }
  return Math.max(...accepted.map(prefixFor))
}

function loadProgress(deck) {
  if (typeof window === 'undefined') return {}
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    const valid = {}
    for (const puzzle of deck.puzzles) {
      const entry = stored[puzzle.id]
      const pieceIds = puzzle.pieces.map((piece) => piece.id).sort()
      const orderIds = Array.isArray(entry?.order) ? [...entry.order].sort() : []
      const hasValidOrder =
        orderIds.length === pieceIds.length && orderIds.every((id, index) => id === pieceIds[index])
      if (!hasValidOrder) continue
      const checked = entry.result === 'wrong' || entry.result === 'correct'
      const prefix = checked ? correctPrefixFor(puzzle, entry.order) : 0
      valid[puzzle.id] = {
        order: entry.order,
        result: checked ? (prefix === entry.order.length ? 'correct' : 'wrong') : 'idle',
        correctPrefix: prefix,
      }
    }
    return valid
  } catch {
    return {}
  }
}

function writeProgress(progress) {
  try {
    if (Object.keys(progress).length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Storage can be unavailable in private or locked-down browser contexts.
  }
}

function swapItems(items, firstId, secondId) {
  const first = items.indexOf(firstId)
  const second = items.indexOf(secondId)
  if (first < 0 || second < 0 || first === second) return items
  const next = [...items]
  const held = next[first]
  next[first] = next[second]
  next[second] = held
  return next
}

function insertItem(items, itemId, insertionIndex) {
  const from = items.indexOf(itemId)
  if (from < 0) return items
  const next = items.filter((id) => id !== itemId)
  const adjustedIndex = from < insertionIndex ? insertionIndex - 1 : insertionIndex
  const to = Math.max(0, Math.min(adjustedIndex, next.length))
  next.splice(to, 0, itemId)
  return next
}

function Puzzle({ puzzle, number, total, solved, savedState, onProgress, onReset, onNext }) {
  const [order, setOrder] = useState(() => savedState?.order || puzzle.scrambled)
  const [selected, setSelected] = useState(null)
  const [dragged, setDragged] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)
  const [held, setHeld] = useState(null)
  const [result, setResult] = useState(() => savedState?.result || 'idle')
  const [correctPrefix, setCorrectPrefix] = useState(() => savedState?.correctPrefix || 0)
  const holdTimer = useRef(null)
  const holdTriggered = useRef(false)

  const pieces = useMemo(
    () => new Map(puzzle.pieces.map((piece) => [piece.id, piece])),
    [puzzle]
  )

  useEffect(() => () => window.clearTimeout(holdTimer.current), [])

  const changeOrder = (next) => {
    setOrder(next)
    setResult('idle')
    setCorrectPrefix(0)
    onProgress({ order: next, result: 'idle' })
  }

  const swap = (firstId, secondId) => {
    changeOrder(swapItems(order, firstId, secondId))
    setSelected(null)
  }

  const selectOrSwap = (id) => {
    if (!selected) setSelected(id)
    else if (selected === id) setSelected(null)
    else swap(selected, id)
  }

  const move = (id, direction) => {
    const from = order.indexOf(id)
    const to = from + direction
    if (to < 0 || to >= order.length) return
    swap(id, order[to])
  }

  const insertionIndexFor = (event, index) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return event.clientX < rect.left + rect.width / 2 ? index : index + 1
  }

  const placeDragged = (source, insertionIndex) => {
    if (source) changeOrder(insertItem(order, source, insertionIndex))
    setDragged(null)
    setDropIndex(null)
  }

  const check = () => {
    const prefix = correctPrefixFor(puzzle, order)
    const correct = prefix === order.length
    const nextResult = correct ? 'correct' : 'wrong'
    setCorrectPrefix(prefix)
    setResult(nextResult)
    setSelected(null)
    onProgress({ order, result: nextResult })
  }

  const startHold = (event, id) => {
    if (event.pointerType === 'mouse') return
    window.clearTimeout(holdTimer.current)
    holdTriggered.current = false
    holdTimer.current = window.setTimeout(() => {
      holdTriggered.current = true
      setHeld(id)
    }, 450)
  }

  const endHold = () => {
    window.clearTimeout(holdTimer.current)
    holdTimer.current = null
    setHeld(null)
  }

  return (
    <section className={'sb-puzzle' + (result === 'correct' ? ' solved' : '')}>
      <div className="sb-puzzle-head">
        <div>
          <div className="sb-step">Puzzle {number} of {total}</div>
          <h2><span aria-hidden="true">{puzzle.icon}</span> {puzzle.title}</h2>
        </div>
        {solved && <span className="sb-solved-badge">Solved ✓</span>}
      </div>

      <div className="sb-prompt">
        <span className="sb-prompt-label">Build this sentence</span>
        <strong>{puzzle.prompt}</strong>
      </div>

      <p className="sb-instruction">
        Drag the romaji tiles into place. On touch, tap two tiles to swap them; with a
        keyboard, focus a tile and use ← or →. The red marker shows where a dragged tile
        will land. Hover or hold a tile for its meaning.
      </p>

      <ol className="sb-tiles" aria-label="Japanese word order">
        {order.map((id, index) => {
          const piece = pieces.get(id)
          return (
            <li key={id} className={dragged && dropIndex === index ? 'sb-drop-before' : ''}>
              <button
                type="button"
                className={
                  'sb-tile' +
                  (selected === id ? ' selected' : '') +
                  (dragged === id ? ' dragging' : '') +
                  (held === id ? ' held' : '') +
                  (result !== 'idle' && index < correctPrefix ? ' prefix-correct' : '')
                }
                data-translation={piece.en}
                draggable
                aria-pressed={selected === id}
                aria-label={`${piece.romaji}, ${piece.en}. Position ${index + 1} of ${order.length}`}
                onClick={() => {
                  if (holdTriggered.current) {
                    holdTriggered.current = false
                    return
                  }
                  selectOrSwap(id)
                }}
                onPointerDown={(event) => startHold(event, id)}
                onPointerUp={endHold}
                onPointerCancel={endHold}
                onPointerLeave={endHold}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowLeft') {
                    event.preventDefault()
                    move(id, -1)
                  } else if (event.key === 'ArrowRight') {
                    event.preventDefault()
                    move(id, 1)
                  }
                }}
                onDragStart={(event) => {
                  setDragged(id)
                  setDropIndex(index)
                  event.dataTransfer.effectAllowed = 'move'
                  event.dataTransfer.setData('text/plain', id)
                }}
                onDragEnd={() => {
                  setDragged(null)
                  setDropIndex(null)
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'move'
                  setDropIndex(insertionIndexFor(event, index))
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  const source = event.dataTransfer.getData('text/plain') || dragged
                  placeDragged(source, insertionIndexFor(event, index))
                }}
              >
                <span className="sb-grip" aria-hidden="true">⠿</span>
                <span lang="ja-Latn">{piece.romaji}</span>
              </button>
            </li>
          )
        })}
        <li
          className={
            'sb-period' + (dragged && dropIndex === order.length ? ' sb-drop-before' : '')
          }
          aria-hidden="true"
          onDragOver={(event) => {
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move'
            setDropIndex(order.length)
          }}
          onDrop={(event) => {
            event.preventDefault()
            const source = event.dataTransfer.getData('text/plain') || dragged
            placeDragged(source, order.length)
          }}
        >
          {puzzle.prompt.endsWith('?') ? '？' : '。'}
        </li>
      </ol>

      <div className="sb-actions">
        <button className="sb-check" type="button" onClick={check}>
          Check order
        </button>
        <button
          className="wc-ctl"
          type="button"
          onClick={() => {
            setOrder(puzzle.scrambled)
            setResult('idle')
            setCorrectPrefix(0)
            setSelected(null)
            setDragged(null)
            setDropIndex(null)
            onReset()
          }}
        >
          Reset
        </button>
      </div>

      <div className="sb-feedback" aria-live="polite">
        {result === 'wrong' && (
          <p className="sb-try-again">
            Not quite yet. The green tiles form the correct opening; start checking again
            from the first unmarked tile.
          </p>
        )}
        {result === 'correct' && (
          <div className="sb-explanation">
            <div className="sb-correct">Correct — well built.</div>
            <div className="sb-answer" lang="ja-Latn">
              {order.map((id) => pieces.get(id).romaji).join(' ')}
              {puzzle.prompt.endsWith('?') ? '?' : '.'}
            </div>
            <div className="sb-pattern">{puzzle.pattern}</div>
            <p>{puzzle.explanation}</p>
            {number < total && (
              <button className="sb-next" type="button" onClick={onNext}>
                Next puzzle →
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default function SentenceBuilder({ deck }) {
  const [params, setParams] = useSearchParams()
  const [progress, setProgress] = useState(() => loadProgress(deck))
  const solved = useMemo(
    () => new Set(Object.entries(progress).filter(([, entry]) => entry.result === 'correct').map(([id]) => id)),
    [progress]
  )
  const activeId = params.get('p')
  const activeIndex = Math.max(0, deck.puzzles.findIndex((puzzle) => puzzle.id === activeId))
  const puzzle = deck.puzzles[activeIndex]

  const pickPuzzle = (id) => setParams({ p: id }, { replace: true })

  const savePuzzle = (id, entry) => {
    setProgress((previous) => {
      const puzzleToSave = deck.puzzles.find((item) => item.id === id)
      const prefix = entry.result === 'idle' ? 0 : correctPrefixFor(puzzleToSave, entry.order)
      const next = {
        ...previous,
        [id]: { ...entry, correctPrefix: prefix },
      }
      writeProgress(next)
      return next
    })
  }

  const resetPuzzle = (id) => {
    setProgress((previous) => {
      const next = { ...previous }
      delete next[id]
      writeProgress(next)
      return next
    })
  }

  return (
    <div className="content lesson-content">
      <div className="breadcrumb">
        Practice <span>／</span> Word order
      </div>
      <h1>{deck.title}</h1>
      <Translator />
      <p className="wc-intro">{deck.intro}</p>

      <div className="sb-progress-row">
        <div className="sb-progress-copy">
          <strong>{solved.size}</strong> of {deck.puzzles.length} solved
        </div>
        <div className="sb-puzzle-nav" aria-label="Choose a sentence puzzle">
          {deck.puzzles.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={
                'sb-puzzle-dot' +
                (item.id === puzzle.id ? ' active' : '') +
                (solved.has(item.id) ? ' complete' : '')
              }
              aria-label={`Puzzle ${index + 1}: ${item.title}${solved.has(item.id) ? ', solved' : ''}`}
              aria-current={item.id === puzzle.id ? 'step' : undefined}
              onClick={() => pickPuzzle(item.id)}
            >
              {solved.has(item.id) ? '✓' : index + 1}
            </button>
          ))}
        </div>
      </div>

      <Puzzle
        key={puzzle.id}
        puzzle={puzzle}
        number={activeIndex + 1}
        total={deck.puzzles.length}
        solved={solved.has(puzzle.id)}
        savedState={progress[puzzle.id]}
        onProgress={(entry) => savePuzzle(puzzle.id, entry)}
        onReset={() => resetPuzzle(puzzle.id)}
        onNext={() => pickPuzzle(deck.puzzles[activeIndex + 1].id)}
      />
    </div>
  )
}
