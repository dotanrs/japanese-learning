import ch1 from './ch1-sounds-and-survival.js'
import ch2 from './ch2-sentence-building.js'
import ch3 from './ch3-word-building.js'
import ch4 from './ch4-verbs-in-action.js'
import ch5 from './ch5-numbers-and-time.js'
import ch6 from './ch6-tourist-situations.js'
import ch7 from './ch7-quirks.js'
import ch8 from './ch8-relationships-and-position.js'
import words from './words.js'
import stories from './stories.js'
import puzzles from './puzzles.js'

// Keep sentence-building focused on the immediately useful foundations. The
// connector lesson depends on verb forms such as the te-form and -tara, so it
// is taught after those forms rather than before them.
const linkingWords = ch2.subchapters.find((s) => s.id === 'linking-words')
const sentenceBuilding = {
  ...ch2,
  subchapters: ch2.subchapters.filter((s) => s.id !== 'linking-words'),
}
const verbsInAction = {
  ...ch4,
  subchapters: [...ch4.subchapters, linkingWords],
}

// Relationships and position build directly on the particles chapter, so the
// former Chapter 8 now follows Chapter 2.
const raw = [ch1, sentenceBuilding, ch8, ch3, verbsInAction, ch5, ch6, ch7]

export const wordDeck = words

export const storyDeck = stories

export const puzzleDeck = puzzles

export const chapters = raw.map((ch, i) => ({ ...ch, num: i + 1 }))

// Flat, ordered index used for prev/next paging.
export const flatIndex = chapters.flatMap((ch) =>
  ch.subchapters.map((s) => ({
    chapterId: ch.id,
    subId: s.id,
    title: s.title,
    chapterTitle: ch.title,
    path: `/ch/${ch.id}/${s.id}`,
  }))
)
