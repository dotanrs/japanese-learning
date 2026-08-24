// A searchable Japanese ↔ English phrasebook, built from content the course
// already ships: the Common Words and Common Phrases decks, the tooltip
// translations, and every three- or two-column phrase table in the chapters.
//
// Nothing here is hand-maintained — add a table row or a word and it becomes
// translatable. Built lazily on first lookup and memoised, since it walks
// every chapter body.
//
// Every entry also carries the route it came from, so a result can send you to
// the page that teaches it.
import { chapters, wordDeck, phraseDeck } from '../content/index.js'
import { japaneseTranslations } from '../content/translations.js'

// Hiragana, katakana, CJK ideographs, half-width katakana.
const JP_CHAR = /[぀-ヿ㐀-䶿一-鿿ｦ-ﾟ]/

export const hasJapanese = (s) => JP_CHAR.test(s)

// Markdown emphasis, Japanese quote brackets and stray quotes carry no meaning
// once a cell is out of its table.
function clean(cell) {
  return cell
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/[「」『』]/g, '')
    .replace(/^["“”'](.*)["“”']$/, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normaliseEn(s) {
  return s
    .toLowerCase()
    .replace(/[.,!?;:"“”'’()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normaliseRomaji(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[.,!?;:"“”'’()~〜]/g, '')
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normaliseJp(s) {
  return s.replace(/[\s。、！？!?~〜．・]/g, '').trim()
}

// A row like "はい / いいえ | hai / iie | Yes / no" is really two entries.
function splitAlternatives(entry) {
  const parts = [entry.jp, entry.romaji, entry.en].map((v) =>
    (v || '').split(/\s+\/\s+/).map((p) => p.trim())
  )
  const [jps, romajis, ens] = parts
  if (jps.length < 2 || jps.length !== ens.length) return [entry]
  if (romajis.length !== jps.length) return [entry]
  return jps.map((jp, i) => ({ ...entry, jp, romaji: romajis[i], en: ens[i] }))
}

// Two-column tables put the script and the romaji in one cell:
// "いらっしゃいませ *irasshaimase*". Peel the romaji off the end.
function splitScriptAndRomaji(cell) {
  const emphasised = cell.match(/^(.*?)\s*\*([^*]+)\*\s*$/)
  if (emphasised && hasJapanese(emphasised[1])) {
    return { jp: clean(emphasised[1]), romaji: clean(emphasised[2]) }
  }
  return { jp: clean(cell), romaji: '' }
}

function tableRows(body) {
  const out = []
  for (const line of body.split('\n')) {
    const t = line.trim()
    if (!t.startsWith('|') || !t.endsWith('|')) continue
    const cells = t.slice(1, -1).split('|').map((c) => c.trim())
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue // divider row
    if (!hasJapanese(cells[0] || '')) continue // header, or a romaji-only table
    if (cells.length === 3) {
      out.push({ jp: clean(cells[0]), romaji: clean(cells[1]), en: clean(cells[2]) })
    } else if (cells.length === 2) {
      out.push({ ...splitScriptAndRomaji(cells[0]), en: clean(cells[1]) })
    }
  }
  return out
}

let cache = null

export function phrasebook() {
  if (cache) return cache

  const entries = []
  const seen = new Set()
  const add = (entry, source, path) => {
    const jp = clean(entry.jp || '')
    const en = clean(entry.en || '')
    if (!jp || !en || !hasJapanese(jp)) return
    const key = normaliseJp(jp) + '|' + normaliseEn(en)
    if (seen.has(key)) return
    seen.add(key)
    entries.push({ jp, romaji: clean(entry.romaji || ''), en, source, path: path || null })
  }

  // The word deck first: it carries the cleanest romaji, so it wins on ties.
  // `?s=` picks the scenario tab, so the link lands on the right deck.
  wordDeck.scenarios.forEach((sc) =>
    sc.words.forEach((w) => add(w, `Common Words · ${sc.title}`, `/words?s=${sc.id}`))
  )

  phraseDeck.scenarios.forEach((sc) =>
    sc.words.forEach((phrase) =>
      add(phrase, `Common Phrases · ${sc.title}`, `/phrases?s=${sc.id}`)
    )
  )

  const pages = []
  chapters.forEach((ch) =>
    ch.subchapters.forEach((sub) => {
      if (!sub.body) return
      const source = `Chapter ${ch.num} · ${sub.title}`
      const path = `/ch/${ch.id}/${sub.id}`
      pages.push({ source, path, body: sub.body })
      tableRows(sub.body).forEach((row) =>
        splitAlternatives(row).forEach((e) => add(e, source, path))
      )
    })
  )

  // A tooltip phrase has no home of its own, but it is tooltipped because it
  // appears in a chapter body — so link it to the page it appears on.
  Object.entries(japaneseTranslations).forEach(([jp, en]) => {
    const page = pages.find((p) => p.body.includes(jp))
    add({ jp, en }, page ? page.source : 'Phrase tooltips', page ? page.path : null)
  })

  // The tooltip phrases carry no romaji of their own. Where the same Japanese
  // appears in a chapter table or the word deck, borrow the romaji from there
  // so every result can show how to say it.
  const romajiFor = new Map()
  entries.forEach((e) => {
    const k = normaliseJp(e.jp)
    if (e.romaji && !romajiFor.has(k)) romajiFor.set(k, e.romaji)
  })
  entries.forEach((e) => {
    if (!e.romaji) e.romaji = romajiFor.get(normaliseJp(e.jp)) || ''
  })

  cache = entries
  return cache
}
