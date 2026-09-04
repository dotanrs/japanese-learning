import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'japanese-crash-course-starred-v1'
const StarredContext = createContext(null)

function makeImportedId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `import:${crypto.randomUUID()}`
  }
  return `import:${Date.now()}:${Math.random().toString(36).slice(2)}`
}

function copyExample(example) {
  if (example === undefined) return undefined
  if (!example || typeof example !== 'object') return null

  const fields = ['jp', 'before', 'focus', 'after', 'en']
  if (fields.some((field) => typeof example[field] !== 'string')) return null
  return Object.fromEntries(fields.map((field) => [field, example[field]]))
}

function copyCard(card, fallbackId) {
  if (!card || typeof card !== 'object') return null
  if (typeof card.jp !== 'string' || typeof card.en !== 'string') return null

  const optionalStrings = ['romaji', 'note', 'source']
  if (
    optionalStrings.some(
      (field) => card[field] !== undefined && typeof card[field] !== 'string'
    )
  ) {
    return null
  }
  if ((!card.jp && !card.romaji) || !card.en) return null

  const example = copyExample(card.example)
  if (example === null) return null

  return {
    id: typeof card.id === 'string' && card.id ? card.id : fallbackId,
    jp: card.jp,
    romaji: card.romaji || '',
    en: card.en,
    note: card.note || '',
    example,
    source: card.source || '',
    custom: Boolean(card.custom),
    edited: Boolean(
      card.edited ||
      (!card.custom && typeof card.source === 'string' && card.source.endsWith('[edited]'))
    ),
  }
}

// IDs and source labels describe where a card came from; the visible learning
// content is what makes two imported cards an exact match.
function exactCardSignature(card) {
  return JSON.stringify({
    jp: card.jp,
    romaji: card.romaji,
    en: card.en,
    note: card.note,
    example: card.example,
  })
}

function readStoredCards() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(value)) return []
    return value.map((card) => copyCard(card)).filter((card) => card?.id)
  } catch {
    return []
  }
}

export function StarredProvider({ children }) {
  const [cards, setCards] = useState(readStoredCards)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
    } catch {
      // Some browsers can deny storage while in private mode. Keep the deck
      // usable for the current session instead of crashing the whole app.
    }
  }, [cards])

  useEffect(() => {
    const syncAcrossTabs = (event) => {
      if (event.key === STORAGE_KEY) setCards(readStoredCards())
    }
    window.addEventListener('storage', syncAcrossTabs)
    return () => window.removeEventListener('storage', syncAcrossTabs)
  }, [])

  const isStarred = useCallback(
    (id) => cards.some((card) => card.id === id),
    [cards]
  )

  const addCard = useCallback((card) => {
    setCards((current) => {
      if (current.some((item) => item.id === card.id)) return current
      const copied = copyCard(card)
      return copied ? [...current, copied] : current
    })
  }, [])

  const toggleCard = useCallback((card) => {
    setCards((current) => {
      if (current.some((item) => item.id === card.id)) {
        return current.filter((item) => item.id !== card.id)
      }
      const copied = copyCard(card)
      return copied ? [...current, copied] : current
    })
  }, [])

  const replaceCard = useCallback((originalId, card) => {
    const copied = copyCard(card)
    if (!copied) return
    setCards((current) =>
      current.map((item) => (item.id === originalId ? copied : item))
    )
  }, [])

  const removeCard = useCallback((id) => {
    setCards((current) => current.filter((card) => card.id !== id))
  }, [])

  const importCards = useCallback(
    (incoming) => {
      const signatures = new Set(cards.map(exactCardSignature))
      const ids = new Set(cards.map((card) => card.id))
      const added = []
      let duplicates = 0
      let invalid = 0

      incoming.forEach((candidate) => {
        let copied = copyCard(candidate, makeImportedId())
        if (!copied) {
          invalid += 1
          return
        }

        const signature = exactCardSignature(copied)
        if (signatures.has(signature)) {
          duplicates += 1
          return
        }

        while (ids.has(copied.id)) {
          copied = { ...copied, id: makeImportedId() }
        }
        signatures.add(signature)
        ids.add(copied.id)
        added.push(copied)
      })

      if (added.length > 0) setCards((current) => [...current, ...added])
      return { added: added.length, duplicates, invalid }
    },
    [cards]
  )

  const value = useMemo(
    () => ({ cards, isStarred, addCard, toggleCard, replaceCard, removeCard, importCards }),
    [cards, isStarred, addCard, toggleCard, replaceCard, removeCard, importCards]
  )

  return <StarredContext.Provider value={value}>{children}</StarredContext.Provider>
}

export function useStarred() {
  const context = useContext(StarredContext)
  if (!context) throw new Error('useStarred must be used inside StarredProvider')
  return context
}
