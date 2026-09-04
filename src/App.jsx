import { useState, useEffect } from 'react'
import { Routes, Route, useParams, useLocation, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Home from './components/Home.jsx'
import ContentView from './components/ContentView.jsx'
import WordCards from './components/WordCards.jsx'
import Stories from './components/Stories.jsx'
import SentenceBuilder from './components/SentenceBuilder.jsx'
import Starred from './components/Starred.jsx'
import { StarredProvider } from './components/StarredProvider.jsx'
import { TranslatorProvider } from './components/Translator.jsx'
import { chapters, flatIndex, wordDeck, phraseDeck, storyDeck, puzzleDeck } from './content/index.js'

function SubPage() {
  const { chapterId, subId } = useParams()
  const chapter = chapters.find((c) => c.id === chapterId)
  if (!chapter) return <Navigate to="/" replace />
  const subIdx = chapter.subchapters.findIndex((s) => s.id === subId)
  if (subIdx === -1) {
    const first = chapter.subchapters[0]
    return <Navigate to={`/ch/${chapter.id}/${first.id}`} replace />
  }
  const sub = chapter.subchapters[subIdx]

  const flatPos = flatIndex.findIndex(
    (f) => f.chapterId === chapterId && f.subId === subId
  )
  const prev = flatIndex[flatPos - 1]
  const next = flatIndex[flatPos + 1]

  return (
    <ContentView
      key={chapterId + '/' + subId}
      chapter={chapter}
      sub={sub}
      prev={prev}
      next={next}
    />
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuCollapsed, setMenuCollapsed] = useState(
    () => window.localStorage.getItem('menu-collapsed') === 'true'
  )
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    window.localStorage.setItem('menu-collapsed', String(menuCollapsed))
  }, [menuCollapsed])

  return (
    <TranslatorProvider>
      <StarredProvider>
        <div className={'layout' + (menuCollapsed ? ' menu-collapsed' : '')}>
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            ☰
          </button>
          <div
            className={'scrim' + (menuOpen ? ' show' : '')}
            onClick={() => setMenuOpen(false)}
          />
          <aside className={'sidebar' + (menuOpen ? ' open' : '')}>
            <button
              className="sidebar-collapse"
              type="button"
              onClick={() => setMenuCollapsed(true)}
              aria-label="Collapse menu"
              title="Collapse menu"
            >
              «
            </button>
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </aside>
          {menuCollapsed && (
            <button
              className="sidebar-reopen"
              type="button"
              onClick={() => setMenuCollapsed(false)}
              aria-label="Open menu"
              title="Open menu"
            >
              ☰
            </button>
          )}
          <main className="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ch/:chapterId/:subId" element={<SubPage />} />
              <Route path="/words" element={<WordCards key="words" deck={wordDeck} />} />
              <Route path="/phrases" element={<WordCards key="phrases" deck={phraseDeck} />} />
              <Route path="/starred" element={<Starred />} />
              <Route path="/stories" element={<Stories deck={storyDeck} />} />
              <Route path="/puzzles" element={<SentenceBuilder deck={puzzleDeck} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </StarredProvider>
    </TranslatorProvider>
  )
}
