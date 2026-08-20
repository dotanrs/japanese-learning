// Phrasebook translation: look the input up in everything the course teaches,
// in whichever direction the input's script implies.
//
// This is a lookup over the course's own 500-odd phrases, not a machine
// translation engine — so it answers with what the course actually says, romaji
// included, and admits it when a phrase isn't covered. When there is no whole-
// phrase match it falls back to a word-by-word gloss, which is usually enough
// to make yourself understood.
import {
  hasJapanese,
  normaliseEn,
  normaliseJp,
  normaliseRomaji,
  phrasebook,
} from './phrasebook.js'

const EN_STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'was', 'were', 'be', 'do', 'does', 'did',
  'of', 'for', 'to', 'in', 'on', 'at', 'my', 'your', 'it', 'this', 'that',
  'please', 'i', 'you', 'me', 'have', 'has', 'can', 'not', 'dont', 'doesnt',
  'cant', 'wont', 'im', 'ive', 'id', 'ill', 'and', 'some', 'any',
])

let indexes = null

function buildIndexes() {
  if (indexes) return indexes
  const entries = phrasebook()
  const byJp = new Map()
  const byEn = new Map()
  const byRomaji = new Map()

  entries.forEach((e) => {
    const jp = normaliseJp(e.jp)
    const en = normaliseEn(e.en)
    const romaji = normaliseRomaji(e.romaji)
    if (!byJp.has(jp)) byJp.set(jp, [])
    byJp.get(jp).push(e)
    // The course teaches in romaji, so romaji is a first-class way to look a
    // phrase up — not just the script.
    if (romaji) {
      if (!byRomaji.has(romaji)) byRomaji.set(romaji, [])
      byRomaji.get(romaji).push(e)
    }
    if (!byEn.has(en)) byEn.set(en, [])
    byEn.get(en).push(e)
    // A meaning like "excuse me / sorry" should also be findable as "sorry".
    en.split(/\s*\/\s*/).forEach((alt) => {
      const key = normaliseEn(alt)
      if (!key || key === en) return
      if (!byEn.has(key)) byEn.set(key, [])
      byEn.get(key).push(e)
    })
  })

  // Short entries only, for word-by-word glossing: whole sentences make
  // terrible glosses of a single word.
  const lexicon = entries.filter(
    (e) => normaliseJp(e.jp).length <= 8 && normaliseEn(e.en).split(' ').length <= 4
  )

  // How many meanings each English word appears in, so scoring can weigh
  // "wasabi" above "no".
  const df = new Map()
  entries.forEach((e) => {
    new Set(normaliseEn(e.en).split(' ')).forEach((w) => df.set(w, (df.get(w) || 0) + 1))
  })

  // One short Japanese equivalent per English content word, for glossing words
  // that no phrase in the book covers on its own.
  const wordGloss = new Map()
  lexicon.forEach((e) => {
    const words = normaliseEn(e.en).split(' ')
    if (words.length > 3) return
    words.forEach((w) => {
      if (w.length < 3 || EN_STOPWORDS.has(w)) return
      if (!wordGloss.has(w)) wordGloss.set(w, e)
    })
  })

  indexes = { entries, byJp, byEn, byRomaji, lexicon, df, wordGloss }
  return indexes
}

