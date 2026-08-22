import { Link } from 'react-router-dom'
import { chapters, wordDeck, storyDeck, puzzleDeck } from '../content/index.js'
import Translator from './Translator.jsx'

export default function Home() {
  return (
    <div className="content home-content">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow">日本語 ・ NIHONGO</div>
          <h1>Spoken Japanese,<br /><em>made practical.</em></h1>
          <p>
            The Japanese you need to get fed, get around, and get help—with the
            grammar that makes every phrase easier to remember.
          </p>
          <div className="hero-note">
            <span className="hover-sample">日本語</span>
            <span>Hover the red-underlined Japanese once for a translation.</span>
          </div>
        </div>
        <div className="sun-mark" aria-hidden="true">
          <span>旅</span>
        </div>
      </section>
      <Translator />
      <div className="side-decks">
        <Link className="words-banner" to="/words">
          <div className="wb-copy">
            <div className="eyebrow">Vocabulary deck</div>
            <h2>{wordDeck.title}</h2>
            <p>
              {wordDeck.scenarios.reduce((n, s) => n + s.words.length, 0)} words you
              will actually use, on flashcards, split into{' '}
              {wordDeck.scenarios.length} scenarios. Tap 🔊 to hear any of them.
            </p>
          </div>
          <div className="wb-arrow" aria-hidden="true">→</div>
        </Link>
        <Link className="words-banner" to="/stories">
          <div className="wb-copy">
            <div className="eyebrow">Reading</div>
            <h2>{storyDeck.title}</h2>
            <p>
              {storyDeck.stories.length} dialogue stories, each with a sting in the
              tail. Tap a sentence for the English, or play the whole story aloud.
            </p>
          </div>
          <div className="wb-arrow" aria-hidden="true">→</div>
        </Link>
        <Link className="words-banner" to="/puzzles">
          <div className="wb-copy">
            <div className="eyebrow">Practice</div>
            <h2>{puzzleDeck.title}</h2>
            <p>
              Arrange romaji words and particles across {puzzleDeck.puzzles.length} practical
              sentences, then unlock a clear explanation of each word-order pattern.
            </p>
          </div>
          <div className="wb-arrow" aria-hidden="true">→</div>
        </Link>
      </div>

      <div className="section-kicker">Seven concise chapters</div>
      <div className="home-grid">
        {chapters.map((ch) => {
          const first = ch.subchapters[0]
          return (
            <Link
              className="home-card"
              key={ch.id}
              to={`/ch/${ch.id}/${first.id}`}
            >
              <div className="hc-num">Chapter {ch.num}</div>
              <h3>{ch.title}</h3>
              <div className="hc-list">
                {ch.subchapters.map((s) => s.title).join(' · ')}
              </div>
              <div className="hc-arrow" aria-hidden="true">→</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
