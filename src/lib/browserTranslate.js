// The browser's own machine translation, used for the "direct translation"
// line in the quick-translate box.
//
// This is the built-in Translator API (a `Translator` global; Chrome 138+).
// Nothing is sent to a server — the browser downloads a language pack once and
// translates on the device — but most browsers don't have it at all, so every
// caller has to cope with it being missing, with the language pair being
// unsupported, and with the first translation waiting on a download.
//
// It complements the phrasebook rather than replacing it: it will translate
// anything, but it doesn't know what the course teaches and gives no romaji.

const api = () => (typeof globalThis === 'undefined' ? undefined : globalThis.Translator)

export const hasBrowserTranslator = () => typeof api()?.create === 'function'

// 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported'.
// Older builds answered 'after-download' where the spec now says 'downloadable'.
export async function pairAvailability(from, to) {
  const T = api()
  if (!T) return 'unsupported'
  if (typeof T.availability !== 'function') return 'available' // pre-spec build: just try
  try {
    const state = await T.availability({ sourceLanguage: from, targetLanguage: to })
    return state === 'after-download' ? 'downloadable' : state || 'unavailable'
  } catch {
    return 'unavailable'
  }
}

const fail = (code, message) => Object.assign(new Error(message), { code })

// `navigator.onLine === false` is the only half of that flag worth trusting:
// `true` says nothing about real connectivity, but `false` does mean a language
// pack cannot be fetched. The course itself works offline, so this path is
// common rather than exotic — worth answering at once instead of showing a
// progress bar that has nothing to report.
const definitelyOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false

const OFFLINE_MESSAGE =
  'No network, so the browser can’t fetch its language pack. The course phrases below still work.'

// A download already under way when the network drops would otherwise sit
// there until the stall guard fires; going offline is a definite answer.
function offlineTrip() {
  if (typeof window === 'undefined') return { promise: new Promise(() => {}), stop: () => {} }
  let reject
  const promise = new Promise((_, rej) => {
    reject = rej
  })
  const onOffline = () => reject(fail('offline', OFFLINE_MESSAGE))
  window.addEventListener('offline', onOffline)
  return { promise, stop: () => window.removeEventListener('offline', onOffline) }
}

// One translator per language pair, kept for the life of the page: creating one
// can cost a model download, and the box re-translates on every keystroke.
// Every waiting caller hears the download progress, not just the first.
const pool = new Map()

function getTranslator(from, to, onProgress) {
  const key = `${from}>${to}`
  const pooled = pool.get(key)
  if (pooled) {
    if (onProgress) pooled.listeners.add(onProgress)
    return pooled.promise
  }

  const listeners = new Set(onProgress ? [onProgress] : [])
  const promise = api().create({
    sourceLanguage: from,
    targetLanguage: to,
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        const loaded = typeof e.loaded === 'number' ? e.loaded : 0
        listeners.forEach((fn) => fn(loaded))
      })
    },
  })
  // A rejected create must not poison the pool — a download can fail, or need
  // a user gesture, and the next keystroke should be allowed to try again.
  promise.catch(() => {
    if (pool.get(key)?.promise === promise) pool.delete(key)
  })
  pool.set(key, { promise, listeners })
  return promise
}

// A caller that has given up (or finished) shouldn't stay subscribed to a
// download it can no longer report.
function dropListener(from, to, fn) {
  pool.get(`${from}>${to}`)?.listeners.delete(fn)
}

// `create()` can hang indefinitely — a language pack that can't be reached
// never rejects — and a box stuck on "translating…" is worse than one that
// admits it gave up. Only *forward* progress restarts the clock, so a slow
// download is left alone while a retry loop reporting 0% forever is not.
const STALL_MS = 20000

function stallGuard() {
  let timer
  let reject
  const promise = new Promise((_, rej) => {
    reject = rej
  })
  const arm = () => {
    clearTimeout(timer)
    timer = setTimeout(
      () => reject(fail('stalled', 'The browser didn’t finish downloading its language pack')),
      STALL_MS
    )
  }
  arm()
  return { promise, arm, stop: () => clearTimeout(timer) }
}

// Resolves to the translated text. Rejects with an Error carrying a `code`
// ('unsupported', 'unavailable', 'offline', 'blocked' or 'failed') the caller
// can explain.
export async function browserTranslate(text, { from, to, onProgress } = {}) {
  if (!hasBrowserTranslator()) throw fail('unsupported', 'No built-in translator')

  const state = await pairAvailability(from, to)
  if (state === 'unavailable') {
    throw fail('unavailable', `No ${from} → ${to} language pack`)
  }
  // A pack that is not on the device yet needs the network to arrive. Saying so
  // immediately beats twenty seconds of "downloading… 0%" that cannot progress.
  if (state !== 'available' && definitelyOffline()) throw fail('offline', OFFLINE_MESSAGE)
  // Say so before the wait starts: the first use of a pair fetches a model,
  // and that is a different wait from translating a sentence.
  if (state !== 'available') onProgress?.(0)

  const guard = stallGuard()
  const offline = offlineTrip()
  let best = 0
  const tick = (progress) => {
    if (progress <= best) return
    best = progress
    guard.arm()
    onProgress?.(progress)
  }

  try {
    let translator
    try {
      translator = await Promise.race([
        getTranslator(from, to, tick),
        guard.promise,
        offline.promise,
      ])
    } catch (err) {
      if (err?.code) throw err
      // Chrome refuses to start the download outside a user gesture.
      if (err?.name === 'NotAllowedError') {
        throw fail('blocked', 'The browser blocked the language download')
      }
      throw fail('failed', err?.message || 'The browser translator failed')
    }

    try {
      return await Promise.race([translator.translate(text), guard.promise, offline.promise])
    } catch (err) {
      if (err?.code) throw err
      throw fail('failed', err?.message || 'The browser translator failed')
    }
  } finally {
    guard.stop()
    offline.stop()
    dropListener(from, to, tick)
  }
}
