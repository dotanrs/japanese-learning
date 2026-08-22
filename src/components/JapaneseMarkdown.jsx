import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { japaneseTranslations, japaneseTerms } from '../content/translations.js'

// Course prose can mark a deliberately simplified rule with
// [[note:the reservation]]. It renders as a small clickable asterisk rather
// than interrupting the beginner-facing explanation with a long aside.
function textWithEditorialNotes(value) {
  const children = []
  const pattern = /\[\[note:([\s\S]*?)\]\]/g
  let cursor = 0
  let match

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > cursor) {
      children.push({ type: 'text', value: value.slice(cursor, match.index) })
    }
    const note = match[1].replace(/\s+/g, ' ').trim()
    children.push({
      type: 'element',
      tagName: 'button',
      properties: {
        type: 'button',
        className: ['editorial-note'],
        dataNote: note,
      },
      children: [{ type: 'text', value: '*' }],
    })
    cursor = pattern.lastIndex
  }

  if (cursor < value.length) {
    children.push({ type: 'text', value: value.slice(cursor) })
  }
  return children
}

function textWithTooltips(value, claim) {
  const children = []
  let cursor = 0

  while (cursor < value.length) {
    let foundAt = -1
    let foundTerm = null

    for (const term of japaneseTerms) {
      const index = value.indexOf(term, cursor)
      if (index !== -1 && (foundAt === -1 || index < foundAt)) {
        foundAt = index
        foundTerm = term
      }
    }

    if (foundAt === -1) {
      children.push({ type: 'text', value: value.slice(cursor) })
      break
    }

    if (foundAt > cursor) {
      children.push({ type: 'text', value: value.slice(cursor, foundAt) })
    }

    const translation = japaneseTranslations[foundTerm]
    if (claim(foundTerm)) {
      children.push({
        type: 'element',
        tagName: 'span',
        properties: {
          className: ['jp-term'],
          dataTranslation: translation,
          tabIndex: 0,
          ariaLabel: `${foundTerm}: ${translation}`,
        },
        children: [{ type: 'text', value: foundTerm }],
      })
    } else {
      children.push({ type: 'text', value: foundTerm })
    }

    cursor = foundAt + foundTerm.length
  }

  return children
}

function rehypeJapaneseTooltips() {
  return (tree) => {
    // Keep render-time state inside this Markdown transform. React Strict Mode
    // can render components twice, so shared mutable state would consume every
    // tooltip during the discarded first pass.
    const covered = new Set()
    const claim = (term) => {
      if (covered.has(term)) return false
      japaneseTerms.forEach((candidate) => {
        if (term.includes(candidate)) covered.add(candidate)
      })
      covered.add(term)
      return true
    }

    const visit = (node, blocked = false) => {
      if (!node.children) return
      const isBlocked = blocked || node.tagName === 'code' || node.tagName === 'pre'
      const next = []

      node.children.forEach((child) => {
        if (!isBlocked && child.type === 'text') {
          textWithEditorialNotes(child.value).forEach((part) => {
            if (part.type === 'text') next.push(...textWithTooltips(part.value, claim))
            else next.push(part)
          })
        } else {
          visit(child, isBlocked)
          next.push(child)
        }
      })

      node.children = next
    }

    visit(tree)
  }
}

function EditorialNoteButton({ node: _node, children, ...props }) {
  const [open, setOpen] = useState(false)
  const note = props['data-note']

  if (!note) return <button {...props}>{children}</button>

  return (
    <button
      {...props}
      className={'editorial-note' + (open ? ' open' : '')}
      aria-label={`Editorial note: ${note}`}
      aria-expanded={open}
      onClick={() => setOpen((value) => !value)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setOpen(false)
          event.currentTarget.blur()
        }
      }}
    >
      <span aria-hidden="true">{children}</span>
      <span className="editorial-note-popover" role="tooltip">
        {note}
      </span>
    </button>
  )
}

export default function JapaneseMarkdown({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeJapaneseTooltips]}
      components={{ button: EditorialNoteButton }}
    >
      {children}
    </ReactMarkdown>
  )
}
