# CLAUDE.md

Guidance for working in this repo (Spoken Japanese Crash Course — a Vite + React knowledge
base teaching conversational Japanese for travellers).

## Project layout

- `src/content/ch*.js` — all learning content. Each file exports a chapter:
  `{ id, title, subchapters: [{ id, title, body, quizTitle?, flashcards, quiz }] }`.
- `src/content/words.js` — the standalone **Common Words** vocabulary deck (no prose, no
  quizzes): `{ id, title, intro, scenarios: [{ id, title, icon, blurb, words }] }`, where
  each word is `{ jp, romaji, en, note?, example? }`, where `example` is
  `{ jp, before, focus, after, en }` and the three middle fields form the romaji example.
  One scenario = one tab at `/#/words`. `jp` is
  the string fed to speech synthesis, so keep it natural Japanese — no romaji, no
  bracketed glosses.
- `src/content/phrases.js` — the **Common Phrases** deck at `/#/phrases`. Same shape as
  `words.js` (it is rendered by the same `WordCards`), plus deck-level `breadcrumb`,
  `defaultJapaneseFirst: false` and `twoStepReveal: false` — so cards start with English
  and reveal in one tap. Every card carries a `note`; none carries an `example`, because a
  card here **is** a sentence. That is the division of labour with `words.js`: single words
  there, whole sentences here. The content is meant to be the chapters' own sentences
  regrouped by moment (ordering, paying, asking the way…), so when a chapter gains a phrase
  table, this deck is where the sentences belong too.
- `src/content/stories.js` — the **Short Stories** section: `{ id, title, intro, stories:
  [{ id, title, jpTitle, icon, blurb, cast, lines, catch?, takeaway? }] }`, where each line is
  `{ speaker?, jp, romaji, en, parts }` and a line with no `speaker` is narration.
  `parts` is the grammar breakdown shown beside the translation — one entry per chunk, in
  order, each `{ jp, romaji, en, role }`, where `en` is the chunk's meaning (`"—"` when it
  has none of its own) and `role` is its job in the sentence. **The chunks must concatenate
  back into `jp` exactly, ignoring punctuation** — that invariant is what makes a breakdown
  checkable, and it catches a skipped word straight away. Don't try to derive `parts`
  automatically: naive segmentation gets conjugated verbs (渡りませんでした) confidently wrong. One story = one
  tab at `/#/stories`. Keep `jp` to the sentence alone — the speaker label must stay out of
  it, because `jp` is what speech synthesis reads. A story ends with **either** a `catch`
  (the turn, explained in English) **or** a `takeaway` (the pattern an everyday interaction
  was built to teach) — never both, and the panel is skipped entirely if a story has
  neither. Both are hidden behind a button so a `catch` can't spoil the story. The everyday
  interactions (directions, ordering, hotel desk, till, ticket window, fitting room) come
  first in the array, since `Stories` opens on `stories[0]`. Grammar stays inside what the
  course teaches: -masu forms and the Chapter 6 set phrases.
- `src/content/puzzles.js` — the **Sentence Builder** section: thirty-three word-order exercises
  split into Foundation, Intermediate, and Advanced difficulty levels.
  The deck declares its available `tags`, and every puzzle owns a `tags` array, Japanese
  `pieces`, fixed `scrambled` order, canonical `answer`, and a written grammar `explanation`
  shown only after a correct check. Optional `alsoAcceptable` entries each own an `answer`
  tile-id array and an `explanation` of why that order is grammatical but less neutral; the
  checker still requires the canonical answer. Tiles display `romaji`, and particles
  such as `wa`, `ga`, `o`, `ni`, and `de` stay separate from the words they mark. Per-puzzle
  order and check state live in local storage; Reset removes only that puzzle's entry.
- `src/content/index.js` — imports every chapter into the `raw` array (order = display
  order), re-exports the word, story, and puzzle decks, and builds the nav/paging `flatIndex`. **A
  new chapter must be added here** or it won't appear.
- `src/components/` — Sidebar, Home, ContentView, Flashcards, Quiz, WordCards, Stories,
  SentenceBuilder, Translator, SpeakButton. The tab strip (`.tabs`/`.tab`) and `SpeakButton` are shared by
  the word deck and the stories — change them in one place, check both.
- `src/lib/speech.js` — the 🔊 audio: a thin wrapper over the browser's Web Speech API.
  Voices load asynchronously and a Japanese voice may be absent entirely, so callers must
  handle the unsupported case (the word cards hide the buttons and explain why).
  `speakSequence` reads a list of lines in order for the stories' play-whole-story button.
  Note that speaking anything calls `synth.cancel()`, which would otherwise make a running
  sequence advance — that's why `SpeakButton` takes an `onPlay` hook to stop the story
  first.