// One card per Japanese phrase. Several chapters gloss すみません slightly
// differently; four restatements of the same phrase is noise, and the
// phrasebook is ordered word-deck-first, so the first hit has the best romaji.
const dedupe = (list) => {
  const seen = new Set()
  return list.filter((e) => {
    const k = normaliseJp(e.jp)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function closestJaToEn(query, entries) {
  return entries
    .map((e) => {
      const jp = normaliseJp(e.jp)
      let score = 0
      if (jp.includes(query)) score = query.length / jp.length
      else if (query.includes(jp)) score = (jp.length / query.length) * 0.9
      return { e, score }
    })
    .filter((r) => r.score > 0.25)
    .sort((a, b) => b.score - a.score)
}

// Match whole words, not substrings: a raw includes() would score "meat" as a
// hit for "eat" and let a single word outrank the phrase that answers the
// question. Prefixes either way still count, so plurals and endings match.
function wordHit(token, words) {
  return words.some((w) => {
    if (w === token) return true
    // Both sides must be substantial and nearly the same length, or "was"
    // would count as a hit for "wasabi" and "a" for anything at all.
    if (token.length < 4 || w.length < 4) return false
    const [short, long] = token.length < w.length ? [token, w] : [w, token]
    return long.startsWith(short) && long.length - short.length <= 2
  })
}

// Tolerate a typo or a missing ending: "helpp" should still find "help",
// "vegetarian" should still find "vegetarians".
function looseHit(token, words) {
  if (token.length < 4) return false
  return words.some((w) => {
    if (w.length < 4) return false
    let i = 0
    while (i < token.length && i < w.length && token[i] === w[i]) i += 1
    return i >= 4 && i >= Math.min(token.length, w.length) - 2
  })
}

function closestEnToJa(query, entries, df) {
  const tokens = query.split(' ').filter((t) => t && !EN_STOPWORDS.has(t))
  if (tokens.length === 0) return []
  // Rare words carry the meaning: matching "wasabi" says far more about the
  // phrase you want than matching "no".
  const weight = (t) =>
    Math.max(0.25, Math.log(entries.length / (1 + (df.get(t) || 0))))
  const total = tokens.reduce((sum, t) => sum + weight(t), 0)

  return entries
    .map((e) => {
      const en = normaliseEn(e.en)
      const words = en.split(' ')
      const hit = tokens.filter((t) => wordHit(t, words) || looseHit(t, words))
      let score = hit.reduce((sum, t) => sum + weight(t), 0) / total
      // Prefer the entry that says little else besides the match.
      if (score > 0) score -= Math.min(0.35, words.length / 60)
      if (en === query) score = 2
      return { e, score }
    })
    .filter((r) => r.score > 0.3)
    .sort((a, b) => b.score - a.score)
}

function closestRomaji(query, entries) {
  return entries
    .map((e) => {
      const romaji = normaliseRomaji(e.romaji)
      if (!romaji) return { e, score: 0 }
      let score = 0
      if (romaji === query) score = 2
      else if (romaji.includes(query)) score = query.length / romaji.length
      else if (query.includes(romaji)) score = (romaji.length / query.length) * 0.9
      else if (looseHit(query, romaji.split(' '))) score = 0.55
      return { e, score }
    })
    .filter((r) => r.score > 0.4)
    .sort((a, b) => b.score - a.score)
}

// Greedy longest-match segmentation of a Japanese string.
function glossJapanese(query, byJp, lexicon) {
  const known = new Map()
  lexicon.forEach((e) => {
    const k = normaliseJp(e.jp)
    if (!known.has(k)) known.set(k, e)
  })
  const maxLen = Math.max(...[...known.keys()].map((k) => k.length), 1)

  const out = []
  let i = 0
  while (i < query.length) {
    let hit = null
    for (let len = Math.min(maxLen, query.length - i); len >= 1; len--) {
      const slice = query.slice(i, i + len)
      const entry = known.get(slice) || (byJp.get(slice) || [])[0]
      if (entry) {
        hit = { token: slice, entry }
        i += len
        break
      }
    }
    if (hit) {
      out.push(hit)
    } else {
      // Roll unknown characters into one token rather than one per character.
      const last = out[out.length - 1]
      if (last && !last.entry) last.token += query[i]
      else out.push({ token: query[i], entry: null })
      i += 1
    }
  }
  return out
}

// Word-by-word over English, trying two-word phrases before single words.
function glossEnglish(query, byEn, lexicon, wordGloss) {
  const known = new Map()
  lexicon.forEach((e) => {
    const k = normaliseEn(e.en)
    if (!known.has(k)) known.set(k, e)
    k.split(/\s*\/\s*/).forEach((alt) => {
      const key = normaliseEn(alt)
      if (key && !known.has(key)) known.set(key, e)
    })
  })

  // Glossing function words invites false friends — "am" is not 午前 here.
  const words = query.split(' ').filter((w) => w && !EN_STOPWORDS.has(w))
  const out = []
  let i = 0
  while (i < words.length) {
    let hit = null
    for (let len = Math.min(3, words.length - i); len >= 1; len--) {
      const slice = words.slice(i, i + len).join(' ')
      const entry = known.get(slice) || (byEn.get(slice) || [])[0]
      if (entry) {
        hit = { token: slice, entry }
        i += len
        break
      }
    }
    if (hit) {
      out.push(hit)
    } else {
      // No phrase covers this word; fall back to its own short equivalent.
      const w = words[i]
      const single =
        wordGloss.get(w) ||
        wordGloss.get(w.replace(/(ies|es|s)$/, '')) ||
        wordGloss.get(w + 's')
      out.push({ token: w, entry: single || null })
      i += 1
    }
  }
  return out
}

export function translate(raw) {
  const input = (raw || '').trim()
  const empty = { status: 'empty', direction: null, matches: [], gloss: [] }
  if (!input) return empty

  const { entries, byJp, byEn, byRomaji, lexicon, df, wordGloss } = buildIndexes()

  // Japanese script in, English out. Otherwise the input is English *or*
  // romaji, and which one it is decides the direction.
  if (hasJapanese(input)) {
    const query = normaliseJp(input)
    if (!query) return empty
    const exact = dedupe(byJp.get(query) || [])
    if (exact.length) {
      return { status: 'exact', direction: 'ja-en', matches: exact.slice(0, 4), gloss: [] }
    }
    const ranked = closestJaToEn(query, entries)
    const gloss = glossJapanese(query, byJp, lexicon)
    return resolve('ja-en', ranked, gloss)
  }

  const enQuery = normaliseEn(input)
  const romajiQuery = normaliseRomaji(input)
  if (!enQuery && !romajiQuery) return empty

  const enExact = dedupe(byEn.get(enQuery) || [])
  if (enExact.length) {
    return { status: 'exact', direction: 'en-ja', matches: enExact.slice(0, 4), gloss: [] }
  }
  const romajiExact = dedupe(byRomaji.get(romajiQuery) || [])
  if (romajiExact.length) {
    return { status: 'exact', direction: 'ja-en', matches: romajiExact.slice(0, 4), gloss: [] }
  }

  const enRanked = closestEnToJa(enQuery, entries, df)
  const romajiRanked = closestRomaji(romajiQuery, entries)
  // Whichever reading of the input matches the course better wins.
  if (romajiRanked.length && (!enRanked.length || romajiRanked[0].score > enRanked[0].score)) {
    return resolve('ja-en', romajiRanked, [])
  }
  return resolve('en-ja', enRanked, glossEnglish(enQuery, byEn, lexicon, wordGloss))
}

// A well-covered word-by-word gloss beats a loose single-phrase guess, but
// never beats a phrase that already matches nearly all of the input.
function resolve(direction, ranked, gloss) {
  const matches = dedupe(ranked.map((r) => r.e)).slice(0, 4)
  const topScore = ranked.length ? ranked[0].score : 0
  const hits = gloss.filter((g) => g.entry).length

  // When the gloss is the answer, the phrase list is only a supplement — two
  // is plenty, and a long tail of loose matches reads as noise.
  if (topScore < 0.9 && hits >= 2 && hits >= gloss.length - 1) {
    return { status: 'gloss', direction, matches: matches.slice(0, 2), gloss }
  }
  if (matches.length) return { status: 'close', direction, matches, gloss }
  if (hits > 0) return { status: 'gloss', direction, matches: [], gloss }
  return { status: 'none', direction, matches: [], gloss: [] }
}
