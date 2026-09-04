import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'japanese-crash-course-starred-v1'
const StarredContext = createContext(null)

function readStoredCards() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(value)) return []

    return value.filter(
      (card) =>
        card &&
        typeof card.id === 'string' &&
        typeof card.jp === 'string' &&
        typeof card.en === 'string'
    )
  } catch {
    return []
  }
}

function copyCard(card) {
  return {
    id: card.id,
    jp: card.jp,
    romaji: card.romaji || '',
    en: card.en,
    note: card.note || '',
    example: card.example ? { ...card.example } : undefined,
    source: card.source || '',
    custom: Boolean(card.custom),
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
      return [...current, copyCard(card)]
    })
  }, [])

  const toggleCard = useCallback((card) => {
    setCards((current) => {
      if (current.some((item) => item.id === card.id)) {
        return current.filter((item) => item.id !== card.id)
      }
      return [...current, copyCard(card)]
    })
  }, [])

  const value = useMemo(
    () => ({ cards, isStarred, addCard, toggleCard }),
    [cards, isStarred, addCard, toggleCard]
  )

  return <StarredContext.Provider value={value}>{children}</StarredContext.Provider>
}

export function useStarred() {
  const context = useContext(StarredContext)
  if (!context) throw new Error('useStarred must be used inside StarredProvider')
  return context
}