- `src/lib/phrasebook.js` + `src/lib/translate.js` — the quick-translate box. **The
  phrasebook is derived from the content, never hand-written**: it indexes `words.js`, `phrases.js`, the
  `translations.js` tooltips, and every chapter table row whose first cell contains
  Japanese; `stories.js` is deliberately **not** indexed, because story narration ("a year
  passed") is not a phrase anyone looks up and it crowds out the ones that are.
  So a new `| Japanese | Romaji | Meaning |` row becomes translatable for free —
  and reformatting a phrase table out of that shape silently removes those phrases from
  the translator. `translate.js` is a lookup, not a translation engine: exact match, then
  closest phrases, then a word-by-word gloss. Every entry also carries the `path` it came
  from (`/ch/<chapter>/<sub>`, or `/words?s=<scenario>` for the deck), which the result
  renders as a link — so the word deck reads its open tab from `?s=`, not from local state.
- `src/lib/browserTranslate.js` — the **direct translation** shown above the course
  phrases: the browser's own built-in Translator API (a `Translator` global, Chrome 138+).
  Most browsers don't have it, the language pair may be unsupported, and the first use
  downloads a language pack, so every state is rendered rather than assumed. A `create()`
  that can't reach its language pack never rejects — it just re-reports 0% forever — hence
  the stall guard that only counts *forward* progress.
- `Translator` is rendered by each page under its `h1`, but its state lives in
  `TranslatorProvider` in `App.jsx`, so what you typed survives navigation.
- `body` is Markdown rendered with `react-markdown` + `remark-gfm` (GFM tables, etc.).
  There is **no LaTeX/KaTeX** — write any math in Unicode (`≤`, `²`, `Θ`, `√`).
- Quiz items: an item with `options` is multiple-choice (`answer` = 0-based index,
  optional `explanation`); without `options` it's an open question (`answer` = string).
- Code fences inside `body` use `~~~` (not triple backticks), because `body` is itself a
  template literal delimited by backticks.

## Offline / PWA

The site is an installable PWA that works with no network: `vite-plugin-pwa` (configured in
`vite.config.js`) generates a service worker that precaches the entire build and serves it
cache-first, with `registerType: 'autoUpdate'`. Things to keep in mind when changing it:

- `manifest.start_url`/`scope` and `workbox.navigateFallback` must all stay under Vite's
  `base`, which is the GitHub Pages subpath in a build. `baseFor()` in `vite.config.js` is
  the single source of that value — `vite preview` uses the subpath too, because it serves
  built output whose asset URLs already contain it.
- `workbox.maximumFileSizeToCacheInBytes` is raised to 4 MiB from Workbox's 2 MiB default
  as headroom: everything ships in one bundle (~550 kB today, and it grows with every
  chapter), and a file over the ceiling is dropped from the precache *silently* — for a
  single-bundle app that means it stops opening offline at all.
- Icons live in `public/` (`icon-192`, `icon-512`, a `maskable` 512 for Android cropping,
  and `apple-touch-icon.png`, which is the only one iOS reads).
- **Nothing in the app may fetch at runtime** — that assumption is what makes offline work.
  Two exceptions are out of our control, and both are handed to the *browser*, never to a
  server of ours, so they degrade rather than break:
  - Some Android voices synthesise speech over the network, so `speakJapanese`/
    `speakSequence` take an `onError` callback and the UI reports a voice that is present
    but silent (🔇 on the button, a note in the stories).
  - The built-in Translator API behind the direct-translation line needs a one-time
    language-pack download. `browserTranslate` rejects with `code: 'offline'` as soon as
    `navigator.onLine === false` (and if the network drops mid-download), instead of
    showing progress that cannot move; `useOnline` in `Translator.jsx` retries when the
    connection returns. Only `navigator.onLine === false` is trustworthy — `true` says
    nothing about real connectivity, so it is never used to assume a network exists.

## Adding / editing content

1. Edit or create `src/content/chN-*.js`.
2. Register it in `src/content/index.js` (import + append to `raw`).
3. Update the stats line and chapter list in `README.md`.
4. Verify with `npm run build` before committing.

## Content conventions (Japanese course)

- **Spoken language only.** The course teaches communication, not writing — no kana or
  kanji drills. Japanese script appears only so learners can *recognise* signs and menus.
- **Every phrase gets romaji**, and usually the script + romaji + English, in that order.
  Tables (`| Japanese | Romaji | Meaning |`) are the standard format for phrase lists.
- **Long vowels are written out** in romaji (*biiru*, *arigatou*, *gozaimasu*) rather than
  with macrons — the course teaches vowel length as a meaning-bearing feature.
- `title` fields are **plain text** (Sidebar and pager render them without Markdown), so
  don't put `*emphasis*` in a chapter or subchapter title. Markdown is fine in `body`,
  flashcards, quiz questions, answers and explanations.

## Markdown gotcha: consecutive blockquote lines merge

`react-markdown` follows CommonMark: **two `>` lines with no blank line between them are
joined into one paragraph** separated by a space. So this:

~~~md
> ¬(P ∧ Q) = ¬P ∨ ¬Q
> ¬(P ∨ Q) = ¬P ∧ ¬Q
~~~

renders as one run-on line — `…¬P ∨ ¬Q ¬(P ∨ Q)…` — which looks like a syntax error
(e.g. a missing operator between two formulas).

**Fix:** separate the lines with a blank quote line (`>`) so each becomes its own
paragraph and renders on its own line:

~~~md
> ¬(P ∧ Q) = ¬P ∨ ¬Q
>
> ¬(P ∨ Q) = ¬P ∧ ¬Q
~~~

This applies to any multi-line formula/derivation block in a `body` string (chained
inequalities, quantifier laws, step-by-step proofs).
