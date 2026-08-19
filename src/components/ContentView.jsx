import { Link } from 'react-router-dom'
import Flashcards from './Flashcards.jsx'
import Quiz from './Quiz.jsx'
import JapaneseMarkdown from './JapaneseMarkdown.jsx'

export default function ContentView({ chapter, sub, prev, next }) {
  return (
    <div className="content lesson-content">
      <div className="breadcrumb">
        <Link to="/">Course</Link> <span>／</span> Chapter {chapter.num}
      </div>
      <h1>{sub.title}</h1>

      {sub.body && (
        <JapaneseMarkdown>{sub.body}</JapaneseMarkdown>
      )}

      <Flashcards cards={sub.flashcards} />
      <Quiz items={sub.quiz} title={sub.quizTitle} />

      <div className="pager">
        {prev ? (
          <Link className="prev" to={prev.path}>
            <div className="pager-dir">← Previous</div>
            <div className="pager-title">{prev.title}</div>
          </Link>
        ) : <span />}
        {next ? (
          <Link className="next" to={next.path}>
            <div className="pager-dir">Next →</div>
            <div className="pager-title">{next.title}</div>
          </Link>
        ) : <span />}
      </div>
    </div>
  )
}
