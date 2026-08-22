import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Translator from './Translator.jsx'

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

function Puzzle({ puzzle, number, total, solved, onSolved, onNext }) {
  const [order, setOrder] = useState(puzzle.scrambled)
  const [selected, setSelected] = useState(null)
  const [dragged, setDragged] = useState(null)
  const [result, setResult] = useState('idle')

  const pieces = useMemo(
    () => new Map(puzzle.pieces.map((piece) => [piece.id, piece])),
    [puzzle]
  )

  const changeOrder = (next) => {
    setOrder(next)
    setResult('idle')
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

  const check = () => {
    const accepted = puzzle.acceptedAnswers || [puzzle.answer]
    const correct = accepted.some(
      (answer) => answer.length === order.length && answer.every((id, i) => id === order[i])
    )
    setResult(correct ? 'correct' : 'wrong')
    if (correct) onSolved()
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
        Drag the tiles into place. On touch, tap two tiles to swap them; with a keyboard,
        focus a tile and use ← or →. Hover or focus for a translation.
      </p>

      <ol className="sb-tiles" aria-label="Japanese word order">
        {order.map((id, index) => {
          const piece = pieces.get(id)
          return (
            <li key={id}>
              <button
                type="button"
                className={
                  'sb-tile' +
                  (selected === id ? ' selected' : '') +
                  (dragged === id ? ' dragging' : '')
                }
                data-translation={`${piece.romaji} — ${piece.en}`}
                draggable
                aria-pressed={selected === id}
                aria-label={`${piece.jp}, ${piece.romaji}, ${piece.en}. Position ${index + 1} of ${order.length}`}
                onClick={() => selectOrSwap(id)}
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
                  event.dataTransfer.effectAllowed = 'move'
                  event.dataTransfer.setData('text/plain', id)
                }}
                onDragEnd={() => setDragged(null)}
                onDragOver={(event) => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'move'
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  const source = event.dataTransfer.getData('text/plain') || dragged
                  if (source) swap(source, id)
                  setDragged(null)
                }}
              >
                <span className="sb-grip" aria-hidden="true">⠿</span>
                <span lang="ja">{piece.jp}</span>
              </button>
            </li>
          )
        })}
        <li className="sb-period" aria-hidden="true">{puzzle.prompt.endsWith('?') ? '？' : '。'}</li>
      </ol>

      <div className="sb-actions">
        <button className="sb-check" type="button" onClick={check}>
          Check order
        </button>
        <button
          className="wc-ctl"
          type="button"
          onClick={() => {
            changeOrder(puzzle.scrambled)
            setSelected(null)
          }}
        >
          Reset
        </button>
      </div>

      <div className="sb-feedback" aria-live="polite">
        {result === 'wrong' && (
          <p className="sb-try-again">
            Not quite yet. Check the particles, then make sure the action comes last.
          </p>
        )}
        {result === 'correct' && (
          <div className="sb-explanation">
            <div className="sb-correct">Correct — well built.</div>
            <div className="sb-answer" lang="ja">
              {order.map((id) => pieces.get(id).jp).join(' ')}
              {puzzle.prompt.endsWith('?') ? '？' : '。'}
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
  const [solved, setSolved] = useState(() => new Set())
  const activeId = params.get('p')
  const activeIndex = Math.max(0, deck.puzzles.findIndex((puzzle) => puzzle.id === activeId))
  const puzzle = deck.puzzles[activeIndex]

  const pickPuzzle = (id) => setParams({ p: id }, { replace: true })

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
        onSolved={() =>
          setSolved((previous) => {
            const next = new Set(previous)
            next.add(puzzle.id)
            return next
          })
        }
        onNext={() => pickPuzzle(deck.puzzles[activeIndex + 1].id)}
      />
    </div>
  )
}
