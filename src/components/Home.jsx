import { Link } from 'react-router-dom'
import { chapters } from '../content/index.js'

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
