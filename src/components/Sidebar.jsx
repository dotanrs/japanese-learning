import { useState, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { chapters, wordDeck, phraseDeck, storyDeck, puzzleDeck } from '../content/index.js'

export default function Sidebar({ onNavigate }) {
  const location = useLocation()
  const [query, setQuery] = useState('')
  const activeChapter = useMemo(() => {
    const m = location.pathname.match(/^\/ch\/([^/]+)/)
    return m ? m[1] : null
  }, [location.pathname])

  const [collapsed, setCollapsed] = useState({})
  const toggle = (id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }))

  const q = query.trim().toLowerCase()

  // Standalone sections match on their own title or any of their activities.
  const standalone = [
    { to: '/starred', icon: '⭐', title: 'Starred', tabs: [] },
    { to: '/words', icon: '🗂️', title: wordDeck.title, tabs: wordDeck.scenarios },
    { to: '/phrases', icon: '🗣️', title: phraseDeck.title, tabs: phraseDeck.scenarios },
    { to: '/stories', icon: '📖', title: storyDeck.title, tabs: storyDeck.stories },
    { to: '/puzzles', icon: '🧩', title: puzzleDeck.title, tabs: puzzleDeck.puzzles },
  ].filter(
    (s) =>
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.tabs.some((t) => t.title.toLowerCase().includes(q))
  )

  const filtered = chapters
    .map((ch) => {
      if (!q) return ch
      const subs = ch.subchapters.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          ch.title.toLowerCase().includes(q)
      )
      return ch.title.toLowerCase().includes(q)
        ? ch
        : { ...ch, subchapters: subs }
    })
    .filter((ch) => ch.subchapters.length > 0)

  return (
    <>
      <NavLink className="brand" to="/" onClick={onNavigate}>
        <span className="brand-seal">日</span>
        <span>Japanese<br />Crash Course</span>
      </NavLink>
      <div style={{ padding: '0 6px' }}>
        <small className="brand-subtitle">
          Spoken Japanese for curious travellers
        </small>
      </div>
      <input
        className="search"
        placeholder="Filter topics…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginTop: 12 }}
      />

      {standalone.map((s) => (
        <NavLink
          key={s.to}
          to={s.to}
          className={({ isActive }) => 'nav-standalone' + (isActive ? ' active' : '')}
          onClick={onNavigate}
        >
          <span className="nav-standalone-icon" aria-hidden="true">{s.icon}</span>
          {s.title}
        </NavLink>
      ))}

      {filtered.map((ch) => {
        const isCollapsed = q ? false : collapsed[ch.id] && activeChapter !== ch.id
        const open = !isCollapsed
        return (
          <div className="nav-chapter" key={ch.id}>
            <button className="nav-chapter-title" onClick={() => toggle(ch.id)}>
              <span>
                <span className="num">{ch.num}</span>
                {ch.title}
              </span>
              <span className={'chev' + (open ? ' open' : '')}>▶</span>
            </button>
            {open && (
              <ul className="nav-sub">
                {ch.subchapters.map((s) => (
                  <li key={s.id}>
                    <NavLink
                      to={`/ch/${ch.id}/${s.id}`}
                      className={({ isActive }) => (isActive ? 'active' : '')}
                      onClick={onNavigate}
                    >
                      {s.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </>
  )
}
