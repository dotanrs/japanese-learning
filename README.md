# 🗾 Spoken Japanese Crash Course

A fast, navigable React knowledge base for learning **spoken** Japanese as a visitor —
enough to explain basic things, order food, get around and ask for help. **No writing
system**: everything is taught in romaji, with kana/kanji shown alongside only so you can
recognise signs and menus.

Nothing needs to be read in order: use the sidebar (with live filter) or the home grid to
jump anywhere.

## Run it

```bash
npm install
npm run dev     # start the dev server (prints a localhost URL)
```

Then open the printed URL (e.g. http://localhost:5173).

Other scripts:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build
```

## Deploy (GitHub Pages)

Pushing to `main` builds the site and publishes it to GitHub Pages via
`.github/workflows/deploy.yml`. One-time setup: in the repo, go to
**Settings → Pages → Build and deployment → Source** and select
**GitHub Actions**.

The site is served from the project subpath, so the production build sets
Vite's `base` to `/japanese-learning/` (see `vite.config.js`); `npm run dev` stays
at the root path, while `npm run preview` uses the subpath because it serves the
built output. Routing uses `HashRouter`, so deep links and refreshes work on Pages
without extra 404 handling.

## Install it on your phone (offline)

The site is a PWA: it installs to the home screen and then works with **no network at
all** — every chapter, flashcard, quiz, word card, story and the translator are already
on the device.

- **iPhone/iPad** — open the site in Safari, then **Share → Add to Home Screen**.
- **Android** — open it in Chrome and accept the install prompt (or **⋮ → Install app**).

Nothing in the app talks to the network at runtime, so the whole thing is three static
files (~600 kB). `vite-plugin-pwa` precaches all of them on first visit and serves them
cache-first; `registerType: 'autoUpdate'` means a new version is picked up silently the
next time the phone is online. Offline reloads and deep links are covered by the app
shell, so a refresh on the underground is safe.

The one part that can still go quiet offline is the 🔊 audio, and that is out of the
app's hands: it uses the device's own speech synthesis. iOS ships an on-device Japanese
voice (Kyoko), but several Android voices synthesise on Google's servers, so they fail
without a network until an offline Japanese voice is installed (**Settings → System →
Languages & input → Text-to-speech output → install voice data → Japanese**). When a
voice is listed but refuses to speak, the button turns 🔇 and the page explains why —
distinct from "no Japanese voice at all", where the buttons stay hidden.

Two caveats worth knowing: service workers need HTTPS (GitHub Pages provides it, and
`localhost` counts for local testing), and iOS may evict an installed app's cache after
several weeks unused — reopening it once online restores everything.

## What's inside

8 chapters · 26 topics · 145 flashcards · 81 self-test questions, plus a standalone
**Common Words** deck of 195 vocabulary cards across 10 scenarios and 7 **Short Stories**
in dialogue.

1. **Sounds & Survival Kit** — the mora/beat system, the five vowels, vowel length as
   meaning (*biiru* vs *biru*), pitch accent, devoiced vowels; the 20 phrases that cover a
   whole trip; politeness registers and why *-masu* form is the one to learn
2. **How a Sentence Is Built** — subject–object–verb order, dropping the subject, avoiding
   *anata*; the ten core particles (*wa, ga, o, ni, de, no, to, mo, kara, made*), *wa* vs
   *ga*, *ni* vs *de*; asking questions with *ka* and question words; ko-so-a-do
   (*kore/sore/are*) and existence with *arimasu/imasu*
3. **How Words Are Built** — the three vocabulary layers (native, Sino-Japanese, borrowed),
   suffixes and prefixes that build word families, compounds and sequential voicing, *suru*
   as a verb-maker; i-adjectives vs na-adjectives; the three verb groups
4. **Tenses & Verb Forms That Matter** — two tenses only (there is no future), the four
   polite endings, *-te imasu* for ongoing actions and resulting states; the te-form and its
   uses (requests, permission, chaining, prohibition); *-tai* (want), potential (can),
   *-mashou* / *-masen ka* (let's / shall we)
5. **Numbers, Counting & Time** — numbers and the *man* (10,000) grouping, money and payment
   phrases; counters and the universal *tsu* escape hatch; clock time, days, months and the
   irregular days of the month
6. **Tourist Situations, Line by Line** — eating out (the full scripted visit, dietary
   needs, convenience-store questions), shopping and tax-free, trains/taxis/directions,
   hotels, illness and emergencies
7. **Quirks of the Language** — what Japanese leaves out (articles, plurals, agreement,
   subjects, "you"); *aizuchi* listening noises, hedging and *chotto* as a refusal, *ne*/*yo*;
   traps for English speakers (false-friend katakana, *hai* ≠ yes, *daijoubu desu*)
8. **With, Without, Over and Under** — companion *to* versus tool/method *de*, the
   *nashi de* pattern; relative positions built as reference + *no* + position, choosing
   *ni* for existence and *de* for actions, and *o* for a route through a place

### Common Words (`/#/words`)

A vocabulary-only section, separate from the chapters: tabs for **Particles, With & Where,
Questions, Essentials, Restaurant, Hotel, Shop, Street, Trouble** and **People**, each a
grid of flip cards showing the Japanese, the romaji and the meaning. Swap the prompt
direction (日本語 → English or the reverse) and reveal or hide a whole scenario at once.
In Japanese-first mode, cards in **With & Where** use the two-step reveal: the first tap
shows the word in a sentence, and the second reveals its meaning and usage note.

Each card has a 🔊 button that speaks the word using the browser's built-in speech
synthesis — no dependency, no API key, no network call. Where the device has no Japanese
voice installed the buttons are hidden and the page says so.

### Short Stories (`/#/stories`)

Seven very short stories, one per tab, almost entirely dialogue — two Ikkyū riddles, three
jokes built on a literal reading, a Zen story, and a restaurant scene where a textbook
phrase backfires. Each runs six to nine lines and turns on a pun or a reversal.

Every line shows the Japanese and its romaji. **Tap a sentence** for its English plus a
word-by-word breakdown: every chunk of the sentence in order, with what it means and the
job it does — *topic marker*, *object marker*, *te-form of 渡る*, *potential negative of
縛る*. 267 chunks across the 49 lines, all hand-written.

Two reveal levels, on purpose: tapping one sentence gives the full study view, while
**Show all English** gives translations only, since seven breakdowns at once is a wall.
🔊 reads a single line and **Play story** reads the whole thing in order, highlighting each
line as it goes. The catch is explained at the end, behind a button so it can't spoil the
read.

### Quick translate

Every page carries a translate box under its headline, sharing one state — type a phrase,
navigate, and it is still there. It reads the input's script to pick a direction, so
English goes to Japanese and Japanese (or romaji) comes back to English, with no toggle to
set.

The engine is the course itself: `src/lib/phrasebook.js` indexes the Common Words deck,
the phrase tooltips, and every `| Japanese | Romaji | Meaning |` table row in the chapters
into ~510 entries, and `src/lib/translate.js` looks the input up in that. So it answers
with what the course actually teaches, romaji and source chapter included — an exact hit
where one exists, the closest phrases otherwise, and a word-by-word gloss when nothing
matches whole. It tolerates romaji spelling (*arigato* → ありがとう) and small typos, and
says plainly when a phrase isn't covered.

This is a phrasebook lookup, **not** a machine-translation engine: it is offline, private
and instant, but it only knows the ~510 phrases the course contains. Each result names the
chapter or word-deck scenario it comes from, **and links to it** — so a phrase you like is
one click from the page that teaches it.

Above the course phrases sits a **direct translation from the browser itself**
(`src/lib/browserTranslate.js`), using the built-in Translator API — Chrome 138+ today. It
covers whatever the course doesn't: any sentence, translated on the device, nothing sent
to a server. The first use of a language pair downloads a language pack, which the box
reports as it goes; browsers without the API simply say so and show the course phrases
alone. It gives no romaji and doesn't know what the course teaches, which is exactly why
it sits *above* the phrasebook rather than replacing it.

### Features

- **Non-linear navigation** — collapsible sidebar (the logo returns home), searchable topic
  filter, home grid, and prev/next paging.
- **🔤 Quick translate** — a shared box on every page, either direction, with audio: the
  browser's own translation on top, then the course's own phrases, each linked to its
  chapter.
- **🃏 Flashcards** — click to reveal the answer.
- **🗂️ Word cards** — the Common Words deck, tabbed by scenario, with spoken audio.
- **📖 Short stories** — dialogue with per-sentence translations, grammar breakdowns and
  whole-story playback.
- **🧠 Test-yourself** — multiple-choice (instant right/wrong feedback + explanation) and
  open questions (reveal the worked answer).
- **📴 Offline** — installable to the home screen and fully usable with no network.

## Structure

```
public/                   # PWA icons + favicon, copied verbatim into the build
src/
  App.jsx                 # routing + layout + the shared translator state
  components/             # Sidebar, Home, ContentView, Flashcards, Quiz,
                          # WordCards, Stories, Translator, SpeakButton
  lib/
    speech.js             # Web Speech API wrapper for 🔊 and story playback
    phrasebook.js         # builds the JA↔EN index (with links) out of the course content
    translate.js          # the lookup behind the quick-translate box
    browserTranslate.js   # the browser's built-in Translator API, for the direct line
  content/
    index.js              # aggregates chapters + word deck, builds nav/paging index
    ch1-sounds-and-survival.js … ch8-relationships-and-position.js
                                               # chapter content lives here
    words.js              # the Common Words vocabulary deck
    stories.js            # the Short Stories dialogues
```

To edit or add chapter content, open the relevant `content/ch*.js` file — each exports a
chapter object of `{ id, title, subchapters: [{ id, title, body, flashcards, quiz }] }`.
`body` is Markdown; quiz items with `options` are multiple-choice (`answer` is
the 0-based index), otherwise they're open questions (`answer` is a string).

To edit the stories, open `content/stories.js` — it exports
`{ id, title, intro, stories: [{ id, title, jpTitle, icon, blurb, cast, lines, catch }] }`,
where each line is `{ speaker?, jp, romaji, en, parts }` and a line without a `speaker` is
narration. Adding a story adds a tab. `parts` is the breakdown — `{ jp, romaji, en, role }`
per chunk, and the chunks must join back into the sentence exactly (punctuation aside).

To edit vocabulary, open `content/words.js` — it exports
`{ id, title, intro, scenarios: [{ id, title, icon, blurb, words }] }`, where each word is
`{ jp, romaji, en, note? }`. Adding a scenario adds a tab; no other file needs touching.
